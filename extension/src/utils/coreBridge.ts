import * as path from 'path';
import { Logger } from './logger';

type AnyObj = Record<string, any>;

function tryLoadCore(): AnyObj | null {
  try {
    // Prefer packaged import name if eventually published
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../../core/dist/lib/index.js');
  } catch (_) {
    try {
      // When running from repo root: extension -> ../core
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(path.join(__dirname, '..', '..', '..', 'core', 'dist', 'lib', 'index.js'));
    } catch (e) {
      return null;
    }
  }
}

export function hasCore(): boolean {
  return !!tryLoadCore();
}

export function extractWithCore(markedFile: string, destFolder: string, options: { overwrite?: boolean; createDirs?: boolean; dryRun?: boolean }, logger: Logger) {
  const core = tryLoadCore();
  if (!core) {
    throw new Error('LookAtni core library not found. Build core first (cd core && npm run build).');
  }

  const extractor = core.createExtractor ? core.createExtractor() : new core.MarkerExtractor();
  return extractor.extractFromFile(
    markedFile,
    destFolder,
    {
      overwriteExisting: options.overwrite ?? false,
      createDirectories: options.createDirs ?? true,
      validateChecksums: false,
      preserveTimestamps: true,
      progressCallback: () => {},
      conflictCallback: () => 'skip',
      dryRun: options.dryRun ?? false,
      conflictResolution: 'skip'
    }
  );
}

export async function generateWithCore(sourceFolder: string, outputFile: string, options: { maxFileSize: number; excludePatterns: string[] }, onProgress?: (pct: number, current: string) => void) {
  const core = tryLoadCore();
  if (!core) {
    throw new Error('LookAtni core library not found. Build core first (cd core && npm run build).');
  }
  const generator = core.createGenerator ? core.createGenerator() : new core.MarkerGenerator();
  return generator.generateToFile(
    sourceFolder,
    outputFile,
    {
      maxFileSize: options.maxFileSize,
      excludePatterns: options.excludePatterns,
      includeMetadata: true,
      includeBinaryFiles: false,
      encoding: 'utf-8',
      preserveTimestamps: true,
      customMetadata: {},
      validateBeforeGeneration: false,
      progressCallback: (p: any) => {
        if (onProgress) {
          onProgress(p.percentage ?? 0, p.currentFile ?? '');
        }
      }
    }
  );
}

export async function validateWithCore(markerFile: string) {
  const core = tryLoadCore();
  if (!core) {
    throw new Error('LookAtni core library not found. Build core first (cd core && npm run build).');
  }
  const validator = core.createValidator ? core.createValidator() : new core.MarkerValidator();
  return validator.validateFile(markerFile);
}

