//␜/ standards/go.md /␜//
# Go Craftsmanship Standards

Use Go Modules for dependency management. Keep `go.mod` and `go.sum` clean and minimal. Avoid indirect dependencies when possible.

Organize projects using idiomatic structure: `cmd/`, `cmd/cli/`, `internal/`, `internal/types`, `internal/interfaces`, `api/`, `support/`, `support/instructions`, `tests/`.

Place the main CLI entrypoint in `cmd/main.go` and the library entrypoint in the root package named after the project.

Every package must include a single-line comment before the package declaration using the `// Package <name> ...` format.

Write **table-driven tests** using the standard `testing` package. For complex assertions, use `testify`. Focus coverage on business logic and error paths.

Mock dependencies via interfaces — never global variables or side effects. Benchmark performance-critical functions. Keep tests fast and deterministic.

Use `CamelCase` for exported, `camelCase` for internal symbols. Avoid stuttering in package names (`user.User` is wrong).

Functions must be small and cohesive. Return early. Deep nesting is a code smell. Always handle errors explicitly — never ignore them.

Favor **composition over inheritance**. Accept interfaces, return concrete structs. Document interface behavior clearly.

Always use `context.Context` for cancellation, timeouts, and tracing. Pass it explicitly — never store in structs.

All exported types, functions, and packages must include **godoc-compatible comments**. Start with the name and include usage examples when applicable.

README must be clear, technical, and up to date. Include build instructions, features, usage examples, and optionally architecture diagrams or CLI reference.

Be consistent. Be fast. Be safe. Be Go.


//␜/ standards/typescript.md /␜//
# TypeScript Craftsmanship Standards

Use `pnpm` or `npm` with lockfiles committed. Prefer `workspace:` protocol in monorepos. Avoid unnecessary dependencies.

Organize code in: `src/`, `src/types/`, `src/interfaces/`, `tests/`, `scripts/`, `bin/`.  
Main entry: `src/index.ts`. CLI entry: `bin/cli.ts`. Avoid deep folder nesting.

Enable strict mode in `tsconfig.json`. Use `paths` and `baseUrl` to simplify imports (e.g., `@core/`, `@utils/`).

Each module must follow single responsibility. Avoid module-level side effects. Use `index.ts` only for aggregation.

Use `camelCase` for variables and functions, `PascalCase` for types and classes. Avoid `any`, and prefer safe typing over assertions.

Use `.interface.ts` for interfaces, `.dto.ts` for data transfer types, `.types.ts` for common types, `.spec.ts` for tests.

Write tests with `vitest` or `jest`. Test logic, not framework details. Use subprocesses for CLI testing.

Handle async explicitly. No unhandled promises. Use `try/catch`, safe wrappers, or functional patterns like `Result`.

Use dependency injection instead of hardcoded imports. Configs must come from `.env` or be injected — never hardcoded.

All public symbols must have TSDoc. Document params, return types, and usage when needed. Auto-generate docs if possible.

CLIs must support `--help`, `--version`, and `--json` (structured output). Errors go to `stderr`, data to `stdout`.

Use `eslint` with `@typescript-eslint`. Add Prettier. Enforce lint, format, and build on CI. Use Husky to block bad commits.

README must be technical and updated: build, run, test instructions, usage examples, and module explanation. Add diagrams when helpful.

Be declarative. Be typed. Be testable. Be clean. Be TypeScript.


//␜/ standards/java.md /␜//
# Java Craftsmanship Standards

Use Gradle (preferred) or Maven with minimal `build.gradle.kts` or `pom.xml`. Avoid transitive bloat.

Follow idiomatic layout: `src/main/java/`, `src/test/java/`, `src/main/resources/`. Organize by domain, not technical layer.

Use concise package names (`com.project.auth`, not `com.project.auth.authmodule`). Avoid generic names like `utils`.

Each class must follow the Single Responsibility Principle. Avoid God Objects. Separate concerns via services, use cases, ports.

Use `PascalCase` for classes, `camelCase` for methods, variables, and params. Use `UPPER_SNAKE_CASE` only for constants.

