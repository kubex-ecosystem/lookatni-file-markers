import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { VisualMarkersManager } from '../utils/visualMarkers';

export class QuickMarkersCommands {
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private markersManager: VisualMarkersManager
    ) {}

    // Quick mark as read
    async markAsRead(uri?: vscode.Uri): Promise<void> {
        const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
        if (!targetUri) {
            vscode.window.showErrorMessage('No file to mark');
            return;
        }

        await this.markersManager.toggleMarker(targetUri, 'read');
        const fileName = vscode.workspace.asRelativePath(targetUri);
        vscode.window.showInformationMessage(`${fileName} marked as read`);
    }

    // Quick mark as favorite
    async markAsFavorite(uri?: vscode.Uri): Promise<void> {
        const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
        if (!targetUri) {
            vscode.window.showErrorMessage('No file to mark');
            return;
        }

        await this.markersManager.toggleMarker(targetUri, 'favorite');
        const fileName = vscode.workspace.asRelativePath(targetUri);
        vscode.window.showInformationMessage(`${fileName} marked as favorite`);
    }

    // Quick mark as important
    async markAsImportant(uri?: vscode.Uri): Promise<void> {
        const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
        if (!targetUri) {
            vscode.window.showErrorMessage('No file to mark');
            return;
        }

        await this.markersManager.toggleMarker(targetUri, 'important');
        const fileName = vscode.workspace.asRelativePath(targetUri);
        vscode.window.showInformationMessage(`${fileName} marked as important`);
    }

    // Show markers overview
    async showMarkersOverview(): Promise<void> {
        const markers = this.markersManager.getAllMarkers();
        
        if (markers.length === 0) {
            vscode.window.showInformationMessage('No markers found. Start marking files!');
            return;
        }

        // Group by type
        const grouped = markers.reduce((acc, marker) => {
            if (!acc[marker.type]) {
                acc[marker.type] = [];
            }
            acc[marker.type].push(marker);
            return acc;
        }, {} as Record<string, typeof markers>);

        // Create overview content
        let content = '# Visual Markers Overview\n\n';
        content += `Total markers: **${markers.length}**\n\n`;

        for (const [type, typeMarkers] of Object.entries(grouped)) {
            content += `## ${this.getTypeIcon(type)} ${this.capitalizeType(type)} (${typeMarkers.length})\n\n`;
            
            for (const marker of typeMarkers) {
                const fileName = vscode.workspace.asRelativePath(marker.uri);
                const date = new Date(marker.timestamp).toLocaleDateString();
                content += `- **${fileName}** _(${date})_`;
                if (marker.notes) {
                    content += ` - ${marker.notes}`;
                }
                content += '\n';
            }
            content += '\n';
        }

        // Show in new document
        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }

    // Clear all markers with confirmation
    async clearAllMarkers(): Promise<void> {
        const markers = this.markersManager.getAllMarkers();
        
        if (markers.length === 0) {
            vscode.window.showInformationMessage('No markers to clear');
            return;
        }

        const confirmation = await vscode.window.showWarningMessage(
            `Are you sure you want to remove all ${markers.length} markers?`,
            { modal: true },
            'Yes, Clear All',
            'Cancel'
        );

        if (confirmation === 'Yes, Clear All') {
            await this.markersManager.clearAllMarkers();
            vscode.window.showInformationMessage('All markers cleared');
        }
    }

    // Export markers
    async exportMarkers(): Promise<void> {
        try {
            const exportData = await this.markersManager.exportMarkers();
            const saveUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('lookatni-markers-export.json'),
                filters: {
                    'JSON': ['json'],
                    'All Files': ['*']
                }
            });

            if (saveUri) {
                await vscode.workspace.fs.writeFile(saveUri, Buffer.from(exportData));
                vscode.window.showInformationMessage(`Markers exported to ${saveUri.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error}`);
        }
    }

    // Import markers
    async importMarkers(): Promise<void> {
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
                
                await this.markersManager.importMarkers(jsonData);
                vscode.window.showInformationMessage('Markers imported successfully');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Import failed: ${error}`);
        }
    }

    private getTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            'read': '✅',
            'unread': '🔵',
            'favorite': '⭐',
            'important': '❗',
            'todo': '📋',
            'custom': '🎨'
        };
        return icons[type] || '📌';
    }

    private capitalizeType(type: string): string {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
}
