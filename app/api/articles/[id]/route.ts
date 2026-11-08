import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { Article, articleModel, getArticleService } from "@service/article"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful, write } from "web-one"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getCurrentUser()
  if (!account) {
    return NextResponse.json({ message: "Require authentication" }, { status: 401 })
  }
  const canWrite = await hasPermission(write, 1)
  if (!canWrite) {
    return NextResponse.json({ message: "You have no permission to create or update article" }, { status: 403 })
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
    logger.error(`Error at POST /articles/${id}: ${err}`)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
