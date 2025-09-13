/**
 * Simple Logger for CLI scripts (without VS Code dependencies)
 */

export class CLILogger {
    constructor(private name: string = 'cli', private verbose: boolean = false) {}

    info(message: string, ...args: any[]): void {
        if (this.verbose) {
            console.log(`[${this.name}] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        console.warn(`[${this.name}] WARNING: ${message}`, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error(`[${this.name}] ERROR: ${message}`, ...args);
    }

    debug(message: string, ...args: any[]): void {
        if (this.verbose) {
            console.log(`[${this.name}] DEBUG: ${message}`, ...args);
        }
    }
}
