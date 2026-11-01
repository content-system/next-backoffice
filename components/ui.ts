export function showLoading(element?: string) {
  const name = element ? element : "sysLoading"
  const sysLoading = document.getElementById(name) as HTMLElement
  if (sysLoading) {
    sysLoading.style.display = "block"
  }
}
export function hideLoading(element?: string) {
  const name = element ? element : "sysLoading"
  const sysLoading = document.getElementById(name) as HTMLElement
  if (sysLoading) {
    sysLoading.style.display = "none"
  }
}

export function fadeIn(ele: HTMLElement, display?: string): void {
  ele.style.opacity = "0"
  ele.style.display = display || "block"
  ;(function fade() {
    let val = parseFloat(ele.style.opacity)
    val += 0.1
    if (!(val > 1)) {
      ele.style.opacity = val.toString()
      requestAnimationFrame(fade)
    }
  })()
}
export function fadeOut(ele: HTMLElement): void {
  ele.style.opacity = "1"
  ;(function fade() {
    let val = parseFloat(ele.style.opacity)
    val = -0.1
    if (val < 0) {
      ele.style.display = "none"
    } else {
      requestAnimationFrame(fade)
    }
  })()
}
export function toast(msg: string, element?: string): void {
  const name = element ? element : "sysToast"
  const sysToast: HTMLElement = document.getElementById(name) as HTMLElement
  if (sysToast) {
    sysToast.innerHTML = msg
    fadeIn(sysToast)
    setTimeout(() => {
      fadeOut(sysToast)
    }, 1340)
  }
}

interface StringMap {
  [key: string]: string
}
export type Type = "Confirm" | "Alert"
export type IconType = "Error" | "Warning" | "Confirm" | "Success" | "Info" | "Alert"
const mapE: StringMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
}
export function escapeHTML(input?: string | null): string {
  if (!input) {
    return ""
  }
  return input.replace(/[&<>"'`]/g, function (char) {
    return mapE[char]
  })
}
export function showAlert(
  msg: string,
  header?: string | null,
  type?: Type,
  iconType?: IconType,
  btnLeftText?: string | null,
  btnRightText?: string | null,
  yesCallback?: () => void,
  noCallback?: () => void,
  detail?: string,
): void {
  const sysAlert = document.getElementById("sysAlert") as HTMLElement
  const sysMessage = document.getElementById("sysMessage") as HTMLElement
  const sysMessageHeader = document.getElementById("sysMessageHeader") as HTMLElement
  const sysErrorDetail = document.getElementById("sysErrorDetail") as HTMLElement
  const sysErrorDetailText = document.getElementById("sysErrorDetailText") as HTMLElement
  const sysErrorDetailCaret = document.getElementById("sysErrorDetailCaret") as HTMLElement
  const sysYes = document.getElementById("sysYes") as HTMLElement
  const sysNo = document.getElementById("sysNo") as HTMLElement

  if (type === "Alert") {
    btnRightText = btnRightText !== undefined ? btnRightText : sysYes.getAttribute("data-ok")
    if (!sysAlert.classList.contains("alert-only")) {
      sysAlert.classList.add("alert-only")
    }
  } else {
    btnLeftText = btnLeftText ? btnLeftText : sysNo.getAttribute("data-text")
    btnRightText = btnRightText !== undefined ? btnRightText : sysYes.getAttribute("data-text")
    sysAlert.classList.remove("alert-only")
  }
  if (sysErrorDetail && sysErrorDetailCaret && sysErrorDetailText) {
    if (!detail) {
      sysErrorDetailCaret.style.display = "none"
      sysErrorDetail.style.display = "none"
      sysErrorDetailText.innerHTML = ""
    } else {
      sysErrorDetailCaret.style.display = "inline-block"
      sysErrorDetail.style.display = "inline-block"
      sysErrorDetailText.innerHTML = escapeHTML(detail)
    }
  }
  sysMessage.innerHTML = escapeHTML(msg)
  sysMessageHeader.innerHTML = escapeHTML(header)
  sysAlert.classList.remove("success-icon", "success-icon", "info-icon", "confirm-icon", "danger-icon", "warning-icon")
  if (iconType === "Alert") {
    if (!sysAlert.classList.contains("warning-icon")) {
      sysAlert.classList.add("warning-icon")
    }
  } else if (iconType === "Success") {
    if (!sysAlert.classList.contains("success-icon")) {
      sysAlert.classList.add("success-icon")
    }
  } else if (iconType === "Info") {
    if (!sysAlert.classList.contains("info-icon")) {
      sysAlert.classList.add("info-icon")
    }
  } else if (iconType === "Confirm") {
    if (!sysAlert.classList.contains("confirm-icon")) {
      sysAlert.classList.add("confirm-icon")
    }
  } else if (iconType === "Warning") {
    if (!sysAlert.classList.contains("warning-icon")) {
      sysAlert.classList.add("warning-icon")
    }
  } else if (iconType === "Error") {
    if (!sysAlert.classList.contains("danger-icon")) {
      sysAlert.classList.add("danger-icon")
    }
  }
  const activeElement = (window as any).document.activeElement
  sysYes.innerHTML = escapeHTML(btnRightText)
  sysNo.innerHTML = escapeHTML(btnLeftText)
  ;(sysYes as any)["activeElement"] = activeElement
  sysAlert.style.display = "flex"
  ;(window as any).fyesOnClick = yesCallback
  ;(window as any).fnoOnClick = noCallback
  sysYes.focus()
}

export function showConfirm(
  msg: string,
  header?: string,
  yesCallback?: () => void,
  btnLeftText?: string,
  btnRightText?: string,
  noCallback?: () => void,
): void {
  showAlert(msg, header, "Confirm", "Confirm", btnLeftText, btnRightText, yesCallback, noCallback)
}
export function alertError(msg: string, header?: string, detail?: string, callback?: () => void, buttonText?: string): void {
  showAlert(msg, header, "Alert", "Error", "", buttonText, callback, undefined, detail)
}
export function alertWarning(msg: string, header?: string, callback?: () => void, buttonText?: string): void {
  showAlert(msg, header, "Alert", "Warning", "", buttonText, callback, undefined)
}
export function alertInfo(msg: string, header?: string, callback?: () => void, buttonText?: string): void {
  showAlert(msg, header, "Alert", "Info", "", buttonText, callback, undefined)
}
export function alertSuccess(msg: string, header?: string, callback?: () => void, buttonText?: string): void {
  showAlert(msg, header, "Alert", "Success", "", buttonText, callback, undefined)
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
