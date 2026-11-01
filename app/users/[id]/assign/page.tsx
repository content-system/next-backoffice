import { BackButton } from "@components/client"
import { Error } from "@components/error"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getResource } from "@resources"
import { getRoleService, Role } from "@service/role"
import { getUserService } from "@service/user"
import { read, write } from "web-one"

export default async function UserForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize(1)
  const canRead = hasPrivilege(permission, read)
  const canWrite = hasPrivilege(permission, write)

  if (!canRead || !canWrite) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const service = getUserService()
  const roleService = getRoleService()
  try {
    const user = await service.load(id)
    if (!user) {
      logger.warn(`User not found: ${id}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    const roles = await roleService.all()
    const userRoles = roles.filter((role) => user?.roles?.includes(role.roleId))
    const selectedRoles = userRoles

    const disabled = !canWrite

    return (
      <form id="roleAssignmentForm" name="roleAssignmentForm" className="form">
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.role_assignment_subject}</h2>
        </header>
        <div>
          <section className="row section">
            <label className="col s12 m6">
              {resource.email}
              <input type="text" id="email" name="email" defaultValue={user.email} maxLength={255} placeholder={resource.email} disabled={true} />
            </label>
          </section>
          <section className="list-container">
            <ul className="row list">
              <li className="col check-item header">
                <input type="checkbox" id="checkAll" name="checkAll" disabled={disabled} />
                <p>{resource.check_all}</p>
              </li>
              {roles &&
                roles?.map((item: Role, i) => {
                  return (
                    <li key={i} className="col check-item">
                      <input type="checkbox" name="selected" disabled={disabled} defaultChecked={selectedRoles.includes(item)} />
                      <p>{item.roleName}</p>
                    </li>
                  )
                })}
            </ul>
          </section>
        </div>
        <footer>
          <button type="submit" id="saveBtn" name="saveBtn" disabled={disabled}>
            {resource.save}
          </button>
        </footer>
      </form>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
