# Feature Implementation Playbook

Use this checklist whenever adding a feature. First decide whether it is a simple CRUD resource, a relationship/administration feature, or a workflow with state transitions.

## 1. Inspect before coding

1. Find the closest existing feature:
   - Simple CRUD: `service/category/` and `app/categories/`.
   - Searchable user-submitted records: `service/contact/`.
   - Many-to-many relationships: `service/user/` and user role assignment.
   - Approval/history/notifications: `service/article/`.
   - Settings without a full repository: `service/settings/`.
2. Inspect its model, repository, service, index factory, API route, list page, detail page, resource dictionaries and CSS.
3. Confirm the actual database table/columns, primary keys, foreign keys, indexes and status values. The supplied project archive does not include migrations/schema.
4. Decide which permissions are needed and which route path maps to the permission module.
5. Identify whether the operation is CRUD, a relationship update, or a transactional workflow.

## 2. Standard CRUD file checklist

For a new resource named `product`, the likely files are:

```text
service/product/
  product.ts       # Product, ProductFilter, repository/service interfaces, productModel
  repository.ts    # SqlProductRepository
  service.ts       # ProductUseCase
  index.ts         # lazy factory + exports

app/products/
  page.tsx         # list/search/sort/pagination, server component
  [id]/
    page.tsx       # view/edit form; Status.New for create mode

app/api/products/
  [id]/
    route.ts       # POST create/update with auth, permission, validation

resources/
  admin/
    en.ts          # labels/messages
    vi.ts          # Vietnamese labels/messages
```

The exact routes depend on the feature. Add additional endpoints only when required by the interaction/business contract.

## 3. Implementation order

### Step A — Domain contract and model

- Define the entity interface with camelCase properties.
- Define a filter extending `onecore` `Filter`.
- Define repository and service interfaces.
- Define the `Attributes` model, mapping camelCase properties to DB snake_case columns.
- Include audit fields only if the table and existing domain conventions require them.
- Decide whether `patch` is genuinely partial or whether this codebase's existing `UseCase` treats it as update; inspect the base class and local examples.

### Step B — Repository

- Prefer `sql-core` `Repository` for standard CRUD.
- Add a custom `buildQuery` only for non-trivial filtering, joins, array/range conditions or custom sorting.
- Use parameterized statements.
- Implement relationship persistence explicitly when the entity spans join tables.
- Use transactions for operations that must succeed or fail together.

### Step C — Use case

- Extend `UseCase` for standard CRUD.
- Add business rules here: ID generation, state validation, slug generation, relationship coordination, transaction orchestration, history and notifications.
- Keep the repository replaceable through its interface.
- Return the result type declared by the service contract.

### Step D — Factory

- Add a lazy singleton `getProductService()` in `service/product/index.ts`.
- Export the domain contracts with `export * from "./product"`.
- Use `db` from `@lib/db`.

### Step E — API

- Follow the nearest route handler.
- Authenticate and authorize on the server.
- Validate with `validate(input, productModel, resource)`.
- Keep the API route thin: request parsing, security, validation, service call, HTTP mapping and logging.
- Ensure the path parameter and body identity agree where applicable; do not trust a client-supplied ID without checking it.
- Avoid returning raw database errors or stack traces.

### Step F — UI

List page:
- Server Component; await `searchParams`.
- Build filters with `buildFilter`.
- Call service `search`.
- Reuse `Search`, `Pagination`, `SortLink`, `Error`.
- Gate the create button and row actions by permissions.
- Preserve sort/filter/page query state.

Detail page:
- Server Component; await `params`.
- Load account, language resources and permission.
- Handle create/edit/view-only modes.
- Reuse `Input`, `SubmitButton`, `BackButton`.
- Ensure form control `name` values match model properties.
- POST to the correct `/api/...` endpoint.

### Step G — Localization and navigation

- Add English and Vietnamese keys in the appropriate resource group.
- If the feature should appear in the navigation, ensure its module/menu data exists in the database and the user's role has the required module permissions. The menu is data-driven; adding a page alone does not add a menu item.
- Confirm the module `path` matches the page route used by authorization.

### Step H — Verification

Run the available checks:
- `npm run lint` (note: this repository's script is `next lint`; verify compatibility with the installed Next.js 16 CLI).
- `npx tsc --noEmit`
- `npm run build`

Also manually verify:
- unauthenticated request -> 401 for API / login redirect for protected pages
- authenticated user without permission -> 403
- invalid input -> 422
- create success and duplicate/conflict behavior
- update success, missing record and business conflict
- list search, sorting, pagination and empty results
- both `en` and `vi`
- responsive layout and client-side form feedback

Do not claim checks passed unless they were actually run.

## 4. Example implementation pattern: simple CRUD

Use `category` as the nearest example:
- `Category` and `CategoryFilter` contracts and `categoryModel`
- `SqlCategoryRepository extends Repository`
- `CategoryUseCase extends UseCase`
- cached `getCategoryService()`
- list page with server-side search, sorting and pagination
- `/api/categories/[id]` for create/update

The detail page for categories should be inspected if implementing a matching edit form; do not assume all fields or API semantics from the list page alone.

## 5. Example implementation pattern: complex workflow

Use `article` when the feature has drafts, submission, approval, rejection, publishing or history:
- Keep draft and published persistence separate if the data model requires it.
- Use `DB.beginTransaction()` and explicit `commit()`/`rollback()`.
- Persist history in the same transaction as the business mutation.
- Validate allowed state transitions in the use case.
- Keep notification failures from accidentally corrupting a committed workflow; follow and review the existing notification timing carefully.
- Use ports/interfaces for external approver and notification dependencies.
- Do not implement approval logic in the page or route handler.

## 6. AI task prompt template

When asking an AI agent to implement a feature, provide a task prompt like this:

> Read `AI_CONTEXT.md`, `ARCHITECTURE.md`, `CODING_CONVENTIONS.md`, `FEATURE_PLAYBOOK.md` and `DOMAIN_REFERENCE.md` first. Inspect the closest existing implementation before editing. Implement **[feature description]** using the same architecture and conventions. Keep Next.js pages/routes thin; put domain contracts in `<domain>.ts`, SQL in `repository.ts`, business rules in `service.ts`, and composition in `index.ts`. Reuse existing components, authorization, validation, resources and CSS. Add English and Vietnamese text. Do not introduce new frameworks or refactor unrelated code. Verify TypeScript, lint and build where possible, and report changed files, assumptions, tests and unresolved issues. Do not invent database columns; ask or clearly mark schema assumptions.

## 7. Existing inconsistencies: do not copy blindly

The source snapshot contains patterns that need local review:
- Some API routes use `isSuccessful(res)` while others compare numeric results.
- `POST /api/users` updates a user while `/api/users/[id]` handles create/update.
- Some pages have route/link inconsistencies (for example, inspect the roles page's create link before copying it).
- `resources/index.ts` has a `getStatusName` implementation that does not currently use its `map` argument.
- Some page/API security behavior differs by domain.
- Some model/interface fields may be optional in one layer and required in another.

When an inconsistency is found, preserve behavior only when it is clearly intentional. Otherwise report it and ask before changing cross-cutting behavior.
