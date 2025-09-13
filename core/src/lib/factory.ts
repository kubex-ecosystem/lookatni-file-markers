// 🏭 Factory functions for convenience

import { MarkerExtractor } from './extractor';
import { MarkerGenerator } from './generator';
import {
  ExtractorConfig,
  GeneratorConfig,
  ValidatorConfig
} from './types';
import { MarkerValidator } from './validator';

/**
 * Create a new MarkerGenerator with optional configuration
 */
export function createGenerator(config?: GeneratorConfig): MarkerGenerator {
  return new MarkerGenerator(config);
}

/**
 * Create a new MarkerExtractor with optional configuration
 */
export function createExtractor(config?: ExtractorConfig): MarkerExtractor {
  return new MarkerExtractor(config);
}

/**
 * Create a new MarkerValidator with optional configuration
 */
export function createValidator(config?: ValidatorConfig): MarkerValidator {
  return new MarkerValidator(config);
}

/**
 * Create a complete set of tools with shared configuration
 */
export function createToolset(config?: {
  generator?: GeneratorConfig;
  extractor?: ExtractorConfig;
  validator?: ValidatorConfig;
}) {
  return {
    generator: createGenerator(config?.generator),
    extractor: createExtractor(config?.extractor),
    validator: createValidator(config?.validator)
  };
}
