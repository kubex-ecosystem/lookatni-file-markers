import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class LookAtniExplorerProvider implements vscode.TreeDataProvider<LookAtniItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<LookAtniItem | undefined | null | void> = new vscode.EventEmitter<LookAtniItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<LookAtniItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    constructor(private context: vscode.ExtensionContext) {}
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    
    getTreeItem(element: LookAtniItem): vscode.TreeItem {
        return element;
    }
    
    getChildren(element?: LookAtniItem): Thenable<LookAtniItem[]> {
        if (!element) {
            return Promise.resolve(this.getRootItems());
        } else {
            return Promise.resolve(this.getChildItems(element));
        }
    }
    
    private getRootItems(): LookAtniItem[] {
        const items: LookAtniItem[] = [];
        
        // Quick Actions section
        items.push(new LookAtniItem(
            'Quick Actions',
            vscode.TreeItemCollapsibleState.Expanded,
            'section'
        ));
        
        // Recent Files section
        items.push(new LookAtniItem(
            'Recent Marked Files',
            vscode.TreeItemCollapsibleState.Collapsed,
            'section'
        ));
        
        // Workspace Files section
        if (vscode.workspace.workspaceFolders) {
            items.push(new LookAtniItem(
                'Workspace Marked Files',
                vscode.TreeItemCollapsibleState.Collapsed,
                'section'
            ));
        }
        
        return items;
    }
    
    private getChildItems(element: LookAtniItem): LookAtniItem[] {
        switch (element.label) {
            case 'Quick Actions':
                return this.getQuickActions();
            case 'Recent Marked Files':
                return this.getRecentFiles();
            case 'Workspace Marked Files':
                return this.getWorkspaceFiles();
            default:
                return [];
        }
    }
    
    private getQuickActions(): LookAtniItem[] {
        return [
            new LookAtniItem(
                'Extract Files',
                vscode.TreeItemCollapsibleState.None,
                'action',
                'lookatni-file-markers.extractFiles',
                '$(file-zip) Extract files from marked content'
            ),
            new LookAtniItem(
                'Generate Markers',
                vscode.TreeItemCollapsibleState.None,
                'action',
                'lookatni-file-markers.generateMarkers',
                '$(file-code) Create marked file from project'
            ),
            new LookAtniItem(
                'Validate Markers',
                vscode.TreeItemCollapsibleState.None,
                'action',
                'lookatni-file-markers.validateMarkers',
                '$(check) Validate marked file structure'
            ),
            new LookAtniItem(
                'Quick Demo',
                vscode.TreeItemCollapsibleState.None,
                'action',
                'lookatni-file-markers.quickDemo',
                '$(play) Run interactive demonstration'
            ),
            new LookAtniItem(
                'Show Statistics',
                vscode.TreeItemCollapsibleState.None,
                'action',
                'lookatni-file-markers.showStatistics',
                '$(graph) View file statistics'
            ),
            new LookAtniItem(
                'Open CLI Tools',
                vscode.TreeItemCollapsibleState.None,
                'action',
                'lookatni-file-markers.openCLI',
                '$(terminal) Access command-line tools'
            )
        ];
    }
    
    private getRecentFiles(): LookAtniItem[] {
        const recentFiles = this.context.globalState.get<string[]>('recentMarkedFiles', []);
        
        if (recentFiles.length === 0) {
            return [new LookAtniItem(
                'No recent files',
                vscode.TreeItemCollapsibleState.None,
                'info',
                undefined,
                'Generate or open marked files to see them here'
            )];
        }
        
        return recentFiles
            .filter(file => fs.existsSync(file))
            .slice(0, 10) // Show last 10 files
            .map(file => {
                const stats = fs.statSync(file);
                const item = new LookAtniItem(
                    path.basename(file),
                    vscode.TreeItemCollapsibleState.None,
                    'file',
                    undefined,
                    `${file} - Modified: ${stats.mtime.toLocaleDateString()}`
                );
                
                item.resourceUri = vscode.Uri.file(file);
                item.contextValue = 'markedFile';
                
                // Add command to open file
                item.command = {
                    command: 'vscode.open',
                    title: 'Open File',
                    arguments: [vscode.Uri.file(file)]
                };
                
                return item;
            });
    }
    
    private getWorkspaceFiles(): LookAtniItem[] {
        if (!vscode.workspace.workspaceFolders) {
            return [];
        }
        
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const markedFiles = this.findMarkedFiles(workspaceRoot);
        
        if (markedFiles.length === 0) {
            return [new LookAtniItem(
                'No marked files found',
                vscode.TreeItemCollapsibleState.None,
                'info',
                undefined,
                'Generate marked files to see them here'
            )];
        }
        
        return markedFiles.map(file => {
            const relativePath = path.relative(workspaceRoot, file);
            const stats = fs.statSync(file);
            
            const item = new LookAtniItem(
                relativePath,
                vscode.TreeItemCollapsibleState.None,
                'file',
                undefined,
                `${file} - Size: ${this.formatBytes(stats.size)}`
            );
            
            item.resourceUri = vscode.Uri.file(file);
            item.contextValue = 'markedFile';
            
            // Add command to open file
            item.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [vscode.Uri.file(file)]
            };
            
            return item;
        });
    }
    
    private findMarkedFiles(dir: string): string[] {
        const markedFiles: string[] = [];
        
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // Skip common non-source directories
                if (entry.isDirectory() && !['node_modules', '.git', '.vscode', 'build', 'dist'].includes(entry.name)) {
                    markedFiles.push(...this.findMarkedFiles(fullPath));
                } else if (entry.isFile() && this.isMarkedFile(fullPath)) {
                    markedFiles.push(fullPath);
                }
            }
        } catch (error) {
            // Ignore permission errors
        }
        
        return markedFiles;
    }
    
    private isMarkedFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        if (!['.txt', '.md'].includes(ext)) {
            return false;
        }
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            // Check if file contains LookAtni markers
            return /\/\/m\/ .+ \/m\/\//.test(content);
        } catch {
            return false;
        }
    }
    
    private formatBytes(bytes: number): string {
        if (bytes === 0) {
            return '0 B';
        }
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    addRecentFile(filePath: string): void {
        const recentFiles = this.context.globalState.get<string[]>('recentMarkedFiles', []);
        
        // Remove if already exists
        const filtered = recentFiles.filter(f => f !== filePath);
        
        // Add to beginning
        filtered.unshift(filePath);
        
        // Keep only last 20 files
        const updated = filtered.slice(0, 20);
        
        this.context.globalState.update('recentMarkedFiles', updated);
        this.refresh();
    }
}

class LookAtniItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: 'section' | 'action' | 'file' | 'info',
        public readonly commandId?: string,
        public readonly description?: string
    ) {
        super(label, collapsibleState);
        
        this.tooltip = description || label;
        this.description = description;
        
        // Set icons based on type
        switch (itemType) {
            case 'section':
                this.iconPath = new vscode.ThemeIcon('folder');
                break;
            case 'action':
                this.iconPath = new vscode.ThemeIcon('play');
                if (commandId) {
                    this.command = {
                        command: commandId,
                        title: label
                    };
                }
                break;
            case 'file':
                this.iconPath = new vscode.ThemeIcon('file-text');
                break;
            case 'info':
                this.iconPath = new vscode.ThemeIcon('info');
                break;
        }
    }
}
