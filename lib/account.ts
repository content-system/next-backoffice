import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { config } from "../config"

export interface Account {
  id: string
  username: string
  displayName: string
  language: string
  dateFormat: string
}

export async function getCurrentUser(): Promise<Account | null | undefined> {
  const cookie = await cookies()
  const token = cookie.get("token")?.value
  if (!token) {
    return null
  }
  try {
    const secret = process.env.TOKEN_SECRET || config.token.secret
    const payload: any = jwt.verify(token, secret)
    delete payload["iat"]
    delete payload["exp"]
    return payload as Account
  } catch {
    return null
  }
}
