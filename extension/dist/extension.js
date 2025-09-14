"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode17 = __toESM(require("vscode"));

// src/commands/automatedDemo.ts
var vscode = __toESM(require("vscode"));
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var AutomatedDemoController = class {
  FS_CHAR = String.fromCharCode(28);
  demoDir;
  outputChannel;
  workspaceRoot;
  constructor() {
    this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
    this.demoDir = path.join(this.workspaceRoot, "demo-automated");
    this.outputChannel = vscode.window.createOutputChannel("LookAtni Demo");
  }
  async runAutomatedDemo() {
    try {
      this.outputChannel.show();
      this.outputChannel.appendLine("\u{1F3AC} Starting Automated LookAtni Demo for Recording...");
      this.outputChannel.appendLine("\u{1F4F9} Perfect for screen recording - smooth, automated workflow!");
      await this.showWelcomeMessage();
      await this.cleanEnvironment();
      await this.createAIGeneratedContent();
      await this.openAndShowcaseDemoFile();
      await this.executeAICodeExtraction();
      await this.showcaseResults();
      await this.showCompletionMessage();
    } catch (error) {
      this.outputChannel.appendLine(`\u274C Demo failed: ${error}`);
      vscode.window.showErrorMessage(`Demo failed: ${error}`);
    }
  }
  async showWelcomeMessage() {
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F680} Welcome to LookAtni File Markers Demo!");
    this.outputChannel.appendLine("\u{1F4A1} The Golden Feature: AI Code Extraction");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F3AF} What you'll see:");
    this.outputChannel.appendLine("   1. AI-generated project in single document");
    this.outputChannel.appendLine("   2. Invisible Unicode markers (completely hidden)");
    this.outputChannel.appendLine("   3. One-click extraction to perfect file structure");
    this.outputChannel.appendLine("   4. Complete project ready to run!");
    this.outputChannel.appendLine("");
    await this.delay(3e3);
  }
  async showCompletionMessage() {
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F389} DEMO COMPLETED SUCCESSFULLY!");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u2728 What just happened:");
    this.outputChannel.appendLine("   \u{1F916} AI generated a complete React project");
    this.outputChannel.appendLine("   \u{1F4C4} Single document with invisible markers");
    this.outputChannel.appendLine("   \u26A1 One command extracted perfect file structure");
    this.outputChannel.appendLine("   \u{1F3D7}\uFE0F Ready-to-run project created instantly!");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F3AF} The Golden Feature in action!");
    this.outputChannel.appendLine("\u{1F4AB} From AI chat to working project in seconds!");
    this.outputChannel.appendLine("");
    await this.delay(2e3);
  }
  /**
   * Comprehensive environment cleanup for demo recording
   */
  async cleanEnvironment() {
    this.outputChannel.appendLine("\u{1F9F9} Performing comprehensive environment cleanup...");
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    await this.delay(500);
    this.outputChannel.clear();
    const cleanupPaths = [
      "demo-automated",
      "lookatni-demo-*",
      "extracted-project",
      "ai-generated-*",
      "demo-*",
      "test-*"
    ];
    for (const pattern of cleanupPaths) {
      await this.removeDirectoriesMatching(pattern);
    }
    fs.mkdirSync(this.demoDir, { recursive: true });
    await this.resetWorkspaceView();
    this.outputChannel.appendLine("\u2705 Environment completely cleaned and prepared for recording");
    await this.delay(1e3);
  }
  /**
   * Remove directories matching a pattern
   */
  async removeDirectoriesMatching(pattern) {
    try {
      const entries = fs.readdirSync(this.workspaceRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const shouldRemove = pattern.includes("*") ? entry.name.startsWith(pattern.replace("*", "")) : entry.name === pattern;
          if (shouldRemove) {
            const fullPath = path.join(this.workspaceRoot, entry.name);
            fs.rmSync(fullPath, { recursive: true, force: true });
            this.outputChannel.appendLine(`\u{1F5D1}\uFE0F Removed: ${entry.name}`);
          }
        }
      }
    } catch (error) {
    }
  }
  /**
   * Reset VS Code workspace view for clean recording
   */
  async resetWorkspaceView() {
    await vscode.commands.executeCommand("workbench.action.closeSidebar");
    await vscode.commands.executeCommand("workbench.action.closePanel");
    await this.delay(300);
    await vscode.commands.executeCommand("workbench.view.explorer");
    await this.delay(300);
    await vscode.commands.executeCommand("workbench.files.action.collapseExplorerFolders");
    await this.delay(500);
  }
  async createAIGeneratedContent() {
    this.outputChannel.appendLine("\u{1F916} Creating AI-generated React project...");
    this.outputChannel.appendLine('\u{1F4AD} Simulating: "ChatGPT, create a React project with LookAtni markers"');
    const demoContent = this.generateDemoContent();
    const demoFile = path.join(this.demoDir, "ai-generated-react-project.txt");
    fs.writeFileSync(demoFile, demoContent);
    this.outputChannel.appendLine("\u2705 AI response received with invisible markers!");
    this.outputChannel.appendLine(`\u{1F4CD} Saved to: ai-generated-react-project.txt`);
    this.outputChannel.appendLine("\u{1F50D} Notice: Markers are completely invisible to you!");
    await this.delay(2e3);
  }
  async openAndShowcaseDemoFile() {
    this.outputChannel.appendLine("\u{1F4D6} Opening the AI-generated content...");
    const demoFile = path.join(this.demoDir, "ai-generated-react-project.txt");
    const document = await vscode.workspace.openTextDocument(demoFile);
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
    this.outputChannel.appendLine("\u{1F440} Look at this - a complete React project in one document!");
    this.outputChannel.appendLine("\u{1F52E} The invisible markers are there, but you can't see them");
    this.outputChannel.appendLine("\u26A1 Ready for the magic extraction...");
    await this.delay(3e3);
    return document;
  }
  async executeAICodeExtraction() {
    this.outputChannel.appendLine("\u{1F3AF} Executing the Golden Feature - AI Code Extraction!");
    this.outputChannel.appendLine("\u26A1 Right-click \u2192 LookAtni: Extract Files");
    await this.delay(1e3);
    try {
      const extractDir = path.join(this.demoDir, "extracted-react-project");
      fs.mkdirSync(extractDir, { recursive: true });
      this.outputChannel.appendLine("\u{1F680} Executing extraction command...");
      await vscode.commands.executeCommand("lookatni-file-markers.extractFiles");
      this.outputChannel.appendLine("\u2705 Extraction command executed!");
      await this.delay(2e3);
    } catch (error) {
      this.outputChannel.appendLine("\u{1F4CB} Extraction command triggered - follow VS Code prompts");
      this.outputChannel.appendLine("\u{1F4A1} Select the extracted-react-project folder as destination");
      await this.delay(3e3);
    }
  }
  async showcaseResults() {
    this.outputChannel.appendLine("\u{1F38A} Showcasing the Amazing Results!");
    const extractDir = path.join(this.demoDir, "extracted-react-project");
    if (fs.existsSync(extractDir)) {
      this.outputChannel.appendLine("\uFFFD Opening extracted project structure...");
      await this.displayProjectStructure(extractDir);
      await this.showcaseExtractedFiles(extractDir);
    } else {
      this.outputChannel.appendLine("\u{1F4CB} Check your file explorer - perfect project structure created!");
    }
    await this.delay(2e3);
  }
  async displayProjectStructure(extractDir) {
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F3D7}\uFE0F EXTRACTED PROJECT STRUCTURE:");
    this.outputChannel.appendLine("\u251C\u2500\u2500 package.json       (Complete package config)");
    this.outputChannel.appendLine("\u251C\u2500\u2500 README.md          (Project documentation)");
    this.outputChannel.appendLine("\u251C\u2500\u2500 public/");
    this.outputChannel.appendLine("\u2502   \u2514\u2500\u2500 index.html     (HTML template)");
    this.outputChannel.appendLine("\u2514\u2500\u2500 src/");
    this.outputChannel.appendLine("    \u251C\u2500\u2500 index.js       (React entry point)");
    this.outputChannel.appendLine("    \u251C\u2500\u2500 App.js         (Main component)");
    this.outputChannel.appendLine("    \u2514\u2500\u2500 App.css        (Styling)");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F3AF} From AI chat to ready project in ONE CLICK!");
    this.outputChannel.appendLine("");
  }
  async showcaseExtractedFiles(extractDir) {
    const filesToShow = [
      "package.json",
      "src/App.js"
    ];
    for (const file of filesToShow) {
      const filePath = path.join(extractDir, file);
      if (fs.existsSync(filePath)) {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
        await this.delay(1500);
      }
    }
    this.outputChannel.appendLine("\u{1F440} See? Real, working files extracted perfectly!");
    this.outputChannel.appendLine("\u{1F680} Project is ready to run: npm start");
  }
  generateDemoContent() {
    return `\u{1F916} AI-Generated React Project with LookAtni File Markers

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
# \u{1F680} AI Demo Project

This project was generated by AI and extracted using **LookAtni File Markers**!

## The Magic
- Generated in a single document by AI
- Extracted automatically with invisible markers
- Perfect file structure created instantly
- Zero manual file creation needed

## Features
- \u26A1 React-based frontend
- \u{1F3A8} Modern styling  
- \u{1F504} Hot reloading
- \u{1F4E6} Production builds

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
        <h1>\u{1F916} AI-Generated React App</h1>
        <p>Extracted with LookAtni File Markers!</p>
        
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span className="count">{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        
        <p className="description">
          This entire project was generated by AI in a single document,
          then extracted into perfect file structure using invisible markers.
          
          \u{1F3AF} The Golden Feature in action!
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
    <title>\u{1F916} AI Demo Project - LookAtni File Markers</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
function registerAutomatedDemoCommand(context) {
  const disposable = vscode.commands.registerCommand("lookatni.automatedDemo", async () => {
    const demo = new AutomatedDemoController();
    await demo.runAutomatedDemo();
  });
  context.subscriptions.push(disposable);
}

// src/commands/configurationCommand.ts
var vscode3 = __toESM(require("vscode"));

// src/utils/configManager.ts
var vscode2 = __toESM(require("vscode"));
var ConfigurationManager = class _ConfigurationManager {
  static DEFAULT_CONFIG = {
    visualMarkers: {
      readIcon: "\u2713",
      unreadIcon: "\u25CF",
      favoriteIcon: "\u2605",
      importantIcon: "!",
      todoIcon: "\u25CB",
      customIcon: "\u25C6",
      autoSave: true,
      showInStatusBar: true
    },
    defaultMaxFileSize: 1e3,
    showStatistics: true,
    autoValidate: false
  };
  static instance;
  config;
  constructor() {
    this.config = this.loadConfiguration();
    this.setupConfigurationWatcher();
  }
  static getInstance() {
    if (!_ConfigurationManager.instance) {
      _ConfigurationManager.instance = new _ConfigurationManager();
    }
    return _ConfigurationManager.instance;
  }
  loadConfiguration() {
    try {
      const vscodeConfig = vscode2.workspace.getConfiguration("lookatni");
      return {
        visualMarkers: {
          readIcon: this.getSafeConfig(vscodeConfig, "visualMarkers.readIcon", "\u2713"),
          unreadIcon: this.getSafeConfig(vscodeConfig, "visualMarkers.unreadIcon", "\u25CF"),
          favoriteIcon: this.getSafeConfig(vscodeConfig, "visualMarkers.favoriteIcon", "\u2605"),
          importantIcon: this.getSafeConfig(vscodeConfig, "visualMarkers.importantIcon", "!"),
          todoIcon: this.getSafeConfig(vscodeConfig, "visualMarkers.todoIcon", "\u25CB"),
          customIcon: this.getSafeConfig(vscodeConfig, "visualMarkers.customIcon", "\u25C6"),
          autoSave: this.getSafeConfig(vscodeConfig, "visualMarkers.autoSave", true),
          showInStatusBar: this.getSafeConfig(vscodeConfig, "visualMarkers.showInStatusBar", true)
        },
        defaultMaxFileSize: this.getSafeConfig(vscodeConfig, "defaultMaxFileSize", 1e3),
        showStatistics: this.getSafeConfig(vscodeConfig, "showStatistics", true),
        autoValidate: this.getSafeConfig(vscodeConfig, "autoValidate", false)
      };
    } catch (error) {
      console.warn("Failed to load LookAtni configuration, using defaults:", error);
      return { ..._ConfigurationManager.DEFAULT_CONFIG };
    }
  }
  getSafeConfig(config, key, defaultValue) {
    try {
      const value = config.get(key);
      if (value !== void 0 && value !== null) {
        if (typeof defaultValue === "string" && typeof value === "string") {
          const trimmedValue = value.trim();
          return trimmedValue || defaultValue;
        }
        return value;
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Failed to get config for ${key}, using default:`, error);
      return defaultValue;
    }
  }
  setupConfigurationWatcher() {
    vscode2.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("lookatni")) {
        this.config = this.loadConfiguration();
        this.notifyConfigurationChange();
      }
    });
  }
  notifyConfigurationChange() {
    vscode2.commands.executeCommand("lookatni.internal.configChanged");
  }
  getConfig() {
    return { ...this.config };
  }
  getVisualMarkersConfig() {
    return { ...this.config.visualMarkers };
  }
  getIconForMarkerType(type) {
    const config = this.config.visualMarkers;
    const iconMap = {
      "read": config.readIcon,
      "unread": config.unreadIcon,
      "favorite": config.favoriteIcon,
      "important": config.importantIcon,
      "todo": config.todoIcon,
      "custom": config.customIcon
    };
    return iconMap[type] || config.customIcon;
  }
  async validateConfiguration() {
    const issues = [];
    const config = this.config;
    Object.entries(config.visualMarkers).forEach(([key, value]) => {
      if (key.endsWith("Icon") && typeof value === "string" && !value.trim()) {
        issues.push(`Visual marker icon for ${key} is empty`);
      }
    });
    if (config.defaultMaxFileSize <= 0) {
      issues.push("Default max file size must be greater than 0");
    }
    const iconRegex = /^[\p{L}\p{N}\p{P}\p{S}\p{M}]+$/u;
    Object.entries(config.visualMarkers).forEach(([key, value]) => {
      if (key.endsWith("Icon") && typeof value === "string" && value && !iconRegex.test(value)) {
        issues.push(`Invalid characters in ${key}: ${value}`);
      }
    });
    return {
      isValid: issues.length === 0,
      issues
    };
  }
  async resetToDefaults() {
    const config = vscode2.workspace.getConfiguration("lookatni");
    try {
      for (const [section, values] of Object.entries(_ConfigurationManager.DEFAULT_CONFIG)) {
        if (typeof values === "object" && values !== null) {
          for (const [key, defaultValue] of Object.entries(values)) {
            await config.update(`${section}.${key}`, defaultValue, vscode2.ConfigurationTarget.Global);
          }
        } else {
          await config.update(section, values, vscode2.ConfigurationTarget.Global);
        }
      }
      vscode2.window.showInformationMessage("LookAtni configuration reset to defaults");
    } catch (error) {
      vscode2.window.showErrorMessage(`Failed to reset configuration: ${error}`);
    }
  }
  async exportConfiguration() {
    return JSON.stringify({
      version: "1.0.0",
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
      configuration: this.config
    }, null, 2);
  }
  async importConfiguration(configJson) {
    try {
      const importData = JSON.parse(configJson);
      const config = vscode2.workspace.getConfiguration("lookatni");
      if (importData.configuration) {
        for (const [section, values] of Object.entries(importData.configuration)) {
          if (typeof values === "object" && values !== null) {
            for (const [key, value] of Object.entries(values)) {
              await config.update(`${section}.${key}`, value, vscode2.ConfigurationTarget.Global);
            }
          } else {
            await config.update(section, values, vscode2.ConfigurationTarget.Global);
          }
        }
      }
      vscode2.window.showInformationMessage("Configuration imported successfully");
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error}`);
    }
  }
};

// src/commands/configurationCommand.ts
var ConfigurationCommand = class {
  constructor(context, logger, outputChannel) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
  }
  commandId = "lookatni.configuration";
  async execute() {
    this.logger.info("\u{1F527} Starting configuration management...");
    try {
      const action = await this.showConfigurationMenu();
      if (action) {
        await this.executeAction(action);
      }
    } catch (error) {
      this.logger.error("Error in configuration command:", error);
      vscode3.window.showErrorMessage(`Configuration Error: ${error}`);
    }
  }
  async showConfigurationMenu() {
    const options = [
      {
        label: "$(gear) Validate Configuration",
        description: "Check current configuration for issues",
        action: "validate"
      },
      {
        label: "$(refresh) Reset to Defaults",
        description: "Reset all LookAtni settings to default values",
        action: "reset"
      },
      {
        label: "$(export) Export Configuration",
        description: "Export current configuration to file",
        action: "export"
      },
      {
        label: "$(import) Import Configuration",
        description: "Import configuration from file",
        action: "import"
      },
      {
        label: "$(eye) Show Current Settings",
        description: "Display current configuration values",
        action: "show"
      },
      {
        label: "$(settings-gear) Open Settings",
        description: "Open VS Code settings for LookAtni",
        action: "openSettings"
      }
    ];
    const selected = await vscode3.window.showQuickPick(options, {
      placeHolder: "LookAtni Configuration Management",
      title: "Configuration Options"
    });
    return selected?.action;
  }
  async executeAction(action) {
    const configManager = ConfigurationManager.getInstance();
    switch (action) {
      case "validate":
        await this.validateConfiguration(configManager);
        break;
      case "reset":
        await this.resetConfiguration(configManager);
        break;
      case "export":
        await this.exportConfiguration(configManager);
        break;
      case "import":
        await this.importConfiguration(configManager);
        break;
      case "show":
        await this.showCurrentConfiguration(configManager);
        break;
      case "openSettings":
        await vscode3.commands.executeCommand("workbench.action.openSettings", "lookatni");
        break;
    }
  }
  async validateConfiguration(configManager) {
    const validation = await configManager.validateConfiguration();
    this.outputChannel.appendLine("\n=== CONFIGURATION VALIDATION ===");
    if (validation.isValid) {
      this.outputChannel.appendLine("\u2705 Configuration is valid");
      vscode3.window.showInformationMessage("\u2705 LookAtni configuration is valid");
    } else {
      this.outputChannel.appendLine("\u274C Configuration has issues:");
      validation.issues.forEach((issue) => {
        this.outputChannel.appendLine(`  \u2022 ${issue}`);
      });
      const action = await vscode3.window.showWarningMessage(
        `Configuration has ${validation.issues.length} issue(s). View details?`,
        "View Details",
        "Reset to Defaults",
        "Ignore"
      );
      if (action === "View Details") {
        this.outputChannel.show();
      } else if (action === "Reset to Defaults") {
        await this.resetConfiguration(configManager);
      }
    }
  }
  async resetConfiguration(configManager) {
    const confirmation = await vscode3.window.showWarningMessage(
      "Are you sure you want to reset all LookAtni settings to defaults?",
      { modal: true },
      "Yes, Reset All",
      "Cancel"
    );
    if (confirmation === "Yes, Reset All") {
      await configManager.resetToDefaults();
      this.outputChannel.appendLine("\n=== CONFIGURATION RESET ===");
      this.outputChannel.appendLine("\u2705 Configuration reset to defaults");
    }
  }
  async exportConfiguration(configManager) {
    try {
      const configJson = await configManager.exportConfiguration();
      const saveUri = await vscode3.window.showSaveDialog({
        defaultUri: vscode3.Uri.file("lookatni-config-export.json"),
        filters: {
          "JSON": ["json"],
          "All Files": ["*"]
        }
      });
      if (saveUri) {
        await vscode3.workspace.fs.writeFile(saveUri, Buffer.from(configJson));
        vscode3.window.showInformationMessage(`Configuration exported to ${saveUri.fsPath}`);
        this.outputChannel.appendLine(`\u2705 Configuration exported to: ${saveUri.fsPath}`);
      }
    } catch (error) {
      vscode3.window.showErrorMessage(`Export failed: ${error}`);
    }
  }
  async importConfiguration(configManager) {
    try {
      const openUri = await vscode3.window.showOpenDialog({
        filters: {
          "JSON": ["json"],
          "All Files": ["*"]
        },
        canSelectMany: false
      });
      if (openUri && openUri[0]) {
        const fileData = await vscode3.workspace.fs.readFile(openUri[0]);
        const jsonData = Buffer.from(fileData).toString();
        await configManager.importConfiguration(jsonData);
        this.outputChannel.appendLine(`\u2705 Configuration imported from: ${openUri[0].fsPath}`);
      }
    } catch (error) {
      vscode3.window.showErrorMessage(`Import failed: ${error}`);
    }
  }
  async showCurrentConfiguration(configManager) {
    const config = configManager.getConfig();
    let content = "# LookAtni Configuration\n\n";
    content += `**Generated:** ${(/* @__PURE__ */ new Date()).toLocaleString()}

`;
    content += "## Visual Markers\n\n";
    content += `- **Read Icon:** ${config.visualMarkers.readIcon}
`;
    content += `- **Unread Icon:** ${config.visualMarkers.unreadIcon}
`;
    content += `- **Favorite Icon:** ${config.visualMarkers.favoriteIcon}
`;
    content += `- **Important Icon:** ${config.visualMarkers.importantIcon}
`;
    content += `- **Todo Icon:** ${config.visualMarkers.todoIcon}
`;
    content += `- **Custom Icon:** ${config.visualMarkers.customIcon}
`;
    content += `- **Auto Save:** ${config.visualMarkers.autoSave}
`;
    content += `- **Show in Status Bar:** ${config.visualMarkers.showInStatusBar}

`;
    content += "## File Processing\n\n";
    content += `- **Default Max File Size:** ${config.defaultMaxFileSize} KB
`;
    content += `- **Show Statistics:** ${config.showStatistics}
`;
    content += `- **Auto Validate:** ${config.autoValidate}

`;
    content += "## Configuration Commands\n\n";
    content += "Use `LookAtni: Configuration` to manage these settings.\n";
    const doc = await vscode3.workspace.openTextDocument({
      content,
      language: "markdown"
    });
    await vscode3.window.showTextDocument(doc);
  }
  async validateConfigurationOnStartup() {
    const configManager = ConfigurationManager.getInstance();
    const validation = await configManager.validateConfiguration();
    if (!validation.isValid) {
      this.logger.warn("Configuration validation failed on startup");
      validation.issues.forEach((issue) => {
        this.logger.warn(`Config issue: ${issue}`);
      });
      const action = await vscode3.window.showWarningMessage(
        "LookAtni configuration has issues. Would you like to fix them?",
        "Fix Now",
        "Later"
      );
      if (action === "Fix Now") {
        await this.execute();
      }
    }
  }
};

// src/commands/extractFiles.ts
var vscode4 = __toESM(require("vscode"));
var fs2 = __toESM(require("fs"));

// src/utils/coreBridge.ts
var path2 = __toESM(require("path"));
function tryLoadCore() {
  try {
    return require("../../core/dist/lib/index.js");
  } catch (_) {
    try {
      return require(path2.join(__dirname, "..", "..", "..", "core", "dist", "lib", "index.js"));
    } catch (e) {
      return null;
    }
  }
}
function extractWithCore(markedFile, destFolder, options, logger) {
  const core = tryLoadCore();
  if (!core) {
    throw new Error("LookAtni core library not found. Build core first (cd core && npm run build).");
  }
  const extractor = core.createExtractor ? core.createExtractor() : new core.MarkerExtractor();
  return extractor.extractFromFile(
    markedFile,
    destFolder,
    {
      overwriteExisting: options.overwrite ?? false,
      createDirectories: options.createDirs ?? true,
      validateChecksums: false,
      preserveTimestamps: true,
      progressCallback: () => {
      },
      conflictCallback: () => "skip",
      dryRun: options.dryRun ?? false,
      conflictResolution: "skip"
    }
  );
}
async function generateWithCore(sourceFolder, outputFile, options, onProgress) {
  const core = tryLoadCore();
  if (!core) {
    throw new Error("LookAtni core library not found. Build core first (cd core && npm run build).");
  }
  const generator = core.createGenerator ? core.createGenerator() : new core.MarkerGenerator();
  return generator.generateToFile(
    sourceFolder,
    outputFile,
    {
      maxFileSize: options.maxFileSize,
      excludePatterns: options.excludePatterns,
      includeMetadata: true,
      includeBinaryFiles: false,
      encoding: "utf-8",
      preserveTimestamps: true,
      customMetadata: {},
      validateBeforeGeneration: false,
      progressCallback: (p) => {
        if (onProgress) {
          onProgress(p.percentage ?? 0, p.currentFile ?? "");
        }
      }
    }
  );
}
async function validateWithCore(markerFile) {
  const core = tryLoadCore();
  if (!core) {
    throw new Error("LookAtni core library not found. Build core first (cd core && npm run build).");
  }
  const validator = core.createValidator ? core.createValidator() : new core.MarkerValidator();
  return validator.validateFile(markerFile);
}

// src/commands/extractFiles.ts
var ExtractFilesCommand = class {
  constructor(context, logger, outputChannel) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
  }
  commandId = "lookatni-file-markers.extractFiles";
  async execute(uri) {
    this.logger.info("\u{1F504} Starting file extraction...");
    try {
      const markedFile = await this.getMarkedFile(uri);
      if (!markedFile) {
        return;
      }
      const destFolder = await this.getDestinationFolder();
      if (!destFolder) {
        return;
      }
      const options = await this.getExtractionOptions();
      if (!options) {
        return;
      }
      const results = await vscode4.window.withProgress({
        location: vscode4.ProgressLocation.Notification,
        title: "Extracting files...",
        cancellable: false
      }, async () => {
        const res = await extractWithCore(markedFile, destFolder, options, this.logger);
        return {
          success: res.success,
          extractedFiles: res.extractedFiles,
          errors: res.errors
        };
      });
      this.showResults(results, destFolder);
      const openFolder = await vscode4.window.showInformationMessage(
        `\u2705 Extracted ${results.extractedFiles.length} files`,
        "Open Folder"
      );
      if (openFolder === "Open Folder") {
        vscode4.commands.executeCommand("revealFileInOS", vscode4.Uri.file(destFolder));
      }
    } catch (error) {
      this.logger.error("Error during extraction:", error);
      vscode4.window.showErrorMessage(`Extraction failed: ${error}`);
    }
  }
  async getMarkedFile(uri) {
    if (uri && uri.fsPath && fs2.existsSync(uri.fsPath)) {
      return uri.fsPath;
    }
    const fileUri = await vscode4.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: "Select marked file to extract",
      filters: {
        "LookAtni Files": ["txt", "md"],
        "All Files": ["*"]
      }
    });
    return fileUri?.[0]?.fsPath;
  }
  async getDestinationFolder() {
    const folderUri = await vscode4.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: "Select destination folder"
    });
    return folderUri?.[0]?.fsPath;
  }
  async getExtractionOptions() {
    return {
      overwrite: true,
      createDirs: true
    };
  }
  showResults(results, destFolder) {
    this.outputChannel.appendLine("\n=== EXTRACTION RESULTS ===");
    this.outputChannel.appendLine(`\u{1F4C1} Destination: ${destFolder}`);
    this.outputChannel.appendLine(`\u2705 Files extracted: ${results.extractedFiles.length}`);
    this.outputChannel.show();
  }
};

// src/commands/generateMarkers.ts
var vscode5 = __toESM(require("vscode"));
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var GenerateMarkersCommand = class {
  constructor(context, logger, outputChannel) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
  }
  commandId = "lookatni-file-markers.generateMarkers";
  async execute(uri) {
    this.logger.info("\u{1F504} Starting marker generation...");
    try {
      const sourceFolder = await this.getSourceFolder(uri);
      if (!sourceFolder) {
        return;
      }
      const outputFile = await this.getOutputFile(sourceFolder);
      if (!outputFile) {
        return;
      }
      const options = await this.getGenerationOptions();
      if (!options) {
        return;
      }
      const results = await vscode5.window.withProgress({
        location: vscode5.ProgressLocation.Notification,
        title: "Generating markers...",
        cancellable: false
      }, async (progress) => {
        await generateWithCore(sourceFolder, outputFile, options, (pct) => {
          progress.report({ increment: 0, message: `${pct}%` });
        });
        return { sourceFolder, totalFiles: 0, totalBytes: 0, skippedFiles: [], fileTypes: {} };
      });
      this.showResults(results, outputFile);
      const openFile = await vscode5.window.showInformationMessage(
        `\u2705 Generated markers for ${results.totalFiles} files`,
        "Open File",
        "Copy Path"
      );
      if (openFile === "Open File") {
        const document = await vscode5.workspace.openTextDocument(outputFile);
        vscode5.window.showTextDocument(document);
      } else if (openFile === "Copy Path") {
        vscode5.env.clipboard.writeText(outputFile);
        vscode5.window.showInformationMessage("Path copied to clipboard!");
      }
    } catch (error) {
      this.logger.error("Error during generation:", error);
      vscode5.window.showErrorMessage(`Generation failed: ${error}`);
    }
  }
  async getSourceFolder(uri) {
    if (uri && uri.fsPath) {
      const stat = fs3.statSync(uri.fsPath);
      if (stat.isDirectory()) {
        return uri.fsPath;
      }
    }
    if (vscode5.workspace.workspaceFolders && vscode5.workspace.workspaceFolders.length > 0) {
      const workspaceRoot = vscode5.workspace.workspaceFolders[0].uri.fsPath;
      const choice = await vscode5.window.showQuickPick([
        { label: "\u{1F4C1} Entire Workspace", description: "Generate from workspace root", path: workspaceRoot },
        { label: "\u{1F4C2} Choose Subfolder...", description: "Select specific folder", path: "custom" }
      ], {
        placeHolder: "Select source folder"
      });
      if (!choice) {
        return void 0;
      }
      if (choice.path === "custom") {
        const folderUri2 = await vscode5.window.showOpenDialog({
          canSelectMany: false,
          canSelectFiles: false,
          canSelectFolders: true,
          openLabel: "Select source folder"
        });
        return folderUri2?.[0]?.fsPath;
      }
      return choice.path;
    }
    const folderUri = await vscode5.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: "Select source folder"
    });
    return folderUri?.[0]?.fsPath;
  }
  async getOutputFile(sourceFolder) {
    const baseName = path3.basename(sourceFolder);
    const defaultName = `${baseName}-lookatni.lkt.txt`;
    const result = await vscode5.window.showInputBox({
      prompt: "Enter output file name",
      value: defaultName,
      validateInput: (value) => {
        if (!value.trim()) {
          return "File name cannot be empty";
        }
        if (!/\.(txt|md)$/i.test(value)) {
          return "File should have .txt or .md extension";
        }
        return null;
      }
    });
    if (!result) {
      return void 0;
    }
    if (vscode5.workspace.workspaceFolders && vscode5.workspace.workspaceFolders.length > 0) {
      const workspaceRoot = vscode5.workspace.workspaceFolders[0].uri.fsPath;
      return path3.join(workspaceRoot, result);
    }
    return path3.join(path3.dirname(sourceFolder), result);
  }
  async getGenerationOptions() {
    const options = {};
    const maxSize = await vscode5.window.showQuickPick([
      { label: "500 KB", description: "Small files only", value: 500 },
      { label: "1 MB", description: "Medium files (recommended)", value: 1e3 },
      { label: "5 MB", description: "Large files", value: 5e3 },
      { label: "No limit", description: "Include all files", value: -1 }
    ], {
      placeHolder: "Select maximum file size to include"
    });
    if (!maxSize) {
      return void 0;
    }
    options.maxFileSize = maxSize.value;
    const excludeChoice = await vscode5.window.showQuickPick([
      { label: "Standard exclusions", description: "node_modules, .git, build folders", value: "standard" },
      { label: "Minimal exclusions", description: "Only hidden files", value: "minimal" },
      { label: "Custom exclusions", description: "Specify patterns", value: "custom" }
    ], {
      placeHolder: "Select exclusion strategy"
    });
    if (!excludeChoice) {
      return void 0;
    }
    switch (excludeChoice.value) {
      case "standard":
        options.excludePatterns = [
          "node_modules",
          ".git",
          ".svn",
          ".hg",
          "build",
          "dist",
          "out",
          "target",
          "__pycache__",
          ".pytest_cache",
          ".vscode",
          "*.log",
          "*.tmp",
          "*.cache"
        ];
        break;
      case "minimal":
        options.excludePatterns = [".*"];
        break;
      case "custom":
        const patterns = await vscode5.window.showInputBox({
          prompt: "Enter exclusion patterns (comma-separated)",
          placeHolder: "e.g., node_modules, *.log, build",
          value: "node_modules, .git, build"
        });
        if (patterns) {
          options.excludePatterns = patterns.split(",").map((p) => p.trim());
        } else {
          options.excludePatterns = [];
        }
        break;
    }
    return options;
  }
  showResults(results, outputFile) {
    const { totalFiles, totalBytes, skippedFiles } = results;
    this.outputChannel.appendLine("\n=== GENERATION RESULTS ===");
    this.outputChannel.appendLine(`\u{1F4C1} Source: ${results.sourceFolder}`);
    this.outputChannel.appendLine(`\u{1F4C4} Output: ${outputFile}`);
    this.outputChannel.appendLine(`\u2705 Files processed: ${totalFiles}`);
    this.outputChannel.appendLine(`\u{1F4CA} Total size: ${this.formatBytes(totalBytes)}`);
    this.outputChannel.appendLine(`\u23ED\uFE0F Files skipped: ${skippedFiles.length}`);
    if (skippedFiles.length > 0) {
      this.outputChannel.appendLine("\n=== SKIPPED FILES ===");
      skippedFiles.forEach((file) => {
        this.outputChannel.appendLine(`\u23ED\uFE0F ${file.path}: ${file.reason}`);
      });
    }
    const config = vscode5.workspace.getConfiguration("lookatni");
    if (config.get("showStatistics", true)) {
      vscode5.commands.executeCommand("lookatni-file-markers.showStatistics", results);
    }
  }
  formatBytes(bytes) {
    if (bytes === 0) {
      return "0 B";
    }
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
};

// src/commands/openCLI.ts
var fs4 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
var vscode6 = __toESM(require("vscode"));
var OpenCLICommand = class {
  constructor(context, logger, outputChannel) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
  }
  commandId = "lookatni-file-markers.openCLI";
  // ASCII 28 (File Separator) character for invisible markers
  FS_CHAR = String.fromCharCode(28);
  async execute() {
    this.logger.info("\u{1F527} Opening LookAtni CLI tools...");
    try {
      const cliPath = await this.findCLITools();
      if (cliPath) {
        await this.showCLIOptions(cliPath);
      } else {
        await this.offerCLIInstallation();
      }
    } catch (error) {
      this.logger.error("Error opening CLI:", error);
      vscode6.window.showErrorMessage(`CLI access failed: ${error}`);
    }
  }
  async findCLITools() {
    const possiblePaths = [
      // Check extension resources
      path4.join(this.context.extensionPath, "cli"),
      // Check workspace
      vscode6.workspace.workspaceFolders?.[0]?.uri.fsPath + "/cli",
      // Check parent directories
      vscode6.workspace.workspaceFolders?.[0]?.uri.fsPath + "/../kortex",
      // Check common locations
      path4.join(require("os").homedir(), ".lookatni"),
      "/usr/local/bin/lookatni",
      "C:\\Program Files\\LookAtni"
    ];
    for (const possiblePath of possiblePaths) {
      if (possiblePath && fs4.existsSync(possiblePath)) {
        const packageJsonPath = path4.join(possiblePath, "package.json");
        if (fs4.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs4.readFileSync(packageJsonPath, "utf8"));
            if (packageJson.scripts && packageJson.scripts["lookatni:extract"] && packageJson.scripts["lookatni:generate"]) {
              this.logger.info(`Found LookAtni npm scripts at: ${possiblePath}`);
              return possiblePath;
            }
          } catch (error) {
          }
        }
      }
    }
    return void 0;
  }
  async showCLIOptions(cliPath) {
    const choice = await vscode6.window.showQuickPick([
      {
        label: "\u{1F4C2} Open CLI Folder",
        description: "Open the CLI tools folder in file explorer",
        action: "folder"
      },
      {
        label: "\u26A1 Extract Files",
        description: "Run npm script: lookatni:extract",
        action: "extract"
      },
      {
        label: "\u{1F3F7}\uFE0F Generate Markers",
        description: "Run npm script: lookatni:generate",
        action: "generate"
      },
      {
        label: "\u{1F9EA} Run Tests",
        description: "Run npm script: lookatni:test",
        action: "test"
      },
      {
        label: "\u{1F3AF} Quick Demo",
        description: "Run npm script: lookatni:demo",
        action: "demo"
      },
      {
        label: "\u{1F4D6} Show Help",
        description: "Display CLI usage information",
        action: "help"
      }
    ], {
      placeHolder: "Choose CLI action"
    });
    if (!choice) {
      return;
    }
    switch (choice.action) {
      case "folder":
        vscode6.commands.executeCommand("revealFileInOS", vscode6.Uri.file(cliPath));
        break;
      case "extract":
        await this.runNpmScript("lookatni:extract");
        break;
      case "generate":
        await this.runNpmScript("lookatni:generate");
        break;
      case "test":
        await this.runNpmScript("lookatni:test");
        break;
      case "demo":
        await this.runNpmScript("lookatni:demo");
        break;
      case "help":
        this.showCLIHelp(cliPath);
        break;
    }
  }
  async runNpmScript(scriptName) {
    const workspaceRoot = vscode6.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode6.window.showErrorMessage("No workspace folder found. Please open a folder first.");
      return;
    }
    const packageJsonPath = path4.join(workspaceRoot, "package.json");
    if (!fs4.existsSync(packageJsonPath)) {
      vscode6.window.showErrorMessage("No package.json found in workspace root.");
      return;
    }
    let args = "";
    if (scriptName === "lookatni:extract" || scriptName === "lookatni:generate") {
      const inputArgs = await vscode6.window.showInputBox({
        prompt: `Enter arguments for ${scriptName} (or leave empty for interactive mode)`,
        placeHolder: "e.g., input.txt output_folder"
      });
      if (inputArgs !== void 0) {
        args = inputArgs;
      } else {
        return;
      }
    }
    const terminal = vscode6.window.createTerminal({
      name: `LookAtni CLI - ${scriptName}`,
      cwd: workspaceRoot
    });
    const command = `npm run ${scriptName} ${args}`.trim();
    terminal.sendText(command);
    terminal.show();
    this.outputChannel.appendLine(`\u2705 Started ${scriptName} in terminal`);
    this.outputChannel.appendLine(`Working directory: ${workspaceRoot}`);
    this.outputChannel.appendLine(`Command: ${command}`);
    if (args) {
      this.outputChannel.appendLine(`Arguments: ${args}`);
    }
  }
  showCLIHelp(cliPath) {
    this.outputChannel.clear();
    this.outputChannel.appendLine("=== LOOKATNI CLI TOOLS HELP ===");
    this.outputChannel.appendLine(`\u{1F4C1} Location: ${cliPath}`);
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("=== AVAILABLE SCRIPTS ===");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F4E4} npm run lookatni:extract");
    this.outputChannel.appendLine("   Extract files from marked content");
    this.outputChannel.appendLine("   Usage: npm run lookatni:extract [marked_file] [output_dir]");
    this.outputChannel.appendLine("   Options: --dry-run, --interactive, --force");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F4E5} npm run lookatni:generate");
    this.outputChannel.appendLine("   Generate marked file from source directory");
    this.outputChannel.appendLine("   Usage: npm run lookatni:generate [source_dir] [output_file]");
    this.outputChannel.appendLine("   Options: --max-size, --exclude");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F9EA} npm run lookatni:test");
    this.outputChannel.appendLine("   Run comprehensive tests of the LookAtni system");
    this.outputChannel.appendLine("   Usage: npm run lookatni:test");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F3AF} npm run lookatni:demo");
    this.outputChannel.appendLine("   Run interactive demonstration");
    this.outputChannel.appendLine("   Usage: npm run lookatni:demo");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("=== MARKER FORMAT ===");
    this.outputChannel.appendLine("LookAtni uses invisible Unicode markers to separate files:");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("// Markers are invisible - shown as \u241C for demonstration only");
    this.outputChannel.appendLine("//\u241C/ filename.ext /\u241C//");
    this.outputChannel.appendLine("file content here...");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("//\u241C/ another/file.txt /\u241C//");
    this.outputChannel.appendLine("more content...");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("=== EXAMPLES ===");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("# Extract files from marked content:");
    this.outputChannel.appendLine("npm run lookatni:extract project-marked.txt ./extracted");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("# Generate markers from a project:");
    this.outputChannel.appendLine("npm run lookatni:generate ./my-project output.txt");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("# Interactive mode:");
    this.outputChannel.appendLine("npm run lookatni:extract --interactive");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("=== FEATURES ===");
    this.outputChannel.appendLine("\u2705 Unique marker syntax that never conflicts");
    this.outputChannel.appendLine("\u2705 Preserves directory structure");
    this.outputChannel.appendLine("\u2705 Binary file detection and exclusion");
    this.outputChannel.appendLine("\u2705 Interactive and batch modes");
    this.outputChannel.appendLine("\u2705 Comprehensive validation");
    this.outputChannel.appendLine("\u2705 Statistics and reporting");
    this.outputChannel.appendLine("\u2705 VS Code integration");
    this.outputChannel.show();
    vscode6.window.showInformationMessage(
      "\u{1F4D6} CLI help is displayed in the output panel"
    );
  }
  async offerCLIInstallation() {
    const choice = await vscode6.window.showWarningMessage(
      "\u{1F527} LookAtni CLI tools not found. Would you like to set them up?",
      "Download CLI",
      "Setup Instructions",
      "Use Extension Only"
    );
    switch (choice) {
      case "Download CLI":
        await this.downloadCLITools();
        break;
      case "Setup Instructions":
        this.showSetupInstructions();
        break;
      case "Use Extension Only":
        vscode6.window.showInformationMessage(
          "\u2705 You can use all LookAtni features through the VS Code extension commands"
        );
        break;
    }
  }
  async downloadCLITools() {
    const choice = await vscode6.window.showInformationMessage(
      "\u{1F4E5} CLI tools can be downloaded from the LookAtni repository",
      "Open Repository",
      "Copy CLI Path"
    );
    if (choice === "Open Repository") {
      vscode6.env.openExternal(vscode6.Uri.parse("https://github.com/kubex-ecosystem/lookatni-file-markers"));
    } else if (choice === "Copy CLI Path") {
      const suggestedPath = path4.join(this.context.extensionPath, "cli");
      vscode6.env.clipboard.writeText(suggestedPath);
      vscode6.window.showInformationMessage(`CLI path copied: ${suggestedPath}`);
    }
  }
  showSetupInstructions() {
    this.outputChannel.clear();
    this.outputChannel.appendLine("=== LOOKATNI CLI SETUP INSTRUCTIONS ===");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("1. Download the CLI tools:");
    this.outputChannel.appendLine("   git clone https://github.com/kubex-ecosystem/lookatni-file-markers.git");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("1. Install Node.js and npm if not already installed");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("2. Ensure your workspace has package.json with LookAtni scripts:");
    this.outputChannel.appendLine("   \u2022 lookatni:extract");
    this.outputChannel.appendLine("   \u2022 lookatni:generate");
    this.outputChannel.appendLine("   \u2022 lookatni:test");
    this.outputChannel.appendLine("   \u2022 lookatni:demo");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("3. Install TypeScript execution runtime:");
    this.outputChannel.appendLine("   npm install -g tsx");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("4. Test the installation:");
    this.outputChannel.appendLine("   npm run lookatni:test");
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("The extension will automatically detect the CLI tools once installed.");
    this.outputChannel.show();
  }
};

// src/commands/quickDemo.ts
var vscode7 = __toESM(require("vscode"));
var fs5 = __toESM(require("fs"));
var path5 = __toESM(require("path"));
var QuickDemoCommand = class {
  constructor(context, logger, outputChannel) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
  }
  commandId = "lookatni-file-markers.quickDemo";
  // ASCII 28 (File Separator) character for invisible markers
  FS_CHAR = String.fromCharCode(28);
  async execute() {
    this.logger.info("\u{1F680} Starting LookAtni Quick Demo...");
    try {
      const proceed = await this.showDemoIntroduction();
      if (!proceed) {
        return;
      }
      const demoPath = await this.createDemoWorkspace();
      if (!demoPath) {
        return;
      }
      const markedFile = await this.generateDemoMarkers(demoPath);
      await this.extractDemoFiles(markedFile, demoPath);
      this.showDemoCompletion(demoPath, markedFile);
    } catch (error) {
      this.logger.error("Error during demo:", error);
      vscode7.window.showErrorMessage(`Demo failed: ${error}`);
    }
  }
  async showDemoIntroduction() {
    const message = `\u{1F3AF} Welcome to LookAtni File Markers Quick Demo!
        
This demo will:
\u2022 Create sample files with different extensions
\u2022 Generate a marked file using invisible Unicode markers
\u2022 Extract files back from the marked content
\u2022 Show validation and statistics

The demo creates a temporary folder and won't affect your current workspace.

Ready to see LookAtni in action?`;
    const choice = await vscode7.window.showInformationMessage(
      message,
      { modal: true },
      "Start Demo",
      "Cancel"
    );
    return choice === "Start Demo";
  }
  async createDemoWorkspace() {
    const workspaceRoot = vscode7.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const demoParent = workspaceRoot || require("os").homedir();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const demoPath = path5.join(demoParent, `lookatni-demo-${timestamp}`);
    try {
      fs5.mkdirSync(demoPath, { recursive: true });
      await this.createSampleFiles(demoPath);
      this.logger.success(`Created demo workspace: ${demoPath}`);
      return demoPath;
    } catch (error) {
      this.logger.error("Failed to create demo workspace:", error);
      vscode7.window.showErrorMessage("Failed to create demo workspace");
      return void 0;
    }
  }
  async createSampleFiles(demoPath) {
    const samples = {
      "README.md": `# LookAtni Demo Project

This is a sample project to demonstrate the LookAtni File Markers system.

## Features
- File marker system with invisible Unicode characters
- CLI tools for extraction and generation
- VS Code extension for seamless integration

Generated on: ${(/* @__PURE__ */ new Date()).toISOString()}
`,
      "package.json": JSON.stringify({
        name: "lookatni-demo",
        version: "1.0.0",
        description: "Demo project for LookAtni File Markers",
        main: "index.js",
        scripts: {
          start: "node index.js",
          test: 'echo "No tests yet"'
        },
        keywords: ["lookatni", "demo", "markers"],
        author: "LookAtni File Markers",
        license: "MIT"
      }, null, 2),
      "src/index.js": `// LookAtni Demo - Main File
console.log('\u{1F680} Welcome to LookAtni File Markers!');

function demonstrateMarkers() {
    console.log('This file will be marked with invisible Unicode characters');
    console.log('Each file gets unique markers for easy extraction');
    
    const features = [
        'Unique file markers',
        'CLI tools',
        'VS Code extension',
        'Validation system'
    ];
    
    features.forEach((feature, index) => {
        console.log(\`\${index + 1}. \${feature}\`);
    });
}

demonstrateMarkers();
`,
      "src/utils.js": `// Utility functions for LookAtni Demo

export function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function validateFilename(filename) {
    const invalidChars = /[<>:"|?*]/;
    return !invalidChars.test(filename);
}

export function createMarker(filename) {
    const FS_CHAR = String.fromCharCode(28);
    return \`//\${FS_CHAR}/ \${filename} /\${FS_CHAR}//\`;
}
`,
      "config/settings.json": JSON.stringify({
        demo: true,
        version: "1.0.0",
        features: {
          markers: true,
          validation: true,
          extraction: true
        },
        created: (/* @__PURE__ */ new Date()).toISOString()
      }, null, 2),
      "docs/guide.md": `# LookAtni Usage Guide

## What are markers?

Markers use invisible Unicode characters (ASCII 28 File Separator).
They are completely invisible but allow for perfect file organization.

## Example:

\`\`\`
// Markers are invisible - shown as \u241C for demonstration only
//\u241C/ src/example.js /\u241C//
console.log('This content belongs to src/example.js');
const demo = true;

//\u241C/ README.md /\u241C//
# Another File
This content belongs to README.md
\`\`\`

## Benefits:
- Easy file identification
- Preserves directory structure  
- Supports validation
- Works with any text format
`
    };
    for (const [filePath, content] of Object.entries(samples)) {
      const fullPath = path5.join(demoPath, filePath);
      const dir = path5.dirname(fullPath);
      if (!fs5.existsSync(dir)) {
        fs5.mkdirSync(dir, { recursive: true });
      }
      fs5.writeFileSync(fullPath, content, "utf-8");
    }
  }
  async generateDemoMarkers(demoPath) {
    const outputFile = path5.join(demoPath, "demo-marked.txt");
    const options = {
      maxFileSize: 1e3,
      // 1MB limit
      excludePatterns: ["node_modules", ".git", "*.log"]
    };
    this.outputChannel.appendLine("\n=== GENERATING MARKERS ===");
    await vscode7.window.withProgress({
      location: vscode7.ProgressLocation.Notification,
      title: "Generating demo markers...",
      cancellable: false
    }, async (progress) => {
      await generateWithCore(demoPath, outputFile, options, (pct) => {
        progress.report({ increment: 0, message: `${pct}%` });
      });
      return;
    });
    const validation = await validateWithCore(outputFile);
    this.outputChannel.appendLine(`\u2705 Generated markers for ${validation.statistics.totalFiles} files`);
    this.outputChannel.appendLine(`\u{1F4CA} Total size: ${this.formatBytes(validation.statistics.totalBytes)}`);
    this.outputChannel.appendLine(`\u{1F4C4} Output: ${outputFile}`);
    return outputFile;
  }
  async extractDemoFiles(markedFile, demoPath) {
    const extractPath = path5.join(demoPath, "extracted");
    this.outputChannel.appendLine("\n=== EXTRACTING FILES ===");
    const results = await vscode7.window.withProgress({
      location: vscode7.ProgressLocation.Notification,
      title: "Extracting demo files...",
      cancellable: false
    }, async () => {
      const res = await extractWithCore(markedFile, extractPath, { overwrite: true, createDirs: true, dryRun: false }, this.logger);
      return { extractedFiles: res.extractedFiles, errors: res.errors };
    });
    this.outputChannel.appendLine(`\u2705 Extracted ${results.extractedFiles.length} files`);
    this.outputChannel.appendLine(`\u{1F4C1} Output directory: ${extractPath}`);
    if (results.errors.length > 0) {
      this.outputChannel.appendLine("\u26A0\uFE0F Errors:");
      results.errors.forEach((error) => {
        this.outputChannel.appendLine(`  \u2022 ${error}`);
      });
    }
  }
  async showDemoCompletion(demoPath, markedFile) {
    this.outputChannel.appendLine("\n=== DEMO COMPLETED ===");
    this.outputChannel.appendLine(`\u{1F4C1} Demo workspace: ${demoPath}`);
    this.outputChannel.appendLine(`\u{1F4C4} Marked file: ${markedFile}`);
    this.outputChannel.appendLine(`\u{1F4C2} Extracted files: ${path5.join(demoPath, "extracted")}`);
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("\u{1F3AF} Demo completed successfully!");
    this.outputChannel.appendLine("You can now explore the generated files and see how LookAtni works.");
    this.outputChannel.show();
    const choice = await vscode7.window.showInformationMessage(
      "\u{1F389} Demo completed! What would you like to do?",
      "Open Demo Folder",
      "View Marked File",
      "Open Extracted Files",
      "Close"
    );
    switch (choice) {
      case "Open Demo Folder":
        vscode7.commands.executeCommand("revealFileInOS", vscode7.Uri.file(demoPath));
        break;
      case "View Marked File":
        const document = await vscode7.workspace.openTextDocument(markedFile);
        vscode7.window.showTextDocument(document);
        break;
      case "Open Extracted Files":
        const extractedPath = path5.join(demoPath, "extracted");
        vscode7.commands.executeCommand("revealFileInOS", vscode7.Uri.file(extractedPath));
        break;
    }
  }
  formatBytes(bytes) {
    if (bytes === 0) {
      return "0 B";
    }
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
};

// src/commands/quickMarkers.ts
var vscode8 = __toESM(require("vscode"));
var QuickMarkersCommands = class {
  constructor(context, logger, markersManager) {
    this.context = context;
    this.logger = logger;
    this.markersManager = markersManager;
  }
  // Quick mark as read
  async markAsRead(uri) {
    const targetUri = uri || vscode8.window.activeTextEditor?.document.uri;
    if (!targetUri) {
      vscode8.window.showErrorMessage("No file to mark");
      return;
    }
    await this.markersManager.toggleMarker(targetUri, "read");
    const fileName = vscode8.workspace.asRelativePath(targetUri);
    vscode8.window.showInformationMessage(`${fileName} marked as read`);
  }
  // Quick mark as favorite
  async markAsFavorite(uri) {
    const targetUri = uri || vscode8.window.activeTextEditor?.document.uri;
    if (!targetUri) {
      vscode8.window.showErrorMessage("No file to mark");
      return;
    }
    await this.markersManager.toggleMarker(targetUri, "favorite");
    const fileName = vscode8.workspace.asRelativePath(targetUri);
    vscode8.window.showInformationMessage(`${fileName} marked as favorite`);
  }
  // Quick mark as important
  async markAsImportant(uri) {
    const targetUri = uri || vscode8.window.activeTextEditor?.document.uri;
    if (!targetUri) {
      vscode8.window.showErrorMessage("No file to mark");
      return;
    }
    await this.markersManager.toggleMarker(targetUri, "important");
    const fileName = vscode8.workspace.asRelativePath(targetUri);
    vscode8.window.showInformationMessage(`${fileName} marked as important`);
  }
  // Show markers overview
  async showMarkersOverview() {
    const markers = this.markersManager.getAllMarkers();
    if (markers.length === 0) {
      vscode8.window.showInformationMessage("No markers found. Start marking files!");
      return;
    }
    const grouped = markers.reduce((acc, marker) => {
      if (!acc[marker.type]) {
        acc[marker.type] = [];
      }
      acc[marker.type].push(marker);
      return acc;
    }, {});
    let content = "# Visual Markers Overview\n\n";
    content += `Total markers: **${markers.length}**

`;
    for (const [type, typeMarkers] of Object.entries(grouped)) {
      content += `## ${this.getTypeIcon(type)} ${this.capitalizeType(type)} (${typeMarkers.length})

`;
      for (const marker of typeMarkers) {
        const fileName = vscode8.workspace.asRelativePath(marker.uri);
        const date = new Date(marker.timestamp).toLocaleDateString();
        content += `- **${fileName}** _(${date})_`;
        if (marker.notes) {
          content += ` - ${marker.notes}`;
        }
        content += "\n";
      }
      content += "\n";
    }
    const doc = await vscode8.workspace.openTextDocument({
      content,
      language: "markdown"
    });
    await vscode8.window.showTextDocument(doc);
  }
  // Clear all markers with confirmation
  async clearAllMarkers() {
    const markers = this.markersManager.getAllMarkers();
    if (markers.length === 0) {
      vscode8.window.showInformationMessage("No markers to clear");
      return;
    }
    const confirmation = await vscode8.window.showWarningMessage(
      `Are you sure you want to remove all ${markers.length} markers?`,
      { modal: true },
      "Yes, Clear All",
      "Cancel"
    );
    if (confirmation === "Yes, Clear All") {
      await this.markersManager.clearAllMarkers();
      vscode8.window.showInformationMessage("All markers cleared");
    }
  }
  // Export markers
  async exportMarkers() {
    try {
      const exportData = await this.markersManager.exportMarkers();
      const saveUri = await vscode8.window.showSaveDialog({
        defaultUri: vscode8.Uri.file("lookatni-markers-export.json"),
        filters: {
          "JSON": ["json"],
          "All Files": ["*"]
        }
      });
      if (saveUri) {
        await vscode8.workspace.fs.writeFile(saveUri, Buffer.from(exportData));
        vscode8.window.showInformationMessage(`Markers exported to ${saveUri.fsPath}`);
      }
    } catch (error) {
      vscode8.window.showErrorMessage(`Export failed: ${error}`);
    }
  }
  // Import markers
  async importMarkers() {
    try {
      const openUri = await vscode8.window.showOpenDialog({
        filters: {
          "JSON": ["json"],
          "All Files": ["*"]
        },
        canSelectMany: false
      });
      if (openUri && openUri[0]) {
        const fileData = await vscode8.workspace.fs.readFile(openUri[0]);
        const jsonData = Buffer.from(fileData).toString();
        await this.markersManager.importMarkers(jsonData);
        vscode8.window.showInformationMessage("Markers imported successfully");
      }
    } catch (error) {
      vscode8.window.showErrorMessage(`Import failed: ${error}`);
    }
  }
  getTypeIcon(type) {
    const icons = {
      "read": "\u2705",
      "unread": "\u{1F535}",
      "favorite": "\u2B50",
      "important": "\u2757",
      "todo": "\u{1F4CB}",
      "custom": "\u{1F3A8}"
    };
    return icons[type] || "\u{1F4CC}";
  }
  capitalizeType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

// src/commands/recordingGuide.ts
var vscode9 = __toESM(require("vscode"));
var DemoRecordingGuide = class {
  static async showRecordingGuide() {
    const guide = `# \u{1F3AC} LookAtni Demo Recording Guide

## \u{1F680} Quick Setup (30 seconds)

### 1. VS Code Setup
- Install **Chronicler** extension for recording
- Set recording quality to HD
- Ensure clean workspace (no distractions)

### 2. Automated Demo
\`\`\`
Ctrl+Shift+P \u2192 "LookAtni: Automated Demo"
\`\`\`

### 3. Recording Steps
1. **Start Chronicler recording**
2. **Run automated demo command**
3. **Let it flow automatically** (2-3 minutes)
4. **Stop recording**

## \u{1F3AF} What the Demo Shows

### Golden Feature Sequence:
1. \u{1F916} **AI-Generated Content**
   - Complete React project in single document
   - Invisible Unicode markers (completely hidden)
   - Perfect simulation of ChatGPT/Claude output

2. \u26A1 **One-Click Extraction**
   - Right-click \u2192 Extract Files
   - Perfect file structure created instantly
   - Ready-to-run project

3. \u{1F38A} **Amazing Results**
   - Real working files
   - Complete project structure
   - Package.json, components, styles
   - npm start ready!

## \u{1F4CB} Manual Fallback (if needed)

If automation doesn't work perfectly:

1. **Clean workspace**:
   - Remove all demo folders
   - Close all editors
   
2. **Manual steps**:
   - Run \`LookAtni: Quick Demo\`
   - Show file with invisible markers
   - Right-click \u2192 Extract Files
   - Select destination folder
   - Show extracted structure

## \u{1F3A5} Recording Tips

### Optimal Settings:
- **Resolution**: 1920x1080 or 1280x720
- **Frame Rate**: 30fps
- **Duration**: 2-3 minutes max
- **File Size**: Keep under 10MB for GitHub

### VS Code Appearance:
- Dark theme (better contrast)
- Hide unnecessary panels
- Font size: 14-16px for readability
- Zoom: 100-110%

### Narrative Flow:
1. "Here's LookAtni's golden feature..."
2. "AI generates complete project..."
3. "Invisible markers guide extraction..."
4. "One click creates perfect structure!"

## \u{1F504} Post-Recording

### GIF Optimization:
\`\`\`bash
# FFmpeg command for optimal GIF
ffmpeg -i demo.mp4 \\
  -filter_complex "[0:v] fps=10,scale=640:-1,split[a][b];[a]palettegen[p];[b][p]paletteuse" \\
  -loop 0 assets/demo.gif
\`\`\`

### README Integration:
\`\`\`markdown
![LookAtni Demo](assets/demo.gif)
> \u{1F3AF} See the Golden Feature in action: AI code to project structure in seconds!
\`\`\`

## \u{1F680} Ready to Record!

**The automated demo handles everything** - just start recording and run the command!

Perfect for showcasing:
- \u2705 The unique AI code extraction feature
- \u2705 Smooth, professional workflow
- \u2705 Real working results
- \u2705 Zero manual errors

---
*Generated by LookAtni File Markers v1.0.4*`;
    const doc = await vscode9.workspace.openTextDocument({
      content: guide,
      language: "markdown"
    });
    await vscode9.window.showTextDocument(doc, {
      preview: true,
      viewColumn: vscode9.ViewColumn.Beside
    });
    const action = await vscode9.window.showInformationMessage(
      "\u{1F3AC} Recording Guide opened! Ready to create the perfect demo?",
      "Start Automated Demo",
      "Open Chronicler Extension",
      "Close Guide"
    );
    switch (action) {
      case "Start Automated Demo":
        await vscode9.commands.executeCommand("lookatni.automatedDemo");
        break;
      case "Open Chronicler Extension":
        await vscode9.commands.executeCommand("workbench.extensions.search", "chronicler");
        break;
    }
  }
};

// src/commands/showStatistics.ts
var vscode10 = __toESM(require("vscode"));
var fs6 = __toESM(require("fs"));
var path6 = __toESM(require("path"));
var ShowStatisticsCommand = class {
  constructor(context, logger, outputChannel) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
  }
  commandId = "lookatni-file-markers.showStatistics";
  async execute(uri, data) {
    this.logger.info("\u{1F4CA} Showing LookAtni statistics...");
    try {
      if (data) {
        this.showPassedStatistics(data);
      } else {
        const markedFile = await this.getMarkedFile(uri);
        if (!markedFile) {
          return;
        }
        await this.analyzeMarkedFile(markedFile);
      }
    } catch (error) {
      this.logger.error("Error showing statistics:", error);
      vscode10.window.showErrorMessage(`Statistics failed: ${error}`);
    }
  }
  async getMarkedFile(uri) {
    if (uri && uri.fsPath && fs6.existsSync(uri.fsPath)) {
      return uri.fsPath;
    }
    const activeEditor = vscode10.window.activeTextEditor;
    if (activeEditor && activeEditor.document.fileName.endsWith(".txt")) {
      return activeEditor.document.fileName;
    }
    const fileUri = await vscode10.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: "Select marked file for statistics",
      filters: {
        "LookAtni Files": ["txt", "md"],
        "All Files": ["*"]
      }
    });
    return fileUri?.[0]?.fsPath;
  }
  async analyzeMarkedFile(filePath) {
    const results = await vscode10.window.withProgress({
      location: vscode10.ProgressLocation.Notification,
      title: "Analyzing marked file...",
      cancellable: false
    }, async () => {
      const res = await validateWithCore(filePath);
      return {
        totalMarkers: res.statistics.totalMarkers,
        totalFiles: res.statistics.totalFiles,
        totalBytes: res.statistics.totalBytes,
        errors: res.errors.map((e) => ({ line: e.line ?? 0, message: e.message })),
        markers: []
        // not available via validator; keep empty for now
      };
    });
    const fileStats = fs6.statSync(filePath);
    const statistics = {
      filePath,
      fileSize: fileStats.size,
      created: fileStats.birthtime,
      modified: fileStats.mtime,
      ...results
    };
    this.showDetailedStatistics(statistics);
  }
  showPassedStatistics(data) {
    this.outputChannel.clear();
    this.outputChannel.appendLine("=== LOOKATNI STATISTICS (FROM OPERATION) ===");
    if (data.sourceFolder) {
      this.outputChannel.appendLine(`\u{1F4C1} Source: ${data.sourceFolder}`);
    }
    if (data.totalFiles !== void 0) {
      this.outputChannel.appendLine(`\u{1F4C4} Files processed: ${data.totalFiles}`);
    }
    if (data.totalBytes !== void 0) {
      this.outputChannel.appendLine(`\u{1F4CA} Total size: ${this.formatBytes(data.totalBytes)}`);
    }
    if (data.skippedFiles && data.skippedFiles.length > 0) {
      this.outputChannel.appendLine(`\u23ED\uFE0F Files skipped: ${data.skippedFiles.length}`);
    }
    if (data.fileTypes) {
      this.outputChannel.appendLine("\n=== FILE TYPES ===");
      const sortedTypes = Object.entries(data.fileTypes).sort(([, a], [, b]) => b - a);
      sortedTypes.forEach(([ext, count]) => {
        const percentage = (count / data.totalFiles * 100).toFixed(1);
        this.outputChannel.appendLine(`${ext || "no-ext"}: ${count} files (${percentage}%)`);
      });
    }
    this.outputChannel.show();
  }
  showDetailedStatistics(stats) {
    this.outputChannel.clear();
    this.outputChannel.appendLine("=== DETAILED LOOKATNI STATISTICS ===");
    this.outputChannel.appendLine(`\u{1F4C4} File: ${path6.basename(stats.filePath)}`);
    this.outputChannel.appendLine(`\u{1F4C1} Path: ${stats.filePath}`);
    this.outputChannel.appendLine(`\u{1F4CA} File size: ${this.formatBytes(stats.fileSize)}`);
    this.outputChannel.appendLine(`\u{1F550} Created: ${stats.created.toLocaleString()}`);
    this.outputChannel.appendLine(`\u{1F551} Modified: ${stats.modified.toLocaleString()}`);
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("=== MARKER ANALYSIS ===");
    this.outputChannel.appendLine(`\u{1F3F7}\uFE0F Total markers: ${stats.totalMarkers}`);
    this.outputChannel.appendLine(`\u{1F4C1} Unique files: ${stats.totalFiles}`);
    this.outputChannel.appendLine(`\u{1F4CA} Content size: ${this.formatBytes(stats.totalBytes)}`);
    if (stats.totalFiles > 0) {
      const avgSize = stats.totalBytes / stats.totalFiles;
      this.outputChannel.appendLine(`\u{1F4CF} Average file size: ${this.formatBytes(avgSize)}`);
    }
    if (stats.errors && stats.errors.length > 0) {
      this.outputChannel.appendLine("");
      this.outputChannel.appendLine("=== ERRORS FOUND ===");
      stats.errors.forEach((error) => {
        this.outputChannel.appendLine(`\u274C Line ${error.line}: ${error.message}`);
      });
    }
    this.outputChannel.appendLine("");
    this.outputChannel.appendLine("=== EFFICIENCY METRICS ===");
    if (stats.totalMarkers > 0) {
      const markerOverhead = stats.totalMarkers * 20;
      const efficiency = (stats.totalBytes / (stats.totalBytes + markerOverhead) * 100).toFixed(1);
      this.outputChannel.appendLine(`\u26A1 Content efficiency: ${efficiency}%`);
    }
    const compressionRatio = stats.fileSize > 0 ? (stats.totalBytes / stats.fileSize * 100).toFixed(1) : "0";
    this.outputChannel.appendLine(`\u{1F5DC}\uFE0F Content ratio: ${compressionRatio}%`);
    this.outputChannel.show();
    vscode10.window.showInformationMessage(
      `\u{1F4CA} Statistics: ${stats.totalMarkers} markers, ${stats.totalFiles} files, ${this.formatBytes(stats.totalBytes)}`
    );
  }
  formatBytes(bytes) {
    if (bytes === 0) {
      return "0 B";
    }
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
};

// src/commands/validateMarkers.ts
var vscode11 = __toESM(require("vscode"));
var fs7 = __toESM(require("fs"));
var ValidateMarkersCommand = class {
  constructor(context, logger, outputChannel) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
  }
  commandId = "lookatni-file-markers.validateMarkers";
  async execute(uri) {
    this.logger.info("\u{1F50D} Starting marker validation...");
    try {
      const markedFile = await this.getMarkedFile(uri);
      if (!markedFile) {
        return;
      }
      const validation = await vscode11.window.withProgress({
        location: vscode11.ProgressLocation.Notification,
        title: "Validating markers...",
        cancellable: false
      }, async () => {
        const res = await validateWithCore(markedFile);
        const allErrors = [
          ...(res.errors || []).map((e) => ({ line: e.line, message: e.message, severity: "error" })),
          ...(res.warnings || []).map((e) => ({ line: e.line, message: e.message, severity: "warning" }))
        ];
        return { isValid: res.isValid, errors: allErrors, statistics: res.statistics };
      });
      this.showValidationResults(validation, markedFile);
      await this.createDiagnostics(markedFile, validation);
    } catch (error) {
      this.logger.error("Error during validation:", error);
      vscode11.window.showErrorMessage(`Validation failed: ${error}`);
    }
  }
  async getMarkedFile(uri) {
    if (uri && uri.fsPath && fs7.existsSync(uri.fsPath)) {
      return uri.fsPath;
    }
    const activeEditor = vscode11.window.activeTextEditor;
    if (activeEditor && activeEditor.document.fileName.endsWith(".txt")) {
      return activeEditor.document.fileName;
    }
    const fileUri = await vscode11.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: "Select marked file to validate",
      filters: {
        "LookAtni Files": ["txt", "md"],
        "All Files": ["*"]
      }
    });
    return fileUri?.[0]?.fsPath;
  }
  showValidationResults(validation, filePath) {
    const { isValid, errors, statistics } = validation;
    this.outputChannel.clear();
    this.outputChannel.appendLine("=== MARKER VALIDATION RESULTS ===");
    this.outputChannel.appendLine(`\u{1F4C4} File: ${filePath}`);
    this.outputChannel.appendLine(`\u2705 Valid: ${isValid ? "YES" : "NO"}`);
    this.outputChannel.appendLine(`\u{1F4CA} Total markers: ${statistics.totalMarkers}`);
    this.outputChannel.appendLine(`\u{1F50D} Errors: ${errors.filter((e) => e.severity === "error").length}`);
    this.outputChannel.appendLine(`\u26A0\uFE0F Warnings: ${errors.filter((e) => e.severity === "warning").length}`);
    this.outputChannel.appendLine("");
    if (statistics.duplicateFilenames.length > 0) {
      this.outputChannel.appendLine("=== DUPLICATE FILENAMES ===");
      statistics.duplicateFilenames.forEach((filename) => {
        this.outputChannel.appendLine(`\u{1F504} ${filename}`);
      });
      this.outputChannel.appendLine("");
    }
    if (statistics.invalidFilenames.length > 0) {
      this.outputChannel.appendLine("=== INVALID FILENAMES ===");
      statistics.invalidFilenames.forEach((filename) => {
        this.outputChannel.appendLine(`\u274C ${filename}`);
      });
      this.outputChannel.appendLine("");
    }
    if (statistics.emptyMarkers > 0) {
      this.outputChannel.appendLine(`=== EMPTY MARKERS: ${statistics.emptyMarkers} ===`);
      this.outputChannel.appendLine("");
    }
    if (errors.length > 0) {
      this.outputChannel.appendLine("=== DETAILED ERRORS ===");
      errors.forEach((error) => {
        const icon = error.severity === "error" ? "\u274C" : "\u26A0\uFE0F";
        this.outputChannel.appendLine(`${icon} Line ${error.line}: ${error.message}`);
      });
    }
    this.outputChannel.show();
    const errorCount = errors.filter((e) => e.severity === "error").length;
    const warningCount = errors.filter((e) => e.severity === "warning").length;
    if (isValid) {
      const message = warningCount > 0 ? `\u2705 File is valid with ${warningCount} warnings` : "\u2705 File is completely valid!";
      vscode11.window.showInformationMessage(message);
    } else {
      vscode11.window.showErrorMessage(
        `\u274C File is invalid: ${errorCount} errors, ${warningCount} warnings`
      );
    }
  }
  async createDiagnostics(filePath, validation) {
    try {
      const document = await vscode11.workspace.openTextDocument(filePath);
      const diagnostics = [];
      for (const error of validation.errors) {
        if (error.line > 0 && error.line <= document.lineCount) {
          const line = document.lineAt(error.line - 1);
          const range = new vscode11.Range(
            error.line - 1,
            0,
            error.line - 1,
            line.text.length
          );
          const severity = error.severity === "error" ? vscode11.DiagnosticSeverity.Error : vscode11.DiagnosticSeverity.Warning;
          const diagnostic = new vscode11.Diagnostic(
            range,
            error.message,
            severity
          );
          diagnostic.source = "LookAtni";
          diagnostics.push(diagnostic);
        }
      }
      const collection = vscode11.languages.createDiagnosticCollection("lookatni");
      collection.set(document.uri, diagnostics);
      this.context.subscriptions.push(collection);
    } catch (error) {
      this.logger.warn("Could not create diagnostics:", error);
    }
  }
};

