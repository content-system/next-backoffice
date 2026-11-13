import { AutocompleteChip } from "@components/autocomplete-chip"
import { BackButton } from "@components/back-button"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getDateFormat, getResource, Status } from "@resources"
import { getJobService, Job } from "@service/job"
import { datetimeToString, formatDateTime, read, write } from "web-one"

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const newMode = id === Status.New
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize(1)
  const canRead = hasPrivilege(permission, read)
  const canWrite = hasPrivilege(permission, write)

  if (!canRead || (newMode && !canWrite)) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const service = getJobService()
  try {
    let job: Job | null = null
    if (!newMode) {
      job = await service.load(id)
      if (!job) {
        logger.warn(`Job not found: ${id}`)
        return <Error title={resource.error_404_title} message={resource.error_404_message} />
      }
    }

    const dateFormat = getDateFormat(account?.language, account?.dateFormat)

    if (!canWrite) {
      return (
        <form id="jobForm" name="jobForm" className="form" noValidate={true}>
          <header>
            <h2>{resource.job}</h2>
          </header>
          <div>
            <dl className="data-list row">
              <dt className="col s6 l3">{resource.id}</dt>
              <dd className="col s6 l9">{job?.id}</dd>
              <dt className="col s6 l3">{resource.title}</dt>
              <dd className="col s6 l9">{job?.title}</dd>
              <dt className="col s6 l3">{resource.description}</dt>
              <dd className="col s6 l9">{job?.description}</dd>
              <dt className="col s6 l3">{resource.published_at}</dt>
              <dd className="col s6 l9">{formatDateTime(job?.publishedAt, dateFormat)}</dd>
              <dt className="col s6 l3">{resource.end_date}</dt>
              <dd className="col s6 l9">{formatDateTime(job?.expiredAt, dateFormat)}</dd>
              <dt className="col s6 l3">{resource.company}</dt>
              <dd className="col s6 l9">{job?.company}</dd>
              <dt className="col s6 l3">{resource.position}</dt>
              <dd className="col s6 l9">{job?.position}</dd>
              <dt className="col s6 l3">{resource.quantity}</dt>
              <dd className="col s6 l9">{job?.quantity}</dd>
              <dt className="col s6 l3">{resource.location}</dt>
              <dd className="col s6 l9">{job?.location}</dd>
              <dt className="col s6 l3">{resource.min_salary}</dt>
              <dd className="col s6 l9">{job?.minSalary}</dd>
              <dt className="col s6 l3">{resource.max_salary}</dt>
              <dd className="col s6 l9">{job?.maxSalary}</dd>
            </dl>
          </div>
          <footer>
            <BackButton type="submit" id="closeBtn" name="closeBtn">
              {resource.close}
            </BackButton>
          </footer>
        </form>
      )
    }

    const skillSuggestions = await service.getSkills()

    return (
      <form id="jobForm" name="jobForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.job}</h2>
        </header>
        <input type="hidden" id="id" name="id" value={job?.id ?? id} />
        <div className="row">
          <label className="col s12 m6">
            {resource.published_at}
            <Input type="datetime-local" step=".010" id="publishedAt" name="publishedAt" defaultValue={datetimeToString(job?.publishedAt)} />
          </label>
          <label className="col s12 m6">
            {resource.end_date}
            <Input type="datetime-local" step=".010" id="expiredAt" name="expiredAt" defaultValue={datetimeToString(job?.expiredAt)} />
          </label>
          <label className="col s12 m6 required">
            {resource.company}
            <Input type="text" id="company" name="company" defaultValue={job?.company} maxLength={40} required={true} placeholder={resource.company} />
          </label>
          <label className="col s12 m6 required">
            {resource.position}
            <Input type="text" id="position" name="position" defaultValue={job?.position} maxLength={100} required={true} placeholder={resource.position} />
          </label>
          <label className="col s12 m6 required">
            {resource.quantity}
            <Input
              type="number"
              id="quantity"
              name="quantity"
              dataType="integer"
              defaultValue={job?.quantity}
              maxLength={14}
              min={1}
              required={true}
              placeholder={resource.quantity}
            />
          </label>
          <label className="col s12 m6 required">
            {resource.location}
            <Input type="text" id="location" name="location" defaultValue={job?.location} maxLength={120} required={true} placeholder={resource.location} />
          </label>
          <label className="col s12 m6">
            {resource.status}
            <div className="radio-group">
              <label>
                <input type="radio" id="active" name="status" value={Status.Active} defaultChecked={job?.status === Status.Active} />
                {resource.active}
              </label>
              <label>
                <input type="radio" id="inactive" name="status" value={Status.Inactive} defaultChecked={job?.status === Status.Inactive} />
                {resource.inactive}
              </label>
            </div>
          </label>
          <label className="col s12 m6">
            {resource.min_salary}
            <Input type="number" id="minSalary" name="minSalary" dataType="integer" defaultValue={job?.minSalary} min={0} placeholder={resource.min_salary} />
          </label>
          <label className="col s12 m6">
            {resource.max_salary}
            <Input type="number" id="maxSalary" name="maxSalary" dataType="integer" defaultValue={job?.maxSalary} min={0} placeholder={resource.max_salary} />
          </label>
          <label className="col s12 auto-height">
            {resource.skills}
            <AutocompleteChip id="skills" name="skills" values={job?.skills} suggestions={skillSuggestions} placeholder={resource.skills} />
          </label>
          <label className="col s12 m6 required">
            {resource.title}
            <Input type="text" id="title" name="title" defaultValue={job?.title} maxLength={300} required={true} placeholder={resource.title} />
          </label>
          <label className="col s12 auto-height required">
            {resource.description}
            <textarea id="description" name="description" defaultValue={job?.description} maxLength={9800} required={true} placeholder={resource.description} />
          </label>
        </div>
        <footer>
          <SubmitButton
            type="submit"
            id="btnSubmit"
            name="btnSubmit"
            api={`/api/jobs/${id}`}
            confirmHeader={resource.header_confirm}
            confirmMessage={resource.msg_confirm_save}
            successMessage={resource.msg_save_success}
            errorHeader={resource.header_error}
            forbiddenError={resource.error_403}
            parsingError={resource.error_response_body}
            networkError={resource.error_network}
            conflictError={resource.error_409}
            goneError={resource.error_410}
            successUrl="back"
          >
            {resource.submit}
          </SubmitButton>
        </footer>
      </form>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
