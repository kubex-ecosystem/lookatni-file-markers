# 🎯 Best Practices

Essential guidelines and proven strategies for optimal LookAtni File Markers usage.

## Project Organization

### File Structure Guidelines

**✅ Recommended Structure:**

```
my-project/
├── src/                    # Source code (always include)
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions
│   ├── types/             # Type definitions
│   └── hooks/             # Custom hooks
├── docs/                  # Documentation (include)
├── tests/                 # Test files (selective)
├── public/                # Static assets (selective)
├── config/                # Configuration files (include)
├── scripts/               # Build/utility scripts (include)
├── package.json           # Always include
├── README.md              # Always include
├── .gitignore             # Include for reference
└── node_modules/          # Never include
```

**🔧 Configuration Example:**

```json
{
  "include": [
    "src/**/*.{ts,tsx,js,jsx}",
    "docs/**/*.{md,mdx}",
    "config/**/*.{json,js,ts}",
    "scripts/**/*.{js,ts,sh}",
    "*.{json,md,yml,yaml}",
    ".gitignore",
    ".env.example"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "*.log",
    ".git/**",
    ".vscode/**",
    "**/*.test.*",
    "**/*.spec.*"
  ]
}
```

### File Naming Conventions

**📁 Consistent Naming:**

- **Descriptive names**: `user-profile-markers.txt` vs `markers.txt`
- **Version indicators**: `project-v1.2.0-markers.txt`
- **Timestamps**: `project-20240712-1430.txt`
- **Environment tags**: `project-prod-stable.txt`

**🏷️ Naming Templates:**

```json
{
  "templates": {
    "development": "{{project}}-dev-{{timestamp}}.txt",
    "staging": "{{project}}-staging-{{version}}.txt", 
    "production": "{{project}}-prod-{{version}}-{{date}}.txt",
    "feature": "{{project}}-feature-{{branch}}-{{timestamp}}.txt"
  }
}
```

## Generation Best Practices

### Smart Filtering Strategies

**🎯 Purpose-Driven Generation:**

=== "Development Sharing"
    ```bash
    # Include everything needed for development
    lookatni generate \
      --include "src/**,docs/**,*.json,*.md" \
      --exclude "**/*.test.*,node_modules/**" \
      --output dev-share.txt
    ```

=== "Production Release"
    ```bash
    # Only production-ready files
    lookatni generate \
      --include "src/**,README.md,package.json,LICENSE" \
      --exclude "**/*.test.*,**/*.spec.*,**/*.stories.*" \
      --output prod-release.txt \
      --compress
    ```

=== "Code Review"
    ```bash
    # Changed files + related tests
    git diff --name-only HEAD~1 | tr '\n' ',' > changed.txt
    lookatni generate \
      --include "$(cat changed.txt),**/*.test.*" \
      --output code-review.txt
    ```

=== "Tutorial/Educational"
    ```bash
    # Complete learning materials
    lookatni generate \
      --include "src/**,docs/**,examples/**,*.md" \
      --exclude "node_modules/**,dist/**" \
      --output tutorial-complete.txt \
      --preserve-structure
    ```

### Performance Optimization

**⚡ Speed Guidelines:**

1. **Use specific patterns** instead of broad includes
2. **Exclude large directories** early in the pattern
3. **Use parallel processing** for large projects
4. **Stream large files** to reduce memory usage

```bash
# Optimized for large projects
lookatni generate \
  --source . \
  --include "src/**/*.{ts,tsx}" \
  --exclude "node_modules/**,dist/**,coverage/**" \
  --parallel=8 \
  --stream \
  --compress
```

**💾 Memory Management:**

```json
{
  "performance": {
    "maxFileSize": "5MB",
    "maxTotalSize": "100MB", 
    "streamThreshold": "1MB",
    "parallelThreads": 4,
    "useTemporaryFiles": true
  }
}
```

## Validation Best Practices

### Comprehensive Validation Strategy

**🔍 Multi-Level Validation:**

```bash
# 1. Quick syntax check
lookatni validate markers.txt

# 2. Detailed analysis
lookatni validate markers.txt --detailed --fix-suggestions

# 3. Strict production validation
lookatni validate markers.txt --strict --report validation.json

# 4. Cross-validation with extraction
lookatni extract markers.txt --dry-run --verbose
```

### Error Prevention

**🛡️ Common Issues Prevention:**

| Issue | Prevention | Solution |
|-------|------------|----------|
| **Large files** | Set size limits | Use `maxFileSize` in config |
| **Binary files** | Exclude patterns | Add `*.{jpg,png,pdf}` to exclude |
| **Path conflicts** | Normalize paths | Use `--normalize-paths` flag |
| **Encoding issues** | Specify encoding | Set `defaultEncoding: "utf-8"` |
| **Missing dependencies** | Include related files | Use dependency analysis |

**⚙️ Preventive Configuration:**

```json
{
  "validation": {
    "strict": true,
    "maxFileSize": "10MB",
    "allowedExtensions": [
      ".js", ".ts", ".jsx", ".tsx", 
      ".json", ".md", ".css", ".html"
    ],
    "requiredFiles": ["package.json", "README.md"],
    "customRules": [
      {
        "pattern": "**/*.{jpg,png,gif}",
        "action": "warn",
        "message": "Binary files should be excluded"
      }
    ]
  }
}
```

## Extraction Best Practices

### Safe Extraction Practices

**🔒 Safety-First Approach:**

```bash
# 1. Always preview first
lookatni extract markers.txt --dry-run

# 2. Extract to clean directory
mkdir -p ./extracted/project-name
lookatni extract markers.txt --output ./extracted/project-name

# 3. Use backup for existing projects
lookatni extract markers.txt --output ./existing-project --backup

# 4. Validate after extraction
lookatni verify markers.txt --extracted ./extracted/project-name
```

