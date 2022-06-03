import * as WebSocket from 'ws';
import { ClientMessage, ClientRegister, MessageType } from './apiTypes';
import { RealClock } from './time';
import { UserState } from './user';

export class Socket {
  readonly sid = `socket-${Socket.socketCount++}`;
  private user: UserState | undefined;

  readonly timeKeeper = RealClock;
  createdAt = this.timeKeeper.now();
  updatedAt = this.timeKeeper.now();

  constructor(
    readonly socket: WebSocket,
  ) {
    Socket.cache.set(this.sid, this);
    socket.on('message', (msg: any) => this.receive(msg));
    socket.on('error', () => this.cleanup());
    socket.on('close', () => this.cleanup());
  }

  private register(data: ClientRegister) {
    const user = UserState.cache.get(data.user.aid);
    const match = user && user.isValid(data);
    if (!match) {
      return this.socket.close(1007, 'registration failed');
    }
    Socket.registered.set(user.aid, this);
  }

  private receive(msg: string) {
    this.updatedAt = this.timeKeeper.now();
    let data: ClientMessage;
    try {
      data = JSON.parse(msg) as ClientMessage;
      if (data.type === MessageType.ClientRegister) {
        return this.register(data);
      }
    } catch (err) {
      this.socket.close(1007, err.toString());
      return;
    }
  }
  private cleanup() {
    Socket.cache.delete(this.sid);
    if (this.user) {
      Socket.registered.delete(this.user.aid);
    }
    this.socket.terminate();
  }  

  private static socketCount = 0;
  private static cache = new Map<string, Socket>();
  private static registered = new Map<string, Socket>();
}
