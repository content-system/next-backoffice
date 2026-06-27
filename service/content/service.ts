import { SearchWriter } from "onecore"
import { Content, ContentFilter, ContentRepository, ContentService } from "./content"

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
