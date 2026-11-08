import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { Category, categoryModel, getCategoryService } from "@service/category"
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
    return NextResponse.json({ message: "You have no permission to create or update category" }, { status: 403 })
  }
  const { id } = await params
  const resource = getResource(account.language)
  const category: Category = await req.json()

  const errors = validate(category, categoryModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getCategoryService()
  try {
    if (id === Status.New) {
      const res = await service.create(category)
      const status = isSuccessful(res) ? 200 : 409
      return NextResponse.json(res, { status })
    } else {
      const res = await service.update(category)
      const status = isSuccessful(res) ? 200 : res === 0 ? 410 : 409
      return NextResponse.json(res, { status })
    }
  } catch (err) {
    logger.error(`Error at POST /categorys/${id}: ${err}`)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
