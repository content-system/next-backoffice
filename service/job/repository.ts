import { DB } from "onecore"
import { param } from "pg-extension"
import { buildSort, Repository, Statement } from "sql-core"
import { Job, JobFilter, jobModel, JobRepository } from "./job"

export class SqlJobRepository extends Repository<Job, string, JobFilter> implements JobRepository {
  constructor(db: DB) {
    super(db, "jobs", jobModel, buildQuery)
  }
}

export function buildQuery(filter: JobFilter): Statement {
  let query = `select * from jobs`
  const where: string[] = []
  const params = []
  let i = 1

  if (filter.skills && filter.skills.length > 0) {
    params.push(filter.skills)
    where.push(`skills && ${param(i++)}`)
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

  if (filter.q) {
    const q = filter.q.replace(/%/g, "\\%").replace(/_/g, "\\_")
    where.push(`title ilike ${param(i++)}`)
    params.push(`%${q}%`)
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(` and `)
  }
  const orderBy = buildSort(filter.sort, jobModel)
  if (orderBy) {
    query = query + ` order by ${orderBy}`
  }
  return { query, params }
}
