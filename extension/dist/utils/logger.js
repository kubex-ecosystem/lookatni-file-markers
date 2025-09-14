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
exports.Logger = exports.LogLevel = void 0;
const vscode = __importStar(require("vscode"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(channelName = 'LookAtni File Markers', logLevel = LogLevel.INFO) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
        this.logLevel = logLevel;
    }
    debug(message, ...args) {
        this.log(LogLevel.DEBUG, '🔍', message, ...args);
    }
    info(message, ...args) {
        this.log(LogLevel.INFO, 'ℹ️', message, ...args);
    }
    warn(message, ...args) {
        this.log(LogLevel.WARN, '⚠️', message, ...args);
    }
    error(message, ...args) {
        this.log(LogLevel.ERROR, '❌', message, ...args);
        if (args.length > 0 && args[0] instanceof Error) {
            vscode.window.showErrorMessage(`LookAtni: ${message}`);
        }
    }
    success(message, ...args) {
        this.log(LogLevel.INFO, '✅', message, ...args);
    }
    log(level, icon, message, ...args) {
        if (level < this.logLevel) {
            return;
        }
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
        let formattedMessage = `[${timestamp}] ${icon} ${levelName}: ${message}`;
        if (args.length > 0) {
            const formattedArgs = args.map(arg => {
                if (arg instanceof Error) {
                    return `\n  Error: ${arg.message}\n  Stack: ${arg.stack}`;
                }
                else if (typeof arg === 'object') {
                    return `\n  ${JSON.stringify(arg, null, 2)}`;
                }
                else {
                    return ` ${arg}`;
                }
            }).join('');
            formattedMessage += formattedArgs;
        }
        this.outputChannel.appendLine(formattedMessage);
        if (level >= LogLevel.WARN) {
            this.outputChannel.show(true);
        }
    }
    show() {
        this.outputChannel.show();
    }
    hide() {
        this.outputChannel.hide();
    }
    clear() {
        this.outputChannel.clear();
    }
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.Logger = Logger;
