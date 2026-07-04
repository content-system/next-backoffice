import { Nav } from "@components/nav"
import { getCurrentUser } from "@lib/account"
import { getMenu } from "@lib/menu"
import { getResource } from "@resources"
import { MenuItem } from "web-one"
import { ClientLayout } from "./client"
import PageHeader from "./page-header"

export default async function LayoutPage({ lang, children }: { lang: string; children: React.ReactNode }) {
  const resource = getResource(lang)
  let items: MenuItem[] = []
  const account = await getCurrentUser()
  if (account) {
    items = await getMenu(account.id)
  }
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
