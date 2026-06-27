import { db } from "@lib/db"
import { ContentService } from "./content"
import { SqlContentRepository } from "./repository"
import { ContentUseCase } from "./service"
export * from "./content"

let service: ContentService | undefined
export function getContentService(): ContentService {
  if (!service) {
    const repository = new SqlContentRepository(db)
    service = new ContentUseCase(repository)
  }
  return service
}
