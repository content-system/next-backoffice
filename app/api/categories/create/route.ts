import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getResource } from "@resources"
import { Category, categoryModel, getCategoryService } from "@service/category"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful } from "web-one"

export async function POST(req: NextRequest) {
  const account = await getCurrentUser()

  if (!account) {
    return new NextResponse("Require authentication", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  const resource = getResource(account.language)

  const body = await req.json()

  const category: Category = {
    ...body,
    sequence:
      body.sequence === undefined ||
      body.sequence === null ||
      body.sequence === ""
        ? 0
        : Number(body.sequence),
  }

  const errors = validate(category, categoryModel, resource)

  if (errors.length > 0) {
    return NextResponse.json(errors, {
      status: 422,
    })
  }

  const service = getCategoryService()

  try {
   const result = await service.create(category)

    return NextResponse.json(result, {
      status: isSuccessful(result) ? 200 : 410,
    })
  } catch (err) {

    logger.error(`Error at POST /categories: ${toString(err)}`)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}