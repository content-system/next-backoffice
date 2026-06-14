import { db } from "@lib/db"
import { UseCase } from "onecore"
import { SqlRoleRepository } from "./repository"
import { Role, RoleFilter, RoleRepository, RoleService } from "./role"
export * from "./role"

export class RoleUseCase extends UseCase<Role, string, RoleFilter> implements RoleService {
  constructor(protected repository: RoleRepository) {
    super(repository)
  }
  all(): Promise<Role[]> {
    return this.repository.all()
  }
  assign(id: string, users: string[]): Promise<number> {
    return this.repository.assign(id, users)
  }
}

let service: RoleService | undefined
export function getRoleService(): RoleService {
  if (!service) {
    const repository = new SqlRoleRepository(db)
    service = new RoleUseCase(repository)
  }
  return service
}
