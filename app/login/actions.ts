"use server"

import { getAuthenticator } from "@lib/authentication"
import { getDateFormat, getDefaultLang, getResource } from "@resources"
import { getFirstPath } from "authen-service"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"
import { validate } from "validation-core"
import { fromFormData } from "web-one"
import { config } from "../../config"
import { map, userModel } from "./constants"

export interface LoginState {
  success: boolean
  message?: string
  username?: string
  lang?: string
  nextUrl: string
  redirect?: string
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const resource = getResource(prevState.lang)
  const obj = fromFormData<any>(formData, userModel)

  const errors = validate(obj, userModel, resource)
  if (errors.length > 0) {
    return {
      success: false,
      message: errors[0].message,
      username: obj.username,
      lang: prevState.lang,
      redirect: prevState.redirect,
      nextUrl: "/login"
    }
  }

  let nextUrl = "/login"
  const service = getAuthenticator()
  const result = await service.authenticate(obj)

  if (result.status === 1 && result.user) {
    const account = result.user
    const cookieStore = await cookies()

    if (!account.language) {
      account.language = getDefaultLang()
    }
    if (!account.dateFormat) {
      account.dateFormat = getDateFormat(account.language)
    }
    const displayName = account.displayName || account.username || account.email || account.id
    const token = sign(
      {
        id: account.id,
        username: obj.username,
        displayName,
        language: account.language,
        dateFormat: account.dateFormat,
      },
      process.env.TOKEN_SECRET || config.token.secret,
      { expiresIn: config.token.expires }
    )

    cookieStore.set("token", token, { httpOnly: true, path: "/" })
    if (prevState.redirect) {
      nextUrl = prevState.redirect
    } else if (account.privileges) {
      const firstPath = getFirstPath(account.privileges)
      if (firstPath) {
        nextUrl = firstPath
      }
    }
    return { success: true, lang: prevState.lang, nextUrl }
  }

  const key = map[String(result.status)]
  const message = key ? resource[key] : resource.fail_authentication

  return {
    success: false,
    message,
    username: obj.username,
    lang: prevState.lang,
    redirect: prevState.redirect,
    nextUrl
  }
}
