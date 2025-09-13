import * as vscode from 'vscode';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
import { MarkerParser } from '../utils/markerParser';

export class ValidateMarkersCommand {
    public readonly commandId = 'lookatni-file-markers.validateMarkers';
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel
    ) {}
    
    async execute(uri?: vscode.Uri): Promise<void> {
        this.logger.info('🔍 Starting marker validation...');
        
        try {
            // Get marked file to validate
            const markedFile = await this.getMarkedFile(uri);
            if (!markedFile) {
                return;
            }
            
            // Validate markers
            const parser = new MarkerParser(this.logger);
            const validation = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Validating markers...',
                cancellable: false
            }, async () => {
                return parser.validateMarkers(markedFile);
            });
            
            // Show results
            this.showValidationResults(validation, markedFile);
            
            // Create diagnostics for the file
            await this.createDiagnostics(markedFile, validation);
            
        } catch (error) {
            this.logger.error('Error during validation:', error);
            vscode.window.showErrorMessage(`Validation failed: ${error}`);
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
            openLabel: 'Select marked file to validate',
            filters: {
                'LookAtni Files': ['txt', 'md'],
                'All Files': ['*']
            }
        });
        
        return fileUri?.[0]?.fsPath;
    }
    
    private showValidationResults(validation: any, filePath: string): void {
        const { isValid, errors, statistics } = validation;
        
        // Clear previous output
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== MARKER VALIDATION RESULTS ===');
        this.outputChannel.appendLine(`📄 File: ${filePath}`);
        this.outputChannel.appendLine(`✅ Valid: ${isValid ? 'YES' : 'NO'}`);
        this.outputChannel.appendLine(`📊 Total markers: ${statistics.totalMarkers}`);
        this.outputChannel.appendLine(`🔍 Errors: ${errors.filter((e: any) => e.severity === 'error').length}`);
        this.outputChannel.appendLine(`⚠️ Warnings: ${errors.filter((e: any) => e.severity === 'warning').length}`);
        this.outputChannel.appendLine('');
        
        // Show statistics
        if (statistics.duplicateFilenames.length > 0) {
            this.outputChannel.appendLine('=== DUPLICATE FILENAMES ===');
            statistics.duplicateFilenames.forEach((filename: string) => {
                this.outputChannel.appendLine(`🔄 ${filename}`);
            });
            this.outputChannel.appendLine('');
        }
        
        if (statistics.invalidFilenames.length > 0) {
            this.outputChannel.appendLine('=== INVALID FILENAMES ===');
            statistics.invalidFilenames.forEach((filename: string) => {
                this.outputChannel.appendLine(`❌ ${filename}`);
            });
            this.outputChannel.appendLine('');
        }
        
        if (statistics.emptyMarkers > 0) {
            this.outputChannel.appendLine(`=== EMPTY MARKERS: ${statistics.emptyMarkers} ===`);
            this.outputChannel.appendLine('');
        }
        
        // Show detailed errors
        if (errors.length > 0) {
            this.outputChannel.appendLine('=== DETAILED ERRORS ===');
            errors.forEach((error: any) => {
                const icon = error.severity === 'error' ? '❌' : '⚠️';
                this.outputChannel.appendLine(`${icon} Line ${error.line}: ${error.message}`);
            });
        }
        
        // Show output channel
        this.outputChannel.show();
        
        // Show summary notification
        const errorCount = errors.filter((e: any) => e.severity === 'error').length;
        const warningCount = errors.filter((e: any) => e.severity === 'warning').length;
        
        if (isValid) {
            const message = warningCount > 0 
                ? `✅ File is valid with ${warningCount} warnings`
                : '✅ File is completely valid!';
            vscode.window.showInformationMessage(message);
        } else {
            vscode.window.showErrorMessage(
                `❌ File is invalid: ${errorCount} errors, ${warningCount} warnings`
            );
        }
    }
    
    private async createDiagnostics(filePath: string, validation: any): Promise<void> {
        try {
            // Open the document to create diagnostics
            const document = await vscode.workspace.openTextDocument(filePath);
            
            // Create diagnostic collection
            const diagnostics: vscode.Diagnostic[] = [];
            
            for (const error of validation.errors) {
                if (error.line > 0 && error.line <= document.lineCount) {
                    const line = document.lineAt(error.line - 1);
                    const range = new vscode.Range(
                        error.line - 1, 0,
                        error.line - 1, line.text.length
                    );
                    
                    const severity = error.severity === 'error' 
                        ? vscode.DiagnosticSeverity.Error 
                        : vscode.DiagnosticSeverity.Warning;
                    
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        error.message,
                        severity
                    );
                    diagnostic.source = 'LookAtni';
                    
                    diagnostics.push(diagnostic);
                }
            }
            
            // Set diagnostics
            const collection = vscode.languages.createDiagnosticCollection('lookatni');
            collection.set(document.uri, diagnostics);
            
            // Store collection for cleanup
            this.context.subscriptions.push(collection);
            
        } catch (error) {
            this.logger.warn('Could not create diagnostics:', error);
        }
    }
}
