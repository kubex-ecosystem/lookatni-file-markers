# 📜 TypeScript Scripts

Advanced TypeScript scripts for automation, customization, and integration with LookAtni File Markers.

## Core TypeScript API

### Installation & Setup

```bash
# Install TypeScript API
npm install lookatni-core

# Install type definitions
npm install @types/lookatni-core
```

### Basic Usage

```typescript
import { LookAtni, GenerateOptions, ExtractOptions } from 'lookatni-core';

// Initialize LookAtni instance
const lookatni = new LookAtni({
  version: '1.0',
  enableLogging: true,
  tempDirectory: './temp'
});

// Generate markers
const generateOptions: GenerateOptions = {
  source: './my-project',
  output: './markers/project.txt',
  include: ['src/**/*.ts', 'docs/**/*.md'],
  exclude: ['node_modules/**', '**/*.test.*'],
  compress: true,
  preserveStructure: true
};

const result = await lookatni.generate(generateOptions);
console.log(`Generated ${result.fileCount} files`);
```

## Custom Generation Scripts

### Automated Project Packaging

```typescript
// scripts/package-project.ts
import { LookAtni, FileScanner, ProjectAnalyzer } from 'lookatni-core';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';

interface PackageConfig {
  name: string;
  version: string;
  environments: {
    [key: string]: {
      include: string[];
      exclude: string[];
      compress: boolean;
    };
  };
}

class ProjectPackager {
  private lookatni: LookAtni;
  private config: PackageConfig;

  constructor(configPath: string) {
    this.lookatni = new LookAtni();
    this.config = require(configPath);
  }

  async packageAllEnvironments(): Promise<void> {
    for (const [env, settings] of Object.entries(this.config.environments)) {
      console.log(`📦 Packaging ${env} environment...`);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFile = `${this.config.name}-${env}-${this.config.version}-${timestamp}.txt`;
      
      await this.packageEnvironment(env, settings, outputFile);
    }
  }

  private async packageEnvironment(
    environment: string, 
    settings: any, 
    outputFile: string
  ): Promise<void> {
    // Analyze project structure first
    const analyzer = new ProjectAnalyzer();
    const analysis = await analyzer.analyze('./');
    
    // Generate environment-specific markers
    const result = await this.lookatni.generate({
      source: './',
      output: `./packages/${outputFile}`,
      include: settings.include,
      exclude: settings.exclude,
      compress: settings.compress,
      metadata: {
        environment,
        analysis: analysis.summary,
        buildInfo: {
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });

    // Validate the generated package
    const validation = await this.lookatni.validate(`./packages/${outputFile}`);
    
    if (!validation.isValid) {
      throw new Error(`Package validation failed: ${validation.errors.join(', ')}`);
    }

    console.log(`✅ ${environment} package created: ${outputFile}`);
    console.log(`   Files: ${result.fileCount}, Size: ${result.totalSize}`);
  }
}

// Usage
async function main() {
  const packager = new ProjectPackager('./package-config.json');
  await packager.packageAllEnvironments();
}

main().catch(console.error);
```

### Smart Dependency Bundler

```typescript
// scripts/dependency-bundler.ts
import { DependencyAnalyzer, FileGraph } from 'lookatni-core';
import * as ts from 'typescript';

class SmartDependencyBundler {
  private dependencyAnalyzer: DependencyAnalyzer;
  
  constructor() {
    this.dependencyAnalyzer = new DependencyAnalyzer();
  }

  async createComponentBundle(componentPath: string): Promise<string[]> {
    // Analyze TypeScript dependencies
    const sourceFile = ts.createSourceFile(
      componentPath,
      await fs.readFile(componentPath, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );

    const dependencies = this.extractDependencies(sourceFile);
    const fileGraph = await this.buildDependencyGraph(dependencies);
    
    return this.resolveBundleFiles(fileGraph);
  }

  private extractDependencies(sourceFile: ts.SourceFile): string[] {
    const dependencies: string[] = [];
    
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
          dependencies.push(moduleSpecifier.text);
        }
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return dependencies;
  }

  private async buildDependencyGraph(dependencies: string[]): Promise<FileGraph> {
    return await this.dependencyAnalyzer.buildGraph({
      entryPoints: dependencies,
      resolveOptions: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: ['node_modules', 'src']
      }
    });
  }

  private resolveBundleFiles(graph: FileGraph): string[] {
    // Topological sort to determine bundle order
    return graph.getTopologicalOrder();
  }
}

// Usage example
const bundler = new SmartDependencyBundler();
const files = await bundler.createComponentBundle('./src/components/UserProfile.tsx');

const lookatni = new LookAtni();
await lookatni.generate({
  source: './',
  include: files,
  output: './bundles/user-profile-component.txt',
  preserveStructure: true
});
```

