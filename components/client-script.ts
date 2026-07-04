export function findParent(e: HTMLElement | null | undefined, className: string, nodeName?: string): HTMLElement | null {
  if (!e) {
    return null
  }
  if (nodeName && e.nodeName === nodeName) {
    return e
  }
  let p: HTMLElement | null = e
  while (true) {
    p = p.parentElement
    if (!p) {
      return null
    }
    if (p.classList.contains(className)) {
      return p
    }
    if (nodeName && p.nodeName === nodeName) {
      return p
    }
  }
}
export function getContainer(ele?: HTMLElement | null): HTMLElement | null {
  return findParent(ele, "form-input", "LABEL")
}
export function getLabel(ele?: HTMLElement | null): string {
  if (!ele) {
    return ""
  }
  let l = ele.getAttribute("data-label")
  if (l) {
    return l
  }
  const parent = getContainer(ele)
  if (parent) {
    if (parent.nodeName === "LABEL") {
      const first = parent.childNodes[0]
      if (first.nodeType === 3) {
        return first.nodeValue ? first.nodeValue : ""
      }
    } else {
      const firstChild = parent.firstChild
      if (firstChild && firstChild.nodeName === "LABEL") {
        return (firstChild as HTMLLabelElement).innerHTML
      }
    }
  }
  return ""
}

export function toggleClass(e: HTMLElement | null | undefined, className: string): boolean {
  if (e) {
    if (e.classList.contains(className)) {
      e.classList.remove(className)
      return false
    } else {
      e.classList.add(className)
      return true
    }
  }
  return false
}
export function addClass(ele: Element | null | undefined, className: string): boolean {
  if (ele) {
    if (!ele.classList.contains(className)) {
      ele.classList.add(className)
      return true
    }
  }
  return false
}
export function addClasses(ele: Element | null | undefined, classes: string[]): number {
  let count = 0
  if (ele) {
    for (let i = 0; i < classes.length; i++) {
      if (addClass(ele, classes[i])) {
        count++
      }
    }
  }
  return count
}
export function removeClass(ele: Element | null | undefined, className: string): boolean {
  if (ele) {
    if (ele && ele.classList.contains(className)) {
      ele.classList.remove(className)
      return true
    }
  }
  return false
}
export function removeClasses(ele: Element | null | undefined, classes: string[]): number {
  let count = 0
  if (ele) {
    for (let i = 0; i < classes.length; i++) {
      if (removeClass(ele, classes[i])) {
        count++
      }
    }
  }
  return count
}

export function addErrorMessage(ele: HTMLElement | null | undefined, msg?: string, directParent?: boolean): void {
  if (!ele) {
    return
  }
  if (!msg) {
    msg = "Error"
  }
  addClass(ele, "invalid")
  // addClass(ele, "ng-touched")
  const parent = directParent ? ele.parentElement : getContainer(ele)
  if (parent === null) {
    return
  }
  addClass(parent, "invalid")

  const span = parent.querySelector(".span-error")

  if (span) {
    if (span.innerHTML !== msg) {
      span.innerHTML = msg
    }
  } else {
    const spanError = document.createElement("span")
    spanError.classList.add("span-error")
    spanError.innerHTML = msg
    parent.appendChild(spanError)
  }
}
const errorArr = ["valid", "invalid", "ng-invalid", "ng-touched"]
export function removeError(ele: HTMLInputElement | null | undefined, directParent?: boolean): void {
  if (!ele) {
    return
  }
  removeClasses(ele, errorArr)
  const parent = directParent ? ele.parentElement : getContainer(ele)
  if (parent) {
    removeClasses(parent, errorArr)
    const span = parent.querySelector(".span-error")
    if (span !== null && span !== undefined) {
      parent.removeChild(span)
    }
  }
}
export function removeErrors(form?: HTMLFormElement | null): void {
  if (form) {
    const len = form.length
    for (let i = 0; i < len; i++) {
      const ele = form[i] as HTMLInputElement
      removeError(ele)
    }
  }
}
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str === ""
}
export function isValidPattern(v: string, pattern: string, flags?: string | null): boolean {
  if (flags === null) {
    flags = undefined
  }
  const p = new RegExp(pattern, flags)
  return p.test(v)
}

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

export function formatText(...args: any[]): string {
  let formatted = args[0]
  if (!formatted || formatted === "") {
    return ""
  }
  if (args.length > 1 && Array.isArray(args[1])) {
    const params = args[1]
    for (let i = 0; i < params.length; i++) {
      const regexp = new RegExp("\\{" + i + "\\}", "gi")
      formatted = formatted.replace(regexp, params[i])
    }
  } else {
    for (let i = 1; i < args.length; i++) {
      const regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi")
      formatted = formatted.replace(regexp, args[i])
    }
  }
  return formatted
}

