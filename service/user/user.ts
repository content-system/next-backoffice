import { Attributes, Filter, SearchResult } from "onecore"

export interface User {
  userId: string
  username: string
  displayName?: string
  gender?: string
  email?: string
  phone?: string
  status: string
  roles?: string[]

  createdBy: string
  createdAt?: Date
  updatedBy: string
  updatedAt?: Date
}
export interface UserFilter extends Filter {
  userId?: string
  username?: string
  displayName: string
  email?: string
  phone?: string
  status?: string
  gender?: string
  title?: string
  position?: string
  excluding: string[]
}

export interface UserRepository {
  getUsersOfRole(roleId: string): Promise<User[]>
  all(): Promise<User[]>
  search(filter: UserFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<User>>
  load(id: string): Promise<User | null>
  create(user: User): Promise<number>
  update(user: User): Promise<number>
  patch(user: Partial<User>): Promise<number>
  delete(id: string): Promise<number>
  assign(id: string, roles: string[]): Promise<number>
}
export interface UserService {
  getUsersOfRole(roleId: string): Promise<User[]>
  all(): Promise<User[]>
  search(filter: UserFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<User>>
  load(id: string): Promise<User | null>
  create(user: User): Promise<number>
  update(user: User): Promise<number>
  patch(user: Partial<User>): Promise<number>
  delete(id: string): Promise<number>
  assign(id: string, roles: string[]): Promise<number>
}

export const userModel: Attributes = {
  userId: {
    column: "user_id",
    key: true,
    length: 40,
    operator: "=",
  },
  username: {
    required: true,
    length: 255,
    q: true,
    resource: "username",
  },
  email: {
    format: "email",
    required: true,
    length: 120,
    q: true,
    resource: "email",
  },
  displayName: {
    column: "display_name",
    length: 120,
    q: true,
    resource: "display_name",
  },
  status: {
    length: 1,
    operator: "=",
    resource: "status",
  },
  gender: {
    length: 1,
    resource: "gender",
  },
  phone: {
    format: "phone",
    required: true,
    length: 14,
    resource: "phone",
  },
  title: {
    length: 10,
  },
  position: {
    length: 10,
  },
  imageURL: {
    column: "image_url",
    length: 255,
  },

  createdBy: {
    column: "created_by",
    noupdate: true,
  },
  createdAt: {
    column: "created_at",
    type: "datetime",
    noupdate: true,
    createdAt: true,
  },
  updatedBy: {
    column: "updated_by",
  },
  updatedAt: {
    column: "updated_at",
    type: "datetime",
    updatedAt: true,
  },

  roles: {
    type: "strings",
    ignored: true,
  },
}
