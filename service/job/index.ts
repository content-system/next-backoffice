import { db } from "@lib/db"
import { SearchResult } from "onecore"
import { Job, JobFilter, JobRepository, JobService } from "./job"
import { SqlJobRepository } from "./repository"
export * from "./job"

export class JobUseCase implements JobService {
  constructor(private repository: JobRepository) { }
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>> {
    return this.repository.search(filter, limit, page, fields)
  }
  load(slug: string): Promise<Job | null> {
    return this.repository.load(slug)
  }
}

let jobService: JobService | undefined
export function getJobService(): JobService {
  if (!jobService) {
    const repository = new SqlJobRepository(db)
    jobService = new JobUseCase(repository)
  }
  return jobService
}
