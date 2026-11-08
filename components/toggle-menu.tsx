"use client"

import { MouseEvent, ReactNode } from "react"
import { findParent } from "./find-parent"

interface Props {
  type?: "button" | "submit" | "reset"
  id?: string
  name?: string
  className?: string
  children?: ReactNode
}
export function ToggleMenu({ id, name, className, children }: Props) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const p = findParent(e.target as HTMLElement, "sidebar-parent")
    if (p) {
      p.classList.toggle("menu-on")
    }
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}
