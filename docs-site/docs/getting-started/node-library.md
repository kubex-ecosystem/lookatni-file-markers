# Node Library (lookatni-core)

Use LookAtni programmatically in any Node project (TypeScript or JavaScript).

## Install

```bash
npm install lookatni-core
# or
pnpm add lookatni-core
```

Optional convenience import (if you already depend on the extension/CLI):
```ts
// Reexports the same API from lookatni-core
import { parseMarkers } from 'lookatni-file-markers/lib';
```

## Quickstart (TS/ESM)

```ts
import {
  parseMarkers,
  parseMarkersFromFile,
  generateMarkers,
  validateMarkers,
  validateMarkerFile,
  createExtractor,
  createGenerator,
  createValidator,
} from 'lookatni-core';

// Parse from string
const markersText = `//\u001C/ src/hello.ts /\u001C//\nexport const hi = 'Hello';`;
const parsed = parseMarkers(markersText);
console.log(parsed.totalFiles, parsed.markers[0].filename); // 1, 'src/hello.ts'

// Parse from file
const parsedFile = parseMarkersFromFile('./project.lookatni.txt');

// Validate
const validation = validateMarkers(markersText);
console.log(validation.isValid, validation.statistics.totalFiles);

// Generate from a folder (returns content string)
const gen = await generateMarkers('./src');
console.log(gen.totalFiles, gen.content?.length);

// Extract to a directory (class API)
const extractor = createExtractor();
await extractor.extract(parsedFile.markers.map(m => `//\u001C/ ${m.filename} /\u001C//\n${m.content}`).join('\n'), './out');
```

## API Overview

- Helpers (top‑level):
  - `parseMarkers(content)`, `parseMarkersFromFile(path)`
  - `generateMarkers(sourcePath)`
  - `validateMarkers(content)`, `validateMarkerFile(path)`
- Classes:
  - `MarkerExtractor`, `MarkerGenerator`, `MarkerValidator`
  - Factories: `createExtractor()`, `createGenerator()`, `createValidator()`
- Types (TS): `ParsedMarker`, `ParseResults`, `GenerationResult`, `ExtractionResult`, `ValidationResult`, etc.

## Notes

- O parser autodetecta o separador (ASCII 28 por padrão) e suporta frontmatter opcional para padrões custom.
- Para ergonomia, a extensão/CLI reexporta a API do core em `lookatni-file-markers/lib`.
- Extração para disco: prefira a API de classe (`createExtractor().extract(...)`).
