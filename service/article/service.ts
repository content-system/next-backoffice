import { nanoid } from "nanoid"
import { ApproversPort, Log, Notification, NotificationPort, SearchResult } from "onecore"
import { DB } from "sql-core"
import { slugify } from "../common/slug"
import { Action, History, HistoryRepository } from "../shared/history"
import { createNotification } from "../shared/notification"
import { canReject, canUpdate, Status } from "../shared/status"
import { Article, ArticleFilter, ArticleRepository, ArticleService, DraftArticleRepository } from "./article"

export class ArticleUseCase implements ArticleService {
  constructor(
    protected db: DB,
    protected draftRepository: DraftArticleRepository,
    protected repository: ArticleRepository,
    protected historyRepository: HistoryRepository<Article>,
    protected approversPort: ApproversPort,
    protected notificationPort: NotificationPort,
    protected log: Log,
  ) {}
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>> {
    return this.draftRepository.search(filter, limit, page, fields)
  }
  loadDraft(id: string): Promise<Article | null> {
    return this.draftRepository.load(id)
  }
  load(id: string): Promise<Article | null> {
    return this.repository.load(id)
  }
  getHistories(id: string, limit: number, nextPageToken?: string): Promise<History<Article>[]> {
    return this.historyRepository.getHistories(id, limit, nextPageToken)
  }
  async create(article: Article): Promise<number> {
    article.id = nanoid(10)
    article.slug = slugify(article.title, article.id)
    article.authorId = article.createdBy

    if (article.status === Status.Submitted) {
      article.submittedBy = article.updatedBy
      article.submittedAt = new Date()
    }

    const tx = await this.db.beginTransaction()
    try {
      const res = await this.draftRepository.create(article, tx)
      const action = article.status === Status.Submitted ? Action.Submit : Action.Create
      await this.historyRepository.create(article.id, article.updatedBy, action, article, tx)

      if (article.status === Status.Submitted) {
        this.notifyApprovers(article.id, article.submittedBy)
      }

      await tx.commit()
      return res
    } catch (err) {
      await tx.rollback()
      throw err
    }
  }

  async update(article: Article): Promise<number> {
    const tx = await this.db.beginTransaction()
    try {
      const isExist = await this.repository.exist(article.id, tx)
      if (!isExist) {
        article.slug = slugify(article.title, article.id)
      }
      const existingArticle = await this.draftRepository.load(article.id, tx)
      if (!existingArticle) {
        return 0
      }
      if (!canUpdate(existingArticle.status)) {
        return -1
      }

      if (article.status === Status.Submitted) {
        article.submittedBy = article.updatedBy
        article.submittedAt = new Date()
      }

      const res = await this.draftRepository.update(article, tx)

      if (article.status === Status.Submitted) {
        await this.historyRepository.create(article.id, article.updatedBy, Action.Submit, article, tx)
        this.notifyApprovers(article.id, article.submittedBy)
      }

      await tx.commit()
      return res
    } catch (err) {
      await tx.rollback()
      throw err
    }
  }
  patch(article: Article): Promise<number> {
    return this.update(article)
  }
  protected async notifyApprovers(id: string, userId: string): Promise<number> {
    const approvers = await this.approversPort.getApprovers()
    const msg = `Please review and approve an article (id: '${id}').`
    const url = `/articles/${id}/approve`
    const notifications: Notification[] = []
    for (const approverId of approvers) {
      const noti = createNotification(userId, approverId, msg, url)
      notifications.push(noti)
    }
    try {
      const res = await this.notificationPort.pushNotifications(notifications)
      return res
    } catch (err) {
      this.log("Cannot notify approvers. Detail error: " + JSON.stringify(err))
      return -1
    }
  }

  async approve(id: string, approvedBy: string): Promise<number> {
    const tx = await this.db.beginTransaction()
    try {
      const article = await this.draftRepository.load(id, tx)
      if (!article) {
        return 0
      }
      if (article.status !== Status.Submitted) {
        return -1
      }
      if (article.submittedBy === approvedBy) {
        return -2
      }
      article.status = Status.Published
      article.approvedBy = approvedBy
      article.approvedAt = new Date()

      await this.draftRepository.update(article, tx)
      const res = await this.repository.save(article, tx)
      await this.historyRepository.create(id, approvedBy, Action.Approve, null, tx)

      const msg = `This article was approved (id: '${id}').`
      this.notify(id, approvedBy, article.submittedBy, msg)

      await tx.commit()
      return res
    } catch (err) {
      await tx.rollback()
      throw err
    }
  }
  async reject(id: string, rejectedBy: string): Promise<number> {
    const tx = await this.db.beginTransaction()
    try {
      const article = await this.draftRepository.load(id, tx)
      if (!article) {
        return 0
      }
      if (!canReject(article.status)) {
        return -1
      }
      if (article.submittedBy === rejectedBy) {
        return -2
      }

      article.status = Status.Rejected
      article.approvedBy = rejectedBy
      article.approvedAt = new Date()

      const res = await this.draftRepository.update(article, tx)
      await this.historyRepository.create(id, rejectedBy, Action.Reject, null, tx)

      const msg = `This article was rejected (id: '${id}').`
      this.notify(id, rejectedBy, article.submittedBy, msg)

      await tx.commit()
      return res
    } catch (err) {
      await tx.rollback()
      throw err
    }
  }
  protected async notify(id: string, senderId: string, notifyTo: string, msg: string): Promise<number> {
    const url = `/articles/${id}`
    const noti = createNotification(senderId, notifyTo, msg, url)
    try {
      const res = await this.notificationPort.push(noti)
      return res
    } catch (err) {
      this.log("Cannot notify submitter. Detail error: " + JSON.stringify(err))
      return -1
    }
  }

  delete(id: string): Promise<number> {
    return this.draftRepository.delete(id)
  }
}
