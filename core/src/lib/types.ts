// 📋 Core Types - The foundation of everything!

// ⚡ Generation related types
export interface GenerationOptions {
  /** Maximum file size in KB (-1 for no limit) */
  maxFileSize?: number;
  /** Patterns to exclude from generation */
  excludePatterns?: string[];
  /** Include metadata in the generated markers */
  includeMetadata?: boolean;
  /** Include binary files (base64 encoded) */
  includeBinaryFiles?: boolean;
  /** File encoding (default: utf-8) */
  encoding?: string;
  /** Preserve file timestamps */
  preserveTimestamps?: boolean;
  /** Custom metadata to include */
  customMetadata?: Record<string, any>;
  /** Validate before generation */
  validateBeforeGeneration?: boolean;
  /** Progress callback */
  progressCallback?: (progress: GenerationProgress) => void;
}

export interface GenerationProgress {
  /** Current file being processed */
  currentFile: string;
  /** Files processed so far */
  filesProcessed: number;
  /** Total files to process */
  totalFiles: number;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Bytes processed so far */
  bytesProcessed: number;
  /** Total bytes to process */
  totalBytes: number;
}

export interface GenerationResult {
  /** Source folder that was processed */
  sourceFolder: string;
  /** Total files processed */
  totalFiles: number;
  /** Total bytes processed */
  totalBytes: number;
  /** Files that were skipped */
  skippedFiles: Array<{ path: string; reason: string }>;
  /** File types breakdown */
  fileTypes: { [extension: string]: number };
  /** Generated marker content (if not saved to file) */
  content?: string;
}

// 🗂️ Extraction related types
export interface ExtractionOptions {
  /** Overwrite existing files */
  overwriteExisting?: boolean;
  /** Preserve original timestamps */
  preserveTimestamps?: boolean;
  /** Create directories if they don't exist */
  createDirectories?: boolean;
  /** Validate checksums during extraction */
  validateChecksums?: boolean;
  /** How to handle conflicts */
  conflictResolution?: 'overwrite' | 'skip' | 'prompt' | 'backup';
  /** Progress callback */
  progressCallback?: (progress: ExtractionProgress) => void;
  /** Conflict callback for custom resolution */
  conflictCallback?: (conflict: FileConflict) => ConflictResolution;
  /** Dry run (don't actually extract) */
  dryRun?: boolean;
}

export interface ExtractionProgress {
  /** Current file being extracted */
  currentFile: string;
  /** Files extracted so far */
  filesExtracted: number;
  /** Total files to extract */
  totalFiles: number;
  /** Percentage complete (0-100) */
  percentage: number;
}

export interface ExtractionResult {
  /** Files successfully extracted */
  filesExtracted: number;
  /** Files skipped due to conflicts or errors */
  filesSkipped: number;
  /** List of extracted file paths */
  extractedFiles: string[];
  /** Extraction errors */
  errors: string[];
  /** Overall success status */
  success: boolean;
}

export interface FileConflict {
  /** Path of the conflicting file */
  filePath: string;
  /** Reason for the conflict */
  reason: string;
  /** Existing file info */
  existingFile?: FileInfo;
  /** New file info */
  newFile?: FileInfo;
}

export type ConflictResolution = 'overwrite' | 'skip' | 'backup';

// ✅ Validation related types
export interface ValidationResult {
  /** Whether the marker is valid */
  isValid: boolean;
  /** Marker format version */
  version?: string;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationError[];
  /** Marker statistics */
  statistics: MarkerStatistics;
  /** Marker metadata */
  metadata?: MarkerMetadata;
}

export interface ValidationError {
  /** Type of validation error */
  type: 'structure' | 'checksum' | 'metadata' | 'format' | 'filename';
  /** Error message */
  message: string;
  /** Line number where error occurred */
  line?: number;
  /** File path related to error */
  file?: string;
  /** Error severity */
  severity: 'error' | 'warning';
}

export interface MarkerStatistics {
  /** Total number of markers */
  totalMarkers: number;
  /** Total number of unique files */
  totalFiles: number;
  /** Total bytes in all files */
  totalBytes: number;
  /** Duplicate filenames found */
  duplicateFilenames: string[];
  /** Invalid filenames found */
  invalidFilenames: string[];
  /** Empty markers count */
  emptyMarkers: number;
  /** File type breakdown */
  fileTypes: { [extension: string]: number };
}

// 📄 Core data structures
export interface ParsedMarker {
  /** Filename for this marker */
  filename: string;
  /** File content */
  content: string;
  /** Starting line number in marker file */
  startLine: number;
  /** Ending line number in marker file */
  endLine: number;
  /** File metadata */
  metadata?: FileMetadata;
}

export interface ParseResults {
  /** Total markers found */
  totalMarkers: number;
  /** Total unique files */
  totalFiles: number;
  /** Total bytes across all files */
  totalBytes: number;
  /** Parsing errors */
  errors: Array<{ line: number; message: string }>;
  /** Parsed markers */
  markers: ParsedMarker[];
}

export interface FileInfo {
  /** File path */
  path: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  mtime: Date;
  /** File type/extension */
  type: string;
  /** Whether file is binary */
  isBinary: boolean;
  /** File checksum (if available) */
  checksum?: string;
}

export interface FileMetadata {
  /** Original file size */
  originalSize: number;
  /** Last modified timestamp */
  lastModified: string;
  /** File permissions */
  permissions?: string;
  /** File checksum */
  checksum?: string;
  /** Custom metadata */
  custom?: Record<string, any>;
}

export interface MarkerMetadata {
  /** Project name */
  projectName?: string;
  /** Generation timestamp */
  generatedAt: string;
  /** Generator version */
  version: string;
  /** Source folder */
  sourceFolder: string;
  /** Total files included */
  totalFiles: number;
  /** Custom metadata */
  custom?: Record<string, any>;
}

// 🏭 Configuration types
export interface GeneratorConfig {
  /** Default encoding for text files */
  defaultEncoding?: string;
  /** Maximum concurrent file processing */
  maxConcurrentFiles?: number;
  /** Default exclusion patterns */
  defaultExcludePatterns?: string[];
  /** Maximum file size in KB */
  defaultMaxFileSize?: number;
}

export interface ExtractorConfig {
  /** Default conflict resolution */
  defaultConflictResolution?: ConflictResolution;
  /** Create directories by default */
  defaultCreateDirectories?: boolean;
  /** Validate checksums by default */
  defaultValidateChecksums?: boolean;
}

export interface ValidatorConfig {
  /** Custom validation rules */
  customRules?: ValidationRule[];
  /** Strict validation mode */
  strictMode?: boolean;
}

export interface ValidationRule {
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Validation function */
  validate: (marker: ParsedMarker[]) => ValidationRuleResult;
}

export interface ValidationRuleResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: ValidationError[];
}

// 🎛️ Event callback types
export type ProgressCallback = (progress: GenerationProgress | ExtractionProgress) => void;
export type ErrorCallback = (error: Error) => void;
export type CompleteCallback = (result: GenerationResult | ExtractionResult) => void;
export type ConflictCallback = (conflict: FileConflict) => ConflictResolution;
