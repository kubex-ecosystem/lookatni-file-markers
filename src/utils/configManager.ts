import * as vscode from 'vscode';

export interface LookatniConfig {
    // Visual markers configuration
    visualMarkers: {
        readIcon: string;
        unreadIcon: string;
        favoriteIcon: string;
        importantIcon: string;
        todoIcon: string;
        customIcon: string;
        autoSave: boolean;
        showInStatusBar: boolean;
    };
    
    // File processing configuration
    defaultMaxFileSize: number;
    showStatistics: boolean;
    autoValidate: boolean;
}

export class ConfigurationManager {
    private static readonly DEFAULT_CONFIG: LookatniConfig = {
        visualMarkers: {
            readIcon: '✓',
            unreadIcon: '●',
            favoriteIcon: '★',
            importantIcon: '!',
            todoIcon: '○',
            customIcon: '◆',
            autoSave: true,
            showInStatusBar: true
        },
        defaultMaxFileSize: 1000,
        showStatistics: true,
        autoValidate: false
    };

    private static instance: ConfigurationManager;
    private config: LookatniConfig;

    private constructor() {
        this.config = this.loadConfiguration();
        this.setupConfigurationWatcher();
    }

    public static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }

    private loadConfiguration(): LookatniConfig {
        try {
            const vscodeConfig = vscode.workspace.getConfiguration('lookatni');
            
            return {
                visualMarkers: {
                    readIcon: this.getSafeConfig(vscodeConfig, 'visualMarkers.readIcon', '✓'),
                    unreadIcon: this.getSafeConfig(vscodeConfig, 'visualMarkers.unreadIcon', '●'),
                    favoriteIcon: this.getSafeConfig(vscodeConfig, 'visualMarkers.favoriteIcon', '★'),
                    importantIcon: this.getSafeConfig(vscodeConfig, 'visualMarkers.importantIcon', '!'),
                    todoIcon: this.getSafeConfig(vscodeConfig, 'visualMarkers.todoIcon', '○'),
                    customIcon: this.getSafeConfig(vscodeConfig, 'visualMarkers.customIcon', '◆'),
                    autoSave: this.getSafeConfig(vscodeConfig, 'visualMarkers.autoSave', true),
                    showInStatusBar: this.getSafeConfig(vscodeConfig, 'visualMarkers.showInStatusBar', true)
                },
                defaultMaxFileSize: this.getSafeConfig(vscodeConfig, 'defaultMaxFileSize', 1000),
                showStatistics: this.getSafeConfig(vscodeConfig, 'showStatistics', true),
                autoValidate: this.getSafeConfig(vscodeConfig, 'autoValidate', false)
            };
        } catch (error) {
            console.warn('Failed to load LookAtni configuration, using defaults:', error);
            return { ...ConfigurationManager.DEFAULT_CONFIG };
        }
    }

    private getSafeConfig<T>(config: vscode.WorkspaceConfiguration, key: string, defaultValue: T): T {
        try {
            const value = config.get<T>(key);
            if (value !== undefined && value !== null) {
                // Additional validation for string configs
                if (typeof defaultValue === 'string' && typeof value === 'string') {
                    const trimmedValue = value.trim();
                    return (trimmedValue || defaultValue) as T;
                }
                return value;
            }
            return defaultValue;
        } catch (error) {
            console.warn(`Failed to get config for ${key}, using default:`, error);
            return defaultValue;
        }
    }

    private setupConfigurationWatcher(): void {
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('lookatni')) {
                console.log('LookAtni configuration changed, reloading...');
                this.config = this.loadConfiguration();
                this.notifyConfigurationChange();
            }
        });
    }

    private notifyConfigurationChange(): void {
        // Emit event for configuration change
        vscode.commands.executeCommand('lookatni.internal.configChanged');
    }

    public getConfig(): LookatniConfig {
        return { ...this.config };
    }

    public getVisualMarkersConfig() {
        return { ...this.config.visualMarkers };
    }

    public getIconForMarkerType(type: string): string {
        const config = this.config.visualMarkers;
        const iconMap: Record<string, string> = {
            'read': config.readIcon,
            'unread': config.unreadIcon,
            'favorite': config.favoriteIcon,
            'important': config.importantIcon,
            'todo': config.todoIcon,
            'custom': config.customIcon
        };

        return iconMap[type] || config.customIcon;
    }

    public async validateConfiguration(): Promise<{ isValid: boolean; issues: string[] }> {
        const issues: string[] = [];
        const config = this.config;

        // Check if icons are not empty
        Object.entries(config.visualMarkers).forEach(([key, value]) => {
            if (key.endsWith('Icon') && typeof value === 'string' && !value.trim()) {
                issues.push(`Visual marker icon for ${key} is empty`);
            }
        });

        // Check file size limits
        if (config.defaultMaxFileSize <= 0) {
            issues.push('Default max file size must be greater than 0');
        }

        // Check for invalid characters in icons
        const iconRegex = /^[\p{L}\p{N}\p{P}\p{S}\p{M}]+$/u;
        Object.entries(config.visualMarkers).forEach(([key, value]) => {
            if (key.endsWith('Icon') && typeof value === 'string' && value && !iconRegex.test(value)) {
                issues.push(`Invalid characters in ${key}: ${value}`);
            }
        });

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    public async resetToDefaults(): Promise<void> {
        const config = vscode.workspace.getConfiguration('lookatni');
        
        try {
            // Reset all configurations to default
            for (const [section, values] of Object.entries(ConfigurationManager.DEFAULT_CONFIG)) {
                if (typeof values === 'object' && values !== null) {
                    for (const [key, defaultValue] of Object.entries(values)) {
                        await config.update(`${section}.${key}`, defaultValue, vscode.ConfigurationTarget.Global);
                    }
                } else {
                    await config.update(section, values, vscode.ConfigurationTarget.Global);
                }
            }
            
            vscode.window.showInformationMessage('LookAtni configuration reset to defaults');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to reset configuration: ${error}`);
        }
    }

    public async exportConfiguration(): Promise<string> {
        return JSON.stringify({
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            configuration: this.config
        }, null, 2);
    }

    public async importConfiguration(configJson: string): Promise<void> {
        try {
            const importData = JSON.parse(configJson);
            const config = vscode.workspace.getConfiguration('lookatni');
            
            if (importData.configuration) {
                for (const [section, values] of Object.entries(importData.configuration)) {
                    if (typeof values === 'object' && values !== null) {
                        for (const [key, value] of Object.entries(values)) {
                            await config.update(`${section}.${key}`, value, vscode.ConfigurationTarget.Global);
                        }
                    } else {
                        await config.update(section, values, vscode.ConfigurationTarget.Global);
                    }
                }
            }
            
            vscode.window.showInformationMessage('Configuration imported successfully');
        } catch (error) {
            throw new Error(`Failed to import configuration: ${error}`);
        }
    }
}
