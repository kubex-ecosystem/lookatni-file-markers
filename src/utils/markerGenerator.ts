import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

export interface GenerationOptions {
    maxFileSize: number; // in KB, -1 for no limit
    excludePatterns: string[];
}

export interface GenerationResults {
    sourceFolder: string;
    totalFiles: number;
    totalBytes: number;
    skippedFiles: Array<{ path: string; reason: string }>;
    fileTypes: { [key: string]: number };
}

export class MarkerGenerator {
    constructor(private logger: Logger) {}
    
    async generateMarkers(
        sourceFolder: string,
        outputFile: string,
        options: GenerationOptions,
        progressCallback?: (current: number, total: number) => void
    ): Promise<GenerationResults> {
        
        const results: GenerationResults = {
            sourceFolder,
            totalFiles: 0,
            totalBytes: 0,
            skippedFiles: [],
            fileTypes: {}
        };
        
        // Get all files to process
        const allFiles = this.getAllFiles(sourceFolder, options.excludePatterns);
        this.logger.info(`Found ${allFiles.length} files to process`);
        
        // Filter files by size
        const filesToProcess = allFiles.filter(filePath => {
            try {
                const stats = fs.statSync(filePath);
                const sizeKB = stats.size / 1024;
                
                if (options.maxFileSize !== -1 && sizeKB > options.maxFileSize) {
                    results.skippedFiles.push({
                        path: path.relative(sourceFolder, filePath),
                        reason: `File too large (${sizeKB.toFixed(1)} KB > ${options.maxFileSize} KB)`
                    });
                    return false;
                }
                
                // Skip binary files
                if (this.isBinaryFile(filePath)) {
                    results.skippedFiles.push({
                        path: path.relative(sourceFolder, filePath),
                        reason: 'Binary file'
                    });
                    return false;
                }
                
                return true;
            } catch (error) {
                results.skippedFiles.push({
                    path: path.relative(sourceFolder, filePath),
                    reason: `Error reading file: ${error}`
                });
                return false;
            }
        });
        
        this.logger.info(`Processing ${filesToProcess.length} files after filtering`);
        
        // Create output content
        let output = `//m/ PROJECT_INFO /m//\n`;
        output += `Project: ${path.basename(sourceFolder)}\n`;
        output += `Generated: ${new Date().toISOString()}\n`;
        output += `Total Files: ${filesToProcess.length}\n`;
        output += `Source: ${sourceFolder}\n\n`;
        
        // Process each file
        for (let i = 0; i < filesToProcess.length; i++) {
            const filePath = filesToProcess[i];
            const relativePath = path.relative(sourceFolder, filePath);
            
            if (progressCallback) {
                progressCallback(i + 1, filesToProcess.length);
            }
            
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const stats = fs.statSync(filePath);
                
                // Update statistics
                results.totalFiles++;
                results.totalBytes += stats.size;
                
                const ext = path.extname(filePath).toLowerCase() || 'no-extension';
                results.fileTypes[ext] = (results.fileTypes[ext] || 0) + 1;
                
                // Add file marker and content
                output += `//m/ ${relativePath} /m//\n`;
                output += content;
                
                // Ensure content ends with newline
                if (!content.endsWith('\n')) {
                    output += '\n';
                }
                output += '\n';
                
                this.logger.debug(`Processed: ${relativePath} (${stats.size} bytes)`);
                
            } catch (error) {
                this.logger.error(`Error processing ${relativePath}:`, error);
                results.skippedFiles.push({
                    path: relativePath,
                    reason: `Read error: ${error}`
                });
            }
        }
        
        // Write output file
        fs.writeFileSync(outputFile, output, 'utf-8');
        this.logger.info(`Generated markers file: ${outputFile}`);
        
        return results;
    }
    
    private getAllFiles(dir: string, excludePatterns: string[]): string[] {
        const files: string[] = [];
        
        const traverse = (currentDir: string) => {
            try {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name);
                    const relativePath = path.relative(dir, fullPath);
                    
                    // Check exclusion patterns
                    if (this.shouldExclude(entry.name, relativePath, excludePatterns)) {
                        continue;
                    }
                    
                    if (entry.isDirectory()) {
                        traverse(fullPath);
                    } else if (entry.isFile()) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                this.logger.warn(`Cannot read directory ${currentDir}:`, error);
            }
        };
        
        traverse(dir);
        return files;
    }
    
    private shouldExclude(name: string, relativePath: string, patterns: string[]): boolean {
        for (const pattern of patterns) {
            // Simple pattern matching
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(name) || regex.test(relativePath)) {
                    return true;
                }
            } else if (name === pattern || relativePath.includes(pattern)) {
                return true;
            }
        }
        return false;
    }
    
    private isBinaryFile(filePath: string): boolean {
        const binaryExtensions = [
            '.exe', '.dll', '.so', '.dylib', '.bin', '.obj',
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.webp',
            '.mp3', '.mp4', '.avi', '.mov', '.wav', '.ogg',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
            '.class', '.jar', '.war', '.ear',
            '.pyc', '.pyo', '.pyd',
            '.woff', '.woff2', '.ttf', '.otf', '.eot'
        ];
        
        const ext = path.extname(filePath).toLowerCase();
        if (binaryExtensions.includes(ext)) {
            return true;
        }
        
        // Try to read first few bytes to detect binary content
        try {
            const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
            if (buffer.length === 0) {
                return false;
            }
            
            // Check for null bytes in first 1KB
            const sampleSize = Math.min(1024, buffer.length);
            for (let i = 0; i < sampleSize; i++) {
                if (buffer[i] === 0) {
                    return true;
                }
            }
            
            return false;
        } catch {
            return true; // If we can't read it, assume it's binary
        }
    }
}