export function valueOf(obj: any, key: string): any {
  const mapper = key.split(".").map((item) => {
    return item.replace(/\[/g, ".[").replace(/\[|\]/g, "")
  })
  const reSplit = mapper.join(".").split(".")
  return reSplit.reduce((acc, current, index, source) => {
    const value = getDirectValue(acc, current)
    if (!value) {
      source.splice(1)
    }
    return value
  }, obj)
}
export function getDirectValue(obj: any, key: string): any {
  if (obj && obj.hasOwnProperty(key)) {
    return obj[key]
  }
  return null
}
export function setValue(obj: any, key: string, value: any): any {
  let replaceKey = key.replace(/\[/g, ".[").replace(/\.\./g, ".")
  if (replaceKey.indexOf(".") === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length)
  }
  const keys = replaceKey.split(".")
  let firstKey = keys.shift()
  if (!firstKey) {
    return
  }
  const isArrayKey = /\[([0-9]+)\]/.test(firstKey)
  if (keys.length > 0) {
    const firstKeyValue = obj[firstKey] || {}
    const returnValue = setValue(firstKeyValue, keys.join("."), value)
    return setKey(obj, isArrayKey, firstKey, returnValue)
  }
  return setKey(obj, isArrayKey, firstKey, value)
}
export function setKey(_object: any, _isArrayKey: boolean, _key: string, _nextValue: any) {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue
    } else {
      _object.push(_nextValue)
    }
  } else {
    _object[_key] = _nextValue
  }
  return _object
}

export function parseDate(v: string, format?: string): Date {
  if (!format || format.length === 0) {
    format = "MM/DD/YYYY"
  } else {
    format = format.toUpperCase()
  }
  const dateItems = format.split(/\/|\.| |-/)
  const valueItems = v.split(/\/|\.| |-/)
  let imonth = dateItems.indexOf("M")
  let iday = dateItems.indexOf("D")
  let iyear = dateItems.indexOf("YYYY")
  if (imonth === -1) {
    imonth = dateItems.indexOf("MM")
  }
  if (iday === -1) {
    iday = dateItems.indexOf("DD")
  }
  if (iyear === -1) {
    iyear = dateItems.indexOf("YY")
  }
  const month = parseInt(valueItems[imonth], 10) - 1
  let year = parseInt(valueItems[iyear], 10)
  if (year < 100) {
    year += 2000
  }
  const day = parseInt(valueItems[iday], 10)
  return new Date(year, month, day)
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
export function getDecimalSeparator(ele: HTMLInputElement): string {
  let separator = ele.getAttribute("data-decimal-separator")
  if (!separator) {
    const form = ele.form
    if (form) {
      separator = form.getAttribute("data-decimal-separator")
    }
  }
  return separator ? separator : "."
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

export function getChipsByElement(container?: Element | null): string[] {
  if (container) {
    return Array.from(container.querySelectorAll<HTMLElement>(".chip")).map((chip) => {
      const v = chip.getAttribute("data-value")
      return v ? v.trim() : ""
    })
  } else {
    return []
  }
}
export function getChipObjects(container: Element | null | undefined, value: string, text?: string | null, star?: string | null): any[] {
  if (container) {
    return Array.from(container.querySelectorAll<HTMLElement>(".chip")).map((chip) => {
      const obj: any = {}
      const v = chip.getAttribute("data-value")
      obj[value] = v ? v.trim() : ""

      if (text) {
        obj[text] = chip.firstChild?.textContent
      }

      if (star) {
        const i = chip.querySelector("i.star.highlight")
        if (i) {
          obj[star] = true
        }
      }

      return obj
    })
  } else {
    return []
  }
}
export function normalizePhone(s?: string | null): string {
  if (!s) {
    return ""
  }
  const len = s.length
  const buf = new Array<string>(len)
  let j = 0
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i)
    if ((c >= 48 && c <= 57) || c === 43) {
      buf[j++] = s[i]
    }
  }
  return j === len ? buf.join("") : buf.slice(0, j).join("")
}
export function normalizeInteger(s?: string | null): string {
  if (!s) {
    return ""
  }
  const len = s.length
  const buf = new Array<string>(len)
  let j = 0
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i)
    if (c >= 48 && c <= 57) {
      buf[j++] = s[i]
    }
  }
  return j === len ? buf.join("") : buf.slice(0, j).join("")
}

