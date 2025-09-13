import * as fs from 'fs';
import * as path from 'path';
import { CLILogger } from './cliLogger';

export interface ParsedMarker {
    filename: string;
    content: string;
    startLine: number;
    endLine: number;
}

export interface ParseResults {
    totalMarkers: number;
    totalFiles: number;
    totalBytes: number;
    errors: Array<{ line: number; message: string }>;
    markers: ParsedMarker[];
}

export class CLIMarkerParser {
    // ASCII 28 (File Separator) character for invisible markers
    private readonly FS_CHAR = String.fromCharCode(28);
    private readonly markerRegex = new RegExp(`^\\/\\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/ (.+?) \\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/\\/$`);
    
    constructor(private logger: CLILogger) {}
    
    parseMarkedFile(filePath: string): ParseResults {
        const results: ParseResults = {
            totalMarkers: 0,
            totalFiles: 0,
            totalBytes: 0,
            errors: [],
            markers: []
        };
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            
            let currentMarker: Partial<ParsedMarker> | null = null;
            let currentContent: string[] = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                const markerMatch = line.match(this.markerRegex);
                
                if (markerMatch) {
                    // Save previous marker if exists
                    if (currentMarker) {
                        const marker: ParsedMarker = {
                            filename: currentMarker.filename!,
                            content: currentContent.join('\n'),
                            startLine: currentMarker.startLine!,
                            endLine: lineNumber - 1
                        };
                        results.markers.push(marker);
                        results.totalFiles++;
                        results.totalBytes += marker.content.length;
                    }
                    
                    // Start new marker
                    currentMarker = {
                        filename: markerMatch[1].trim(),
                        startLine: lineNumber
                    };
                    currentContent = [];
                    results.totalMarkers++;
                    
                } else if (currentMarker) {
                    // Add content to current marker
                    currentContent.push(line);
                }
            }
            
            // Save last marker if exists
            if (currentMarker) {
                const marker: ParsedMarker = {
                    filename: currentMarker.filename!,
                    content: currentContent.join('\n'),
                    startLine: currentMarker.startLine!,
                    endLine: lines.length
                };
                results.markers.push(marker);
                results.totalFiles++;
                results.totalBytes += marker.content.length;
            }
            
        } catch (error) {
            const errorMsg = `Error reading file ${filePath}: ${error}`;
            this.logger.error(errorMsg);
            results.errors.push({
                line: 0,
                message: errorMsg
            });
        }
        
        return results;
    }
    
    validateMarkers(filePath: string): {
        isValid: boolean;
        errors: Array<{ line: number; message: string; severity: 'error' | 'warning' }>;
        statistics: {
            totalMarkers: number;
            duplicateFilenames: string[];
            invalidFilenames: string[];
            emptyMarkers: number;
        };
    } {
        
        const result = {
            isValid: true,
            errors: [] as Array<{ line: number; message: string; severity: 'error' | 'warning' }>,
            statistics: {
                totalMarkers: 0,
                duplicateFilenames: [] as string[],
                invalidFilenames: [] as string[],
                emptyMarkers: 0
            }
        };
        
        const parseResults = this.parseMarkedFile(filePath);
        result.statistics.totalMarkers = parseResults.totalMarkers;
        
        // Convert parse errors to validation errors
        result.errors.push(...parseResults.errors.map(e => ({
            line: e.line,
            message: e.message,
            severity: 'error' as const
        })));
        
        // Check for duplicates and invalid filenames
        const seenFilenames = new Set<string>();
        
        for (const marker of parseResults.markers) {
            // Check for duplicates
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
            
            // Check for invalid filenames
            if (this.isInvalidFilename(marker.filename)) {
                result.statistics.invalidFilenames.push(marker.filename);
                result.errors.push({
                    line: marker.startLine,
                    message: `Invalid filename: ${marker.filename}`,
                    severity: 'error'
                });
                result.isValid = false;
            }
            
            // Check for empty content
            if (marker.content.trim() === '') {
                result.statistics.emptyMarkers++;
                result.errors.push({
                    line: marker.startLine,
                    message: `Empty content for file: ${marker.filename}`,
                    severity: 'warning'
                });
            }
        }
        
        // Set overall validity
        if (result.errors.some(e => e.severity === 'error')) {
            result.isValid = false;
        }
        
        return result;
    }
    
    private isInvalidFilename(filename: string): boolean {
        // Check for invalid characters
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(filename)) {
            return true;
        }
        
        // Check for reserved names on Windows
        const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
        const baseName = path.basename(filename, path.extname(filename));
        if (reservedNames.test(baseName)) {
            return true;
        }
        
        // Check for empty or just whitespace
        if (!filename.trim()) {
            return true;
        }
        
        return false;
    }
}
