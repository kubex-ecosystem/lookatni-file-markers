import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { MarkerParser } from '../utils/markerParser';

export class ShowStatisticsCommand {
    public readonly commandId = 'lookatni.showStatistics';
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel
    ) {}
    
    async execute(uri?: vscode.Uri, data?: any): Promise<void> {
        this.logger.info('📊 Showing LookAtni statistics...');
        
        try {
            if (data) {
                // Statistics passed from another command
                this.showPassedStatistics(data);
            } else {
                // Analyze a marked file
                const markedFile = await this.getMarkedFile(uri);
                if (!markedFile) {
                    return;
                }
                
                await this.analyzeMarkedFile(markedFile);
            }
            
        } catch (error) {
            this.logger.error('Error showing statistics:', error);
            vscode.window.showErrorMessage(`Statistics failed: ${error}`);
        }
    }
    
    private async getMarkedFile(uri?: vscode.Uri): Promise<string | undefined> {
        if (uri && uri.fsPath && fs.existsSync(uri.fsPath)) {
            return uri.fsPath;
        }
        
        // Get from active editor
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.txt')) {
            return activeEditor.document.fileName;
        }
        
        // Ask user to select file
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: 'Select marked file for statistics',
            filters: {
                'LookAtni Files': ['txt', 'md'],
                'All Files': ['*']
            }
        });
        
        return fileUri?.[0]?.fsPath;
    }
    
    private async analyzeMarkedFile(filePath: string): Promise<void> {
        const parser = new MarkerParser(this.logger);
        
        const results = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing marked file...',
            cancellable: false
        }, async () => {
            return parser.parseMarkedFile(filePath);
        });
        
        // Get file stats
        const fileStats = fs.statSync(filePath);
        
        // Create comprehensive statistics
        const statistics = {
            filePath,
            fileSize: fileStats.size,
            created: fileStats.birthtime,
            modified: fileStats.mtime,
            ...results
        };
        
        this.showDetailedStatistics(statistics);
    }
    
    private showPassedStatistics(data: any): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== LOOKATNI STATISTICS (FROM OPERATION) ===');
        
        if (data.sourceFolder) {
            this.outputChannel.appendLine(`📁 Source: ${data.sourceFolder}`);
        }
        
        if (data.totalFiles !== undefined) {
            this.outputChannel.appendLine(`📄 Files processed: ${data.totalFiles}`);
        }
        
        if (data.totalBytes !== undefined) {
            this.outputChannel.appendLine(`📊 Total size: ${this.formatBytes(data.totalBytes)}`);
        }
        
        if (data.skippedFiles && data.skippedFiles.length > 0) {
            this.outputChannel.appendLine(`⏭️ Files skipped: ${data.skippedFiles.length}`);
        }
        
        if (data.fileTypes) {
            this.outputChannel.appendLine('\n=== FILE TYPES ===');
            const sortedTypes = Object.entries(data.fileTypes)
                .sort(([,a], [,b]) => (b as number) - (a as number));
            
            sortedTypes.forEach(([ext, count]) => {
                const percentage = ((count as number) / data.totalFiles * 100).toFixed(1);
                this.outputChannel.appendLine(`${ext || 'no-ext'}: ${count} files (${percentage}%)`);
            });
        }
        
        this.outputChannel.show();
    }
    
    private showDetailedStatistics(stats: any): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== DETAILED LOOKATNI STATISTICS ===');
        this.outputChannel.appendLine(`📄 File: ${path.basename(stats.filePath)}`);
        this.outputChannel.appendLine(`📁 Path: ${stats.filePath}`);
        this.outputChannel.appendLine(`📊 File size: ${this.formatBytes(stats.fileSize)}`);
        this.outputChannel.appendLine(`🕐 Created: ${stats.created.toLocaleString()}`);
        this.outputChannel.appendLine(`🕑 Modified: ${stats.modified.toLocaleString()}`);
        this.outputChannel.appendLine('');
        
        // Marker statistics
        this.outputChannel.appendLine('=== MARKER ANALYSIS ===');
        this.outputChannel.appendLine(`🏷️ Total markers: ${stats.totalMarkers}`);
        this.outputChannel.appendLine(`📁 Unique files: ${stats.totalFiles}`);
        this.outputChannel.appendLine(`📊 Content size: ${this.formatBytes(stats.totalBytes)}`);
        
        // Calculate average file size
        if (stats.totalFiles > 0) {
            const avgSize = stats.totalBytes / stats.totalFiles;
            this.outputChannel.appendLine(`📏 Average file size: ${this.formatBytes(avgSize)}`);
        }
        
        // Error analysis
        if (stats.errors && stats.errors.length > 0) {
            this.outputChannel.appendLine('');
            this.outputChannel.appendLine('=== ERRORS FOUND ===');
            stats.errors.forEach((error: any) => {
                this.outputChannel.appendLine(`❌ Line ${error.line}: ${error.message}`);
            });
        }
        
        // File type analysis
        if (stats.markers && stats.markers.length > 0) {
            const fileTypes: { [key: string]: number } = {};
            const fileSizes: { name: string; size: number }[] = [];
            
            stats.markers.forEach((marker: any) => {
                const ext = path.extname(marker.filename).toLowerCase() || 'no-extension';
                fileTypes[ext] = (fileTypes[ext] || 0) + 1;
                
                fileSizes.push({
                    name: marker.filename,
                    size: Buffer.byteLength(marker.content, 'utf-8')
                });
            });
            
            // Show file types
            this.outputChannel.appendLine('');
            this.outputChannel.appendLine('=== FILE TYPES DISTRIBUTION ===');
            const sortedTypes = Object.entries(fileTypes)
                .sort(([,a], [,b]) => b - a);
            
            sortedTypes.forEach(([ext, count]) => {
                const percentage = (count / stats.totalFiles * 100).toFixed(1);
                this.outputChannel.appendLine(`${ext}: ${count} files (${percentage}%)`);
            });
            
            // Show largest files
            this.outputChannel.appendLine('');
            this.outputChannel.appendLine('=== LARGEST FILES ===');
            const largestFiles = fileSizes
                .sort((a, b) => b.size - a.size)
                .slice(0, 10);
            
            largestFiles.forEach(file => {
                this.outputChannel.appendLine(`📄 ${file.name}: ${this.formatBytes(file.size)}`);
            });
        }
        
        // Show efficiency metrics
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('=== EFFICIENCY METRICS ===');
        
        if (stats.totalMarkers > 0) {
            const markerOverhead = stats.totalMarkers * 20; // Approximate marker overhead
            const efficiency = ((stats.totalBytes / (stats.totalBytes + markerOverhead)) * 100).toFixed(1);
            this.outputChannel.appendLine(`⚡ Content efficiency: ${efficiency}%`);
        }
        
        const compressionRatio = stats.fileSize > 0 ? (stats.totalBytes / stats.fileSize * 100).toFixed(1) : '0';
        this.outputChannel.appendLine(`🗜️ Content ratio: ${compressionRatio}%`);
        
        this.outputChannel.show();
        
        // Show summary notification
        vscode.window.showInformationMessage(
            `📊 Statistics: ${stats.totalMarkers} markers, ${stats.totalFiles} files, ${this.formatBytes(stats.totalBytes)}`
        );
    }
    
    private formatBytes(bytes: number): string {
        if (bytes === 0) {
            return '0 B';
        }
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}
