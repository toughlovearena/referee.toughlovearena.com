import { Updater } from '@toughlovearena/updater';
import cors from 'cors';
import WebSocketExpress, { Router } from 'websocket-express';
import { User } from './apiTypes';
import { UserSocket } from './socket';
import { UserState } from './user';

export class Server {
  private readonly port = 2410;
  private app = new WebSocketExpress();

  constructor(updater: Updater) {
    const router = new Router();

    router.get('/', (req, res) => {
      res.redirect('/health');
    });
    router.get('/health', async (req, res) => {
      const gitHash = await updater.gitter.hash();
      const data = {
        gitHash,
        started: new Date(updater.startedAt),
        testVer: 0,
      };
      res.send(data);
    });

    // rest
    router.post('/register', async (req, res) => {
      const reqBody: User = req.body;
      const { aid, jwt } = reqBody;
      if (!(aid && jwt)) {
        return res.status(404);
      }
      UserState.register({ aid, jwt });
      return res.status(200);
    });

    // ws
    router.ws('/disconnect', async (req, res) => {
      const ws = await res.accept();
      UserSocket.register(ws);
    });
    router.ws('/finish', async (req, res) => {
      const ws = await res.accept();
      UserSocket.register(ws);
    });

    this.app.use(cors());
    this.app.use(WebSocketExpress.json());
    this.app.use(router);

    // cron
    const period = 30 * 1000; // 30 seconds
    setInterval(() => {
      // todo
    }, period);
  }

  listen() {
    const { port } = this;
    this.app.createServer().listen(port, () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${port}`);
    });
  }
}
