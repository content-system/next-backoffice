"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

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
