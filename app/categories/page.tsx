import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logError, logForbidden } from "@lib/logger"
import { defaultLimit, getResource, getStatusName, limits } from "@resources"
import { CategoryFilter, getCategoryService } from "@service/category"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, buildSortSearch, getOffset, read, removeLimit, removePage } from "web-one"

const fields = ["id", "name", "path", "icon", "type", "resource", "parent", "sequence", "status"]

export default async function CategoriesForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const canRead = await hasPermission(read)
  if (!canRead) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const query = await searchParams
  const filter = buildFilter<CategoryFilter>(query, defaultLimit)
  const service = getCategoryService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page, fields)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    return (
      <div>
        <header>
          <h2>{resource.categories}</h2>
        </header>
        <div className="main-body">
          <Form id="categoriesForm" name="categoriesForm" className="form" noValidate={true} action="/categories">
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
                  <th data-field="name">
                    <SortLink id="nameSort" href={sort.name.url} type={sort.name.type} text={resource.name} />
                  </th>
                  <th data-field="path">
                    <SortLink id="pathSort" href={sort.path.url} type={sort.path.type} text={resource.path} />
                  </th>
                  <th data-field="icon">
                    <SortLink id="iconSort" href={sort.icon.url} type={sort.icon.type} text={resource.icon} />
                  </th>
                  <th data-field="type">
                    <SortLink id="typeSort" href={sort.type.url} type={sort.type.type} text={resource.type} />
                  </th>
                  <th data-field="resource">
                    <SortLink id="resourceSort" href={sort.resource.url} type={sort.resource.type} text={resource.resource} />
                  </th>
                  <th data-field="parent">
                    <SortLink id="parentSort" href={sort.parent.url} type={sort.parent.type} text={resource.parent} />
                  </th>
                  <th data-field="sequence">
                    <SortLink id="sequenceSort" href={sort.sequence.url} type={sort.sequence.type} text={resource.sequence} />
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
                      <td>
                        <Link href={`/categories/${item.id}`} prefetch={false}>
                          {item.name}
                        </Link>
                      </td>
                      <td>{item.path}</td>
                      <td>{item.icon}</td>
                      <td>{item.type}</td>
                      <td>{item.resource}</td>
                      <td>{item.parent}</td>
                      <td className="right-align">{item.sequence}</td>
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
