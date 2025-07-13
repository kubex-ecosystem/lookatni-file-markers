# ✅ Validation System

Ensure project integrity with LookAtni's comprehensive validation system that checks for missing files, broken links, and structural issues.

## Overview

The validation system performs multi-layered checks to guarantee that your marker files are complete, accurate, and ready for extraction.

## Validation Types

### 🔍 Structural Validation

Verifies the overall integrity of marker files:

- **Marker format** - Correct syntax and structure
- **File boundaries** - Proper start/end markers
- **Encoding** - Valid character encoding
- **Completeness** - All referenced files present

### 🔗 Dependency Validation

Checks relationships between files:

- **Import statements** - Verify all imports exist
- **Asset references** - Images, fonts, and media files
- **Configuration links** - Package.json dependencies
- **Internal links** - Documentation cross-references

### 📂 Structure Validation

Ensures folder organization integrity:

- **Path consistency** - No conflicting directory structures
- **File naming** - Valid filenames for target platform
- **Permissions** - Extractable permission settings
- **Size limits** - Files within reasonable size bounds

## Running Validation

### VS Code Command

```bash
# Validate current project
LookAtni: Validate Markers

# Validate specific marker file
LookAtni: Validate Markers → select file
```

### CLI Validation

```bash
# Quick validation
lookatni validate project-markers.txt

# Detailed validation with fix suggestions
lookatni validate project-markers.txt --detailed --fix-suggestions

# Validate multiple files
lookatni validate *.txt --batch
```

## Validation Reports

### Report Structure

```
✅ VALIDATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 STRUCTURE ANALYSIS
  ✅ 156 files validated
  ✅ 23 directories verified
  ✅ Folder hierarchy intact
  
🔗 DEPENDENCY ANALYSIS  
  ✅ 45 import statements verified
  ⚠️  2 optional dependencies missing
  ✅ All asset references valid
  
📋 CONTENT ANALYSIS
  ✅ All file markers complete
  ✅ Encoding validation passed
  ✅ No corruption detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RESULT: VALID ✅
📊 Score: 98/100 (Excellent)
```

### Issue Categories

=== "🚨 Critical Issues"
    Issues that prevent extraction:
    
    - **Corrupted markers** - Malformed file boundaries
    - **Missing files** - Referenced but not included
    - **Invalid paths** - Illegal characters or structures
    - **Size violations** - Files exceeding limits

=== "⚠️ Warnings"
    Issues that may cause problems:
    
    - **Missing dependencies** - Optional imports not found
    - **Large files** - May affect performance
    - **Deprecated syntax** - Old marker format
    - **Platform incompatibility** - Path separator issues

=== "💡 Suggestions"
    Optimization opportunities:
    
    - **Unused files** - Included but not referenced
    - **Duplicate content** - Same file included multiple times
    - **Optimization hints** - Better organization suggestions
    - **Best practices** - Recommended improvements

## Automatic Fixes

### Self-Healing Features

LookAtni can automatically fix many common issues:

```bash
# Auto-fix simple issues
lookatni validate project-markers.txt --auto-fix

# Interactive fixing
lookatni validate project-markers.txt --interactive-fix

# Preview fixes without applying
lookatni validate project-markers.txt --dry-fix
```

### Fixable Issues

- **Path separators** - Convert between Windows/Unix paths
- **Encoding issues** - Fix UTF-8 encoding problems
- **Marker boundaries** - Repair malformed markers
- **Duplicate entries** - Remove redundant file entries

## Advanced Validation

### Custom Validation Rules

```json
{
  "validation": {
    "maxFileSize": "10MB",
    "allowedExtensions": [".js", ".ts", ".json", ".md"],
    "requiredFiles": ["package.json", "README.md"],
    "bannedPatterns": ["node_modules/**", "*.log"]
  }
}
```

### Batch Validation

Validate multiple projects efficiently:

```bash
# Validate all marker files in directory
lookatni validate-batch ./marker-files/

# Validate with parallel processing
lookatni validate-batch ./projects/ --parallel=4

# Generate combined report
lookatni validate-batch ./projects/ --report=summary.json
```

## Integration Examples

### Pre-commit Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit
lookatni validate markers/ --strict || exit 1
```

### CI/CD Pipeline

```yaml
name: Validate Markers
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install LookAtni CLI
        run: npm install -g lookatni-cli
      - name: Validate all markers
        run: lookatni validate-batch ./markers/ --strict
```

### Automated Testing

```javascript
// Jest test example
import { validateMarkers } from 'lookatni-cli';

test('project markers are valid', async () => {
  const result = await validateMarkers('project-markers.txt');
  expect(result.isValid).toBe(true);
  expect(result.criticalIssues).toHaveLength(0);
});
```

## Performance Monitoring

### Validation Speed

- **Small projects** (< 100 files) - < 1 second
- **Medium projects** (< 1000 files) - < 5 seconds
- **Large projects** (< 10000 files) - < 30 seconds

### Memory Usage

- **Streaming validation** - Constant memory footprint
- **Large files** - Validated in chunks
- **Parallel processing** - Optimized for multi-core systems

## Best Practices

!!! tip "Validation Workflow"
    
    1. **Generate markers** with latest version
    2. **Validate immediately** after generation
    3. **Fix issues** before distribution
    4. **Re-validate** after fixes
    5. **Test extraction** on clean environment

!!! tip "Performance Optimization"
    
    - **Exclude large binaries** from marker generation
    - **Use filters** to validate specific sections
    - **Cache validation results** for repeated checks
    - **Parallel validation** for multiple files

## Troubleshooting

### Common Problems

!!! warning "Validation Timeout"
    ```bash
    # Increase timeout for large projects
    lookatni validate project.txt --timeout=300
    ```

!!! warning "Memory Issues"
    ```bash
    # Use streaming mode for large files
    lookatni validate project.txt --stream
    ```

!!! warning "Path Issues"
    ```bash
    # Normalize paths for cross-platform compatibility
    lookatni validate project.txt --normalize-paths
    ```

---

Next: Explore [Visual Markers](visual-markers.md) for enhanced VS Code experience.
