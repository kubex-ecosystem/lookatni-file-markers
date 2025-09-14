# 🚀 Extension API Reference

Comprehensive API documentation for developers who want to extend LookAtni File Markers or integrate it into other tools and workflows.

## 📚 Core API Overview

The LookAtni Extension API provides programmatic access to all marker generation, extraction, and management functionality. The API is designed to be type-safe, extensible, and easy to use.

### Installation

```typescript
npm install lookatni-core
```

### Basic Usage

```typescript
import { 
  MarkerGenerator, 
  MarkerExtractor, 
  MarkerValidator,
  ConfigManager 
} from 'lookatni-core';

// Initialize components
const generator = new MarkerGenerator();
const extractor = new MarkerExtractor();
const validator = new MarkerValidator();
```

## 🎯 Core Classes

### MarkerGenerator

Generates marker files from source directories.

```typescript
class MarkerGenerator {
  constructor(config?: GeneratorConfig);
  
  async generate(
    sourcePath: string, 
    options?: GenerationOptions
  ): Promise<string>;
  
  async generateToFile(
    sourcePath: string, 
    outputPath: string, 
    options?: GenerationOptions
  ): Promise<void>;
  
  async generateBatch(
    sources: BatchSource[], 
    options?: BatchOptions
  ): Promise<BatchResult[]>;
  
  setConfig(config: GeneratorConfig): void;
  getConfig(): GeneratorConfig;
  
  // Event handlers
  onProgress(callback: ProgressCallback): void;
  onError(callback: ErrorCallback): void;
  onComplete(callback: CompleteCallback): void;
}
```

#### Generation Options

```typescript
interface GenerationOptions {
  includeMetadata?: boolean;
  compressionLevel?: number;
  excludePatterns?: string[];
  includeBinaryFiles?: boolean;
  maxFileSize?: number;
  encoding?: string;
  preserveTimestamps?: boolean;
  customMetadata?: Record<string, any>;
  validateBeforeGeneration?: boolean;
  progressCallback?: ProgressCallback;
}
```

#### Example Usage

```typescript
const generator = new MarkerGenerator({
  defaultEncoding: 'utf-8',
  maxConcurrentFiles: 50
});

// Generate with options
const markerContent = await generator.generate('./my-project', {
  includeMetadata: true,
  compressionLevel: 2,
  excludePatterns: ['node_modules/**', '*.log'],
  customMetadata: {
    version: '1.0.0',
    author: 'John Doe',
    purpose: 'API Documentation Example'
  },
  progressCallback: (progress) => {
    console.log(`Progress: ${progress.percentage}% - ${progress.currentFile}`);
  }
});

// Save to file
await generator.generateToFile('./my-project', './project.lookatni', {
  compressionLevel: 3,
  includeMetadata: true
});
```

### MarkerExtractor

Extracts projects from marker files.

```typescript
class MarkerExtractor {
  constructor(config?: ExtractorConfig);
  
  async extract(
    markerContent: string, 
    targetPath: string, 
    options?: ExtractionOptions
  ): Promise<ExtractionResult>;
  
  async extractFromFile(
    markerPath: string, 
    targetPath: string, 
    options?: ExtractionOptions
  ): Promise<ExtractionResult>;
  
  async extractSelected(
    markerContent: string, 
    targetPath: string, 
    selectedFiles: string[], 
    options?: ExtractionOptions
  ): Promise<ExtractionResult>;
  
  async getFileList(markerContent: string): Promise<FileInfo[]>;
  async getMetadata(markerContent: string): Promise<MarkerMetadata>;
  
  // Validation
  async validateMarker(markerContent: string): Promise<ValidationResult>;
  
  // Event handlers
  onProgress(callback: ProgressCallback): void;
  onConflict(callback: ConflictCallback): void;
  onError(callback: ErrorCallback): void;
}
```

#### Extraction Options

```typescript
interface ExtractionOptions {
  overwriteExisting?: boolean;
  preserveTimestamps?: boolean;
  createDirectories?: boolean;
  validateChecksums?: boolean;
  conflictResolution?: 'overwrite' | 'skip' | 'prompt' | 'backup';
  progressCallback?: ProgressCallback;
  conflictCallback?: ConflictCallback;
  dryRun?: boolean;
}
```

#### Example Usage

