# 🚀 LookAtni TypeScript Scripts

This folder contains TypeScript versions of the original shell scripts, offering a more robust and secure alternative for the LookAtni system.

## 📁 Available Scripts

### 🎯 Unified CLI

- **`cli.ts`** - Unified command-line interface for all scripts

### 🔧 Main Scripts

- **`extractFiles.ts`** - Extracts files from marked code
- **`generateMarkers.ts`** - Generates markers from file structures
- **`testLookatni.ts`** - Complete test suite
- **`demo.ts`** - Creates system demonstration

## 🚀 How to Use

### Via NPM Scripts (Recommended)

```bash
# Unified CLI
npm run lookatni help
npm run lookatni extract code.txt ./project
npm run lookatni generate ./src code.txt

# Individual scripts
npm run lookatni:extract code.txt ./destination --stats
npm run lookatni:generate ./project code.txt --exclude node_modules
npm run lookatni:test
npm run lookatni:demo
```

### Via Direct TSX

```bash
# Unified CLI
tsx src/scripts/cli.ts help
tsx src/scripts/cli.ts extract code.txt ./project
tsx src/scripts/cli.ts generate ./src code.txt

# Individual scripts
tsx src/scripts/extractFiles.ts code.txt ./destination --stats
tsx src/scripts/generateMarkers.ts ./project code.txt --exclude node_modules
tsx src/scripts/testLookatni.ts
tsx src/scripts/demo.ts
```

## 🌟 Advantages over Shell Scripts

### ✅ **Cross-Platform Compatibility**

- Works on Windows, macOS, and Linux
- No dependency on specific shell tools
- Consistent behavior across all environments

### 🛡️ **Enhanced Security**

- TypeScript code is less likely to be detected as "suspicious"
- Compile-time type validation
- More robust error handling

### 🔧 **Advanced Features**

- More user-friendly interface with colors and formatting
- Stricter input validation
- More detailed statistics reports
- Better file path handling

### 🎯 **Maintainability**

- More organized and object-oriented code
- Easy extension and modification
- Integrated unit tests
- Inline documentation

## 📋 Main Commands

### Extract Files

```bash
# Basic extraction
npm run lookatni extract code.txt ./project

# With advanced options
npm run lookatni extract code.txt ./destination \
  --dry-run \
  --stats \
  --verbose \
  --interactive

# Format validation only
npm run lookatni extract code.txt --format
```

### Generate Markers

```bash
# Basic generation
npm run lookatni generate ./src code.txt

# With filters
npm run lookatni generate ./project code.txt \
  --exclude node_modules \
  --exclude "*.log" \
  --include "*.ts" \
  --include "*.js" \
  --max-size 500

# Verbose
npm run lookatni generate ./src code.txt --verbose
```

### Run Tests

```bash
# Complete tests
npm run lookatni test

# Tests with help
npm run lookatni test --help
```

### Create Demo

```bash
# Create demo
npm run lookatni demo

# View help
npm run lookatni demo --help
```

## 🔍 Practical Examples

### Share a React Project

```bash
# Generate markers excluding dependencies
npm run lookatni generate ./my-app react-project.txt \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --include "*.tsx" \
  --include "*.ts" \
  --include "*.css" \
  --include "*.json"

# Extract to another location
npm run lookatni extract react-project.txt ./new-project
cd new-project && npm install
```

### Create Portable Backup

```bash
# Generate complete backup
npm run lookatni generate ./my-project backup-$(date +%Y%m%d).txt \
  --exclude node_modules \
  --exclude .git \
  --max-size 1000

# Restore backup
npm run lookatni extract backup-20250712.txt ./restored-project
```

### Quick Demo

```bash
# Create demo and extract
npm run lookatni demo
npm run lookatni extract demo-code.txt ./demo-web
cd demo-web && open index.html
```

## 📊 Shell vs TypeScript Comparison

| Feature | Shell Scripts | TypeScript Scripts |
|---------|---------------|-------------------|
| Compatibility | Unix/Linux/macOS | Cross-platform |
| Security | Can be detected as suspicious | More secure |
| Maintainability | Moderate | High |
| Performance | Fast | Good |
| Features | Basic | Advanced |
| Error Handling | Basic | Robust |
| Typing | None | Strong |
| Testing | Manual | Automated |

## 🛠️ Development

### Adding New Scripts

1. Create the `.ts` file in `src/scripts/`
2. Implement the main class
3. Add necessary exports
4. Update `cli.ts` if it's a main command
5. Add npm script in `package.json`

### Running During Development

```bash
# Compile and check types
npm run check-types

# Linter
npm run lint

# Tests
npm run lookatni:test

# Watch mode for development
npm run watch
```

## 🎯 Use Cases

1. **Extension Publishing**: TypeScript scripts avoid "suspicious content" issues
2. **Cross-Platform Development**: Works on any system
3. **CI/CD Integration**: Facilitates build automation
4. **Distribution**: Can be packaged with the extension
5. **Education**: More readable code for learning

## 🚀 Roadmap

- [ ] Support for JSON configuration files
- [ ] VS Code Tasks plugin
- [ ] REST API for web integration
- [ ] Project template support
- [ ] Automatic compression for large files
- [ ] Git integration for versioning

---

**LookAtni File Markers** - Transforming shell scripts into modern TypeScript code! 🚀
