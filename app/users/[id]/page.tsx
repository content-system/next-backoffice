import { BackButton } from "@components/client"
import { formatText } from "@components/client-script"
import { Error } from "@components/error"
import { Input, phoneOnFocus, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { email, Gender, getResource, Status } from "@resources"
import { getUserService, User } from "@service/user"
import { create, formatPhone, read, write } from "web-one"

export default async function UserForm({ params }: { params: Promise<{ id: string }> }) {
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

  const service = getUserService()
  try {
    let user: User | null = create<User>(Status.Active)
    if (!newMode) {
      user = await service.load(id)
      if (!user) {
        logger.warn(`User not found: ${id}`)
        return <Error title={resource.error_404_title} message={resource.error_404_message} />
      }
    }

    if (!canWrite) {
      return (
        <form id="userForm" name="userForm" className="form" noValidate={true}>
          <header>
            <h2>{resource.user}</h2>
          </header>
          <div>
            <dl className="data-list row">
              <dt className="col s6 l3">{resource.user_id}</dt>
              <dd className="col s6 l9">{user.userId}</dd>
              <dt className="col s6 l3">{resource.username}</dt>
              <dd className="col s6 l9">{user.username}</dd>
              <dt className="col s6 l3">{resource.display_name}</dt>
              <dd className="col s6 l9">{user.displayName}</dd>
              <dt className="col s6 l3">{resource.gender}</dt>
              <dd className="col s6 l9">{user.gender === Gender.Male ? resource.male : resource.female}</dd>
              <dt className="col s6 l3">{resource.phone}</dt>
              <dd className="col s6 l9">{formatPhone(user?.phone)}</dd>
              <dt className="col s6 l3">{resource.email}</dt>
              <dd className="col s6 l9">{user.email}</dd>
            </dl>
          </div>
          <footer>
            <BackButton type="submit" id="closeBtn" name="closeBtn">
              {resource.close}
            </BackButton>
          </footer>
        </form>
      )
    }

    return (
      <form id="userForm" name="userForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
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
              readOnly={!newMode}
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
                <input type="radio" id="gender" name="gender" value={Gender.Male} defaultChecked={user.gender === Gender.Male} />
                {resource.male}
              </label>
              <label>
                <input type="radio" id="gender" name="gender" value={Gender.Female} defaultChecked={user.gender === Gender.Female} />
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
          <SubmitButton
            type="submit"
            id="btnSubmit"
            name="btnSubmit"
            api={`/api/users/${id}`}
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
