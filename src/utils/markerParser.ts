import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

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

export class MarkerParser {
    // ASCII 28 (File Separator) character for invisible markers
    private readonly FS_CHAR = String.fromCharCode(28);
    private readonly markerRegex = new RegExp(`^\\/\\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/ (.+?) \\/${this.FS_CHAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/\\/$`);
    
    constructor(private logger: Logger) {}
    
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
                        this.finalizeMarker(currentMarker, currentContent, results, i);
                    }
                    
                    // Start new marker
                    const filename = markerMatch[1].trim();
                    if (!filename) {
                        results.errors.push({
                            line: lineNumber,
                            message: 'Empty filename in marker'
                        });
                        continue;
                    }
                    
                    currentMarker = {
                        filename,
                        startLine: lineNumber
                    };
                    currentContent = [];
                    results.totalMarkers++;
                    
                } else if (currentMarker) {
                    // Add content to current marker
                    currentContent.push(line);
                }
            }
            
            // Finalize last marker
            if (currentMarker) {
                this.finalizeMarker(currentMarker, currentContent, results, lines.length);
            }
            
            this.logger.info(`Parsed ${results.totalMarkers} markers from ${filePath}`);
            
        } catch (error) {
            this.logger.error(`Error parsing marked file ${filePath}:`, error);
            results.errors.push({
                line: 0,
                message: `File read error: ${error}`
            });
        }
        
        return results;
    }
    
    private finalizeMarker(
        marker: Partial<ParsedMarker>,
        content: string[],
        results: ParseResults,
        endLine: number
    ): void {
        if (!marker.filename || !marker.startLine) {
            return;
        }
        
        // Remove trailing empty lines
        while (content.length > 0 && content[content.length - 1].trim() === '') {
            content.pop();
        }
        
        const finalContent = content.join('\n');
        
        const completedMarker: ParsedMarker = {
            filename: marker.filename,
            content: finalContent,
            startLine: marker.startLine,
            endLine: endLine
        };
        
        results.markers.push(completedMarker);
        results.totalFiles++;
        results.totalBytes += Buffer.byteLength(finalContent, 'utf-8');
    }
    
    extractFiles(
        markedFilePath: string,
        outputDir: string,
        options: {
            overwrite?: boolean;
            createDirs?: boolean;
            dryRun?: boolean;
        } = {}
    ): { success: boolean; extractedFiles: string[]; errors: string[] } {
        
        const result = {
            success: true,
            extractedFiles: [] as string[],
            errors: [] as string[]
        };
        
        const parseResults = this.parseMarkedFile(markedFilePath);
        
        if (parseResults.errors.length > 0) {
            result.errors.push(...parseResults.errors.map(e => `Line ${e.line}: ${e.message}`));
        }
        
        for (const marker of parseResults.markers) {
            try {
                const outputPath = path.join(outputDir, marker.filename);
                
                // Check if file exists and overwrite is disabled
                if (!options.overwrite && fs.existsSync(outputPath)) {
                    const choice = options.dryRun ? 'skip' : 'skip'; // In real implementation, ask user
                    if (choice === 'skip') {
                        this.logger.warn(`Skipping existing file: ${outputPath}`);
                        continue;
                    }
                }
                
                if (options.dryRun) {
                    this.logger.info(`[DRY RUN] Would extract: ${outputPath}`);
                    result.extractedFiles.push(outputPath);
                    continue;
                }
                
                // Create directory if needed
                if (options.createDirs) {
                    const dir = path.dirname(outputPath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                        this.logger.debug(`Created directory: ${dir}`);
                    }
                }
                
                // Write file
                fs.writeFileSync(outputPath, marker.content, 'utf-8');
                result.extractedFiles.push(outputPath);
                this.logger.debug(`Extracted: ${outputPath} (${marker.content.length} chars)`);
                
            } catch (error) {
                const errorMsg = `Error extracting ${marker.filename}: ${error}`;
                this.logger.error(errorMsg);
                result.errors.push(errorMsg);
                result.success = false;
            }
        }
        
        return result;
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
