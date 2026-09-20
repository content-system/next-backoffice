import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logger, toString } from "@lib/logger"
import { getResource, Status } from "@resources"
import { Article, articleModel, getArticleService } from "@service/article"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful, write } from "web-one"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const account = await getCurrentUser()
  if (!account) {
    return new NextResponse("Require authentication", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    })
  }
  const canWrite = await hasPermission(write, 1)
  if (!canWrite) {
    return new NextResponse("You have no permission to create or update article", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    })
  }
  const { id } = await params
  const resource = getResource(account.language)
  const article: Article = await req.json()

  const errors = validate(article, articleModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getArticleService()
  try {
    if (id === Status.New) {
      const res = await service.create(article)
      const status = isSuccessful(res) ? 200 : 409
      return NextResponse.json(res, { status })
    } else {
      const res = await service.update(article)
      const status = res > 0 ? 200 : res === 0 ? 410 : 409
      return NextResponse.json(res, { status })
    }
  } catch (err) {
    logger.error(`Error at POST /articles/${id}: ${toString(err)}`)
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
