import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logForbidden, logger, toString } from "@lib/logger"
import { defaultLimit, getDateFormat, getResource, limits } from "@resources"
import { getJobService, JobFilter } from "@service/job"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"
import {buildFilter,buildSortSearch,datetimeToString,formatDateTime,getOffset,read,removeLimit,removePage,} from "web-one"

const fields = [
  "id",
  "title",
  "company",
  "location",
  "publishedAt",
]

export default async function Jobs({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const canRead = await hasPermission(read)
  if (!canRead) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const query = await searchParams

  const filter = buildFilter<JobFilter>(query, defaultLimit, ["publishedAt"])
  const service = getJobService()
  try {
   const { list, total } = await service.search( filter,filter.limit,filter.page,fields)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const tableSort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    

    const dateFormat = getDateFormat(account?.language, account?.dateFormat)

    return (
      <div>
        <header className="page-header">
          <h2>{resource.jobs}</h2>

        <Link href="/jobs/new" className="btn-add">
           +
         </Link>
         </header>
        <div className="main-body">
          <Form id="jobsForm" name="jobsForm" className="form" noValidate={true} action="/jobs">
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
            <section className="row search-group advance-search" hidden>
              <label className="col s12 m6">
                {resource.published_at_from}
                <input
                  type="datetime-local"
                  step=".010"
                  id="publishedAt_min"
                  name="publishedAt.min"
                  data-field="publishedAt.min"
                  defaultValue={datetimeToString(filter.publishedAt?.min)}
                />
              </label>
              <label className="col s12 m6">
                {resource.published_at_to}
                <input
                  type="datetime-local"
                  step=".010"
                  id="publishedAt_max"
                  name="publishedAt.max"
                  data-field="publishedAt.max"
                  defaultValue={datetimeToString(filter.publishedAt?.max)}
                />
              </label>
            </section>
          </Form>
          <div className="table-responsive">
  <table className="table">
    <thead>
      <tr>
        <th>No.</th>

        <th data-field="id">
  <SortLink
    id="idSort"
    href={tableSort.id.url}
    type={tableSort.id.type}
    text="ID"
  />
</th>

        <th data-field="title">
  <SortLink
    id="titleSort"
    href={tableSort.title.url}
    type={tableSort.title.type}
    text="Title"
  />
</th>

       <th data-field="company">
  <SortLink
    id="companySort"
    href={tableSort.company.url}
    type={tableSort.company.type}
    text="Company"
  />
</th>

        <th data-field="location">
  <SortLink
    id="locationSort"
    href={tableSort.location.url}
    type={tableSort.location.type}
    text="Location"
  />
</th>

        <th data-field="publishedAt">
  <SortLink
    id="publishedAtSort"
    href={tableSort.publishedAt.url}
    type={tableSort.publishedAt.type}
    text="Published At"
  />
</th> 
      </tr>
    </thead>

    <tbody>
      {list.map((job, i) => (
        <tr key={job.id}>
          <td>{offset + i + 1}</td>

          <td>{job.id}</td>

          <td>
            <Link href={`/jobs/${job.id}`} prefetch={false}>
              {job.title}
            </Link>
          </td>

          <td>{job.company}</td>

          <td>{job.location}</td>

          <td>{formatDateTime(job.publishedAt, dateFormat)}</td>
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
