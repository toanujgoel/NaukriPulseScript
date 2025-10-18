import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Configuration interface for type safety
 */
export interface Config {
  // Browser settings
  headless: boolean;
  timeoutMs: number;
  
  // Timing configuration
  minDelaySeconds: number;
  maxDelaySeconds: number;
  
  // URLs
  naukriProfileUrl: string;
  
  // Headlines configuration
  headlinePool: string[];
  appendTimestamp: boolean;
  
  // Execution settings
  runs: number;
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  // File paths
  storageStatePath: string;
  lastHeadlinePath: string;
  updatesLogPath: string;
  screenshotsPath: string;
}

/**
 * Parse boolean from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Parse number from environment variable
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse comma-separated string array
 */
function parseStringArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Validate log level
 */
function parseLogLevel(value: string | undefined): 'debug' | 'info' | 'warn' | 'error' {
  const validLevels = ['debug', 'info', 'warn', 'error'] as const;
  if (!value || !validLevels.includes(value as any)) {
    return 'info';
  }
  return value as 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Get absolute path from relative path
 */
function getAbsolutePath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
  const config: Config = {
    // Browser settings
    headless: parseBoolean(process.env.HEADLESS, true),
    timeoutMs: parseNumber(process.env.TIMEOUT_MS, 45000),
    
    // Timing configuration
    minDelaySeconds: parseNumber(process.env.MIN_DELAY_SECONDS, 1200),
    maxDelaySeconds: parseNumber(process.env.MAX_DELAY_SECONDS, 1800),
    
    // URLs
    naukriProfileUrl: process.env.NAUKRI_PROFILE_URL || 'https://www.naukri.com/mnjuser/profile',
    
    // Headlines configuration
    headlinePool: parseStringArray(process.env.HEADLINE_POOL, [
      'Experienced Software Developer',
      'Full Stack Engineer',
      'Senior Backend Developer',
      'DevOps Engineer',
      'Cloud Solutions Architect'
    ]),
    appendTimestamp: parseBoolean(process.env.APPEND_TIMESTAMP, false),
    
    // Execution settings
    runs: parseNumber(process.env.RUNS, 0),
    
    // Logging
    logLevel: parseLogLevel(process.env.LOG_LEVEL),
    
    // File paths
    storageStatePath: getAbsolutePath(process.env.STORAGE_STATE_PATH || 'auth/storageState.json'),
    lastHeadlinePath: getAbsolutePath(process.env.LAST_HEADLINE_PATH || 'artifacts/last_headline.txt'),
    updatesLogPath: getAbsolutePath(process.env.UPDATES_LOG_PATH || 'artifacts/updates.log'),
    screenshotsPath: getAbsolutePath(process.env.SCREENSHOTS_PATH || 'artifacts/')
  };

  // Validate configuration
  validateConfig(config);
  
  return config;
}

/**
 * Validate configuration values
 */
function validateConfig(config: Config): void {
  if (config.minDelaySeconds >= config.maxDelaySeconds) {
    throw new Error('MIN_DELAY_SECONDS must be less than MAX_DELAY_SECONDS');
  }
  
  if (config.minDelaySeconds < 0 || config.maxDelaySeconds < 0) {
    throw new Error('Delay seconds must be positive numbers');
  }
  
  if (config.timeoutMs < 1000) {
    throw new Error('TIMEOUT_MS must be at least 1000ms');
  }
  
  if (config.headlinePool.length === 0) {
    throw new Error('HEADLINE_POOL must contain at least one headline');
  }
  
  if (config.runs < 0) {
    throw new Error('RUNS must be a non-negative number');
  }
  
  if (!config.naukriProfileUrl.startsWith('https://')) {
    throw new Error('NAUKRI_PROFILE_URL must be a valid HTTPS URL');
  }
}

// Export singleton config instance
export const config = loadConfig();