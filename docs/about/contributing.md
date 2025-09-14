# 🤝 Contributing to LookAtni File Markers

Welcome to the LookAtni File Markers project! We're excited that you're interested in contributing. This guide will help you get started with contributing to our VS Code extension and documentation.

## 🎯 Ways to Contribute

### 🐛 Report Bugs

Help us improve by reporting bugs you encounter:

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Include reproduction steps** and environment details
4. **Provide sample files** when relevant

#### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g. Windows 10, macOS 12, Ubuntu 20.04]
- VS Code Version: [e.g. 1.80.0]
- Extension Version: [e.g. 1.0.6]

**Additional Context**
Any other relevant information.
```

### 💡 Suggest Features

We welcome feature suggestions:

1. **Search existing feature requests** to avoid duplicates
2. **Use the feature request template**
3. **Explain the use case** and business value
4. **Provide implementation ideas** if you have them

#### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've considered.

**Additional context**
Any other context about the feature request.
```

### 🔧 Contribute Code

#### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/kubex-ecosystem/lookatni-file-markers.git
   cd lookatni-file-markers
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up development environment**:
   ```bash
   # Start TypeScript compilation in watch mode
   npm run watch:tsc
   
   # Start esbuild bundling in watch mode
   npm run watch:esbuild
   ```

5. **Open in VS Code**:
   ```bash
   code .
   ```

6. **Press F5** to launch Extension Development Host

#### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   # Run tests
   npm test
   
   # Test in Extension Development Host
   # Press F5 in VS Code
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### 📚 Improve Documentation

Documentation improvements are always welcome:

1. **Fix typos and grammar** errors
2. **Add missing examples** and clarifications
3. **Improve existing tutorials** and guides
4. **Create new tutorials** for advanced features
5. **Update screenshots** and visual content

#### Documentation Structure

```
docs-site/docs/
├── index.md                 # Homepage
├── features/               # Feature documentation
├── guide/                  # User guides and tutorials
├── advanced/               # Advanced topics
├── about/                  # Project information
└── examples/               # Real-world examples
```

#### Running Documentation Locally

```bash
cd docs-site
uv run mkdocs serve
```

## 🎨 Code Style Guide

### TypeScript Guidelines

#### File Organization

```typescript
// 1. Imports - grouped and sorted
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { ConfigManager } from '../utils/configManager';
import { Logger } from '../utils/logger';

// 2. Types and interfaces
interface MarkerOptions {
    includeMetadata: boolean;
    compressionLevel: number;
}

// 3. Constants
const DEFAULT_OPTIONS: MarkerOptions = {
    includeMetadata: true,
    compressionLevel: 1
};

// 4. Main implementation
export class MarkerGenerator {
    // Implementation
}
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class MarkerGenerator {}

// Functions and variables: camelCase
function generateMarkers() {}
const fileCount = 10;

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024;

// Interfaces: PascalCase with 'I' prefix (optional)
interface IMarkerConfig {}
// or simply
interface MarkerConfig {}

// Enums: PascalCase
enum FileType {
    Text,
    Binary,
    Archive
}
```

#### Function Documentation

```typescript
/**
 * Generates marker files for the specified directory.
 * 
 * @param sourcePath - The path to the source directory
 * @param options - Configuration options for marker generation
 * @returns Promise that resolves to the generated marker file path
 * 
 * @example
 * ```typescript
 * const markerPath = await generateMarkers('/path/to/project', {
 *     includeMetadata: true,
 *     compressionLevel: 2
 * });
 * ```
 */
async function generateMarkers(
    sourcePath: string, 
    options: MarkerOptions
): Promise<string> {
    // Implementation
}
```

#### Error Handling

```typescript
// Use specific error types
class MarkerGenerationError extends Error {
    constructor(
        message: string,
        public readonly sourcePath: string,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = 'MarkerGenerationError';
    }
}

// Handle errors gracefully
try {
    const result = await generateMarkers(sourcePath, options);
    return result;
} catch (error) {
    if (error instanceof MarkerGenerationError) {
        Logger.error(`Failed to generate markers: ${error.message}`);
        throw error;
    } else {
        Logger.error(`Unexpected error: ${error}`);
        throw new MarkerGenerationError(
            'Unexpected error during marker generation',
            sourcePath,
            error
        );
    }
}
```

### VS Code Extension Guidelines

#### Command Implementation

```typescript
// Command registration
export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'lookatni.generateMarkers',
        async (uri?: vscode.Uri) => {
            try {
                await generateMarkersCommand(uri);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to generate markers: ${error.message}`
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

