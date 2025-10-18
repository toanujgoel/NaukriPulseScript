/**
 * Configuration interface for type safety
 */
export interface Config {
    headless: boolean;
    timeoutMs: number;
    minDelaySeconds: number;
    maxDelaySeconds: number;
    naukriProfileUrl: string;
    headlinePool: string[];
    appendTimestamp: boolean;
    runs: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    storageStatePath: string;
    lastHeadlinePath: string;
    updatesLogPath: string;
    screenshotsPath: string;
}
/**
 * Load and validate configuration from environment variables
 */
export declare function loadConfig(): Config;
export declare const config: Config;
//# sourceMappingURL=config.d.ts.map