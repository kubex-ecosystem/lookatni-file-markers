import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { generateWithCore, extractWithCore, validateWithCore } from '../utils/coreBridge';

export class QuickDemoCommand {
    public readonly commandId = 'lookatni-file-markers.quickDemo';
    
    // ASCII 28 (File Separator) character for invisible markers
    private readonly FS_CHAR = String.fromCharCode(28);
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel
    ) {}
    
    async execute(): Promise<void> {
        this.logger.info('🚀 Starting LookAtni Quick Demo...');
        
        try {
            // Show demo introduction
            const proceed = await this.showDemoIntroduction();
            if (!proceed) {
                return;
            }
            
            // Create demo workspace
            const demoPath = await this.createDemoWorkspace();
            if (!demoPath) {
                return;
            }
            
            // Generate markers
            const markedFile = await this.generateDemoMarkers(demoPath);
            
            // Extract files
            await this.extractDemoFiles(markedFile, demoPath);
            
            // Show completion
            this.showDemoCompletion(demoPath, markedFile);
            
        } catch (error) {
            this.logger.error('Error during demo:', error);
            vscode.window.showErrorMessage(`Demo failed: ${error}`);
        }
    }
    
    private async showDemoIntroduction(): Promise<boolean> {
        const message = `🎯 Welcome to LookAtni File Markers Quick Demo!
        
This demo will:
• Create sample files with different extensions
• Generate a marked file using invisible Unicode markers
• Extract files back from the marked content
• Show validation and statistics

The demo creates a temporary folder and won't affect your current workspace.

Ready to see LookAtni in action?`;
        
        const choice = await vscode.window.showInformationMessage(
            message,
            { modal: true },
            'Start Demo',
            'Cancel'
        );
        
        return choice === 'Start Demo';
    }
    
    private async createDemoWorkspace(): Promise<string | undefined> {
        // Get demo location
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const demoParent = workspaceRoot || require('os').homedir();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const demoPath = path.join(demoParent, `lookatni-demo-${timestamp}`);
        
        try {
            // Create demo directory
            fs.mkdirSync(demoPath, { recursive: true });
            
            // Create sample files
            await this.createSampleFiles(demoPath);
            
            this.logger.success(`Created demo workspace: ${demoPath}`);
            return demoPath;
            
        } catch (error) {
            this.logger.error('Failed to create demo workspace:', error);
            vscode.window.showErrorMessage('Failed to create demo workspace');
            return undefined;
        }
    }
    
    private async createSampleFiles(demoPath: string): Promise<void> {
        const samples = {
            'README.md': `# LookAtni Demo Project

This is a sample project to demonstrate the LookAtni File Markers system.

## Features
- File marker system with invisible Unicode characters
- CLI tools for extraction and generation
- VS Code extension for seamless integration

Generated on: ${new Date().toISOString()}
`,
            'package.json': JSON.stringify({
                name: 'lookatni-demo',
                version: '1.0.0',
                description: 'Demo project for LookAtni File Markers',
                main: 'index.js',
                scripts: {
                    start: 'node index.js',
                    test: 'echo "No tests yet"'
                },
                keywords: ['lookatni', 'demo', 'markers'],
                author: 'LookAtni File Markers',
                license: 'MIT'
            }, null, 2),
            
            'src/index.js': `// LookAtni Demo - Main File
console.log('🚀 Welcome to LookAtni File Markers!');

function demonstrateMarkers() {
    console.log('This file will be marked with invisible Unicode characters');
    console.log('Each file gets unique markers for easy extraction');
    
    const features = [
        'Unique file markers',
        'CLI tools',
        'VS Code extension',
        'Validation system'
    ];
    
    features.forEach((feature, index) => {
        console.log(\`\${index + 1}. \${feature}\`);
    });
}

demonstrateMarkers();
`,
            
            'src/utils.js': `// Utility functions for LookAtni Demo

export function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function validateFilename(filename) {
    const invalidChars = /[<>:"|?*]/;
    return !invalidChars.test(filename);
}

export function createMarker(filename) {
    const FS_CHAR = String.fromCharCode(28);
    return \`//\${FS_CHAR}/ \${filename} /\${FS_CHAR}//\`;
}
`,
            
            'config/settings.json': JSON.stringify({
                demo: true,
                version: '1.0.0',
                features: {
                    markers: true,
                    validation: true,
                    extraction: true
                },
                created: new Date().toISOString()
            }, null, 2),
            
            'docs/guide.md': `# LookAtni Usage Guide

## What are markers?

Markers use invisible Unicode characters (ASCII 28 File Separator).
They are completely invisible but allow for perfect file organization.

## Example:

\`\`\`
// Markers are invisible - shown as ␜ for demonstration only
//␜/ src/example.js /␜//
console.log('This content belongs to src/example.js');
const demo = true;

//␜/ README.md /␜//
# Another File
This content belongs to README.md
\`\`\`

## Benefits:
- Easy file identification
- Preserves directory structure  
- Supports validation
- Works with any text format
`
        };
        
        // Create files
        for (const [filePath, content] of Object.entries(samples)) {
            const fullPath = path.join(demoPath, filePath);
            const dir = path.dirname(fullPath);
            
            // Create directory if needed
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, content, 'utf-8');
        }
    }
    
    private async generateDemoMarkers(demoPath: string): Promise<string> {
        const outputFile = path.join(demoPath, 'demo-marked.txt');
        
        const options = {
            maxFileSize: 1000, // 1MB limit
            excludePatterns: ['node_modules', '.git', '*.log']
        };
        
        this.outputChannel.appendLine('\n=== GENERATING MARKERS ===');
        
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating demo markers...',
            cancellable: false
        }, async (progress) => {
            await generateWithCore(demoPath, outputFile, options, (pct) => {
                progress.report({ increment: 0, message: `${pct}%` });
            });
            return;
        });

        // Use validator to summarize
        const validation = await validateWithCore(outputFile);
        this.outputChannel.appendLine(`✅ Generated markers for ${validation.statistics.totalFiles} files`);
        this.outputChannel.appendLine(`📊 Total size: ${this.formatBytes(validation.statistics.totalBytes)}`);
        this.outputChannel.appendLine(`📄 Output: ${outputFile}`);
        
        return outputFile;
    }
    
    private async extractDemoFiles(markedFile: string, demoPath: string): Promise<void> {
        const extractPath = path.join(demoPath, 'extracted');
        
        this.outputChannel.appendLine('\n=== EXTRACTING FILES ===');
        
        const results = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Extracting demo files...',
            cancellable: false
        }, async () => {
            const res = await extractWithCore(markedFile, extractPath, { overwrite: true, createDirs: true, dryRun: false }, this.logger);
            return { extractedFiles: res.extractedFiles, errors: res.errors };
        });
        
        this.outputChannel.appendLine(`✅ Extracted ${results.extractedFiles.length} files`);
        this.outputChannel.appendLine(`📁 Output directory: ${extractPath}`);
        
        if (results.errors.length > 0) {
            this.outputChannel.appendLine('⚠️ Errors:');
            results.errors.forEach((error: string) => {
                this.outputChannel.appendLine(`  • ${error}`);
            });
        }
    }
    
    private async showDemoCompletion(demoPath: string, markedFile: string): Promise<void> {
        this.outputChannel.appendLine('\n=== DEMO COMPLETED ===');
        this.outputChannel.appendLine(`📁 Demo workspace: ${demoPath}`);
        this.outputChannel.appendLine(`📄 Marked file: ${markedFile}`);
        this.outputChannel.appendLine(`📂 Extracted files: ${path.join(demoPath, 'extracted')}`);
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('🎯 Demo completed successfully!');
        this.outputChannel.appendLine('You can now explore the generated files and see how LookAtni works.');
        
        this.outputChannel.show();
        
        const choice = await vscode.window.showInformationMessage(
            '🎉 Demo completed! What would you like to do?',
            'Open Demo Folder',
            'View Marked File',
            'Open Extracted Files',
            'Close'
        );
        
        switch (choice) {
            case 'Open Demo Folder':
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(demoPath));
                break;
            case 'View Marked File':
                const document = await vscode.workspace.openTextDocument(markedFile);
                vscode.window.showTextDocument(document);
                break;
            case 'Open Extracted Files':
                const extractedPath = path.join(demoPath, 'extracted');
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(extractedPath));
                break;
        }
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
