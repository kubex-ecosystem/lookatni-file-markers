import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { MarkerParser } from '../utils/markerParser';
import { FileExtractor } from '../utils/fileExtractor';

export class ExtractFilesCommand {
    public readonly commandId = 'lookatni.extractFiles';
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel
    ) {}
    
    async execute(uri?: vscode.Uri): Promise<void> {
        this.logger.info('🔄 Starting file extraction...');
        
        try {
            // Get source file
            const sourceFile = await this.getSourceFile(uri);
            if (!sourceFile) {
                return;
            }
            
            // Get destination folder
            const destFolder = await this.getDestinationFolder();
            if (!destFolder) {
                return;
            }
            
            // Read and parse file
            const content = fs.readFileSync(sourceFile, 'utf8');
            const parser = new MarkerParser();
            const files = parser.parseMarkers(content);
            
            if (files.length === 0) {
                vscode.window.showWarningMessage('No LookAtni markers found in the file!');
                return;
            }
            
            // Confirm extraction
            const config = vscode.workspace.getConfiguration('lookatni');
            if (config.get('confirmBeforeExtract', true)) {
                const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `Extract ${files.length} files to ${path.basename(destFolder)}?`
                });
                
                if (confirm !== 'Yes') {
                    return;
                }
            }
            
            // Extract files
            const extractor = new FileExtractor(this.logger);
            const results = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Extracting files...',
                cancellable: false
            }, async (progress) => {
                return extractor.extractFiles(files, destFolder, (current, total) => {
                    progress.report({
                        increment: (100 / total),
                        message: `Extracting ${current}/${total} files...`
                    });
                });
            });
            
            // Show results
            this.showResults(results, destFolder);
            
            // Auto-open if configured
            if (config.get('autoOpenExtracted', true)) {
                const uri = vscode.Uri.file(destFolder);
                vscode.commands.executeCommand('revealInFileExplorer', uri);
            }
            
        } catch (error) {
            this.logger.error('Error during extraction:', error);
            vscode.window.showErrorMessage(`Extraction failed: ${error}`);
        }
    }
    
    private async getSourceFile(uri?: vscode.Uri): Promise<string | undefined> {
        if (uri && uri.fsPath) {
            return uri.fsPath;
        }
        
        // Get from active editor
        if (vscode.window.activeTextEditor) {
            const document = vscode.window.activeTextEditor.document;
            if (document.uri.scheme === 'file') {
                return document.uri.fsPath;
            }
        }
        
        // Ask user to select file
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            filters: {
                'Text files': ['txt'],
                'All files': ['*']
            },
            openLabel: 'Select file with LookAtni markers'
        });
        
        return fileUri?.[0]?.fsPath;
    }
    
    private async getDestinationFolder(): Promise<string | undefined> {
        const config = vscode.workspace.getConfiguration('lookatni');
        const defaultDir = config.get('defaultOutputDir', './extracted');
        
        // If workspace is open, use workspace folder
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const defaultPath = path.resolve(workspaceRoot, defaultDir);
            
            const choice = await vscode.window.showQuickPick([
                { label: `📁 ${defaultDir}`, description: 'Default extraction folder', path: defaultPath },
                { label: '📂 Choose different folder...', description: 'Select custom location', path: 'custom' }
            ], {
                placeHolder: 'Select destination folder'
            });
            
            if (!choice) {
                return undefined;
            }
            
            if (choice.path === 'custom') {
                const folderUri = await vscode.window.showOpenDialog({
                    canSelectMany: false,
                    canSelectFiles: false,
                    canSelectFolders: true,
                    openLabel: 'Select destination folder'
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
            openLabel: 'Select destination folder'
        });
        
        return folderUri?.[0]?.fsPath;
    }
    
    private showResults(results: any, destFolder: string): void {
        const { success, errors, totalFiles, totalBytes } = results;
        
        if (errors.length === 0) {
            vscode.window.showInformationMessage(
                `✅ Successfully extracted ${success} files (${this.formatBytes(totalBytes)}) to ${path.basename(destFolder)}`
            );
        } else {
            vscode.window.showWarningMessage(
                `⚠️ Extracted ${success} files with ${errors.length} errors. Check output for details.`
            );
            
            // Show errors in output channel
            this.outputChannel.appendLine('\n=== EXTRACTION ERRORS ===');
            errors.forEach((error: any) => {
                this.outputChannel.appendLine(`❌ ${error.file}: ${error.message}`);
            });
            this.outputChannel.show();
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
