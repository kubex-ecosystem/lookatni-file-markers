LookAtni Core (Node Library)

Summary
- Programmatic API for generating, parsing, extracting and validating LookAtni file markers.
- Use in any Node project (TS or JS). This package is framework-agnostic.

Install
- npm: `npm install lookatni-core`
- pnpm: `pnpm add lookatni-core`

Quickstart
- Parse a markers string:
  - `import { parseMarkers } from 'lookatni-core'`
  - `const result = parseMarkers(markersContent)`
  - `result.markers` → array of `{ filename, content }`

- Parse a markers file:
  - `import { parseMarkersFromFile } from 'lookatni-core'`
  - `const result = parseMarkersFromFile('./project.markers.txt')`

- Generate markers from a folder:
  - `import { generateMarkers } from 'lookatni-core'`
  - `const gen = await generateMarkers('./src')`
  - `gen.content` → text containing all markers

- Validate markers:
  - `import { validateMarkers } from 'lookatni-core'`
  - `const res = validateMarkers(markersContent)`
  - `res.isValid` / `res.errors`

Full API
- Classes: `MarkerExtractor`, `MarkerGenerator`, `MarkerValidator`
- Factories: `createExtractor()`, `createGenerator()`, `createValidator()`
- Helpers: `parseMarkers`, `parseMarkersFromFile`, `generateMarkers`, `validateMarkers`, `validateMarkerFile`
- Types: `ParseResults`, `ParsedMarker`, `GenerationResult`, `ExtractionResult`, `ValidationResult`, etc.

Notes
- Markers use the invisible FS char (ASCII 28) by default. The parser auto-detects FS char and supports optional frontmatter configuration.
- For extraction to disk, prefer the class API: `createExtractor().extract(markersContent, './out')`.

