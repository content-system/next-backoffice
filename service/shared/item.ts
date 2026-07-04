import { DB, Item } from "onecore"

export class ItemService {
  constructor(protected db: DB) {}
  load(master: string): Promise<Item[]> {
    return this.db.query<Item>(`select code as value, name as text from code_masters where master = ${this.db.param(1)}`, [master])
  }
}
