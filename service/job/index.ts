import { db } from "@lib/db"
import { JobService } from "./job"
import { SqlJobRepository } from "./repository"
import { JobUseCase } from "./service"
export * from "./job"

let service: JobService | undefined
export function getJobService(): JobService {
  if (!service) {
    const repository = new SqlJobRepository(db)
    service = new JobUseCase(repository)
  }
  return service
}
