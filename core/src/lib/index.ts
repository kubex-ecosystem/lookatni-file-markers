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

