# LookAtni File Markers - Global CLI

This README shows how to use LookAtni File Markers as a global command-line tool.

## 📦 Global Installation

```bash
npm install -g lookatni-file-markers
```

## 🚀 Basic Usage

After global installation, you can use the `lookatni` command from anywhere:

```bash
# Show help
lookatni help

# Show version
lookatni version

# Extract files from a marked file
lookatni extract code.txt ./project

# Generate markers from a file structure
lookatni generate ./src code.txt

# Run tests
lookatni test

# Create a demo
lookatni demo
```

## 📋 Available Commands

| Command   | Description                              |
|-----------|------------------------------------------|
| `extract` | Extracts files from a marked file        |
| `generate`| Generates markers from a file structure  |
| `test`    | Runs LookAtni system tests               |
| `demo`    | Creates a demo of the system             |
| `version` | Displays the LookAtni version            |
| `help`    | Displays help information                |

## 🔧 Advanced Examples

### Extract with options

```bash
# Extraction with dry-run and statistics
lookatni extract code.txt ./destination --dry-run --stats

# Interactive extraction with verbose
lookatni extract code.txt --interactive --verbose
```

### Generate markers with filters

```bash
# Generate excluding node_modules
lookatni generate . project.txt --exclude node_modules

# Generate including only TypeScript files
lookatni generate ./src code.txt --include "*.ts"
```

## 💡 Tips

- Use `lookatni <command> --help` for specific help on each command
- LookAtni also works as a VS Code extension
- Perfect for integration in CI/CD pipelines
- Supports batch operations for automation

## 🆚 Comparison: Local vs Global

### Local Usage (in the project folder)

```bash
npm run lookatni extract code.txt ./project
```

### Global Usage (from anywhere)

```bash
lookatni extract code.txt ./project
```

## 🔗 Useful Links

- [Complete Documentation](https://github.com/rafa-mori/lookatni-file-markers)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rafa-mori.lookatni-file-markers)
- [Examples and Tutorials](https://github.com/rafa-mori/lookatni-file-markers/tree/main/docs)

---

**LookAtni File Markers** - Organize your code with unique markers! ✨
