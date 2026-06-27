import { nanoid } from "nanoid"
import { SearchResult } from "onecore"
import { slugify } from "../common/slug"
import { Job, JobFilter, JobRepository, JobService, Status } from "./job"

export class JobUseCase implements JobService {
  constructor(protected repository: JobRepository) {}
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>> {
    return this.repository.search(filter, limit, page, fields)
  }
  load(id: string): Promise<Job | null> {
    return this.repository.load(id)
  }
  create(job: Job): Promise<number> {
    job.id = nanoid(10)
    job.slug = slugify(job.title, job.id)
    job.status = Status.Draft
    return this.repository.create(job)
  }
  async update(job: Job): Promise<number> {
    const existingJob = await this.repository.load(job.id)
    if (!existingJob) {
      return 0
    }
    existingJob.status = Status.Draft
    if (existingJob.status === Status.Draft) {
      job.slug = slugify(job.title, job.id)
    }
    return this.repository.update(job)
  }
  async patch(job: Partial<Job>): Promise<number> {
    if (job.title) {
      const id = job.id as string
      const existingJob = await this.repository.load(id)
      if (!existingJob) {
        return 0
      }
      if (existingJob.status === Status.Draft) {
        job.slug = slugify(job.title, id)
      }
      return this.repository.patch(job)
    } else {
      delete job.slug
      return this.repository.patch(job)
    }
  }
  delete(id: string): Promise<number> {
    return this.repository.delete(id)
  }
}
