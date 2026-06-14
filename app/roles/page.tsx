import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { defaultLimit, getResource, getStatusName, limits } from "@resources"
import { getRoleService, RoleFilter } from "@service/role"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { buildFilter, buildSortSearch, getOffset, removeLimit, removePage } from "web-one"

const fields = ["roleId", "roleName", "remark", "status"]

export default async function RolesForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path") as string
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }
  const resource = getResource(account?.language)

  const query = await searchParams
  const filter = buildFilter<RoleFilter>(query, defaultLimit)
  const service = getRoleService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page, fields)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    return (
      <div>
        <header>
          <h2>{resource.roles}</h2>
        </header>
        <div className="main-body">
          <Form id="rolesForm" name="rolesForm" className="form" noValidate={true} action="/roles">
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
                  <th data-field="roleId">
                    <SortLink id="roleIdSort" href={sort.roleId.url} type={sort.roleId.type} text={resource.role_id} />
                  </th>
                  <th data-field="roleName">
                    <SortLink id="roleNameSort" href={sort.roleName.url} type={sort.roleName.type} text={resource.role_name} />
                  </th>
                  <th data-field="remark">
                    <SortLink id="remarkSort" href={sort.remark.url} type={sort.remark.type} text={resource.remark} />
                  </th>
                  <th data-field="status">
                    <SortLink id="statusSort" href={sort.status.url} type={sort.status.type} text={resource.status} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((role, i) => {
                  return (
                    <tr key={i}>
                      <td className="text-right">{offset + i + 1}</td>
                      <td>{role.roleId}</td>
                      <td>
                        <Link href={`/roles/${role.roleId}`} prefetch={false}>{role.roleName}</Link>
                      </td>
                      <td>{role.remark}</td>
                      <td>{getStatusName(role.status, resource)}</td>
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