```typescript
const extractor = new MarkerExtractor();

// Extract from file
const result = await extractor.extractFromFile('./project.lookatni', './restored', {
  overwriteExisting: false,
  preserveTimestamps: true,
  validateChecksums: true,
  conflictResolution: 'backup',
  progressCallback: (progress) => {
    console.log(`Extracting: ${progress.currentFile}`);
  },
  conflictCallback: (conflict) => {
    console.log(`Conflict detected: ${conflict.filePath}`);
    return 'backup'; // Create backup of existing file
  }
});

console.log(`Extracted ${result.filesExtracted} files`);
console.log(`Skipped ${result.filesSkipped} files due to conflicts`);

// Get file list without extracting
const fileList = await extractor.getFileList(markerContent);
console.log('Files in marker:', fileList.map(f => f.path));
```

### MarkerValidator

Validates marker files and their integrity.

```typescript
class MarkerValidator {
  constructor(config?: ValidatorConfig);
  
  async validate(markerContent: string): Promise<ValidationResult>;
  async validateFile(markerPath: string): Promise<ValidationResult>;
  
  async validateStructure(markerContent: string): Promise<StructureValidation>;
  async validateChecksums(markerContent: string): Promise<ChecksumValidation>;
  async validateMetadata(markerContent: string): Promise<MetadataValidation>;
  
  // Custom validation rules
  addRule(rule: ValidationRule): void;
  removeRule(ruleName: string): void;
  getRules(): ValidationRule[];
}
```

#### Validation Result

```typescript
interface ValidationResult {
  isValid: boolean;
  version: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  statistics: MarkerStatistics;
  metadata: MarkerMetadata;
}

interface ValidationError {
  type: 'structure' | 'checksum' | 'metadata' | 'format';
  message: string;
  line?: number;
  file?: string;
  severity: 'error' | 'warning';
}
```

#### Example Usage

```typescript
const validator = new MarkerValidator();

// Validate marker file
const result = await validator.validateFile('./project.lookatni');

if (result.isValid) {
  console.log('Marker is valid!');
  console.log(`Contains ${result.statistics.fileCount} files`);
  console.log(`Total size: ${result.statistics.totalSize} bytes`);
} else {
  console.log('Validation failed:');
  result.errors.forEach(error => {
    console.log(`- ${error.type}: ${error.message}`);
  });
}

// Add custom validation rule
validator.addRule({
  name: 'no-large-files',
  description: 'Ensure no files exceed 10MB',
  validate: (marker) => {
    const largeFiles = marker.files.filter(f => f.size > 10 * 1024 * 1024);
    if (largeFiles.length > 0) {
      return {
        isValid: false,
        errors: largeFiles.map(f => ({
          type: 'structure',
          message: `File ${f.path} exceeds 10MB limit`,
          severity: 'error'
        }))
      };
    }
    return { isValid: true, errors: [] };
  }
});
```

## 🔧 Configuration Management

### ConfigManager

Manages configuration across different scopes.

```typescript
class ConfigManager {
  static getInstance(): ConfigManager;
  
  // Configuration loading
  async loadConfig(scope?: ConfigScope): Promise<LookatniConfig>;
  async saveConfig(config: LookatniConfig, scope?: ConfigScope): Promise<void>;
  
  // Specific setting management
  getSetting<T>(key: string, defaultValue?: T): T;
  setSetting<T>(key: string, value: T, scope?: ConfigScope): Promise<void>;
  
  // Configuration merging
  mergeConfigs(...configs: LookatniConfig[]): LookatniConfig;
  
  // Validation
  validateConfig(config: LookatniConfig): ConfigValidationResult;
  
  // Events
  onConfigChanged(callback: ConfigChangeCallback): void;
}
```

#### Configuration Scopes

```typescript
enum ConfigScope {
  Global = 'global',      // ~/.lookatni/config.json
  Project = 'project',    // .lookatni.json in project root
  Workspace = 'workspace', // VS Code workspace settings
  Runtime = 'runtime'     // Temporary runtime configuration
}
```

#### Example Usage

```typescript
const configManager = ConfigManager.getInstance();

// Load configuration
const config = await configManager.loadConfig(ConfigScope.Project);

// Update setting
await configManager.setSetting('compressionLevel', 3, ConfigScope.Project);

// Get setting with default
const maxFileSize = configManager.getSetting('maxFileSize', 10485760); // 10MB default

// Listen for configuration changes
configManager.onConfigChanged((changes) => {
  console.log('Configuration changed:', changes);
});
```

## 🎨 Advanced Features

### Custom File Processors

Extend LookAtni to handle custom file types.