// src/commands/visualMarkers.ts
var vscode12 = __toESM(require("vscode"));
var VisualMarkersCommand = class {
  constructor(context, logger, outputChannel, markersManager) {
    this.context = context;
    this.logger = logger;
    this.outputChannel = outputChannel;
    this.markersManager = markersManager;
  }
  commandId = "lookatni.visualMarkers";
  async execute(uri) {
    this.logger.info("\u{1F3AF} Starting visual markers management...");
    try {
      const targetUri = uri || await this.getActiveFileUri();
      if (!targetUri) {
        vscode12.window.showErrorMessage("No file selected for marking");
        return;
      }
      const action = await this.showMarkersMenu(targetUri);
      if (action) {
        await this.executeAction(action, targetUri);
      }
    } catch (error) {
      this.logger.error("Error in visual markers command:", error);
      vscode12.window.showErrorMessage(`Visual Markers Error: ${error}`);
    }
  }
  async getActiveFileUri() {
    const activeEditor = vscode12.window.activeTextEditor;
    if (activeEditor) {
      return activeEditor.document.uri;
    }
    const selection = await vscode12.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select file to mark"
    });
    return selection?.[0];
  }
  async showMarkersMenu(uri) {
    const currentMarker = this.markersManager.getMarker(uri);
    const fileName = vscode12.workspace.asRelativePath(uri);
    const options = [
      {
        label: "$(check) Mark as Read",
        description: "Mark file as read/reviewed",
        action: "markRead"
      },
      {
        label: "$(circle-large-outline) Mark as Unread",
        description: "Mark file as unread/needs review",
        action: "markUnread"
      },
      {
        label: "$(star-full) Mark as Favorite",
        description: "Add to favorites",
        action: "markFavorite"
      },
      {
        label: "$(warning) Mark as Important",
        description: "Mark as important/priority",
        action: "markImportant"
      },
      {
        label: "$(checklist) Mark as Todo",
        description: "Add to todo list",
        action: "markTodo"
      },
      {
        label: "$(paintcan) Custom Marker",
        description: "Create custom marker with notes",
        action: "markCustom"
      },
      {
        label: "$(x) Remove Marker",
        description: "Remove current marker",
        action: "remove"
      },
      {
        label: "$(list-unordered) View All Markers",
        description: "Show all marked files",
        action: "viewAll"
      }
    ];
    if (currentMarker) {
      options.unshift({
        label: `$(info) Current: ${currentMarker.type}`,
        description: currentMarker.notes || "Current marker on this file",
        action: "info"
      });
    }
    const selected = await vscode12.window.showQuickPick(options, {
      placeHolder: `Visual Markers - ${fileName}`,
      title: "File Marking Options"
    });
    return selected?.action;
  }
  async executeAction(action, uri) {
    switch (action) {
      case "markRead":
        await this.markersManager.toggleMarker(uri, "read");
        vscode12.window.showInformationMessage("File marked as read");
        break;
      case "markUnread":
        await this.markersManager.toggleMarker(uri, "unread");
        vscode12.window.showInformationMessage("File marked as unread");
        break;
      case "markFavorite":
        await this.markersManager.toggleMarker(uri, "favorite");
        vscode12.window.showInformationMessage("File marked as favorite");
        break;
      case "markImportant":
        await this.markersManager.toggleMarker(uri, "important");
        vscode12.window.showInformationMessage("File marked as important");
        break;
      case "markTodo":
        await this.markersManager.toggleMarker(uri, "todo");
        vscode12.window.showInformationMessage("File marked as todo");
        break;
      case "markCustom":
        await this.handleCustomMarker(uri);
        break;
      case "remove":
        await this.markersManager.removeMarker(uri);
        vscode12.window.showInformationMessage("Marker removed");
        break;
      case "viewAll":
        await this.showAllMarkers();
        break;
      case "info":
        await this.showMarkerInfo(uri);
        break;
    }
  }
  async handleCustomMarker(uri) {
    const notes = await vscode12.window.showInputBox({
      prompt: "Enter notes for this custom marker (optional)",
      placeHolder: "Custom marker notes..."
    });
    const colorOptions = [
      { label: "\u{1F534} Red", value: "charts.red" },
      { label: "\u{1F7E2} Green", value: "charts.green" },
      { label: "\u{1F535} Blue", value: "charts.blue" },
      { label: "\u{1F7E1} Yellow", value: "charts.yellow" },
      { label: "\u{1F7E0} Orange", value: "charts.orange" },
      { label: "\u{1F7E3} Purple", value: "charts.purple" }
    ];
    const selectedColor = await vscode12.window.showQuickPick(colorOptions, {
      placeHolder: "Choose marker color"
    });
    if (selectedColor) {
      await this.markersManager.addMarker(uri, "custom", {
        color: selectedColor.value,
        notes: notes || void 0
      });
      vscode12.window.showInformationMessage("Custom marker added");
    }
  }
  async showAllMarkers() {
    const markers = this.markersManager.getAllMarkers();
    if (markers.length === 0) {
      vscode12.window.showInformationMessage("No markers found");
      return;
    }
    const items = markers.map((marker) => ({
      label: `$(${this.getIconForType(marker.type)}) ${vscode12.workspace.asRelativePath(marker.uri)}`,
      description: `${marker.type} - ${new Date(marker.timestamp).toLocaleDateString()}`,
      detail: marker.notes,
      uri: marker.uri
    }));
    const selected = await vscode12.window.showQuickPick(items, {
      placeHolder: `${markers.length} marked files found`,
      title: "All Visual Markers"
    });
    if (selected) {
      const document = await vscode12.workspace.openTextDocument(selected.uri);
      await vscode12.window.showTextDocument(document);
    }
  }
  async showMarkerInfo(uri) {
    const marker = this.markersManager.getMarker(uri);
    if (!marker) {
      vscode12.window.showInformationMessage("No marker on this file");
      return;
    }
    const fileName = vscode12.workspace.asRelativePath(uri);
    const createdDate = new Date(marker.timestamp).toLocaleString();
    let info = `**File:** ${fileName}
`;
    info += `**Type:** ${marker.type}
`;
    info += `**Created:** ${createdDate}
`;
    if (marker.notes) {
      info += `**Notes:** ${marker.notes}
`;
    }
    if (marker.color) {
      info += `**Color:** ${marker.color}
`;
    }
    const action = await vscode12.window.showInformationMessage(
      info,
      "Open File",
      "Remove Marker",
      "Close"
    );
    switch (action) {
      case "Open File":
        const document = await vscode12.workspace.openTextDocument(uri);
        await vscode12.window.showTextDocument(document);
        break;
      case "Remove Marker":
        await this.markersManager.removeMarker(uri);
        vscode12.window.showInformationMessage("Marker removed");
        break;
    }
  }
  getIconForType(type) {
    const icons = {
      "read": "check",
      "unread": "circle-large-outline",
      "favorite": "star-full",
      "important": "warning",
      "todo": "checklist",
      "custom": "paintcan"
    };
    return icons[type] || "circle-large-filled";
  }
};

