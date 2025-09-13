# 🎯 LookAtni Core

**Finally! The real NPM library that actually works!** 🎉

Core library for LookAtni file markers - generate, extract and validate project markers programmatically.

## 🚀 Installation

```bash
npm install lookatni-core
```

## ✨ Quick Start

```typescript
import { MarkerGenerator, MarkerExtractor, MarkerValidator } from 'lookatni-core';

// 🏭 Generate markers from a project
const generator = new MarkerGenerator();
const markerContent = await generator.generate('./my-project', {
  excludePatterns: ['node_modules/**', '*.log'],
  maxFileSize: 500, // KB
  includeMetadata: true
});

// 🗂️ Extract project from markers
const extractor = new MarkerExtractor();
await extractor.extract(markerContent, './restored-project', {
  createDirectories: true,
  conflictResolution: 'backup'
});

// ✅ Validate markers
const validator = new MarkerValidator();
const result = await validator.validate(markerContent);
console.log(`Valid: ${result.isValid}, Files: ${result.statistics.totalFiles}`);
```

## 🎯 Core Classes

### MarkerGenerator

Generate markers from source directories.

```typescript
const generator = new MarkerGenerator({
  defaultEncoding: 'utf-8',
  maxConcurrentFiles: 50
});

// Generate to string
const content = await generator.generate('./project', {
  includeMetadata: true,
  excludePatterns: ['node_modules/**'],
  progressCallback: (progress) => {
    console.log(`${progress.percentage}% - ${progress.currentFile}`);
  }
});

// Generate to file
await generator.generateToFile('./project', './project.lookatni', {
  maxFileSize: 1000,
  customMetadata: { version: '1.0.0', author: 'Your Name' }
});
```

### MarkerExtractor

Extract projects from marker files.

```typescript
const extractor = new MarkerExtractor({
  defaultConflictResolution: 'backup',
  defaultCreateDirectories: true
});

// Extract from content
const result = await extractor.extract(markerContent, './output', {
  overwriteExisting: false,
  progressCallback: (progress) => {
    console.log(`Extracting: ${progress.currentFile}`);
  }
});

// Extract from file
await extractor.extractFromFile('./project.lookatni', './output');

// Get file list without extracting
const fileList = await extractor.getFileList(markerContent);
console.log('Files:', fileList.map(f => f.path));
```

### MarkerValidator

Validate marker files and their integrity.

```typescript
const validator = new MarkerValidator({
  strictMode: true
});

// Validate content
const result = await validator.validate(markerContent);
if (!result.isValid) {
  result.errors.forEach(error => {
    console.log(`${error.type}: ${error.message}`);
  });
}

// Add custom validation rule
validator.addRule({
  name: 'no-large-files',
  description: 'Ensure no files exceed 5MB',
  validate: (markers) => {
    const largeFiles = markers.filter(m => m.content.length > 5 * 1024 * 1024);
    return {
      isValid: largeFiles.length === 0,
      errors: largeFiles.map(f => ({
        type: 'structure',
        message: `File ${f.filename} exceeds 5MB limit`,
        severity: 'error'
      }))
    };
  }
});
```

## 🏭 Factory Functions

For convenience, use factory functions:

```typescript
import { createGenerator, createExtractor, createValidator, createToolset } from 'lookatni-core';

// Individual tools
const generator = createGenerator({ defaultMaxFileSize: 1000 });
const extractor = createExtractor({ defaultConflictResolution: 'skip' });
const validator = createValidator({ strictMode: true });

// Complete toolset
const tools = createToolset({
  generator: { maxConcurrentFiles: 100 },
  extractor: { defaultCreateDirectories: true },
  validator: { strictMode: false }
});

await tools.generator.generateToFile('./project', './project.lookatni');
```

## 📋 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  GenerationOptions,
  ExtractionOptions,
  ValidationResult,
  ParsedMarker,
  FileInfo
} from 'lookatni-core';

