# 🏗️ Marker Generation

Transform any project into portable, shareable markers with intelligent file organization and metadata preservation.

## Overview

The Marker Generation system is the heart of LookAtni File Markers. It analyzes your project structure, applies intelligent filters, and creates a single text file containing all your project files with unique separation markers.

## How It Works

### File Analysis

LookAtni performs deep analysis of your project:

1. **Structure Mapping** - Maps complete directory hierarchy
2. **File Type Detection** - Identifies programming languages and file types
3. **Dependency Analysis** - Detects package files and dependencies
4. **Size Calculation** - Measures file sizes and project complexity
5. **Relationship Mapping** - Understands file imports and references

### Intelligent Filtering

Advanced filtering keeps your markers clean and focused:

```typescript
// Default exclusion patterns
const defaultExcludes = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '*.log',
  'coverage',
  '.DS_Store'
];

// Size-based filtering
const maxFileSize = 1000; // KB
const totalSizeLimit = 50000; // KB
```

### Marker Format

Each file is wrapped with unique markers:

```text
//␜/ path/to/file.js /␜//
[File content here]

//␜/ path/to/another.js /␜//
[Another file content]
```

## Generation Modes

### Interactive Mode

Step-by-step generation with full control:

1. **Command Palette** → `LookAtni: Generate Markers`
2. **Select source folder**
3. **Choose output location**
4. **Configure filters and options**
5. **Review and generate**

### Quick Mode

Fast generation with smart defaults:

1. **Right-click** on folder in Explorer
2. **Select** "LookAtni: Generate Markers"
3. **Choose output file**
4. **Generate instantly**

### CLI Mode

Programmatic generation for automation:

```bash
# Basic generation
npm run lookatni generate ./src markers.txt

# With custom options
npm run lookatni generate ./project output.txt \
  --exclude node_modules \
  --exclude "*.log" \
  --max-size 500 \
  --include "*.ts" \
  --include "*.js"
```

## Configuration Options

### File Filters

Control which files are included:

```json
{
  "lookatni.includePatterns": [
    "*.ts",
    "*.js",
    "*.tsx",
    "*.jsx",
    "*.css",
    "*.md"
  ],
  "lookatni.excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build",
    "*.log",
    "coverage",
    ".DS_Store",
    "*.min.js"
  ]
}
```

### Size Limits

Manage marker file size:

```json
{
  "lookatni.defaultMaxFileSize": 1000,
  "lookatni.maxTotalSize": 50000,
  "lookatni.warnOnLargeFiles": true,
  "lookatni.compressLargeContent": true
}
```

### Output Options

Customize the generated markers:

```json
{
  "lookatni.includeMetadata": true,
  "lookatni.includeTimestamp": true,
  "lookatni.includeStatistics": true,
  "lookatni.preserveLineEndings": true
}
```

## Advanced Features

### Template System

Use templates for consistent generation:

```yaml
# .lookatni/template.yml
name: "React Project Template"
description: "Standard React project structure"

include:
  - "src/**/*.{ts,tsx,js,jsx}"
  - "public/**/*"
  - "package.json"
  - "README.md"

exclude:
  - "node_modules"
  - "build"
  - "dist"

options:
  maxFileSize: 500
  includeTests: true
  preserveComments: true
```

### Batch Processing

Generate multiple marker sets:

```typescript
// Batch configuration
const batchConfig = {
  projects: [
    { source: './frontend', output: 'frontend-markers.txt' },
    { source: './backend', output: 'backend-markers.txt' },
    { source: './shared', output: 'shared-markers.txt' }
  ],
  globalExcludes: ['node_modules', '.git'],
  maxSize: 1000
};
```

### Custom Markers

Define custom marker patterns:

```json
{
  "lookatni.customMarkers": {
    "startPattern": "//=== START: {path} ===//",
    "endPattern": "//=== END: {path} ===//",
    "metadataPattern": "// Metadata: {metadata}"
  }
}
```

## Generation Statistics

Track generation metrics:

```typescript
interface GenerationStats {
  totalFiles: number;
  totalSize: number;
  processedFiles: number;
  skippedFiles: number;
  warnings: string[];
  duration: number;
  outputSize: number;
}
```

### Real-time Progress

Monitor generation progress:

```text
🔄 Analyzing project structure...
📁 Found 156 files in 23 directories
🔍 Applying filters...
✅ 89 files selected for processing
📦 Generating markers...
   ├─ Processing src/components... (12/89)
   ├─ Processing src/utils... (24/89)
   └─ Processing tests... (45/89)
✅ Generation complete! (2.3s)
```

## Error Handling

Robust error handling and recovery:

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Files too large | Individual files exceed size limit | Increase limit or exclude files |
| Permission denied | Insufficient file access rights | Check file permissions |
| Out of memory | Project too large for available RAM | Use batch processing |
| Invalid encoding | Binary files or encoding issues | Update file filters |

### Validation

Automatic validation during generation:

```typescript
interface ValidationResult {
  isValid: boolean;
  warnings: Warning[];
  errors: Error[];
  suggestions: string[];
}
```

## Performance Optimization

### Async Processing

Non-blocking generation with progress updates:

```typescript
async function generateMarkers(options: GenerationOptions): Promise<GenerationResult> {
  const progress = new Progress();
  
  for await (const file of processFiles(options)) {
    await processFile(file);
    progress.update();
  }
  
  return result;
}
```

### Memory Management

Efficient memory usage for large projects:

- **Streaming processing** for large files
- **Garbage collection** between files
- **Chunk-based reading** for binary detection
- **Progressive output** to disk

### Caching

Smart caching for repeated operations:

```typescript
interface CacheEntry {
  path: string;
  hash: string;
  metadata: FileMetadata;
  lastModified: Date;
}
```

## Best Practices

### Project Organization

- **Use consistent folder structure**
- **Maintain clean dependencies**
- **Document file purposes**
- **Organize by feature, not type**

### Filter Strategy

- **Start with broad excludes**
- **Gradually refine includes**
- **Test with small projects first**
- **Monitor generated sizes**

### Quality Control

- **Validate before sharing**
- **Test extraction regularly**
- **Review generated statistics**
- **Keep templates updated**

---

!!! success "🎯 Generation Mastery"
    
    Master the generation system to create perfect, portable project snapshots every time!
