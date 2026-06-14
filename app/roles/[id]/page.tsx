import { formatText } from "@components/client-script"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getResource, Status } from "@resources"
import { getRoleService } from "@service/role"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function RoleForm({ params }: { params: Promise<{ id: string }> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path") as string
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }
  const resource = getResource(account?.language)

  const { id } = await params
  const service = getRoleService()
  try {
    const role = await service.load(id)
    if (!role) {
      logger.warn(`Role not found: ${id}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    return (
      <form id="currencyForm" name="currencyForm" className="form" noValidate={true}>
        <header>
          <h2>{resource.currency}</h2>
        </header>
        <div className="row">
          <label className="col s12 m6 required">
            {resource.role_id}
            <Input
              type="text"
              id="roleId"
              name="roleId"
              defaultValue={role.roleId}
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
            <Input
              type="text"
              id="remark"
              name="remark"
              defaultValue={role.remark}
              maxLength={120}
              placeholder={resource.email}
            />
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
          <SubmitButton type="submit" id="btnSubmit" name="btnSubmit" api="/api/roles">
            {resource.submit}
          </SubmitButton>
        </footer>
      </form>
    )
  } catch (err) {
    logger.error(`Error at ${pathname}: ${toString(err)}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
