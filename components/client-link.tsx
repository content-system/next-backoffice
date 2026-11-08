"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export function ClientLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  if (className) {
    return (
      <Link href={href} prefetch={false} className={isActive ? className + " active" : className}>
        {children}
      </Link>
    )
  } else {
    return (
      <Link href={href} prefetch={false} className={isActive ? "active" : ""}>
        {" "}
        {children}{" "}
      </Link>
    )
  }
}
