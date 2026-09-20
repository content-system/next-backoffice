import { headers } from "next/headers"
import { getPath, PrivilegeLoader } from "web-one"
import { getCurrentUser } from "./account"
import { db } from "./db"

const sql = `
  select distinct rm.permissions
  from users u
    inner join user_roles ur on u.user_id = ur.user_id
    inner join roles r on ur.role_id = r.role_id
    inner join role_modules rm on r.role_id = rm.role_id
    inner join modules m on rm.module_id = m.module_id
  where u.user_id = $1 and u.status = 'A' and r.status = 'A' and m.path = $2 and m.status = 'A'`

let privilegeLoader: PrivilegeLoader | undefined
export async function authorize(index?: number): Promise<number> {
  if (!privilegeLoader) {
    privilegeLoader = new PrivilegeLoader(sql, db.query)
  }

  const account = await getCurrentUser()
  if (!account) {
    return 0
  }

  const headerList = await headers()
  const pathname = headerList.get("x-current-path") as string

  let path = getPath(pathname, index)
  if (path.startsWith("/api/")) {
    path = path.substring(4)
  }
  const privilege = await privilegeLoader.getPrivilege(account.id, path)
  return privilege
}

export async function hasPermission(permission: number, i?: number): Promise<boolean> {
  const privilege = await authorize(i)
  if (privilege == 0) {
    return false
  }
  return permission > 0 || (privilege & permission) == permission
}

export function hasPrivilege(privilege: number, permission: number): boolean {
  return permission > 0 || (privilege & permission) == permission
}
