import { BackButton } from "@components/back-button"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { formatText } from "@components/format"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getDateFormat, getResource, Status } from "@resources"
import { Content, getContentService } from "@service/content"
import { create, datetimeToString, formatDateTime, read, write } from "web-one"

export default async function ContentPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const { id, lang } = await params
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize(1)
  const canRead = hasPrivilege(permission, read)
  const canWrite = hasPrivilege(permission, write)
  const newMode = id === Status.New

  if (!canRead || (newMode && !canWrite)) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const service = getContentService()
  try {
    let content: Content | null = newMode ? create<Content>(Status.Active) : await service.load(id, lang)

    if (!content && !newMode) {
      logger.warn(`Content not found: ${id}/${lang}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    if (newMode && content) {
      content.id = ""
      content.lang = lang
    }

    if (!canWrite) {
      return (
        <form id="contentForm" name="contentForm" className="form" noValidate={true}>
          <header>
            <h2>{resource.contents}</h2>
          </header>
          <div>
            <dl className="data-list row">
              <dt className="col s6 l3">{resource.id}</dt>
              <dd className="col s6 l9">{content?.id}</dd>
              <dt className="col s6 l3">{resource.lang}</dt>
              <dd className="col s6 l9">{content?.lang}</dd>
              <dt className="col s6 l3">{resource.title}</dt>
              <dd className="col s6 l9">{content?.title}</dd>
              <dt className="col s6 l3">{resource.body}</dt>
              <dd className="col s6 l9">{content?.body}</dd>
              <dt className="col s6 l3">{resource.published_at}</dt>
              <dd className="col s6 l9">{formatDateTime(content?.publishedAt, getDateFormat(account?.language, account?.dateFormat))}</dd>
              <dt className="col s6 l3">{resource.tags}</dt>
              <dd className="col s6 l9">{content?.tags?.join(", ")}</dd>
              <dt className="col s6 l3">{resource.status}</dt>
              <dd className="col s6 l9">{content?.status}</dd>
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

    const data = content as Content

    return (
      <form id="contentForm" name="contentForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.contents}</h2>
        </header>
        <div className="row">
          <input type="hidden" id="version" name="version" data-type="integer" value={data.version ?? 1} />
          <label className="col s12 m6 required">
            {resource.id}
            <Input
              type="text"
              id="id"
              name="id"
              defaultValue={data.id}
              readOnly={!newMode}
              maxLength={40}
              required={newMode}
              requiredError={formatText(resource.error_required, resource.id)}
              placeholder={resource.id}
            />
          </label>
          <label className="col s12 m6 required">
            {resource.lang}
            <Input type="text" id="lang" name="lang" defaultValue={data.lang} readOnly={!newMode} maxLength={10} />
          </label>
          <label className="col s12 m6">
            {resource.published_at}
            <Input type="datetime-local" step=".010" id="publishedAt" name="publishedAt" defaultValue={datetimeToString(data.publishedAt)} />
          </label>
          <label className="col s12 m6">
            {resource.status}
            <div className="radio-group">
              <label>
                <input type="radio" id="active" name="status" value={Status.Active} defaultChecked={data.status === Status.Active} />
                {resource.active}
              </label>
              <label>
                <input type="radio" id="inactive" name="status" value={Status.Inactive} defaultChecked={data.status === Status.Inactive} />
                {resource.inactive}
              </label>
            </div>
          </label>
          <label className="col s12 required">
            {resource.title}
            <Input
              type="text"
              id="title"
              name="title"
              defaultValue={data.title}
              maxLength={255}
              required={true}
              requiredError={formatText(resource.error_required, resource.title)}
              placeholder={resource.title}
            />
          </label>
          <label className="col s12 auto-height required">
            {resource.body}
            <textarea id="body" name="body" defaultValue={data.body} rows={20} maxLength={10000} required={true} placeholder={resource.body} />
          </label>
        </div>
        <footer>
          <SubmitButton
            type="submit"
            id="btnSubmit"
            name="btnSubmit"
            api={`/api/contents/${id}/${encodeURIComponent(lang)}`}
            confirmHeader={resource.header_confirm}
            confirmMessage={resource.msg_confirm_save}
            successMessage={resource.msg_save_success}
            errorHeader={resource.header_error}
            forbiddenError={resource.error_403}
            parsingError={resource.error_response_body}
            networkError={resource.error_network}
            conflictError={resource.error_409}
            goneError={resource.error_410}
            successUrl="back"
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