### Conflict Resolution Strategies

**🤝 Handling Conflicts:**

=== "Interactive Mode"
    ```bash
    # User decides for each conflict
    lookatni extract markers.txt --interactive
    ```

=== "Safe Mode"
    ```bash
    # Skip existing files, create backups
    lookatni extract markers.txt --skip-existing --backup
    ```

=== "Overwrite Mode"
    ```bash
    # Overwrite with confirmation
    lookatni extract markers.txt --overwrite --verbose
    ```

=== "Merge Mode"
    ```bash
    # Intelligent merging for compatible files
    lookatni extract markers.txt --merge --backup
    ```

## Team Collaboration Guidelines

### Sharing Protocols

**📤 Distribution Best Practices:**

1. **Always validate** before sharing
2. **Include documentation** about the markers
3. **Use descriptive filenames** with context
4. **Provide extraction instructions**
5. **Include version information**

**📋 Sharing Checklist:**

```markdown
## Marker File Checklist

- [ ] Generated with latest LookAtni version
- [ ] Passed strict validation
- [ ] Descriptive filename with version/date
- [ ] Includes README or documentation
- [ ] Tested extraction in clean environment
- [ ] File size reasonable for distribution method
- [ ] Contains only necessary files
- [ ] Sensitive data excluded (.env, secrets, etc.)
```

### Version Control Integration

**🔄 Git Workflow:**

```bash
# .gitignore additions
markers/
*.markers.txt
temp-extraction/

# Pre-commit hook example
#!/bin/sh
# Validate any marker files before commit
if ls *.txt 1> /dev/null 2>&1; then
  for file in *.txt; do
    if [[ $file == *"markers"* ]]; then
      echo "Validating $file..."
      lookatni validate "$file" --strict || exit 1
    fi
  done
fi
```

## Security Best Practices

### Data Protection

**🔐 Security Guidelines:**

1. **Never include sensitive data**:
   - API keys, passwords, tokens
   - Database credentials
   - Private certificates
   - Personal information

2. **Use exclusion patterns**:
   ```json
   {
     "exclude": [
       "**/.env*",
       "**/secrets/**",
       "**/*.key",
       "**/*.pem",
       "**/config/production.*"
     ]
   }
   ```

3. **Validate before sharing**:
   ```bash
   # Security scan
   lookatni validate markers.txt --security-scan
   
   # Check for sensitive patterns
   grep -i "password\|secret\|key\|token" markers.txt
   ```

### Access Control

**👥 Sharing Permissions:**

- **Internal projects**: Team access only
- **Open source**: Public safe files only
- **Client work**: Explicit permission required
- **Educational**: Remove proprietary code

## Performance Guidelines

### Optimization Strategies

**🚀 Speed Optimization:**

| Project Size | Strategy | Configuration |
|-------------|----------|---------------|
| **Small** (<10MB) | Standard | Default settings |
| **Medium** (10-100MB) | Selective | Filter patterns, parallel processing |
| **Large** (100MB+) | Optimized | Streaming, compression, chunking |
| **Enterprise** (1GB+) | Advanced | Custom scripts, incremental processing |

**⚙️ Large Project Configuration:**

```json
{
  "performance": {
    "parallel": true,
    "threads": 8,
    "streaming": true,
    "compression": true,
    "chunkSize": "10MB",
    "tempDirectory": "/tmp/lookatni",
    "maxMemory": "4GB"
  }
}
```

### Resource Management

**💾 Memory & Storage:**

```bash
# Monitor resource usage
lookatni generate --source . --monitor-resources

# Set limits
lookatni generate \
  --source . \
  --max-memory=2GB \
  --max-files=10000 \
  --timeout=300

# Cleanup temporary files
lookatni cleanup --temp-files --older-than=1h
```

## Quality Assurance

### Testing Workflows

**🧪 QA Process:**

1. **Generation Testing**:
   ```bash
   # Test with different configurations
   lookatni generate --source . --config dev.json --dry-run
   lookatni generate --source . --config prod.json --dry-run
   ```

2. **Validation Testing**:
   ```bash
   # Test all validation levels
   lookatni validate markers.txt --quick
   lookatni validate markers.txt --detailed
   lookatni validate markers.txt --strict
   ```

3. **Extraction Testing**:
   ```bash
   # Test extraction in isolated environment
   docker run --rm -v $(pwd):/work alpine:latest sh -c "
     cd /work && 
     lookatni extract markers.txt --output /tmp/test &&
     ls -la /tmp/test
   "
   ```

### Automated Testing

**🤖 CI/CD Testing:**

```yaml
# GitHub Actions example
- name: Test Marker Generation
  run: |
    # Generate test markers
    lookatni generate --source ./test-project --output test.txt
    
    # Validate
    lookatni validate test.txt --strict
    
    # Test extraction
    lookatni extract test.txt --output ./extracted --dry-run
    
    # Verify integrity
    lookatni verify test.txt --extracted ./extracted
```

## Troubleshooting Guide

### Common Issues & Solutions

**❌ File Too Large Error:**
```bash
# Solution: Use compression and filtering
lookatni generate --compress --max-file-size=5MB
```

**❌ Permission Denied:**
```bash
# Solution: Check directory permissions
chmod 755 output-directory
lookatni extract --output ./safe-directory
```

**❌ Invalid Path Characters:**
```bash
# Solution: Normalize paths
lookatni generate --normalize-paths --cross-platform
```

**❌ Memory Issues:**
```bash
# Solution: Use streaming mode
lookatni generate --stream --max-memory=1GB
```

---

Next: Explore [Advanced Topics](../advanced/architecture.md) for technical deep-dive.
