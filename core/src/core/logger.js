"use strict";
// 📝 Simple Logger for Core Library
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    context;
    level;
    silent;
    constructor(context = 'core', level = 'info', silent = false) {
        this.context = context;
        this.level = level;
        this.silent = silent;
    }
    shouldLog(level) {
        if (this.silent)
            return false;
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
        if (data !== undefined) {
            return `${prefix} ${message} ${JSON.stringify(data)}`;
        }
        return `${prefix} ${message}`;
    }
    debug(message, data) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message, data));
        }
    }
    info(message, data) {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message, data));
        }
    }
    warn(message, data) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, data));
        }
    }
    error(message, data) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, data));
        }
    }
    withContext(context) {
        return new Logger(`${this.context}:${context}`, this.level, this.silent);
    }
    setLevel(level) {
        this.level = level;
    }
    setSilent(silent) {
        this.silent = silent;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map