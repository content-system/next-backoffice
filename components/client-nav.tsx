"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export function ClientNav({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)
  return <li className={isActive ? "active" : ""}>{children}</li>
}

export function SubList({ children }: { children: ReactNode }) {
  return (
    <div className="menu-item" onClick={(e) => toggleMenuItem(e.target as HTMLElement)}>
      {children}
    </div>
  )
}

function toggleMenuItem(target: HTMLElement) {
  const nul = target.nextElementSibling
  if (nul) {
    const elI = target.querySelector(".menu-item > i.entity-icon")
    if (elI) {
      if (nul.classList.contains("expanded")) {
        nul.classList.remove("expanded")
        elI.classList.add("up")
        elI.classList.remove("down")
      } else {
        nul.classList.add("expanded")
        elI.classList.remove("up")
        elI.classList.add("down")
      }
    }
  }
  const parent = findParentNode(target, "LI")
  if (parent) {
    parent.classList.toggle("open")
  }
}
function findParentNode(e: HTMLElement | null | undefined, nodeName: string): HTMLElement | null {
  if (!e) {
    return null
  }
  if (e.nodeName == nodeName || e.getAttribute("data-field")) {
    return e
  }
  let p: HTMLElement | null = e
  while (true) {
    p = p.parentElement
    if (!p) {
      return null
    }
    if (p.nodeName == nodeName || p.getAttribute("data-field")) {
      return p
    }
  }
}
