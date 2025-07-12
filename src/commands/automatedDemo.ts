import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Automated Demo Controller
 * Executes the LookAtni demo sequence programmatically for smooth recording
 */
export class AutomatedDemoController {
    private readonly FS_CHAR = String.fromCharCode(28);
    private demoDir: string;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.demoDir = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'demo-automated');
        this.outputChannel = vscode.window.createOutputChannel('LookAtni Demo');
    }

    async runAutomatedDemo(): Promise<void> {
        try {
            this.outputChannel.show();
            this.outputChannel.appendLine('🎬 Starting Automated LookAtni Demo...');
            
            // Step 1: Clean environment
            await this.cleanEnvironment();
            
            // Step 2: Create AI-generated content
            await this.createAIGeneratedContent();
            
            // Step 3: Open the demo file
            await this.openDemoFile();
            
            // Step 4: Simulate user workflow
            await this.simulateExtractionWorkflow();
            
            this.outputChannel.appendLine('✅ Automated demo completed successfully!');
            
        } catch (error) {
            this.outputChannel.appendLine(`❌ Demo failed: ${error}`);
            vscode.window.showErrorMessage(`Demo failed: ${error}`);
        }
    }

    private async cleanEnvironment(): Promise<void> {
        this.outputChannel.appendLine('🧹 Cleaning previous demo files...');
        
        // Remove previous demo directories
        const oldDemoDirs = ['demo-automated', 'lookatni-demo-*', 'extracted-project'];
        
        for (const dir of oldDemoDirs) {
            const fullPath = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', dir);
            if (fs.existsSync(fullPath)) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        }
        
        // Create fresh demo directory
        fs.mkdirSync(this.demoDir, { recursive: true });
        
        this.outputChannel.appendLine('✅ Environment cleaned and prepared');
        await this.delay(1000);
    }

    private async createAIGeneratedContent(): Promise<void> {
        this.outputChannel.appendLine('🤖 Creating AI-generated project with invisible markers...');
        
        const demoContent = this.generateDemoContent();
        const demoFile = path.join(this.demoDir, 'ai-generated-project.txt');
        
        fs.writeFileSync(demoFile, demoContent);
        
        this.outputChannel.appendLine('✅ AI-generated content created with invisible markers');
        this.outputChannel.appendLine(`📍 Location: ${demoFile}`);
        await this.delay(1500);
    }

    private async openDemoFile(): Promise<vscode.TextDocument> {
        this.outputChannel.appendLine('📖 Opening demo file...');
        
        const demoFile = path.join(this.demoDir, 'ai-generated-project.txt');
        const document = await vscode.workspace.openTextDocument(demoFile);
        await vscode.window.showTextDocument(document);
        
        this.outputChannel.appendLine('✅ Demo file opened in editor');
        await this.delay(2000);
        
        return document;
    }

    private async simulateExtractionWorkflow(): Promise<void> {
        this.outputChannel.appendLine('🔄 Starting extraction workflow...');
        
        // Create extraction directory
        const extractDir = path.join(this.demoDir, 'extracted-project');
        fs.mkdirSync(extractDir, { recursive: true });
        
        // Execute the extraction command programmatically
        this.outputChannel.appendLine('⚡ Executing LookAtni: Extract Files command...');
        
        try {
            // Simulate the extraction process
            await vscode.commands.executeCommand('lookatni-file-markers.extractFiles');
            
            this.outputChannel.appendLine('✅ Extraction completed successfully!');
            this.outputChannel.appendLine(`📁 Files extracted to: ${extractDir}`);
            
            // Show the extracted files
            await this.showExtractedFiles(extractDir);
            
        } catch (error) {
            this.outputChannel.appendLine(`⚠️ Manual extraction required: ${error}`);
            vscode.window.showInformationMessage(
                'Demo ready! Right-click the file and select "LookAtni: Extract Files"',
                'Open Extraction Location'
            ).then(selection => {
                if (selection === 'Open Extraction Location') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(extractDir));
                }
            });
        }
    }

    private async showExtractedFiles(extractDir: string): Promise<void> {
        this.outputChannel.appendLine('📂 Showing extracted project structure...');
        
        // Open the extracted directory in explorer
        if (fs.existsSync(extractDir)) {
            await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(extractDir), true);
            this.outputChannel.appendLine('✅ Extracted project opened in new window');
        }
        
        await this.delay(2000);
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
