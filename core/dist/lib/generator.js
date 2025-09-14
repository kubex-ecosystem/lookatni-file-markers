"use strict";
// 🏭 Marker Generator - Clean API wrapper for the core functionality
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
exports.MarkerGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../core/logger");
const scanner_1 = require("../core/scanner");
class MarkerGenerator {
    constructor(config) {
        // ASCII 28 (File Separator) character for invisible markers
        this.FS_CHAR = String.fromCharCode(28);
        this.config = {
            defaultEncoding: 'utf-8',
            maxConcurrentFiles: 50,
            defaultExcludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
            defaultMaxFileSize: 1000,
            ...config
        };
        this.logger = new logger_1.Logger('generator');
        this.scanner = new scanner_1.FileScanner(this.logger.withContext('scanner'));
    }
    /**
     * Generate markers from a source directory and return content
     */
    async generate(sourcePath, options) {
        this.logger.info(`Generating markers for: ${sourcePath}`);
        const result = await this.generateInternal(sourcePath, undefined, options);
        return result.content || '';
    }
    /**
     * Generate markers from a source directory and save to file
     */
    async generateToFile(sourcePath, outputPath, options) {
        this.logger.info(`Generating markers for: ${sourcePath} -> ${outputPath}`);
        await this.generateInternal(sourcePath, outputPath, options);
    }
    /**
     * Set configuration
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Internal generation method
     */
    async generateInternal(sourcePath, outputPath, options) {
        // Merge options with defaults
        const opts = {
            maxFileSize: options?.maxFileSize ?? this.config.defaultMaxFileSize ?? 1000,
            excludePatterns: options?.excludePatterns ?? this.config.defaultExcludePatterns ?? [],
            includeMetadata: options?.includeMetadata ?? true,
            includeBinaryFiles: options?.includeBinaryFiles ?? false,
            encoding: options?.encoding ?? this.config.defaultEncoding ?? 'utf-8',
            preserveTimestamps: options?.preserveTimestamps ?? true,
            customMetadata: options?.customMetadata ?? {},
            validateBeforeGeneration: options?.validateBeforeGeneration ?? false,
            progressCallback: options?.progressCallback ?? (() => { }),
            markerPreset: options?.markerPreset ?? '',
            markerStart: options?.markerStart ?? '',
            markerEnd: options?.markerEnd ?? '',
            markerPattern: options?.markerPattern ?? '',
            includeFrontmatter: options?.includeFrontmatter ?? false
        };
        const result = {
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
        // Create marker content: optional frontmatter + header
        let content = '';
        content += this.buildFrontmatter(opts);
        content += this.createHeader(sourcePath, filesToProcess.length, opts.customMetadata);
        // Process each file
        for (let i = 0; i < filesToProcess.length; i++) {
            const filePath = filesToProcess[i];
            const relativePath = path.relative(sourcePath, filePath);
            // Report progress
            const progress = {
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
            }
            catch (error) {
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
            fs.writeFileSync(outputPath, content, { encoding: opts.encoding });
            this.logger.info(`Markers saved to: ${outputPath}`);
        }
        else {
            result.content = content;
        }
        this.logger.info(`Generation complete: ${result.totalFiles} files, ${result.totalBytes} bytes`);
        return result;
    }
    /**
     * Create file header with metadata
     */
    createHeader(sourcePath, totalFiles, customMetadata) {
        let header = `//${this.FS_CHAR}/ PROJECT_INFO /${this.FS_CHAR}//\n`;
        header += `Project: ${path.basename(sourcePath)}\n`;
        header += `Generated: ${new Date().toISOString()}\n`;
        header += `Total Files: ${totalFiles}\n`;
        header += `Source: ${sourcePath}\n`;
        header += `Generator: lookatni-core v1.1.0\n`;
        header += `MarkerSpec: v1\n`;
        header += `FS: 28\n`;
        header += `MarkerTokens: //\\x1C/ <path> /\\x1C//\n`;
        header += `Encoding: utf-8\n`;
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
    async processFile(filePath, sourcePath, options) {
        const relativePath = path.relative(sourcePath, filePath);
        const fileContent = fs.readFileSync(filePath, { encoding: options.encoding });
        const stats = fs.statSync(filePath);
        // Build marker line (supports custom config)
        const markerLine = this.buildMarkerLine(relativePath, options);
        let output = `${markerLine}\n`;
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
    buildFrontmatter(options) {
        if (!options.includeFrontmatter)
            return '';
        const cfg = { version: 'v1' };
        if (options.markerPattern)
            cfg.pattern = options.markerPattern;
        if (options.markerStart)
            cfg.start = options.markerStart;
        if (options.markerEnd)
            cfg.end = options.markerEnd;
        if (options.markerPreset)
            cfg.preset = options.markerPreset;
        const lines = ['---', 'lookatni:'];
        for (const [k, v] of Object.entries(cfg)) {
            lines.push(`  ${k}: ${String(v)}`);
        }
        lines.push('---');
        return lines.join('\n') + '\n';
    }
    buildMarkerLine(relPath, options) {
        if (options.markerPattern && options.markerPattern.includes('{filename}')) {
            return options.markerPattern.replace('{filename}', relPath);
        }
        if (options.markerStart && options.markerEnd) {
            return `${options.markerStart} ${relPath} ${options.markerEnd}`;
        }
        switch ((options.markerPreset || '').toLowerCase()) {
            case 'html':
                return `<!-- FILE: ${relPath} -->`;
            case 'markdown':
                return `[//]: # (FILE: ${relPath})`;
            case 'code':
                return `// === FILE: ${relPath} ===`;
            case 'visual':
                return `🔥🔥🔥 FILE: ${relPath} 🔥🔥🔥`;
            default:
                return `//${this.FS_CHAR}/ ${relPath} /${this.FS_CHAR}//`;
        }
    }
}
exports.MarkerGenerator = MarkerGenerator;
//# sourceMappingURL=generator.js.map