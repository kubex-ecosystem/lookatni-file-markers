import * as vscode from 'vscode';
import { ExtractFilesCommand } from './commands/extractFiles';
import { GenerateMarkersCommand } from './commands/generateMarkers';
import { ValidateMarkersCommand } from './commands/validateMarkers';
import { QuickDemoCommand } from './commands/quickDemo';
import { ShowStatisticsCommand } from './commands/showStatistics';
import { OpenCLICommand } from './commands/openCLI';
import { LookAtniExplorerProvider } from './views/explorerProvider';
import { LookAtniStatusBar } from './utils/statusBar';
import { Logger } from './utils/logger';

export function activate(context: vscode.ExtensionContext) {
    // Initialize logger
    const logger = new Logger();
    const outputChannel = vscode.window.createOutputChannel('LookAtni Revolution');
    
    logger.info('🚀 LookAtni Revolution is activating...');
    
    // Initialize status bar
    const statusBar = new LookAtniStatusBar();
    context.subscriptions.push(statusBar);
    
    // Initialize explorer provider
    const explorerProvider = new LookAtniExplorerProvider(context);
    vscode.window.registerTreeDataProvider('lookatniExplorer', explorerProvider);
    
    // Register commands
    const commands = [
        new ExtractFilesCommand(context, logger, outputChannel),
        new GenerateMarkersCommand(context, logger, outputChannel),
        new ValidateMarkersCommand(context, logger, outputChannel),
        new QuickDemoCommand(context, logger, outputChannel),
        new ShowStatisticsCommand(context, logger, outputChannel),
        new OpenCLICommand(context, logger, outputChannel)
    ];
    
    // Register all commands
    commands.forEach(command => {
        const disposable = vscode.commands.registerCommand(command.commandId, (...args) => {
            try {
                statusBar.show('Running command...');
                return command.execute(...args);
            } catch (error) {
                logger.error(`Error executing command ${command.commandId}:`, error);
                vscode.window.showErrorMessage(`LookAtni: ${error}`);
            } finally {
                statusBar.hide();
            }
        });
        
        context.subscriptions.push(disposable);
        logger.info(`✅ Registered command: ${command.commandId}`);
    });
    
    // Register refresh command for explorer
    const refreshCommand = vscode.commands.registerCommand('lookatniExplorer.refresh', () => {
        explorerProvider.refresh();
    });
    context.subscriptions.push(refreshCommand);
    
    // Show welcome message
    showWelcomeMessage(context);
    
    logger.info('🎉 LookAtni Revolution activated successfully!');
    statusBar.show('Ready', 3000);
}

export function deactivate() {
    // Cleanup if needed
}

async function showWelcomeMessage(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('lookatni');
    const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
    
    if (!hasShownWelcome) {
        const result = await vscode.window.showInformationMessage(
            '🚀 Welcome to LookAtni Revolution! Transform your code workflow with unique markers.',
            'Quick Demo',
            'Open Documentation',
            'Dismiss'
        );
        
        switch (result) {
            case 'Quick Demo':
                vscode.commands.executeCommand('lookatni.quickDemo');
                break;
            case 'Open Documentation':
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/lookatni/revolution'));
                break;
        }
        
        context.globalState.update('hasShownWelcome', true);
    }
}
