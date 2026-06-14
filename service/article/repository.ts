import { DB, Transaction } from "onecore"
import { buildToSave, param } from "pg-extension"
import { buildSort, Repository, SqlViewRepository, Statement } from "sql-core"
import { Article, ArticleFilter, articleModel, ArticleRepository, DraftArticleRepository } from "./article"

export class SqlDraftArticleRepository extends Repository<Article, string, ArticleFilter> implements DraftArticleRepository {
  constructor(db: DB) {
    super(db, "draft_articles", articleModel, buildQuery)
  }
}
export class SqlArticleRepository extends SqlViewRepository<Article, string> implements ArticleRepository {
  constructor(protected db: DB) {
    super(db, "articles", articleModel)
  }
  save(article: Article, tx?: Transaction): Promise<number> {
    const stmt = buildToSave(article, "articles", articleModel)
    const db = tx ? tx : this.db
    return db.execute(stmt.query, stmt.params)
  }
}

export function buildQuery(filter: ArticleFilter): Statement {
  let query = `select * from draft_articles `
  const where: string[] = []
  const params = []
  let i = 1

  if (filter.authorId) {
    params.push(filter.authorId)
    where.push(`author_id = ${param(i++)}`)
  }

  if (filter.tags && filter.tags.length > 0) {
    params.push(filter.tags)
    where.push(`tags && ${param(i++)}`)
  }

  if (filter.publishedAt) {
    if (filter.publishedAt.min) {
      where.push(`published_at >= ${param(i++)}`)
      params.push(filter.publishedAt.min)
    }
    if (filter.publishedAt.max) {
      where.push(`published_at <= ${param(i++)}`)
      params.push(filter.publishedAt.max)
    }
  }

  if (filter.status && filter.status.length > 0) {
    const arr: string[] = []
    for (const status of filter.status) {
      params.push(status)
      arr.push(`${param(i++)}`)
    }
    where.push(`status in (${arr.join(",")})`)
  }

  if (filter.q) {
    const q = filter.q.replace(/%/g, "\\%").replace(/_/g, "\\_")
    where.push(`(title ilike ${param(i++)} or description ilike ${param(i++)})`)
    params.push(`%${q}%`, `%${q}%`)
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(` and `)
  }
  const orderBy = buildSort(filter.sort, articleModel)
  if (orderBy) {
    query = query + ` order by ${orderBy}`
  }
  return { query, params }
}
