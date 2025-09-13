import { MarkerExtractor } from './extractor';
import { MarkerGenerator } from './generator';
import { ExtractorConfig, GeneratorConfig, ValidatorConfig } from './types';
import { MarkerValidator } from './validator';
/**
 * Create a new MarkerGenerator with optional configuration
 */
export declare function createGenerator(config?: GeneratorConfig): MarkerGenerator;
/**
 * Create a new MarkerExtractor with optional configuration
 */
export declare function createExtractor(config?: ExtractorConfig): MarkerExtractor;
/**
 * Create a new MarkerValidator with optional configuration
 */
export declare function createValidator(config?: ValidatorConfig): MarkerValidator;
/**
 * Create a complete set of tools with shared configuration
 */
export declare function createToolset(config?: {
    generator?: GeneratorConfig;
    extractor?: ExtractorConfig;
    validator?: ValidatorConfig;
}): {
    generator: MarkerGenerator;
    extractor: MarkerExtractor;
    validator: MarkerValidator;
};
//# sourceMappingURL=factory.d.ts.map