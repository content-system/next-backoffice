import { Attributes } from "onecore"

export interface Content {
  id: string
  lang: string
  title: string
  body: string
  publishedAt: Date
  tags?: string[]
  status?: string
}

export interface ContentRepository {
  load(id: string, lang: string): Promise<Content | null>
}
export interface ContentService {
  load(id: string, lang: string): Promise<Content | null>
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
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  body: {
    length: 5000,
    required: true,
  },
  tags: {
    type: "strings",
  },
  status: {},
}
