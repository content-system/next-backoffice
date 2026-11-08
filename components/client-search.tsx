"use client"

import { ChangeEvent, MouseEvent, ReactNode } from "react"

interface SearchProps {
  id?: string
  name?: string
  className?: string
  children?: ReactNode
  targetClass?: string
}
export function ToggleSearch({ id, name, className, children, targetClass }: SearchProps) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const target = e.target as HTMLButtonElement

    if (target) {
      const form = target.form
      if (form) {
        const tc = targetClass ? targetClass : ".advance-search"
        const advanceSearch = form.querySelector(tc) as HTMLElement
        if (advanceSearch) {
          const onStatus = target.classList.toggle("on")
          advanceSearch.hidden = !onStatus
        }
      }
    }
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

export function qOnChange(e: ChangeEvent<HTMLInputElement>, targetClass?: string) {
  const target = e.target
  if (target && target.form) {
    const clazz = targetClass ? targetClass : ".btn-remove-text"
    const btn = target.form.querySelector(clazz) as HTMLButtonElement
    if (btn) {
      btn.hidden = !(target.value.length > 0)
    }
  }
}
interface QProps {
  id?: string
  name?: string
  className?: string
  defaultValue?: string
  value?: string
  maxLength?: number
  placeholder?: string
  targetClass?: string
}
export function InputQ({ id, name, className, defaultValue, value, maxLength, placeholder, targetClass }: QProps) {
  return (
    <input
      type="text"
      id={id}
      name={name}
      className={className}
      defaultValue={defaultValue}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => qOnChange(e, targetClass)}
    />
  )
}

export function getElement(form: HTMLFormElement | undefined | null, name: string): Element | null {
  if (form) {
    const l = form.length
    for (let i = 0; i < l; i++) {
      const e = form[i]
      if (e.getAttribute("name") === name) {
        return e
      }
    }
  }
  return null
}
export function clearText(btn: HTMLButtonElement, name?: string) {
  const n = name && name.length > 0 ? name : "q"
  const q = getElement(btn.form, n) as HTMLInputElement
  if (q) {
    btn.hidden = true
    q.value = ""
  }
}
interface QButtonProps {
  type?: "button" | "submit" | "reset"
  id?: string
  name?: string
  className?: string
  children?: ReactNode
  targetName?: string
}
export function ButtonQ({ id, name, className, children, targetName }: QButtonProps) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const btn = e.target as HTMLButtonElement
    if (btn) {
      const target = targetName ? targetName : "q"
      clearText(btn, target)
    }
  }
  return (
    <button type="button" id={id} name={name} hidden className={className} onClick={onClick}>
      {children}
    </button>
  )
}
