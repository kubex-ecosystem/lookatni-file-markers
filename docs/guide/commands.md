# 📋 Commands Reference

Complete reference for all LookAtni File Markers commands in VS Code and CLI.

## VS Code Commands

Access commands through the Command Palette (`Ctrl+Shift+P`) or right-click context menus.

### File Generation Commands

#### Generate Markers
```
LookAtni: Generate Markers
```
**Purpose**: Create marker files from selected directories or workspace
**Usage**: 
1. Open Command Palette
2. Type "LookAtni: Generate Markers"
3. Select source directory
4. Choose output file location
5. Configure filters and options

**Keyboard Shortcut**: `Ctrl+Shift+G` (configurable)

#### Quick Markers
```
LookAtni: Quick Markers
```
**Purpose**: Generate markers with preset configurations for common scenarios
**Options**:
- **Development Build** - Include source, docs, configs
- **Production Build** - Only production-ready files
- **Component Library** - Just components and types
- **Documentation** - Docs and examples only

### File Operations Commands

#### Extract Files
```
LookAtni: Extract Files
```
**Purpose**: Extract complete projects from marker files
**Features**:
- Interactive file browser for marker selection
- Destination folder picker
- Conflict resolution options
- Progress tracking with cancellation

#### Validate Markers
```
LookAtni: Validate Markers
```
**Purpose**: Verify integrity of marker files
**Output**:
- Comprehensive validation report
- Issue categorization (Critical/Warning/Info)
- Auto-fix suggestions
- Performance metrics

### Demo & Presentation Commands

#### Automated Demo
```
LookAtni: Automated Demo
```
**Purpose**: Create perfect demonstrations for tutorials and presentations
**Features**:
- Scripted actions with timing control
- Multiple demo scenarios
- Recording-friendly output
- Customizable speed and pauses

#### Quick Demo
```
LookAtni: Quick Demo
```
**Purpose**: Quick demonstration of basic workflow
**Duration**: ~2 minutes
**Content**: Generate → Validate → Extract cycle

#### Recording Guide
```
LookAtni: Recording Guide
```
**Purpose**: Open interactive guide for creating video tutorials
**Includes**:
- Step-by-step recording instructions
- Best practices for screen recording
- Recommended settings and tools

### Project Management Commands

#### Show Statistics
```
LookAtni: Show Statistics
```
**Purpose**: Display project metrics and insights
**Metrics**:
- File count by type
- Total project size
- Complexity analysis
- Dependency graph

#### Open CLI
```
LookAtni: Open CLI
```
**Purpose**: Open integrated terminal with LookAtni CLI ready
**Features**:
- Pre-configured environment
- Current project context
- Command history and suggestions

### Visual & Navigation Commands

#### Visual Markers
```
LookAtni: Visual Markers
```
**Purpose**: Toggle enhanced visual markers in editor
**Features**:
- Syntax highlighting
- Interactive navigation
- File tree view
- Hover information

#### Configuration
```
LookAtni: Configuration
```
**Purpose**: Open settings UI for LookAtni preferences
**Categories**:
- Generation settings
- Visual preferences
- Performance options
- Integration settings

## CLI Commands

### Installation & Setup

```bash
# Install globally
npm install -g lookatni-cli

# Verify installation
lookatni --version

# Show help
lookatni --help
```

### Core Commands

#### `lookatni generate`

Generate marker files from project directories.

```bash
lookatni generate [options]

Options:
  -s, --source <path>       Source directory (default: current)
  -o, --output <file>       Output marker file
  -i, --include <patterns>  Include file patterns (comma-separated)
  -e, --exclude <patterns>  Exclude file patterns (comma-separated)
  -c, --compress           Compress output
  -m, --metadata           Include file metadata
  -p, --preserve-structure Preserve directory structure
  -v, --verbose            Verbose output
  -d, --dry-run           Preview without generating

Examples:
  lookatni generate --source ./my-project --output markers.txt
  lookatni generate -s . -o markers.txt -i "src/**,*.json" -e "node_modules/**"
  lookatni generate --compress --metadata --verbose
```

#### `lookatni extract`

Extract projects from marker files.

```bash
lookatni extract [options]

Options:
  -i, --input <file>        Input marker file (required)
  -o, --output <path>       Output directory (default: current)
  -f, --filter <patterns>   Extract specific patterns only
  -e, --exclude <patterns>  Exclude specific patterns
  --overwrite              Overwrite existing files
  --backup                 Create backups before overwriting
  --skip-existing          Skip existing files
  -v, --verbose            Verbose output
  -d, --dry-run           Preview without extracting

Examples:
  lookatni extract -i project.txt -o ./restored
  lookatni extract -i markers.txt -f "src/**" --overwrite
  lookatni extract -i project.txt --backup --verbose
```

#### `lookatni validate`

Validate marker file integrity.

