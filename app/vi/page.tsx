import { Error } from "@components/error"
import { logger, toString } from "@lib/logger"
import { getResource } from "@resources"
import { getContentService } from "@service/content"
import { headers } from "next/headers"

export default async function Content() {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path")
  const resource = getResource("vi")

  const service = getContentService()
  try {
    const content = await service.load("home", "vi")
    if (!content) {
      logger.warn(`Content not found: ${pathname}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    return <div className="content-container" dangerouslySetInnerHTML={{ __html: content.body || "" }}></div>
  } catch (err) {
    logger.error(`Error at ${pathname}: ${toString(err)}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
