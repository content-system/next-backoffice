import { db } from "@lib/db"
import { ItemService } from "@service/shared/item"
import { Attributes, DB } from "onecore"
import { buildToUpdate } from "sql-core"

export const userModel: Attributes = {
  id: {
    column: "user_id",
    key: true,
    length: 40,
  },
  language: {
    required: true,
    length: 10,
  },
  dateFormat: {
    required: true,
    length: 20,
  },
}
export interface Settings {
  id: string
  language: string
  dateFormat: string
}
export class SettingsService {
  constructor(protected db: DB) { }
  save(settings: Settings): Promise<number> {
    const stmt = buildToUpdate(settings, "users", userModel, db.param)
    return this.db.execute(stmt.query, stmt.params)
  }
}
let service: SettingsService | undefined
export function getSettingsService(): SettingsService {
  if (!service) {
    service = new SettingsService(db)
  }
  return service
}

let itemService: ItemService | undefined
export function getItemService(): ItemService {
  if (!itemService) {
    itemService = new ItemService(db)
  }
  return itemService
}
