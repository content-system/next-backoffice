// Keyboard shortcuts that should always be allowed
const SHORTCUT_KEYS = new Set(["a", "c", "v", "x", "z", "y"])

// Non-printable keys that should always be allowed
const CONTROL_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Enter",
  "Escape",

  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",

  "Home",
  "End",

  "PageUp",
  "PageDown",

  "Insert",
])

export function detectShortcut(e: KeyboardEvent): boolean {
  return (e.ctrlKey || e.metaKey) && SHORTCUT_KEYS.has(e.key.toLowerCase())
}

function isDigit(key: string): boolean {
  return key.length === 1 && key >= "0" && key <= "9"
}

function isControlKey(key: string): boolean {
  return CONTROL_KEYS.has(key)
}

/**
 * Digits only
 * Allow:
 *   0-9
 */
export function digitKeyDown(e: KeyboardEvent): boolean {
  if (detectShortcut(e)) {
    return true
  }
  const key = e.key
  if (isControlKey(key)) {
    return true
  }
  return isDigit(key)
}

/**
 * Integer input
 * Allow:
 *   -123
 *   123
 */
export function integerKeyDown(e: KeyboardEvent): boolean {
  if (detectShortcut(e)) {
    return true
  }
  const key = e.key
  if (isControlKey(key)) {
    return true
  }
  const input = e.target as HTMLInputElement

  if (key === "-") {
    if (!input.min) {
      return true
    } else {
      const min = Number(input.min)
      return !Number.isNaN(min) && min < 0 && !input.value.includes("-")
    }
  }

  return isDigit(key)
}

/**
 * Decimal numbers
 * Allow:
 *   -123.45
 *   -123,45
 *   -123٫45 (Arabic decimal separator)
 * depending on decimalSeparator
 */
export function numberKeyDown(e: KeyboardEvent, decimalSeparator?: "." | "," | "٫"): boolean {
  if (detectShortcut(e)) {
    return true
  }

  const key = e.key

  if (isControlKey(key)) {
    return true
  }

  const input = e.target as HTMLInputElement
  if (key === "-") {
    if (!input.min) {
      return true
    } else {
      const min = Number(input.min)
      return !Number.isNaN(min) && min < 0 && !input.value.includes("-")
    }
  }

  if (key === "." || key === "," || key === "٫") {
    if (!decimalSeparator) {
      decimalSeparator = "."
    }
    return key === decimalSeparator && !input.value.includes(decimalSeparator)
  }

  return isDigit(key)
}
