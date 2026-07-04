import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { config as cfg } from "./config"

export async function proxy(request: NextRequest) {
  const cookie = await cookies()
  const token = cookie.get("token")?.value
  const r = request.nextUrl.pathname + request.nextUrl.search
  if (!token) {
    if (!isSkipAuthorization(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.search = `redirect=${encodeURIComponent(r)}`
      return NextResponse.redirect(url)
    }
  } else {
    try {
      const secret = process.env.TOKEN_SECRET || cfg.token.secret
      jwt.verify(token, secret)
    } catch {
      if (!isSkipAuthorization(request.nextUrl.pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        url.search = `redirect=${encodeURIComponent(r)}`
        return NextResponse.redirect(url)
      }
    }
  }

  // Add a new header x-current-path which passes the path to downstream components
  const headers = new Headers(request.headers)
  headers.set("x-current-fullpath", request.nextUrl.pathname + request.nextUrl.search)
  headers.set("x-current-path", request.nextUrl.pathname)

  const url = new URL(request.url)
  const lang = url.searchParams.get("lang")
  if (lang) {
    headers.set("x-language", lang)
  }
  return NextResponse.next({
    request: {
      headers,
    },
  })
}

function isSkipAuthorization(path: string): boolean {
  return path === "/login" || path === "" || path === "/"
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico|logo192\\.png|logo512\\.png|manifest\\.json|robots\\.txt|static).*)",
  ],
}