```bash
lookatni validate [options] <file>

Options:
  -d, --detailed           Show detailed validation report
  -f, --fix-suggestions    Provide fix suggestions
  -r, --report <file>      Save report to file
  --strict                 Use strict validation rules
  --auto-fix              Attempt automatic fixes
  -j, --json              Output in JSON format
  -v, --verbose           Verbose output

Examples:
  lookatni validate project.txt
  lookatni validate markers.txt --detailed --fix-suggestions
  lookatni validate project.txt --strict --report validation.json
```

### Advanced Commands

#### `lookatni analyze`

Analyze project structure and dependencies.

```bash
lookatni analyze [options]

Options:
  -s, --source <path>       Source directory
  -o, --output <file>       Save analysis to file
  -g, --graph <file>        Generate dependency graph
  --size-breakdown         Show size breakdown by file type
  --complexity-analysis    Analyze code complexity
  -f, --format <type>       Output format (json|yaml|txt)

Examples:
  lookatni analyze --source ./project --output analysis.json
  lookatni analyze --graph deps.dot --size-breakdown
```

#### `lookatni diff`

Compare marker files or directories.

```bash
lookatni diff [options] <source1> <source2>

Options:
  -r, --report <file>      Save comparison report
  --ignore-whitespace     Ignore whitespace changes
  --ignore-metadata       Ignore metadata differences
  -f, --format <type>      Report format (json|html|txt)
  -v, --verbose           Show detailed differences

Examples:
  lookatni diff old.txt new.txt
  lookatni diff markers.txt ./project-dir --report changes.html
```

#### `lookatni merge`

Merge multiple marker files.

```bash
lookatni merge [options] <files...>

Options:
  -o, --output <file>      Output merged file
  --strategy <type>        Merge strategy (combine|overwrite|prompt)
  --deduplicate           Remove duplicate files
  -v, --verbose           Verbose output

Examples:
  lookatni merge file1.txt file2.txt -o combined.txt
  lookatni merge *.txt --deduplicate --strategy=combine
```

### Configuration Commands

#### `lookatni config`

Manage global configuration.

```bash
lookatni config <command> [options]

Commands:
  set <key> <value>        Set configuration value
  get <key>               Get configuration value
  list                    List all configuration
  reset                   Reset to defaults
  validate <file>         Validate config file

Examples:
  lookatni config set default.output ./markers
  lookatni config get default.include
  lookatni config list
  lookatni config validate .lookatni.json
```

#### `lookatni init`

Initialize project configuration.

```bash
lookatni init [options]

Options:
  -t, --template <type>    Use configuration template
  -f, --force             Overwrite existing configuration
  -i, --interactive       Interactive configuration wizard

Templates:
  - javascript           JavaScript/Node.js projects
  - typescript           TypeScript projects
  - react               React applications
  - vue                 Vue.js applications
  - python              Python projects
  - documentation       Documentation sites

Examples:
  lookatni init --template react
  lookatni init --interactive
```

## Command Chaining & Workflows

### Basic Workflow
```bash
# Complete workflow in one command chain
lookatni generate --source . --output project.txt && \
lookatni validate project.txt --strict && \
echo "✅ Project markers ready for distribution!"
```

### Development Workflow
```bash
# Development build with validation
lookatni generate \
  --source ./src \
  --include "**/*.{ts,tsx,js,jsx,json,md}" \
  --exclude "**/*.test.*" \
  --output dev-build.txt \
  --metadata --verbose

# Validate and extract for testing
lookatni validate dev-build.txt --detailed
lookatni extract --input dev-build.txt --output ./test-extraction --dry-run
```

### Production Workflow
```bash
# Production-ready markers
lookatni generate \
  --source . \
  --include "src/**,README.md,package.json,LICENSE" \
  --exclude "**/*.test.*,**/*.spec.*,node_modules/**" \
  --output "$(basename $PWD)-prod-$(date +%Y%m%d).txt" \
  --compress --preserve-structure

# Validate with strict rules
lookatni validate *.txt --strict --report validation-report.json
```

## Error Handling & Troubleshooting

### Common Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Continue |
| 1 | General error | Check command syntax |
| 2 | File not found | Verify file paths |
| 3 | Permission denied | Check file permissions |
| 4 | Invalid configuration | Validate config file |
| 5 | Validation failed | Fix validation errors |

### Debugging Commands

```bash
# Verbose output for debugging
lookatni generate --verbose --source .

# Dry run to test without changes
lookatni extract --input markers.txt --dry-run

# Debug configuration
lookatni config debug

# Test file patterns
lookatni test-pattern "src/**/*.{ts,tsx}"
```

### Performance Optimization

```bash
# For large projects
lookatni generate --source . --parallel=8 --stream

# Memory-conscious processing
lookatni generate --source . --max-memory=2GB --use-temp

# Compress large outputs
lookatni generate --source . --compress --output large-project.txt.gz
```

---

Next: Explore [Workflows Guide](workflows.md) for advanced automation patterns.
