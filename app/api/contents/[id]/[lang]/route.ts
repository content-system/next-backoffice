import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { Content, contentModel, getContentService } from "@service/content"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful, write } from "web-one"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; lang: string }> }) {
  const account = await getCurrentUser()
  if (!account) {
    return NextResponse.json({ message: "Require authentication" }, { status: 401 })
  }
  const canWrite = await hasPermission(write, 2)
  if (!canWrite) {
    return NextResponse.json({ message: "You have no permission to create or update content" }, { status: 403 })
  }

  const { id, lang } = await params
  const resource = getResource(account.language)
  const content: Content = await req.json()
  if ((id !== Status.New && id !== content.id) || lang !== content.lang) {
    return NextResponse.json({ message: "Content key does not match route" }, { status: 400 })
  }

  const tags = (content as unknown as { tags?: unknown }).tags
  if (typeof tags === "string") {
    content.tags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
  content.createdBy = content.createdBy || account.id
  content.updatedBy = account.id

  const errors = validate(content, contentModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getContentService()
  try {
    if (id === Status.New) {
      const res = await service.create(content)
      return NextResponse.json(res, { status: isSuccessful(res) ? 200 : 409 })
    }
    const res = await service.update(content)
    const status = isSuccessful(res) ? 200 : res === 0 ? 410 : 409
    return NextResponse.json(res, { status })
  } catch (err) {
    logger.error(`Error at POST /contents/${id}/${lang}: ${err}`)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
