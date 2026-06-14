import { Attributes, Filter, SearchResult, TimeRange } from "onecore"

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
  status?: string
  createdAt?: Date
  authorId?: string
  savedAt?: Date
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

export interface ArticleRepository {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
  load(slug: string, userId?: string): Promise<Article | null>
}
export interface ArticleService {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
  load(slug: string, userId?: string): Promise<Article | null>
}

export const Published = "P"

export const articleModel: Attributes = {
  id: {
    key: true,
    length: 40,
    required: true,
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

  createdBy: {
    column: "created_by",
    noupdate: true,
  },
  createdAt: {
    column: "created_at",
    type: "datetime",
    noupdate: true,
  },
  updatedBy: {
    column: "updated_by",
  },
  updatedAt: {
    column: "updated_at",
    type: "datetime",
  },
  savedAt: {
    column: "saved_at",
    type: "datetime",
    noupdate: true,
    noinsert: true,
  },
}