// src/utils/logger.ts
var vscode13 = __toESM(require("vscode"));
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["INFO"] = 1] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 3] = "ERROR";
  return LogLevel2;
})(LogLevel || {});
var Logger = class {
  outputChannel;
  logLevel;
  constructor(channelName = "LookAtni File Markers", logLevel = 1 /* INFO */) {
    this.outputChannel = vscode13.window.createOutputChannel(channelName);
    this.logLevel = logLevel;
  }
  debug(message, ...args) {
    this.log(0 /* DEBUG */, "\u{1F50D}", message, ...args);
  }
  info(message, ...args) {
    this.log(1 /* INFO */, "\u2139\uFE0F", message, ...args);
  }
  warn(message, ...args) {
    this.log(2 /* WARN */, "\u26A0\uFE0F", message, ...args);
  }
  error(message, ...args) {
    this.log(3 /* ERROR */, "\u274C", message, ...args);
    if (args.length > 0 && args[0] instanceof Error) {
      vscode13.window.showErrorMessage(`LookAtni: ${message}`);
    }
  }
  success(message, ...args) {
    this.log(1 /* INFO */, "\u2705", message, ...args);
  }
  log(level, icon, message, ...args) {
    if (level < this.logLevel) {
      return;
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const levelName = LogLevel[level];
    let formattedMessage = `[${timestamp}] ${icon} ${levelName}: ${message}`;
    if (args.length > 0) {
      const formattedArgs = args.map((arg) => {
        if (arg instanceof Error) {
          return `
  Error: ${arg.message}
  Stack: ${arg.stack}`;
        } else if (typeof arg === "object") {
          return `
  ${JSON.stringify(arg, null, 2)}`;
        } else {
          return ` ${arg}`;
        }
      }).join("");
      formattedMessage += formattedArgs;
    }
    this.outputChannel.appendLine(formattedMessage);
    if (level >= 2 /* WARN */) {
      this.outputChannel.show(true);
    }
  }
  show() {
    this.outputChannel.show();
  }
  hide() {
    this.outputChannel.hide();
  }
  clear() {
    this.outputChannel.clear();
  }
  dispose() {
    this.outputChannel.dispose();
  }
};

// src/utils/statusBar.ts
var vscode14 = __toESM(require("vscode"));
var LookAtniStatusBar = class {
  statusBarItem;
  hideTimeout;
  constructor() {
    this.statusBarItem = vscode14.window.createStatusBarItem(
      vscode14.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = "lookatni.quickDemo";
    this.statusBarItem.tooltip = "LookAtni File Markers - Click for Quick Demo";
    this.statusBarItem.text = "$(file-code) LookAtni";
    this.statusBarItem.show();
  }
  show(message, duration) {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = void 0;
    }
    if (message) {
      this.statusBarItem.text = `$(loading~spin) ${message}`;
      this.statusBarItem.tooltip = `LookAtni: ${message}`;
    } else {
      this.statusBarItem.text = "$(file-code) LookAtni";
      this.statusBarItem.tooltip = "LookAtni File Markers - Click for Quick Demo";
    }
    this.statusBarItem.show();
    if (duration && duration > 0) {
      this.hideTimeout = setTimeout(() => {
        this.reset();
      }, duration);
    }
  }
  hide() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = void 0;
    }
    this.reset();
  }
  reset() {
    this.statusBarItem.text = "$(file-code) LookAtni";
    this.statusBarItem.tooltip = "LookAtni File Markers - Click for Quick Demo";
    this.statusBarItem.show();
  }
  updateProgress(current, total, operation) {
    const percentage = Math.round(current / total * 100);
    this.statusBarItem.text = `$(loading~spin) ${operation} ${percentage}%`;
    this.statusBarItem.tooltip = `LookAtni: ${operation} (${current}/${total})`;
  }
  showError(message) {
    this.statusBarItem.text = `$(error) LookAtni Error`;
    this.statusBarItem.tooltip = `LookAtni Error: ${message}`;
    this.statusBarItem.show();
    setTimeout(() => {
      this.reset();
    }, 5e3);
  }
  showSuccess(message) {
    this.statusBarItem.text = `$(check) ${message}`;
    this.statusBarItem.tooltip = `LookAtni: ${message}`;
    this.statusBarItem.show();
    setTimeout(() => {
      this.reset();
    }, 3e3);
  }
  dispose() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.statusBarItem.dispose();
  }
};

