import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getContentService } from "@service/content"
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

  const { id, lang } = await req.json()

console.log("Delete id =", id)
console.log("Delete lang =", lang)

const service = getContentService()

try {
  const result = await service.delete(id, lang)

  return NextResponse.json(result, {
    status: isSuccessful(result) ? 200 : 410,
  })
} catch (err) {
    logger.error(`Error at DELETE /contents: ${toString(err)}`)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}