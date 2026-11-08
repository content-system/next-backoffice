"use client"

import { FocusEvent, KeyboardEvent } from "react"
import {
  addErrorMessage,
  addRequiredError,
  checkMax,
  checkMin,
  getDecimalSeparator,
  getIntegerError,
  getLabel,
  normalizeInteger,
  normalizeNumber,
  removeError,
  removeSeparators,
} from "./client-script"
import { formatText } from "./format-text"
import { digitKeyDown, integerKeyDown, numberKeyDown } from "./number-client"
import { materialOnBlur, materialOnFocus } from "./react-material"

export function formatInteger(v: number | null | undefined, groupSeparator: string = ","): string {
  if (v == null || !Number.isFinite(v)) {
    return ""
  }

  const isNegative = v < 0
  let n = Math.abs(Math.trunc(v))

  // Fast path
  if (n < 1000) {
    return isNegative ? `-${n}` : `${n}`
  }

  // Max length:
  // digits (up to 16 for JS safe int) + separators (~5) + sign
  const buffer = new Array(32)
  let i = buffer.length

  let digitCount = 0

  while (n > 0) {
    // Insert separator every 3 digits
    if (digitCount > 0 && digitCount % 3 === 0) {
      buffer[--i] = groupSeparator
    }

    const digit = n % 10
    buffer[--i] = String.fromCharCode(48 + digit)

    n = Math.floor(n / 10) // safe version
    digitCount++
  }

  if (isNegative) {
    buffer[--i] = "-"
  }

  // Slice only used portion and join once
  return buffer.slice(i).join("")
}

export function formatNumber(v?: number | null, precision = 0, decimalSeparator?: string | null, groupSeparator?: string | null): string {
  if (v == null || !Number.isFinite(v)) {
    return ""
  }
  let d = "."
  let g = ","
  if (decimalSeparator && groupSeparator) {
    d = decimalSeparator
    g = groupSeparator
  } else if (decimalSeparator && !groupSeparator) {
    d = decimalSeparator
    if (d === "٫") {
      g = "٬"
    } else {
      g = d === "," ? "." : ","
    }
  }
  const negative = v < 0

  // unavoidable allocation
  const s = precision < 0 ? Math.abs(v).toString() : Math.abs(v).toFixed(precision)

  const dot = s.indexOf(".")

  const intEnd = dot >= 0 ? dot : s.length
  const fracLen = dot >= 0 ? s.length - dot - 1 : 0

  const intLen = intEnd
  const groups = intLen > 3 ? ((intLen - 1) / 3) | 0 : 0

  const outLen = (negative ? 1 : 0) + intLen + groups * g.length + (fracLen > 0 ? d.length + fracLen : 0)

  const out = new Array<string>(outLen)

  let p = 0

  if (negative) {
    out[p++] = "-"
  }

  // integer part
  let firstGroup = intLen % 3
  if (firstGroup === 0) {
    firstGroup = 3
  }

  for (let i = 0; i < intLen; i++) {
    if (i > 0 && (i === firstGroup || (i > firstGroup && (i - firstGroup) % 3 === 0))) {
      for (let j = 0; j < g.length; j++) {
        out[p++] = g[j]
      }
    }

    out[p++] = s[i]
  }

  // fractional part
  if (fracLen > 0) {
    for (let j = 0; j < d.length; j++) {
      out[p++] = d[j]
    }

    for (let i = dot + 1; i < s.length; i++) {
      out[p++] = s[i]
    }
  }

  return out.join("")
}

export function getDecimals(ele: HTMLInputElement): number {
  let decimals = ele.getAttribute("data-decimals")
  if (!decimals) {
    const form = ele.form
    if (form) {
      decimals = form.getAttribute("data-decimals")
    }
  }
  if (!decimals || isNaN(decimals as any)) {
    return -1
  }
  return parseFloat(decimals)
}

export function getGroupSeparator(ele: HTMLInputElement): string | null | undefined {
  let separator = ele.getAttribute("data-group-separator")
  if (!separator) {
    const form = ele.form
    if (form) {
      separator = form.getAttribute("data-group-separator")
    }
  }
  return separator
}

export function digitOnKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (!digitKeyDown(e.nativeEvent)) {
    e.preventDefault()
  }
}
export function integerOnKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (!integerKeyDown(e.nativeEvent)) {
    e.preventDefault()
  }
}
export function numberOnKeyDown(e: KeyboardEvent<HTMLInputElement>, decimalSeparator?: "." | "," | "٫") {
  if (!numberKeyDown(e.nativeEvent, decimalSeparator)) {
    e.preventDefault()
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
