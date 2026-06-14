import { db } from "@lib/db";
import { nanoid } from "nanoid";
import { UseCase } from "onecore";
import { SqlUserRepository } from "./repository";
import { User, UserFilter, UserRepository, UserService } from "./user";
export * from "./user";

export class UserUseCase extends UseCase<User, string, UserFilter> implements UserService {
  constructor(protected repository: UserRepository) {
    super(repository)
    this.create = this.create.bind(this);
  }
  all(): Promise<User[]> {
    return this.repository.all()
  }
  create(user: User): Promise<number> {
    user.userId = nanoid(10)
    return this.repository.create(user)
  }
  getUsersOfRole(roleId: string): Promise<User[]> {
    return this.repository.getUsersOfRole(roleId)
  }
  assign(id: string, roles: string[]): Promise<number> {
    return this.repository.assign(id, roles)
  }
}

let service: UserService | undefined
export function getUserService(): UserService {
  if (!service) {
    const repository = new SqlUserRepository(db)
    service = new UserUseCase(repository)
  }
  return service
}
