import { Attributes, Filter, SearchResult, TimeRange, Transaction } from "onecore"

export interface Article {
  id: string
  slug: string
  title: string
  description?: string
  content: string
  publishedAt?: Date
  tags?: string[]
  thumbnail?: string
  highThumbnail?: string
  authorId?: string
  status?: string

  submittedBy: string
  submittedAt?: Date
  approvedBy?: string
  approvedAt?: Date

  createdBy: string
  createdAt?: Date
  updatedBy: string
  updatedAt?: Date
}
export interface ArticleFilter extends Filter {
  id?: string
  slug?: string
  title?: string
  description?: string
  status?: string
  publishedAt: TimeRange
  tags?: string[]
  authorId?: string
  userId?: string
  isSaved?: boolean
}

export interface DraftArticleRepository {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
  load(id: string, tx?: Transaction): Promise<Article | null>
  create(article: Article, tx: Transaction): Promise<number>
  update(article: Article, tx: Transaction): Promise<number>
  patch(article: Partial<Article>, tx: Transaction): Promise<number>
  delete(id: string, tx?: Transaction): Promise<number>
}
export interface ArticleRepository {
  exist(id: string, tx?: Transaction): Promise<boolean>
  load(id: string, tx?: Transaction): Promise<Article | null>
  save(article: Article, tx: Transaction): Promise<number>
}
export interface ArticleService {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
  loadDraft(id: string): Promise<Article | null>
  load(id: string): Promise<Article | null>
  create(article: Article): Promise<number>
  update(article: Article): Promise<number>
  patch(article: Partial<Article>): Promise<number>
  approve(id: string, approvedBy: string): Promise<number>
  reject(id: string, rejectedBy: string): Promise<number>
  delete(id: string): Promise<number>
}

export const articleModel: Attributes = {
  id: {
    key: true,
    length: 40,
  },
  slug: {
    length: 150,
  },
  title: {
    length: 255,
    required: true,
    q: true,
  },
  description: {
    length: 1200,
    required: true,
    q: true,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  content: {
    length: 9500,
    required: true,
  },
  tags: {
    type: "strings",
  },
  thumbnail: {
    length: 400,
  },
  highThumbnail: {
    column: "high_thumbnail",
    length: 400,
  },
  authorId: {
    column: "author_id",
    length: 400,
    noupdate: true,
  },
  status: {
    length: 1,
  },

  submittedBy: {
    column: "submitted_by",
  },
  submittedAt: {
    column: "submitted_at",
    type: "datetime",
  },
  approvedBy: {
    column: "approved_by",
  },
  approvedAt: {
    column: "approved_at",
    type: "datetime",
  },

  createdBy: {
    column: "created_by",
    noupdate: true,
  },
  createdAt: {
    column: "created_at",
    type: "datetime",
    noupdate: true,
    createdAt: true,
  },
  updatedBy: {
    column: "updated_by",
  },
  updatedAt: {
    column: "updated_at",
    type: "datetime",
    updatedAt: true
  },
}
