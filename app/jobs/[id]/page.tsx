import { BackButton } from "@components/client"
import { Error } from "@components/error"
import { logger, toString } from "@lib/logger"
import { getDateFormat, getLang, getResource } from "@resources"
import { getJobService } from "@service/job"
import { headers } from "next/headers"
import Link from "next/link"
import { formatDateTime } from "web-one"
import DeleteButton from "@components/delete-button"

export default async function Job({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)
  const { id } = await params

  const service = getJobService()

  try {
    const job = await service.load(id)

    if (!job) {
      logger.warn(`Job not found: ${id}`)
      return (
        <Error
          title={resource.error_404_title}
          message={resource.error_404_message}
        />
      )
    }

    const dateFormat = getDateFormat(lang)

    return (
      <article className="article">
        <header
              style={{
              display: "flex",
              alignItems: "center",
  }}
>
           <BackButton id="backBtn" name="backBtn" className="btn-back" />

           <h2 style={{ flex: 1 }}>
             {job.title}
           </h2>

         <div style={{ display: "flex", gap: "12px" }}>
         <Link href={`/jobs/${job.id}/edit`}>
          Edit
        </Link>

        <DeleteButton id={job.id} />
  </div>
       </header>

        <div className="article-body">

          <p><strong>ID:</strong> {job.id}</p>

          <p><strong>Slug:</strong> {job.slug}</p>

          <p><strong>Company:</strong> {job.company}</p>

          <p><strong>Position:</strong> {job.position}</p>

          <p><strong>Location:</strong> {job.location}</p>

          <p><strong>Quantity:</strong> {job.quantity}</p>

          <p><strong>Min Salary:</strong> {job.minSalary}</p>

          <p><strong>Max Salary:</strong> {job.maxSalary}</p>

          <p><strong>Status:</strong> {job.status}</p>

          <p>
            <strong>Skills:</strong>{" "}
            {job.skills?.join(", ")}
          </p>

          <p>
            <strong>Published At:</strong>{" "}
            {formatDateTime(job.publishedAt, dateFormat)}
          </p>

          <p>
            <strong>Expired At:</strong>{" "}
            {formatDateTime(job.expiredAt, dateFormat)}
          </p>

          <hr />

          <h3>Description</h3>

          <div
            className="job-description"
            dangerouslySetInnerHTML={{
              __html: job.description,
            }}
          />

          <hr />

          <p><strong>Created By:</strong> {job.createdBy}</p>

          <p>
            <strong>Created At:</strong>{" "}
            {formatDateTime(job.createdAt, dateFormat)}
          </p>

          <p><strong>Updated By:</strong> {job.updatedBy}</p>

          <p>
            <strong>Updated At:</strong>{" "}
            {formatDateTime(job.updatedAt, dateFormat)}
          </p>

        </div>
      </article>
    )
  } catch (err) {
    const headerList = await headers()
    const pathname = headerList.get("x-current-path")

    logger.error(`Error at ${pathname}: ${toString(err)}`)

    return (
      <Error
        title={resource.error_500_title}
        message={resource.error_500_message}
      />
    )
  }
}