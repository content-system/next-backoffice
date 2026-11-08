# AI Context: next-backoffice

This document is the entry point for an AI coding agent working in this repository. Read it before changing code, then consult the more detailed documents linked below.

## Project identity

This is a private Next.js back-office/CMS application (`next-website`, version `0.1.0`) using the Next.js App Router. It is written in TypeScript and React, with PostgreSQL as its database.

The application is intentionally layered:

1. `app/` is the Next.js delivery layer: server-rendered pages, layouts, route handlers and login actions.
2. `components/` contains reusable presentation and browser-interaction components.
3. `service/<domain>/` contains domain types, repository/service contracts, SQL persistence and use-case logic.
4. `lib/` contains application infrastructure such as DB setup, authentication, authorization, menu loading and logging.
5. `resources/` contains shared and feature-specific English/Vietnamese UI text.
6. `assets/` contains the CSS, fonts and images used by the back-office UI.

Do not collapse these layers. In particular, do not put SQL or substantial business rules in a page or route handler.

## Technology and important dependencies

- Next.js `16.4.2`, React `19.3.1`, TypeScript `6`
- PostgreSQL via `pg`, `postgres-kit`, and `sql-core`
- Shared abstractions/types via `onecore`
- Authentication via `authen-service`, `bcryptjs`, and `jsonwebtoken`
- Validation via `validation-core`
- Next/web helpers via `web-one`
- IDs generated with `nanoid`
- Localization via `locale-service`

Use the installed package APIs already used by this repository. Do not introduce another ORM, validation framework, UI framework, or state-management library without an explicit requirement.

## Read these documents

- [ARCHITECTURE.md](./ARCHITECTURE.md): runtime flow, layers and module map.
- [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md): TypeScript, naming, imports and implementation conventions.
- [FEATURE_PLAYBOOK.md](./FEATURE_PLAYBOOK.md): step-by-step instructions and templates for adding features.
- [DOMAIN_REFERENCE.md](./DOMAIN_REFERENCE.md): existing domains, shared workflows and cross-cutting behavior.

## Golden rules for generated code

- Follow the nearest existing feature with the same shape. For ordinary CRUD, use `category` or `contact` as a starting point; for user/role relationships, inspect `user`; for workflow-heavy behavior, inspect `article`.
- Keep domain contracts in `<domain>.ts`, persistence in `repository.ts`, business rules in `service.ts`, and the lazy service factory/re-exports in `index.ts`.
- Pages are generally async Server Components. Fetch data on the server, resolve the current account and language, authorize before showing protected data, and render the existing shared components/CSS conventions.
- API handlers authenticate, authorize, parse input, validate against the domain `Attributes` model, call a service, map the result to an HTTP status and log unexpected errors.
- Use parameterized SQL. Use the repository's `DB`/`Transaction` and `sql-core`/`postgres-kit` helpers; never interpolate user-provided values into SQL.
- Use the existing resource dictionaries for all user-visible text. Add both English and Vietnamese strings when adding labels or messages.
- Preserve existing permission semantics (`read`, `write`, `create`, etc. from `web-one`) and check both page access and API access where appropriate.
- Keep server-only modules out of client components. Add `"use client"` only when browser-side interaction or React client hooks are actually required.
- Do not assume a feature is complete after creating only a page. Consider domain model, repository, use case, service factory, API handler, page/form, localization and authorization.
- Do not silently fix unrelated legacy behavior while implementing a feature. Report suspicious existing behavior separately.

## Important implementation caveats

- Dynamic route handler params are typed as promises, e.g. `{ params }: { params: Promise<{ id: string }> }`, and must be awaited (Next.js 16 convention used here).
- Page `searchParams` and dynamic `params` are also typed as promises and awaited.
- The proxy excludes `/api/` paths from its matcher. API handlers therefore perform their own authentication and, for protected management operations, authorization.
- The current login action creates a JWT cookie named `token`; `lib/account.ts` reads that cookie.
- The checked-in `config.ts` contains a development-looking database URL and token secret. Never copy these values into new files or commit real secrets. Prefer environment variables (`DB_URL`, `TOKEN_SECRET`) and recommend moving defaults to environment configuration.
- Existing code has inconsistencies and likely defects. Treat source as evidence of current behavior, not as proof that every existing line is ideal. Examples worth checking before copying: `proxy.ts` has an unused/duplicated-looking DB-independent auth flow; `getStatusName` currently ignores its supplied resource map; some CRUD pages/routes have inconsistent result handling; verify links and route paths in the specific feature being copied.

## Scope of this analysis

This guide is based on the supplied source snapshot. No database schema/migrations, automated tests, deployment configuration, or runtime environment were included. Verify database column names, constraints, and package API details against the actual environment before making schema-dependent changes.
