import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getResource } from "@resources"
import { Content, contentModel, getContentService } from "@service/content"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful } from "web-one"

export async function POST(req: NextRequest) {
  const account = await getCurrentUser()
  if (!account) {
    return new NextResponse("Require authentication", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    })
  }
  const resource = getResource(account.language)
  const content: Content = await req.json()

  const errors = validate(content, contentModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getContentService()
  try {
    const res = await service.update(content)
    const status = isSuccessful(res) ? 200 : 410
    return NextResponse.json(res, { status })
  } catch (err) {
    logger.error(`Error at POST /contents: ${toString(err)}`)
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
