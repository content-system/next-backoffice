import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden } from "@lib/logger"
import { defaultLimit, getDateFormat, getResource, getStatusName, limits } from "@resources"
import { ArticleFilter, getArticleService } from "@service/article"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, buildSortSearch, formatDateTime, getOffset, read, removeLimit, removePage, write } from "web-one"

const fields = ["id", "title", "publishedAt", "description", "status"]

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize()
  const canRead = hasPrivilege(permission, read)
  const canWrite = hasPrivilege(permission, write)
  if (!canRead) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const query = await searchParams
  const filter = buildFilter<ArticleFilter>(query, defaultLimit, ["publishedAt"])
  const service = getArticleService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    const dateFormat = getDateFormat(account?.language, account?.dateFormat)

    return (
      <div>
        <header>
          <h2>{resource.articles}</h2>
          {canWrite && <Link href="/articles/new" id="newBtn" className="btn-new" prefetch={false} />}
        </header>
        <div className="main-body">
          <Form id="articlesForm" name="articlesForm" className="form" noValidate={true} action="/articles">
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
                  <th>
                    <SortLink id="idSort" href={sort.id.url} type={sort.id.type} text={resource.id} />
                  </th>
                  <th>
                    <SortLink id="titleSort" href={sort.title.url} type={sort.title.type} text={resource.title} />
                  </th>
                  <th>
                    <SortLink id="publishedAtSort" href={sort.publishedAt.url} type={sort.publishedAt.type} text={resource.published_at} />
                  </th>
                  <th>
                    <SortLink id="descriptionSort" href={sort.description.url} type={sort.description.type} text={resource.description} />
                  </th>
                  <th>
                    <SortLink id="statusSort" href={sort.status.url} type={sort.status.type} text={resource.status} />
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
                    <td>{formatDateTime(item.publishedAt, dateFormat)}</td>
                    <td>{item.description}</td>
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
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
