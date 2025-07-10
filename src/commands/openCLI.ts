import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

export class OpenCLICommand {
    public readonly commandId = 'lookatni.openCLI';
    
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
                // Check if extract-files.sh exists
                const extractScript = path.join(possiblePath, 'extract-files.sh');
                if (fs.existsSync(extractScript)) {
                    this.logger.info(`Found CLI tools at: ${possiblePath}`);
                    return possiblePath;
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
                description: 'Run extract-files.sh in terminal',
                action: 'extract'
            },
            {
                label: '🏷️ Generate Markers',
                description: 'Run generate-markers.sh in terminal',
                action: 'generate'
            },
            {
                label: '🧪 Run Tests',
                description: 'Run test-lookatni.sh in terminal',
                action: 'test'
            },
            {
                label: '🎯 Quick Demo',
                description: 'Run demo.sh in terminal',
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
                await this.runCLIScript(cliPath, 'extract-files.sh');
                break;
                
            case 'generate':
                await this.runCLIScript(cliPath, 'generate-markers.sh');
                break;
                
            case 'test':
                await this.runCLIScript(cliPath, 'test-lookatni.sh');
                break;
                
            case 'demo':
                await this.runCLIScript(cliPath, 'demo.sh');
                break;
                
            case 'help':
                this.showCLIHelp(cliPath);
                break;
        }
    }
    
    private async runCLIScript(cliPath: string, scriptName: string): Promise<void> {
        const scriptPath = path.join(cliPath, scriptName);
        
        if (!fs.existsSync(scriptPath)) {
            vscode.window.showErrorMessage(`Script not found: ${scriptName}`);
            return;
        }
        
        // Get working directory - prefer workspace root
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const workingDir = workspaceRoot || path.dirname(cliPath);
        
        // Ask for script arguments if needed
        let args = '';
        if (scriptName === 'extract-files.sh' || scriptName === 'generate-markers.sh') {
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
        
        // Create terminal and run script
        const terminal = vscode.window.createTerminal({
            name: `LookAtni CLI - ${scriptName}`,
            cwd: workingDir
        });
        
        // Make script executable (Unix systems)
        if (process.platform !== 'win32') {
            terminal.sendText(`chmod +x "${scriptPath}"`);
        }
        
        // Run the script
        const command = process.platform === 'win32' 
            ? `bash "${scriptPath}" ${args}`.trim()
            : `"${scriptPath}" ${args}`.trim();
            
        terminal.sendText(command);
        terminal.show();
        
        this.logger.info(`Executed CLI script: ${scriptName} with args: ${args}`);
    }
    
    private showCLIHelp(cliPath: string): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== LOOKATNI CLI TOOLS HELP ===');
        this.outputChannel.appendLine(`📁 Location: ${cliPath}`);
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('=== AVAILABLE SCRIPTS ===');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('📤 extract-files.sh');
        this.outputChannel.appendLine('   Extract files from marked content');
        this.outputChannel.appendLine('   Usage: ./extract-files.sh [marked_file] [output_dir]');
        this.outputChannel.appendLine('   Options: --dry-run, --interactive, --force');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('📥 generate-markers.sh');
        this.outputChannel.appendLine('   Generate marked file from source directory');
        this.outputChannel.appendLine('   Usage: ./generate-markers.sh [source_dir] [output_file]');
        this.outputChannel.appendLine('   Options: --max-size, --exclude');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('🧪 test-lookatni.sh');
        this.outputChannel.appendLine('   Run comprehensive tests of the LookAtni system');
        this.outputChannel.appendLine('   Usage: ./test-lookatni.sh');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('🎯 demo.sh');
        this.outputChannel.appendLine('   Run interactive demonstration');
        this.outputChannel.appendLine('   Usage: ./demo.sh');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('=== MARKER FORMAT ===');
        this.outputChannel.appendLine('LookAtni uses unique markers to separate files:');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('//m/ filename.ext /m//');
        this.outputChannel.appendLine('file content here...');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('//m/ another/file.txt /m//');
        this.outputChannel.appendLine('more content...');
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine('=== EXAMPLES ===');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('# Extract files from marked content:');
        this.outputChannel.appendLine('./extract-files.sh project-marked.txt ./extracted');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('# Generate markers from a project:');
        this.outputChannel.appendLine('./generate-markers.sh ./my-project output.txt');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('# Interactive mode:');
        this.outputChannel.appendLine('./extract-files.sh --interactive');
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
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/your-repo/lookatni-revolution'));
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
        this.outputChannel.appendLine('   git clone https://github.com/your-repo/lookatni-revolution.git');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('2. Place CLI scripts in one of these locations:');
        this.outputChannel.appendLine(`   • ${path.join(this.context.extensionPath, 'cli')}`);
        this.outputChannel.appendLine(`   • ${path.join(require('os').homedir(), '.lookatni')}`);
        this.outputChannel.appendLine('   • Your workspace folder/cli');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('3. Make scripts executable (Unix/Linux/Mac):');
        this.outputChannel.appendLine('   chmod +x *.sh');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('4. Test the installation:');
        this.outputChannel.appendLine('   ./test-lookatni.sh');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('The extension will automatically detect the CLI tools once installed.');
        
        this.outputChannel.show();
    }
}
