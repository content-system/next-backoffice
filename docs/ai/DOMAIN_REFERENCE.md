# Domain Reference

This file summarizes the domain areas visible in the supplied source archive. It is a navigation aid, not a substitute for reading the actual implementation.

## Admin and identity

### User — `service/user/`, `app/users/`, `app/api/users/`

- User model includes identity/contact/profile fields, status, audit timestamps and a `roles` array.
- SQL repository maps users and the `user_roles` join table.
- Supports loading one user with roles, listing users, getting users by role, create/update/delete and assigning roles.
- `UserUseCase` generates a 10-character ID with `nanoid(10)`.
- Detail UI includes a separate role-assignment page under `app/users/[id]/assign/`.
- Inspect `userModel` for field validation and mapping.

### Role — `service/role/`, `app/roles/`, `app/api/roles/`

- Role administration has a role model/repository/use case.
- `service/role/index.ts` also exposes `getPrivilegesReader()` to read available modules/privileges.
- Role-module permissions are central to menu and authorization behavior.
- Inspect role detail and assignment code before changing permission semantics.

### Category — `service/category/`, `app/categories/`, `app/api/categories/`

- A relatively simple CRUD feature.
- Useful reference for `Attributes` model, `sql-core` generic repository, thin `UseCase`, factory, list filtering/sorting/pagination and create/update route handling.
- Category fields include ID, name, path, icon, sequence, parent, type, resource key, status and version.

### Settings — `service/settings/`, `app/settings/`, `app/api/settings/`

- A small service that updates the current user's language and date format.
- Uses a direct `SettingsService` and `buildToUpdate`; not every feature needs a four-file repository/use-case structure.
- `ItemService` loads language/date-format options.

## Content and workflow

### Article — `service/article/`, `app/articles/`, `app/api/articles/`

- Workflow-oriented domain with draft and published records.
- Supports search, load draft/published, create/update/patch, approve/reject/delete and history.
- Uses transactions, slug generation, shared status rules, history and notifications.
- Best example for multi-step business logic.

### Content — `service/content/`, `app/contents/`

- Content domain with model, repository and service.
- Inspect current code before extending; it may have domain-specific structure not represented by the simple CRUD example.

### Job — `service/job/`, `app/jobs/`, `app/api/jobs/`

- Job domain with model/repository/service.
- Inspect its model and route for current status and filter behavior before adding fields.

### Audit log — `service/audit-log/`, `app/audit-logs/`

- Audit-log domain exists separately from article history.
- Determine whether a requested audit feature belongs to general audit logs or the article-specific history mechanism.

## External/user-submitted records

### Contact — `service/contact/`, `app/contacts/`, `app/api/contacts/`

- Contact model stores sender/contact details, message, submission time and contact follow-up metadata.
- Uses a custom search repository query.
- The API route shown in the snapshot updates contact records; do not assume it is a public create endpoint.
- A detail page exists at `app/contacts/[id]/page.tsx`.

## Shared domain utilities

Under `service/shared/`:
- `status.ts`: shared status constants/rules used by workflow domains.
- `history.ts`: history data types and repository behavior.
- `approvers.ts`: approver port/interface.
- `notification.ts`: notification creation helpers/port usage.
- `item.ts`: shared item service (used by settings).
- `rate.ts` and `rates.ts`: rate-related types/services.

Under `service/common/`:
- `slug.ts`: slug generation helper.

## Cross-cutting application services

- `lib/db.ts`: PostgreSQL pool and `DB` singleton.
- `lib/account.ts`: current account from JWT cookie.
- `lib/authentication.ts`: configured `Authenticator` and user/privilege repositories.
- `lib/authorizor.ts`: current route permission resolution.
- `lib/menu.ts`: user-specific menu query and conversion.
- `lib/logger.ts`: logging and page-level error/forbidden helpers.
- `resources/index.ts`: locale/resource composition and status/language helpers.
- `components/form.tsx`: `Input`, validation-on-blur helpers and `SubmitButton`.
- `components/search.tsx`: shared list search controls.
- `components/pagination.tsx`: pagination links and helpers.
- `components/sort.tsx`: sortable table header links.
- `components/error.tsx`: standard error presentation.

## Status and permission caution

The project uses compact string status codes (for example active/inactive and article workflow states) and bitwise permissions from `web-one`. The same one-character status may mean different things in different domains. Always inspect the relevant domain's constants and database records. Do not assume `Status.Active`, `Status.Approved` and other aliases are globally interchangeable merely because their stored values overlap.
