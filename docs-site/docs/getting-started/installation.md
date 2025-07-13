# 📦 Installation Guide

Get LookAtni File Markers up and running in your VS Code environment.

## VS Code Extension

### From VS Code Marketplace

1. **Open VS Code**
2. **Go to Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. **Search** for "LookAtni File Markers"
4. **Click Install** on the official extension by Rafa Mori
5. **Reload VS Code** when prompted

### From VSIX File

If you have a `.vsix` file:

1. **Open VS Code**
2. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. **Type** `Extensions: Install from VSIX...`
4. **Select** the `.vsix` file
5. **Restart VS Code**

### Verify Installation

After installation, verify everything works:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type** "LookAtni" - you should see all available commands
3. **Try** `LookAtni: Quick Demo` to test the extension

## System Requirements

### Minimum Requirements

- **VS Code**: Version 1.102.0 or higher
- **Node.js**: Version 18.0 or higher (for CLI tools)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

### Recommended Setup

- **VS Code**: Latest stable version
- **Node.js**: Latest LTS version
- **Package Manager**: npm 9.0+ or pnpm 8.0+
- **Memory**: 4GB+ RAM for large projects

## CLI Tools Installation

For advanced users who want to use LookAtni CLI tools:

### Prerequisites

```bash
# Ensure Node.js and npm are installed
node --version  # Should be 18.0+
npm --version   # Should be 9.0+
```

### Install TSX Runner

```bash
# Install tsx globally for TypeScript execution
npm install -g tsx

# Verify installation
tsx --version
```

### Clone Repository (Optional)

For development or advanced CLI usage:

```bash
# Clone the repository
git clone https://github.com/rafa-mori/lookatni-file-markers.git
cd lookatni-file-markers

# Install dependencies
npm install

# Test CLI tools
npm run lookatni help
```

## Configuration

### Default Settings

LookAtni works out of the box with sensible defaults:

```json
{
  "lookatni.defaultMaxFileSize": 1000,
  "lookatni.showStatistics": true,
  "lookatni.autoValidate": false,
  "lookatni.excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build"
  ]
}
```

### Workspace Configuration

Create `.vscode/settings.json` in your workspace:

```json
{
  "lookatni.defaultMaxFileSize": 500,
  "lookatni.showStatistics": true,
  "lookatni.autoValidate": true,
  "lookatni.excludePatterns": [
    "node_modules",
    ".git",
    "*.log",
    "coverage"
  ]
}
```

## Troubleshooting

### Common Issues

#### Extension Not Loading

1. **Check VS Code version** - must be 1.102.0+
2. **Restart VS Code** completely
3. **Check extension logs** in Output panel
4. **Reinstall extension** if necessary

#### Commands Not Found

1. **Reload VS Code window** (`Ctrl+Shift+P` → "Reload Window")
2. **Check for extension conflicts**
3. **Verify installation** in Extensions panel

#### CLI Tools Not Working

1. **Install tsx globally**: `npm install -g tsx`
2. **Check Node.js version**: `node --version`
3. **Verify PATH** includes npm global binaries

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/rafa-mori/lookatni-file-markers/issues)
- **Discussions**: [Ask questions](https://github.com/rafa-mori/lookatni-file-markers/discussions)
- **Documentation**: [Browse guides](../guide/commands.md)

## Next Steps

Once installed, head to the [Quick Start Guide](quick-start.md) to begin using LookAtni File Markers!

---

!!! success "🎉 Installation Complete!"
    
    You're ready to revolutionize your code organization workflow with LookAtni File Markers!
