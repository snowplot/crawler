import { write } from "fs";

export default abstract class Updater<T> {
  protected abstract async read(): Promise<T[]>;
  protected abstract async write(data: Readonly<T>[]): Promise<void>;
  public async update () {
    try {
      const results: Array<T> = await this.read();
      await this.write(results);
    } catch(err) {
      console.error(err);
    }
  }
}
