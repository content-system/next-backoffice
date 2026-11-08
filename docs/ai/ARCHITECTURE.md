# Architecture

## 1. High-level structure

```text
Browser
  |
  v
Next.js proxy.ts
  |-- checks JWT cookie for matched page routes
  |-- forwards x-current-path / x-current-fullpath / x-language
  v
app/ (App Router)
  |-- pages: server-rendered UI, query parsing, page authorization
  |-- api/: HTTP authentication, permission checks, validation, status mapping
  |-- login/actions.ts: server action for login
  v
components/                 resources/
  |-- shared UI               |-- en / vi dictionaries
  |-- client interactions     |-- common/admin/auth/content text
  |
  v
service/<domain>/
  |-- domain contract/model
  |-- repository contract + SQL repository
  |-- use case / service implementation
  |-- index.ts factory
  v
lib/db.ts -> postgres-kit / sql-core -> pg Pool -> PostgreSQL
```

The `app/` layer depends on service interfaces/factories. Service implementations depend on repository contracts and shared infrastructure abstractions. Pages should not issue SQL directly.

## 2. Directory responsibilities

| Directory | Responsibility |
|---|---|
| `app/` | Route segments, server components, API route handlers, login server action |
| `app/api/` | JSON endpoints; these are separate from page rendering |
| `components/` | Shared UI and client-side behavior |
| `lib/` | DB singleton, JWT/account lookup, authorization, menu, logger |
| `service/` | Domain models, repository contracts/implementations and use cases |
| `service/shared/` | Reusable domain workflows/types: history, status, approvers, notifications, rates |
| `resources/` | English/Vietnamese resource dictionaries and locale helpers |
| `assets/` | Global CSS, component CSS, fonts and images |
| `public/` | Static files served by Next.js |

## 3. Request and page flow

### Protected page request

1. `proxy.ts` reads the `token` cookie and verifies its JWT for matched page routes.
2. Missing/invalid tokens are redirected to `/login`, preserving the requested path in the `redirect` query parameter.
3. The proxy forwards `x-current-path` and `x-current-fullpath`; it forwards `x-language` when a `lang` query parameter exists.
4. `components/layout.tsx` loads the current account with `getCurrentUser()`, loads the user's menu with `getMenu(account.id)`, resolves the language/resource dictionary, and composes the shared layout.
5. A feature page loads the account and resource dictionary, calls `authorize()`/`hasPrivilege()`, and returns the shared `<Error>` component for forbidden access.
6. The page builds filters from `searchParams`, calls the domain service, and renders server-side HTML.

### API mutation flow

Typical protected CRUD handler:

1. `getCurrentUser()`; return HTTP 401 if absent.
2. `hasPermission(write, 1)`; return HTTP 403 if denied.
3. Await dynamic `params` when the route is `/api/<domain>/[id]`.
4. Resolve `getResource(account.language)`.
5. Parse JSON into the domain type.
6. Run `validate(payload, domainModel, resource)`; return HTTP 422 with the validation errors.
7. Call `get<Domain>Service()` inside `try`.
8. Convert the service result to the established HTTP status convention.
9. Log unexpected exceptions with `logger.error(...)`; return HTTP 500.

Not every endpoint is identical. For example, public-ish contact submission/update and settings use different authorization/identity rules. Read the closest existing route and preserve the intended business policy rather than applying a blind template.

## 4. Authentication and authorization

- Login is implemented by `app/login/actions.ts` as a `"use server"` action.
- It maps `FormData` using `fromFormData`, validates against a model, and calls `getAuthenticator()`.
- On success it signs a JWT and writes an HTTP-only cookie named `token`.
- `lib/account.ts` reads and verifies the cookie and returns an `Account` or `null`.
- `proxy.ts` performs page-route token verification and redirects unauthenticated requests.
- `lib/authorizor.ts` uses `PrivilegeLoader`, the current account, and the forwarded `x-current-path` header to load permission bits for the current module.
- `hasPrivilege(privilege, permission)` tests permission bits; `hasPermission(permission, index?)` resolves the current route's privilege first.
- Menu entries are loaded from user-role/module tables in `lib/menu.ts` and converted with `toMenuItems` from `web-one`.

A new protected feature normally needs page-level authorization and API-level authorization. Do not rely on hiding a button as a security control.

## 5. Database and service composition

`lib/db.ts` exports shared `pool` and `db` instances. In non-production mode they are retained on `globalThis` to avoid recreating pools during hot reload.

Most service domains follow this composition pattern:

```text
service/category/index.ts
  imports db
  constructs SqlCategoryRepository(db)
  constructs CategoryUseCase(repository)
  returns cached CategoryService
```

This keeps Next.js pages/routes independent of concrete SQL repository classes.

### Common CRUD domain

- `<domain>.ts`: entity, filter, repository/service interfaces, `Attributes` model.
- `repository.ts`: concrete SQL repository, usually extending `sql-core` `Repository`.
- `service.ts`: use case, often extending `onecore` `UseCase`.
- `index.ts`: lazy singleton factory and `export *` of domain contracts.

### More complex domain

`article` demonstrates a more involved workflow:
- Separate draft and published repository contracts.
- Explicit transaction boundaries.
- History/audit trail.
- Approval/rejection state transitions.
- Approver and notification ports.
- Slug generation and logging.

Do not force a complex workflow into a generic CRUD implementation if the business process requires multiple repositories, transactions or history.

## 6. UI rendering model

- Most pages are async Server Components and fetch records before rendering.
- Shared components include `Error`, `BackButton`, `SubmitButton`, `Input`, `Search`, `Pagination`, and `SortLink`.
- `SubmitButton` is a client-side component that serializes a form, validates it, displays confirmation/loading feedback, POSTs JSON to the configured API, and handles common HTTP errors.
- The project uses local CSS classes and CSS files under `assets/css`; it does not use a component library such as MUI or Tailwind in the supplied source.
- `ClientLayout`, navigation, search controls and other browser-interactive pieces are marked as client components where required.

## 7. Localization

`resources/index.ts` combines common, authentication, admin and content dictionaries for `en` and `vi`. Pages resolve the account language through `getResource(account?.language)` and use resource keys for labels and messages.

When adding UI text:
1. Add a stable resource key to the appropriate `resources/<area>/en.ts`.
2. Add its Vietnamese counterpart to `resources/<area>/vi.ts`.
3. Ensure both dictionaries are merged by `resources/index.ts` (or add a new resource group there).
4. Use the resource key in the page/component/API validation response.

## 8. Feature map

| Feature | Page area | API area | Service |
|---|---|---|---|
| Articles | `app/articles/` | `app/api/articles/` | `service/article/` |
| Categories | `app/categories/` | `app/api/categories/` | `service/category/` |
| Contacts | `app/contacts/` | `app/api/contacts/` | `service/contact/` |
| Jobs | `app/jobs/` | `app/api/jobs/` | `service/job/` |
| Roles | `app/roles/` | `app/api/roles/` | `service/role/` |
| Settings | `app/settings/` | `app/api/settings/` | `service/settings/` |
| Users | `app/users/` | `app/api/users/` | `service/user/` |
| Audit logs | `app/audit-logs/` | inspect before extending | `service/audit-log/` |
| Content | `app/contents/` | inspect before extending | `service/content/` |
