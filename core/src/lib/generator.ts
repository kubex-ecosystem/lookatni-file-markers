// 🏭 Marker Generator - Clean API wrapper for the core functionality

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../core/logger';
import { FileScanner } from '../core/scanner';
import {
  GenerationOptions,
  GenerationProgress,
  GenerationResult,
  GeneratorConfig
} from './types';

export class MarkerGenerator {
  private logger: Logger;
  private scanner: FileScanner;
  private config: GeneratorConfig;

  // ASCII 28 (File Separator) character for invisible markers
  private readonly FS_CHAR = String.fromCharCode(28);

  constructor(config?: GeneratorConfig) {
    this.config = {
      defaultEncoding: 'utf-8',
      maxConcurrentFiles: 50,
      defaultExcludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
      defaultMaxFileSize: 1000,
      ...config
    };

    this.logger = new Logger('generator');
    this.scanner = new FileScanner(this.logger.withContext('scanner'));
  }

  /**
   * Generate markers from a source directory and return content
   */
  async generate(
    sourcePath: string,
    options?: GenerationOptions
  ): Promise<string> {
    this.logger.info(`Generating markers for: ${sourcePath}`);

    const result = await this.generateInternal(sourcePath, undefined, options);
    return result.content || '';
  }

  /**
   * Generate markers from a source directory and save to file
   */
  async generateToFile(
    sourcePath: string,
    outputPath: string,
    options?: GenerationOptions
  ): Promise<void> {
    this.logger.info(`Generating markers for: ${sourcePath} -> ${outputPath}`);

    await this.generateInternal(sourcePath, outputPath, options);
  }

  /**
   * Set configuration
   */
  setConfig(config: GeneratorConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): GeneratorConfig {
    return { ...this.config };
  }

  /**
   * Internal generation method
   */
  private async generateInternal(
    sourcePath: string,
    outputPath?: string,
    options?: GenerationOptions
  ): Promise<GenerationResult> {

    // Merge options with defaults
    const opts: Required<GenerationOptions> = {
      maxFileSize: options?.maxFileSize ?? this.config.defaultMaxFileSize ?? 1000,
      excludePatterns: options?.excludePatterns ?? this.config.defaultExcludePatterns ?? [],
      includeMetadata: options?.includeMetadata ?? true,
      includeBinaryFiles: options?.includeBinaryFiles ?? false,
      encoding: options?.encoding ?? this.config.defaultEncoding ?? 'utf-8',
      preserveTimestamps: options?.preserveTimestamps ?? true,
      customMetadata: options?.customMetadata ?? {},
      validateBeforeGeneration: options?.validateBeforeGeneration ?? false,
      progressCallback: options?.progressCallback ?? (() => { })
    };

    const result: GenerationResult = {
      sourceFolder: sourcePath,
      totalFiles: 0,
      totalBytes: 0,
      skippedFiles: [],
      fileTypes: {}
    };

    // Validate source path
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    if (!fs.statSync(sourcePath).isDirectory()) {
      throw new Error(`Source path is not a directory: ${sourcePath}`);
    }

    // Get all files
    this.logger.info('Scanning files...');
    const allFiles = this.scanner.getAllFiles(sourcePath, opts.excludePatterns);
    this.logger.info(`Found ${allFiles.length} files to process`);

    // Filter by size
    const { valid: validFiles, skipped: sizeSkipped } = this.scanner.filterBySize(allFiles, opts.maxFileSize);
    result.skippedFiles.push(...sizeSkipped);

    // Filter binary files if not included
    let filesToProcess = validFiles;
    if (!opts.includeBinaryFiles) {
      const { valid: textFiles, skipped: binarySkipped } = this.scanner.filterBinaryFiles(validFiles);
      filesToProcess = textFiles;
      result.skippedFiles.push(...binarySkipped);
    }

    this.logger.info(`Processing ${filesToProcess.length} files after filtering`);

    // Create marker content
    let content = this.createHeader(sourcePath, filesToProcess.length, opts.customMetadata);

    // Process each file
    for (let i = 0; i < filesToProcess.length; i++) {
      const filePath = filesToProcess[i];
      const relativePath = path.relative(sourcePath, filePath);

      // Report progress
      const progress: GenerationProgress = {
        currentFile: relativePath,
        filesProcessed: i,
        totalFiles: filesToProcess.length,
        percentage: Math.round((i / filesToProcess.length) * 100),
        bytesProcessed: result.totalBytes,
        totalBytes: 0 // We'll calculate this as we go
      };
      opts.progressCallback(progress);

      try {
        const fileContent = await this.processFile(filePath, sourcePath, opts);
        content += fileContent;

        const stats = fs.statSync(filePath);
        result.totalFiles++;
        result.totalBytes += stats.size;

        // Track file types
        const ext = path.extname(filePath) || 'no-extension';
        result.fileTypes[ext] = (result.fileTypes[ext] || 0) + 1;

      } catch (error) {
        this.logger.error(`Error processing file: ${filePath}`, error);
        result.skippedFiles.push({
          path: relativePath,
          reason: `Processing error: ${error}`
        });
      }
    }

    // Final progress
    opts.progressCallback({
      currentFile: 'Complete',
      filesProcessed: filesToProcess.length,
      totalFiles: filesToProcess.length,
      percentage: 100,
      bytesProcessed: result.totalBytes,
      totalBytes: result.totalBytes
    });

    // Save to file or return content
    if (outputPath) {
      fs.writeFileSync(outputPath, content, { encoding: opts.encoding as BufferEncoding });
      this.logger.info(`Markers saved to: ${outputPath}`);
    } else {
      result.content = content;
    }

    this.logger.info(`Generation complete: ${result.totalFiles} files, ${result.totalBytes} bytes`);
    return result;
  }

  /**
   * Create file header with metadata
   */
  private createHeader(sourcePath: string, totalFiles: number, customMetadata: Record<string, any>): string {
    let header = `//${this.FS_CHAR}/ PROJECT_INFO /${this.FS_CHAR}//\n`;
    header += `Project: ${path.basename(sourcePath)}\n`;
    header += `Generated: ${new Date().toISOString()}\n`;
    header += `Total Files: ${totalFiles}\n`;
    header += `Source: ${sourcePath}\n`;
    header += `Generator: lookatni-core v1.1.0\n`;

    // Add custom metadata
    if (Object.keys(customMetadata).length > 0) {
      header += `\nCustom Metadata:\n`;
      for (const [key, value] of Object.entries(customMetadata)) {
        header += `${key}: ${JSON.stringify(value)}\n`;
      }
    }

    header += '\n';
    return header;
  }

  /**
   * Process a single file
   */
  private async processFile(filePath: string, sourcePath: string, options: Required<GenerationOptions>): Promise<string> {
    const relativePath = path.relative(sourcePath, filePath);
    const fileContent = fs.readFileSync(filePath, { encoding: options.encoding as BufferEncoding });
    const stats = fs.statSync(filePath);

    let output = `//${this.FS_CHAR}/ ${relativePath} /${this.FS_CHAR}//\n`;

    // Add metadata if requested
    if (options.includeMetadata) {
      output += `// Size: ${stats.size} bytes\n`;
      output += `// Modified: ${stats.mtime.toISOString()}\n`;
      output += `// Type: ${path.extname(filePath) || 'no-extension'}\n`;
    }

    output += fileContent;

    // Ensure content ends with newline
    if (!fileContent.endsWith('\n')) {
      output += '\n';
    }

    output += '\n';
    return output;
  }
}