## Custom Validation Scripts

### Advanced Validation Framework

```typescript
// scripts/custom-validator.ts
import { ValidationRule, ValidationContext, ValidationResult } from 'lookatni-core';

class CustomValidationRules {
  static securityRule: ValidationRule = {
    name: 'security-check',
    description: 'Check for sensitive data in files',
    severity: 'error',
    
    async validate(context: ValidationContext): Promise<ValidationResult> {
      const sensitivePatterns = [
        /(?:password|pwd|pass)\s*[:=]\s*['\"]?([^'\"\\s]+)/gi,
        /(?:api[_-]?key|apikey)\s*[:=]\s*['\"]?([^'\"\\s]+)/gi,
        /(?:secret|token)\s*[:=]\s*['\"]?([^'\"\\s]+)/gi
      ];

      const violations = [];
      
      for (const file of context.files) {
        for (const pattern of sensitivePatterns) {
          const matches = file.content.match(pattern);
          if (matches) {
            violations.push({
              file: file.path,
              line: this.findLineNumber(file.content, matches[0]),
              message: `Potential sensitive data: ${matches[0]}`,
              suggestion: 'Use environment variables or config files'
            });
          }
        }
      }

      return {
        passed: violations.length === 0,
        violations
      };
    },

    findLineNumber(content: string, match: string): number {
      const lines = content.substring(0, content.indexOf(match)).split('\n');
      return lines.length;
    }
  };

  static consistencyRule: ValidationRule = {
    name: 'naming-consistency',
    description: 'Enforce consistent file naming',
    severity: 'warning',
    
    async validate(context: ValidationContext): Promise<ValidationResult> {
      const violations = [];
      const patterns = {
        components: /^[A-Z][a-zA-Z]*\.(tsx?|jsx?)$/,
        utils: /^[a-z][a-zA-Z]*\.(ts|js)$/,
        tests: /^[a-zA-Z]+\.(test|spec)\.(ts|js)$/
      };

      for (const file of context.files) {
        const relativePath = file.path;
        
        if (relativePath.includes('/components/')) {
          if (!patterns.components.test(path.basename(relativePath))) {
            violations.push({
              file: file.path,
              message: 'Component files should use PascalCase',
              suggestion: 'Rename to PascalCase format (e.g., UserProfile.tsx)'
            });
          }
        }
        
        if (relativePath.includes('/utils/')) {
          if (!patterns.utils.test(path.basename(relativePath))) {
            violations.push({
              file: file.path,
              message: 'Utility files should use camelCase',
              suggestion: 'Rename to camelCase format (e.g., formatDate.ts)'
            });
          }
        }
      }

      return {
        passed: violations.length === 0,
        violations
      };
    }
  };
}

// Custom validator implementation
class ProjectValidator {
  private rules: ValidationRule[] = [
    CustomValidationRules.securityRule,
    CustomValidationRules.consistencyRule
  ];

  async validateProject(markerFile: string): Promise<void> {
    const lookatni = new LookAtni();
    const markers = await lookatni.parseMarkers(markerFile);
    
    const context: ValidationContext = {
      files: markers.entries,
      projectMetadata: markers.metadata,
      config: markers.config
    };

    console.log('🔍 Running custom validation rules...');
    
    for (const rule of this.rules) {
      console.log(`  Checking: ${rule.description}`);
      
      const result = await rule.validate(context);
      
      if (!result.passed) {
        console.log(`  ❌ ${rule.name}: ${result.violations.length} violations`);
        this.reportViolations(result.violations, rule.severity);
      } else {
        console.log(`  ✅ ${rule.name}: passed`);
      }
    }
  }

  private reportViolations(violations: any[], severity: string): void {
    violations.forEach(violation => {
      const icon = severity === 'error' ? '🚨' : '⚠️';
      console.log(`    ${icon} ${violation.file}:${violation.line || '?'}`);
      console.log(`       ${violation.message}`);
      if (violation.suggestion) {
        console.log(`       💡 ${violation.suggestion}`);
      }
    });
  }
}

// Usage
const validator = new ProjectValidator();
await validator.validateProject('./project-markers.txt');
```

