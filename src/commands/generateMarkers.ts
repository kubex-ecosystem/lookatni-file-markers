import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { MarkerGenerator } from '../utils/markerGenerator';

export class GenerateMarkersCommand {
    public readonly commandId = 'lookatni.generateMarkers';
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel
    ) {}
    
    async execute(uri?: vscode.Uri): Promise<void> {
        this.logger.info('🔄 Starting marker generation...');
        
        try {
            // Get source folder
            const sourceFolder = await this.getSourceFolder(uri);
            if (!sourceFolder) {
                return;
            }
            
            // Get output file
            const outputFile = await this.getOutputFile(sourceFolder);
            if (!outputFile) {
                return;
            }
            
            // Get generation options
            const options = await this.getGenerationOptions();
            if (!options) {
                return;
            }
            
            // Generate markers
            const generator = new MarkerGenerator(this.logger);
            const results = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating markers...',
                cancellable: false
            }, async (progress) => {
                return generator.generateMarkers(sourceFolder, outputFile, options, (current, total) => {
                    progress.report({
                        increment: (100 / total),
                        message: `Processing ${current}/${total} files...`
                    });
                });
            });
            
            // Show results
            this.showResults(results, outputFile);
            
            // Ask to open generated file
            const openFile = await vscode.window.showInformationMessage(
                `✅ Generated markers for ${results.totalFiles} files`,
                'Open File',
                'Copy Path'
            );
            
            if (openFile === 'Open File') {
                const document = await vscode.workspace.openTextDocument(outputFile);
                vscode.window.showTextDocument(document);
            } else if (openFile === 'Copy Path') {
                vscode.env.clipboard.writeText(outputFile);
                vscode.window.showInformationMessage('Path copied to clipboard!');
            }
            
        } catch (error) {
            this.logger.error('Error during generation:', error);
            vscode.window.showErrorMessage(`Generation failed: ${error}`);
        }
    }
    
    private async getSourceFolder(uri?: vscode.Uri): Promise<string | undefined> {
        if (uri && uri.fsPath) {
            const stat = fs.statSync(uri.fsPath);
            if (stat.isDirectory()) {
                return uri.fsPath;
            }
        }
        
        // Get from workspace
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            const choice = await vscode.window.showQuickPick([
                { label: '📁 Entire Workspace', description: 'Generate from workspace root', path: workspaceRoot },
                { label: '📂 Choose Subfolder...', description: 'Select specific folder', path: 'custom' }
            ], {
                placeHolder: 'Select source folder'
            });
            
            if (!choice) {
                return undefined;
            }
            
            if (choice.path === 'custom') {
                const folderUri = await vscode.window.showOpenDialog({
                    canSelectMany: false,
                    canSelectFiles: false,
                    canSelectFolders: true,
                    openLabel: 'Select source folder'
                });
                
                return folderUri?.[0]?.fsPath;
            }
            
            return choice.path;
        }
        
        // No workspace - ask user to select folder
        const folderUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: false,
            canSelectFolders: true,
            openLabel: 'Select source folder'
        });
        
        return folderUri?.[0]?.fsPath;
    }
    
    private async getOutputFile(sourceFolder: string): Promise<string | undefined> {
        const baseName = path.basename(sourceFolder);
        const defaultName = `${baseName}-lookatni.txt`;
        
        const result = await vscode.window.showInputBox({
            prompt: 'Enter output file name',
            value: defaultName,
            validateInput: (value) => {
                if (!value.trim()) {
                    return 'File name cannot be empty';
                }
                if (!/\.(txt|md)$/i.test(value)) {
                    return 'File should have .txt or .md extension';
                }
                return null;
            }
        });
        
        if (!result) {
            return undefined;
        }
        
        // If workspace is open, save in workspace root
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            return path.join(workspaceRoot, result);
        }
        
        // Otherwise save next to source folder
        return path.join(path.dirname(sourceFolder), result);
    }
    
    private async getGenerationOptions(): Promise<any | undefined> {
        const options: any = {};
        
        // Ask for file size limit
        const maxSize = await vscode.window.showQuickPick([
            { label: '500 KB', description: 'Small files only', value: 500 },
            { label: '1 MB', description: 'Medium files (recommended)', value: 1000 },
            { label: '5 MB', description: 'Large files', value: 5000 },
            { label: 'No limit', description: 'Include all files', value: -1 }
        ], {
            placeHolder: 'Select maximum file size to include'
        });
        
        if (!maxSize) {
            return undefined;
        }
        
        options.maxFileSize = maxSize.value;
        
        // Ask for exclusions
        const excludeChoice = await vscode.window.showQuickPick([
            { label: 'Standard exclusions', description: 'node_modules, .git, build folders', value: 'standard' },
            { label: 'Minimal exclusions', description: 'Only hidden files', value: 'minimal' },
            { label: 'Custom exclusions', description: 'Specify patterns', value: 'custom' }
        ], {
            placeHolder: 'Select exclusion strategy'
        });
        
        if (!excludeChoice) {
            return undefined;
        }
        
        switch (excludeChoice.value) {
            case 'standard':
                options.excludePatterns = [
                    'node_modules', '.git', '.svn', '.hg', 
                    'build', 'dist', 'out', 'target',
                    '__pycache__', '.pytest_cache', '.vscode',
                    '*.log', '*.tmp', '*.cache'
                ];
                break;
            case 'minimal':
                options.excludePatterns = ['.*'];
                break;
            case 'custom':
                const patterns = await vscode.window.showInputBox({
                    prompt: 'Enter exclusion patterns (comma-separated)',
                    placeHolder: 'e.g., node_modules, *.log, build',
                    value: 'node_modules, .git, build'
                });
                
                if (patterns) {
                    options.excludePatterns = patterns.split(',').map(p => p.trim());
                } else {
                    options.excludePatterns = [];
                }
                break;
        }
        
        return options;
    }
    
    private showResults(results: any, outputFile: string): void {
        const { totalFiles, totalBytes, skippedFiles } = results;
        
        this.outputChannel.appendLine('\n=== GENERATION RESULTS ===');
        this.outputChannel.appendLine(`📁 Source: ${results.sourceFolder}`);
        this.outputChannel.appendLine(`📄 Output: ${outputFile}`);
        this.outputChannel.appendLine(`✅ Files processed: ${totalFiles}`);
        this.outputChannel.appendLine(`📊 Total size: ${this.formatBytes(totalBytes)}`);
        this.outputChannel.appendLine(`⏭️ Files skipped: ${skippedFiles.length}`);
        
        if (skippedFiles.length > 0) {
            this.outputChannel.appendLine('\n=== SKIPPED FILES ===');
            skippedFiles.forEach((file: any) => {
                this.outputChannel.appendLine(`⏭️ ${file.path}: ${file.reason}`);
            });
        }
        
        // Show statistics if enabled
        const config = vscode.workspace.getConfiguration('lookatni');
        if (config.get('showStatistics', true)) {
            vscode.commands.executeCommand('lookatni.showStatistics', results);
        }
    }
    
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}
