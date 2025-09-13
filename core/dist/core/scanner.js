"use strict";
// 📁 File Scanner - Finds and filters files for processing
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileScanner = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("./logger");
class FileScanner {
    constructor(logger) {
        this.logger = logger || new logger_1.Logger('scanner');
    }
    /**
     * Get all files in a directory recursively
     */
    getAllFiles(directory, excludePatterns = []) {
        const files = [];
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
                    }
                    else if (stats.isFile()) {
                        files.push(fullPath);
                    }
                }
                catch (error) {
                    this.logger.warn(`Cannot access: ${fullPath}`, error);
                }
            }
        }
        catch (error) {
            this.logger.error(`Cannot read directory: ${directory}`, error);
        }
        return files;
    }
    /**
     * Get file information
     */
    getFileInfo(filePath) {
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
        }
        catch (error) {
            this.logger.error(`Cannot get file info: ${filePath}`, error);
            return null;
        }
    }
    /**
     * Check if file should be excluded based on patterns
     */
    shouldExclude(filePath, excludePatterns) {
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
    matchesPattern(filePath, pattern) {
        // Convert pattern to regex
        const regexPattern = pattern
            .replace(/\./g, '\\.') // Escape dots
            .replace(/\*/g, '.*') // Convert * to .*
            .replace(/\//g, '[\\\\/]'); // Handle path separators
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(filePath);
    }
    /**
     * Check if a file is binary
     */
    isBinaryFile(filePath) {
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
        }
        catch (error) {
            // If we can't read it, assume it's binary
            return true;
        }
    }
    /**
     * Filter files by size
     */
    filterBySize(files, maxSizeKB) {
        const valid = [];
        const skipped = [];
        for (const file of files) {
            try {
                const stats = fs.statSync(file);
                const sizeKB = stats.size / 1024;
                if (maxSizeKB !== -1 && sizeKB > maxSizeKB) {
                    skipped.push({
                        path: file,
                        reason: `File too large (${sizeKB.toFixed(1)} KB > ${maxSizeKB} KB)`
                    });
                }
                else {
                    valid.push(file);
                }
            }
            catch (error) {
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
    filterBinaryFiles(files) {
        const valid = [];
        const skipped = [];
        for (const file of files) {
            if (this.isBinaryFile(file)) {
                skipped.push({
                    path: file,
                    reason: 'Binary file'
                });
            }
            else {
                valid.push(file);
            }
        }
        return { valid, skipped };
    }
}
exports.FileScanner = FileScanner;
//# sourceMappingURL=scanner.js.map