// Keep a single dot
export function removeSeparators(s?: string | null): string {
  if (!s) {
    return ""
  }
  const len = s.length
  const buffer = new Uint16Array(len) // preallocate max possible
  let write = 0

  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i)
    // '0'–'9' (48–57), '.' (46)
    if ((c >= 48 && c <= 57) || c === 46) {
      buffer[write++] = c
    }
  }
  // Convert only the used portion to string
  return String.fromCharCode.apply(null, buffer.subarray(0, write) as any)
}
// Keep digits 0–9 ; Replace , and ٫ (Arabic decimal separator) → . ; Remove everything else => < 100 char: Array<string> version can actually be just as fast or faster due to lower overhead
export function normalizeNumber(s?: string | null): string {
  if (!s) {
    return ""
  }
  const len = s.length
  const buf = new Array<string>(len)
  let j = 0
  for (let i = 0; i < len; i++) {
    const c = s.charCodeAt(i)

    if (c >= 48 && c <= 57) {
      buf[j++] = s[i]
    } else if (c === 44 || c === 1643) {
      buf[j++] = "."
    }
  }
  return j === len ? buf.join("") : buf.slice(0, j).join("")
}
export function decode<T>(form: HTMLFormElement, currencySymbol?: string | null): T {
  const dateFormat = form.getAttribute("data-date-format")
  const obj = {} as T
  const len = form.length
  for (let i = 0; i < len; i++) {
    const ele = form[i] as HTMLInputElement
    let name = ele.getAttribute("name")
    const id = ele.getAttribute("id")
    let val: any
    let isDate = false
    let dataField = ele.getAttribute("data-field")
    if (dataField && dataField.length > 0) {
      name = dataField
    } else if ((!name || name === "") && ele.parentElement && ele.parentElement.classList.contains("DayPickerInput")) {
      if (ele.parentElement.parentElement) {
        dataField = ele.parentElement.parentElement.getAttribute("data-field")
        isDate = true
        name = dataField
      }
    }
    if (isDate === false && ele.getAttribute("data-type") === "date") {
      isDate = true
    }
    if (name != null && name !== "") {
      let nodeName = ele.nodeName
      const type = ele.getAttribute("type")
      if (nodeName === "INPUT" && type !== null) {
        nodeName = type.toUpperCase()
      }
      const datatype = ele.getAttribute("data-type")
      if (nodeName !== "BUTTON" && nodeName !== "RESET" && nodeName !== "SUBMIT" && ele.getAttribute("data-skip") !== "true") {
        switch (type) {
          case "checkbox":
            if (id && name !== id) {
              // obj[name] = !obj[name] ? [] : obj[name];
              val = valueOf(obj, name) // val = obj[name];
              if (!val) {
                val = []
              }
              if (ele.checked) {
                val.push(ele.value)
                // obj[name].push(ele.value);
              } else {
                // tslint:disable-next-line: triple-equals
                val = val.filter((item: string) => item != ele.value)
              }
            } else {
              val = ele.value !== "on" ? ele.value : ele.checked
            }
            setValue(obj, name, val)
            continue
          case "radio":
            if (ele.checked) {
              val = ele.value.length > 0 ? ele.value : ele.checked
              setValue(obj, name, val)
            }
            continue
          case "date":
            val = ele.value.length === 10 ? ele.value : null
            break
          case "datetime-local":
            if (ele.value.length > 0) {
              try {
                val = new Date(ele.value) // DateUtil.parse(ele.value, 'YYYY-MM-DD');
              } catch (err) {
                val = null
              }
            } else {
              val = null
            }
            break
          default:
            if (datatype === "phone") {
              val = normalizePhone(ele.value)
            } else {
              val = ele.value
            }
        }
        if (isDate && dateFormat && dateFormat.length > 0) {
          const d = parseDate(val, dateFormat)
          val = d.toString() === "Invalid Date" ? null : d
        }

        let v = ele.value
        if (datatype === "phone" || datatype === "fax") {
          val = normalizePhone(v)
        } else if (datatype === "integer") {
          const n0 = normalizeInteger(v)
          val = isNaN(n0 as any) ? undefined : parseFloat(v)
        } else if (datatype === "number" || datatype === "currency") {
          const decimalSeparator = getDecimalSeparator(ele)
          const n0 = decimalSeparator === "," || decimalSeparator === "٫" ? normalizeNumber(v) : removeSeparators(v)
          val = isNaN(n0 as any) ? undefined : parseFloat(v)
        }
        setValue(obj, name, val) // obj[name] = val;
      }
    }
  }
  form.querySelectorAll(".chip-list").forEach((divChip) => {
    const name = divChip.getAttribute("data-name")
    if (name && name.length > 0) {
      const dv = divChip.getAttribute("data-value")
      if (dv) {
        const v = getChipObjects(divChip, dv, divChip.getAttribute("data-text"), divChip.getAttribute("data-star"))
        setValue(obj, name, v)
      } else {
        const v = getChipsByElement(divChip)
        setValue(obj, name, v)
      }
    }
  })
  return obj
}

