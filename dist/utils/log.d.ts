/**
 * Log levels enum
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/**
 * Log entry interface for JSONL logging
 */
export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    data?: any;
}
/**
 * Update log entry interface for tracking headline updates
 */
export interface UpdateLogEntry {
    timestamp: string;
    oldHeadline: string;
    newHeadline: string;
    success: boolean;
    durationMs: number;
    error?: string;
}
/**
 * Logger class with pretty console output and file logging
 */
declare class Logger {
    private logLevel;
    private colors;
    constructor();
    private parseLogLevel;
    private shouldLog;
    private formatTimestamp;
    private formatConsoleMessage;
    private writeToFile;
    /**
     * Log debug message
     */
    debug(message: string, data?: any): void;
    /**
     * Log info message
     */
    info(message: string, data?: any): void;
    /**
     * Log warning message
     */
    warn(message: string, data?: any): void;
    /**
     * Log error message
     */
    error(message: string, data?: any): void;
    /**
     * Log update attempt with structured data
     */
    logUpdate(entry: UpdateLogEntry): void;
    /**
     * Log a separator line for better readability
     */
    separator(): void;
    /**
     * Log a banner message
     */
    banner(message: string): void;
    /**
     * Log script start information
     */
    logStart(mode: 'continuous' | 'once', runs?: number): void;
    /**
     * Log script completion
     */
    logComplete(): void;
    /**
     * Log next run information
     */
    logNextRun(delaySeconds: number): void;
    /**
     * Log session validation result
     */
    logSessionValidation(isValid: boolean, redirectUrl?: string): void;
}
export declare const log: Logger;
/**
 * Utility function to ensure log directory exists
 */
export declare function ensureLogDirectory(): void;
/**
 * Read the last headline from file
 */
export declare function getLastHeadline(): string | null;
/**
 * Save the last used headline to file
 */
export declare function saveLastHeadline(headline: string): void;
export {};
//# sourceMappingURL=log.d.ts.map