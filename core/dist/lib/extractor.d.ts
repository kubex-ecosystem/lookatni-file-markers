import { ExtractionOptions, ExtractionResult, ExtractorConfig, FileInfo, MarkerMetadata, ParseResults } from './types';
export declare class MarkerExtractor {
    private logger;
    private config;
    private readonly FS_CHAR;
    constructor(config?: ExtractorConfig);
    /**
     * Public: Parse marker content into structured results
     */
    parse(content: string): ParseResults;
    /**
     * Public: Parse a marker file from disk
     */
    parseFile(markerPath: string): ParseResults;
    /**
     * Extract files from marker content to target directory
     */
    extract(markerContent: string, targetPath: string, options?: ExtractionOptions): Promise<ExtractionResult>;
    /**
     * Extract files from marker file
     */
    extractFromFile(markerPath: string, targetPath: string, options?: ExtractionOptions): Promise<ExtractionResult>;
    /**
     * Get list of files in marker content without extracting
     */
    getFileList(markerContent: string): Promise<FileInfo[]>;
    /**
     * Get metadata from marker content
     */
    getMetadata(markerContent: string): Promise<MarkerMetadata | undefined>;
    /**
     * Parse marker content into individual markers
     */
    private parseMarkers;
    /**
     * Finalize a marker being parsed
     */
    private finalizeMarker;
    /**
     * Extract a single file
     */
    private extractSingleFile;
    private detectFSChar;
    private buildMarkerRegex;
    private parseFrontmatter;
}
//# sourceMappingURL=extractor.d.ts.map