import Link from "next/link"

export interface Props {
  className?: string
  total?: number
  max?: number
  size?: number
  page?: number
  search?: string
}
export function getSearch(search: string, page: string | number): string {
  if (search.length === 0) {
    return "?" + (page == 1 ? "" : "page=" + page)
  } else {
    return "?" + search + (page == 1 ? "" : "&page=" + page)
  }
}
export function getNumber(n: number | undefined, m: number): number {
  return typeof n === "number" && n !== undefined && n != null && n > 0 ? n : m
}
export function getTotalPages(totalRecords: number, itemsPerPage: number): number {
  const x = Math.ceil(totalRecords / itemsPerPage)
  return x <= 0 ? 1 : x
}
export function getMaxSize(maxSize: number | undefined, m: number) {
  return typeof maxSize === "number" ? Math.max(0, Math.min(maxSize, 2)) : m
}
// { total, max, size, page, pathname, query, className }
export function Pagination(props: Props) {
  const LEFT_PAGE = "LEFT"
  const RIGHT_PAGE = "RIGHT"

  const range = (from: number, to: number, step: number = 1) => {
    let i = from
    const ranges = []
    while (i <= to) {
      ranges.push(i.toString())
      i += step
    }
    return ranges
  }

  const page = getNumber(props.page, 1)
  const size = getNumber(props.size, 12)
  const search = props.search || ""

  const fetchPageNumbers = () => {
    const total = getNumber(props.total, 0)
    const totalPages = getTotalPages(total, size)
    const max = getMaxSize(props.max, 7)
    const totalNumbers = max * 2 + 3
    const totalBlocks = totalNumbers + 2

    if (totalPages > totalBlocks) {
      let pages: string[] = []

      const leftBound = page - max
      const rightBound = page + max
      const beforeLastPage = totalPages - 1

      const startPage = leftBound > 2 ? leftBound : 2
      const endPage = rightBound < beforeLastPage ? rightBound : beforeLastPage

      pages = range(startPage, endPage)

      const pagesCount = pages.length
      const singleSpillOffset = totalNumbers - pagesCount - 1

      const leftSpill = startPage > 2
      const rightSpill = endPage < beforeLastPage

      const leftSpillPage = LEFT_PAGE
      const rightSpillPage = RIGHT_PAGE

      if (leftSpill && !rightSpill) {
        const extraPages = range(startPage - singleSpillOffset, startPage - 1)
        pages = [leftSpillPage, ...extraPages, ...pages]
      } else if (!leftSpill && rightSpill) {
        const extraPages = range(endPage + 1, endPage + singleSpillOffset)
        pages = [...pages, ...extraPages, rightSpillPage]
      } else if (leftSpill && rightSpill) {
        pages = [leftSpillPage, ...pages, rightSpillPage]
      }
      return [1, ...pages, totalPages]
    }
    return range(1, totalPages)
  }

  const pages = fetchPageNumbers()
  if (pages.length <= 1) {
    return null
  }
  return (
    <nav className={props.className} aria-label="Pagination">
      <ul className="pagination">
        {pages.map(
          (p, i) =>
            (p === LEFT_PAGE && (
              <li className="page-item left" key={i}>
                <Link className="page-link" aria-label="Previous" href={getSearch(search, page - 1)} prefetch={false}>
                  <span aria-hidde="true">'\u00AB'</span>
                  <span className="sr-only">Previous</span>
                </Link>
              </li>
            )) ||
            (p === RIGHT_PAGE && (
              <li className="page-item right" key={i}>
                <Link className="page-link" aria-label="Previous" href={getSearch(search, page + 1)} prefetch={false}>
                  <span aria-hidde="true">'\u00BB'</span>
                  <span className="sr-only">Next</span>
                </Link>
              </li>
            )) || (
              <li className={"page-item" + (p == page ? " active" : "")} key={i}>
                {p != page && <Link className="page-link" href={getSearch(search, p)} prefetch={false}>{p}</Link>}
                {p == page && <span className="page-link">{p}</span>}
              </li>
            ),
        )}
      </ul>
    </nav>
  )
}
