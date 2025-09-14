export { MarkerExtractor } from './extractor';
export { MarkerGenerator } from './generator';
export { MarkerValidator } from './validator';
export type { ExtractionOptions, ExtractionResult, FileInfo, GenerationOptions, GenerationResult, MarkerMetadata, ParseResults, ParsedMarker, ValidationError, ValidationResult } from './types';
export { createExtractor, createGenerator, createValidator } from './factory';
export { Logger } from '../core/logger';
export { FileScanner } from '../core/scanner';
/** Parse marker content (string) to structured results */
export declare function parseMarkers(content: string): import("./types").ParseResults;
/** Parse marker file from disk to structured results */
export declare function parseMarkersFromFile(filePath: string): import("./types").ParseResults;
/** Generate marker content from a source folder */
export declare function generateMarkers(sourcePath: string, options?: import('./types').GenerationOptions): Promise<string>;
/** Validate marker content (string) */
export declare function validateMarkers(content: string): Promise<import("./types").ValidationResult>;
/** Validate a marker file from disk */
export declare function validateMarkerFile(filePath: string): Promise<import("./types").ValidationResult>;
//# sourceMappingURL=index.d.ts.map