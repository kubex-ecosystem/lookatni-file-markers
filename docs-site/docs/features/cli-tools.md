# 🔧 CLI Tools

Powerful command-line interface for automation, CI/CD integration, and advanced LookAtni workflows.

## Installation

### Global Installation

```bash
# Install via npm
npm install -g lookatni-cli

# Install via yarn
yarn global add lookatni-cli

# Install via pnpm
pnpm add -g lookatni-cli
```

### Local Project Installation

```bash
# Install as dev dependency
npm install --save-dev lookatni-cli

# Use with npx
npx lookatni-cli --help
```

## Core Commands

### Generate Markers

Create marker files from project directories:

```bash
# Basic generation
lookatni generate --source ./my-project --output project-markers.txt

# With filters
lookatni generate \
  --source ./my-project \
  --output markers.txt \
  --include "src/**/*.ts,*.json" \
  --exclude "node_modules/**,*.log"

# Advanced options
lookatni generate \
  --source ./my-project \
  --output markers.txt \
  --preserve-structure \
  --include-metadata \
  --compress \
  --verbose
```

### Extract Files

Restore projects from marker files:

```bash
# Basic extraction
lookatni extract --input project-markers.txt --output ./restored

# Selective extraction
lookatni extract \
  --input project-markers.txt \
  --output ./components-only \
  --filter "src/components/**"

# With conflict resolution
lookatni extract \
  --input project-markers.txt \
  --output ./project \
  --overwrite \
  --backup
```

### Validate Markers

Verify marker file integrity:

```bash
# Quick validation
lookatni validate project-markers.txt

# Detailed validation
lookatni validate project-markers.txt \
  --detailed \
  --fix-suggestions \
  --output-report validation-report.json

# Batch validation
lookatni validate *.txt --parallel=4
```

## Advanced Commands

### Project Analysis

Analyze project structure and dependencies:

```bash
# Analyze project
lookatni analyze --source ./my-project --output analysis.json

# Dependency graph
lookatni analyze --source ./my-project --graph-output deps.dot

# Size analysis
lookatni analyze --source ./my-project --size-breakdown
```

### Comparison Tools

Compare projects and marker files:

```bash
# Compare two marker files
lookatni diff markers-v1.txt markers-v2.txt

# Compare marker file with directory
lookatni diff markers.txt ./project-directory

# Generate change report
lookatni diff markers-v1.txt markers-v2.txt --report changes.json
```

### Transformation Tools

Convert and transform marker files:

```bash
# Convert to different format
lookatni convert markers.txt --format json --output project.json

# Merge multiple marker files
lookatni merge markers-1.txt markers-2.txt --output combined.txt

# Split large marker file
lookatni split large-markers.txt --by-directory --output-dir ./split
```

## Configuration

### Global Configuration

```bash
# Set global defaults
lookatni config set default.output ./markers
lookatni config set default.include "src/**,docs/**"
lookatni config set default.exclude "node_modules/**,*.log"

# View current config
lookatni config list

# Reset to defaults
lookatni config reset
```

### Project Configuration

Create `.lookatni.json` in your project:

```json
{
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx", 
    "*.json",
    "*.md"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "*.log",
    ".git/**"
  ],
  "output": {
    "directory": "./markers",
    "filename": "{{project}}-{{timestamp}}.txt",
    "compress": true
  },
  "validation": {
    "strict": true,
    "maxFileSize": "10MB",
    "allowedExtensions": [".ts", ".tsx", ".js", ".jsx", ".json", ".md"]
  }
}
```

## Automation Examples

### Build Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "markers:generate": "lookatni generate --source src --output dist/markers.txt",
    "markers:validate": "lookatni validate dist/markers.txt --strict",
    "markers:extract": "lookatni extract --input markers.txt --output temp/project",
    "markers:all": "npm run markers:generate && npm run markers:validate"
  }
}
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: Generate and Validate Markers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  markers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install LookAtni CLI
        run: npm install -g lookatni-cli
        
      - name: Generate markers
        run: lookatni generate --source . --output project-markers.txt
        
      - name: Validate markers
        run: lookatni validate project-markers.txt --strict
        
      - name: Upload markers artifact
        uses: actions/upload-artifact@v3
        with:
          name: project-markers
          path: project-markers.txt
