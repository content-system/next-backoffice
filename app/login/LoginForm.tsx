"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { StringMap } from "onecore"
import { useActionState, useEffect } from "react"
import { loginAction, LoginState } from "./actions"

export interface Props {
  resource: StringMap
  lang?: string
  redirect?: string
}

export default function LoginForm({ lang, resource, redirect }: Props) {
  const router = useRouter()

  const initialState: LoginState = {
    success: false,
    lang,
    nextUrl: "/login",
    redirect,
  }
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.push(state.nextUrl) // ✅ client-side redirect only on success
    }
  }, [state.success, state.nextUrl, router])

  return (
    <div className="central-full">
      <form action={formAction} className="form" noValidate autoComplete="off">
        <div className="view-body row">
          <img className="logo" src="/logo192.png" alt="logo" />
          <h1>{resource.signin}</h1>
          {state.message && <div className="message alert-error">{state.message}</div>}
          <label className="col s12">
            {resource.username}
            <input name="username" defaultValue={state.username} maxLength={100} placeholder={resource.placeholder_username} />
          </label>
          <label className="col s12">
            {resource.password}
            <input type="password" name="password" maxLength={100} placeholder={resource.placeholder_password} />
          </label>
          <label className="col s12 checkbox-container">
            <input type="checkbox" name="remember" />
            {resource.signin_remember_me}
          </label>
          <button type="submit" disabled={pending}>
            {pending ? "Signing in..." : resource.button_signin}
          </button>
          <Link href="/forgot-password">{resource.button_forgot_password}</Link>
          <Link href="/signup">{resource.button_signup}</Link>
          <Link href="/">{resource.button_home}</Link>
        </div>
      </form>
    </div>
  )
}
