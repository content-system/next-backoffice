import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logError, logForbidden } from "@lib/logger"
import { defaultLimit, getResource, getStatusName, limits } from "@resources"
import { ContentFilter, getContentService } from "@service/content"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, buildSortSearch, getOffset, read, removeLimit, removePage } from "web-one"

const fields = ["id", "lang", "title", "publishedAt", "description", "status"]

export default async function ContentsForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const canRead = await hasPermission(read)
  if (!canRead) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const query = await searchParams
  const filter = buildFilter<ContentFilter>(query, defaultLimit)
  const service = getContentService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page, fields)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    return (
      <div>
        <header>
          <h2>{resource.contents}</h2>
        </header>
        <div className="main-body">
          <Form id="contentsForm" name="contentsForm" className="form" noValidate={true} action="/contents">
            <section className="row search-group">
              <Search
                className="col s12 m6 l4 xl6 search-input"
                limit={filter.limit}
                limits={limits}
                limitSearch={limitSearch}
                id="q"
                name="q"
                defaultValue={filter.q}
                maxLength={40}
                placeholder={resource.keyword}
              />
              <Pagination className="col s12 l4 xl3" total={total} size={filter.limit} page={filter.page} search={search} />
            </section>
          </Form>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{resource.number}</th>
                  <th data-field="id">
                    <SortLink id="idSort" href={sort.id.url} type={sort.id.type} text={resource.id} />
                  </th>
                  <th data-field="lang">
                    <SortLink id="langSort" href={sort.lang.url} type={sort.lang.type} text={resource.lang} />
                  </th>
                  <th data-field="title">
                    <SortLink id="titleSort" href={sort.title.url} type={sort.title.type} text={resource.title} />
                  </th>
                  <th data-field="status">
                    <SortLink id="statusSort" href={sort.status.url} type={sort.status.type} text={resource.status} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => {
                  return (
                    <tr key={i}>
                      <td className="text-right">{offset + i + 1}</td>
                      <td>{item.id}</td>
                      <td>{item.lang}</td>
                      <td>
                        <Link href={`/contents/${item.id}/${item.lang}`} prefetch={false}>
                          {item.title}
                        </Link>
                      </td>
                      <td>{getStatusName(item.status, resource)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
