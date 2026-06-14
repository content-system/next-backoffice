import BackButton from "@components/client";
import { Error } from "@components/error";
import { logger, toString } from "@lib/logger";
import { getDateFormat, getLang, getResource } from "@resources";
import { getJobService } from "@service/job";
import { headers } from "next/headers";
import { formatDateTime } from "web-one";

export default async function Job({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)
  const { slug } = await params

  const service = getJobService()
  try {
    const job = await service.load(slug)
    if (!job) {
      logger.warn(`Job not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    const dateFormat = getDateFormat(lang)
    return (
      <article className="article" >
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{job.title}</h2>
        </header>
        <div className="article-body">
          <h3 className="article-description">
            {resource.location}: {job.location}
          </h3>
          <h4 className="article-meta">{formatDateTime(job.publishedAt, dateFormat)}</h4>
          <h4 className="article-meta">
            {resource.quantity}: {job.quantity}
          </h4>
          <div className="job-description" dangerouslySetInnerHTML={{ __html: job.description }}></div>
        </div>
      </article >
    )
  } catch (err) {
    const headerList = await headers()
    const pathname = headerList.get("x-current-path")
    logger.error(`Error at ${pathname}: ${toString(err)}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