// Command implementation
async function generateMarkersCommand(uri?: vscode.Uri): Promise<void> {
    const sourcePath = uri?.fsPath || vscode.workspace.rootPath;
    
    if (!sourcePath) {
        throw new Error('No workspace folder selected');
    }

    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating markers...',
        cancellable: true
    }, async (progress, token) => {
        // Implementation with progress updates
        progress.report({ increment: 0, message: 'Scanning files...' });
        
        // Check for cancellation
        if (token.isCancellationRequested) {
            return;
        }
        
        // Continue implementation...
    });
}
```

#### Configuration Management

```typescript
// Type-safe configuration access
interface ExtensionConfig {
    includeMetadata: boolean;
    compressionLevel: number;
    excludePatterns: string[];
}

function getConfiguration(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration('lookatni');
    
    return {
        includeMetadata: config.get<boolean>('includeMetadata', true),
        compressionLevel: config.get<number>('compressionLevel', 1),
        excludePatterns: config.get<string[]>('excludePatterns', [])
    };
}
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// test/unit/markerGenerator.test.ts
import * as assert from 'assert';
import { MarkerGenerator } from '../../src/utils/markerGenerator';

describe('MarkerGenerator', () => {
    let generator: MarkerGenerator;

    beforeEach(() => {
        generator = new MarkerGenerator();
    });

    it('should generate markers for simple project', async () => {
        const result = await generator.generate('/test/project');
        
        assert.ok(result);
        assert.ok(result.includes('// === File:'));
    });

    it('should handle binary files correctly', async () => {
        // Test implementation
    });
});
```

### Integration Tests

```typescript
// test/integration/extension.test.ts
import * as vscode from 'vscode';
import * as assert from 'assert';

describe('Extension Integration Tests', () => {
    it('should activate extension successfully', async () => {
        const extension = vscode.extensions.getExtension('rafa-mori.lookatni-file-markers');
        
        assert.ok(extension);
        await extension.activate();
        assert.ok(extension.isActive);
    });

    it('should register all commands', async () => {
        const commands = await vscode.commands.getCommands();
        
        assert.ok(commands.includes('lookatni.generateMarkers'));
        assert.ok(commands.includes('lookatni.extractFiles'));
        // ... test other commands
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "MarkerGenerator"

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📋 Pull Request Guidelines

### Before Submitting

1. **Ensure all tests pass**:
   ```bash
   npm test
   ```

2. **Check code formatting**:
   ```bash
   npm run lint
   npm run format
   ```

3. **Update documentation** if needed

4. **Add tests** for new functionality

5. **Update changelog** for significant changes

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Documentation review** if applicable
5. **Final approval** and merge

## 🏗️ Project Structure

### Core Extension

```
src/
├── extension.ts           # Main extension entry point
├── commands/             # VS Code commands
│   ├── generateMarkers.ts
│   ├── extractFiles.ts
│   ├── validateMarkers.ts
│   └── ...
├── utils/               # Utility modules
│   ├── configManager.ts
│   ├── logger.ts
│   ├── markerGenerator.ts
│   └── ...
├── views/               # VS Code views and providers
│   └── explorerProvider.ts
└── test/                # Test files
    ├── unit/
    ├── integration/
    └── fixtures/
```

### Documentation

```
docs-site/
├── docs/                # Documentation content
├── mkdocs.yml          # MkDocs configuration
├── pyproject.toml      # Python dependencies
└── overrides/          # Custom templates and assets
```

### Configuration Files

```
├── package.json         # Extension manifest and dependencies
├── tsconfig.json       # TypeScript configuration
├── eslint.config.mjs   # ESLint configuration
├── esbuild.js          # Build configuration
└── .github/            # GitHub workflows and templates
```

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.0.6)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version** in `package.json`
2. **Update changelog** with new features and fixes
3. **Create release branch**:
   ```bash
   git checkout -b release/v1.0.7
   ```

4. **Final testing** and validation
5. **Create GitHub release** with release notes
6. **Publish to VS Code Marketplace**:
   ```bash
   vsce publish
   ```

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Be constructive** in feedback and discussions
- **Be patient** with new contributors
- **Be helpful** and supportive

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussion
- **Pull Request Reviews**: Code-related discussions

### Recognition

Contributors are recognized in:

- **Changelog**: Credit for significant contributions
- **README**: Contributors section
- **Release Notes**: Special mentions for major contributions

---

## 🎓 Learning Resources

### Getting Started with VS Code Extensions

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### TypeScript Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

### Testing Resources

- [Mocha Testing Framework](https://mochajs.org/)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

---

Thank you for contributing to LookAtni File Markers! Your contributions help make this tool better for everyone. 🙏
