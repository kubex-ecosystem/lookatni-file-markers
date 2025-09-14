# Marker Profiles

LookAtni supports multiple marker formats (profiles) via frontmatter or generation options.

## Profiles

- HTML: `<!-- FILE: path/rel -->`
- Markdown: `[//]: # (FILE: path/rel)`
- Code: `// === FILE: path/rel ===`
- Visual: `🔥🔥🔥 FILE: path/rel 🔥🔥🔥`
- Default (v1): `//␜/ path/rel /␜//`

Use frontmatter in artifacts:

```yaml
---
lookatni:
  version: v1
  pattern: "<!-- FILE: {filename} -->"   # or
  # start: "// === FILE:"
  # end:   "==="
  # preset: html|markdown|code|visual
---
```

## Generate with Core (TS)

```ts
const gen = createGenerator();
const content = await gen.generate('./src', {
  markerPreset: 'html',
  includeFrontmatter: true,
});
```

## Generate with CLI (Go)

```bash
cli/bin/lookatni generate ./src out.lkt.txt --marker-preset html
```

The extractor and validator auto-detect the profile via frontmatter, falling back to FS v1 auto-detect.

