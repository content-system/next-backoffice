import { nanoid } from "nanoid";
import { UseCase } from "onecore";
import { User, UserFilter, UserRepository, UserService } from "./user";

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
