"use client"

import { MouseEvent } from "react"

interface ThemeProps {
  id?: string
  theme?: "light" | "dark" | undefined | null
  className?: string
  darkText: string
  darkIcon: string
  lightText: string
  lightIcon: string
}

export function ToggleTheme({ id, theme, className, darkText, darkIcon, lightText, lightIcon }: ThemeProps) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    toggleTheme(e.target as HTMLButtonElement, darkText, darkIcon, lightText, lightIcon)
  }
  const text = theme === "dark" ? lightText : darkText
  const icon = theme === "dark" ? lightIcon : darkIcon
  return (
    <li id={id} className={className} onClick={onClick}>
      <i className="material-icons">{icon}</i>
      <span>{text}</span>
    </li>
  )
}
function toggleTheme(ele: HTMLElement, darkText: string, darkIcon: string, lightText: string, lightIcon: string) {
  const body = document.getElementById("sysBody")
  if (body) {
    const parent = body.parentElement
    if (parent) {
      const light = parent.classList.toggle("dark")
      if (ele) {
        if (ele.nodeName !== "LI") {
          ele = ele.parentElement as HTMLElement
        }
        const text = light ? lightText : darkText
        const icon = light ? lightIcon : darkIcon
        const i = ele.querySelector("i")
        if (i) {
          i.innerText = icon
        }
        const span = ele.querySelector("span")
        if (span) {
          span.innerHTML = text
        }
      }
    }
  }
}

interface SidebarProps {
  id?: string
  mode?: "sidebar" | "menu" | undefined | null
  className?: string
  sidebarText: string
  sidebarIcon: string
  menuText: string
  menuIcon: string
}

export function ToggleSidebar({ id, mode, className, sidebarText, sidebarIcon, menuText, menuIcon }: SidebarProps) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    toggleSidebar(e.target as HTMLButtonElement, sidebarText, sidebarIcon, menuText, menuIcon)
  }
  const text = mode === "sidebar" ? menuText : sidebarText
  const icon = mode === "sidebar" ? menuIcon : sidebarIcon
  return (
    <li id={id} className={className} onClick={onClick}>
      <i className="material-icons">{icon}</i>
      <span>{text}</span>
    </li>
  )
}
function toggleSidebar(ele: HTMLElement, darkText: string, darkIcon: string, lightText: string, lightIcon: string) {
  const body = document.getElementById("sysBody")
  if (body) {
    const menu = body.classList.toggle("top-menu")
    if (ele) {
      if (ele.nodeName !== "LI") {
        ele = ele.parentElement as HTMLElement
      }
      const text = menu ? darkText : lightText
      const icon = menu ? darkIcon : lightIcon
      const i = ele.querySelector("i")
      if (i) {
        i.innerText = icon
      }
      const span = ele.querySelector("span")
      if (span) {
        span.innerHTML = text
      }
    }
  }
}
