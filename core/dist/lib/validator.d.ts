import { ValidationResult, ValidationRule, ValidatorConfig } from './types';
export declare class MarkerValidator {
    private logger;
    private config;
    private customRules;
    private readonly FS_CHAR;
    private markerRegex;
    constructor(config?: ValidatorConfig);
    /**
     * Validate marker content
     */
    validate(markerContent: string): Promise<ValidationResult>;
    /**
     * Validate marker file
     */
    validateFile(markerPath: string): Promise<ValidationResult>;
    /**
     * Add custom validation rule
     */
    addRule(rule: ValidationRule): void;
    /**
     * Remove custom validation rule
     */
    removeRule(ruleName: string): void;
    /**
     * Get all validation rules
     */
    getRules(): ValidationRule[];
    /**
     * Parse marker content (similar to extractor but focused on validation)
     */
    private parseMarkers;
    private detectFSChar;
    private buildMarkerRegex;
    /**
     * Finalize a marker being parsed
     */
    private finalizeMarker;
    /**
     * Validate individual markers
     */
    private validateMarkers;
    /**
     * Check if filename is invalid
     */
    private isInvalidFilename;
}
//# sourceMappingURL=validator.d.ts.map