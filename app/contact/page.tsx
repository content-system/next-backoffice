import { formatText } from "@components/client-script"
import Input from "@components/form"
import { email, getLang, getResource } from "@resources"
import { Contact, contactModel, getContactService } from "@service/contact"
import { redirect } from "next/navigation"
import { validate } from "validation-core"
import { formatPhone, fromFormData } from "web-one"

export function printObject(obj: any): void {
  const keys = Object.keys(obj)
  for (const k of keys) {
    const v = obj[k]
    console.log("key " + k + ": " + v)
  }
}

export default async function ContactForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)

  const contact = {} as Contact
  async function save(formData: FormData) {
    "use server"
    const obj = fromFormData<Contact>(formData, contactModel)
    console.log("Print object " + JSON.stringify(obj))
    printObject(obj)
    const errors = validate<Contact>(obj, contactModel, resource)
    if (errors.length > 0) {
      console.log("Validation Error " + errors[0].message)
      redirect("/works")
    } else {
      const service = getContactService()
      const result = await service.submit(obj)
      console.log("Result " + result)
      if (result > 0) {
        redirect("/news")
      } else {
        redirect("/leadership")
      }
    }
  }
  return (
    <form id="contactForm" name="contactForm" className="form" noValidate={true} action={save}>
      <header>
        <h2>{resource.contact}</h2>
      </header>
      <div className="row">
        <label className="col s12 m6 required">
          {resource.fullname}
          <Input
            type="text"
            id="name"
            name="name"
            defaultValue={contact.name}
            maxLength={100}
            required={true}
            requiredError={formatText(resource.error_required, resource.fullname)}
            placeholder={resource.fullname}
          />
        </label>
        <label className="col s12 m6 required">
          {resource.country}
          <Input
            type="text"
            id="country"
            name="country"
            defaultValue={contact.country}
            maxLength={100}
            required={true}
            requiredError={formatText(resource.error_required, resource.country)}
            placeholder={resource.country}
          />
        </label>
        <label className="col s12 m6 required">
          {resource.company}
          <Input
            type="text"
            id="company"
            name="company"
            defaultValue={contact.company}
            maxLength={100}
            required={true}
            requiredError={formatText(resource.error_required, resource.company)}
            placeholder={resource.company}
          />
        </label>
        <label className="col s12 m6 required">
          {resource.job_title}
          <Input
            type="text"
            id="jobTitle"
            name="jobTitle"
            defaultValue={contact.jobTitle}
            maxLength={100}
            required={true}
            requiredError={formatText(resource.error_required, resource.job_title)}
            placeholder={resource.job_title}
          />
        </label>
        <label className="col s12 m6 required">
          {resource.email}
          <Input
            type="text"
            id="email"
            name="email"
            data-type="email"
            defaultValue={contact.email}
            maxLength={120}
            required={true}
            requiredError={formatText(resource.error_required, resource.email)}
            pattern={email}
            error={formatText(resource.error_email, resource.email)}
            placeholder={resource.email}
          />
        </label>
        <label className="col s12 m6 required">
          {resource.phone}
          <Input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={formatPhone(contact.phone)}
            maxLength={17}
            required={true}
            requiredError={formatText(resource.error_required, resource.phone)}
            placeholder={resource.phone}
          />
        </label>
        <label className="col s12 m12 textarea-container required">
          {resource.message}
          <textarea id="message" name="message" rows={6} defaultValue={contact.message} maxLength={400} placeholder={resource.message} />
        </label>
      </div>
      <footer>
        <button type="submit" id="btnSubmit" name="btnSubmit">
          {resource.submit}
        </button>
      </footer>
    </form>
  )
}
