import * as vscode from 'vscode';
import { ExtractFilesCommand } from './commands/extractFiles';
import { GenerateMarkersCommand } from './commands/generateMarkers';
import { ValidateMarkersCommand } from './commands/validateMarkers';
import { QuickDemoCommand } from './commands/quickDemo';
import { ShowStatisticsCommand } from './commands/showStatistics';
import { OpenCLICommand } from './commands/openCLI';
import { VisualMarkersCommand } from './commands/visualMarkers';
import { QuickMarkersCommands } from './commands/quickMarkers';
import { LookAtniExplorerProvider } from './views/explorerProvider';
import { LookAtniStatusBar } from './utils/statusBar';
import { Logger } from './utils/logger';
import { VisualMarkersManager } from './utils/visualMarkers';

export function activate(context: vscode.ExtensionContext) {
    // Initialize logger
    const logger = new Logger();
    const outputChannel = vscode.window.createOutputChannel('LookAtni File Markers');
    
    logger.info('🚀 LookAtni File Markers is activating...');
    
    // Initialize status bar
    const statusBar = new LookAtniStatusBar();
    context.subscriptions.push(statusBar);
    
    // Initialize visual markers manager
    const visualMarkersManager = new VisualMarkersManager(context);
    
    // Initialize explorer provider
    const explorerProvider = new LookAtniExplorerProvider(context);
    vscode.window.registerTreeDataProvider('lookatniExplorer', explorerProvider);
    
    // Initialize quick markers commands
    const quickMarkers = new QuickMarkersCommands(context, logger, visualMarkersManager);
    
    // Register commands
    const commands = [
        new ExtractFilesCommand(context, logger, outputChannel),
        new GenerateMarkersCommand(context, logger, outputChannel),
        new ValidateMarkersCommand(context, logger, outputChannel),
        new QuickDemoCommand(context, logger, outputChannel),
        new ShowStatisticsCommand(context, logger, outputChannel),
        new OpenCLICommand(context, logger, outputChannel),
        new VisualMarkersCommand(context, logger, outputChannel, visualMarkersManager)
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
    
    // Register quick markers commands
    const quickMarkersCommands = [
        { id: 'lookatni.markAsRead', handler: quickMarkers.markAsRead.bind(quickMarkers) },
        { id: 'lookatni.markAsFavorite', handler: quickMarkers.markAsFavorite.bind(quickMarkers) },
        { id: 'lookatni.markAsImportant', handler: quickMarkers.markAsImportant.bind(quickMarkers) },
        { id: 'lookatni.showMarkersOverview', handler: quickMarkers.showMarkersOverview.bind(quickMarkers) },
        { id: 'lookatni.clearAllMarkers', handler: quickMarkers.clearAllMarkers.bind(quickMarkers) },
        { id: 'lookatni.exportMarkers', handler: quickMarkers.exportMarkers.bind(quickMarkers) },
        { id: 'lookatni.importMarkers', handler: quickMarkers.importMarkers.bind(quickMarkers) }
    ];

    quickMarkersCommands.forEach(({ id, handler }) => {
        const disposable = vscode.commands.registerCommand(id, handler);
        context.subscriptions.push(disposable);
        logger.info(`✅ Registered quick command: ${id}`);
    });
    
    // Register refresh command for explorer
    const refreshCommand = vscode.commands.registerCommand('lookatniExplorer.refresh', () => {
        explorerProvider.refresh();
    });
    context.subscriptions.push(refreshCommand);
    
    // Show welcome message
    showWelcomeMessage(context);
    
    logger.info('🎉 LookAtni File Markers activated successfully!');
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
            '🚀 Welcome to LookAtni File Markers! Organize your code workflow with unique markers.',
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
