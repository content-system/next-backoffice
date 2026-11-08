import { db } from "@lib/db"
import { PrivilegesReader } from "authen-service"
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

const sql = `
  select module_id as id,
    module_name as name,
    resource_key,
    path,
    icon,
    parent,
    actions,
    sequence
  from modules
  where status = 'A'`
let privilegesReader: PrivilegesReader | undefined
export function getPrivilegesReader(): PrivilegesReader {
  if (!privilegesReader) {
    privilegesReader = new PrivilegesReader(db.query, sql)
  }
  return privilegesReader
}
