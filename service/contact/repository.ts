import { DB } from "onecore"
import { Repository } from "sql-core"
import { Contact, ContactFilter, contactModel, ContactRepository } from "./contact"

export class SqlContactRepository extends Repository<Contact, string, ContactFilter> implements ContactRepository {
  constructor(db: DB) {
    super(db, "contacts", contactModel)
  }
}
