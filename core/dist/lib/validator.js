"use strict";
// ✅ Marker Validator - Validate marker files and their integrity
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
exports.MarkerValidator = void 0;
const path = __importStar(require("path"));
const logger_1 = require("../core/logger");
class MarkerValidator {
    constructor(config) {
        // ASCII 28 (File Separator) character for invisible markers
        this.FS_CHAR = String.fromCharCode(28);
        this.config = {
            customRules: [],
            strictMode: false,
            ...config
        };
        this.logger = new logger_1.Logger('validator');
        this.customRules = [...(this.config.customRules || [])];
        this.markerRegex = new RegExp(`^\\/\\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/ (.+?) \\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/\\/$`);
    }
    /**
     * Validate marker content
     */
    async validate(markerContent) {
        this.logger.info('Validating marker content');
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            statistics: {
                totalMarkers: 0,
                totalFiles: 0,
                totalBytes: 0,
                duplicateFilenames: [],
                invalidFilenames: [],
                emptyMarkers: 0,
                fileTypes: {}
            }
        };
        // Parse markers
        const parseResults = this.parseMarkers(markerContent);
        result.statistics.totalMarkers = parseResults.totalMarkers;
        result.statistics.totalFiles = parseResults.totalFiles;
        result.statistics.totalBytes = parseResults.totalBytes;
        // Convert parse errors to validation errors
        result.errors.push(...parseResults.errors.map(e => ({
            type: 'structure',
            message: e.message,
            line: e.line,
            severity: 'error'
        })));
        // Validate individual markers
        this.validateMarkers(parseResults.markers, result);
        // Run custom validation rules
        for (const rule of this.customRules) {
            try {
                const ruleResult = rule.validate(parseResults.markers);
                if (!ruleResult.isValid) {
                    result.errors.push(...ruleResult.errors);
                }
            }
            catch (error) {
                this.logger.error(`Custom rule '${rule.name}' failed`, error);
                result.errors.push({
                    type: 'structure',
                    message: `Custom rule '${rule.name}' failed: ${error}`,
                    severity: 'error'
                });
            }
        }
        // Set overall validity
        result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;
        this.logger.info(`Validation complete: ${result.isValid ? 'VALID' : 'INVALID'} (${result.errors.length} errors, ${result.warnings.length} warnings)`);
        return result;
    }
    /**
     * Validate marker file
     */
    async validateFile(markerPath) {
        this.logger.info(`Validating marker file: ${markerPath}`);
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            if (!fs.existsSync(markerPath)) {
                return {
                    isValid: false,
                    errors: [{
                            type: 'structure',
                            message: `Marker file does not exist: ${markerPath}`,
                            severity: 'error'
                        }],
                    warnings: [],
                    statistics: {
                        totalMarkers: 0,
                        totalFiles: 0,
                        totalBytes: 0,
                        duplicateFilenames: [],
                        invalidFilenames: [],
                        emptyMarkers: 0,
                        fileTypes: {}
                    }
                };
            }
            const markerContent = fs.readFileSync(markerPath, 'utf-8');
            return this.validate(markerContent);
        }
        catch (error) {
            this.logger.error(`Error reading marker file: ${markerPath}`, error);
            return {
                isValid: false,
                errors: [{
                        type: 'structure',
                        message: `Error reading marker file: ${error}`,
                        severity: 'error'
                    }],
                warnings: [],
                statistics: {
                    totalMarkers: 0,
                    totalFiles: 0,
                    totalBytes: 0,
                    duplicateFilenames: [],
                    invalidFilenames: [],
                    emptyMarkers: 0,
                    fileTypes: {}
                }
            };
        }
    }
    /**
     * Add custom validation rule
     */
    addRule(rule) {
        this.customRules.push(rule);
        this.logger.info(`Added custom validation rule: ${rule.name}`);
    }
    /**
     * Remove custom validation rule
     */
    removeRule(ruleName) {
        const index = this.customRules.findIndex(rule => rule.name === ruleName);
        if (index !== -1) {
            this.customRules.splice(index, 1);
            this.logger.info(`Removed custom validation rule: ${ruleName}`);
        }
    }
    /**
     * Get all validation rules
     */
    getRules() {
        return [...this.customRules];
    }
    /**
     * Parse marker content (similar to extractor but focused on validation)
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
                    this.finalizeMarker(currentMarker, contentLines, markers, lineNumber - 1);
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
            this.finalizeMarker(currentMarker, contentLines, markers, lines.length);
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
    finalizeMarker(marker, contentLines, markers, endLine) {
        if (!marker.filename || !marker.startLine) {
            return;
        }
        const content = contentLines.join('\n');
        markers.push({
            filename: marker.filename,
            content,
            startLine: marker.startLine,
            endLine
        });
    }
    /**
     * Validate individual markers
     */
    validateMarkers(markers, result) {
        const seenFilenames = new Set();
        for (const marker of markers) {
            // Check for duplicates
            if (seenFilenames.has(marker.filename)) {
                if (!result.statistics.duplicateFilenames.includes(marker.filename)) {
                    result.statistics.duplicateFilenames.push(marker.filename);
                    result.warnings.push({
                        type: 'structure',
                        message: `Duplicate filename: ${marker.filename}`,
                        line: marker.startLine,
                        severity: 'warning'
                    });
                }
            }
            seenFilenames.add(marker.filename);
            // Check for invalid filenames
            if (this.isInvalidFilename(marker.filename)) {
                result.statistics.invalidFilenames.push(marker.filename);
                result.errors.push({
                    type: 'filename',
                    message: `Invalid filename: ${marker.filename}`,
                    line: marker.startLine,
                    file: marker.filename,
                    severity: 'error'
                });
            }
            // Check for empty content
            if (marker.content.trim() === '') {
                result.statistics.emptyMarkers++;
                result.warnings.push({
                    type: 'structure',
                    message: `Empty content for file: ${marker.filename}`,
                    line: marker.startLine,
                    file: marker.filename,
                    severity: 'warning'
                });
            }
            // Track file types
            const ext = path.extname(marker.filename) || 'no-extension';
            result.statistics.fileTypes[ext] = (result.statistics.fileTypes[ext] || 0) + 1;
        }
    }
    /**
     * Check if filename is invalid
     */
    isInvalidFilename(filename) {
        // Check for invalid characters
        const invalidChars = /[<>:"|?*]/;
        if (invalidChars.test(filename)) {
            return true;
        }
        // Check for reserved names (Windows)
        const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
        const basename = path.basename(filename, path.extname(filename)).toUpperCase();
        if (reservedNames.includes(basename)) {
            return true;
        }
        // Check for empty or only dots
        if (!filename.trim() || filename.trim() === '.' || filename.trim() === '..') {
            return true;
        }
        return false;
    }
}
exports.MarkerValidator = MarkerValidator;
//# sourceMappingURL=validator.js.map