import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { MarkerParser } from '../utils/markerParser';

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
            const markedFile = await this.getMarkedFile(uri);
            if (!markedFile) {
                return;
            }
            
            const destFolder = await this.getDestinationFolder();
            if (!destFolder) {
                return;
            }
            
            const options = await this.getExtractionOptions();
            if (!options) {
                return;
            }
            
            const parser = new MarkerParser(this.logger);
            const results = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Extracting files...',
                cancellable: false
            }, async () => {
                return parser.extractFiles(markedFile, destFolder, options);
            });
            
            this.showResults(results, destFolder);
            
            const openFolder = await vscode.window.showInformationMessage(
                `✅ Extracted ${results.extractedFiles.length} files`,
                'Open Folder'
            );
            
            if (openFolder === 'Open Folder') {
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(destFolder));
            }
            
        } catch (error) {
            this.logger.error('Error during extraction:', error);
            vscode.window.showErrorMessage(`Extraction failed: ${error}`);
        }
    }
    
    private async getMarkedFile(uri?: vscode.Uri): Promise<string | undefined> {
        if (uri && uri.fsPath && fs.existsSync(uri.fsPath)) {
            return uri.fsPath;
        }
        
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: 'Select marked file to extract',
            filters: {
                'LookAtni Files': ['txt', 'md'],
                'All Files': ['*']
            }
        });
        
        return fileUri?.[0]?.fsPath;
    }
    
    private async getDestinationFolder(): Promise<string | undefined> {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: false,
            canSelectFolders: true,
            openLabel: 'Select destination folder'
        });
        
        return folderUri?.[0]?.fsPath;
    }
    
    private async getExtractionOptions(): Promise<any> {
        return {
            overwrite: true,
            createDirs: true
        };
    }
    
    private showResults(results: any, destFolder: string): void {
        this.outputChannel.appendLine('\n=== EXTRACTION RESULTS ===');
        this.outputChannel.appendLine(`📁 Destination: ${destFolder}`);
        this.outputChannel.appendLine(`✅ Files extracted: ${results.extractedFiles.length}`);
        this.outputChannel.show();
    }
}
