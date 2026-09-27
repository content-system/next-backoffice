import { Nav } from "@components/nav"
import { getCurrentUser } from "@lib/account"
import { getMenu } from "@lib/menu"
import { getDefaultLang, getResource } from "@resources"
import { headers } from "next/headers"
import { MenuItem, rebuildPath } from "web-one"
import { ClientLayout } from "./client"
import PageHeader from "./page-header"

export default async function LayoutPage({ children }: { children: React.ReactNode }) {
  let items: MenuItem[] = []
  const account = await getCurrentUser()
  let lang: string | undefined
  if (account) {
    lang = account.language
    items = await getMenu(account.id)
  }
  if (!lang) {
    const defaultLang = getDefaultLang()
    const headerList = await headers()
    const language = headerList.get("x-language")
    lang = language ? language : defaultLang
    if (language && language !== defaultLang) {
      rebuildPath(items, lang)
    }
  }
  const resource = getResource(lang)
  const pageHeader = <PageHeader resource={resource} />
  const nav = (
    <>
      <div className="top-banner">
        <div className="logo-banner-wrapper">
          <img
            src="https://fptsoftware.com/-/media/project/fpt-software/fso/industries/industries-healthcare/healthcare-lp_banner.png"
            alt="Banner of The Company"
          />
          <img
            src="https://fptsoftware.com/-/media/project/fpt-software/fso/industries/banner/media-desktop.webp"
            className="banner-logo-title"
            alt="Logo of The Company"
          />
        </div>
      </div>
      <div className="menu sidebar">
        <Nav items={items} resource={resource} />
      </div>
    </>
  )
  return (
    <ClientLayout nav={nav} header={pageHeader}>
      {children}
    </ClientLayout>
  )
}
