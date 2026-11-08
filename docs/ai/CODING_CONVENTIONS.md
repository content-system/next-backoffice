# Coding Conventions

These conventions describe the patterns observed in the supplied source. Prefer consistency with the nearest feature over introducing a new style.

## 1. Formatting and TypeScript

Prettier settings (`.prettierrc.json`):
- 2-space indentation
- no semicolons
- double quotes
- trailing commas
- print width 160

TypeScript is strict, uses `moduleResolution: "bundler"`, `jsx: "react-jsx"`, and `noEmit: true`.

Use explicit domain types and interfaces. Avoid `any` unless a third-party boundary genuinely requires it. Keep function signatures and return types explicit for exported service contracts.

## 2. Imports and aliases

Prefer the configured aliases:
- `@components/*`
- `@lib/*`
- `@resources`
- `@service` and `@service/*`
- `@assets/*`

Use named imports for shared components and service exports. Domain `index.ts` files re-export the domain contracts so callers can import from `@service/<domain>`.

Keep imports grouped in the style of neighboring files; do not introduce a new alias unless it is added to `tsconfig.json`.

## 3. Domain contract file: `<domain>.ts`

Typical structure:

```ts
import { Attributes, Filter, Result, SearchResult } from "onecore"

export interface Product {
  id: string
  name: string
  status: string
  createdBy: string
  createdAt?: Date
  updatedBy: string
  updatedAt?: Date
}

export interface ProductFilter extends Filter {
  id?: string
  name?: string
  status?: string[]
}

export interface ProductRepository {
  search(filter: ProductFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Product>>
  load(id: string): Promise<Product | null>
  create(product: Product): Promise<number>
  update(product: Product): Promise<number>
  patch(product: Partial<Product>): Promise<number>
  delete(id: string): Promise<number>
}

export interface ProductService {
  search(filter: ProductFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Product>>
  load(id: string): Promise<Product | null>
  create(product: Product): Promise<Result<Product>>
  update(product: Product): Promise<Result<Product>>
  patch(product: Partial<Product>): Promise<Result<Product>>
  delete(id: string): Promise<number>
}

export const productModel: Attributes = {
  id: { key: true, length: 40, required: true },
  name: { length: 120, required: true, q: true },
  status: { length: 1 },
  createdBy: { column: "created_by", noupdate: true },
  createdAt: { column: "created_at", type: "datetime", noupdate: true, createdAt: true },
  updatedBy: { column: "updated_by" },
  updatedAt: { column: "updated_at", type: "datetime", updatedAt: true },
}
```

This is an illustrative shape, not a requirement that every domain expose every method. Match the real database and use case.

### Model metadata

The `Attributes` model is shared by validation and SQL mapping helpers. Common metadata seen in this project:
- `key`: primary key
- `column`: explicit snake_case DB column mapping
- `length`: maximum length
- `required`: required validation
- `q`: field participates in generic keyword search
- `type`: e.g. `"datetime"`, `"integer"`, `"strings"`
- `noupdate`: excluded from update operations
- `createdAt` / `updatedAt`: timestamp behavior
- `version`: optimistic version field
- `format`: validation format such as `"email"` or `"phone"`

Do not invent metadata flags. Check existing package usage and the installed `validation-core` / `sql-core` APIs.

## 4. Repository implementation

For straightforward CRUD, extend `Repository<Entity, Id, Filter>` from `sql-core`:

```ts
import { DB } from "onecore"
import { Repository } from "sql-core"
import { Product, ProductFilter, productModel, ProductRepository } from "./product"

export class SqlProductRepository extends Repository<Product, string, ProductFilter> implements ProductRepository {
  constructor(db: DB) {
    super(db, "products", productModel)
  }
}
```

If the domain needs custom query behavior, implement `buildQuery(filter): Statement` and pass it to the base repository, as in `service/article/repository.ts`. Use `db.param(index)` or the package's parameter helper and push values into a separate `params` array. Never concatenate untrusted filter values into SQL.

For multi-table writes, build `Statement[]` and use `executeBatch`; for atomic multi-step workflows, begin a transaction and commit/rollback in `try/catch` as shown in `article/service.ts`.

Repository methods should focus on persistence and mapping. Keep business decisions in the use case/service.

## 5. Use-case/service implementation

For standard CRUD, extend `UseCase<Entity, Id, Filter>` from `onecore` and pass the repository to `super(repository)`. Override only the behavior that differs from the generic use case.

Examples:
- `service/category/service.ts`: thin use case.
- `service/user/service.ts`: assigns a generated ID and delegates relationship operations.
- `service/article/service.ts`: explicit business workflow and transactions.

Generate IDs in the use case when that is the domain's convention (e.g. `nanoid(10)`), not in the page or API route.

