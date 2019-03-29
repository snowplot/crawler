import './config';
import { connect, close } from './database';
import LightUpdater from './light-updater';

start();

async function start () {
  try {
    await connect();
    const updater = new LightUpdater();
    await updater.update();
  } catch (err) {
    console.error(err);
  } finally {
    await close();
  }
}
