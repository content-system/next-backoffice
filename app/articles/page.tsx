import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logForbidden, logger, toString } from "@lib/logger"
import {
  defaultLimit,
  getDateFormat,
  getResource,
  getStatusName,
  limits,
} from "@resources"
import { ArticleFilter, getArticleService } from "@service/article"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"

import {
  buildFilter,
  buildSortSearch,
  datetimeToString,
  formatDateTime,
  getOffset,
  read,
  removeLimit,
  removePage,
  write,
} from "web-one"

export default async function News({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)

  const canRead = await hasPermission(read)
  const canWrite = await hasPermission(write)

  if (!canRead) {
    logForbidden(account)
    return (
      <Error
        title={resource.error_403_title}
        message={resource.error_403_message}
      />
    )
  }

  const query = await searchParams

  const filter = buildFilter<ArticleFilter>(
    query,
    defaultLimit,
    ["publishedAt"]
  )

  const service = getArticleService()

  try {
    const { list, total } = await service.search(
      filter,
      filter.limit,
      filter.page
    )

    const search = removePage(query)
    const limitSearch = removeLimit(query)

    const fields = [
      "id",
      "title",
      "slug",
      "publishedAt",
      "status",
    ]

    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    const dateFormat = getDateFormat(
      account?.language,
      account?.dateFormat
    )

    return (
  <div>
    <div className="main-body">
      <Form
        id="articlesForm"
        name="articlesForm"
        className="form"
        noValidate={true}
        action="/articles"
      >
        <header className="page-header">
          <h2>{resource.news}</h2>

          {canWrite && (
            <Link href="/articles/new" className="btn-new" />
          )}
        </header>
 
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

          <Pagination
            className="col s12 l4 xl3"
            total={total}
            size={filter.limit}
            page={filter.page}
            search={search}
          />
        </section>

        {/* Nếu chưa dùng tìm kiếm nâng cao thì bỏ hẳn section này */}
      </Form>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>{resource.number}</th>

              <th data-field="id">
                <SortLink
                  id="idSort"
                  href={sort.id.url}
                  type={sort.id.type}
                  text={resource.id}
                />
              </th>

              <th data-field="title">
                <SortLink
                  id="titleSort"
                  href={sort.title.url}
                  type={sort.title.type}
                  text={resource.title}
                />
              </th>

              <th data-field="slug">
                <SortLink
                  id="slugSort"
                  href={sort.slug.url}
                  type={sort.slug.type}
                  text="Slug"
                />
              </th>

              <th data-field="publishedAt">
                <SortLink
                  id="publishedAtSort"
                  href={sort.publishedAt.url}
                  type={sort.publishedAt.type}
                  text={resource.published_at}
                />
              </th>

              <th data-field="status">
                <SortLink
                  id="statusSort"
                  href={sort.status.url}
                  type={sort.status.type}
                  text={resource.status}
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {list.map((item, i) => (
              <tr key={i}>
                <td className="text-right">{offset + i + 1}</td>

                <td>{item.id}</td>

                <td>
                  <Link href={`/articles/${item.id}`} prefetch={false}>
                    {item.title}
                  </Link>
                </td>

                <td>{item.slug}</td>

                <td>{formatDateTime(item.publishedAt, dateFormat)}</td>

                <td>{getStatusName(item.status, resource)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)
  } catch (err) {
    const headerList = await headers()
    const pathname = headerList.get("x-current-path")
    logger.error(`Error at ${pathname}: ${toString(err)}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
