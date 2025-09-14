# ⚙️ Configuration Guide

Comprehensive configuration options for customizing LookAtni File Markers to fit your workflow.

## Configuration Levels

LookAtni supports configuration at multiple levels, with the following priority order:

1. **Command-line arguments** (highest priority)
2. **Workspace settings** (VS Code workspace)
3. **User settings** (VS Code global)
4. **Project configuration** (`.lookatni.json`)
5. **Global defaults** (lowest priority)

## VS Code Settings

### Basic Settings

```json
{
  // File generation settings
  "lookatni.generation.autoInclude": [
    "src/**",
    "docs/**",
    "*.json",
    "*.md"
  ],
  "lookatni.generation.autoExclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "*.log",
    ".git/**"
  ],
  
  // Output settings
  "lookatni.output.defaultDirectory": "./markers",
  "lookatni.output.filenameTemplate": "{{project}}-{{timestamp}}.txt",
  "lookatni.output.compressOutput": true,
  
  // Validation settings
  "lookatni.validation.strictMode": true,
  "lookatni.validation.maxFileSize": "10MB",
  "lookatni.validation.validateOnSave": true
}
```

### Visual Settings

```json
{
  // Visual markers
  "lookatni.visual.enableSyntaxHighlighting": true,
  "lookatni.visual.showFileTree": true,
  "lookatni.visual.enableHoverInfo": true,
  "lookatni.visual.colorScheme": "material",
  
  // Editor integration
  "lookatni.editor.showInlinePreview": true,
  "lookatni.editor.enableCodeFolding": true,
  "lookatni.editor.showLineNumbers": true,
  
  // Performance
  "lookatni.performance.enableForLargeFiles": false,
  "lookatni.performance.maxFileSizeForVisual": "5MB",
  "lookatni.performance.lazyLoading": true
}
```

### Automation Settings

```json
{
  // Auto-generation
  "lookatni.auto.generateOnSave": false,
  "lookatni.auto.generateOnBuild": true,
  "lookatni.auto.validateAfterGeneration": true,
  
  // Demo settings
  "lookatni.demo.autoSpeed": "normal",
  "lookatni.demo.showSteps": true,
  "lookatni.demo.pauseBetweenActions": 1000,
  
  // CLI integration
  "lookatni.cli.useGlobalInstall": true,
  "lookatni.cli.defaultArguments": "--verbose --preserve-structure"
}
```

## Project Configuration

### `.lookatni.json` File

Create a `.lookatni.json` file in your project root:

```json
{
  "version": "1.0",
  "name": "my-react-app",
  "description": "React application with TypeScript",
  
  "include": [
    "src/**/*.{ts,tsx,js,jsx}",
    "public/**/*.{html,css,js}",
    "*.{json,md,yml,yaml}",
    "docs/**/*.md"
  ],
  
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "*.log",
    ".git/**",
    ".vscode/**",
    "*.test.{ts,tsx,js,jsx}"
  ],
  
  "output": {
    "directory": "./markers",
    "filename": "{{project}}-{{version}}-{{timestamp}}.txt",
    "compress": true,
    "includeMetadata": true,
    "preserveStructure": true
  },
  
  "validation": {
    "strict": true,
    "maxFileSize": "10MB",
    "allowedExtensions": [
      ".ts", ".tsx", ".js", ".jsx",
      ".json", ".md", ".html", ".css",
      ".yml", ".yaml"
    ],
    "requiredFiles": [
      "package.json",
      "README.md"
    ],
    "customRules": [
      {
        "pattern": "src/**/*.test.*",
        "action": "exclude",
        "reason": "Test files should not be included in production markers"
      }
    ]
  },
  
  "templates": {
    "header": "# {{project}} - {{description}}\\nGenerated: {{timestamp}}\\n",
    "fileMarker": "=== {{path}} ===",
    "footer": "\\n# End of {{project}} markers"
  },
  
  "presets": {
    "development": {
      "include": ["src/**", "docs/**", "*.json"],
      "exclude": ["**/*.test.*"],
      "validation": { "strict": false }
    },
    "production": {
      "include": ["src/**", "README.md", "package.json"],
      "exclude": ["**/*.test.*", "**/*.spec.*", "docs/**"],
      "validation": { "strict": true }
    }
  }
}
```

### Configuration Schemas

LookAtni includes JSON schemas for validation:

```json
{
  "$schema": "https://raw.githubusercontent.com/rafa-mori/lookatni-file-markers/main/schemas/config.schema.json",
  "version": "1.0",
  // ... your configuration
}
```

## Advanced Configuration

### File Filters

#### Glob Patterns

```json
{
  "include": [
    "src/**/*.{ts,tsx}",        // TypeScript files in src
    "!src/**/*.test.*",         // Exclude test files
    "docs/**/*.{md,mdx}",       // Documentation files
    "*.{json,yml,yaml}",        // Config files in root
    "public/**/*.!(*.map)"      // Public files except source maps
  ]
}
```

#### Dynamic Filters

```json
{
  "filters": {
    "typescript": {
      "include": ["**/*.{ts,tsx}"],
      "exclude": ["**/*.d.ts"]
    },
    "documentation": {
      "include": ["**/*.{md,mdx}", "**/README*"],
      "exclude": ["node_modules/**"]
    },
    "configuration": {
      "include": [
        "*.{json,yml,yaml,toml}",
        ".env*",
        ".*rc*"
      ]
    }
  },
  
  "activeFilters": ["typescript", "documentation", "configuration"]
}
```