## 6. Service factory: `index.ts`

Follow the lazy cached factory style:

```ts
import { db } from "@lib/db"
import { ProductService } from "./product"
import { SqlProductRepository } from "./repository"
import { ProductUseCase } from "./service"

export * from "./product"

let service: ProductService | undefined

export function getProductService(): ProductService {
  if (!service) {
    const repository = new SqlProductRepository(db)
    service = new ProductUseCase(repository)
  }
  return service
}
```

Use the actual service and repository names. Keep construction in one place.

## 7. API route handlers

A common `POST /api/<domain>/[id]` pattern:

```ts
import { getCurrentUser } from "@lib/account"
import { hasPermission } from "@lib/authorizor"
import { logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { Product, productModel, getProductService } from "@service/product"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful, write } from "web-one"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getCurrentUser()
  if (!account) {
    return NextResponse.json({ message: "Require authentication" }, { status: 401 })
  }
  const canWrite = await hasPermission(write, 1)
  if (!canWrite) {
    return NextResponse.json({ message: "You have no permission to create or update product" }, { status: 403 })
  }
  const { id } = await params
  const resource = getResource(account.language)
  const product: Product = await req.json()

  const errors = validate(product, productModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getProductService()
  try {
    if (id === Status.New) {
      const res = await service.create(product)
      const status = isSuccessful(res) ? 200 : 409
      return NextResponse.json(res, { status })
    } else {
      const res = await service.update(product)
      const status = res > 0 ? 200 : res === 0 ? 410 : 409
      return NextResponse.json(res, { status })
    }
  } catch (err) {
    logger.error(`Error at POST /products/${id}: ${err}`)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
```

Adapt status mapping to the service's actual return contract. The repository has both `Result<T>`/`isSuccessful` conventions and numeric result conventions. Do not assume they are interchangeable. Some endpoints intentionally have different security or behavior, so inspect the closest equivalent.

## 8. Server-rendered list pages

Common list page recipe:
1. Load account and resource map.
2. Call `authorize()` and derive `canRead` / `canWrite` with `hasPrivilege`.
3. If read access is missing, call `logForbidden(account)` and render `<Error ... />`.
4. Await `searchParams`.
5. Build a typed filter with `buildFilter<DomainFilter>(query, defaultLimit)`.
6. Call the service's `search(filter, filter.limit, filter.page, fields)`.
7. Prepare query fragments with `removePage`, `removeLimit`, `buildSortSearch`, and row numbering with `getOffset`.
8. Render a `next/form` search form with shared `<Search>` and `<Pagination>`, then a table with `<SortLink>`.
9. Catch failures, call `logError(err)`, and render the localized 500 error.

Use `Link` from `next/link` with `prefetch={false}` as in existing pages. Preserve query parameters and sort behavior.

## 9. Server-rendered detail/edit pages

Use `Status.New` to distinguish create mode from edit mode where the existing feature follows that pattern. Load the account, resources and route permission (`authorize(1)` is used by user detail). Deny unauthorized reads; deny create mode when write permission is missing.

Use shared form components such as `Input`, `SubmitButton`, and `BackButton`. Forms commonly have stable `id`/`name` values, `className="form"`, `noValidate={true}`, and named controls whose `name` matches the domain model property. The shared `SubmitButton` decodes the form and POSTs JSON to its `api` prop.

The form API path is commonly `/api/<domain>/<id>`, including `/api/<domain>/new` for creation. Verify the actual page and API contract.

## 10. Client components and CSS

- Add `"use client"` only at the top of files that need browser APIs, hooks, event handlers, or client navigation state.
- Prefer extending the shared components and CSS classes over introducing a new UI system.
- Keep CSS in `assets/css/` and import global styles through `assets/css/globals.css` / existing CSS import chain.
- Follow existing class naming and responsive grid conventions (`row`, `col s12 m6`, etc.).
- Avoid passing server-only modules, DB objects, secrets or service instances into client components.

## 11. Resource text

Use resource maps (`resource.some_key`) for user-facing labels, confirmation messages, success/error text and validation messages. Add matching keys to English and Vietnamese files in the correct resource group. Avoid hard-coded user-visible strings except where the existing API contract intentionally uses a generic technical response.

## 12. Error and result semantics

Observed HTTP mappings include:
- `401`: no authenticated account
- `403`: authenticated but not authorized
- `422`: validation errors
- `409`: conflict / unsuccessful create or update
- `410`: record missing or no longer available
- `500`: unexpected server failure

Service return conventions vary. Some use `Result<T>` plus `isSuccessful`; others return numbers (positive success, zero not found, negative business conflict). Read the service interface and implementation before mapping.
