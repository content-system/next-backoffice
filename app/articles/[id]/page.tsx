import { BackButton } from "@components/client"
import DeleteButton from "@components/delete-button"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { getArticleService } from "@service/article"
import { read, write } from "web-one"

export default async function ArticleForm({ params }: { params: Promise<{ id: string }> }) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)

  const permission = await authorize(1)

  if (!hasPrivilege(permission, read)) {
    logForbidden(account)

    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const { id } = await params

  const service = getArticleService()

  try {
    const article = await service.loadDraft(id)

    if (!article) {
      logger.warn(`Article not found: ${id}`)

      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    const canWrite = hasPrivilege(permission, write)

    if (!canWrite) {
      return (
        <form className="form">
          <header>
            <h2>{resource.article}</h2>
          </header>

          <footer>
            <BackButton id="closeBtn" name="closeBtn">
              {resource.close}
            </BackButton>
          </footer>
        </form>
      )
    }

    return (
      <form id="articleForm" name="articleForm" className="form" noValidate data-required-error={resource.error_required}>
        {/* HEADER */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <BackButton id="backBtn" name="backBtn" className="btn-back" />

          <h2
            style={{
              margin: 0,
              flex: 1,
            }}
          >
            {resource.article}
          </h2>

          <DeleteButton id={article.id} />
        </header>

        {/* FORM */}
        <div className="row">
          <label className="col s12 m6 required">
            ID
            <Input id="id" name="id" type="text" defaultValue={article.id} required maxLength={40} />
          </label>

          <label className="col s12 m6">
            Slug
            <Input id="slug" name="slug" type="text" defaultValue={article.slug} maxLength={150} />
          </label>

          <label className="col s12 required">
            Title
            <Input id="title" name="title" type="text" defaultValue={article.title} required maxLength={255} />
          </label>

          <div className="col s12 required">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              defaultValue={article.description}
              rows={4}
              style={{
                width: "100%",
              }}
            />
          </div>

          <div className="col s12 required">
            <label htmlFor="content">Content</label>

            <textarea
              id="content"
              name="content"
              defaultValue={article.content}
              rows={12}
              style={{
                width: "100%",
                minHeight: "260px",
              }}
            />
          </div>

          <label className="col s12">
            Thumbnail
            <Input id="thumbnail" name="thumbnail" type="text" defaultValue={article.thumbnail} maxLength={400} />
          </label>

          <label className="col s12">
            High Thumbnail
            <Input id="highThumbnail" name="highThumbnail" type="text" defaultValue={article.highThumbnail} maxLength={400} />
          </label>

          <label className="col s12 m6">
            Author ID
            <Input id="authorId" name="authorId" type="text" defaultValue={article.authorId} />
          </label>

          <label className="col s12 m6">
            Published At
            <Input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={article.publishedAt ? new Date(article.publishedAt).toISOString().substring(0, 16) : ""}
            />
          </label>

          <label className="col s12">
            Tags
            <Input id="tags" name="tags" type="text" defaultValue={article.tags?.join(",")} placeholder="tag1,tag2" />
          </label>

          <div className="col s12">
            <label>{resource.status}</label>

            <div className="radio-group">
              <label>
                <input type="radio" name="status" value={Status.Draft} defaultChecked={article.status === Status.Draft} />
                Draft
              </label>

              <label>
                <input type="radio" name="status" value={Status.Submitted} defaultChecked={article.status === Status.Submitted} />
                Submitted
              </label>

              <label>
                <input type="radio" name="status" value={Status.Published} defaultChecked={article.status === Status.Published} />
                Published
              </label>

              <label>
                <input type="radio" name="status" value={Status.Rejected} defaultChecked={article.status === Status.Rejected} />
                Rejected
              </label>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <SubmitButton
            id="btnSubmit"
            name="btnSubmit"
            type="submit"
            api={`/api/articles/${id}`}
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
