"use client"

import { FocusEvent, FocusEventHandler, MouseEvent, ReactNode } from "react"
import {
  addClass,
  addErrorMessage,
  addRequiredError,
  checkMax,
  checkMin,
  decode,
  formatInteger,
  formatNumber,
  formatText,
  getContainer,
  getDecimals,
  getDecimalSeparator,
  getGroupSeparator,
  getIntegerError,
  getLabel,
  getRequiredError,
  isValidPattern,
  normalizeInteger,
  normalizeNumber,
  normalizePhone,
  removeClasses,
  removeError,
  removeSeparators,
  showFormError,
  validateForm,
} from "./client-script"

interface SubmitProps {
  id?: string
  type: "button" | "submit"
  name?: string
  className?: string
  children?: ReactNode
  api: string
}

export function SubmitButton({ type, id, name, className, children, api }: SubmitProps) {
  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const target = e.target as HTMLButtonElement
    const form = target.form

    if (form) {
      const valid = validateForm(form)
      if (!valid) {
        e.preventDefault()
      } else {
        const body = decode(form)
        console.log("submit body" + JSON.stringify(body))

        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          alert("Save successfully")
        } else {
          if (res.status === 422) {
            const data = await res.json()
            console.log(JSON.stringify(data))
            if (Array.isArray(data)) {
              showFormError(form, data)
            } else {
              alert("Data validation failed at server")
            }
          }
        }
      }
    } else {
      e.preventDefault()
    }
  }

  return (
    <button type={type} id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

interface Props {
  type?: string
  id?: string
  name?: string
  step?: string | number
  dataType?: string
  className?: string
  pattern?: string
  defaultValue?: string | number
  value?: string | number
  placeholder?: string
  required?: boolean
  requiredError?: string
  error?: string
  maxLength?: number
  min?: string | number
  max?: string | number
  readOnly?: boolean
  children?: ReactNode
  onFocus?: FocusEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
}
export function Input({
  type,
  id,
  name,
  step,
  dataType,
  className,
  defaultValue,
  value,
  placeholder,
  required,
  requiredError,
  pattern,
  error,
  maxLength,
  min,
  max,
  readOnly,
  children,
  onBlur,
  onFocus,
}: Props) {
  const onFocusFn = onFocus ? onFocus : materialOnFocus
  const onBlurFn = onBlur ? onBlur : (e: FocusEvent<HTMLInputElement>) => checkOnBlur(e, required, requiredError, pattern, error)
  return (
    <input
      type={type}
      id={id}
      name={name}
      step={step}
      className={className}
      pattern={pattern}
      data-type={dataType}
      data-error={error}
      data-required-error={requiredError}
      defaultValue={defaultValue}
      value={value}
      maxLength={maxLength}
      min={min}
      max={max}
      readOnly={readOnly}
      required={required}
      placeholder={placeholder}
      onFocus={onFocusFn}
      onBlur={onBlurFn}
    >
      {children}
    </input>
  )
}

export function checkOnBlur(e: FocusEvent<HTMLInputElement>, required?: boolean, requiredError?: string, patern?: string, paternError?: string) {
  materialOnBlur(e)
  const input = e.target
  removeError(input)
  if (required) {
    checkRequiredAndPatern(e, requiredError, patern, paternError)
  } else {
    if (patern) {
      if (!isValidPattern(input.value, patern)) {
        const error = paternError ? paternError : "Pattern Error"
        addErrorMessage(input, error)
        return
      }
    }
    removeError(input)
  }
}
export function checkRequiredAndPatern(e: FocusEvent<HTMLInputElement>, msg?: string, patern?: string, paternError?: string) {
  materialOnBlur(e)
  const input = e.target as HTMLInputElement
  removeError(input)
  if (input.value === "") {
    if (msg) {
      addErrorMessage(input, msg)
    } else {
      const requiredFormat = getRequiredError(input)
      const label = getLabel(input)
      msg = formatText(requiredFormat, label)
      addErrorMessage(input, msg)
    }
  } else {
    if (patern) {
      if (!isValidPattern(input.value, patern)) {
        const error = paternError ? paternError : "Format Error"
        addErrorMessage(input, error)
        return
      }
    }
    removeError(input)
  }
}

export function integerOnFocus(e: FocusEvent<HTMLInputElement>) {
  materialOnFocus(e)
  const v = normalizeInteger(e.target.value)
  if (e.target.value !== v) {
    e.target.value = v
  }
}
export function integerOnBlur(e: FocusEvent<HTMLInputElement>) {
  validateIntegerOnBlur(e)
}
export function integerOnBlurAndFormat(e: FocusEvent<HTMLInputElement>) {
  const ele = e.currentTarget as HTMLInputElement
  const groupSeparator = getGroupSeparator(ele)
  validateIntegerOnBlur(e, groupSeparator)
}
export function validateIntegerOnBlur(e: FocusEvent<HTMLInputElement>, groupSeparator?: string | null) {
  materialOnBlur(e)
  removeError(e.target)
  const ele = e.currentTarget as HTMLInputElement
  const label = getLabel(ele)
  if (ele.required && !ele.value) {
    return addRequiredError(ele, label)
  }
  if (ele.value) {
    const n0 = normalizeInteger(ele.value)
    if (isNaN(n0 as any)) {
      const errorFormat = getIntegerError(ele)
      const msg = formatText(errorFormat, label)
      addErrorMessage(ele, msg)
    } else {
      const n = parseFloat(n0)
      checkMin(ele, label, n)
      checkMax(ele, label, n)
      const format = groupSeparator ? formatInteger(n, groupSeparator) : n.toString()
      if (ele.value !== format) {
        ele.value = format
      }
    }
  }
}
export function numberOnFocus(e: FocusEvent<HTMLInputElement>) {
  materialOnFocus(e)
  const decimalSeparator = getDecimalSeparator(e.target)
  const v = e.target.value
  const n = decimalSeparator === "," || decimalSeparator === "٫" ? normalizeNumber(v) : removeSeparators(v)
  if (e.target.value !== n) {
    e.target.value = n
  }
}
export function numberOnBlur(e: FocusEvent<HTMLInputElement>) {
  materialOnBlur(e)
  removeError(e.target)
  const ele = e.currentTarget as HTMLInputElement
  const label = getLabel(ele)
  if (ele.required && !ele.value) {
    return addRequiredError(ele, label)
  }
  if (ele.value) {
    const decimalSeparator = getDecimalSeparator(ele)
    const n0 = decimalSeparator === "," || decimalSeparator === "٫" ? normalizeNumber(ele.value) : removeSeparators(ele.value)
    if (isNaN(n0 as any)) {
      const errorFormat = getIntegerError(ele)
      const msg = formatText(errorFormat, label)
      addErrorMessage(ele, msg)
    } else {
      const n = parseFloat(n0)
      checkMin(ele, label, n)
      checkMax(ele, label, n)
      const decimals = getDecimals(ele)
      let format = decimals < 0 ? n.toString() : n.toFixed()
      if (decimalSeparator === "," || decimalSeparator === "٫") {
        format = format.replace(decimalSeparator, ".")
      }
      if (ele.value !== format) {
        ele.value = format
      }
    }
  }
}
export function numberOnBlurAndFormat(e: FocusEvent<HTMLInputElement>) {
  materialOnBlur(e)
  removeError(e.target)
  const ele = e.currentTarget as HTMLInputElement
  const label = getLabel(ele)
  if (ele.required && !ele.value) {
    return addRequiredError(ele, label)
  }
  if (ele.value) {
    const decimalSeparator = getDecimalSeparator(ele)
    const n0 = decimalSeparator === "," || decimalSeparator === "٫" ? normalizeNumber(ele.value) : removeSeparators(ele.value)
    if (isNaN(n0 as any)) {
      const errorFormat = getIntegerError(ele)
      const msg = formatText(errorFormat, label)
      addErrorMessage(ele, msg)
    } else {
      const n = parseFloat(n0)
      checkMin(ele, label, n)
      checkMax(ele, label, n)
      const decimals = getDecimals(ele)
      const groupSeparator = getGroupSeparator(ele)
      const format = formatNumber(n, decimals, decimalSeparator, groupSeparator)
      if (ele.value !== format) {
        ele.value = format
      }
    }
  }
}
export function phoneOnFocus(e: FocusEvent<HTMLInputElement>) {
  const v = normalizePhone(e.target.value)
  if (e.target.value !== v) {
    e.target.value = v
  }
}
export function phoneOnBlur(e: FocusEvent<HTMLInputElement>) {}
export function inputOnFocus(e: FocusEvent<HTMLInputElement>) {
  removeError(e.target)
}
export function requiredOnFocus(e: FocusEvent<HTMLInputElement>) {
  materialOnFocus(e)
  removeError(e.target)
}
export function materialOnFocus(e: FocusEvent<HTMLInputElement>) {
  const ele = e.currentTarget as HTMLInputElement
  if (ele.disabled || ele.readOnly) {
    return
  }
  setTimeout(() => {
    if (ele.nodeName === "INPUT" || ele.nodeName === "SELECT" || ele.nodeName === "TEXTAREA") {
      addClass(getContainer(ele), "focused")
    }
  }, 0)
}
export function materialOnBlur(e: FocusEvent<HTMLInputElement>): void {
  const ele = e.currentTarget as HTMLInputElement
  setTimeout(() => {
    if (ele.nodeName === "INPUT" || ele.nodeName === "SELECT" || ele.nodeName === "TEXTAREA") {
      removeClasses(getContainer(ele), ["focused", "focus"])
    }
  }, 0)
}
