---
title: LookAtni Marker Spec v1
version: 1.0.0
owner: kubex
audience: dev
languages: [en, pt-BR]
sources: ["core/src/lib/*.ts", "cli/internal/parser/markers.go", "extension/src/*"]
assumptions: []
---

TL;DR

- Single-file archives of projects using invisible markers based on ASCII 28 (File Separator).
- Marker line format: `//\x1C/ relative/path.ext /\x1C//` alone on its own line.
- Everything after a marker line until the next marker (or EOF) is the file content.
- No trailing empty lines are required; consumers may trim trailing newlines when finalizing markers.

Core Format

- Delimiter: ASCII 28 (FS). In code: `String.fromCharCode(28)` or `rune(28)`.
- Marker regex (canonical): `^//\x1C/ (.+?) /\x1C//$`.
- Path: POSIX-style relative path (no drive letters). `..` and absolute paths are invalid.
- Encoding: UTF-8 text. Binary content optionally supported via separate transport (future v1.1 extension).

Validity Rules

- Non-empty filename with only portable characters: reject `< > : " | ? *` and control chars `\x00-\x1f`.
- Reserved (Windows) base names forbidden: `CON, PRN, AUX, NUL, COM1-9, LPT1-9`.
- Duplicate filenames are warnings (allowed), but recommended to avoid.
- Empty content is allowed but flagged as warning by validators.
- Files with no markers at all are invalid.

Metadata (Optional)

- Special section: `//\x1C/ PROJECT_INFO /\x1C//` followed by key-value lines:
  - `Project: <name>`
  - `Generated: <ISO8601>`
  - `Total Files: <n>`
  - `Source: <path>`
  - `Generator: <tool version>`
- Consumers must stop parsing metadata when a new marker line is found.

Extraction Rules

- Create parent directories as needed.
- Conflict policy: skip | overwrite | backup; default: skip if not specified by client.
- Preserve timestamps is optional; checksum validation optional (not mandated by v1).

Generation Rules

- Emit marker line, optional metadata lines, then raw file content.
- End each file block with a newline to maintain readability; consumers must tolerate missing trailing newline.

Cross-language Parity

- TS core, Go CLI, and Extension must parse using the same regex and rules.
- Conformance validated by fixtures in `spec/fixtures/`.

Risks & Mitigations

- Some transports may strip ASCII 28: provide base64 transport option where required [ASSUMPTION].
- Large files inflate single-file archives: use exclude patterns and size limits.

Next Steps

- Keep this spec versioned (SemVer). Breaking changes require v2.
- Extend with binary/base64 transport profile in v1.1.

Strict Mode (Validator)

- Optional validator mode that flags any line containing FS tokens that does not match the canonical marker regex.
- Useful to detect “quase-marcadores” inseridos incorretamente por ferramentas.