Interfaces should follow `XyzService`, `XyzPort`, or `XyzUseCase` patterns. Never suffix implementations with `Impl`.

Avoid `null`. Use `Optional`, pattern matching (Java 21+), or well-scoped exceptions. Never suppress exceptions.

Favor composition over inheritance. Use `final` by default. Constructor injection only — no `static` state for logic.

Write tests with JUnit 5. Use `@Test`, `@Nested`, `@DisplayName`. Only mock external contracts. Don't test framework internals.

Use Javadoc. Document public APIs, parameters, return values, and exceptions. Interface-level docs are required.

Use structured logging (SLF4J + Logback or Log4J2). Never use `System.out`. Include context: `requestId`, `userId`, etc.

Enforce `checkstyle`, `spotbugs`, `pmd`, `jacoco` in CI. Coverage must be >80%. PRs must pass validation.

README must be clear, updated, and technical. Include build/run/test steps, usage examples, architecture overview.

Be explicit. Be modular. Be tested. Be clean. Be Java.


//␜/ standards/shell.md /␜//
# Shell Craftsmanship Standards

Declare the interpreter at the top (`#!/usr/bin/env bash`). Make all scripts executable (`chmod +x`).

Always include `set -euo pipefail`. Handle unset variables and pipe errors robustly.

Name scripts with dashes (`deploy-all.sh`, `init-db.sh`). Avoid generic names (`run.sh`, `script.sh`).

Avoid globals. Use `local` variables in functions. Declare functions with `name() {}` or `function name()` consistently.

Use `getopts` to handle options like `-f`, `-v`, `--help`. Support `--dry-run`, `--verbose`, and `--quiet`.

Log using ANSI escape functions (e.g., `log_info`, `log_warn`). Never mix log output with data on stdout.

Trap `EXIT`, `ERR`, `INT` to clean up resources. Don't leave temporary files in `/tmp`.

Avoid hardcoding values. Read from environment, CLI args, or `.env` files. Always provide fallbacks.

Test with `bats` or reproducible container-based tests. Critical scripts must have tests.

Check for prerequisites: `command -v`, `which`, `test -f`. Fail with clear messages and proper `exit` codes.

Document each script with top-level block comments explaining usage and variables. Provide a README with examples.

Be portable. Be predictable. Be POSIX-compliant when possible. Shell is power — wield it with discipline.


//␜/ standards/markdown.md /␜//
# Markdown Craftsmanship Standards

Use `#` for titles. Maintain hierarchy order (no skipping levels). Only one `#` per file (main title).

Separate paragraphs with blank lines. Avoid long lines (>120 chars). Keep spacing consistent.

Use `-` for unordered lists. Use `1.` only for ordered items. Always insert space after bullet.

Use single backticks for inline code: `` `example` ``. Use triple backticks for code blocks with language annotation:

```ts
const foo = "bar";
```

Use **bold** for key terms, *italics* for filenames or soft emphasis. Don’t overformat.

Links should be descriptive: `[Installation Guide](#installation)` — not `[click here]`. Use reference links for footnotes.

Images must include alt text: `![Architecture diagram](./diagram.png)`. Avoid decorative images without context.

Use `>` only for callouts, quotes, or tips. Don’t use them as layout decoration.

Align tables properly. Headers and rows should be readable with padded pipes (`|`).

Avoid disabling linters like `<!-- markdownlint-disable -->` unless truly necessary. Prefer fixing issues.

README files must contain:
- Clear title and status badges
- Concise description
- Table of contents (for long files)
- How to install, run, and test
- Usage examples (CLI, API, etc.)
- License and author info

Separate files for:
- `CHANGELOG.md`: semantic version entries (`Added`, `Changed`, etc.)
- `CONTRIBUTING.md`: clear steps to contribute
- `CODE_OF_CONDUCT.md`: if open source

Use `markdownlint`, `prettier`, or `mdformat` to automate formatting.

Be readable. Be informative. Be clean. Be Markdown.