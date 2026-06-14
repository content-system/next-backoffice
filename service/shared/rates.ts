import { Attributes, DB, Filter, SearchResult, Statement } from "onecore";
import { param } from "pg-extension";
import { buildSort, SearchRepository } from "sql-core";

export interface Rate {
  rateId: string
  id: string
  author: string
  //authorURL?: string
  displayName: string
  rate: number
  time: Date
  review: string
  usefulCount: number
  replyCount: number
  anonymous: boolean
}
export interface RateFilter extends Filter {
  id: string
  rate?: number
  sort?: string
}

export const rateModel: Attributes = {
  rateId: {
    column: "rate_id",
    key: true,
    required: true
  },
  id: {
    required: true,
    operator: '='
  },
  author: {
    required: true,
    operator: '='
  },
  rate: {
    type: 'number',
  },
  time: {
    type: 'datetime',
  },
  review: {
    q: true,
  },
  usefulCount: {
    column: "useful_count",
    type: 'integer'
  },
  replyCount: {
    column: "reply_count",
    type: 'integer'
  },
  anonymous: {
    type: 'boolean',
  },
  displayName: {
    column: "display_name",
  }
}

export function buildQuery(filter: RateFilter): Statement {
  let query = `select ar.*, u.display_name from article_rates ar inner join users u on ar.author = u.id`
  const where: string[] = []
  const params = []
  let i = 1

  if (filter.id) {
    params.push(filter.id)
    where.push(`ar.id = ${param(i++)}`)
  }
  if (filter.rate) {
    params.push(filter.rate)
    where.push(`ar.rate = ${param(i++)}`)
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(` and `)
  }
  const orderBy = buildSort(filter.sort, rateModel)
  if (orderBy) {
    query = query + ` order by ${orderBy}`
  }
  return { query, params }
}

export interface RatesRepository {
  search(filter: RateFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<Rate>>
}

export class SearchRateRepository extends SearchRepository<Rate, RateFilter> implements RatesRepository {
  constructor(db: DB) {
    super(db, "article_rates", rateModel, buildQuery)
  }
}
