import { formatText } from "@components/client-script"
import { Error } from "@components/error"
import { Input, phoneOnFocus, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { email, Gender, getResource, Status } from "@resources"
import { getUserService } from "@service/user"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { formatPhone } from "web-one"

export default async function UserForm({ params }: { params: Promise<{ id: string }> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path") as string
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }
  const resource = getResource(account?.language)

  const { id } = await params
  const service = getUserService()
  try {
    const user = await service.load(id)
    if (!user) {
      logger.warn(`User not found: ${id}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    return (
      <form id="userForm" name="userForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <h2>{resource.user}</h2>
        </header>
        <div className="row">
          <label className="col s12 m6 required">
            {resource.user_id}
            <Input
              type="text"
              id="userId"
              name="userId"
              defaultValue={user.userId}
              maxLength={40}
              required={true}
              requiredError={formatText(resource.error_required, resource.user_id)}
              placeholder={resource.user_id}
            />
          </label>
          <label className="col s12 m6 required">
            {resource.username}
            <Input
              type="text"
              id="username"
              name="username"
              defaultValue={user.username}
              maxLength={100}
              required={true}
              requiredError={formatText(resource.error_required, resource.username)}
              placeholder={resource.username}
            />
          </label>
          <label className="col s12 m6 required">
            {resource.display_name}
            <Input
              type="text"
              id="displayName"
              name="displayName"
              defaultValue={user.displayName}
              maxLength={120}
              required={true}
              requiredError={formatText(resource.error_required, resource.display_name)}
              placeholder={resource.display_name}
            />
          </label>
          <label className="col s12 m6">
            {resource.gender}
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  id="gender"
                  name="gender"
                  value={Gender.Male}
                  defaultChecked={user.gender === Gender.Male}
                />
                {resource.male}
              </label>
              <label>
                <input
                  type="radio"
                  id="gender"
                  name="gender"
                  value={Gender.Female}
                  defaultChecked={user.gender === Gender.Female}
                />
                {resource.female}
              </label>
            </div>
          </label>
          <label className="col s12 m6 required">
            {resource.email}
            <Input
              type="text"
              id="email"
              name="email"
              data-type="email"
              defaultValue={user.email}
              maxLength={120}
              required={true}
              requiredError={formatText(resource.error_required, resource.email)}
              pattern={email}
              error={formatText(resource.error_email, resource.email)}
              placeholder={resource.email}
            />
          </label>
          <label className="col s12 m6 required">
            {resource.phone}
            <Input
              type="tel"
              id="phone"
              name="phone"
              dataType="phone"
              defaultValue={formatPhone(user.phone)}
              onFocus={phoneOnFocus}
              maxLength={17}
              required={true}
              placeholder={resource.phone}
            />
          </label>
        </div>
        <label className="col s12 m6">
          {resource.status}
          <div className="radio-group">
            <label>
              <input type="radio" id="active" name="status" value={Status.Active} defaultChecked={user.status === Status.Active} />
              {resource.active}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" value={Status.Inactive} defaultChecked={user.status === Status.Inactive} />
              {resource.inactive}
            </label>
          </div>
        </label>
        <footer>
          <SubmitButton type="submit" id="btnSubmit" name="btnSubmit" api="/api/users">
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
