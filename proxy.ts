import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  // Add a new header x-current-path which passes the path to downstream components
  const headers = new Headers(request.headers)
  headers.set("x-current-path", request.nextUrl.pathname + request.nextUrl.search)

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

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}