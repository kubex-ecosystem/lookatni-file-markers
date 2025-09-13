import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { VisualMarkersManager } from '../utils/visualMarkers';

export class VisualMarkersCommand {
    public readonly commandId = 'lookatni.visualMarkers';
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger,
        private outputChannel: vscode.OutputChannel,
        private markersManager: VisualMarkersManager
    ) {}
    
    async execute(uri?: vscode.Uri): Promise<void> {
        this.logger.info('🎯 Starting visual markers management...');
        
        try {
            const targetUri = uri || await this.getActiveFileUri();
            if (!targetUri) {
                vscode.window.showErrorMessage('No file selected for marking');
                return;
            }

            const action = await this.showMarkersMenu(targetUri);
            if (action) {
                await this.executeAction(action, targetUri);
            }
            
        } catch (error) {
            this.logger.error('Error in visual markers command:', error);
            vscode.window.showErrorMessage(`Visual Markers Error: ${error}`);
        }
    }

    private async getActiveFileUri(): Promise<vscode.Uri | undefined> {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            return activeEditor.document.uri;
        }

        // Try to get from explorer context
        const selection = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: 'Select file to mark'
        });

        return selection?.[0];
    }

    private async showMarkersMenu(uri: vscode.Uri): Promise<string | undefined> {
        const currentMarker = this.markersManager.getMarker(uri);
        const fileName = vscode.workspace.asRelativePath(uri);
        
        const options = [
            {
                label: '$(check) Mark as Read',
                description: 'Mark file as read/reviewed',
                action: 'markRead'
            },
            {
                label: '$(circle-large-outline) Mark as Unread',
                description: 'Mark file as unread/needs review',
                action: 'markUnread'
            },
            {
                label: '$(star-full) Mark as Favorite',
                description: 'Add to favorites',
                action: 'markFavorite'
            },
            {
                label: '$(warning) Mark as Important',
                description: 'Mark as important/priority',
                action: 'markImportant'
            },
            {
                label: '$(checklist) Mark as Todo',
                description: 'Add to todo list',
                action: 'markTodo'
            },
            {
                label: '$(paintcan) Custom Marker',
                description: 'Create custom marker with notes',
                action: 'markCustom'
            },
            {
                label: '$(x) Remove Marker',
                description: 'Remove current marker',
                action: 'remove'
            },
            {
                label: '$(list-unordered) View All Markers',
                description: 'Show all marked files',
                action: 'viewAll'
            }
        ];

        if (currentMarker) {
            options.unshift({
                label: `$(info) Current: ${currentMarker.type}`,
                description: currentMarker.notes || 'Current marker on this file',
                action: 'info'
            });
        }

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: `Visual Markers - ${fileName}`,
            title: 'File Marking Options'
        });

        return selected?.action;
    }

    private async executeAction(action: string, uri: vscode.Uri): Promise<void> {
        switch (action) {
            case 'markRead':
                await this.markersManager.toggleMarker(uri, 'read');
                vscode.window.showInformationMessage('File marked as read');
                break;
                
            case 'markUnread':
                await this.markersManager.toggleMarker(uri, 'unread');
                vscode.window.showInformationMessage('File marked as unread');
                break;
                
            case 'markFavorite':
                await this.markersManager.toggleMarker(uri, 'favorite');
                vscode.window.showInformationMessage('File marked as favorite');
                break;
                
            case 'markImportant':
                await this.markersManager.toggleMarker(uri, 'important');
                vscode.window.showInformationMessage('File marked as important');
                break;
                
            case 'markTodo':
                await this.markersManager.toggleMarker(uri, 'todo');
                vscode.window.showInformationMessage('File marked as todo');
                break;
                
            case 'markCustom':
                await this.handleCustomMarker(uri);
                break;
                
            case 'remove':
                await this.markersManager.removeMarker(uri);
                vscode.window.showInformationMessage('Marker removed');
                break;
                
            case 'viewAll':
                await this.showAllMarkers();
                break;
                
            case 'info':
                await this.showMarkerInfo(uri);
                break;
        }
    }

    private async handleCustomMarker(uri: vscode.Uri): Promise<void> {
        const notes = await vscode.window.showInputBox({
            prompt: 'Enter notes for this custom marker (optional)',
            placeHolder: 'Custom marker notes...'
        });

        const colorOptions = [
            { label: '🔴 Red', value: 'charts.red' },
            { label: '🟢 Green', value: 'charts.green' },
            { label: '🔵 Blue', value: 'charts.blue' },
            { label: '🟡 Yellow', value: 'charts.yellow' },
            { label: '🟠 Orange', value: 'charts.orange' },
            { label: '🟣 Purple', value: 'charts.purple' }
        ];

        const selectedColor = await vscode.window.showQuickPick(colorOptions, {
            placeHolder: 'Choose marker color'
        });

        if (selectedColor) {
            await this.markersManager.addMarker(uri, 'custom', {
                color: selectedColor.value,
                notes: notes || undefined
            });
            vscode.window.showInformationMessage('Custom marker added');
        }
    }

    private async showAllMarkers(): Promise<void> {
        const markers = this.markersManager.getAllMarkers();
        
        if (markers.length === 0) {
            vscode.window.showInformationMessage('No markers found');
            return;
        }

        const items = markers.map(marker => ({
            label: `$(${this.getIconForType(marker.type)}) ${vscode.workspace.asRelativePath(marker.uri)}`,
            description: `${marker.type} - ${new Date(marker.timestamp).toLocaleDateString()}`,
            detail: marker.notes,
            uri: marker.uri
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `${markers.length} marked files found`,
            title: 'All Visual Markers'
        });

        if (selected) {
            const document = await vscode.workspace.openTextDocument(selected.uri);
            await vscode.window.showTextDocument(document);
        }
    }

    private async showMarkerInfo(uri: vscode.Uri): Promise<void> {
        const marker = this.markersManager.getMarker(uri);
        if (!marker) {
            vscode.window.showInformationMessage('No marker on this file');
            return;
        }

        const fileName = vscode.workspace.asRelativePath(uri);
        const createdDate = new Date(marker.timestamp).toLocaleString();
        
        let info = `**File:** ${fileName}\n`;
        info += `**Type:** ${marker.type}\n`;
        info += `**Created:** ${createdDate}\n`;
        
        if (marker.notes) {
            info += `**Notes:** ${marker.notes}\n`;
        }
        
        if (marker.color) {
            info += `**Color:** ${marker.color}\n`;
        }

        const action = await vscode.window.showInformationMessage(
            info,
            'Open File',
            'Remove Marker',
            'Close'
        );

        switch (action) {
            case 'Open File':
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(document);
                break;
            case 'Remove Marker':
                await this.markersManager.removeMarker(uri);
                vscode.window.showInformationMessage('Marker removed');
                break;
        }
    }

    private getIconForType(type: string): string {
        const icons: Record<string, string> = {
            'read': 'check',
            'unread': 'circle-large-outline',
            'favorite': 'star-full',
            'important': 'warning',
            'todo': 'checklist',
            'custom': 'paintcan'
        };
        return icons[type] || 'circle-large-filled';
    }
}
