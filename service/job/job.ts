import { Attributes, Filter, SearchResult, TimeRange } from "onecore"

export class Status {
  static readonly Draft = 'D'
  static readonly Submitted = 'S'
  static readonly Approved = 'A'
}

export interface Job {
  id: string
  slug: string
  title: string
  description: string
  publishedAt?: Date
  expiredAt?: Date
  company?: string
  position?: string
  quantity?: number
  location?: string
  applicantCount?: number
  skills?: string[]
  minSalary?: number
  maxSalary?: number
  status: string

  createdBy: string
  createdAt?: Date
  updatedBy: string
  updatedAt?: Date
}
export interface JobFilter extends Filter {
  id?: string
  slug?: string
  title?: string
  description?: string
  requirements?: string
  benefit?: string
  publishedAt?: TimeRange
  expiredAt?: TimeRange
  skills?: string[]
  location?: string
  quantity?: number
  applicantCount?: number
  company?: string
  status?: string
}

export interface JobRepository {
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
  load(id: string): Promise<Job | null>
  create(job: Job): Promise<number>
  update(job: Job): Promise<number>
  patch(job: Partial<Job>): Promise<number>
  delete(id: string): Promise<number>
}
export interface JobService {
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
  load(id: string): Promise<Job | null>
  create(job: Job): Promise<number>
  update(job: Job): Promise<number>
  patch(job: Partial<Job>): Promise<number>
  delete(id: string): Promise<number>
}

export const jobModel: Attributes = {
  id: {
    length: 40,
    required: true,
    key: true,
  },
  slug: {
    length: 150,
  },
  title: {
    length: 300,
    q: true,
  },
  description: {
    length: 9800,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  expiredAt: {
    column: "expired_at",
    type: "datetime",
  },
  company: {
    length: 40,
  },
  position: {
    length: 100,
  },
  quantity: {
    type: "integer",
    min: 1,
  },
  location: {
    length: 120,
  },
  applicantCount: {
    column: "applicant_count",
    type: "integer",
  },
  skills: {
    type: "strings",
  },
  minSalary: {
    column: "min_salary",
    type: "integer",
  },
  maxSalary: {
    column: "max_salary",
    type: "integer",
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
