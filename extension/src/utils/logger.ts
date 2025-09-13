import * as vscode from 'vscode';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly logLevel: LogLevel;

    constructor(
        channelName: string = 'LookAtni File Markers',
        logLevel: LogLevel = LogLevel.INFO
    ) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
        this.logLevel = logLevel;
    }

    debug(message: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, '🔍', message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, 'ℹ️', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.log(LogLevel.WARN, '⚠️', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, '❌', message, ...args);
        
        // Also show error notification for critical issues
        if (args.length > 0 && args[0] instanceof Error) {
            vscode.window.showErrorMessage(`LookAtni: ${message}`);
        }
    }

    success(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, '✅', message, ...args);
    }

    private log(level: LogLevel, icon: string, message: string, ...args: any[]): void {
        if (level < this.logLevel) {
            return;
        }

        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
        
        let formattedMessage = `[${timestamp}] ${icon} ${levelName}: ${message}`;
        
        if (args.length > 0) {
            const formattedArgs = args.map(arg => {
                if (arg instanceof Error) {
                    return `\n  Error: ${arg.message}\n  Stack: ${arg.stack}`;
                } else if (typeof arg === 'object') {
                    return `\n  ${JSON.stringify(arg, null, 2)}`;
                } else {
                    return ` ${arg}`;
                }
            }).join('');
            
            formattedMessage += formattedArgs;
        }

        this.outputChannel.appendLine(formattedMessage);
        
        // Auto-show output channel for warnings and errors
        if (level >= LogLevel.WARN) {
            this.outputChannel.show(true);
        }
    }

    show(): void {
        this.outputChannel.show();
    }

    hide(): void {
        this.outputChannel.hide();
    }

    clear(): void {
        this.outputChannel.clear();
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}
