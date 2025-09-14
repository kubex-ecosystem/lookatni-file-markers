# Markers

!!! note "Legend for invisible markers"
    In documentation, the invisible File Separator (ASCII 28) is shown as the symbol ␜ for readability. Real artifacts contain the actual control character, not the symbol.

LookAtni Marker Spec v1 defines a simple, robust format:

- Marker line: `//\x1C/ path/relative.ext /\x1C//`
- Content: Lines until the next marker or EOF
- Encoding: UTF-8 text

Validity rules and metadata are documented in `spec/marker-v1.md`.

Common operations:

```text
//␜/ README.md /␜//
Hello

//␜/ src/index.js /␜//
console.log('ok')
```

Why ASCII 28? Invisible, portable and conflict-free in code blocks.

## Header Metadata

Artifacts begin with an optional `PROJECT_INFO` block carrying metadata:

```text
//␜/ PROJECT_INFO /␜//
Project: my-project
Generated: 2025-09-13T12:34:56Z
Total Files: 42
Source: /path/to/my-project
Generator: lookatni-core v1.1.0
MarkerSpec: v1
FS: 28
MarkerTokens: //\x1C/ <path> /\x1C//
Encoding: utf-8
```

- Communicates the spec version, chosen separator and token layout.
- Enables future profiles (e.g., v1.1 with base64 transport for binaries) without breaking v1.

## FS Autodetect

- Validator and Extractor auto-detect the separator (any control char 0x00–0x1F) via a backreference pattern.
- Default is ASCII 28; header records the actual value used.

## Strict Mode

- Flags “marker-like” lines that contain FS tokens but don’t match the canonical regex.
- Treats “no markers at all” as invalid.
- Useful to catch subtle formatting errors introduced by third-party tools.

Enable it via CLI (`lookatni validate --strict`) or programmatically in the Core.

## Naming Convention (temporary)

- To maximize compatibility and easy preview in editors, prefer `.lkt.txt` filenames for generated artifacts (e.g., `project.lkt.txt`).
- The suffix `.txt` keeps double-click and syntax highlighting friendly; `.lkt` signals LookAtni.
