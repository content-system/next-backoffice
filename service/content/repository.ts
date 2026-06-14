import { DB, StringMap } from "onecore"
import { buildMap, SqlSearchWriter } from "sql-core"
import { Content, ContentFilter, contentModel, ContentRepository } from "./content"

export class SqlContentRepository extends SqlSearchWriter<Content, ContentFilter> implements ContentRepository {
  constructor(db: DB) {
    super(db, "contents", contentModel)
    this.map = buildMap(contentModel)
  }
  map?: StringMap
  load(id: string, lang: string): Promise<Content | null> {
    return this.db.query<Content>(`select * from contents where id = ${this.db.param(1)} and lang = ${this.db.param(2)}`, [id, lang], this.map).then((contents) => {
      return !contents || contents.length === 0 ? null : contents[0]
    })
  }
  delete(id: string, lang: string): Promise<number> {
    return this.db.execute(`delete from contents where id = ${this.db.param(1)} and lang = ${this.db.param(2)}`, [id, lang])
  }
}
