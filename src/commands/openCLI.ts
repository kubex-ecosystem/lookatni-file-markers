import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

export class OpenCLICommand {
    public readonly commandId = 'lookatni.openCLI';
    
    // ASCII 28 (File Separator) character for invisible markers
    private readonly FS_CHAR = String.fromCharCode(28);
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel
    ) {}
    
    async execute(): Promise<void> {
        this.logger.info('🔧 Opening LookAtni CLI tools...');
        
        try {
            // Check if CLI tools are available
            const cliPath = await this.findCLITools();
            
            if (cliPath) {
                await this.showCLIOptions(cliPath);
            } else {
                await this.offerCLIInstallation();
            }
            
        } catch (error) {
            this.logger.error('Error opening CLI:', error);
            vscode.window.showErrorMessage(`CLI access failed: ${error}`);
        }
    }
    
    private async findCLITools(): Promise<string | undefined> {
        const possiblePaths = [
            // Check extension resources
            path.join(this.context.extensionPath, 'cli'),
            // Check workspace
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath + '/cli',
            // Check parent directories
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath + '/../kortex',
            // Check common locations
            path.join(require('os').homedir(), '.lookatni'),
            '/usr/local/bin/lookatni',
            'C:\\Program Files\\LookAtni'
        ];
        
        for (const possiblePath of possiblePaths) {
            if (possiblePath && fs.existsSync(possiblePath)) {
                // Check if package.json with npm scripts exists (for workspace)
                const packageJsonPath = path.join(possiblePath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    try {
                        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                        if (packageJson.scripts && 
                            packageJson.scripts['lookatni:extract'] && 
                            packageJson.scripts['lookatni:generate']) {
                            this.logger.info(`Found LookAtni npm scripts at: ${possiblePath}`);
                            return possiblePath;
                        }
                    } catch (error) {
                        // Continue checking other paths
                    }
                }
            }
        }
        
        return undefined;
    }
    
    private async showCLIOptions(cliPath: string): Promise<void> {
        const choice = await vscode.window.showQuickPick([
            {
                label: '📂 Open CLI Folder',
                description: 'Open the CLI tools folder in file explorer',
                action: 'folder'
            },
            {
                label: '⚡ Extract Files',
                description: 'Run npm script: lookatni:extract',
                action: 'extract'
            },
            {
                label: '🏷️ Generate Markers',
                description: 'Run npm script: lookatni:generate',
                action: 'generate'
            },
            {
                label: '🧪 Run Tests',
                description: 'Run npm script: lookatni:test',
                action: 'test'
            },
            {
                label: '🎯 Quick Demo',
                description: 'Run npm script: lookatni:demo',
                action: 'demo'
            },
            {
                label: '📖 Show Help',
                description: 'Display CLI usage information',
                action: 'help'
            }
        ], {
            placeHolder: 'Choose CLI action'
        });
        
        if (!choice) {
            return;
        }
        
        switch (choice.action) {
            case 'folder':
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(cliPath));
                break;
                
            case 'extract':
                await this.runNpmScript('lookatni:extract');
                break;
                
            case 'generate':
                await this.runNpmScript('lookatni:generate');
                break;
                
            case 'test':
                await this.runNpmScript('lookatni:test');
                break;
                
            case 'demo':
                await this.runNpmScript('lookatni:demo');
                break;
                
            case 'help':
                this.showCLIHelp(cliPath);
                break;
        }
    }
    
    private async runNpmScript(scriptName: string): Promise<void> {
        // Get working directory - prefer workspace root
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
            return;
        }
        
        // Check if package.json exists
        const packageJsonPath = path.join(workspaceRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            vscode.window.showErrorMessage('No package.json found in workspace root.');
            return;
        }
        
        // Ask for script arguments if needed
        let args = '';
        if (scriptName === 'lookatni:extract' || scriptName === 'lookatni:generate') {
            const inputArgs = await vscode.window.showInputBox({
                prompt: `Enter arguments for ${scriptName} (or leave empty for interactive mode)`,
                placeHolder: 'e.g., input.txt output_folder'
            });
            
            if (inputArgs !== undefined) {
                args = inputArgs;
            } else {
                return; // User cancelled
            }
        }
        
        // Create terminal and run npm script
        const terminal = vscode.window.createTerminal({
            name: `LookAtni CLI - ${scriptName}`,
            cwd: workspaceRoot
        });
        
        // Run the npm script
        const command = `npm run ${scriptName} ${args}`.trim();
        terminal.sendText(command);
        terminal.show();
        
        this.outputChannel.appendLine(`✅ Started ${scriptName} in terminal`);
        this.outputChannel.appendLine(`Working directory: ${workspaceRoot}`);
        this.outputChannel.appendLine(`Command: ${command}`);
        if (args) {
            this.outputChannel.appendLine(`Arguments: ${args}`);
        }
    }
    
    private showCLIHelp(cliPath: string): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== LOOKATNI CLI TOOLS HELP ===');
        this.outputChannel.appendLine(`📁 Location: ${cliPath}`);
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('=== AVAILABLE SCRIPTS ===');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('📤 npm run lookatni:extract');
        this.outputChannel.appendLine('   Extract files from marked content');
        this.outputChannel.appendLine('   Usage: npm run lookatni:extract [marked_file] [output_dir]');
        this.outputChannel.appendLine('   Options: --dry-run, --interactive, --force');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('📥 npm run lookatni:generate');
        this.outputChannel.appendLine('   Generate marked file from source directory');
        this.outputChannel.appendLine('   Usage: npm run lookatni:generate [source_dir] [output_file]');
        this.outputChannel.appendLine('   Options: --max-size, --exclude');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('🧪 npm run lookatni:test');
        this.outputChannel.appendLine('   Run comprehensive tests of the LookAtni system');
        this.outputChannel.appendLine('   Usage: npm run lookatni:test');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('🎯 npm run lookatni:demo');
        this.outputChannel.appendLine('   Run interactive demonstration');
        this.outputChannel.appendLine('   Usage: npm run lookatni:demo');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('=== MARKER FORMAT ===');
        this.outputChannel.appendLine('LookAtni uses invisible Unicode markers to separate files:');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('// Markers are invisible - shown as ␜ for demonstration only');
        this.outputChannel.appendLine('//␜/ filename.ext /␜//');
        this.outputChannel.appendLine('file content here...');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('//␜/ another/file.txt /␜//');
        this.outputChannel.appendLine('more content...');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('=== EXAMPLES ===');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('# Extract files from marked content:');
        this.outputChannel.appendLine('npm run lookatni:extract project-marked.txt ./extracted');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('# Generate markers from a project:');
        this.outputChannel.appendLine('npm run lookatni:generate ./my-project output.txt');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('# Interactive mode:');
        this.outputChannel.appendLine('npm run lookatni:extract --interactive');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('=== FEATURES ===');
        this.outputChannel.appendLine('✅ Unique marker syntax that never conflicts');
        this.outputChannel.appendLine('✅ Preserves directory structure');
        this.outputChannel.appendLine('✅ Binary file detection and exclusion');
        this.outputChannel.appendLine('✅ Interactive and batch modes');
        this.outputChannel.appendLine('✅ Comprehensive validation');
        this.outputChannel.appendLine('✅ Statistics and reporting');
        this.outputChannel.appendLine('✅ VS Code integration');
        
        this.outputChannel.show();
        
        vscode.window.showInformationMessage(
            '📖 CLI help is displayed in the output panel'
        );
    }
    
    private async offerCLIInstallation(): Promise<void> {
        const choice = await vscode.window.showWarningMessage(
            '🔧 LookAtni CLI tools not found. Would you like to set them up?',
            'Download CLI',
            'Setup Instructions',
            'Use Extension Only'
        );
        
        switch (choice) {
            case 'Download CLI':
                await this.downloadCLITools();
                break;
                
            case 'Setup Instructions':
                this.showSetupInstructions();
                break;
                
            case 'Use Extension Only':
                vscode.window.showInformationMessage(
                    '✅ You can use all LookAtni features through the VS Code extension commands'
                );
                break;
        }
    }
    
    private async downloadCLITools(): Promise<void> {
        // In a real implementation, this would download from GitHub releases
        const choice = await vscode.window.showInformationMessage(
            '📥 CLI tools can be downloaded from the LookAtni repository',
            'Open Repository',
            'Copy CLI Path'
        );
        
        if (choice === 'Open Repository') {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/rafa-mori/lookatni-file-markers'));
        } else if (choice === 'Copy CLI Path') {
            const suggestedPath = path.join(this.context.extensionPath, 'cli');
            vscode.env.clipboard.writeText(suggestedPath);
            vscode.window.showInformationMessage(`CLI path copied: ${suggestedPath}`);
        }
    }
    
    private showSetupInstructions(): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== LOOKATNI CLI SETUP INSTRUCTIONS ===');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('1. Download the CLI tools:');
        this.outputChannel.appendLine('   git clone https://github.com/rafa-mori/lookatni-file-markers.git');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('1. Install Node.js and npm if not already installed');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('2. Ensure your workspace has package.json with LookAtni scripts:');
        this.outputChannel.appendLine('   • lookatni:extract');
        this.outputChannel.appendLine('   • lookatni:generate');
        this.outputChannel.appendLine('   • lookatni:test');
        this.outputChannel.appendLine('   • lookatni:demo');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('3. Install TypeScript execution runtime:');
        this.outputChannel.appendLine('   npm install -g tsx');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('4. Test the installation:');
        this.outputChannel.appendLine('   npm run lookatni:test');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('The extension will automatically detect the CLI tools once installed.');
        
        this.outputChannel.show();
    }
}
