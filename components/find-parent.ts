export function findParent(e: HTMLElement | null | undefined, className: string): HTMLElement | null {
  if (!e) {
    return null
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
  }
}
