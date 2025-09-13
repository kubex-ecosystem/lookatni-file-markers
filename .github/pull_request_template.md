# Pull Request

## Summary
Briefly describe the change and motivation.

Closes #

## Changes
-

## How To Test
- Node/TypeScript:
  - `npm run lint`
  - `npm run check-types`
  - `npm test`
- Go:
  - `go test ./...` or `make test`
- Build artifacts:
  - `npm run build`
  - `make build` (or `make build-dev`)
- Docs (when touched):
  - `make build-docs` or `make serve-docs`

## Screenshots / Recordings (UI changes)
Attach images or a short recording of VS Code UI flows.

## Checklist
- [ ] Conventional Commit title (e.g., `feat:`, `fix:`, `docs:`, `refactor:`)
- [ ] Lint, types, and Node tests pass (`npm run lint && npm run check-types && npm test`)
- [ ] Go tests pass (`go test ./...`)
- [ ] Builds succeed (`npm run build`, `make build` or `make build-dev`)
- [ ] Added/updated tests for new logic
- [ ] Updated docs/README as needed; `package.json` contributes/config changes documented
- [ ] No breaking changes, or clearly documented migration notes

## Additional Notes
Dependencies, follow-ups, or risk areas reviewers should focus on.
