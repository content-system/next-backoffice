import { BackButton } from "@components/client"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"

import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"

import { getResource } from "@resources"
import { getJobService, Status } from "@service/job"

import { read, write } from "web-one"

export default async function JobForm() {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)

  const permission = await authorize(1)

  if (!hasPrivilege(permission, read)) {
    logForbidden(account)
    return (
      <Error
        title={resource.error_403_title}
        message={resource.error_403_message}
      />
    )
  }

  const service = getJobService()

  const job = {
    id: "",
    slug: "",
    title: "",
    description: "",
    company: "",
    position: "",
    quantity: undefined,
    location: "",
    minSalary: undefined,
    maxSalary: undefined,
    skills: [],
    publishedAt: undefined,
    expiredAt: undefined,
    status: Status.Draft,
  }

  try {
    const canWrite = hasPrivilege(permission, write)

    if (!canWrite) {
      return (
        <form className="form">
          <header>
            <h2>Create Job</h2>
          </header>

          <footer>
            <BackButton id="closeBtn" name="closeBtn">
              {resource.close}
            </BackButton>
          </footer>
        </form>
      )
    }

return (
  <form
    id="jobForm"
    name="jobForm"
    className="form"
    noValidate
    data-required-error={resource.error_required}
  >
    <header>
      <BackButton id="backBtn" name="backBtn" className="btn-back" />
      <h2>Create Job</h2>
    </header>

    <div className="row">


      <label className="col s12 required">
        Title
        <Input
          id="title"
          name="title"
          type="text"
          defaultValue={job.title}
          required
          maxLength={300}
        />
      </label>

      <div className="col s12 required">
  <label htmlFor="description">Description</label>
  <textarea
    id="description"
    name="description"
    defaultValue={job.description}
    rows={5}
    style={{ width: "100%" }}
  />
</div>

<label className="col s12 m6">
  Company
  <Input
    id="company"
    name="company"
    type="text"
    defaultValue={job.company}
    maxLength={40}
  />
</label>

<label className="col s12 m6">
  Position
  <Input
    id="position"
    name="position"
    type="text"
    defaultValue={job.position}
    maxLength={100}
  />
</label>

<label className="col s12 m6">
  Quantity
  <Input
  id="quantity"
  name="quantity"
  type="number"
  dataType="integer"
  defaultValue={job.quantity}
/>
</label>

<label className="col s12 m6">
  Location
  <Input
    id="location"
    name="location"
    type="text"
    defaultValue={job.location}
    maxLength={120}
  />
</label>

<label className="col s12 m6">
  Min Salary
  <Input
  id="minSalary"
  name="minSalary"
  type="number"
  dataType="integer"
  defaultValue={job.minSalary}
/>
</label>

<label className="col s12 m6">
  Max Salary
  <Input
  id="maxSalary"
  name="maxSalary"
  type="number"
  dataType="integer"
  defaultValue={job.maxSalary}
/>
</label>

<label className="col s12">
  Skills
  <Input
    id="skills"
    name="skills"
    type="text"
    defaultValue={job.skills?.join(",")}
    placeholder="React,NodeJS,SQL"
  />
</label>

<label className="col s12 m6">
  Published At
  <Input
    id="publishedAt"
    name="publishedAt"
    type="datetime-local"
    defaultValue={
      job.publishedAt
        ? new Date(job.publishedAt).toISOString().substring(0, 16)
        : ""
    }
  />
</label>

<label className="col s12 m6">
  Expired At
  <Input
    id="expiredAt"
    name="expiredAt"
    type="datetime-local"
    defaultValue={
      job.expiredAt
        ? new Date(job.expiredAt).toISOString().substring(0, 16)
        : ""
    }
  />
</label>

<div className="col s12">
  <label>Status</label>

  <div className="radio-group">

    <label>
      <input
        type="radio"
        name="status"
        value={Status.Draft}
        defaultChecked={job.status === Status.Draft}
      />
      Draft
    </label>

    <label>
      <input
        type="radio"
        name="status"
        value={Status.Submitted}
        defaultChecked={job.status === Status.Submitted}
      />
      Submitted
    </label>

    <label>
      <input
        type="radio"
        name="status"
        value={Status.Approved}
        defaultChecked={job.status === Status.Approved}
      />
      Approved
    </label>

  </div>
</div>
    </div>

    <footer>
      <SubmitButton
       id="btnSubmit"
       name="btnSubmit"
       type="submit"
       api="/api/jobs/create"
     >
        {resource.submit}
      </SubmitButton>
    </footer>

  </form>
)
} catch (err) {
  logError(err)

  return (
    <Error
      title={resource.error_500_title}
      message={resource.error_500_message}
    />
  )
}
}