const options: GenerationOptions = {
  maxFileSize: 500,
  excludePatterns: ['*.log', 'node_modules/**'],
  includeMetadata: true,
  progressCallback: (progress) => {
    // progress is fully typed
    console.log(`${progress.percentage}% complete`);
  }
};
```

## 🔧 Configuration

### Generator Configuration

```typescript
interface GeneratorConfig {
  defaultEncoding?: string;           // Default: 'utf-8'
  maxConcurrentFiles?: number;        // Default: 50
  defaultExcludePatterns?: string[];  // Default: ['node_modules/**', '.git/**']
  defaultMaxFileSize?: number;        // Default: 1000 (KB)
}
```

### Extractor Configuration

```typescript
interface ExtractorConfig {
  defaultConflictResolution?: 'overwrite' | 'skip' | 'backup'; // Default: 'skip'
  defaultCreateDirectories?: boolean;   // Default: true
  defaultValidateChecksums?: boolean;   // Default: false
}
```

### Validator Configuration

```typescript
interface ValidatorConfig {
  customRules?: ValidationRule[];      // Default: []
  strictMode?: boolean;                // Default: false
}
```

## 🎪 Real World Examples

### React Project Sharing

```typescript
import { createGenerator, createExtractor } from 'lookatni-core';

// Share a React project (without node_modules!)
const generator = createGenerator();
const markers = await generator.generate('./my-react-app', {
  excludePatterns: [
    'node_modules/**',
    'build/**',
    '.git/**',
    '*.log'
  ],
  customMetadata: {
    name: 'My React App',
    version: '1.0.0',
    instructions: 'Run npm install && npm start'
  }
});

// Save for sharing
await generator.generateToFile('./my-react-app', './react-app.lookatni');

// Someone else extracts it
const extractor = createExtractor();
await extractor.extractFromFile('./react-app.lookatni', './received-app');
// Now: cd received-app && npm install && npm start
```

### Code Review with Validation

```typescript
import { createValidator } from 'lookatni-core';

const validator = createValidator();

// Add custom rules for code review
validator.addRule({
  name: 'no-todo-comments',
  description: 'Ensure no TODO comments in production code',
  validate: (markers) => {
    const todosFound = markers.filter(m =>
      m.content.includes('TODO') || m.content.includes('FIXME')
    );

    return {
      isValid: todosFound.length === 0,
      errors: todosFound.map(m => ({
        type: 'structure',
        message: `TODO/FIXME found in ${m.filename}`,
        severity: 'warning'
      }))
    };
  }
});

const result = await validator.validateFile('./project.lookatni');
```

## 🆚 vs. File Archives

| Feature | lookatni-core | ZIP/TAR | Git |
|---------|---------------|---------|-----|
| **Text Format** | ✅ Human readable | ❌ Binary | ✅ Text |
| **Diff Friendly** | ✅ Line-by-line | ❌ Binary blob | ✅ Yes |
| **Pasteable** | ✅ Copy/paste anywhere | ❌ File attachment | ❌ Repo needed |
| **Metadata** | ✅ Custom metadata | ⚠️ Limited | ✅ Commits |
| **Size** | ✅ Small (text only) | ⚠️ Compression varies | ⚠️ History overhead |
| **Dependencies** | ✅ None | ❌ Archive tools | ❌ Git |

## 🛡️ Error Handling

All methods return results with error information:

```typescript
const result = await generator.generate('./project');
console.log(`Processed: ${result.totalFiles} files`);
console.log(`Skipped: ${result.skippedFiles.length} files`);
result.skippedFiles.forEach(skip => {
  console.log(`- ${skip.path}: ${skip.reason}`);
});

const extractResult = await extractor.extract(content, './output');
if (!extractResult.success) {
  console.log('Extraction errors:');
  extractResult.errors.forEach(error => console.log(`- ${error}`));
}
```

## 🏃‍♂️ Performance

- **Streaming**: Large files handled efficiently
- **Concurrent**: Multiple files processed in parallel
- **Memory**: Minimal memory footprint
- **Progress**: Real-time progress callbacks

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for your changes
4. Submit a pull request

## 🎯 About LookAtni

LookAtni File Markers is part of the Kubex ecosystem, designed to democratize code sharing and project collaboration. No more "works on my machine" - share complete, runnable projects instantly.

**Links:**

- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=kubex.lookatni-file-markers)
- [CLI Tool](https://www.npmjs.com/package/lookatni-cli)
- [Documentation](https://kubex-ecosystem.github.io/lookatni-file-markers)
- [GitHub](https://github.com/kubex-ecosystem/lookatni-file-markers)
