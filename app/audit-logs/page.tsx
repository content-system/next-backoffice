import { Error } from "@components/error"
import { Input } from "@components/form"
import { Limit } from "@components/limit"
import { Pagination } from "@components/pagination"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { defaultLimit, getDateFormat, getResource, limits } from "@resources"
import { AuditLogFilter, getAuditLogService } from "@service/audit-log"
import Form from "next/form"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { buildFilter, buildSortSearch, datetimeToString, formatFullDateTime, getOffset, removeLimit, removePage } from "web-one"

const fields = ["id", "time", "resource", "action", "status", "userId", "ip", "remark"]

export default async function AuditLogsForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path") as string
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }
  const resource = getResource(account?.language)
  const dateFormat = getDateFormat(account?.language)

  const query = await searchParams
  const filter = buildFilter<AuditLogFilter>(query, defaultLimit)
  const service = getAuditLogService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page, fields)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    return (
      <div>
        <header>
          <h2>{resource.audit_logs}</h2>
        </header>
        <div className="main-body">
          <Form id="auditLogsForm" name="auditLogsForm" className="form" noValidate={true} action="/audit-logs">
            <section className="row section">
              <label className="col s12 m2 l4">
                {resource.action}
                <Input
                  type="text"
                  id="action"
                  name="action"
                  defaultValue={filter.action}
                  maxLength={40}
                />
              </label>
              <label className="col s12 m5 l4">
                {resource.audit_log_time_from}
                <Input
                  type="datetime-local"
                  step=".010"
                  id="time_min"
                  name="time.min"
                  data-field="time.min"
                  value={datetimeToString(filter.time?.min)}
                />
              </label>
              <label className="col s12 m5 l4">
                {resource.audit_log_time_to}
                <Input
                  type="datetime-local"
                  step=".010"
                  id="time_max"
                  name="time.min"
                  data-field="time.max"
                  value={datetimeToString(filter.time?.max)}
                />
              </label>
            </section>
            <section className="section search">
              <label>
                {resource.page_size}
                <Limit id="limitBtn" className="limit" text={filter.limit} search={limitSearch} items={limits} dropDownId="limitDropdown" />
              </label>
              <button type="submit" id="searchBtn" className="btn-search">{resource.search}</button>
            </section>
          </Form>
          <form className="list-result">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{resource.number}</th>
                    <th data-field="time">
                      <SortLink id="timeSort" href={sort.time.url} type={sort.time.type} text={resource.audit_log_time} />
                    </th>
                    <th data-field="resource">
                      <SortLink id="resourceSort" href={sort.resource.url} type={sort.resource.type} text={resource.resource} />
                    </th>
                    <th data-field="action">
                      <SortLink id="actionSort" href={sort.action.url} type={sort.action.type} text={resource.action} />
                    </th>
                    <th data-field="status">
                      <SortLink id="statusSort" href={sort.status.url} type={sort.status.type} text={resource.status} />
                    </th>
                    <th data-field="userId">
                      <SortLink id="userIdSort" href={sort.userId.url} type={sort.userId.type} text={resource.audit_log_user} />
                    </th>
                    <th data-field="ip">
                      <SortLink id="ipSort" href={sort.ip.url} type={sort.ip.type} text={resource.ip} />
                    </th>
                    <th data-field="remark">
                      <SortLink id="remarkSort" href={sort.remark.url} type={sort.remark.type} text={resource.remark} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td className="text-right">{offset + i + 1}</td>
                        <td>{formatFullDateTime(item.time, dateFormat)}</td>
                        <td>{item.resource}</td>
                        <td>{item.action}</td>
                        <td>{item.status}</td>
                        <td>{item.userId}</td>
                        <td>{item.ip}</td>
                        <td>{item.remark}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination className="col s12 m6" total={total} size={filter.limit} page={filter.page} search={search} />
          </form>
        </div>
      </div>
    )
  } catch (err) {
    logger.error(`Error at ${pathname}: ${toString(err)}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
