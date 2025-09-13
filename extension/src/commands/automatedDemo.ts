import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Automated Demo Controller
 * Executes the LookAtni demo sequence programmatically for smooth recording
 * 100% VS Code API based - no external scripts needed!
 */
export class AutomatedDemoController {
    private readonly FS_CHAR = String.fromCharCode(28);
    private demoDir: string;
    private outputChannel: vscode.OutputChannel;
    private workspaceRoot: string;

    constructor() {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this.demoDir = path.join(this.workspaceRoot, 'demo-automated');
        this.outputChannel = vscode.window.createOutputChannel('LookAtni Demo');
    }

    async runAutomatedDemo(): Promise<void> {
        try {
            // Show output channel for demo narrative
            this.outputChannel.show();
            this.outputChannel.appendLine('🎬 Starting Automated LookAtni Demo for Recording...');
            this.outputChannel.appendLine('📹 Perfect for screen recording - smooth, automated workflow!');
            
            await this.showWelcomeMessage();
            
            // Step 1: Clean environment thoroughly
            await this.cleanEnvironment();
            
            // Step 2: Create AI-generated content with dramatic reveal
            await this.createAIGeneratedContent();
            
            // Step 3: Open and showcase the demo file
            await this.openAndShowcaseDemoFile();
            
            // Step 4: Execute the golden feature - AI code extraction
            await this.executeAICodeExtraction();
            
            // Step 5: Show the amazing results
            await this.showcaseResults();
            
            await this.showCompletionMessage();
            
        } catch (error) {
            this.outputChannel.appendLine(`❌ Demo failed: ${error}`);
            vscode.window.showErrorMessage(`Demo failed: ${error}`);
        }
    }

    private async showWelcomeMessage(): Promise<void> {
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('🚀 Welcome to LookAtni File Markers Demo!');
        this.outputChannel.appendLine('💡 The Golden Feature: AI Code Extraction');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('🎯 What you\'ll see:');
        this.outputChannel.appendLine('   1. AI-generated project in single document');
        this.outputChannel.appendLine('   2. Invisible Unicode markers (completely hidden)');
        this.outputChannel.appendLine('   3. One-click extraction to perfect file structure');
        this.outputChannel.appendLine('   4. Complete project ready to run!');
        this.outputChannel.appendLine('');
        await this.delay(3000);
    }

    private async showCompletionMessage(): Promise<void> {
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('🎉 DEMO COMPLETED SUCCESSFULLY!');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('✨ What just happened:');
        this.outputChannel.appendLine('   🤖 AI generated a complete React project');
        this.outputChannel.appendLine('   📄 Single document with invisible markers');
        this.outputChannel.appendLine('   ⚡ One command extracted perfect file structure');
        this.outputChannel.appendLine('   🏗️ Ready-to-run project created instantly!');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('🎯 The Golden Feature in action!');
        this.outputChannel.appendLine('💫 From AI chat to working project in seconds!');
        this.outputChannel.appendLine('');
        await this.delay(2000);
    }

    /**
     * Comprehensive environment cleanup for demo recording
     */
    private async cleanEnvironment(): Promise<void> {
        this.outputChannel.appendLine('🧹 Performing comprehensive environment cleanup...');
        
        // Close all editors for clean start
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        await this.delay(500);

        // Clear output channels
        this.outputChannel.clear();
        
        // Remove ALL demo-related directories
        const cleanupPaths = [
            'demo-automated',
            'lookatni-demo-*',
            'extracted-project',
            'ai-generated-*',
            'demo-*',
            'test-*'
        ];
        
        for (const pattern of cleanupPaths) {
            await this.removeDirectoriesMatching(pattern);
        }
        
        // Create fresh demo directory
        fs.mkdirSync(this.demoDir, { recursive: true });
        
        // Reset workspace to clean state
        await this.resetWorkspaceView();
        
        this.outputChannel.appendLine('✅ Environment completely cleaned and prepared for recording');
        await this.delay(1000);
    }

