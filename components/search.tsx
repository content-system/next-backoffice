import { ButtonQ, InputQ, ToggleSearch } from "./client"
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
  clearClass?: string
}

export default function Search({ id, name, className, limit, limits, limitSearch, defaultValue, value, maxLength, placeholder, clearClass }: Props) {
  const clearQClass = clearClass ? clearClass : "btn-remove-text"
  return (
    <label className={className}>
      <Limit id="limitBtn" className="limit" text={limit} search={limitSearch} items={limits} dropDownId="limitDropdown" />
      <InputQ id={id} name={name} defaultValue={defaultValue} value={value} maxLength={maxLength} placeholder={placeholder} targetClass={clearQClass} />
      <ButtonQ type="button" id="clearQBtn" name="clearQBtn" className={clearQClass} targetName="q" />
      <ToggleSearch id="toggleSearchBtn" className="btn-filter" />
      <button type="submit" id="searchBtn" className="btn-search" />
    </label>
  )
}
