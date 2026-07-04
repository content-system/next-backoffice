import Link from "next/link"
import { SearchLink, ToggleDropdown } from "./client"

interface SortProps {
  id?: string
  className?: string
  href: string
  text?: string
  type?: "+" | "-"
}

export function SortLink(props: SortProps) {
  return (
    <Link id={props.id} className={props.className} href={props.href} prefetch={false}>
      {props.text}
      {props.type && (props.type === "+" ? <i className="sort-up"></i> : <i className="sort-down"></i>)}
    </Link>
  )
}

export interface Item {
  id?: string
  value: string
  text?: string
}
interface Props {
  items: Item[]
  text?: string
  id?: string
  className?: string
  dropDownId?: string
  dropdownClass?: string
  parentClass?: string
}
export function Sort(props: Props) {
  const parentClass = props.parentClass ? props.parentClass : "sort"
  const dropdownClass = props.dropdownClass ? props.dropdownClass : "dropdown"
  return (
    <div className={props.className}>
      <ToggleDropdown id={props.id} className="btn-sort">
        {props.text}
      </ToggleDropdown>
      <div id={props.dropDownId} className={dropdownClass}>
        {props.items &&
          props.items.map((item, i) => {
            return (
              <SearchLink key={item.value} id={item.id} href={item.value} parentClass={parentClass}>
                {item.text}
              </SearchLink>
            )
          })}
      </div>
    </div>
  )
}
