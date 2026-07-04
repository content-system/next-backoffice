import { ToggleSearch } from "./client"
import { Limit } from "./limit"

interface Props {
  id?: string
  name?: string
  className?: string
  limit: number
  limits: number[]
  defaultValue?: string
  value?: string
  maxLength?: number
  limitSearch?: string
  placeholder?: string
}
export default function Search({ id, name, className, limit, limits, limitSearch, defaultValue, value, maxLength, placeholder }: Props) {
  return (
    <label className={className}>
      <Limit id="limitBtn" className="limit" text={limit} search={limitSearch} items={limits} dropDownId="limitDropdown" />
      <input type="text" id={id} name={name} defaultValue={defaultValue} value={value} maxLength={maxLength} placeholder={placeholder} />
      <ToggleSearch id="toggleSearchBtn" className="btn-filter" />
      <button type="submit" id="searchBtn" className="btn-search" />
    </label>
  )
}
