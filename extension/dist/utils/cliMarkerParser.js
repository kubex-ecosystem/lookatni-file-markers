"use strict";
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
exports.CLIMarkerParser = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CLIMarkerParser {
    constructor(logger) {
        this.logger = logger;
        this.FS_CHAR = String.fromCharCode(28);
        this.markerRegex = new RegExp(`^\\/\\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/ (.+?) \\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/\\/$`);
    }
    parseMarkedFile(filePath) {
        const results = {
            totalMarkers: 0,
            totalFiles: 0,
            totalBytes: 0,
            errors: [],
            markers: []
        };
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            let currentMarker = null;
            let currentContent = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                const markerMatch = line.match(this.markerRegex);
                if (markerMatch) {
                    if (currentMarker) {
                        const marker = {
                            filename: currentMarker.filename,
                            content: currentContent.join('\n'),
                            startLine: currentMarker.startLine,
                            endLine: lineNumber - 1
                        };
                        results.markers.push(marker);
                        results.totalFiles++;
                        results.totalBytes += marker.content.length;
                    }
                    currentMarker = {
                        filename: markerMatch[1].trim(),
                        startLine: lineNumber
                    };
                    currentContent = [];
                    results.totalMarkers++;
                }
                else if (currentMarker) {
                    currentContent.push(line);
                }
            }
            if (currentMarker) {
                const marker = {
                    filename: currentMarker.filename,
                    content: currentContent.join('\n'),
                    startLine: currentMarker.startLine,
                    endLine: lines.length
                };
                results.markers.push(marker);
                results.totalFiles++;
                results.totalBytes += marker.content.length;
            }
        }
        catch (error) {
            const errorMsg = `Error reading file ${filePath}: ${error}`;
            this.logger.error(errorMsg);
            results.errors.push({
                line: 0,
                message: errorMsg
            });
        }
        return results;
    }
    validateMarkers(filePath) {
        const result = {
            isValid: true,
            errors: [],
            statistics: {
                totalMarkers: 0,
                duplicateFilenames: [],
                invalidFilenames: [],
                emptyMarkers: 0
            }
        };
        const parseResults = this.parseMarkedFile(filePath);
        result.statistics.totalMarkers = parseResults.totalMarkers;
        result.errors.push(...parseResults.errors.map(e => ({
            line: e.line,
            message: e.message,
            severity: 'error'
        })));
        const seenFilenames = new Set();
        for (const marker of parseResults.markers) {
            if (seenFilenames.has(marker.filename)) {
                if (!result.statistics.duplicateFilenames.includes(marker.filename)) {
                    result.statistics.duplicateFilenames.push(marker.filename);
                    result.errors.push({
                        line: marker.startLine,
                        message: `Duplicate filename: ${marker.filename}`,
                        severity: 'warning'
                    });
                }
            }
            seenFilenames.add(marker.filename);
            if (this.isInvalidFilename(marker.filename)) {
                result.statistics.invalidFilenames.push(marker.filename);
                result.errors.push({
                    line: marker.startLine,
                    message: `Invalid filename: ${marker.filename}`,
                    severity: 'error'
                });
                result.isValid = false;
            }
            if (marker.content.trim() === '') {
                result.statistics.emptyMarkers++;
                result.errors.push({
                    line: marker.startLine,
                    message: `Empty content for file: ${marker.filename}`,
                    severity: 'warning'
                });
            }
        }
        if (result.errors.some(e => e.severity === 'error')) {
            result.isValid = false;
        }
        return result;
    }
    isInvalidFilename(filename) {
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(filename)) {
            return true;
        }
        const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
        const baseName = path.basename(filename, path.extname(filename));
        if (reservedNames.test(baseName)) {
            return true;
        }
        if (!filename.trim()) {
            return true;
        }
        return false;
    }
}
exports.CLIMarkerParser = CLIMarkerParser;
