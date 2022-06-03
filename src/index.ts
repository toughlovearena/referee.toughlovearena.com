import { Updater } from '@toughlovearena/updater';
import { Server } from './server';

(async () => {
  const updater = new Updater();
  new Server(updater).listen();
  updater.cron();
})();
