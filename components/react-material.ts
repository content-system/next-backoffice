import { FocusEvent } from "react"
import { addClass, getContainer, removeClasses } from "./client-script"

export function materialOnFocus(e: FocusEvent<HTMLInputElement>) {
  const ele = e.currentTarget as HTMLInputElement
  if (ele.disabled || ele.readOnly) {
    return
  }
  if (ele.nodeName === "INPUT" || ele.nodeName === "SELECT" || ele.nodeName === "TEXTAREA") {
    addClass(getContainer(ele), "focused")
  }
}
export function materialOnBlur(e: FocusEvent<HTMLInputElement>): void {
  const ele = e.currentTarget as HTMLInputElement
  if (ele.nodeName === "INPUT" || ele.nodeName === "SELECT" || ele.nodeName === "TEXTAREA") {
    removeClasses(getContainer(ele), ["focused", "focus"])
  }
}
