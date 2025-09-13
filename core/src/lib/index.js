"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileScanner = exports.Logger = exports.createValidator = exports.createGenerator = exports.createExtractor = exports.MarkerValidator = exports.MarkerGenerator = exports.MarkerExtractor = void 0;
// 🎯 Main library export - Finally the real deal!
var extractor_1 = require("./extractor");
Object.defineProperty(exports, "MarkerExtractor", { enumerable: true, get: function () { return extractor_1.MarkerExtractor; } });
var generator_1 = require("./generator");
Object.defineProperty(exports, "MarkerGenerator", { enumerable: true, get: function () { return generator_1.MarkerGenerator; } });
var validator_1 = require("./validator");
Object.defineProperty(exports, "MarkerValidator", { enumerable: true, get: function () { return validator_1.MarkerValidator; } });
// 🏭 Factory functions for convenience
var factory_1 = require("./factory");
Object.defineProperty(exports, "createExtractor", { enumerable: true, get: function () { return factory_1.createExtractor; } });
Object.defineProperty(exports, "createGenerator", { enumerable: true, get: function () { return factory_1.createGenerator; } });
Object.defineProperty(exports, "createValidator", { enumerable: true, get: function () { return factory_1.createValidator; } });
// 📊 Utility exports
var logger_1 = require("../core/logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
var scanner_1 = require("../core/scanner");
Object.defineProperty(exports, "FileScanner", { enumerable: true, get: function () { return scanner_1.FileScanner; } });
//# sourceMappingURL=index.js.map