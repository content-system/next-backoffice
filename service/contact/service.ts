import { nanoid } from "nanoid"
import { UseCase } from "onecore"
import { Contact, ContactFilter, ContactRepository, ContactService } from "./contact"

export class ContactUseCase extends UseCase<Contact, string, ContactFilter> implements ContactService {
  constructor(repository: ContactRepository) {
    super(repository)
    this.create = this.create.bind(this)
  }
  create(contact: Contact): Promise<number> {
    contact.id = nanoid(10)
    contact.submittedAt = new Date()
    return this.repository.create(contact)
  }
}