export function getRequiredError(ele: HTMLInputElement | HTMLSelectElement): string {
  const form = ele.form
  let msg: string | null = ""
  if (form) {
    msg = form.getAttribute("data-required-error")
  }
  return msg ? msg : "{0} is required."
}
export function getIntegerError(ele: HTMLInputElement | HTMLSelectElement): string {
  const form = ele.form
  let msg: string | null = ""
  if (form) {
    msg = form.getAttribute("data-integer-error")
  }
  return msg ? msg : "{0} is not a valid integer."
}
export function getNumberError(ele: HTMLInputElement | HTMLSelectElement): string {
  const form = ele.form
  let msg: string | null = ""
  if (form) {
    msg = form.getAttribute("data-number-error")
  }
  return msg ? msg : "{0} is not a valid number."
}
export function getMinError(ele: HTMLInputElement | HTMLSelectElement): string {
  const form = ele.form
  let msg: string | null = ""
  if (form) {
    msg = form.getAttribute("data-min-error")
  }
  return msg ? msg : "{0} must be greater than or equal to {1}."
}
export function getMaxError(ele: HTMLInputElement | HTMLSelectElement): string {
  const form = ele.form
  let msg: string | null = ""
  if (form) {
    msg = form.getAttribute("data-max-error")
  }
  return msg ? msg : "{0} must be less than or equal to {1}."
}
export function addRequiredError(ele: HTMLInputElement | HTMLSelectElement, label: string): string {
  let msg = getRequiredError(ele)
  const errorFormat = getRequiredError(ele)
  msg = formatText(errorFormat, label)
  addErrorMessage(ele, msg)
  return msg
}
export function checkInteger(ele: HTMLInputElement, label: string, normalized: string): string | null | undefined {
  const n0 = normalizeInteger(ele.value)
  if (isNaN(n0 as any)) {
    const errorFormat = getIntegerError(ele)
    const msg = formatText(errorFormat, label)
    addErrorMessage(ele, msg)
    return msg
  } else {
    const n = parseFloat(n0)
    return checkMinMax(ele, label, n)
  }
}
export function checkNumber(ele: HTMLInputElement, label: string): string | null | undefined {
  const decimalSeparator = getDecimalSeparator(ele)
  const n0 = decimalSeparator === "," || decimalSeparator === "٫" ? normalizeNumber(ele.value) : removeSeparators(ele.value)
  if (isNaN(n0 as any)) {
    const errorFormat = getNumberError(ele)
    const msg = formatText(errorFormat, label)
    addErrorMessage(ele, msg)
    return msg
  } else {
    const n = parseFloat(n0)
    return checkMinMax(ele, label, n)
  }
}
export function checkMin(ele: HTMLInputElement, label: string, n: number): string | null | undefined {
  if (ele.min) {
    const min = parseFloat(ele.min)
    if (n < min) {
      const errorFormat = getMinError(ele)
      const msg = formatText(errorFormat, label, ele.min)
      addErrorMessage(ele, msg)
      return msg
    }
  }
  return null
}
export function checkMax(ele: HTMLInputElement, label: string, n: number): string | null | undefined {
  if (ele.max) {
    const max = parseFloat(ele.max)
    if (n > max) {
      const errorFormat = getMaxError(ele)
      const msg = formatText(errorFormat, label, ele.max)
      addErrorMessage(ele, msg)
      return msg
    }
  }
  return null
}
export function checkMinMax(ele: HTMLInputElement, label: string, n: number): string | null | undefined {
  const minError = checkMin(ele, label, n)
  if (minError) {
    return minError
  }
  const maxError = checkMax(ele, label, n)
  if (maxError) {
    return maxError
  }
  return null
}

