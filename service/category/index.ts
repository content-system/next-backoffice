import { db } from "@lib/db";
import { CategoryService } from "./category";
import { SqlCategoryRepository } from "./repository";
import { CategoryUseCase } from "./service";
export * from "./category";

let service: CategoryService | undefined
export function getCategoryService(): CategoryService {
  if (!service) {
    const repository = new SqlCategoryRepository(db)
    service = new CategoryUseCase(repository)
  }
  return service
}
