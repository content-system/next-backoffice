import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getCategoryService } from "@service/category"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const account = await getCurrentUser()

  if (!account) {
    return new NextResponse("Require authentication", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  const { id } = await params

  const service = getCategoryService()

  try {
    const result = await service.delete(id)

    return NextResponse.json(result, {
      status: result > 0 ? 200 : 410,
    })
  } catch (err) {
    logger.error(`Error at DELETE /categories/${id}: ${toString(err)}`)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}