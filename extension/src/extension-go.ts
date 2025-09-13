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
  statusBar.tooltip = "LookAtni File Markers v2.0 - Go Edition";
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
      vscode.window.showWarningMessage('LookAtni: Go binary not found in extension directory.');
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

    const result = await response.json() as APIResponse;

    if (result.success) {
      const count = result.data?.extractedFiles?.length || 0;
      vscode.window.showInformationMessage(`✅ Extracted ${count} files`);
    } else {
      vscode.window.showErrorMessage(`❌ Extraction failed: ${result.error}`);
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

    const result = await response.json() as APIResponse;

    if (result.success) {
      if (result.data?.isValid) {
        vscode.window.showInformationMessage('✅ All markers are valid!');
      } else {
        const errors = result.data?.errors?.length || 0;
        const duplicates = result.data?.duplicateFilenames?.length || 0;
        vscode.window.showWarningMessage(
          `⚠️ Validation issues: ${errors} errors, ${duplicates} duplicates`
        );
      }
    } else {
      vscode.window.showErrorMessage(`❌ Validation failed: ${result.error}`);
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
    await vscode.window.withProgress({
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

      const result = await response.json() as APIResponse;

      if (result.success) {
        vscode.window.showInformationMessage('✅ Markdown transpilation completed!');

        // Offer to open the output directory
        const openResult = await vscode.window.showInformationMessage(
          'Open output directory?',
          'Yes',
          'No'
        );

        if (openResult === 'Yes') {
          const outputUri = vscode.Uri.file(path.resolve(workspaceFolder.uri.fsPath, outputDir));
          await vscode.env.openExternal(outputUri);
        }
      } else {
        vscode.window.showErrorMessage(`❌ Transpilation failed: ${result.error}`);
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
                .info { background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
            </style>
        </head>
        <body>
            <div class="preview-container">
                <div class="info">
                    <h2>🔄 LookAtni Preview</h2>
                    <p><strong>File:</strong> ${path.basename(uri.fsPath)}</p>
                    <p><strong>Status:</strong> Real-time preview coming soon...</p>
                    <p>Use the <strong>Transpile Markdown</strong> command to generate HTML files.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function showVersion() {
  const message = `LookAtni File Markers v2.0

🚀 Go-powered backend eliminates NPM dependency
🔌 Native VS Code integration
📄 Markdown → HTML transpilation with prompt blocks
🏗️ DSL support for interactive components
⚡ High performance, single binary deployment

Available Commands:
• Extract Files - Extract marked content to files
• Validate Markers - Check marker integrity
• Transpile Markdown - Convert MD to interactive HTML
• Preview Markdown - Real-time preview (coming soon)
    `;

  vscode.window.showInformationMessage(message, { modal: true });
}
