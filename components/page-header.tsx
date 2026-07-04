import Link from "next/link"
import { StringMap } from "onecore"
import { ToggleMenu, ToggleUniversalSearch } from "./client"
import { ToggleSidebar, ToggleTheme } from "./menu"

export interface Props {
  resource: StringMap
}

export default async function PageHeader({ resource }: Props) {
  return (
    <div className="page-header">
      <form>
        <div className="search-group">
          <section>
            <ToggleMenu className="toggle-menu" />
            <ToggleUniversalSearch className="toggle-search" />
            <ToggleUniversalSearch className="close-search" />
          </section>
          <div className="logo-wrapper">
            <img className="logo" src="../logo192.png" alt="Logo of The Company" />
          </div>
          <label className="search-input">
            <input type="text" id="q" name="q" maxLength={80} placeholder={resource.keyword} autoComplete="off" />
            <button type="button" hidden className="btn-remove-text"></button>
            <button type="button" className="btn-search"></button>
          </label>
          <section className="quick-nav">
            <div className="dropdown-menu-profile">
              <i className="material-icons">person</i>
              <ul id="dropdown-basic" className="dropdown-content-profile">
                <ToggleSidebar
                  className="menu"
                  mode="sidebar"
                  sidebarText={resource.sidebar}
                  sidebarIcon="view_list"
                  menuText={resource.menu}
                  menuIcon="credit_card"
                />
                <hr />
                <ToggleTheme
                  theme="light"
                  darkText={resource.dark_mode}
                  darkIcon="timelapse"
                  lightText={resource.light_mode}
                  lightIcon="radio_button_checked"
                />
                <hr />
                <li>
                  <i className="material-icons">account_circle</i>
                  <Link href="/settings">kaka</Link>
                </li>
                <hr />
                <li>
                  <i className="material-icons">exit_to_app</i>
                  <button>Sign out</button>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}
