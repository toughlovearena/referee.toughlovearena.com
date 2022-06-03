import * as WebSocket from 'ws';
import { ClientMessage, ClientRegister, MessageType } from './apiTypes';
import { RealClock } from './time';
import { UserState } from './user';

export class UserSocket {
  private user: UserState | undefined;

  readonly timeKeeper = RealClock;
  createdAt = this.timeKeeper.now();
  updatedAt = this.timeKeeper.now();

  private constructor(
    readonly sid: string,
    readonly socket: WebSocket,
  ) {
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
    UserSocket.registered.set(user.aid, this);
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
    UserSocket.cache.delete(this.sid);
    if (this.user) {
      UserSocket.registered.delete(this.user.aid);
    }
    this.socket.terminate();
  }

  private static socketCount = 0;
  private static cache = new Map<string, UserSocket>();
  private static registered = new Map<string, UserSocket>();
  static register(ws: WebSocket) {
    const instance = new UserSocket(`socket-${this.socketCount++}`, ws);
    this.cache.set(instance.sid, instance);
  }
}
