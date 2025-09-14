"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualMarkersManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const configManager_1 = require("./configManager");
class VisualMarkersManager {
    constructor(context) {
        this.context = context;
        this.markers = new Map();
        this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, 'visual-markers.json');
        this.configManager = configManager_1.ConfigurationManager.getInstance();
        this.decorationType = new FileMarkersDecoratorProvider(this, this.configManager);
        this.loadMarkers();
        vscode.window.registerFileDecorationProvider(this.decorationType);
    }
    async loadMarkers() {
        try {
            if (await this.fileExists(this.storageUri.fsPath)) {
                const data = await fs.promises.readFile(this.storageUri.fsPath, 'utf8');
                const markersData = JSON.parse(data);
                for (const [key, marker] of Object.entries(markersData)) {
                    this.markers.set(key, marker);
                }
            }
        }
        catch (error) {
            console.error('Error loading visual markers:', error);
        }
    }
    async saveMarkers() {
        try {
            await fs.promises.mkdir(path.dirname(this.storageUri.fsPath), { recursive: true });
            const markersData = Object.fromEntries(this.markers);
            await fs.promises.writeFile(this.storageUri.fsPath, JSON.stringify(markersData, null, 2));
        }
        catch (error) {
            console.error('Error saving visual markers:', error);
        }
    }
    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async addMarker(uri, type, options) {
        const key = uri.toString();
        const marker = {
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
    async removeMarker(uri) {
        const key = uri.toString();
        this.markers.delete(key);
        await this.saveMarkers();
        this.refreshDecorations();
    }
    async toggleMarker(uri, type) {
        const key = uri.toString();
        const existing = this.markers.get(key);
        if (existing && existing.type === type) {
            await this.removeMarker(uri);
        }
        else {
            await this.addMarker(uri, type);
        }
    }
    getMarker(uri) {
        return this.markers.get(uri.toString());
    }
    getAllMarkers() {
        return Array.from(this.markers.values());
    }
    getMarkersByType(type) {
        return Array.from(this.markers.values()).filter(marker => marker.type === type);
    }
    refreshDecorations() {
        vscode.window.onDidChangeActiveTextEditor(() => {
        });
    }
    async clearAllMarkers() {
        this.markers.clear();
        await this.saveMarkers();
        this.refreshDecorations();
    }
    async exportMarkers() {
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            markers: Object.fromEntries(this.markers)
        };
        return JSON.stringify(exportData, null, 2);
    }
    async importMarkers(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            if (importData.markers) {
                for (const [key, marker] of Object.entries(importData.markers)) {
                    this.markers.set(key, marker);
                }
                await this.saveMarkers();
                this.refreshDecorations();
            }
        }
        catch (error) {
            throw new Error(`Failed to import markers: ${error}`);
        }
    }
}
exports.VisualMarkersManager = VisualMarkersManager;
class FileMarkersDecoratorProvider {
    constructor(markersManager, configManager) {
        this.markersManager = markersManager;
        this.configManager = configManager;
        this._onDidChangeFileDecorations = new vscode.EventEmitter();
        this.onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
    }
    provideFileDecoration(uri) {
        const marker = this.markersManager.getMarker(uri);
        if (!marker) {
            return undefined;
        }
        const config = this.configManager.getVisualMarkersConfig();
        let badge;
        let color;
        let tooltip;
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
    refresh() {
        this._onDidChangeFileDecorations.fire(undefined);
    }
}
