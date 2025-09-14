"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLILogger = void 0;
class CLILogger {
    constructor(name = 'cli', verbose = false) {
        this.name = name;
        this.verbose = verbose;
    }
    info(message, ...args) {
        if (this.verbose) {
            console.log(`[${this.name}] ${message}`, ...args);
        }
    }
    warn(message, ...args) {
        console.warn(`[${this.name}] WARNING: ${message}`, ...args);
    }
    error(message, ...args) {
        console.error(`[${this.name}] ERROR: ${message}`, ...args);
    }
    debug(message, ...args) {
        if (this.verbose) {
            console.log(`[${this.name}] DEBUG: ${message}`, ...args);
        }
    }
}
exports.CLILogger = CLILogger;
