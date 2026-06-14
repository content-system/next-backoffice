import { DB } from "onecore"
import { Repository } from "sql-core"
import { Category, CategoryFilter, categoryModel, CategoryRepository } from "./category"

export class SqlCategoryRepository extends Repository<Category, string, CategoryFilter> implements CategoryRepository {
  constructor(db: DB) {
    super(db, "categories", categoryModel)
  }
}
