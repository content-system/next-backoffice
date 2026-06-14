import { SearchLink, ToggleDropdown } from "./client"

interface Props {
  search?: string
  field?: string
  items: number[]
  text: number
  id?: string
  className?: string
  dropDownId?: string
  dropdownClass?: string
  parentClass?: string
}
export function Limit(props: Props) {
  const field = props.field ? props.field : "limit"
  const prefix = props.search ? `?${props.search}&` : "?"
  const parentClass = props.parentClass ? props.parentClass : "limit"
  const dropdownClass = props.dropdownClass ? props.dropdownClass : "dropdown"
  return (
    <div className={props.className}>
      <ToggleDropdown id={props.id} className="btn-limit">
        {props.text}
      </ToggleDropdown>
      <div id={props.dropDownId} className={dropdownClass}>
        {props.items &&
          props.items.map((item, i) => {
            return (
              <SearchLink key={item.toString()} href={`${prefix}${field}=${item}`} parentClass={parentClass}>{item}</SearchLink>
            )
          })}
      </div>
    </div>
  )
}
