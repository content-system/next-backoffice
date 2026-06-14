import BackButton from "@components/client";
import { Error } from "@components/error";
import { logger, toString } from "@lib/logger";
import { getDateFormat, getLang, getResource } from "@resources";
import { getArticleService } from "@service/article";
import { headers } from "next/headers";
import { formatDateTime } from "web-one";

export default async function Article({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)
  const { slug } = await params

  const service = getArticleService()
  try {
    const article = await service.load(slug)
    if (!article) {
      logger.warn(`Article not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    const dateFormat = getDateFormat(lang)
    return (
      <article className="article">
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{article.title}</h2>
        </header>
        <div className="article-body">
          <h4 className="article-description">{article.description}</h4>
          <h4 className="article-meta">{formatDateTime(article.publishedAt, dateFormat)}</h4>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content || "" }}></div>
        </div>
      </article>
    )
  } catch (err) {
    const headerList = await headers()
    const pathname = headerList.get("x-current-path")
    logger.error(`Error at ${pathname}: ${toString(err)}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
