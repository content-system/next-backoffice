"use client"

import Link from "next/link"
import { MouseEvent, ReactNode } from "react"
import { findParent } from "./find-parent"

interface LinkProps {
  id?: string
  href: string
  className?: string
  prefetch?: boolean
  children?: ReactNode
  parentClass: string
}
export function SearchLink(props: LinkProps) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLAnchorElement
    const parent = findParent(target, props.parentClass)
    if (parent) {
      parent.classList.toggle("on")
    }
  }
  return (
    <Link href={props.href} className={props.className} prefetch={props.prefetch} onClick={onClick}>
      {props.children}
    </Link>
  )
}

interface Props {
  type?: "button" | "submit" | "reset"
  id?: string
  name?: string
  className?: string
  children?: ReactNode
}
export function ToggleDropdown({ id, name, className, children }: Props) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const target = e.target as HTMLButtonElement
    target.parentElement?.classList.toggle("on")
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}
