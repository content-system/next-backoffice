import { BackButton } from "@components/client"
import { formatText } from "@components/client-script"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { getContentService } from "@service/content"
import { read, write } from "web-one"
import DeleteButton from "./DeleteButton"

export default async function UserForm({ params }: { params: Promise<{ id: string }> }) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize(1)
  if (!hasPrivilege(permission, read)) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const { id } = await params
const service = getContentService()

try {
  const content = await service.load(id, account?.language || "en")

  if (!content) {
    logger.warn(`Content not found: ${id}`)
    return <Error title={resource.error_404_title} message={resource.error_404_message} />
  }

  const canWrite = hasPrivilege(permission, write)

  if (!canWrite) {
    return (
      <form id="contentForm" name="contentForm" className="form" noValidate={true}>
        <header>
          <h2>{resource.content}</h2>
        </header>

        {/* Chỗ này sẽ đổi theo model Content */}

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
    id="contentForm"
    name="contentForm"
    className="form"
    noValidate={true}
    data-required-error={resource.error_required}
  >
    <header>
      <BackButton id="backBtn" name="backBtn" className="btn-back" />
      <h2>{resource.content}</h2>
    </header>

    <div className="row">
      <label className="col s12 m6 required">
        ID
        <Input
          type="text"
          id="id"
          name="id"
          defaultValue={content.id}
          maxLength={40}
          required={true}
          placeholder="ID"
        />
      </label>

      <label className="col s12 m6 required">
        Language
        <Input
          type="text"
          id="lang"
          name="lang"
          defaultValue={content.lang}
          maxLength={40}
          required={true}
          placeholder="Language"
        />
      </label>

      <label className="col s12 required">
        Title
        <Input
          type="text"
          id="title"
          name="title"
          defaultValue={content.title}
          maxLength={255}
          required={true}
          placeholder="Title"
        />
      </label>

            <div className="col s12 required">
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          defaultValue={content.body}
          rows={10}
          style={{ width: "100%", minHeight: "220px" }}
        />
      </div>

      <label className="col s12">
        Tags
        <Input
          type="text"
          id="tags"
          name="tags"
          defaultValue={content.tags?.join(",")}
          placeholder="tag1,tag2"
        />
      </label>

      <div className="col s12">
        <label>{resource.status}</label>

        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="status"
              value={Status.Active}
              defaultChecked={content.status === Status.Active}
            />
            {resource.active}
          </label>

          <label>
            <input
              type="radio"
              name="status"
              value={Status.Inactive}
              defaultChecked={content.status === Status.Inactive}
            />
            {resource.inactive}
          </label>
        </div>
      </div>
    </div>

    <footer
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <DeleteButton id={content.id}lang={content.lang}
/>

  <SubmitButton
    type="submit"
    id="btnSubmit"
    name="btnSubmit"
    api="/api/contents"
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