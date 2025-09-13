"use strict";
// 🏭 Factory functions for convenience
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenerator = createGenerator;
exports.createExtractor = createExtractor;
exports.createValidator = createValidator;
exports.createToolset = createToolset;
const extractor_1 = require("./extractor");
const generator_1 = require("./generator");
const validator_1 = require("./validator");
/**
 * Create a new MarkerGenerator with optional configuration
 */
function createGenerator(config) {
    return new generator_1.MarkerGenerator(config);
}
/**
 * Create a new MarkerExtractor with optional configuration
 */
function createExtractor(config) {
    return new extractor_1.MarkerExtractor(config);
}
/**
 * Create a new MarkerValidator with optional configuration
 */
function createValidator(config) {
    return new validator_1.MarkerValidator(config);
}
/**
 * Create a complete set of tools with shared configuration
 */
function createToolset(config) {
    return {
        generator: createGenerator(config?.generator),
        extractor: createExtractor(config?.extractor),
        validator: createValidator(config?.validator)
    };
}
//# sourceMappingURL=factory.js.map