## Extraction Automation Scripts

### Intelligent Extraction Manager

```typescript
// scripts/extraction-manager.ts
import { ExtractionStrategy, ConflictResolver } from 'lookatni-core';
import * as inquirer from 'inquirer';

class IntelligentExtractionManager {
  private strategies: Map<string, ExtractionStrategy> = new Map();
  
  constructor() {
    this.setupStrategies();
  }

  private setupStrategies(): void {
    // Safe extraction strategy
    this.strategies.set('safe', {
      name: 'Safe Extraction',
      description: 'Never overwrites existing files',
      
      async extract(markers: any, outputPath: string): Promise<void> {
        const existingFiles = await this.scanExistingFiles(outputPath);
        const conflicts = this.detectConflicts(markers.entries, existingFiles);
        
        if (conflicts.length > 0) {
          console.log(`⚠️ Found ${conflicts.length} potential conflicts`);
          const resolution = await this.promptConflictResolution(conflicts);
          
          if (resolution === 'abort') {
            throw new Error('Extraction aborted due to conflicts');
          }
        }
        
        await this.extractWithBackups(markers, outputPath);
      }
    });

    // Merge extraction strategy
    this.strategies.set('merge', {
      name: 'Intelligent Merge',
      description: 'Attempts to merge compatible files',
      
      async extract(markers: any, outputPath: string): Promise<void> {
        for (const entry of markers.entries) {
          const targetPath = path.join(outputPath, entry.path);
          
          if (await this.fileExists(targetPath)) {
            if (await this.canMerge(entry, targetPath)) {
              await this.mergeFiles(entry, targetPath);
            } else {
              await this.handleConflict(entry, targetPath);
            }
          } else {
            await this.extractFile(entry, targetPath);
          }
        }
      }
    });
  }

  async extractWithStrategy(
    markerFile: string, 
    outputPath: string, 
    strategyName: string
  ): Promise<void> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${strategyName}`);
    }

    console.log(`🚀 Using strategy: ${strategy.name}`);
    console.log(`   ${strategy.description}`);
    
    const lookatni = new LookAtni();
    const markers = await lookatni.parseMarkers(markerFile);
    
    await strategy.extract(markers, outputPath);
    
    console.log('✅ Extraction completed successfully');
  }

  private async promptConflictResolution(conflicts: any[]): Promise<string> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'resolution',
        message: `How should conflicts be handled?`,
        choices: [
          { name: 'Create backups and overwrite', value: 'backup' },
          { name: 'Skip conflicting files', value: 'skip' },
          { name: 'Abort extraction', value: 'abort' },
          { name: 'Review each conflict individually', value: 'individual' }
        ]
      }
    ]);
    
    return answers.resolution;
  }

  private async canMerge(entry: any, existingPath: string): Promise<boolean> {
    // Check if files can be intelligently merged
    const existingContent = await fs.readFile(existingPath, 'utf8');
    
    // Simple merge compatibility check
    if (entry.type === 'json') {
      return this.canMergeJson(entry.content, existingContent);
    }
    
    if (entry.type === 'markdown') {
      return true; // Markdown can usually be safely appended
    }
    
    return false; // Default to no merge for code files
  }

  private canMergeJson(newContent: string, existingContent: string): boolean {
    try {
      const newObj = JSON.parse(newContent);
      const existingObj = JSON.parse(existingContent);
      
      // Check for key conflicts
      const newKeys = Object.keys(newObj);
      const existingKeys = Object.keys(existingObj);
      const conflicts = newKeys.filter(key => existingKeys.includes(key));
      
      return conflicts.length === 0;
    } catch {
      return false;
    }
  }

  private async mergeFiles(entry: any, targetPath: string): Promise<void> {
    console.log(`🔀 Merging ${entry.path}...`);
    
    if (entry.type === 'json') {
      await this.mergeJsonFiles(entry, targetPath);
    } else if (entry.type === 'markdown') {
      await this.mergeMarkdownFiles(entry, targetPath);
    }
  }

  private async mergeJsonFiles(entry: any, targetPath: string): Promise<void> {
    const existingContent = await fs.readFile(targetPath, 'utf8');
    const existingObj = JSON.parse(existingContent);
    const newObj = JSON.parse(entry.content);
    
    const merged = { ...existingObj, ...newObj };
    await fs.writeFile(targetPath, JSON.stringify(merged, null, 2));
  }

  private async mergeMarkdownFiles(entry: any, targetPath: string): Promise<void> {
    const existingContent = await fs.readFile(targetPath, 'utf8');
    const separator = '\n\n---\n\n';
    const merged = existingContent + separator + entry.content;
    
    await fs.writeFile(targetPath, merged);
  }
}

