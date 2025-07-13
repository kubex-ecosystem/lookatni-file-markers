# 📥 File Extraction

Extract complete projects from LookAtni marker files with perfect fidelity and zero data loss.

## Quick Start

```bash
# Extract from VS Code
LookAtni: Extract Files → select marker file → choose destination

# Extract via CLI
lookatni extract --input project-markers.txt --output ./restored-project
```

## How Extraction Works

The extraction process reconstructs your project in three phases:

1. **Marker Parsing** - Reads and validates marker file structure
2. **Structure Creation** - Recreates folder hierarchy
3. **File Restoration** - Writes files with original content and metadata

## Features

### 🎯 Perfect Fidelity

- **Exact content restoration** - Byte-for-byte accuracy
- **Folder structure** - Complete directory hierarchy
- **File metadata** - Timestamps and permissions (when possible)
- **Encoding preservation** - UTF-8, ASCII, binary files

### ⚡ Smart Extraction

```bash
# Extract specific folders only
lookatni extract --input markers.txt --filter "src/**"

# Extract with conflict resolution
lookatni extract --input markers.txt --on-conflict=overwrite

# Dry run to preview extraction
lookatni extract --input markers.txt --dry-run
```

### 🔒 Safety Features

- **Conflict detection** - Warns about existing files
- **Backup creation** - Optional backup of overwritten files
- **Validation checks** - Ensures marker file integrity
- **Progress tracking** - Real-time extraction progress

## Extraction Options

### VS Code Command

The VS Code command provides an interactive experience:

1. **File Selection** - Browse for marker files
2. **Destination Choice** - Select output directory
3. **Conflict Resolution** - Handle existing files
4. **Progress Display** - Visual extraction progress

### CLI Tool

Full command-line control with advanced options:

```bash
lookatni extract [options]

Options:
  --input, -i     Input marker file (required)
  --output, -o    Output directory (default: current)
  --filter, -f    Extract specific paths only
  --exclude, -e   Exclude specific patterns
  --overwrite     Overwrite existing files
  --backup        Create backups before overwriting
  --dry-run       Preview extraction without writing
  --verbose, -v   Show detailed progress
```

## Use Cases

### 📚 Educational Content

Perfect for distributing course materials and tutorials:

```bash
# Student downloads tutorial-project.txt
lookatni extract --input tutorial-project.txt --output ./lesson-1
cd lesson-1
npm install  # Project ready to run!
```

### 👥 Team Collaboration

Share project slices without full repository access:

```bash
# Extract just the component library
lookatni extract --input full-project.txt \
  --filter "src/components/**" \
  --output ./component-review
```

### 🚀 Deployment & CI/CD

Automate project packaging and deployment:

```bash
# Extract configuration files for deployment
lookatni extract --input deployment-package.txt \
  --filter "config/**,scripts/**" \
  --output ./deploy-staging
```

## Advanced Features

### Selective Extraction

Extract only the files you need:

```bash
# Extract TypeScript files only
lookatni extract --input project.txt --filter "**/*.ts,**/*.tsx"

# Extract everything except tests
lookatni extract --input project.txt --exclude "**/*.test.*,**/tests/**"
```

### Conflict Resolution

Handle existing files intelligently:

=== "Interactive Mode"
    ```bash
    # Prompt for each conflict
    lookatni extract --input project.txt --interactive
    ```

=== "Automatic Modes"
    ```bash
    # Always overwrite
    lookatni extract --input project.txt --overwrite
    
    # Always skip existing
    lookatni extract --input project.txt --skip-existing
    
    # Create backups
    lookatni extract --input project.txt --backup
    ```

### Validation & Verification

Ensure extraction accuracy:

```bash
# Verify extraction integrity
lookatni verify --input project.txt --extracted ./my-project

# Compare with original
lookatni diff --markers project.txt --directory ./my-project
```

## Error Handling

LookAtni provides comprehensive error handling:

### Common Issues

!!! warning "Marker File Corrupted"
    ```
    Error: Invalid marker format detected
    Solution: Re-generate markers from original source
    ```

!!! warning "Insufficient Permissions"
    ```
    Error: Cannot write to destination directory
    Solution: Check directory permissions or choose different location
    ```

!!! warning "Disk Space"
    ```
    Error: Not enough space for extraction
    Solution: Free up disk space or extract to different drive
    ```

### Recovery Options

- **Partial extraction** - Continue with remaining files
- **Repair mode** - Attempt to fix corrupted markers
- **Logging** - Detailed logs for troubleshooting

## Performance

### Extraction Speed

- **Small projects** (< 100 files) - Instant
- **Medium projects** (< 1000 files) - < 5 seconds  
- **Large projects** (< 10000 files) - < 30 seconds

### Memory Usage

- **Streaming extraction** - Constant memory usage
- **Large files** - Processed in chunks
- **Memory-efficient** - No full file buffering

## Integration Examples

### GitHub Actions

```yaml
- name: Extract Project
  run: |
    npm install -g lookatni-cli
    lookatni extract --input project-markers.txt --output ./build
```

### Docker Containers

```dockerfile
RUN npm install -g lookatni-cli
COPY project-markers.txt .
RUN lookatni extract --input project-markers.txt --output ./app
```

---

Next: Learn about [Validation Systems](validation.md) to ensure project integrity.
