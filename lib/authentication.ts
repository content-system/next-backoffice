import { Authenticator, initializeStatus, PrivilegeRepository, SqlAuthTemplateConfig, User, useUserRepository } from "authen-service"
import { compare } from "bcryptjs"
import { db } from "./db"

const authConfig = {
  status: {
    success: 1,
    password_expired: 3,
    locked: 4,
    suspended: 5,
    disabled: 6,
  },
  lockedMinutes: 2,
  maxPasswordFailed: 5,
  account: {
    displayName: "displayname",
    dateFormat: "date_format",
  },
  userStatus: {
    activated: "A",
    deactivated: "I",
    disable: "D",
    suspended: "S",
  },
  db: {
    user: "users",
    password: "passwords",
    id: "user_id",
    username: "username",
    status: "status",
    successTime: "success_time",
    failTime: "fail_time",
    failCount: "fail_count",
    lockedUntilTime: "locked_until_time",
  },
  query: `
      select u.user_id, u.username, u.display_name, u.language, u.dateformat as date_format, email, u.status, u.max_password_age, 
        p.password, p.success_time, p.fail_time, p.fail_count, p.locked_until_time, p.changed_time
      from users u
      inner join passwords p
        on u.user_id = p.user_id
      where username = $1`,
  expires: 500,
  template: {
    subject: "Verification Code",
    body: "%s Use this code for verification. This code will expire in %s minutes",
  },
  privileges: `
    select distinct m.module_id as id, m.module_name as name, m.resource_key as resource,
      m.path, m.icon, m.parent, m.sequence, rm.permissions, m.actions
    from users u
      inner join user_roles ur on u.user_id = ur.user_id
      inner join roles r on ur.role_id = r.role_id
      inner join role_modules rm on r.role_id = rm.role_id
      inner join modules m on rm.module_id = m.module_id
    where u.user_id = $1 and r.status = 'A' and m.status = 'A'
    order by sequence`
}

const map = {
  user_id: "id",
  display_name: "displayName",
  max_password_age: "maxPasswordAge",
  success_time: "successTime",
  fail_time: "failTime",
  fail_count: "failCount",
  locked_until_time: "lockedUntilTime",
  changed_time: "passwordModifiedTime",
}

let authenticator: Authenticator<User, string> | undefined
export function getAuthenticator(): Authenticator<User, string> {
  if (!authenticator) {
    const status = initializeStatus(authConfig.status)
    const userRepository = useUserRepository<string, SqlAuthTemplateConfig>(db, authConfig, map)
    const privilegeRepository = new PrivilegeRepository(db.query, authConfig.privileges)
    authenticator = new Authenticator(status, compare, authConfig.account, userRepository, privilegeRepository.privileges, authConfig.lockedMinutes, authConfig.maxPasswordFailed)
  }
  return authenticator
}
