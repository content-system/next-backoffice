import { db } from "@lib/db";
import { UseCase } from "onecore";
import { Category, CategoryFilter, CategoryRepository, CategoryService } from "./category";
import { SqlCategoryRepository } from "./repository";
export * from "./category";

export class CategoryUseCase extends UseCase<Category, string, CategoryFilter> implements CategoryService {
  constructor(repository: CategoryRepository) {
    super(repository)
  }
}

let service: CategoryService | undefined
export function getCategoryService(): CategoryService {
  if (!service) {
    const repository = new SqlCategoryRepository(db)
    service = new CategoryUseCase(repository)
  }
  return service
}
