"use client"

import { useRouter } from "next/navigation"
import { FocusEvent, FocusEventHandler, KeyboardEvent, MouseEvent, ReactNode } from "react"
import { addErrorMessage, decode, getLabel, getRequiredError, isValidPattern, normalizePhone, removeError, showFormError, validateForm } from "./client-script"
import { formatText } from "./format-text"
import { materialOnBlur, materialOnFocus } from "./react-material"
import { alertError, hideLoading, showConfirm, showLoading, toast } from "./ui"

interface SubmitProps {
  id?: string
  type: "button" | "submit"
  name?: string
  className?: string
  children?: ReactNode
  api: string
  confirmHeader: string
  confirmMessage: string
  successMessage: string
  errorHeader: string
  networkError: string
  parsingError: string
  conflictError: string
  goneError: string
  forbiddenError: string
  successUrl?: string
}

export function SubmitButton({
  type,
  id,
  name,
  className,
  children,
  api,
  confirmHeader,
  confirmMessage,
  successMessage,
  errorHeader,
  networkError,
  parsingError,
  conflictError,
  goneError,
  forbiddenError,
  successUrl,
}: SubmitProps) {
  const router = useRouter()
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
        showConfirm(confirmMessage, confirmHeader, () => {
          showLoading()
          fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
            .then((res) => {
              if (res.ok) {
                toast(successMessage)
                if (successUrl) {
                  if (successUrl === "back") {
                    router.back()
                  } else {
                    router.push(successUrl)
                  }
                }
              } else {
                if (res.status === 422) {
                  res
                    .json()
                    .then((data) => {
                      console.log(JSON.stringify(data))
                      if (Array.isArray(data)) {
                        showFormError(form, data)
                      }
                    })
                    .catch((err) => alertError(parsingError, errorHeader))
                } else if (res.status === 409) {
                  alertError(conflictError, errorHeader)
                } else if (res.status === 410) {
                  alertError(goneError, errorHeader)
                } else if (res.status === 403) {
                  alertError(forbiddenError, errorHeader)
                }
              }
            })
            .catch((err) => alertError(networkError, errorHeader))
            .finally(() => {
              hideLoading()
            })
        })
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
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
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
  onKeyDown,
}: Props) {
  const onFocusFn = onFocus ? onFocus : materialOnFocus
  const onBlurFn = onBlur ? onBlur : (e: FocusEvent<HTMLInputElement>) => checkOnBlur(e, required, requiredError, pattern, error)
  const onKeyDownFn = onKeyDown ? onKeyDown : (e: KeyboardEvent<HTMLInputElement>) => {}
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
      onKeyDown={onKeyDownFn}
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
