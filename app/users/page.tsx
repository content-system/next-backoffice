import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { defaultLimit, getResource, getStatusName, limits } from "@resources"
import { getUserService, UserFilter } from "@service/user"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { buildFilter, buildSortSearch, getOffset, removeLimit, removePage } from "web-one"

const fields = ["userId", "username", "email", "displayName", "status"]

export default async function UsersForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path") as string
  console.log("path " + pathname)
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }
  const resource = getResource(account?.language)

  const query = await searchParams
  const filter = buildFilter<UserFilter>(query, defaultLimit)
  const service = getUserService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page, fields)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    return (
      <div>
        <header>
          <h2>{resource.users}</h2>
        </header>
        <div className="main-body">
          <Form id="jobsForm" name="jobsForm" className="form" noValidate={true} action="/users">
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
            <section className="row search-group advance-search inline" hidden>
              <label className="col s12 m6">
                {resource.email}
                <input
                  type="text"
                  id="email"
                  name="email"
                  maxLength={80}
                  defaultValue={filter.email}
                />
              </label>
            </section>
          </Form>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{resource.number}</th>
                  <th data-field="userId">
                    <SortLink id="userIdSort" href={sort.userId.url} type={sort.userId.type} text={resource.user_id} />
                  </th>
                  <th data-field="username">
                    <SortLink id="usernameSort" href={sort.username.url} type={sort.username.type} text={resource.username} />
                  </th>
                  <th data-field="email">
                    <SortLink id="emailSort" href={sort.email.url} type={sort.email.type} text={resource.email} />
                  </th>
                  <th data-field="displayName">
                    <SortLink id="displayNameSort" href={sort.displayName.url} type={sort.displayName.type} text={resource.display_name} />
                  </th>
                  <th data-field="status">
                    <SortLink id="statusSort" href={sort.status.url} type={sort.status.type} text={resource.status} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((user, i) => {
                  return (
                    <tr key={i}>
                      <td className="text-right">{offset + i + 1}</td>
                      <td>{user.userId}</td>
                      <td>
                        <Link href={`/users/${user.userId}`} prefetch={false}>{user.username}</Link>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.displayName}</td>
                      <td>{getStatusName(user.status, resource)}</td>
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
    logger.error(`Error at ${pathname}: ${toString(err)}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
