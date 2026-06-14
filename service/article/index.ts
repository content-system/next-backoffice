import { db } from "@lib/db"
import { SearchResult } from "onecore"
import { Article, ArticleFilter, ArticleRepository, ArticleService } from "./article"
import { SqlArticleRepository } from "./repository"
export * from "./article"

export class ArticleUseCase implements ArticleService {
  constructor(private repository: ArticleRepository) {
  }
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>> {
    return this.repository.search(filter, limit, page, fields)
  }
  load(slug: string, userId?: string): Promise<Article | null> {
    return this.repository.load(slug, userId)
  }
}

let articleService: ArticleService | undefined
export function getArticleService(): ArticleService {
  if (!articleService) {
    console.log("create ArticleService")
    const repository = new SqlArticleRepository(db)
    articleService = new ArticleUseCase(repository)
  }
  return articleService
}