// Usage
const manager = new IntelligentExtractionManager();
await manager.extractWithStrategy(
  './project-markers.txt', 
  './output', 
  'merge'
);
```

## Integration Scripts

### CI/CD Integration

```typescript
// scripts/ci-integration.ts
import { LookAtni, ContinuousIntegration } from 'lookatni-core';

class CIIntegration {
  private lookatni: LookAtni;
  private ci: ContinuousIntegration;

  constructor() {
    this.lookatni = new LookAtni();
    this.ci = new ContinuousIntegration();
  }

  async runBuildPipeline(): Promise<void> {
    console.log('🚀 Starting LookAtni CI Pipeline...');
    
    try {
      // Step 1: Generate markers for current build
      await this.generateBuildMarkers();
      
      // Step 2: Validate generated markers
      await this.validateMarkers();
      
      // Step 3: Run integration tests
      await this.runIntegrationTests();
      
      // Step 4: Create release artifacts
      await this.createReleaseArtifacts();
      
      console.log('✅ CI Pipeline completed successfully');
      
    } catch (error) {
      console.error('❌ CI Pipeline failed:', error);
      process.exit(1);
    }
  }

  private async generateBuildMarkers(): Promise<void> {
    const buildInfo = this.ci.getBuildInfo();
    
    await this.lookatni.generate({
      source: './',
      output: `./artifacts/build-${buildInfo.number}.txt`,
      include: ['src/**', 'docs/**', '*.json', '*.md'],
      exclude: ['node_modules/**', 'coverage/**', '**/*.test.*'],
      metadata: {
        buildNumber: buildInfo.number,
        commitSha: buildInfo.commitSha,
        branch: buildInfo.branch,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async validateMarkers(): Promise<void> {
    const buildInfo = this.ci.getBuildInfo();
    const markerFile = `./artifacts/build-${buildInfo.number}.txt`;
    
    const result = await this.lookatni.validate(markerFile, {
      strict: true,
      customRules: ['security-check', 'naming-consistency']
    });
    
    if (!result.isValid) {
      throw new Error(`Validation failed: ${result.errors.join(', ')}`);
    }
  }

  private async runIntegrationTests(): Promise<void> {
    // Extract markers to temporary directory and run tests
    const buildInfo = this.ci.getBuildInfo();
    const markerFile = `./artifacts/build-${buildInfo.number}.txt`;
    const testDir = `./temp/test-${buildInfo.number}`;
    
    await this.lookatni.extract(markerFile, testDir);
    
    // Run tests in extracted directory
    await this.ci.runCommand('npm test', { cwd: testDir });
    
    // Cleanup
    await fs.rmdir(testDir, { recursive: true });
  }

  private async createReleaseArtifacts(): Promise<void> {
    const buildInfo = this.ci.getBuildInfo();
    
    if (buildInfo.isRelease) {
      // Create production release markers
      await this.lookatni.generate({
        source: './',
        output: `./artifacts/release-${buildInfo.version}.txt`,
        include: ['src/**', 'README.md', 'LICENSE', 'package.json'],
        exclude: ['**/*.test.*', '**/*.spec.*'],
        compress: true,
        metadata: {
          version: buildInfo.version,
          releaseNotes: buildInfo.releaseNotes
        }
      });
      
      console.log(`📦 Release artifact created: release-${buildInfo.version}.txt`);
    }
  }
}

// Usage in CI pipeline
if (process.env.CI) {
  const ci = new CIIntegration();
  ci.runBuildPipeline();
}
```

---

Next: Explore [API Reference](api.md) for complete interface documentation.
