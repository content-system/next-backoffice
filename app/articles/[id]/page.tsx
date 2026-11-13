import { AutocompleteChip } from "@components/autocomplete-chip"
import { BackButton } from "@components/back-button"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { formatText } from "@components/format"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getDateFormat, getResource, Status } from "@resources"
import { Article, getArticleService } from "@service/article"
import { Status as ArticleStatus, canUpdate } from "@service/shared/status"
import { create, datetimeToString, formatDateTime, read, write } from "web-one"

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
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

  const service = getArticleService()
  try {
    const tagSuggestions = await service.getTags()
    let article: Article | null = newMode ? create<Article>(ArticleStatus.Draft) : await service.loadDraft(id)
    const hasDraft = !!article
    if (!article && !newMode) {
      article = await service.load(id)
    }
    if (!article) {
      logger.warn(`Article not found: ${id}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    const canEdit = canWrite && (newMode || (hasDraft && canUpdate(article.status)))
    const dateFormat = getDateFormat(account?.language, account?.dateFormat)
    const statusText =
      article.status === ArticleStatus.Draft
        ? resource.save_draft
        : article.status === ArticleStatus.Submitted
          ? resource.submit
          : article.status === ArticleStatus.Rejected
            ? resource.rejected
            : article.status === ArticleStatus.Approved
              ? resource.approved
              : article.status

    if (!canEdit) {
      return (
        <form id="articleForm" name="articleForm" className="form" noValidate={true}>
          <header>
            <h2>{resource.article}</h2>
          </header>
          <div>
            <dl className="data-list row">
              <dt className="col s6 l3">{resource.id}</dt>
              <dd className="col s6 l9">{article.id}</dd>
              <dt className="col s6 l3">{resource.title}</dt>
              <dd className="col s6 l9">{article.title}</dd>
              <dt className="col s6 l3">{resource.description}</dt>
              <dd className="col s6 l9">{article.description}</dd>
              <dt className="col s6 l3">{resource.content}</dt>
              <dd className="col s6 l9">{article.content}</dd>
              <dt className="col s6 l3">{resource.published_at}</dt>
              <dd className="col s6 l9">{formatDateTime(article.publishedAt, dateFormat)}</dd>
              <dt className="col s6 l3">{resource.tags}</dt>
              <dd className="col s6 l9">{article.tags?.join(", ")}</dd>
              <dt className="col s6 l3">{resource.thumbnail}</dt>
              <dd className="col s6 l9">{article.thumbnail}</dd>
              <dt className="col s6 l3">{resource.status}</dt>
              <dd className="col s6 l9">{statusText}</dd>
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
      <form id="articleForm" name="articleForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.article}</h2>
        </header>
        <input type="hidden" id="id" name="id" value={article.id || id} />
        <div className="row">
          <label className="col s12">
            {resource.thumbnail}
            <Input type="url" id="thumbnail" name="thumbnail" defaultValue={article.thumbnail} maxLength={400} placeholder={resource.thumbnail} />
          </label>
          <label className="col s12 m6">
            {resource.published_at}
            <Input type="datetime-local" step=".010" id="publishedAt" name="publishedAt" defaultValue={datetimeToString(article.publishedAt)} />
          </label>
          <label className="col s12 required">
            {resource.title}
            <Input
              type="text"
              id="title"
              name="title"
              defaultValue={article.title}
              maxLength={255}
              required={true}
              requiredError={formatText(resource.error_required, resource.title)}
              placeholder={resource.title}
            />
          </label>
          <label className="col s12 auto-height required">
            {resource.description}
            <textarea
              id="description"
              name="description"
              defaultValue={article.description}
              rows={4}
              maxLength={1200}
              required={true}
              placeholder={resource.description}
            />
          </label>
          <label className="col s12 m6 auto-height">
            {resource.tags}
            <AutocompleteChip id="tags" name="tags" values={article.tags} suggestions={tagSuggestions} placeholder={resource.tags} />
          </label>
          <label className="col s12">
            {resource.status}
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  id="draft"
                  name="status"
                  value={ArticleStatus.Draft}
                  defaultChecked={!article.status || article.status !== ArticleStatus.Submitted}
                />
                {resource.save_draft}
              </label>
              <label>
                <input type="radio" id="submitted" name="status" value={ArticleStatus.Submitted} defaultChecked={article.status === ArticleStatus.Submitted} />
                {resource.submit}
              </label>
            </div>
          </label>
          <label className="col s12 auto-height required">
            {resource.content}
            <textarea id="content" name="content" defaultValue={article.content} rows={80} maxLength={9000} required={true} placeholder={resource.content} />
          </label>
        </div>
        <footer>
          <SubmitButton
            type="submit"
            id="btnSubmit"
            name="btnSubmit"
            api={`/api/articles/${id}`}
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
