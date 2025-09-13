// 📁 File Scanner - Finds and filters files for processing

import * as fs from 'fs';
import * as path from 'path';
import { FileInfo } from '../lib/types';
import { Logger } from './logger';

export class FileScanner {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger('scanner');
  }

  /**
   * Get all files in a directory recursively
   */
  getAllFiles(directory: string, excludePatterns: string[] = []): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const fullPath = path.join(directory, item);

        // Skip if matches exclude patterns
        if (this.shouldExclude(fullPath, excludePatterns)) {
          this.logger.debug(`Excluding: ${fullPath}`);
          continue;
        }

        try {
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            // Recursively scan subdirectory
            files.push(...this.getAllFiles(fullPath, excludePatterns));
          } else if (stats.isFile()) {
            files.push(fullPath);
          }
        } catch (error) {
          this.logger.warn(`Cannot access: ${fullPath}`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Cannot read directory: ${directory}`, error);
    }

    return files;
  }

  /**
   * Get file information
   */
  getFileInfo(filePath: string): FileInfo | null {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath);

      return {
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        type: ext,
        isBinary: this.isBinaryFile(filePath)
      };
    } catch (error) {
      this.logger.error(`Cannot get file info: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Check if file should be excluded based on patterns
   */
  private shouldExclude(filePath: string, excludePatterns: string[]): boolean {
    const relativePath = path.relative(process.cwd(), filePath);

    for (const pattern of excludePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple pattern matching (supports * wildcards)
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')     // Escape dots
      .replace(/\*/g, '.*')      // Convert * to .*
      .replace(/\//g, '[\\\\/]'); // Handle path separators

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filePath);
  }

  /**
   * Check if a file is binary
   */
  private isBinaryFile(filePath: string): boolean {
    try {
      // Read first 1024 bytes
      const buffer = Buffer.alloc(1024);
      const fd = fs.openSync(filePath, 'r');
      const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
      fs.closeSync(fd);

      // Check for null bytes (common in binary files)
      for (let i = 0; i < bytesRead; i++) {
        if (buffer[i] === 0) {
          return true;
        }
      }

      return false;
    } catch (error) {
      // If we can't read it, assume it's binary
      return true;
    }
  }

  /**
   * Filter files by size
   */
  filterBySize(files: string[], maxSizeKB: number): { valid: string[], skipped: Array<{ path: string, reason: string }> } {
    const valid: string[] = [];
    const skipped: Array<{ path: string, reason: string }> = [];

    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        const sizeKB = stats.size / 1024;

        if (maxSizeKB !== -1 && sizeKB > maxSizeKB) {
          skipped.push({
            path: file,
            reason: `File too large (${sizeKB.toFixed(1)} KB > ${maxSizeKB} KB)`
          });
        } else {
          valid.push(file);
        }
      } catch (error) {
        skipped.push({
          path: file,
          reason: `Cannot read file: ${error}`
        });
      }
    }

    return { valid, skipped };
  }

  /**
   * Filter out binary files
   */
  filterBinaryFiles(files: string[]): { valid: string[], skipped: Array<{ path: string, reason: string }> } {
    const valid: string[] = [];
    const skipped: Array<{ path: string, reason: string }> = [];

    for (const file of files) {
      if (this.isBinaryFile(file)) {
        skipped.push({
          path: file,
          reason: 'Binary file'
        });
      } else {
        valid.push(file);
      }
    }

    return { valid, skipped };
  }
}
