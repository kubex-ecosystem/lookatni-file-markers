import * as vscode from 'vscode';

export class LookAtniStatusBar {
    private statusBarItem: vscode.StatusBarItem;
    private hideTimeout?: NodeJS.Timeout;
    
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        
        this.statusBarItem.command = 'lookatni.quickDemo';
        this.statusBarItem.tooltip = 'LookAtni Revolution - Click for Quick Demo';
        this.statusBarItem.text = '$(file-code) LookAtni';
        
        // Show by default
        this.statusBarItem.show();
    }
    
    show(message?: string, duration?: number): void {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = undefined;
        }
        
        if (message) {
            this.statusBarItem.text = `$(loading~spin) ${message}`;
            this.statusBarItem.tooltip = `LookAtni: ${message}`;
        } else {
            this.statusBarItem.text = '$(file-code) LookAtni';
            this.statusBarItem.tooltip = 'LookAtni Revolution - Click for Quick Demo';
        }
        
        this.statusBarItem.show();
        
        if (duration && duration > 0) {
            this.hideTimeout = setTimeout(() => {
                this.reset();
            }, duration);
        }
    }
    
    hide(): void {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = undefined;
        }
        
        this.reset();
    }
    
    private reset(): void {
        this.statusBarItem.text = '$(file-code) LookAtni';
        this.statusBarItem.tooltip = 'LookAtni Revolution - Click for Quick Demo';
        this.statusBarItem.show();
    }
    
    updateProgress(current: number, total: number, operation: string): void {
        const percentage = Math.round((current / total) * 100);
        this.statusBarItem.text = `$(loading~spin) ${operation} ${percentage}%`;
        this.statusBarItem.tooltip = `LookAtni: ${operation} (${current}/${total})`;
    }
    
    showError(message: string): void {
        this.statusBarItem.text = `$(error) LookAtni Error`;
        this.statusBarItem.tooltip = `LookAtni Error: ${message}`;
        this.statusBarItem.show();
        
        // Reset after 5 seconds
        setTimeout(() => {
            this.reset();
        }, 5000);
    }
    
    showSuccess(message: string): void {
        this.statusBarItem.text = `$(check) ${message}`;
        this.statusBarItem.tooltip = `LookAtni: ${message}`;
        this.statusBarItem.show();
        
        // Reset after 3 seconds
        setTimeout(() => {
            this.reset();
        }, 3000);
    }
    
    dispose(): void {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        this.statusBarItem.dispose();
    }
}