```typescript
interface FileProcessor {
  name: string;
  extensions: string[];
  canProcess(filePath: string, content: Buffer): boolean;
  
  process(
    filePath: string, 
    content: Buffer, 
    context: ProcessingContext
  ): Promise<ProcessedFile>;
  
  restore(
    processedContent: string, 
    context: RestorationContext
  ): Promise<Buffer>;
}

class CustomFileProcessor implements FileProcessor {
  name = 'custom-processor';
  extensions = ['.custom'];
  
  canProcess(filePath: string, content: Buffer): boolean {
    return path.extname(filePath) === '.custom';
  }
  
  async process(
    filePath: string, 
    content: Buffer, 
    context: ProcessingContext
  ): Promise<ProcessedFile> {
    // Custom processing logic
    const processed = await this.customTransformation(content);
    
    return {
      content: processed.toString('utf-8'),
      metadata: {
        originalSize: content.length,
        processedSize: processed.length,
        processingTime: Date.now() - context.startTime
      }
    };
  }
  
  async restore(
    processedContent: string, 
    context: RestorationContext
  ): Promise<Buffer> {
    // Reverse the custom transformation
    return await this.reverseTransformation(processedContent);
  }
  
  private async customTransformation(content: Buffer): Promise<Buffer> {
    // Implementation specific to file type
    return content;
  }
  
  private async reverseTransformation(content: string): Promise<Buffer> {
    // Implementation specific to file type
    return Buffer.from(content);
  }
}

// Register custom processor
const generator = new MarkerGenerator();
generator.registerProcessor(new CustomFileProcessor());
```

### Plugin System

Create plugins to extend functionality.

```typescript
interface LookatniPlugin {
  name: string;
  version: string;
  
  initialize(context: PluginContext): Promise<void>;
  shutdown(): Promise<void>;
  
  // Hook implementations
  beforeGeneration?(context: GenerationContext): Promise<void>;
  afterGeneration?(context: GenerationContext, result: string): Promise<string>;
  
  beforeExtraction?(context: ExtractionContext): Promise<void>;
  afterExtraction?(context: ExtractionContext, result: ExtractionResult): Promise<void>;
  
  // Command contributions
  getCommands?(): PluginCommand[];
  
  // Configuration contributions
  getConfigSchema?(): ConfigSchema;
}

class ExamplePlugin implements LookatniPlugin {
  name = 'example-plugin';
  version = '1.0.0';
  
  async initialize(context: PluginContext): Promise<void> {
    console.log('Example plugin initialized');
  }
  
  async shutdown(): Promise<void> {
    console.log('Example plugin shutdown');
  }
  
  async beforeGeneration(context: GenerationContext): Promise<void> {
    // Add custom metadata
    context.options.customMetadata = {
      ...context.options.customMetadata,
      pluginVersion: this.version
    };
  }
  
  async afterGeneration(
    context: GenerationContext, 
    result: string
  ): Promise<string> {
    // Post-process the generated marker
    return result + '\n// Enhanced by Example Plugin';
  }
  
  getCommands(): PluginCommand[] {
    return [
      {
        id: 'example.custom-command',
        title: 'Custom Command',
        handler: this.handleCustomCommand.bind(this)
      }
    ];
  }
  
  private async handleCustomCommand(): Promise<void> {
    console.log('Custom command executed');
  }
}

// Register plugin
const pluginManager = PluginManager.getInstance();
await pluginManager.registerPlugin(new ExamplePlugin());
```

### Stream Processing

Handle large files efficiently with streaming.

```typescript
class StreamingGenerator extends MarkerGenerator {
  async generateStream(
    sourcePath: string, 
    outputStream: NodeJS.WritableStream,
    options?: GenerationOptions
  ): Promise<void> {
    const scanner = new FileScanner(sourcePath, options?.excludePatterns);
    
    // Write header
    await this.writeHeader(outputStream, sourcePath, options);
    
    // Process files in chunks
    for await (const fileChunk of scanner.scanInChunks()) {
      for (const file of fileChunk) {
        await this.processFileToStream(file, outputStream, options);
      }
    }
  }
  
  private async processFileToStream(
    file: FileInfo, 
    stream: NodeJS.WritableStream,
    options?: GenerationOptions
  ): Promise<void> {
    // Stream file content to output
    const fileStream = await this.createFileStream(file);
    
    stream.write(`\n// === File: ${file.path} ===\n`);
    stream.write(`// Size: ${file.size} | Modified: ${file.mtime}\n`);
    
    fileStream.pipe(stream, { end: false });
    
    return new Promise((resolve, reject) => {
      fileStream.on('end', resolve);
      fileStream.on('error', reject);
    });
  }
}
```

## 📊 Analytics and Monitoring

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();
  
  startTiming(operation: string): TimingToken {
    const token = new TimingToken(operation);
    return token;
  }
  
  recordMetric(name: string, value: number, unit: string): void {
    const metric = this.metrics.get(name) || new Metric(name, unit);
    metric.addValue(value);
    this.metrics.set(name, metric);
  }
  
  getMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }
  
  generateReport(): PerformanceReport {
    return {
      timestamp: new Date(),
      metrics: Array.from(this.metrics.values()),
      summary: this.calculateSummary()
    };
  }
}

// Usage with generator
const monitor = new PerformanceMonitor();
const generator = new MarkerGenerator();

generator.onProgress((progress) => {
  monitor.recordMetric('files_processed', 1, 'count');
  monitor.recordMetric('bytes_processed', progress.bytesProcessed, 'bytes');
});

const timing = monitor.startTiming('generation');
const marker = await generator.generate('./project');
timing.end();

const report = monitor.generateReport();
console.log('Performance Report:', report);
```

