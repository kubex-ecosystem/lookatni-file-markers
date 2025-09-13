export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: string;
    data?: any;
}
export declare class Logger {
    private context;
    private level;
    private silent;
    constructor(context?: string, level?: LogLevel, silent?: boolean);
    private shouldLog;
    private formatMessage;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    withContext(context: string): Logger;
    setLevel(level: LogLevel): void;
    setSilent(silent: boolean): void;
}
//# sourceMappingURL=logger.d.ts.map