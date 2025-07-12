# ![LookAtni File Markers](https://raw.githubusercontent.com/rafa-mori/lookatni-file-markers/refs/heads/main/resources/top_banner.png)

🚀 **Advanced file marker system for automatic code extraction and visual file organization**

Transform how you deliver, organize and track code with invisible markers AND visual file indicators that never conflict with existing syntax.

## 🎯 What is LookAtni File Markers?

LookAtni File Markers combines **two powerful marking systems**:

### 📄 **Code Extraction Markers** (Invisible)

```typescript
// Uses invisible File Separator characters (ASCII 28)
// Markers are practically invisible but extremely effective
console.log('This content belongs to a specific file');

// Multiple files can be organized in a single document
// Each file is delimited by unique invisible markers
```

### 🎨 **Visual File Markers** (Explorer Integration)

- **Mark files as read/unread** directly in VS Code Explorer
- **Favorite important files** with star indicators
- **Flag urgent items** with warning badges  
- **Create custom markers** with personal notes
- **Track project status** visually

## 🏆 How We Compare

| Extension | Function | LookAtni File Markers Advantage |
|-----------|----------|--------------------------------|
| **File Read Marker** | Mark files as read/unread | ✅ **Plus** invisible code markers + custom colors/notes |
| **Mark Files** | Simple visual indicators | ✅ **Plus** full project extraction + marker validation |
| **Code Organizers** | Basic file grouping | ✅ **Complete project workflow** from marking to extraction |

**🎯 Why choose LookAtni?** You get **BOTH** visual file organization AND revolutionary code sharing capabilities in one extension!

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

## 🚀 Quick Start

### Installation

1. Install from VS Code Marketplace: `LookAtni File Markers`
2. Press `Ctrl+Shift+P` and search for "LookAtni"
3. Try `LookAtni: Quick Demo` to see it in action!

### Basic Usage

1. **Generate markers from a project:**
   - Right-click on a folder → `LookAtni: Generate Markers`
   - Choose output file and options
   - Get a marked file with your entire project

2. **Extract files from marked content:**
   - Open a marked file (`.txt` with `//m/` markers)
   - Right-click → `LookAtni: Extract Files`
   - Choose destination and watch your project rebuild

3. **Validate marked files:**
   - Use `LookAtni: Validate Markers` to check integrity
   - Get detailed reports on any issues

## 🏷️ Marker Format

LookAtni uses a **unique, conflict-free** marker syntax:

```typescript
//m/ relative/path/to/file.ext /m//
```

**Why this format?**

- ✅ **Unique**: Extremely unlikely to appear in real code
- ✅ **Readable**: Easy to identify and understand  
- ✅ **Parseable**: Simple regex pattern
- ✅ **Universal**: Works with any programming language

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

![Visual Markers Demo](https://img.shields.io/badge/Demo-Coming%20Soon-blue)

> 📹 **Short demo video coming soon!** See how LookAtni transforms your VS Code workflow.

## 🤝 Community

**Love LookAtni File Markers?**

- ⭐ **Rate us** on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)!
- 💡 **Got ideas?** [Open an issue](https://github.com/rafa-mori/lookatni-revolution/issues) or submit a PR 😉
- 🐛 **Found a bug?** Let us know and we'll fix it fast!
- 💬 **Share your workflow** - we'd love to see how you use LookAtni!

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/rafa-mori/lookatni-revolution)
- **Issues**: [Report Issues](https://github.com/rafa-mori/lookatni-revolution/issues)

---

***Made with ❤️ for the developer community***

*Transform your code workflow with LookAtni File Markers!*
