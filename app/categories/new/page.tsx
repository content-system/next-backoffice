import { BackButton } from "@components/client"
import { formatText } from "@components/client-script"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { getCategoryService } from "@service/category"
import { read, write } from "web-one"

export default async function NewCategory() {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize(1)

  if (!hasPrivilege(permission, read)) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const service = getCategoryService()

try {
  const category = {
    id: "",
    name: "",
    resource: "",
    path: "",
    icon: "",
    sequence: 0,
    parent: "",
    type: "",
    status: Status.Active,
  }

const canWrite = hasPrivilege(permission, write)

if (!canWrite) {
  return (
    <form id="categoryForm" name="categoryForm" className="form" noValidate={true}>
      <header>
       <h2>Create Category</h2>
      </header>

      <div>
        <dl className="data-list row">
          <dt className="col s6 l3">{resource.id}</dt>
          <dd className="col s6 l9">{category.id}</dd>

          <dt className="col s6 l3">{resource.name}</dt>
          <dd className="col s6 l9">{category.name}</dd>

          <dt className="col s6 l3">{resource.path}</dt>
          <dd className="col s6 l9">{category.path}</dd>

          <dt className="col s6 l3">{resource.icon}</dt>
          <dd className="col s6 l9">{category.icon}</dd>

          <dt className="col s6 l3">{resource.resource}</dt>
          <dd className="col s6 l9">{category.resource}</dd>

          <dt className="col s6 l3">{resource.parent}</dt>
          <dd className="col s6 l9">{category.parent}</dd>

          <dt className="col s6 l3">{resource.type}</dt>
          <dd className="col s6 l9">{category.type}</dd>

          <dt className="col s6 l3">{resource.sequence}</dt>
          <dd className="col s6 l9">{category.sequence}</dd>

          <dt className="col s6 l3">{resource.status}</dt>
          <dd className="col s6 l9">{category.status}</dd>
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
  <form
    id="categoryForm"
    name="categoryForm"
    className="form"
    noValidate={true}
    data-required-error={resource.error_required}
  >
    <header>
      <BackButton id="backBtn" name="backBtn" className="btn-back" />
      <h2>{resource.categories}</h2>
    </header>

    <div className="row">
      <label className="col s12 m6 required">
        {resource.id}
        <Input
          type="text"
          id="id"
          name="id"
          defaultValue={category.id}
          maxLength={40}
          required={true}
          requiredError={formatText(resource.error_required, resource.id)}
          placeholder={resource.id}
        />
      </label>

      <label className="col s12 m6 required">
        {resource.name}
        <Input
          type="text"
          id="name"
          name="name"
          defaultValue={category.name}
          maxLength={120}
          required={true}
          requiredError={formatText(resource.error_required, resource.name)}
          placeholder={resource.name}
        />
      </label>

      <label className="col s12 m6 required">
        {resource.path}
        <Input
          type="text"
          id="path"
          name="path"
          defaultValue={category.path}
          maxLength={1200}
          required={true}
          requiredError={formatText(resource.error_required, resource.path)}
          placeholder={resource.path}
        />
      </label>

      <label className="col s12 m6 required">
        {resource.icon}
        <Input
          type="text"
          id="icon"
          name="icon"
          defaultValue={category.icon}
          maxLength={255}
          required={true}
          requiredError={formatText(resource.error_required, resource.icon)}
          placeholder={resource.icon}
        />
      </label>

      <label className="col s12 m6">
        {resource.resource}
        <Input
          type="text"
          id="resource"
          name="resource"
          defaultValue={category.resource}
          maxLength={255}
          placeholder={resource.resource}
        />
      </label>

      <label className="col s12 m6">
        {resource.parent}
        <Input
          type="text"
          id="parent"
          name="parent"
          defaultValue={category.parent}
          maxLength={40}
          placeholder={resource.parent}
        />
      </label>

      <label className="col s12 m6">
        {resource.type}
        <Input
          type="text"
          id="type"
          name="type"
          defaultValue={category.type}
          placeholder={resource.type}
        />
      </label>

      <label className="col s12 m6">
        {resource.sequence}
        <Input
          type="number"
          id="sequence"
          name="sequence"
          defaultValue={category.sequence}
          placeholder={String(category.sequence)}
        />
      </label>
    </div>

    <label className="col s12 m6">
      {resource.status}
      <div className="radio-group">
        <label>
          <input
            type="radio"
            id="active"
            name="status"
            value={Status.Active}
            defaultChecked={category.status === Status.Active}
          />
          {resource.active}
        </label>

        <label>
          <input
            type="radio"
            id="inactive"
            name="status"
            value={Status.Inactive}
            defaultChecked={category.status === Status.Inactive}
          />
          {resource.inactive}
        </label>
      </div>
    </label>

    <footer>
      <SubmitButton
        type="submit"
        id="btnSubmit"
        name="btnSubmit"
        api="/api/categories/create"
>
        {resource.submit}
      </SubmitButton>
    </footer>
  </form>
)
} catch (err) {
  logError(err)
  return (
    <Error
      title={resource.error_500_title}
      message={resource.error_500_message}
    />
  )
}
}