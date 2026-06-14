'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";

export function ClientLayout({ nav, header, children }: { nav: ReactNode; header: ReactNode; children: ReactNode }) {
  const pathname = usePathname()
  const showNav = !pathname.endsWith("/login")
  if (!showNav) {
    return <>{children}</>
  }
  return (
    <div id="root">
      <div className="sidebar-parent menu-on">
        {nav}
        <div className="page-container">
          {header}
          <div id="pageBody" className="page-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function RelativeLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname && pathname.startsWith(href);
  if (className) {
    return <Link href={href} prefetch={false} className={isActive ? className + " active" : className} >{children}</Link>
  } else {
    return <Link href={href} prefetch={false} className={isActive ? "active" : ""} >{children}</Link>
  }
}
export function ClientLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  if (className) {
    return <Link href={href} prefetch={false} className={isActive ? className + " active" : className}>{children}</Link>
  } else {
    return <Link href={href} prefetch={false} className={isActive ? "active" : ""} > {children} </Link>
  }
}
export function ClientNav({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <li className={isActive ? "active" : ""}>{children}</li>
  )
}

export function SubList({ children }: { children: ReactNode }) {
  return (
    <div className="menu-item" onClick={e => toggleMenuItem(e.target as HTMLElement)}>{children}</div>
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
        /*
        if (resources.autoCollapse) {
          const nav = findParentNode(target, "NAV")
          if (nav) {
            const items = nav.querySelectorAll(".open")
            const l = items.length
            for (let i = 0; i < l; i++) {
              const item = items[i] as HTMLElement
              if (item) {
                item.classList.remove("open")
                const nu10 = item.querySelector(".expanded")
                if (nu10) {
                  nu10.classList.remove("expanded")
                }
                const el2 = item.querySelector(".entity-icon")
                if (el2) {
                  el2.classList.add("up")
                  el2.classList.remove("down")
                }
              }
            }
          }
        }
          */
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
function findParent(e: HTMLElement | null | undefined, className: string): HTMLElement | null {
  if (!e) {
    return null
  }
  let p: HTMLElement | null = e
  while (true) {
    p = p.parentElement
    if (!p) {
      return null
    }
    if (p.classList.contains(className)) {
      return p
    }
  }
}

interface Props {
  id?: string
  name?: string
  className?: string
  children?: ReactNode
}
export default function BackButton({ id, name, className, children }: Props) {
  const router = useRouter();
  return (
    <button type="button" id={id} name={name} className={className} onClick={() => router.back()}>
      {children}
    </button>
  );
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

interface SearchProps {
  id?: string
  name?: string
  className?: string
  children?: ReactNode
  targetClass?: string
}
export function ToggleSearch({ id, name, className, children, targetClass }: SearchProps) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const target = e.target as HTMLButtonElement

    if (target) {
      const form = target.form
      if (form) {
        const tc = targetClass ? targetClass : ".advance-search"
        const advanceSearch = form.querySelector(tc) as HTMLElement
        if (advanceSearch) {
          const onStatus = target.classList.toggle("on")
          advanceSearch.hidden = !onStatus
        }
      }
    }
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

export function ToggleUniversalSearch({ id, name, className, children }: Props) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const p = findParent(e.target as HTMLElement, "sidebar-parent")
    if (p) {
      p.classList.toggle("search")
    }
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}