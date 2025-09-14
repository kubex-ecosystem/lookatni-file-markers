# 🚀 LookAtni File Markers

Transform single documents into full project structures, and back — with invisible, portable markers. DX-first, no lock-in.

!!! tip "One Command = One Result"
    Build, test and use across Core (TS), CLI (Go) and VS Code Extension with a predictable workflow.

## Why LookAtni

- AI code extraction that actually works across tools.
- Share runnable project slices without archives.
- Perfect for tutorials, reviews and CI pipelines.

## What You Get (3 modos)

- Core (Node Library): `lookatni-core` — API programática para gerar, extrair, validar e fazer parse.
- VS Code Extension: experiência visual e comandos.
- CLI (Go): automação e CI/CD.

O formato usa separador invisível (ASCII 28), autodetectado pelos parsers.

Get started in minutes:

```bash
# Generate markers from a folder (temporary naming)
lookatni generate ./my-project project.lkt.txt

# Extract back into a directory
lookatni extract project.lkt.txt ./restored
```

Or use the Node library directly:

```ts
import { parseMarkersFromFile, generateMarkers } from 'lookatni-core';

const parsed = parseMarkersFromFile('./project.lkt.txt');
console.log(parsed.totalFiles);

const gen = await generateMarkers('./src');
console.log(gen.totalFiles);
```

Contribute and collaborate:

- GitHub: open issues, discussions, PRs
- Docs “Node Library” → quickstart e API overview
