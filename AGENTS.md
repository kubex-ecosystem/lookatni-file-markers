# Repository Guidelines

## Project Structure & Module Organization
- `src/`: VS Code extension and CLI TypeScript (`commands/`, `scripts/`, `utils/`, `views/`).
- `cmd/` + `internal/`: Go CLI entry (`cmd/main.go`) and packages (parser, transpiler, vscode integration).
- `dist/`: build output for TS and docs; `bin/`: CLI shims; `resources/`: icons/assets.
- `tests/`: HTML templates and samples; `docs/`, `docs-site/`, `support/`: MkDocs config and helper scripts.

## Build, Test, and Development Commands
- Build (TS + CLI): `npm run build` (esbuild + compile CLI). Watch: `npm run watch`.
- Lint/Types: `npm run lint`, `npm run check-types`.
- VS Code tests: `npm test` (runs `@vscode/test-*`).
- Go tests: `make test` or `go test ./...`.
- Go build/cross-compile: `make build` (uses `support/main.sh`). Dev build: `make build-dev`.
- Install binary: `make install`; clean artifacts: `make clean`.
- Docs: `make serve-docs` (local at `http://localhost:8081/docs`), `make build-docs`.

## Coding Style & Naming Conventions
- TypeScript: strict mode (TS 5), ES2022 modules, Node16 resolution.
- ESLint: `eslint.config.mjs` with `curly`, `eqeqeq`, `semi` warnings; `@typescript-eslint/naming-convention` for imports (camelCase/PascalCase).
- Prefer 2-space indentation, camelCase for vars/functions, PascalCase for classes/types; file names kebab-case (`generate-markers.ts`).
- Go: follow `gofmt`/`go vet`; package names lower_snake; exported identifiers use PascalCase.

## Testing Guidelines
- Place TS tests under `src/test` and run with `npm test`.
- Go tests: co-locate `_test.go` next to sources; run `go test ./...`.
- Aim to cover new logic (parsers/transpilers). Include small fixtures under `tests/` when practical.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. Keep subject ≤72 chars.
- PRs must include: purpose summary, linked issues (`Closes #123`), test evidence (logs/screenshots for VS Code UI), and any config changes (e.g., `package.json` contributes).
- Ensure CI/lint pass: `npm run lint && npm run check-types && npm test` and `go test ./...`.

## Security & Configuration Tips
- Node >= 16 required; Go toolchain required for `make build`.
- VS Code workspace trust: extension supports limited untrusted mode; avoid unsafe FS operations.
- Configurable settings live in `package.json` (`lookatni.*`); prefer defaults and document changes in PRs.
