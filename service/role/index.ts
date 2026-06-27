import { db } from "@lib/db"
import { SqlRoleRepository } from "./repository"
import { RoleService } from "./role"
import { RoleUseCase } from "./service"
export * from "./role"

let service: RoleService | undefined
export function getRoleService(): RoleService {
  if (!service) {
    const repository = new SqlRoleRepository(db)
    service = new RoleUseCase(repository)
  }
  return service
}
