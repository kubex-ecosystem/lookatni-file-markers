# ![LookAtni Revolution Logo](https://raw.githubusercontent.com/rafa-mori/lookatni-revolution/main/assets/top_banner.png)

---

![![GitHub Release](https://img.shields.io/github/release/rafa-mori/lookatni-revolution.svg)](https://github.com/rafa-mori/lookatni-revolution/releases)
![![GitHub Issues](https://img.shields.io/github/issues/rafa-mori/lookatni-revolution.svg)](https://github.com/rafa-mori/lookatni-revolution/issues)
![![GitHub License](https://img.shields.io/github/license/rafa-mori/lookatni-revolution.svg)](https://github.com/rafa-mori/lookatni-revolution/blob/main/LICENSE)
![![GitHub Stars](https://img.shields.io/github/stars/rafa-mori/lookatni-revolution.svg)](https://github.com/rafa-mori/lookatni-revolution/stargazers)
![![GitHub Forks](https://img.shields.io/github/forks/rafa-mori/lookatni-revolution.svg)](https://github.com/rafa-mori/lookatni-revolution/network/members)
![![GitHub Contributors](https://img.shields.io/github/contributors/rafa-mori/lookatni-revolution.svg)](https://github.com/rafa-mori/lookatni-revolution/graphs/contributors)

---

🚀 **Revolutionary file marker system for automatic code extraction and generation**

Transform how you deliver and organize code with unique markers that never conflict with existing syntax.

## 🎯 What is LookAtni Revolution?

LookAtni Revolution introduces a groundbreaking approach to file organization and code delivery using unique markers:

```typescript
//m/ src/example.js /m//
console.log('This content belongs to src/example.js');

//m/ README.md /m//
# Another File
This content belongs to README.md
```

## ✨ Features

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

1. Install from VS Code Marketplace: `LookAtni Revolution`
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

| Command | Shortcut | Description |
|---------|----------|-------------|
| `LookAtni: Extract Files` | `Ctrl+Shift+L E` | Extract files from marked content |
| `LookAtni: Generate Markers` | `Ctrl+Shift+L G` | Create marked file from project |
| `LookAtni: Validate Markers` | - | Validate marked file structure |
| `LookAtni: Quick Demo` | `Ctrl+Shift+L D` | Run interactive demonstration |
| `LookAtni: Show Statistics` | - | Display file statistics |
| `LookAtni: Open CLI Tools` | - | Access command-line tools |

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/rafa-mori/lookatni-revolution)
- **Issues**: [Report Issues](https://github.com/rafa-mori/lookatni-revolution/issues)
- **Documentation**: [Wiki](https://github.com/rafa-mori/lookatni-revolution/wiki)
- **VS Code Marketplace**: [LookAtni Revolution](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-revolution)
- **CLI Tools**: [LookAtni CLI](https://github.com/rafa-mori/lookatni-revolution/tree/main/cli)
- **LinkedIn**: [rafa-mori](https://www.linkedin.com/in/rafa-mori/)

---

***Made with ❤️ for the developer community***

*Transform your code workflow with LookAtni Revolution!*
