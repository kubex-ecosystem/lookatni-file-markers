"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCore = hasCore;
exports.extractWithCore = extractWithCore;
exports.generateWithCore = generateWithCore;
exports.validateWithCore = validateWithCore;
const path = __importStar(require("path"));
function tryLoadCore() {
    try {
        return require('../../core/dist/lib/index.js');
    }
    catch (_) {
        try {
            return require(path.join(__dirname, '..', '..', '..', 'core', 'dist', 'lib', 'index.js'));
        }
        catch (e) {
            return null;
        }
    }
}
function hasCore() {
    return !!tryLoadCore();
}
function extractWithCore(markedFile, destFolder, options, logger) {
    const core = tryLoadCore();
    if (!core) {
        throw new Error('LookAtni core library not found. Build core first (cd core && npm run build).');
    }
    const extractor = core.createExtractor ? core.createExtractor() : new core.MarkerExtractor();
    return extractor.extractFromFile(markedFile, destFolder, {
        overwriteExisting: options.overwrite ?? false,
        createDirectories: options.createDirs ?? true,
        validateChecksums: false,
        preserveTimestamps: true,
        progressCallback: () => { },
        conflictCallback: () => 'skip',
        dryRun: options.dryRun ?? false,
        conflictResolution: 'skip'
    });
}
async function generateWithCore(sourceFolder, outputFile, options, onProgress) {
    const core = tryLoadCore();
    if (!core) {
        throw new Error('LookAtni core library not found. Build core first (cd core && npm run build).');
    }
    const generator = core.createGenerator ? core.createGenerator() : new core.MarkerGenerator();
    return generator.generateToFile(sourceFolder, outputFile, {
        maxFileSize: options.maxFileSize,
        excludePatterns: options.excludePatterns,
        includeMetadata: true,
        includeBinaryFiles: false,
        encoding: 'utf-8',
        preserveTimestamps: true,
        customMetadata: {},
        validateBeforeGeneration: false,
        progressCallback: (p) => {
            if (onProgress) {
                onProgress(p.percentage ?? 0, p.currentFile ?? '');
            }
        }
    });
}
async function validateWithCore(markerFile) {
    const core = tryLoadCore();
    if (!core) {
        throw new Error('LookAtni core library not found. Build core first (cd core && npm run build).');
    }
    const validator = core.createValidator ? core.createValidator() : new core.MarkerValidator();
    return validator.validateFile(markerFile);
}