### Usage Analytics

```typescript
interface UsageTracker {
  trackGeneration(options: GenerationOptions, result: GenerationResult): void;
  trackExtraction(options: ExtractionOptions, result: ExtractionResult): void;
  trackValidation(result: ValidationResult): void;
  
  getUsageReport(timeframe: TimeRange): UsageReport;
  exportAnalytics(format: 'json' | 'csv' | 'xlsx'): Promise<Buffer>;
}

class LocalUsageTracker implements UsageTracker {
  private events: AnalyticsEvent[] = [];
  
  trackGeneration(options: GenerationOptions, result: GenerationResult): void {
    this.events.push({
      type: 'generation',
      timestamp: new Date(),
      data: { options, result }
    });
  }
  
  // ... other tracking methods
  
  getUsageReport(timeframe: TimeRange): UsageReport {
    const relevantEvents = this.events.filter(event => 
      event.timestamp >= timeframe.start && event.timestamp <= timeframe.end
    );
    
    return {
      timeframe,
      totalOperations: relevantEvents.length,
      operationsByType: this.groupByType(relevantEvents),
      averageFileSize: this.calculateAverageFileSize(relevantEvents),
      popularPatterns: this.findPopularPatterns(relevantEvents)
    };
  }
}
```

## 🔐 Security Features

### Access Control

```typescript
interface AccessController {
  checkPermission(operation: string, resource: string, user: string): Promise<boolean>;
  grantPermission(permission: Permission): Promise<void>;
  revokePermission(permissionId: string): Promise<void>;
}

class RoleBasedAccessController implements AccessController {
  private permissions: Map<string, Permission[]> = new Map();
  
  async checkPermission(
    operation: string, 
    resource: string, 
    user: string
  ): Promise<boolean> {
    const userPermissions = this.permissions.get(user) || [];
    
    return userPermissions.some(permission =>
      permission.operation === operation &&
      this.matchesResource(permission.resource, resource)
    );
  }
  
  // ... implementation details
}

// Usage
const accessController = new RoleBasedAccessController();
const generator = new MarkerGenerator();

generator.setAccessController(accessController);

// This will check permissions before generation
await generator.generate('./project', {
  user: 'john.doe',
  requirePermissions: ['read:project', 'generate:marker']
});
```

### Encryption Support

```typescript
interface EncryptionProvider {
  encrypt(data: string, key: string): Promise<string>;
  decrypt(encryptedData: string, key: string): Promise<string>;
}

class AESEncryptionProvider implements EncryptionProvider {
  async encrypt(data: string, key: string): Promise<string> {
    const cipher = crypto.createCipher('aes-256-gcm', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  async decrypt(encryptedData: string, key: string): Promise<string> {
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

// Usage
const encryptionProvider = new AESEncryptionProvider();
const generator = new MarkerGenerator();

generator.setEncryptionProvider(encryptionProvider);

const encryptedMarker = await generator.generate('./project', {
  encrypt: true,
  encryptionKey: 'my-secret-key'
});
```

---

## 📚 API Reference Summary

### Core Classes
- **MarkerGenerator**: Generate markers from projects
- **MarkerExtractor**: Extract projects from markers  
- **MarkerValidator**: Validate marker integrity
- **ConfigManager**: Manage configuration settings

### Extension Points
- **FileProcessor**: Custom file type handling
- **LookatniPlugin**: Extend functionality with plugins
- **AccessController**: Implement access control
- **EncryptionProvider**: Add encryption support

### Utilities
- **PerformanceMonitor**: Track performance metrics
- **UsageTracker**: Analytics and usage tracking
- **StreamingGenerator**: Handle large files efficiently

This comprehensive API enables developers to build powerful integrations and extensions on top of the LookAtni File Markers system.
