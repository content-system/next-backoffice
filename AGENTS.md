# AI Development Instructions

This project is a Next.js back-office application built with TypeScript.

Before implementing any feature or modifying existing code, read the following documentation:

## Project Knowledge

- `docs/ai/AI_CONTEXT.md` — Project overview, technology stack and core concepts.
- `docs/ai/ARCHITECTURE.md` — Application architecture and layer responsibilities.
- `docs/ai/CODING_CONVENTIONS.md` — Coding standards, naming conventions and implementation patterns.
- `docs/ai/FEATURE_PLAYBOOK.md` — Step-by-step guide for implementing new features.
- `docs/ai/DOMAIN_REFERENCE.md` — Business domains and existing functionality.

## Mandatory Rules

1. Follow the existing architecture and coding conventions.
2. Inspect similar existing implementations before creating new ones.
3. Reuse existing services, repositories, components and utilities.
4. Keep business logic out of Next.js API route handlers and UI components.
5. Follow existing authentication, authorization and validation patterns.
6. Avoid unnecessary dependencies and unrelated refactoring.
7. Preserve backward compatibility unless explicitly requested otherwise.
8. Maintain consistency with existing TypeScript conventions.

## Implementation Principle

The objective is to extend the existing application, not redesign its architecture.

When existing source code and documentation disagree, inspect the source code and report the discrepancy rather than blindly following outdated documentation.

Always prioritize architectural consistency, maintainability and code reuse.
