import { Updater } from '@toughlovearena/updater';
import cors from 'cors';
import WebSocketExpress, { Router } from 'websocket-express';

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

    // ws
    router.ws('/finish/:aid', async (req, res) => {
      const { aid } = req.params;
      if (!aid) {
        return res.sendError(404);
      }
      const ws = await res.accept();
      // todo track ws
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
