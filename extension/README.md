# ![LookAtni File Markers](https://raw.githubusercontent.com/kubex-ecosystem/lookatni-file-markers/refs/heads/main/resources/top_banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![VSCode](https://img.shields.io/badge/VSCode-Marketplace-blue?style=flat-square&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)
[![NPM](https://img.shields.io/badge/NPM-Package-orange?style=flat-square&logo=npm)](https://www.npmjs.com/package/lookatni-file-markers)
[![AI Code Extraction](https://img.shields.io/badge/AI%20Code-Extraction-purple?style=flat-square&logo=openai)](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)
[![Marker Generation](https://img.shields.io/badge/Marker-Generation-yellow?style=flat-square&logo=marker)](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)
[![Visual File Organization](https://img.shields.io/badge/Visual%20File-Organization-4caf50?style=flat-square&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)

---

## 🚀 **LookAtni File Markers**

The **first VS Code extension** that combines **AI code extraction** and **visual file organization** to enhance your development workflow!
> A powerful tool designed to enhance your coding experience by allowing you to manage files and code snippets efficiently. It provides a seamless way to extract AI-generated code into structured projects, organize files visually, and validate project integrity.

### Modes at a Glance
- VS Code Extension: Visual markers, commands, UI.
- CLI: Global or local command-line tooling for automation.
- Node Library: Programmatic API via `lookatni-core` (also re-exported at `lookatni-file-markers/lib`).

## Table of Contents

- [🏆 The Golden Tip: AI-Generated Code Made Easy](#-the-golden-tip-ai-generated-code-made-easy)
- [🎯 What is LookAtni File Markers?](#-what-is-lookatni-file-markers)
- [⚖️ Feature Comparison](#️-feature-comparison)
- [✨ Features](#-features)
- [📦 Installation Options](#-installation-options)
  - [Global CLI Tool](#-global-cli-tool)
  - [VS Code Marketplace](#-vs-code-extension)

- [🚀 Quick Start](#-quick-start)
  - [Installation](#installation)
  - [AI Code Extraction (The Golden Feature!)](#-ai-code-extraction-the-golden-feature)
  - [Traditional Project Management](#-traditional-project-management)
- [🏷️ Marker Format](#️-marker-format)
- [📋 Commands](#-commands)
  - [Code Extraction & Generation](#-code-extraction--generation)
  - [Visual File Organization](#-visual-file-organization)
- [⚙️ Configuration](#️-configuration)
- [🎥 See It In Action](#-see-it-in-action)
- [🤝 Community](#-community)
- [📄 License](#-license)
- [🔗 Links](#-links)

---

## 🏆 The Golden Tip: AI-Generated Code Made Easy

**The Problem:** AI generates amazing code in single files, but extracting them into proper project structures is tedious and error-prone.\
**The Challenge:** How to extract AI-generated code into real projects without losing structure or introducing errors?\
**The Solution:** LookAtni File Markers! Generate entire projects in one document, then **extract them automatically** into perfect file structures.

## 🎯 What is LookAtni File Markers?

**LookAtni File Markers** is built to work both as a standalone CLI tool and as a VS Code extension, making it versatile for different development environments.\
It's the first tool that combines:

🤖 **AI Code Extraction** (Innovative)

- **ChatGPT/Claude generated projects**, extract to real file structure
- **Code sharing**, send entire projects in one document
- **Documentation**, include full project examples
- **Tutorials**, package complete workflows
- **Code reviews**, share code snippets with context

🎨 **Visual File Organization** (Enhanced)

- **Mark files as read/unread** directly in VS Code Explorer
- **Favorite important files** with star indicators
- **Flag urgent items** with warning badges
- **Create custom markers** with personal notes
- **Track project status** visually

## ⚖️ Feature Comparison

| Feature                                    | File Read Marker | Mark Files | Code Organizers | **LookAtNi – File Markers** |
| ------------------------------------------ | :--------------: | :--------: | :-------------: | :-------------------------: |
| **Visual read/unread**                     |         ✅        |      ❌     |        ❌        |              ✅              |
| **Favorite/star files**                    |         ❌        |      ✅     |        ❌        |              ✅              |
| **Flag urgent items**                      |         ❌        |      ✅     |        ❌        |              ✅              |
| **Add custom notes to markers**            |         ❌        |      ✅     |        ❌        |              ✅              |
| **Extract AI‑generated blocks into files** |         ❌        |      ❌     |        ❌        |              ✅              |
| **Generate markers from project content**  |         ❌        |      ❌     |        ✅        |              ✅              |
| **Validate marker structure**              |         ❌        |      ❌     |        ❌        |              ✅              |
| **Interactive demo and stats**             |         ❌        |      ❌     |        ❌        |              ✅              |
| **CLI & CI/CD integration**                |         ❌        |      ❌     |        ❌        |              ✅              |

**🎯 The Game Changer:** Only LookAtni solves the **AI code extraction challenge** while providing complete visual file management!

## ✨ Features

### 🎨 **Visual File Markers**

- **Quick marking**: Right-click any file → instant visual markers
- **Smart indicators**: ✓ Read, ★ Favorite, ❗ Important, 📋 Todo, 🎨 Custom
- **Explorer integration**: See all markers directly in VS Code Explorer
- **Custom notes**: Add personal notes to any marker
- **Bulk operations**: Export/import marker sets
- **Status tracking**: Visual overview of your project state

### 🔄 **File Extraction**

- Extract complete project structures from marked content
- Preserves directory hierarchy automatically
- Interactive conflict resolution
- Dry-run mode for safe testing

### 🏷️ **Marker Generation**

- Generate marked files from existing projects
- Smart binary file detection and exclusion
- Configurable file size limits
- Flexible exclusion patterns

### ✔️ **Validation & Analysis**

- Comprehensive marker validation
- Duplicate filename detection
- Invalid character checking
- Detailed statistics and reporting

### 🎯 **Interactive Demo**

- Built-in demonstration system
- Sample project generation
- Step-by-step walkthrough
- Real-time feedback

### 📊 **Statistics & Reporting**

- File type distribution analysis
- Size optimization metrics
- Performance benchmarks
- Comprehensive logging

### 🔧 **CLI Integration**

- Standalone command-line tools
- Batch processing capabilities
- CI/CD pipeline integration
- Cross-platform compatibility

## 📦 Installation Options

### 🎯 Global CLI Tool

```bash
# Install globally for command-line usage anywhere
npm install -g lookatni-file-markers

# Use from any directory
lookatni extract mycode.txt ./project
lookatni generate ./src output.txt
lookatni --help
```

### 🎨 VS Code Extension

Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers) or search for "LookAtni File Markers" in VS Code Extensions.

```bash
ext install rafa-mori.lookatni-file-markers
```

### 🧰 Node.js Library (via this package)

- For convenience, this package re-exports the core Node API under the `lib` subpath.
- Ideal when you already depend on the extension/CLI and want programmatic access too.

```ts
// Re-exported helpers (proxy to lookatni-core)
import { 
  parseMarkers, parseMarkersFromFile,
  generateMarkers,
  validateMarkers, validateMarkerFile
} from 'lookatni-file-markers/lib';

const result = parseMarkers(markersText);
console.log(result.totalFiles, result.markers[0].filename);
```

For direct library usage (recommended for pure Node projects), depend on `lookatni-core`:

```bash
npm install lookatni-core
```

```ts
import { createExtractor } from 'lookatni-core';
const extractor = createExtractor();
const parsed = extractor.parse(markersText);
```

## 🚀 Quick Start

### Installation

1. Install from VS Code Marketplace: `LookAtni File Markers`
2. Press `Ctrl+Shift+P` and search for "LookAtni"
3. Try `LookAtni: Quick Demo` to see it in action!

### 🤖 AI Code Extraction (The Golden Feature!)

1. **Get AI-generated code with markers:**
   - Ask ChatGPT/Claude: *"Generate a React project with invisible file markers"*
   - Copy the response (includes invisible markers)
   - Paste into a `.txt` file in VS Code

2. **Extract to perfect project structure:**
   - Right-click the file → `LookAtni: Extract Files`
   - Choose destination folder
   - **BOOM!** Complete project structure created automatically

3. **Validate everything works:**
   - Use `LookAtni: Validate Markers` to check integrity
   - Get detailed reports on any issues

### 📁 Traditional Project Management

1. **Generate markers from existing project:**
   - Right-click on a folder → `LookAtni: Generate Markers`
   - Choose output file and options
   - Get a marked file with your entire project

2. **Share projects easily:**
   - Send the marked file to anyone
   - They can extract the complete project structure instantly

## 🏷️ Marker Format

LookAtni uses **invisible File Separator characters (ASCII 28)** for conflict-free marking:

```typescript
// The actual markers use invisible characters (shown as  for demonstration)
/// relative/path/to/file.ext ///

// In real use, these characters are completely invisible:
// - They don't appear in your editor
// - They don't interfere with syntax highlighting
// - They work in any programming language
// - Zero visual impact on your content
```

**Why invisible markers?**

- ✅ **Truly invisible**: No visual clutter in your content
- ✅ **Universal**: Works with any programming language or file type
- ✅ **Conflict-free**: Impossible to accidentally include in real code
- ✅ **Parseable**: Simple and reliable detection
- ✅ **Professional**: Clean, seamless integration

## 📋 Commands

### 🔄 **Code Extraction & Generation**

| Command | Shortcut | Description |
|---------|----------|-------------|
| `LookAtni: Extract Files` | `Ctrl+Shift+L E` | Extract files from marked content |
| `LookAtni: Generate Markers` | `Ctrl+Shift+L G` | Create marked file from project |
| `LookAtni: Validate Markers` | - | Validate marked file structure |
| `LookAtni: Quick Demo` | `Ctrl+Shift+L D` | Run interactive demonstration |
| `LookAtni: Show Statistics` | - | Display file statistics |
| `LookAtni: Open CLI Tools` | - | Access command-line tools |

### 🎨 **Visual File Organization**

| Command | Shortcut | Description |
|---------|----------|-------------|
| `LookAtni: Visual Markers` | - | Full marker management menu |
| `LookAtni: Mark as Read` | - | Quick mark file as read ✓ |
| `LookAtni: Mark as Favorite` | - | Quick mark file as favorite ★ |
| `LookAtni: Mark as Important` | - | Quick mark file as important ❗ |
| `LookAtni: Markers Overview` | - | View all marked files |
| `LookAtni: Export Markers` | - | Export markers to JSON |
| `LookAtni: Import Markers` | - | Import markers from JSON |
| `LookAtni: Open CLI Tools` | - | Access command-line tools |

## ⚙️ Configuration

Customize visual markers in your `settings.json`:

```json
{
  "lookatni.visualMarkers.readIcon": "✅",
  "lookatni.visualMarkers.favoriteIcon": "⭐",
  "lookatni.visualMarkers.importantIcon": "🔥",
  "lookatni.visualMarkers.todoIcon": "📝",
  "lookatni.visualMarkers.showInStatusBar": true,
  "lookatni.visualMarkers.autoSave": true
}
```

**Available Icons**: ✓, ●, ★, !, ○, ◆, 🔥, 📝, ⭐, ✅, 📋, 🎯, 🚀, and more!

## 🎥 See It In Action

![![LookAtni File Markers Demo](docs/demo/demo_md.gif)](docs/demo/demo_md.gif)

## 🤝 Community

**Love LookAtni File Markers?**

- ⭐ **Rate us** on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)!
- 💡 **Got ideas?** [Open an issue](https://github.com/kubex-ecosystem/lookatni-file-markers/issues) or submit a PR 😉
- 🐛 **Found a bug?** Let us know and we'll fix it fast!
- 💬 **Share your workflow** - we'd love to see how you use LookAtni!

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/kubex-ecosystem/lookatni-file-markers)
- **License**: [MIT](LICENSE)
- **Documentation**: [Docs](https://rafa-mori.github.io/lookatni-file-markers/)
- **Issues**: [Report Issues](https://github.com/kubex-ecosystem/lookatni-file-markers/issues)
- **Contribute**: [Contributing Guide](https://github.com/kubex-ecosystem/lookatni-file-markers/blob/main/CONTRIBUTING.md)
- **VS Code Extension**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)
- **Author**: [Rafael Mori](https://rafa-mori.dev)
- **LinkedIn**: [Rafael Mori](https://www.linkedin.com/in/kubex-ecosystem/)
- **Twitter**: [@faelmori](https://twitter.com/faelOmori)
- **GitHub**: [@rafa-mori](https://github.com/kubex-ecosystem)
- **GitHub**: [@faelmori](https://github.com/faelmori)

---

***Made with ❤️ for the developer community***

*Transform your code workflow with LookAtni File Markers!*