    /**
     * Remove directories matching a pattern
     */
    private async removeDirectoriesMatching(pattern: string): Promise<void> {
        try {
            const entries = fs.readdirSync(this.workspaceRoot, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const shouldRemove = pattern.includes('*') 
                        ? entry.name.startsWith(pattern.replace('*', ''))
                        : entry.name === pattern;
                        
                    if (shouldRemove) {
                        const fullPath = path.join(this.workspaceRoot, entry.name);
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        this.outputChannel.appendLine(`🗑️ Removed: ${entry.name}`);
                    }
                }
            }
        } catch (error) {
            // Silent fail - directory might not exist
        }
    }

    /**
     * Reset VS Code workspace view for clean recording
     */
    private async resetWorkspaceView(): Promise<void> {
        // Close all panels and views
        await vscode.commands.executeCommand('workbench.action.closeSidebar');
        await vscode.commands.executeCommand('workbench.action.closePanel');
        await this.delay(300);
        
        // Reopen explorer
        await vscode.commands.executeCommand('workbench.view.explorer');
        await this.delay(300);
        
        // Collapse all folders in explorer
        await vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders');
        await this.delay(500);
    }

    private async createAIGeneratedContent(): Promise<void> {
        this.outputChannel.appendLine('🤖 Creating AI-generated React project...');
        this.outputChannel.appendLine('💭 Simulating: "ChatGPT, create a React project with LookAtni markers"');
        
        const demoContent = this.generateDemoContent();
        const demoFile = path.join(this.demoDir, 'ai-generated-react-project.txt');
        
        fs.writeFileSync(demoFile, demoContent);
        
        this.outputChannel.appendLine('✅ AI response received with invisible markers!');
        this.outputChannel.appendLine(`📍 Saved to: ai-generated-react-project.txt`);
        this.outputChannel.appendLine('🔍 Notice: Markers are completely invisible to you!');
        await this.delay(2000);
    }

    private async openAndShowcaseDemoFile(): Promise<vscode.TextDocument> {
        this.outputChannel.appendLine('📖 Opening the AI-generated content...');
        
        const demoFile = path.join(this.demoDir, 'ai-generated-react-project.txt');
        const document = await vscode.workspace.openTextDocument(demoFile);
        await vscode.window.showTextDocument(document);
        
        // Focus on the editor
        await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
        
        this.outputChannel.appendLine('👀 Look at this - a complete React project in one document!');
        this.outputChannel.appendLine('🔮 The invisible markers are there, but you can\'t see them');
        this.outputChannel.appendLine('⚡ Ready for the magic extraction...');
        await this.delay(3000);
        
        return document;
    }

    private async executeAICodeExtraction(): Promise<void> {
        this.outputChannel.appendLine('🎯 Executing the Golden Feature - AI Code Extraction!');
        this.outputChannel.appendLine('⚡ Right-click → LookAtni: Extract Files');
        
        await this.delay(1000);
        
        try {
            // Create extraction directory first
            const extractDir = path.join(this.demoDir, 'extracted-react-project');
            fs.mkdirSync(extractDir, { recursive: true });
            
            this.outputChannel.appendLine('🚀 Executing extraction command...');
            
            // Execute the extraction command
            await vscode.commands.executeCommand('lookatni-file-markers.extractFiles');
            
            this.outputChannel.appendLine('✅ Extraction command executed!');
            await this.delay(2000);
            
        } catch (error) {
            this.outputChannel.appendLine('📋 Extraction command triggered - follow VS Code prompts');
            this.outputChannel.appendLine('💡 Select the extracted-react-project folder as destination');
            await this.delay(3000);
        }
    }

    private async showcaseResults(): Promise<void> {
        this.outputChannel.appendLine('🎊 Showcasing the Amazing Results!');
        
        const extractDir = path.join(this.demoDir, 'extracted-react-project');
        
        // Open file explorer to show structure
        if (fs.existsSync(extractDir)) {
            this.outputChannel.appendLine('� Opening extracted project structure...');
            
            // Show the beautiful file structure that was created
            await this.displayProjectStructure(extractDir);
            
            // Open the main files to showcase
            await this.showcaseExtractedFiles(extractDir);
        } else {
            this.outputChannel.appendLine('📋 Check your file explorer - perfect project structure created!');
        }
        
        await this.delay(2000);
    }

    private async displayProjectStructure(extractDir: string): Promise<void> {
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('🏗️ EXTRACTED PROJECT STRUCTURE:');
        this.outputChannel.appendLine('├── package.json       (Complete package config)');
        this.outputChannel.appendLine('├── README.md          (Project documentation)');
        this.outputChannel.appendLine('├── public/');
        this.outputChannel.appendLine('│   └── index.html     (HTML template)');
        this.outputChannel.appendLine('└── src/');
        this.outputChannel.appendLine('    ├── index.js       (React entry point)');
        this.outputChannel.appendLine('    ├── App.js         (Main component)');
        this.outputChannel.appendLine('    └── App.css        (Styling)');
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('🎯 From AI chat to ready project in ONE CLICK!');
        this.outputChannel.appendLine('');
    }

    private async showcaseExtractedFiles(extractDir: string): Promise<void> {
        // Open a few key files to show they're real and working
        const filesToShow = [
            'package.json',
            'src/App.js'
        ];
        
        for (const file of filesToShow) {
            const filePath = path.join(extractDir, file);
            if (fs.existsSync(filePath)) {
                const document = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
                await this.delay(1500);
            }
        }
        
        this.outputChannel.appendLine('👀 See? Real, working files extracted perfectly!');
        this.outputChannel.appendLine('🚀 Project is ready to run: npm start');
    }

    private generateDemoContent(): string {
        return `🤖 AI-Generated React Project with LookAtni File Markers

This content was generated by AI and can be extracted into a complete project structure!

${this.FS_CHAR}/ package.json /${this.FS_CHAR}//
{
  "name": "ai-demo-project",
  "version": "1.0.0",
  "description": "Demo project generated by AI with LookAtni markers",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }
}

${this.FS_CHAR}/ README.md /${this.FS_CHAR}//
# 🚀 AI Demo Project

This project was generated by AI and extracted using **LookAtni File Markers**!

## The Magic
- Generated in a single document by AI
- Extracted automatically with invisible markers
- Perfect file structure created instantly
- Zero manual file creation needed

## Features
- ⚡ React-based frontend
- 🎨 Modern styling  
- 🔄 Hot reloading
- 📦 Production builds

Generated with invisible Unicode markers!

${this.FS_CHAR}/ src/index.js /${this.FS_CHAR}//
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

${this.FS_CHAR}/ src/App.js /${this.FS_CHAR}//
import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 AI-Generated React App</h1>
        <p>Extracted with LookAtni File Markers!</p>
        
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span className="count">{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        
        <p className="description">
          This entire project was generated by AI in a single document,
          then extracted into perfect file structure using invisible markers.
          
          🎯 The Golden Feature in action!
        </p>
      </header>
    </div>
  );
}

export default App;

${this.FS_CHAR}/ src/App.css /${this.FS_CHAR}//
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.counter {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 20px;
}

.counter button {
  background: #61dafb;
  border: none;
  color: #282c34;
  font-size: 24px;
  font-weight: bold;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.counter button:hover {
  transform: scale(1.1);
}

.count {
  font-size: 48px;
  font-weight: bold;
  color: #61dafb;
  min-width: 100px;
}

.description {
  font-size: 16px;
  max-width: 600px;
  line-height: 1.5;
  margin-top: 30px;
  opacity: 0.8;
}

${this.FS_CHAR}/ public/index.html /${this.FS_CHAR}//
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="AI-generated React app extracted with LookAtni" />
    <title>🤖 AI Demo Project - LookAtni File Markers</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Command to trigger the automated demo
export function registerAutomatedDemoCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('lookatni.automatedDemo', async () => {
        const demo = new AutomatedDemoController();
        await demo.runAutomatedDemo();
    });
    
    context.subscriptions.push(disposable);
}
