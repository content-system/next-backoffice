import { Attributes, Filter, Result, SearchResult, TimeRange } from "onecore"

export interface Content {
  id: string
  lang: string
  title: string
  body: string
  publishedAt?: Date
  tags?: string[]
  status?: string
  version?: number

  createdBy: string
  createdAt?: Date
  updatedBy: string
  updatedAt?: Date
}
export interface ContentFilter extends Filter {
  id?: string
  lang?: string
  title?: string
  body?: string
  publishedAt?: TimeRange
  tags?: string[]
  status?: string[]
}

export interface ContentRepository {
  search(filter: ContentFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Content>>
  load(id: string, lang: string): Promise<Content | null>
  create(obj: Content): Promise<number>
  update(obj: Content): Promise<number>
  patch(obj: Partial<Content>): Promise<number>
  delete(id: string, lang: string): Promise<number>
}
export interface ContentService {
  search(filter: ContentFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Content>>
  load(id: string, lang: string): Promise<Content | null>
  create(obj: Content): Promise<Result<Content>>
  update(obj: Content): Promise<Result<Content>>
  patch(obj: Partial<Content>): Promise<Result<Content>>
  delete(id: string, lang: string): Promise<number>
}

export const contentModel: Attributes = {
  id: {
    key: true,
    length: 40,
    required: true,
  },
  lang: {
    key: true,
    length: 40,
    required: true,
  },
  title: {
    length: 255,
    required: true,
    q: true,
  },
  body: {
    length: 9800,
    required: true,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  tags: {
    type: "strings",
  },
  type: {},
  status: {},
  version: {
    type: "integer",
    version: true,
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
    updatedAt: true,
  },
}
