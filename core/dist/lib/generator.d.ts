import { GenerationOptions, GeneratorConfig } from './types';
export declare class MarkerGenerator {
    private logger;
    private scanner;
    private config;
    private readonly FS_CHAR;
    constructor(config?: GeneratorConfig);
    /**
     * Generate markers from a source directory and return content
     */
    generate(sourcePath: string, options?: GenerationOptions): Promise<string>;
    /**
     * Generate markers from a source directory and save to file
     */
    generateToFile(sourcePath: string, outputPath: string, options?: GenerationOptions): Promise<void>;
    /**
     * Set configuration
     */
    setConfig(config: GeneratorConfig): void;
    /**
     * Get current configuration
     */
    getConfig(): GeneratorConfig;
    /**
     * Internal generation method
     */
    private generateInternal;
    /**
     * Create file header with metadata
     */
    private createHeader;
    /**
     * Process a single file
     */
    private processFile;
}
//# sourceMappingURL=generator.d.ts.map