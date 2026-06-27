import { UseCase } from "onecore"
import { Category, CategoryFilter, CategoryRepository, CategoryService } from "./category"

export class CategoryUseCase extends UseCase<Category, string, CategoryFilter> implements CategoryService {
  constructor(repository: CategoryRepository) {
    super(repository)
  }
}
