"use strict";
// 🗂️ Marker Extractor - Extract files from marker content
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
exports.MarkerExtractor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../core/logger");
class MarkerExtractor {
    constructor(config) {
        // ASCII 28 (File Separator) character for invisible markers
        this.FS_CHAR = String.fromCharCode(28);
        this.config = {
            defaultConflictResolution: 'skip',
            defaultCreateDirectories: true,
            defaultValidateChecksums: false,
            ...config
        };
        this.logger = new logger_1.Logger('extractor');
        this.markerRegex = new RegExp(`^\\/\\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/ (.+?) \\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/\\/$`);
    }
    /**
     * Extract files from marker content to target directory
     */
    async extract(markerContent, targetPath, options) {
        this.logger.info(`Extracting markers to: ${targetPath}`);
        const opts = {
            overwriteExisting: options?.overwriteExisting ?? false,
            preserveTimestamps: options?.preserveTimestamps ?? true,
            createDirectories: options?.createDirectories ?? this.config.defaultCreateDirectories ?? true,
            validateChecksums: options?.validateChecksums ?? this.config.defaultValidateChecksums ?? false,
            conflictResolution: options?.conflictResolution ?? this.config.defaultConflictResolution ?? 'skip',
            progressCallback: options?.progressCallback ?? (() => { }),
            conflictCallback: options?.conflictCallback ?? (() => 'skip'),
            dryRun: options?.dryRun ?? false
        };
        // Parse markers
        const parseResults = this.parseMarkers(markerContent);
        if (parseResults.errors.length > 0) {
            this.logger.warn(`Found ${parseResults.errors.length} parsing errors`);
        }
        const result = {
            filesExtracted: 0,
            filesSkipped: 0,
            extractedFiles: [],
            errors: [],
            success: true
        };
        // Process each marker
        for (let i = 0; i < parseResults.markers.length; i++) {
            const marker = parseResults.markers[i];
            // Report progress
            const progress = {
                currentFile: marker.filename,
                filesExtracted: result.filesExtracted,
                totalFiles: parseResults.markers.length,
                percentage: Math.round((i / parseResults.markers.length) * 100)
            };
            opts.progressCallback(progress);
            try {
                const extracted = await this.extractSingleFile(marker, targetPath, opts);
                if (extracted) {
                    result.filesExtracted++;
                    result.extractedFiles.push(path.join(targetPath, marker.filename));
                }
                else {
                    result.filesSkipped++;
                }
            }
            catch (error) {
                this.logger.error(`Error extracting ${marker.filename}`, error);
                result.errors.push(`Error extracting ${marker.filename}: ${error}`);
                result.success = false;
            }
        }
        // Final progress
        opts.progressCallback({
            currentFile: 'Complete',
            filesExtracted: result.filesExtracted,
            totalFiles: parseResults.markers.length,
            percentage: 100
        });
        this.logger.info(`Extraction complete: ${result.filesExtracted} files extracted, ${result.filesSkipped} skipped`);
        return result;
    }
    /**
     * Extract files from marker file
     */
    async extractFromFile(markerPath, targetPath, options) {
        this.logger.info(`Reading marker file: ${markerPath}`);
        if (!fs.existsSync(markerPath)) {
            throw new Error(`Marker file does not exist: ${markerPath}`);
        }
        const markerContent = fs.readFileSync(markerPath, 'utf-8');
        return this.extract(markerContent, targetPath, options);
    }
    /**
     * Get list of files in marker content without extracting
     */
    async getFileList(markerContent) {
        const parseResults = this.parseMarkers(markerContent);
        return parseResults.markers.map(marker => ({
            path: marker.filename,
            size: Buffer.byteLength(marker.content, 'utf-8'),
            mtime: new Date(), // We don't have original mtime in basic markers
            type: path.extname(marker.filename),
            isBinary: false // Assume text since it's in marker
        }));
    }
    /**
     * Get metadata from marker content
     */
    async getMetadata(markerContent) {
        const lines = markerContent.split('\n');
        // Look for PROJECT_INFO section
        const projectInfoStart = lines.findIndex(line => line.includes(`//${this.FS_CHAR}/ PROJECT_INFO /${this.FS_CHAR}//`));
        if (projectInfoStart === -1) {
            return undefined;
        }
        const metadata = {
            generatedAt: '',
            version: '',
            sourceFolder: '',
            totalFiles: 0
        };
        // Parse metadata lines
        for (let i = projectInfoStart + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes(`//${this.FS_CHAR}/`)) {
                break; // Next marker section
            }
            if (line.startsWith('Project:')) {
                metadata.projectName = line.replace('Project:', '').trim();
            }
            else if (line.startsWith('Generated:')) {
                metadata.generatedAt = line.replace('Generated:', '').trim();
            }
            else if (line.startsWith('Total Files:')) {
                metadata.totalFiles = parseInt(line.replace('Total Files:', '').trim()) || 0;
            }
            else if (line.startsWith('Source:')) {
                metadata.sourceFolder = line.replace('Source:', '').trim();
            }
            else if (line.startsWith('Generator:')) {
                metadata.version = line.replace('Generator:', '').trim();
            }
        }
        return metadata;
    }
    /**
     * Parse marker content into individual markers
     */
    parseMarkers(content) {
        const lines = content.split('\n');
        const markers = [];
        const errors = [];
        let currentMarker = null;
        let contentLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            const match = line.match(this.markerRegex);
            if (match) {
                // Save previous marker if exists
                if (currentMarker) {
                    this.finalizeMarker(currentMarker, contentLines, markers, errors, lineNumber - 1);
                }
                // Start new marker
                const filename = match[1];
                if (!filename) {
                    errors.push({ line: lineNumber, message: 'Empty filename in marker' });
                    continue;
                }
                currentMarker = {
                    filename,
                    startLine: lineNumber
                };
                contentLines = [];
            }
            else if (currentMarker) {
                // Add to current marker content
                contentLines.push(line);
            }
        }
        // Finalize last marker
        if (currentMarker) {
            this.finalizeMarker(currentMarker, contentLines, markers, errors, lines.length);
        }
        const totalBytes = markers.reduce((sum, marker) => sum + Buffer.byteLength(marker.content, 'utf-8'), 0);
        return {
            totalMarkers: markers.length,
            totalFiles: markers.length,
            totalBytes,
            errors,
            markers
        };
    }
    /**
     * Finalize a marker being parsed
     */
    finalizeMarker(marker, contentLines, markers, errors, endLine) {
        if (!marker.filename || !marker.startLine) {
            return;
        }
        // Remove metadata comments if present
        const cleanContent = contentLines
            .filter(line => !line.startsWith('// Size:') && !line.startsWith('// Modified:') && !line.startsWith('// Type:'))
            .join('\n');
        markers.push({
            filename: marker.filename,
            content: cleanContent,
            startLine: marker.startLine,
            endLine
        });
    }
    /**
     * Extract a single file
     */
    async extractSingleFile(marker, targetPath, options) {
        const outputPath = path.join(targetPath, marker.filename);
        // Check for conflicts
        if (fs.existsSync(outputPath) && !options.overwriteExisting) {
            const conflict = {
                filePath: outputPath,
                reason: 'File already exists'
            };
            const resolution = options.conflictCallback(conflict);
            if (resolution === 'skip') {
                this.logger.info(`Skipping existing file: ${outputPath}`);
                return false;
            }
            else if (resolution === 'backup') {
                const backupPath = `${outputPath}.backup`;
                fs.copyFileSync(outputPath, backupPath);
                this.logger.info(`Created backup: ${backupPath}`);
            }
            // 'overwrite' continues with extraction
        }
        if (options.dryRun) {
            this.logger.info(`[DRY RUN] Would extract: ${outputPath}`);
            return true;
        }
        // Create directory if needed
        if (options.createDirectories) {
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.logger.debug(`Created directory: ${dir}`);
            }
        }
        // Write file
        fs.writeFileSync(outputPath, marker.content, 'utf-8');
        this.logger.debug(`Extracted: ${outputPath} (${marker.content.length} chars)`);
        return true;
    }
}
exports.MarkerExtractor = MarkerExtractor;
//# sourceMappingURL=extractor.js.map