// 🎯 Main library export - Finally the real deal!
export { MarkerExtractor } from './extractor';
export { MarkerGenerator } from './generator';
export { MarkerValidator } from './validator';

// 📋 Type exports - For TypeScript users
export type {
  ExtractionOptions,
  ExtractionResult, FileInfo, GenerationOptions,
  GenerationResult, MarkerMetadata, ParseResults, ParsedMarker, ValidationError, ValidationResult
} from './types';

// 🏭 Factory functions for convenience
export {
  createExtractor, createGenerator, createValidator
} from './factory';

// 📊 Utility exports
export { Logger } from '../core/logger';
export { FileScanner } from '../core/scanner';

// 🔧 Top-level convenience helpers (Node-friendly)
import { MarkerExtractor } from './extractor';
import { MarkerGenerator } from './generator';
import { MarkerValidator } from './validator';

/** Parse marker content (string) to structured results */
export function parseMarkers(content: string) {
  return new MarkerExtractor().parse(content);
}

/** Parse marker file from disk to structured results */
export function parseMarkersFromFile(filePath: string) {
  return new MarkerExtractor().parseFile(filePath);
}

/** Generate marker content from a source folder */
export async function generateMarkers(sourcePath: string, options?: import('./types').GenerationOptions) {
  return new MarkerGenerator().generate(sourcePath, options);
}

/** Validate marker content (string) */
export function validateMarkers(content: string) {
  return new MarkerValidator().validate(content);
}

/** Validate a marker file from disk */
export async function validateMarkerFile(filePath: string) {
  return new MarkerValidator().validateFile(filePath);
}
