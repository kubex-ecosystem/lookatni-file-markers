import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { ConfigurationManager } from '../utils/configManager';

export class ConfigurationCommand {
    public readonly commandId = 'lookatni.configuration';
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel
    ) {}
    
    async execute(): Promise<void> {
        this.logger.info('🔧 Starting configuration management...');
        
        try {
            const action = await this.showConfigurationMenu();
            if (action) {
                await this.executeAction(action);
            }
            
        } catch (error) {
            this.logger.error('Error in configuration command:', error);
            vscode.window.showErrorMessage(`Configuration Error: ${error}`);
        }
    }

    private async showConfigurationMenu(): Promise<string | undefined> {
        const options = [
            {
                label: '$(gear) Validate Configuration',
                description: 'Check current configuration for issues',
                action: 'validate'
            },
            {
                label: '$(refresh) Reset to Defaults',
                description: 'Reset all LookAtni settings to default values',
                action: 'reset'
            },
            {
                label: '$(export) Export Configuration',
                description: 'Export current configuration to file',
                action: 'export'
            },
            {
                label: '$(import) Import Configuration',
                description: 'Import configuration from file',
                action: 'import'
            },
            {
                label: '$(eye) Show Current Settings',
                description: 'Display current configuration values',
                action: 'show'
            },
            {
                label: '$(settings-gear) Open Settings',
                description: 'Open VS Code settings for LookAtni',
                action: 'openSettings'
            }
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'LookAtni Configuration Management',
            title: 'Configuration Options'
        });

        return selected?.action;
    }

    private async executeAction(action: string): Promise<void> {
        const configManager = ConfigurationManager.getInstance();

        switch (action) {
            case 'validate':
                await this.validateConfiguration(configManager);
                break;
                
            case 'reset':
                await this.resetConfiguration(configManager);
                break;
                
            case 'export':
                await this.exportConfiguration(configManager);
                break;
                
            case 'import':
                await this.importConfiguration(configManager);
                break;
                
            case 'show':
                await this.showCurrentConfiguration(configManager);
                break;
                
            case 'openSettings':
                await vscode.commands.executeCommand('workbench.action.openSettings', 'lookatni');
                break;
        }
    }

    private async validateConfiguration(configManager: ConfigurationManager): Promise<void> {
        const validation = await configManager.validateConfiguration();
        
        this.outputChannel.appendLine('\n=== CONFIGURATION VALIDATION ===');
        
        if (validation.isValid) {
            this.outputChannel.appendLine('✅ Configuration is valid');
            vscode.window.showInformationMessage('✅ LookAtni configuration is valid');
        } else {
            this.outputChannel.appendLine('❌ Configuration has issues:');
            validation.issues.forEach(issue => {
                this.outputChannel.appendLine(`  • ${issue}`);
            });
            
            const action = await vscode.window.showWarningMessage(
                `Configuration has ${validation.issues.length} issue(s). View details?`,
                'View Details',
                'Reset to Defaults',
                'Ignore'
            );
            
            if (action === 'View Details') {
                this.outputChannel.show();
            } else if (action === 'Reset to Defaults') {
                await this.resetConfiguration(configManager);
            }
        }
    }

    private async resetConfiguration(configManager: ConfigurationManager): Promise<void> {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to reset all LookAtni settings to defaults?',
            { modal: true },
            'Yes, Reset All',
            'Cancel'
        );

        if (confirmation === 'Yes, Reset All') {
            await configManager.resetToDefaults();
            this.outputChannel.appendLine('\n=== CONFIGURATION RESET ===');
            this.outputChannel.appendLine('✅ Configuration reset to defaults');
        }
    }

    private async exportConfiguration(configManager: ConfigurationManager): Promise<void> {
        try {
            const configJson = await configManager.exportConfiguration();
            const saveUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('lookatni-config-export.json'),
                filters: {
                    'JSON': ['json'],
                    'All Files': ['*']
                }
            });

            if (saveUri) {
                await vscode.workspace.fs.writeFile(saveUri, Buffer.from(configJson));
                vscode.window.showInformationMessage(`Configuration exported to ${saveUri.fsPath}`);
                this.outputChannel.appendLine(`✅ Configuration exported to: ${saveUri.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error}`);
        }
    }

    private async importConfiguration(configManager: ConfigurationManager): Promise<void> {
        try {
            const openUri = await vscode.window.showOpenDialog({
                filters: {
                    'JSON': ['json'],
                    'All Files': ['*']
                },
                canSelectMany: false
            });

            if (openUri && openUri[0]) {
                const fileData = await vscode.workspace.fs.readFile(openUri[0]);
                const jsonData = Buffer.from(fileData).toString();
                
                await configManager.importConfiguration(jsonData);
                this.outputChannel.appendLine(`✅ Configuration imported from: ${openUri[0].fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Import failed: ${error}`);
        }
    }

    private async showCurrentConfiguration(configManager: ConfigurationManager): Promise<void> {
        const config = configManager.getConfig();
        
        let content = '# LookAtni Configuration\n\n';
        content += `**Generated:** ${new Date().toLocaleString()}\n\n`;
        
        content += '## Visual Markers\n\n';
        content += `- **Read Icon:** ${config.visualMarkers.readIcon}\n`;
        content += `- **Unread Icon:** ${config.visualMarkers.unreadIcon}\n`;
        content += `- **Favorite Icon:** ${config.visualMarkers.favoriteIcon}\n`;
        content += `- **Important Icon:** ${config.visualMarkers.importantIcon}\n`;
        content += `- **Todo Icon:** ${config.visualMarkers.todoIcon}\n`;
        content += `- **Custom Icon:** ${config.visualMarkers.customIcon}\n`;
        content += `- **Auto Save:** ${config.visualMarkers.autoSave}\n`;
        content += `- **Show in Status Bar:** ${config.visualMarkers.showInStatusBar}\n\n`;
        
        content += '## File Processing\n\n';
        content += `- **Default Max File Size:** ${config.defaultMaxFileSize} KB\n`;
        content += `- **Show Statistics:** ${config.showStatistics}\n`;
        content += `- **Auto Validate:** ${config.autoValidate}\n\n`;
        
        content += '## Configuration Commands\n\n';
        content += 'Use `LookAtni: Configuration` to manage these settings.\n';

        // Show in new document
        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }

    async validateConfigurationOnStartup(): Promise<void> {
        const configManager = ConfigurationManager.getInstance();
        const validation = await configManager.validateConfiguration();
        
        if (!validation.isValid) {
            this.logger.warn('Configuration validation failed on startup');
            validation.issues.forEach(issue => {
                this.logger.warn(`Config issue: ${issue}`);
            });
            
            // Show non-intrusive notification
            const action = await vscode.window.showWarningMessage(
                'LookAtni configuration has issues. Would you like to fix them?',
                'Fix Now',
                'Later'
            );
            
            if (action === 'Fix Now') {
                await this.execute();
            }
        }
    }
}
