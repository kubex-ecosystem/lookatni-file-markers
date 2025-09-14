# Configuration

Core options to control generation and extraction.

## Generation

- `maxFileSize` (KB, -1 no limit)
- `excludePatterns`
- `includeMetadata` (default: true)
- `includeBinaryFiles` (default: false)
- `encoding` (default: utf-8)

## Extraction

- `overwriteExisting`
- `createDirectories`
- `conflictResolution` (overwrite | skip | backup)
- `dryRun`

See TypeScript types in `core/src/lib/types.ts`.

