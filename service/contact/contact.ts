import { Attributes, Filter } from "onecore"

export interface Contact {
  id: string
  name: string
  country: string
  company: string
  jobTitle: string
  email: string
  phone: string
  message: string
  submittedAt: Date
}
export interface ContactFilter extends Filter {
  id: string
  name: string
  country: string
  company: string
  jobTitle: string
  email: string
  phone: string
}

export interface ContactRepository {
  create(contact: Contact): Promise<number>
}
export interface ContactService {
  submit(contact: Contact): Promise<number>
}

export const contactModel: Attributes = {
  id: {
    length: 40,
    key: true,
  },
  name: {
    length: 120,
    required: true,
    q: true,
    resource: "fullname",
  },
  country: {
    length: 120,
    required: true,
    resource: "country",
  },
  company: {
    length: 120,
    required: true,
    resource: "company",
  },
  jobTitle: {
    column: "job_title",
    length: 120,
    required: true,
    resource: "job_title",
  },
  email: {
    format: "email",
    length: 120,
    required: true,
    q: true,
    resource: "email",
  },
  phone: {
    format: "phone",
    length: 20,
    required: true,
    resource: "phone",
  },
  message: {
    length: 1000,
    required: true,
    resource: "message",
  },
  submittedAt: {
    column: "submitted_at",
    type: "datetime",
  },
}