// src/utils/visualMarkers.ts
var vscode15 = __toESM(require("vscode"));
var fs8 = __toESM(require("fs"));
var path7 = __toESM(require("path"));
var VisualMarkersManager = class {
  constructor(context) {
    this.context = context;
    this.storageUri = vscode15.Uri.joinPath(context.globalStorageUri, "visual-markers.json");
    this.configManager = ConfigurationManager.getInstance();
    this.decorationType = new FileMarkersDecoratorProvider(this, this.configManager);
    this.loadMarkers();
    vscode15.window.registerFileDecorationProvider(this.decorationType);
  }
  markers = /* @__PURE__ */ new Map();
  decorationType;
  storageUri;
  configManager;
  async loadMarkers() {
    try {
      if (await this.fileExists(this.storageUri.fsPath)) {
        const data = await fs8.promises.readFile(this.storageUri.fsPath, "utf8");
        const markersData = JSON.parse(data);
        for (const [key, marker] of Object.entries(markersData)) {
          this.markers.set(key, marker);
        }
      }
    } catch (error) {
      console.error("Error loading visual markers:", error);
    }
  }
  async saveMarkers() {
    try {
      await fs8.promises.mkdir(path7.dirname(this.storageUri.fsPath), { recursive: true });
      const markersData = Object.fromEntries(this.markers);
      await fs8.promises.writeFile(this.storageUri.fsPath, JSON.stringify(markersData, null, 2));
    } catch (error) {
      console.error("Error saving visual markers:", error);
    }
  }
  async fileExists(filePath) {
    try {
      await fs8.promises.access(filePath);
      return true;
    } catch {
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
    } else {
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
    return Array.from(this.markers.values()).filter((marker) => marker.type === type);
  }
  refreshDecorations() {
    vscode15.window.onDidChangeActiveTextEditor(() => {
    });
  }
  async clearAllMarkers() {
    this.markers.clear();
    await this.saveMarkers();
    this.refreshDecorations();
  }
  async exportMarkers() {
    const exportData = {
      version: "1.0.0",
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
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
    } catch (error) {
      throw new Error(`Failed to import markers: ${error}`);
    }
  }
};
var FileMarkersDecoratorProvider = class {
  constructor(markersManager, configManager) {
    this.markersManager = markersManager;
    this.configManager = configManager;
  }
  _onDidChangeFileDecorations = new vscode15.EventEmitter();
  onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
  provideFileDecoration(uri) {
    const marker = this.markersManager.getMarker(uri);
    if (!marker) {
      return void 0;
    }
    const config = this.configManager.getVisualMarkersConfig();
    let badge;
    let color;
    let tooltip;
    switch (marker.type) {
      case "read":
        badge = config.readIcon;
        color = new vscode15.ThemeColor("charts.green");
        tooltip = "Marked as read";
        break;
      case "unread":
        badge = config.unreadIcon;
        color = new vscode15.ThemeColor("charts.blue");
        tooltip = "Marked as unread";
        break;
      case "important":
        badge = config.importantIcon;
        color = new vscode15.ThemeColor("charts.red");
        tooltip = "Marked as important";
        break;
      case "favorite":
        badge = config.favoriteIcon;
        color = new vscode15.ThemeColor("charts.yellow");
        tooltip = "Marked as favorite";
        break;
      case "todo":
        badge = config.todoIcon;
        color = new vscode15.ThemeColor("charts.orange");
        tooltip = "Marked as todo";
        break;
      case "custom":
        badge = marker.icon || config.customIcon;
        color = marker.color ? new vscode15.ThemeColor(marker.color) : new vscode15.ThemeColor("charts.purple");
        tooltip = marker.notes || "Custom marker";
        break;
      default:
        return void 0;
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
    this._onDidChangeFileDecorations.fire(void 0);
  }
};

// src/views/explorerProvider.ts
var vscode16 = __toESM(require("vscode"));
var fs9 = __toESM(require("fs"));
var path8 = __toESM(require("path"));
var LookAtniExplorerProvider = class {
  constructor(context) {
    this.context = context;
  }
  _onDidChangeTreeData = new vscode16.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    } else {
      return Promise.resolve(this.getChildItems(element));
    }
  }
  getRootItems() {
    const items = [];
    items.push(new LookAtniItem(
      "Quick Actions",
      vscode16.TreeItemCollapsibleState.Expanded,
      "section"
    ));
    items.push(new LookAtniItem(
      "Recent Marked Files",
      vscode16.TreeItemCollapsibleState.Collapsed,
      "section"
    ));
    if (vscode16.workspace.workspaceFolders) {
      items.push(new LookAtniItem(
        "Workspace Marked Files",
        vscode16.TreeItemCollapsibleState.Collapsed,
        "section"
      ));
    }
    return items;
  }
  getChildItems(element) {
    switch (element.label) {
      case "Quick Actions":
        return this.getQuickActions();
      case "Recent Marked Files":
        return this.getRecentFiles();
      case "Workspace Marked Files":
        return this.getWorkspaceFiles();
      default:
        return [];
    }
  }
  getQuickActions() {
    return [
      new LookAtniItem(
        "Extract Files",
        vscode16.TreeItemCollapsibleState.None,
        "action",
        "lookatni-file-markers.extractFiles",
        "$(file-zip) Extract files from marked content"
      ),
      new LookAtniItem(
        "Generate Markers",
        vscode16.TreeItemCollapsibleState.None,
        "action",
        "lookatni-file-markers.generateMarkers",
        "$(file-code) Create marked file from project"
      ),
      new LookAtniItem(
        "Validate Markers",
        vscode16.TreeItemCollapsibleState.None,
        "action",
        "lookatni-file-markers.validateMarkers",
        "$(check) Validate marked file structure"
      ),
      new LookAtniItem(
        "Quick Demo",
        vscode16.TreeItemCollapsibleState.None,
        "action",
        "lookatni-file-markers.quickDemo",
        "$(play) Run interactive demonstration"
      ),
      new LookAtniItem(
        "Show Statistics",
        vscode16.TreeItemCollapsibleState.None,
        "action",
        "lookatni-file-markers.showStatistics",
        "$(graph) View file statistics"
      ),
      new LookAtniItem(
        "Open CLI Tools",
        vscode16.TreeItemCollapsibleState.None,
        "action",
        "lookatni-file-markers.openCLI",
        "$(terminal) Access command-line tools"
      )
    ];
  }
  getRecentFiles() {
    const recentFiles = this.context.globalState.get("recentMarkedFiles", []);
    if (recentFiles.length === 0) {
      return [new LookAtniItem(
        "No recent files",
        vscode16.TreeItemCollapsibleState.None,
        "info",
        void 0,
        "Generate or open marked files to see them here"
      )];
    }
    return recentFiles.filter((file) => fs9.existsSync(file)).slice(0, 10).map((file) => {
      const stats = fs9.statSync(file);
      const item = new LookAtniItem(
        path8.basename(file),
        vscode16.TreeItemCollapsibleState.None,
        "file",
        void 0,
        `${file} - Modified: ${stats.mtime.toLocaleDateString()}`
      );
      item.resourceUri = vscode16.Uri.file(file);
      item.contextValue = "markedFile";
      item.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [vscode16.Uri.file(file)]
      };
      return item;
    });
  }
  getWorkspaceFiles() {
    if (!vscode16.workspace.workspaceFolders) {
      return [];
    }
    const workspaceRoot = vscode16.workspace.workspaceFolders[0].uri.fsPath;
    const markedFiles = this.findMarkedFiles(workspaceRoot);
    if (markedFiles.length === 0) {
      return [new LookAtniItem(
        "No marked files found",
        vscode16.TreeItemCollapsibleState.None,
        "info",
        void 0,
        "Generate marked files to see them here"
      )];
    }
    return markedFiles.map((file) => {
      const relativePath = path8.relative(workspaceRoot, file);
      const stats = fs9.statSync(file);
      const item = new LookAtniItem(
        relativePath,
        vscode16.TreeItemCollapsibleState.None,
        "file",
        void 0,
        `${file} - Size: ${this.formatBytes(stats.size)}`
      );
      item.resourceUri = vscode16.Uri.file(file);
      item.contextValue = "markedFile";
      item.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [vscode16.Uri.file(file)]
      };
      return item;
    });
  }
  findMarkedFiles(dir) {
    const markedFiles = [];
    try {
      const entries = fs9.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path8.join(dir, entry.name);
        if (entry.isDirectory() && !["node_modules", ".git", ".vscode", "build", "dist"].includes(entry.name)) {
          markedFiles.push(...this.findMarkedFiles(fullPath));
        } else if (entry.isFile() && this.isMarkedFile(fullPath)) {
          markedFiles.push(fullPath);
        }
      }
    } catch (error) {
    }
    return markedFiles;
  }
  isMarkedFile(filePath) {
    const ext = path8.extname(filePath).toLowerCase();
    if (![".txt", ".md"].includes(ext)) {
      return false;
    }
    try {
      const content = fs9.readFileSync(filePath, "utf-8");
      return /\/\/m\/ .+ \/m\/\//.test(content);
    } catch {
      return false;
    }
  }
  formatBytes(bytes) {
    if (bytes === 0) {
      return "0 B";
    }
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
  addRecentFile(filePath) {
    const recentFiles = this.context.globalState.get("recentMarkedFiles", []);
    const filtered = recentFiles.filter((f) => f !== filePath);
    filtered.unshift(filePath);
    const updated = filtered.slice(0, 20);
    this.context.globalState.update("recentMarkedFiles", updated);
    this.refresh();
  }
};
var LookAtniItem = class extends vscode16.TreeItem {
  constructor(label, collapsibleState, itemType, commandId, description) {
    super(label, collapsibleState);
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.itemType = itemType;
    this.commandId = commandId;
    this.description = description;
    this.tooltip = description || label;
    this.description = description;
    switch (itemType) {
      case "section":
        this.iconPath = new vscode16.ThemeIcon("folder");
        break;
      case "action":
        this.iconPath = new vscode16.ThemeIcon("play");
        if (commandId) {
          this.command = {
            command: commandId,
            title: label
          };
        }
        break;
      case "file":
        this.iconPath = new vscode16.ThemeIcon("file-text");
        break;
      case "info":
        this.iconPath = new vscode16.ThemeIcon("info");
        break;
    }
  }
};

