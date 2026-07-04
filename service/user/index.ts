import { db } from "@lib/db"
import { SqlUserRepository } from "./repository"
import { UserUseCase } from "./service"
import { UserService } from "./user"
export * from "./user"

let service: UserService | undefined
export function getUserService(): UserService {
  if (!service) {
    const repository = new SqlUserRepository(db)
    service = new UserUseCase(repository)
  }
  return service
}
