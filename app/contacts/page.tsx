import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { SortLink } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logError, logForbidden } from "@lib/logger"
import { defaultLimit, getResource, limits } from "@resources"
import { ContactFilter, getContactService } from "@service/contact"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, buildSortSearch, getOffset, read, removeLimit, removePage } from "web-one"

const fields = ["id", "name", "email", "phone", "company", "country"]

export default async function ContactsForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const canRead = await hasPermission(read)
  if (!canRead) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const query = await searchParams
  const filter = buildFilter<ContactFilter>(query, defaultLimit)
  const service = getContactService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page, fields)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sort = buildSortSearch(query, fields, filter.sort)
    const offset = getOffset(filter.limit, filter.page)

    return (
      <div>
        <header>
          <h2>{resource.contacts}</h2>
        </header>
        <div className="main-body">
          <Form id="jobsForm" name="jobsForm" className="form" noValidate={true} action="/contacts">
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
                <input type="text" id="email" name="email" maxLength={80} defaultValue={filter.email} />
              </label>
            </section>
          </Form>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{resource.number}</th>
                  <th data-field="name">
                    <SortLink id="nameSort" href={sort.name.url} type={sort.name.type} text={resource.fullname} />
                  </th>
                  <th data-field="email">
                    <SortLink id="emailSort" href={sort.email.url} type={sort.email.type} text={resource.email} />
                  </th>
                  <th data-field="phone">
                    <SortLink id="phoneSort" href={sort.phone.url} type={sort.phone.type} text={resource.phone} />
                  </th>
                  <th data-field="company">
                    <SortLink id="companySort" href={sort.company.url} type={sort.company.type} text={resource.company} />
                  </th>
                  <th data-field="country">
                    <SortLink id="countrySort" href={sort.country.url} type={sort.country.type} text={resource.country} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => {
                  return (
                    <tr key={i}>
                      <td className="text-right">{offset + i + 1}</td>
                      <td>
                        <Link href={`/contacts/${item.id}`} prefetch={false}>
                          {item.name}
                        </Link>
                      </td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>{item.company}</td>
                      <td>{item.country}</td>
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
