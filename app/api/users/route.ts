import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getResource } from "@resources"
import { getUserService, User, userModel } from "@service/user"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"

export async function POST(req: NextRequest) {
  const account = await getCurrentUser()
  if (!account) {
    return NextResponse.json({ message: "Require authentication" }, { status: 401 })
  }
  const resource = getResource(account.language)
  const user: User = await req.json()

  const errors = validate(user, userModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getUserService()
  try {
    const res = await service.update(user)
    const status = res > 0 ? 200 : 410
    return NextResponse.json(res, { status })
  } catch (err) {
    logger.error(`Error at POST /users: ${err}`)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