// src/extension.ts
function activate(context) {
  const logger = new Logger();
  const outputChannel = vscode17.window.createOutputChannel("LookAtni File Markers");
  logger.info("\u{1F680} LookAtni File Markers is activating...");
  const statusBar = new LookAtniStatusBar();
  context.subscriptions.push(statusBar);
  const visualMarkersManager = new VisualMarkersManager(context);
  const explorerProvider = new LookAtniExplorerProvider(context);
  vscode17.window.registerTreeDataProvider("lookatniExplorer", explorerProvider);
  const quickMarkers = new QuickMarkersCommands(context, logger, visualMarkersManager);
  const configCommand = new ConfigurationCommand(context, logger, outputChannel);
  const commands10 = [
    new ExtractFilesCommand(context, logger, outputChannel),
    new GenerateMarkersCommand(context, logger, outputChannel),
    new ValidateMarkersCommand(context, logger, outputChannel),
    new QuickDemoCommand(context, logger, outputChannel),
    new ShowStatisticsCommand(context, logger, outputChannel),
    new OpenCLICommand(context, logger, outputChannel),
    new VisualMarkersCommand(context, logger, outputChannel, visualMarkersManager),
    configCommand
  ];
  commands10.forEach((command) => {
    const disposable = vscode17.commands.registerCommand(command.commandId, (...args) => {
      try {
        statusBar.show("Running command...");
        return command.execute(...args);
      } catch (error) {
        logger.error(`Error executing command ${command.commandId}:`, error);
        vscode17.window.showErrorMessage(`LookAtni: ${error}`);
      } finally {
        statusBar.hide();
      }
    });
    context.subscriptions.push(disposable);
    logger.info(`\u2705 Registered command: ${command.commandId}`);
  });
  const quickMarkersCommands = [
    { id: "lookatni.markAsRead", handler: quickMarkers.markAsRead.bind(quickMarkers) },
    { id: "lookatni.markAsFavorite", handler: quickMarkers.markAsFavorite.bind(quickMarkers) },
    { id: "lookatni.markAsImportant", handler: quickMarkers.markAsImportant.bind(quickMarkers) },
    { id: "lookatni.showMarkersOverview", handler: quickMarkers.showMarkersOverview.bind(quickMarkers) },
    { id: "lookatni.clearAllMarkers", handler: quickMarkers.clearAllMarkers.bind(quickMarkers) },
    { id: "lookatni.exportMarkers", handler: quickMarkers.exportMarkers.bind(quickMarkers) },
    { id: "lookatni.importMarkers", handler: quickMarkers.importMarkers.bind(quickMarkers) }
  ];
  quickMarkersCommands.forEach(({ id, handler }) => {
    const disposable = vscode17.commands.registerCommand(id, handler);
    context.subscriptions.push(disposable);
    logger.info(`\u2705 Registered quick command: ${id}`);
  });
  const refreshCommand = vscode17.commands.registerCommand("lookatniExplorer.refresh", () => {
    explorerProvider.refresh();
  });
  context.subscriptions.push(refreshCommand);
  showWelcomeMessage(context);
  configCommand.validateConfigurationOnStartup();
  registerAutomatedDemoCommand(context);
  const recordingGuideCommand = vscode17.commands.registerCommand(
    "lookatni.recordingGuide",
    DemoRecordingGuide.showRecordingGuide
  );
  context.subscriptions.push(recordingGuideCommand);
  logger.info("\u2705 Registered recording guide command");
  logger.info("\u{1F389} LookAtni File Markers activated successfully!");
  statusBar.show("Ready", 3e3);
}
function deactivate() {
}
async function showWelcomeMessage(context) {
  const config = vscode17.workspace.getConfiguration("lookatni");
  const hasShownWelcome = context.globalState.get("hasShownWelcome", false);
  if (!hasShownWelcome) {
    const result = await vscode17.window.showInformationMessage(
      "\u{1F680} Welcome to LookAtni File Markers! Organize your code workflow with unique markers.",
      "Quick Demo",
      "Open Documentation",
      "Dismiss"
    );
    switch (result) {
      case "Quick Demo":
        vscode17.commands.executeCommand("lookatni-file-markers.quickDemo");
        break;
      case "Open Documentation":
        vscode17.env.openExternal(vscode17.Uri.parse("https://github.com/kubex-ecosystem/lookatni-file-markers"));
        break;
    }
    context.globalState.update("hasShownWelcome", true);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
