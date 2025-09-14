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
exports.LookAtniStatusBar = void 0;
const vscode = __importStar(require("vscode"));
class LookAtniStatusBar {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'lookatni.quickDemo';
        this.statusBarItem.tooltip = 'LookAtni File Markers - Click for Quick Demo';
        this.statusBarItem.text = '$(file-code) LookAtni';
        this.statusBarItem.show();
    }
    show(message, duration) {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = undefined;
        }
        if (message) {
            this.statusBarItem.text = `$(loading~spin) ${message}`;
            this.statusBarItem.tooltip = `LookAtni: ${message}`;
        }
        else {
            this.statusBarItem.text = '$(file-code) LookAtni';
            this.statusBarItem.tooltip = 'LookAtni File Markers - Click for Quick Demo';
        }
        this.statusBarItem.show();
        if (duration && duration > 0) {
            this.hideTimeout = setTimeout(() => {
                this.reset();
            }, duration);
        }
    }
    hide() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = undefined;
        }
        this.reset();
    }
    reset() {
        this.statusBarItem.text = '$(file-code) LookAtni';
        this.statusBarItem.tooltip = 'LookAtni File Markers - Click for Quick Demo';
        this.statusBarItem.show();
    }
    updateProgress(current, total, operation) {
        const percentage = Math.round((current / total) * 100);
        this.statusBarItem.text = `$(loading~spin) ${operation} ${percentage}%`;
        this.statusBarItem.tooltip = `LookAtni: ${operation} (${current}/${total})`;
    }
    showError(message) {
        this.statusBarItem.text = `$(error) LookAtni Error`;
        this.statusBarItem.tooltip = `LookAtni Error: ${message}`;
        this.statusBarItem.show();
        setTimeout(() => {
            this.reset();
        }, 5000);
    }
    showSuccess(message) {
        this.statusBarItem.text = `$(check) ${message}`;
        this.statusBarItem.tooltip = `LookAtni: ${message}`;
        this.statusBarItem.show();
        setTimeout(() => {
            this.reset();
        }, 3000);
    }
    dispose() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        this.statusBarItem.dispose();
    }
}
exports.LookAtniStatusBar = LookAtniStatusBar;
