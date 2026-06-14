import Link from "next/link"
import { StringMap } from "onecore"
import { ClientNav, SubList, ToggleMenu } from "./client"

export interface Props {
  items: MenuItem[]
  resource?: StringMap
}
export interface MenuItem {
  id: string
  name: string
  path: string
  resource?: string
  icon?: string
  children?: MenuItem[]
}
export function getName(name: string, key?: string, resource?: StringMap): string {
  if (!resource || !key) {
    return name
  }
  return resource[key] || name
}

export function Nav(props: Props) {
  return (
    <nav id="sysNav" className="expanded-all">
      <ul>
        <li>
          <p className="sidebar-off-menu"><ToggleMenu className="toggle" /></p>
        </li>
        {props.items.map((m) =>
          m.children && m.children.length > 0 ? (
            <li className="open" key={m.id}>
              <SubList>
                <i className="material-icons">{m.icon}</i>
                <span>
                  {getName(m.name, m.resource, props.resource)}
                </span>
                <i className="entity-icon down"></i>
              </SubList>
              <ul className="sub-list expanded">
                {m.children.map((s) => (
                  <ClientNav key={s.path} href={s.path}>
                    <Link href={s.path} className="menu-item" prefetch={false}>
                      <i className="material-icons">{s.icon}</i>
                      <span>
                        {getName(s.name, s.resource, props.resource)}
                      </span>
                    </Link>
                  </ClientNav>
                ))}
              </ul>
            </li>
          ) : (
            <ClientNav key={m.path} href={m.path}>
              <Link href={m.path} className="menu-item" prefetch={false}>
                <i className="material-icons">{m.icon}</i>
                <span>
                  {getName(m.name, m.resource, props.resource)}
                </span>
              </Link>
            </ClientNav>
          )
        )}
      </ul>
    </nav>
  )
}
