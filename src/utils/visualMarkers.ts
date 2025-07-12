import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationManager } from './configManager';

export interface VisualMarker {
    uri: vscode.Uri;
    type: 'read' | 'unread' | 'important' | 'favorite' | 'todo' | 'custom';
    color?: string;
    icon?: string;
    timestamp: number;
    notes?: string;
}

export class VisualMarkersManager {
    private markers: Map<string, VisualMarker> = new Map();
    private decorationType: vscode.FileDecorationProvider;
    private storageUri: vscode.Uri;
    private configManager: ConfigurationManager;

    constructor(private context: vscode.ExtensionContext) {
        this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, 'visual-markers.json');
        this.configManager = ConfigurationManager.getInstance();
        this.decorationType = new FileMarkersDecoratorProvider(this, this.configManager);
        this.loadMarkers();
        
        // Register as decoration provider
        vscode.window.registerFileDecorationProvider(this.decorationType);
    }

    async loadMarkers(): Promise<void> {
        try {
            if (await this.fileExists(this.storageUri.fsPath)) {
                const data = await fs.promises.readFile(this.storageUri.fsPath, 'utf8');
                const markersData = JSON.parse(data);
                
                for (const [key, marker] of Object.entries(markersData)) {
                    this.markers.set(key, marker as VisualMarker);
                }
            }
        } catch (error) {
            console.error('Error loading visual markers:', error);
        }
    }

    async saveMarkers(): Promise<void> {
        try {
            await fs.promises.mkdir(path.dirname(this.storageUri.fsPath), { recursive: true });
            const markersData = Object.fromEntries(this.markers);
            await fs.promises.writeFile(this.storageUri.fsPath, JSON.stringify(markersData, null, 2));
        } catch (error) {
            console.error('Error saving visual markers:', error);
        }
    }

    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async addMarker(uri: vscode.Uri, type: VisualMarker['type'], options?: { color?: string; icon?: string; notes?: string }): Promise<void> {
        const key = uri.toString();
        const marker: VisualMarker = {
            uri,
            type,
            timestamp: Date.now(),
            color: options?.color,
            icon: options?.icon,
            notes: options?.notes
        };

        this.markers.set(key, marker);
        await this.saveMarkers();
        this.refreshDecorations();
    }

    async removeMarker(uri: vscode.Uri): Promise<void> {
        const key = uri.toString();
        this.markers.delete(key);
        await this.saveMarkers();
        this.refreshDecorations();
    }

    async toggleMarker(uri: vscode.Uri, type: VisualMarker['type']): Promise<void> {
        const key = uri.toString();
        const existing = this.markers.get(key);

        if (existing && existing.type === type) {
            await this.removeMarker(uri);
        } else {
            await this.addMarker(uri, type);
        }
    }

    getMarker(uri: vscode.Uri): VisualMarker | undefined {
        return this.markers.get(uri.toString());
    }

    getAllMarkers(): VisualMarker[] {
        return Array.from(this.markers.values());
    }

    getMarkersByType(type: VisualMarker['type']): VisualMarker[] {
        return Array.from(this.markers.values()).filter(marker => marker.type === type);
    }

    private refreshDecorations(): void {
        // Trigger decoration refresh
        vscode.window.onDidChangeActiveTextEditor(() => {
            // This will cause the decoration provider to refresh
        });
    }

    async clearAllMarkers(): Promise<void> {
        this.markers.clear();
        await this.saveMarkers();
        this.refreshDecorations();
    }

    async exportMarkers(): Promise<string> {
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            markers: Object.fromEntries(this.markers)
        };
        return JSON.stringify(exportData, null, 2);
    }

    async importMarkers(jsonData: string): Promise<void> {
        try {
            const importData = JSON.parse(jsonData);
            if (importData.markers) {
                for (const [key, marker] of Object.entries(importData.markers)) {
                    this.markers.set(key, marker as VisualMarker);
                }
                await this.saveMarkers();
                this.refreshDecorations();
            }
        } catch (error) {
            throw new Error(`Failed to import markers: ${error}`);
        }
    }
}

class FileMarkersDecoratorProvider implements vscode.FileDecorationProvider {
    private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

    constructor(
        private markersManager: VisualMarkersManager,
        private configManager: ConfigurationManager
    ) {}

    provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
        const marker = this.markersManager.getMarker(uri);
        if (!marker) {
            return undefined;
        }

        const config = this.configManager.getVisualMarkersConfig();
        
        let badge: string;
        let color: vscode.ThemeColor;
        let tooltip: string;

        switch (marker.type) {
            case 'read':
                badge = config.readIcon;
                color = new vscode.ThemeColor('charts.green');
                tooltip = 'Marked as read';
                break;
            case 'unread':
                badge = config.unreadIcon;
                color = new vscode.ThemeColor('charts.blue');
                tooltip = 'Marked as unread';
                break;
            case 'important':
                badge = config.importantIcon;
                color = new vscode.ThemeColor('charts.red');
                tooltip = 'Marked as important';
                break;
            case 'favorite':
                badge = config.favoriteIcon;
                color = new vscode.ThemeColor('charts.yellow');
                tooltip = 'Marked as favorite';
                break;
            case 'todo':
                badge = config.todoIcon;
                color = new vscode.ThemeColor('charts.orange');
                tooltip = 'Marked as todo';
                break;
            case 'custom':
                badge = marker.icon || config.customIcon;
                color = marker.color ? new vscode.ThemeColor(marker.color) : new vscode.ThemeColor('charts.purple');
                tooltip = marker.notes || 'Custom marker';
                break;
            default:
                return undefined;
        }

        if (marker.notes) {
            tooltip += ` - ${marker.notes}`;
        }

        return {
            badge,
            color,
            tooltip,
            propagate: false
        };
    }

    refresh(): void {
        this._onDidChangeFileDecorations.fire(undefined);
    }
}
