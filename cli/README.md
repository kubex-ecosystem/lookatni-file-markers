# ![LookAtni File Markers - CLI Tools](https://raw.githubusercontent.com/rafa-mori/lookatni-file-markers/main/resources/top_banner.png)

---

![![GitHub Release](https://img.shields.io/github/release/rafa-mori/lookatni-file-markers.svg)](https://github.com/rafa-mori/lookatni-file-markers/releases)
![![GitHub Issues](https://img.shields.io/github/issues/rafa-mori/lookatni-file-markers.svg)](https://github.com/rafa-mori/lookatni-file-markers/issues)
![![GitHub License](https://img.shields.io/github/license/rafa-mori/lookatni-file-markers.svg)](https://github.com/rafa-mori/lookatni-file-markers/blob/main/LICENSE)
![![GitHub Stars](https://img.shields.io/github/stars/rafa-mori/lookatni-file-markers.svg)](https://github.com/rafa-mori/lookatni-file-markers/stargazers)
![![GitHub Forks](https://img.shields.io/github/forks/rafa-mori/lookatni-file-markers.svg)](https://github.com/rafa-mori/lookatni-file-markers/network/members)
![![GitHub Contributors](https://img.shields.io/github/contributors/rafa-mori/lookatni-file-markers.svg)](https://github.com/rafa-mori/lookatni-file-markers/graphs/contributors)

---

## LookAtni File Markers - CLI Tools

🚀 **Revolutionary file marker system for automatic code extraction and generation**

---

🔧 **Command-line tools for the LookAtni File Markers system**

This directory contains the standalone CLI scripts that work independently of the VS Code extension, providing powerful file marker functionality from the command line.

## 🚀 Available Tools

### 📤 `extract-files.sh`

Extract files from marked content using the LookAtni marker system.

```bash
# Basic usage
./extract-files.sh marked-file.txt output-directory/

# Interactive mode
./extract-files.sh --interactive

# Dry run (preview only)
./extract-files.sh --dry-run marked-file.txt

# Force overwrite existing files
./extract-files.sh --force marked-file.txt output-directory/
```

**Features:**

- ✅ Preserves directory structure
- ✅ Interactive file conflict resolution
- ✅ Dry-run mode for safe testing
- ✅ Comprehensive statistics and reporting
- ✅ Colorized output for better UX

---

### 📥 `generate-markers.sh`

Generate marked files from existing project directories.

```bash
# Generate from current directory
./generate-markers.sh . project-marked.txt

# Generate with size limit (500KB max per file)
./generate-markers.sh --max-size 500 ./my-project output.txt

# Exclude specific patterns
./generate-markers.sh --exclude "node_modules,*.log,.git" ./src output.txt

# Interactive mode with prompts
./generate-markers.sh --interactive
```

**Features:**

- ✅ Smart binary file detection
- ✅ Configurable file size limits
- ✅ Flexible exclusion patterns
- ✅ Progress reporting
- ✅ File type statistics

---

### 🧪 `test-lookatni.sh`

Comprehensive test suite for the LookAtni system.

```bash
# Run all tests
./test-lookatni.sh

# Run specific test category
./test-lookatni.sh basic
./test-lookatni.sh edge-cases
./test-lookatni.sh performance

# Verbose mode with detailed output
./test-lookatni.sh --verbose
```

**Test Categories:**

- 🔍 **Basic functionality** - Core extract/generate operations
- ⚡ **Performance tests** - Large file handling
- 🎯 **Edge cases** - Special characters, empty files, etc.
- 🔒 **Security tests** - Path traversal protection
- 📊 **Statistics validation** - Accuracy of reporting

---

### 🎯 `demo.sh`

Interactive demonstration of LookAtni capabilities.

```bash
# Run interactive demo
./demo.sh

# Quick demo (non-interactive)
./demo.sh --quick

# Demo with custom sample project
./demo.sh --project /path/to/project
```

---

## 📋 Installation & Setup

### Prerequisites

- **Bash 4.0+** (Linux/macOS/WSL)
- **awk** (GNU awk recommended)
- **Standard Unix tools** (grep, sed, find, etc.)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/rafa-mori/lookatni-file-markers.git
cd lookatni-file-markers/cli

# Make scripts executable
chmod +x *.sh

# Test installation
./test-lookatni.sh
```

### Integration with VS Code Extension

The CLI tools are automatically detected by the VS Code extension when placed in:

- `<extension-path>/cli/`
- `<workspace>/cli/`
- `~/.lookatni/`

---

## 🏷️ Marker Format

LookAtni uses a unique marker syntax that never conflicts with existing code:

```typescript
//m/ relative/path/to/file.ext /m//
file content here...

//m/ another/file.js /m//
console.log('Another file content');
```

**Why this format?**

- ✅ **Unique** - Extremely unlikely to appear in real code
- ✅ **Readable** - Easy to identify and understand
- ✅ **Parseable** - Simple regex: `/^\/\/m\/ (.+?) \/m\/\/$/`
- ✅ **Language agnostic** - Works with any text format

---

## 📊 Usage Examples

### Extract a complete project

```bash
# From marked file to new directory
./extract-files.sh project-backup.txt ./restored-project/
```

### Create project backup

```bash
# Generate marked file from project
./generate-markers.sh ./my-project project-backup.txt
```

### Validate and analyze

```bash
# Test the round-trip process
./generate-markers.sh ./original project.txt
./extract-files.sh project.txt ./restored
diff -r ./original ./restored
```

---

## 🔧 Advanced Usage

### Custom Exclusions

```bash
# Exclude multiple patterns
./generate-markers.sh \
  --exclude "node_modules,build,dist,*.log,*.tmp" \
  ./project output.txt
```

### Large Project Handling

```bash
# Limit file size and show progress
./generate-markers.sh \
  --max-size 1000 \
  --progress \
  ./large-project output.txt
```

### Batch Processing

```bash
# Process multiple projects
for dir in ./projects/*/; do
  ./generate-markers.sh "$dir" "${dir%/}-backup.txt"
done
```

---

## 🛟 Troubleshooting

### Common Issues

- **"No markers found"**

- Check that the file contains `//m/ filename /m//` markers
- Verify file encoding (UTF-8 recommended)

- **"Permission denied"**

- Make scripts executable: `chmod +x *.sh`
- Check output directory permissions

- **"Binary file detected"**

- Binary files are automatically skipped
- Use `--include-binary` flag if needed (not recommended)

### Debug Mode

```bash
# Enable verbose logging
DEBUG=1 ./extract-files.sh marked-file.txt output/
```

---

## 🤝 Integration

### With VS Code Extension

The CLI tools integrate seamlessly with the VS Code extension, providing:

- **Command palette access** - Run CLI tools from VS Code
- **File context menus** - Right-click integration
- **Status bar integration** - Progress and status updates

### With Git Workflows

```bash
# Pre-commit hook example
./generate-markers.sh . .lookatni-backup.txt
git add .lookatni-backup.txt
```

### With CI/CD

```bash
# In your build pipeline
./test-lookatni.sh
./generate-markers.sh ./src project-snapshot.txt
# Upload snapshot as build artifact
```

---

## 📈 Performance

**Benchmarks** (tested on average development machine):

- **Small projects** (< 100 files): ~1 second
- **Medium projects** (< 1000 files): ~5-10 seconds  
- **Large projects** (< 10000 files): ~30-60 seconds

**Memory usage**: Minimal - processes files individually, not batch-loaded.

---

## 🔗 Links

- **Main Repository**: [LookAtni File Markers](https://github.com/rafa-mori/lookatni-file-markers)
- **VS Code Extension**: Available in the marketplace
- **Documentation**: Full docs in `/docs` directory
- **Issues & Support**: GitHub Issues

---

## 📄 License

MIT License - see LICENSE file for details.

---

*Created with ❤️ for the developer community*
***Part of the LookAtni File Markers project***
