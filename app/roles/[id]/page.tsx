import { BackButton } from "@components/client"
import { formatText } from "@components/client-script"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { getRoleService, Role } from "@service/role"
import { create, read, write } from "web-one"

export default async function RoleForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const newMode = id === Status.New
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize(1)
  const canRead = hasPrivilege(permission, read)
  const canWrite = hasPrivilege(permission, write)

  if (!canRead || (newMode && !canWrite)) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const service = getRoleService()
  try {
    let role: Role | null = create<Role>(Status.Active)
    if (!newMode) {
      role = await service.load(id)
      if (!role) {
        logger.warn(`Role not found: ${id}`)
        return <Error title={resource.error_404_title} message={resource.error_404_message} />
      }
    }

    return (
      <form id="roleForm" name="roleForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.role}</h2>
        </header>
        <div className="row">
          <label className="col s12 m6 required">
            {resource.role_id}
            <Input
              type="text"
              id="roleId"
              name="roleId"
              defaultValue={role.roleId}
              readOnly={!newMode}
              maxLength={100}
              required={true}
              requiredError={formatText(resource.error_required, resource.role_id)}
              placeholder={resource.role_id}
            />
          </label>
          <label className="col s12 m6 required">
            {resource.role_name}
            <Input
              type="text"
              id="roleName"
              name="roleName"
              defaultValue={role.roleName}
              maxLength={100}
              required={true}
              requiredError={formatText(resource.error_required, resource.role_name)}
              placeholder={resource.role_name}
            />
          </label>
          <label className="col s12 m6">
            {resource.remark}
            <Input type="text" id="remark" name="remark" defaultValue={role.remark} maxLength={120} placeholder={resource.email} />
          </label>
          <label className="col s12 m6">
            {resource.status}
            <div className="radio-group">
              <label>
                <input type="radio" id="active" name="status" value={Status.Active} defaultChecked={role.status === Status.Active} />
                {resource.active}
              </label>
              <label>
                <input type="radio" id="inactive" name="status" value={Status.Inactive} defaultChecked={role.status === Status.Inactive} />
                {resource.inactive}
              </label>
            </div>
          </label>
        </div>
        <footer>
          <SubmitButton
            type="submit"
            id="btnSubmit"
            name="btnSubmit"
            api={`/api/roles/${id}`}
            confirmMessage={resource.msg_confirm_save}
            successMessage={resource.msg_save_success}
            forbiddenError={resource.error_403}
            parsingError={resource.error_response_body}
            networkError={resource.error_network}
            conflictError={resource.error_409}
            goneError={resource.error_410}
          >
            {resource.submit}
          </SubmitButton>
        </footer>
      </form>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
