import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

let lookatniServer: ChildProcess | null = null;
const SERVER_PORT = 8080;

export function activate(context: vscode.ExtensionContext) {
  console.log('🚀 LookAtni File Markers v2.0 activating...');

  // Start Go server
  startLookatniServer(context);

  // Register commands
  const commands = [
    vscode.commands.registerCommand('lookatni.extractFiles', () => extractFiles()),
    vscode.commands.registerCommand('lookatni.validateMarkers', () => validateMarkers()),
    vscode.commands.registerCommand('lookatni.transpileMarkdown', () => transpileMarkdown()),
    vscode.commands.registerCommand('lookatni.previewMarkdown', (uri) => previewMarkdown(uri)),
    vscode.commands.registerCommand('lookatni.showVersion', () => showVersion())
  ];

  context.subscriptions.push(...commands);

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = "$(file-code) LookAtni";
  statusBar.tooltip = "LookAtni File Markers v2.0";
  statusBar.command = 'lookatni.showVersion';
  statusBar.show();
  context.subscriptions.push(statusBar);

  console.log('✅ LookAtni File Markers v2.0 activated!');
}

export function deactivate() {
  if (lookatniServer) {
    lookatniServer.kill();
    lookatniServer = null;
  }
}

function startLookatniServer(context: vscode.ExtensionContext) {
  try {
    // Find the Go binary
    const goPath = findGoBinary(context);
    if (!goPath) {
      vscode.window.showWarningMessage('LookAtni: Go binary not found. Please install Go or set PATH.');
      return;
    }

    console.log('🔌 Starting LookAtni Go server...');

    lookatniServer = spawn(goPath, ['--vscode', '--port', SERVER_PORT.toString()], {
      cwd: context.extensionPath,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    lookatniServer.stdout?.on('data', (data) => {
      console.log(`LookAtni Server: ${data}`);
    });

    lookatniServer.stderr?.on('data', (data) => {
      console.error(`LookAtni Server Error: ${data}`);
    });

    lookatniServer.on('close', (code) => {
      console.log(`LookAtni Server exited with code ${code}`);
      lookatniServer = null;
    });

    // Wait a moment for server to start
    setTimeout(() => {
      checkServerHealth();
    }, 2000);

  } catch (error) {
    console.error('Failed to start LookAtni server:', error);
    vscode.window.showErrorMessage(`LookAtni: Failed to start server: ${error}`);
  }
}

function findGoBinary(context: vscode.ExtensionContext): string | null {
  // Try to find lookatni binary in extension directory
  const binaryPaths = [
    path.join(context.extensionPath, 'dist', 'lookatni'),
    path.join(context.extensionPath, 'dist', 'lookatni.exe'),
    path.join(context.extensionPath, 'bin', 'lookatni'),
    path.join(context.extensionPath, 'bin', 'lookatni.exe')
  ];

  for (const binPath of binaryPaths) {
    try {
      if (require('fs').existsSync(binPath)) {
        return binPath;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

async function checkServerHealth() {
  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/health`);
    if (response.ok) {
      console.log('✅ LookAtni server is healthy');
      vscode.window.showInformationMessage('LookAtni: Server started successfully!');
    }
  } catch (error) {
    console.error('❌ LookAtni server health check failed:', error);
    vscode.window.showWarningMessage('LookAtni: Server may not be running properly.');
  }
}

async function extractFiles() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showWarningMessage('Please open a file with markers first.');
    return;
  }

  const outputDir = await vscode.window.showInputBox({
    prompt: 'Enter output directory',
    value: './output'
  });

  if (!outputDir) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markedFile: activeEditor.document.fileName,
        outputDir: outputDir,
        options: {
          overwrite: true,
          createDirs: true,
          dryRun: false
        }
      })
    });

    const result: { success: boolean; data?: any; error?: string } | unknown = await response.json();

    if (result && typeof result === 'object' && 'success' in result) {
      const rObj: { data: { extractedFiles: string[] } } | Record<string, any> = result;
      if (result.success) {
        vscode.window.showInformationMessage(
          `✅ Extracted ${rObj.data.extractedFiles.length} files`
        );
      } else {
        vscode.window.showErrorMessage(`❌ Extraction failed: ${rObj.error}`);
      }
    } else {
      vscode.window.showErrorMessage('❌ Invalid response from server');
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Failed to extract files: ${error}`);
  }
}

async function validateMarkers() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showWarningMessage('Please open a file with markers first.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markedFile: activeEditor.document.fileName
      })
    });

    const result: { success: boolean; data?: any; error?: string } | unknown = await response.json();

    if (result && typeof result === 'object' && 'success' in result) {
      const rObj: { data: { extractedFiles: string[] } } | Record<string, any> = result;

      if (rObj.success) {
        if (rObj.data.isValid) {
          vscode.window.showInformationMessage('✅ All markers are valid!');
        } else {
          const errors = rObj.data.errors.length;
          const duplicates = rObj.data.duplicateFilenames.length;
          vscode.window.showWarningMessage(
            `⚠️ Validation issues: ${errors} errors, ${duplicates} duplicates`
          );
        }
      } else {
        vscode.window.showErrorMessage(`❌ Validation failed: ${rObj.error}`);
      }
    } else {
      vscode.window.showErrorMessage('❌ Invalid response from server');
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Failed to validate markers: ${error}`);
  }
}

async function transpileMarkdown() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage('Please open a workspace first.');
    return;
  }

  const inputDir = await vscode.window.showInputBox({
    prompt: 'Enter input directory (containing .md files)',
    value: './tests'
  });

  const outputDir = await vscode.window.showInputBox({
    prompt: 'Enter output directory',
    value: './output/interviews'
  });

  if (!inputDir || !outputDir) {
    return;
  }

  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Transpiling Markdown files...',
      cancellable: false
    }, async () => {
      const response = await fetch(`http://localhost:${SERVER_PORT}/api/transpile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: path.resolve(workspaceFolder.uri.fsPath, inputDir),
          outputDir: path.resolve(workspaceFolder.uri.fsPath, outputDir)
        })
      });

      const result: { success: boolean; data?: any; error?: string } | unknown = await response.json();

      if (result && typeof result === 'object' && 'success' in result) {
        const rObj: { data: { extractedFiles: string[] } } | Record<string, any> = result;
        if (rObj.success) {
          vscode.window.showInformationMessage('✅ Markdown transpilation completed!');

          // Offer to open the output directory
          const openResult = await vscode.window.showInformationMessage(
            'Open output directory?',
            'Yes',
            'No'
          );

          if (openResult === 'Yes') {
            const outputUri = vscode.Uri.file(path.resolve(workspaceFolder.uri.fsPath, outputDir));
            vscode.commands.executeCommand('vscode.openFolder', outputUri, { forceNewWindow: true });
          }
        } else {
          vscode.window.showErrorMessage(`❌ Transpilation failed: ${rObj.error}`);
        }
      } else {
        vscode.window.showErrorMessage(`❌ Invalid response from server`);
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Failed to transpile: ${error}`);
  }
}

async function previewMarkdown(uri?: vscode.Uri) {
  if (!uri && vscode.window.activeTextEditor) {
    uri = vscode.window.activeTextEditor.document.uri;
  }

  if (!uri || !uri.fsPath.endsWith('.md')) {
    vscode.window.showWarningMessage('Please select a Markdown file to preview.');
    return;
  }

  // Create a webview to preview the transpiled content
  const panel = vscode.window.createWebviewPanel(
    'lookatniPreview',
    `LookAtni Preview: ${path.basename(uri.fsPath)}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [vscode.workspace.workspaceFolders![0].uri]
    }
  );

  // TODO: Implement real-time transpilation and preview
  panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LookAtni Preview</title>
            <style>
                body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.6; }
                .preview-container { max-width: 900px; margin: 0 auto; }
                .loading { text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="preview-container">
                <div class="loading">
                    <h2>🔄 LookAtni Preview</h2>
                    <p>Real-time Markdown preview coming soon...</p>
                    <p>File: ${path.basename(uri.fsPath)}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function showVersion() {
  const message = `
LookAtni File Markers v2.0

🚀 Go-powered backend
🔌 VS Code integration
📄 Markdown → HTML transpilation
🏗️ Prompt block DSL support

Commands:
• Extract Files
• Validate Markers
• Transpile Markdown
• Preview Markdown
    `;

  vscode.window.showInformationMessage(message, { modal: true });
}