export function validateElement(ele: HTMLInputElement, includeReadOnly?: boolean): string | null {
  if (!ele) {
    return null
  }

  if (!ele || (ele.readOnly && includeReadOnly === false) || ele.disabled || ele.hidden || ele.style.display === "none") {
    return null
  }
  let nodeName = ele.nodeName
  if (nodeName === "INPUT") {
    const type = ele.getAttribute("type")
    if (type !== null) {
      nodeName = type.toUpperCase()
    }
  }
  if (ele.tagName === "SELECT") {
    nodeName = "SELECT"
  }
  if (nodeName === "BUTTON" || nodeName === "RESET" || nodeName === "SUBMIT") {
    return null
  }

  const parent = getContainer(ele)
  if (parent) {
    if (parent.hidden || parent.style.display === "none") {
      return null
    } else {
      const p = findParent(parent, "SECTION")
      if (p && (p.hidden || p.style.display === "none")) {
        return null
      }
    }
  }

  const label = getLabel(ele)
  if (ele.required && !ele.value) {
    return addRequiredError(ele, label)
  }

  let datatype = ele.getAttribute("data-type")
  if (datatype) {
    if (datatype === "integer") {
      const n0 = normalizeInteger(ele.value)
      const errorMsg = checkInteger(ele, label, n0)
      if (errorMsg) {
        return errorMsg
      }
    } else if (datatype === "number" || datatype === "currency") {
      const errorMsg = checkNumber(ele, label)
      if (errorMsg) {
        return errorMsg
      }
    }
  }

  if (ele.pattern && ele.pattern.length > 0) {
    let flags = ele.getAttribute("data-flags")
    if (!isValidPattern(ele.value, ele.pattern, flags)) {
      let msg = ele.getAttribute("data-error-message")
      if (!msg) {
        msg = "Pattern Error"
      }
      addErrorMessage(ele, msg)
      return msg
    }
  }
  removeError(ele)
  return null
}
export function validateForm(form?: HTMLFormElement, focusFirst?: boolean, scroll?: boolean, includeReadOnly?: boolean): boolean {
  if (!form) {
    return true
  }
  let valid = true
  let errorCtrl: HTMLInputElement | null = null
  let errorShown = false
  const divMessage = form.querySelector(".message")
  const len = form.length
  for (let i = 0; i < len; i++) {
    const ele = form[i] as HTMLInputElement
    let type = ele.getAttribute("type")
    if (type != null) {
      type = type.toLowerCase()
    }
    if (type === "checkbox" || type === "radio" || type === "submit" || type === "button" || type === "reset") {
      continue
    } else {
      const msg = validateElement(ele, includeReadOnly)
      if (msg) {
        if (divMessage && !errorShown) {
          if (!divMessage.classList.contains("alert-error")) {
            divMessage.classList.add("alert-error")
          }
          errorShown = true
          divMessage.innerHTML = msg + '<span onclick="clearMessage(event)"></span>'
        }
        valid = false
        if (!errorCtrl) {
          errorCtrl = ele
        }
      } else {
        removeError(ele)
      }
    }
  }
  if (focusFirst !== false && !focusFirst) {
    focusFirst = true
  }
  if (errorCtrl !== null && focusFirst === true) {
    errorCtrl.focus()
    if (scroll === true) {
      errorCtrl.scrollIntoView()
    }
  }
  return valid
}
export interface ErrorMessage {
  field: string
  code: string
  message?: string
}
export function showFormError(
  form?: HTMLFormElement,
  errors?: ErrorMessage[],
  focusFirst?: boolean,
  directParent?: boolean,
  includeId?: boolean,
): ErrorMessage[] {
  if (!form || !errors || errors.length === 0) {
    return []
  }
  let errorCtrl: HTMLInputElement | null = null
  const errs: ErrorMessage[] = []
  const length = errors.length
  const len = form.length

  for (let i = 0; i < length; i++) {
    let hasControl = false
    for (let j = 0; j < len; j++) {
      const ele = form[j] as HTMLInputElement
      const dataField = ele.getAttribute("data-field")
      if (dataField === errors[i].field || ele.name === errors[i].field) {
        addErrorMessage(ele, errors[i].message, directParent)
        hasControl = true
        if (!errorCtrl) {
          errorCtrl = ele
        }
      }
    }
    if (hasControl === false) {
      if (includeId) {
        const ele = document.getElementById(errors[i].field)
        if (ele) {
          addErrorMessage(ele as HTMLInputElement, errors[i].message, directParent)
        } else {
          errs.push(errors[i])
        }
      } else {
        errs.push(errors[i])
      }
    }
  }
  if (focusFirst !== false) {
    focusFirst = true
  }
  if (errorCtrl && focusFirst === true) {
    errorCtrl.focus()
    errorCtrl.scrollIntoView()
  }
  return errs
}
