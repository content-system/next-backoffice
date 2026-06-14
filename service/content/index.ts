import { db } from "@lib/db"
import { SearchWriter } from "onecore"
import { Content, ContentFilter, ContentRepository, ContentService } from "./content"
import { SqlContentRepository } from "./repository"
export * from "./content"

export class ContentUseCase extends SearchWriter<Content, ContentFilter> implements ContentService {
  constructor(protected repository: ContentRepository) {
    super(repository)
  }
  load(id: string, lang: string): Promise<Content | null> {
    return this.repository.load(id, lang)
  }
  delete(id: string, lang: string): Promise<number> {
    return this.repository.delete(id, lang)
  }
}

let service: ContentService | undefined
export function getContentService(): ContentService {
  if (!service) {
    const repository = new SqlContentRepository(db)
    service = new ContentUseCase(repository)
  }
  return service
}