### Template System

#### Custom Templates

```json
{
  "templates": {
    "fileHeader": [
      "╔══════════════════════════════════════════════════════════════════╗",
      "║ FILE: {{path}}",
      "║ SIZE: {{size}} | MODIFIED: {{modified}}",
      "║ TYPE: {{type}} | ENCODING: {{encoding}}",
      "╚══════════════════════════════════════════════════════════════════╝"
    ],
    
    "directoryHeader": [
      "📁 DIRECTORY: {{path}}",
      "   Files: {{fileCount}} | Size: {{totalSize}}"
    ],
    
    "projectHeader": [
      "🚀 PROJECT: {{name}}",
      "📄 Description: {{description}}",
      "🕒 Generated: {{timestamp}}",
      "📊 Total Files: {{totalFiles}} | Total Size: {{totalSize}}",
      ""
    ]
  }
}
```

#### Variable Substitution

Available template variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{project}}` | Project name | `my-react-app` |
| `{{version}}` | Project version | `1.0.0` |
| `{{timestamp}}` | Generation time | `2024-07-12T10:30:00Z` |
| `{{path}}` | File/directory path | `src/components/Header.tsx` |
| `{{size}}` | File size | `2.4 KB` |
| `{{modified}}` | Last modified time | `2024-07-12T09:15:00Z` |
| `{{type}}` | File type | `typescript` |
| `{{encoding}}` | File encoding | `utf-8` |
| `{{fileCount}}` | Number of files | `156` |
| `{{totalSize}}` | Total project size | `1.2 MB` |

### Environment-Specific Configuration

#### Multiple Environments

```json
{
  "environments": {
    "development": {
      "include": ["src/**", "tests/**", "docs/**"],
      "output": {
        "directory": "./dev-markers",
        "filename": "dev-{{timestamp}}.txt"
      },
      "validation": { "strict": false }
    },
    
    "staging": {
      "include": ["src/**", "docs/**"],
      "exclude": ["**/*.test.*"],
      "output": {
        "directory": "./staging-markers",
        "compress": true
      },
      "validation": { "strict": true }
    },
    
    "production": {
      "include": ["src/**"],
      "exclude": ["**/*.test.*", "**/*.spec.*", "**/*.stories.*"],
      "output": {
        "directory": "./prod-markers",
        "filename": "prod-{{version}}-{{timestamp}}.txt",
        "compress": true,
        "includeMetadata": false
      },
      "validation": {
        "strict": true,
        "maxFileSize": "5MB"
      }
    }
  },
  
  "defaultEnvironment": "development"
}
```

#### Environment Variables

```bash
# Set environment
export LOOKATNI_ENV=production

# Override settings
export LOOKATNI_OUTPUT_DIR=./custom-markers
export LOOKATNI_COMPRESS=true
export LOOKATNI_STRICT_VALIDATION=true
```

## Integration Configuration

### Git Integration

```json
{
  "git": {
    "respectGitignore": true,
    "includeGitInfo": true,
    "excludeGitFiles": true,
    "customIgnoreFile": ".lookatniignore"
  }
}
```

### IDE Integration

```json
{
  "ide": {
    "vscode": {
      "enableExtension": true,
      "showInExplorer": true,
      "enableCommands": true,
      "keybindings": {
        "generateMarkers": "ctrl+shift+g",
        "extractFiles": "ctrl+shift+e",
        "validateMarkers": "ctrl+shift+v"
      }
    },
    
    "intellij": {
      "enablePlugin": false
    }
  }
}
```

### Build Tool Integration

#### Webpack

```javascript
// webpack.config.js
const LookAtniPlugin = require('lookatni-webpack-plugin');

module.exports = {
  plugins: [
    new LookAtniPlugin({
      configFile: './.lookatni.json',
      environment: process.env.NODE_ENV,
      generateOnBuild: true,
      outputPath: './dist/markers'
    })
  ]
};
```

#### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import lookatni from 'vite-plugin-lookatni';

export default defineConfig({
  plugins: [
    lookatni({
      include: ['src/**'],
      exclude: ['**/*.test.*'],
      outputDir: './dist/markers'
    })
  ]
});
```

## Troubleshooting Configuration

### Validation

```bash
# Validate configuration file
lookatni config validate .lookatni.json

# Check effective configuration
lookatni config show --environment production

# Test configuration
lookatni config test .lookatni.json --dry-run
```

### Common Issues

!!! warning "Configuration Not Applied"
    ```bash
    # Check configuration precedence
    lookatni config debug
    
    # Force reload configuration
    lookatni config reload
    ```

!!! warning "Invalid Glob Patterns"
    ```bash
    # Test glob patterns
    lookatni test-pattern "src/**/*.{ts,tsx}"
    
    # Show matched files
    lookatni list-files --pattern "src/**/*.{ts,tsx}"
    ```

!!! warning "Performance Issues"
    ```json
    // Optimize for large projects
    {
      "performance": {
        "maxFiles": 10000,
        "maxFileSize": "1MB",
        "parallelProcessing": true,
        "streamLargeFiles": true
      }
    }
    ```

---

Next: Learn about [Commands Guide](commands.md) for detailed command usage.
