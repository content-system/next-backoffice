"use client"

import { useRouter } from "next/navigation"
import { ReactNode } from "react"

interface Props {
  type?: "button" | "submit" | "reset"
  id?: string
  name?: string
  className?: string
  children?: ReactNode
}
export function BackButton({ type, id, name, className, children }: Props) {
  const router = useRouter()
  const t = type || "button"
  return (
    <button type={t} id={id} name={name} className={className} onClick={() => router.back()}>
      {children}
    </button>
  )
}
