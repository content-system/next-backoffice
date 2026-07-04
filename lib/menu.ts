import { Category, toMenuItems } from "web-one"
import { db } from "./db"

const sql = `
  select distinct m.module_id as id, m.module_name as name, m.resource_key as resource,
    m.path, m.icon, m.parent, m.sequence, rm.permissions, m.actions
  from users u
    inner join user_roles ur on u.user_id = ur.user_id
    inner join roles r on ur.role_id = r.role_id
    inner join role_modules rm on r.role_id = rm.role_id
    inner join modules m on rm.module_id = m.module_id
  where u.user_id = $1 and r.status = 'A' and m.status = 'A'
  order by sequence`

export const getMenu = async (userId: string) => {
  const categories = await db.query<Category>(sql, [userId])
  return toMenuItems(categories)
}