```

#### GitLab CI

```yaml
stages:
  - build
  - validate
  - deploy

generate_markers:
  stage: build
  script:
    - npm install -g lookatni-cli
    - lookatni generate --source . --output project-markers.txt
  artifacts:
    paths:
      - project-markers.txt
    expire_in: 1 week

validate_markers:
  stage: validate
  dependencies:
    - generate_markers
  script:
    - npm install -g lookatni-cli
    - lookatni validate project-markers.txt --strict --output-report validation.json
  artifacts:
    reports:
      junit: validation.json
```

### Docker Integration

```dockerfile
FROM node:18-alpine

# Install LookAtni CLI
RUN npm install -g lookatni-cli

# Copy project
COPY . /app
WORKDIR /app

# Generate markers
RUN lookatni generate --source . --output /output/project-markers.txt

# Validate
RUN lookatni validate /output/project-markers.txt --strict

# Set output volume
VOLUME ["/output"]
```

## Scripting Examples

### Bash Automation

```bash
#!/bin/bash

# Project backup script
PROJECT_NAME=$(basename "$PWD")
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${PROJECT_NAME}_${TIMESTAMP}.txt"

echo "Creating project markers for $PROJECT_NAME..."

# Generate markers
lookatni generate \
  --source . \
  --output "$OUTPUT_FILE" \
  --include "src/**,docs/**,*.json,*.md" \
  --exclude "node_modules/**,dist/**,*.log" \
  --compress \
  --verbose

# Validate
if lookatni validate "$OUTPUT_FILE" --strict; then
  echo "✅ Markers created successfully: $OUTPUT_FILE"
  
  # Upload to cloud storage (example)
  # aws s3 cp "$OUTPUT_FILE" "s3://my-backups/projects/"
else
  echo "❌ Validation failed"
  exit 1
fi
```

### PowerShell Automation

```powershell
# Project deployment script
param(
    [string]$MarkerFile,
    [string]$DeploymentPath = "./deployment",
    [switch]$Backup
)

# Extract project
Write-Host "Extracting project from $MarkerFile..."

$extractArgs = @(
    "extract"
    "--input", $MarkerFile
    "--output", $DeploymentPath
)

if ($Backup) {
    $extractArgs += "--backup"
}

& lookatni @extractArgs

# Validate extraction
if (lookatni validate $MarkerFile --extracted $DeploymentPath) {
    Write-Host "✅ Deployment successful"
} else {
    Write-Host "❌ Deployment validation failed"
    exit 1
}
```

## API Integration

### Node.js Module

```javascript
const { LookAtniCLI } = require('lookatni-cli');

// Programmatic usage
async function createProjectBackup(projectPath) {
  const cli = new LookAtniCLI();
  
  // Generate markers
  const result = await cli.generate({
    source: projectPath,
    output: `backup-${Date.now()}.txt`,
    include: ['src/**', 'docs/**'],
    exclude: ['node_modules/**']
  });
  
  // Validate
  const validation = await cli.validate(result.outputFile);
  
  if (validation.isValid) {
    console.log('✅ Backup created successfully');
    return result.outputFile;
  } else {
    throw new Error('Validation failed');
  }
}
```

### Python Integration

```python
import subprocess
import json

def generate_markers(source_dir, output_file):
    """Generate markers using LookAtni CLI"""
    
    cmd = [
        'lookatni', 'generate',
        '--source', source_dir,
        '--output', output_file,
        '--format', 'json'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        return json.loads(result.stdout)
    else:
        raise Exception(f"Generation failed: {result.stderr}")

def validate_markers(marker_file):
    """Validate marker file"""
    
    cmd = ['lookatni', 'validate', marker_file, '--json']
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    return json.loads(result.stdout)
```

## Performance Tips

### Large Projects

```bash
# Use parallel processing
lookatni generate --source . --output markers.txt --parallel=8

# Stream large files
lookatni generate --source . --output markers.txt --stream

# Compress output
lookatni generate --source . --output markers.txt --compress
```

### Memory Optimization

```bash
# Limit memory usage
lookatni generate --source . --output markers.txt --max-memory=2GB

# Use temporary files for large projects
lookatni generate --source . --output markers.txt --use-temp
```

---

Next: Explore [Configuration Guide](../guide/configuration.md) for detailed setup options.
