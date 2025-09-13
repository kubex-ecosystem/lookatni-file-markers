import { FileInfo } from '../lib/types';
import { Logger } from './logger';
export declare class FileScanner {
    private logger;
    constructor(logger?: Logger);
    /**
     * Get all files in a directory recursively
     */
    getAllFiles(directory: string, excludePatterns?: string[]): string[];
    /**
     * Get file information
     */
    getFileInfo(filePath: string): FileInfo | null;
    /**
     * Check if file should be excluded based on patterns
     */
    private shouldExclude;
    /**
     * Simple pattern matching (supports * wildcards)
     */
    private matchesPattern;
    /**
     * Check if a file is binary
     */
    private isBinaryFile;
    /**
     * Filter files by size
     */
    filterBySize(files: string[], maxSizeKB: number): {
        valid: string[];
        skipped: Array<{
            path: string;
            reason: string;
        }>;
    };
    /**
     * Filter out binary files
     */
    filterBinaryFiles(files: string[]): {
        valid: string[];
        skipped: Array<{
            path: string;
            reason: string;
        }>;
    };
}
//# sourceMappingURL=scanner.d.ts.map