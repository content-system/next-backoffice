import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getResource } from "@resources"
import {
  Article,
  articleModel,
  getArticleService,
} from "@service/article"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful } from "web-one"

export async function POST(req: NextRequest) {
  const account = await getCurrentUser()

  console.log("ACCOUNT =", account)

  if (!account) {
    return new NextResponse("Require authentication", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  const resource = getResource(account.language)

  const article: Article = await req.json()

  article.createdBy = account.id
  article.updatedBy = account.id

  console.log("Before:", article.tags, typeof article.tags)

  if (typeof (article as any).tags === "string") {
    article.tags = ((article as any).tags as string)
      .split(",")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
  }

  console.log("After:", article.tags, Array.isArray(article.tags))

  const errors = validate(article, articleModel, resource)

  console.log("ARTICLE =", article)
  console.log("ERRORS =", errors)

  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getArticleService()

  try {
    const result = await service.create(article)

    console.log("RESULT =", result)

    const status = isSuccessful(result) ? 200 : 410

    return NextResponse.json(result, { status })
  } catch (err) {
    logger.error(
      `Error at POST /articles: ${toString(err)}`
    )

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}

export async function PUT(req: NextRequest) {
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

  const article: Article = await req.json()

  article.updatedBy = account.id

  if (typeof (article as any).tags === "string") {
    article.tags = ((article as any).tags as string)
      .split(",")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
  }

  const errors = validate(article, articleModel, resource)

  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getArticleService()

  try {
    const result = await service.update(article)

    const status = isSuccessful(result) ? 200 : 410

    return NextResponse.json(result, { status })
  } catch (err) {
    logger.error(
      `Error at PUT /articles: ${toString(err)}`
    )

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}

export async function DELETE(
  req: NextRequest,
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

  const service = getArticleService()

  try {
    const url = new URL(req.url)

    const id = url.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { message: "Article ID is required" },
        { status: 400 }
      )
    }

    console.log("DELETE ARTICLE ID =", id)

    const result = await service.delete(id)

    console.log("DELETE RESULT =", result)

    if (isSuccessful(result)) {
      return NextResponse.json(result, {
        status: 200,
      })
    }

    if (result === 0) {
      return NextResponse.json(result, {
        status: 410,
      })
    }

    return NextResponse.json(result, {
      status: 400,
    })
  } catch (err) {
    logger.error(
      `Error at DELETE /articles: ${toString(err)}`
    )

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}