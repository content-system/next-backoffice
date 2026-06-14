import { DB } from "onecore"
import { param } from "pg-extension"
import { buildSort, SearchRepository, Statement } from "sql-core"
import { Article, ArticleFilter, articleModel, ArticleRepository } from "./article"

export class SqlArticleRepository extends SearchRepository<Article, ArticleFilter> implements ArticleRepository {
  constructor(db: DB) {
    super(db, "articles", articleModel, buildQuery)
  }
  async load(slug: string, userId?: string): Promise<Article | null> {
    const params = []
    let query: string
    if (userId) {
      query = `select a.*, sa.saved_at 
        from articles a 
        left join saved_articles sa 
          on sa.id = a.id and sa.user_id = ${this.db.param(1)} where a.slug = ${this.db.param(2)}`
      params.push(userId)
    } else {
      query = `select a.* from articles a where a.slug = ${this.db.param(1)}`
    }
    params.push(slug)
    const articles = await this.db.query<Article>(query, params, this.map)
    return articles && articles.length > 0 ? articles[0] : null
  }
}

export function buildQuery(filter: ArticleFilter): Statement {
  const where: string[] = []
  const params = []
  let i = 1
  let query: string
  if (filter.userId) {
    if (filter.isSaved) {
      query = `select a.id, a.thumbnail, a.slug, a.title, a.description, a.published_at, sa.saved_at 
        from saved_articles sa 
        inner join articles a
        on sa.user_id = ${param(i++)} and sa.id = a.id`
    } else {
      query = `select a.id, a.thumbnail, a.slug, a.title, a.description, a.published_at, sa.saved_at 
        from articles a 
        left join saved_articles sa 
        on sa.id = a.id and sa.user_id = ${param(i++)}`
    }
    params.push(filter.userId)
  } else {
    query = `select a.id, a.thumbnail, a.slug, a.title, a.description, a.published_at from articles a`
  }

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
    params.push(filter.status)
    where.push(`status = ${param(i++)}`)
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
