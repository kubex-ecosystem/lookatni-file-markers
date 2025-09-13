# Style Guide

Keep contributions consistent, readable, and fast to review.

## Commit Messages

- Use Conventional Commits when possible: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Be concise and imperative (e.g., `fix: handle empty filename in validator`)

## Branches

- `feature/<short-topic>` for new work, `fix/<short-topic>` for bugfixes.
- Keep PRs focused and small.

## TypeScript (Core/Extension)

- Strict mode, 2 spaces, no `any` unless justified.
- Prefer small functions, early returns. Interfaces for contracts.
- Public APIs documented via JSDoc. Follow existing types in `core/src/lib/types.ts`.

## Go (CLI)

- Idiomatic structure: `cmd/`, `internal/`, clear package names.
- Table-driven tests. Small functions, explicit error handling.
- `context.Context` for cancellation in new code.

## Docs

- Short pages, practical examples, copy-paste commands.
- Reflect real, working functionality only.
- Link to `spec/marker-v1.md` and fixtures when relevant.

## PR Expectations

- Add/update tests/fixtures as needed.
- Update docs when changing behavior.
- Run `bash scripts/validate-all.sh` locally and ensure green.

