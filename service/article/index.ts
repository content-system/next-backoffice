import { db } from "@lib/db"
import { logger } from "@lib/logger"
import { ApproversAdapter } from "../shared/approvers"
import { HistoryAdapter, ignoreFields } from "../shared/history"
import { NotificationAdapter } from "../shared/notification"
import { Article, ArticleService } from "./article"
import { SqlArticleRepository, SqlDraftArticleRepository } from "./repository"
import { ArticleUseCase } from "./service"
export * from "./article"

let service: ArticleService | undefined
export function getArticleService(): ArticleService {
  if (!service) {
    const draftRepository = new SqlDraftArticleRepository(db)
    const repository = new SqlArticleRepository(db)
    const historyRepository = new HistoryAdapter<Article>(db, "article", "histories", ignoreFields, "history_id", "entity", "id", "author")
    const approversPort = new ApproversAdapter(db, "article")
    const notificationPort = new NotificationAdapter(db, "notifications", "U", "time", "url", "id", "sender", "receiver", "message", "status")
    service = new ArticleUseCase(db, draftRepository, repository, historyRepository, approversPort, notificationPort, logger.error)
  }
  return service
}
