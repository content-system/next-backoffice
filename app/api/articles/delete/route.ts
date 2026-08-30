import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getArticleService } from "@service/article"
import { NextRequest, NextResponse } from "next/server"
import { isSuccessful } from "web-one"

export async function DELETE(req: NextRequest) {
  const account = await getCurrentUser()

  if (!account) {
    return new NextResponse("Require authentication", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  const { id } = await req.json()

  const service = getArticleService()

  try {
    const res = await service.delete(id)

    const status = isSuccessful(res) ? 200 : 410

    return NextResponse.json(res, { status })
  } catch (err) {
    logger.error(
      `Error at DELETE /articles/delete: ${toString(err)}`
    )

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}