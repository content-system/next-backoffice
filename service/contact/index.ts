import { db } from "@lib/db"
import { ContactService } from "./contact"
import { SqlContactRepository } from "./repository"
import { ContactUseCase } from "./service"
export * from "./contact"

let service: ContactService | undefined
export function getContactService(): ContactService {
  if (!service) {
    const repository = new SqlContactRepository(db)
    service = new ContactUseCase(repository)
  }
  return service
}
