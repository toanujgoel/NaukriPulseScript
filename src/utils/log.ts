import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';

/**
 * Log levels enum
 */
export enum LogLevel {
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
class Logger {
  private logLevel: LogLevel;
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  };

  constructor() {
    this.logLevel = this.parseLogLevel(config.logLevel);
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatConsoleMessage(level: string, message: string, color: string): string {
    const timestamp = new Date().toLocaleTimeString();
    const levelPadded = level.padEnd(5);
    return `${this.colors.dim}${timestamp}${this.colors.reset} ${color}${levelPadded}${this.colors.reset} ${message}`;
  }

  private writeToFile(entry: LogEntry): void {
    try {
      const logDir = path.dirname(config.updatesLogPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(config.updatesLogPath, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    console.log(this.formatConsoleMessage('DEBUG', message, this.colors.cyan));
    if (data) {
      console.log(this.colors.dim + JSON.stringify(data, null, 2) + this.colors.reset);
    }
    
    this.writeToFile({
      timestamp: this.formatTimestamp(),
      level: 'DEBUG',
      message,
      data
    });
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    console.log(this.formatConsoleMessage('INFO', message, this.colors.green));
    if (data) {
      console.log(this.colors.dim + JSON.stringify(data, null, 2) + this.colors.reset);
    }
    
    this.writeToFile({
      timestamp: this.formatTimestamp(),
      level: 'INFO',
      message,
      data
    });
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    console.log(this.formatConsoleMessage('WARN', message, this.colors.yellow));
    if (data) {
      console.log(this.colors.dim + JSON.stringify(data, null, 2) + this.colors.reset);
    }
    
    this.writeToFile({
      timestamp: this.formatTimestamp(),
      level: 'WARN',
      message,
      data
    });
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    console.log(this.formatConsoleMessage('ERROR', message, this.colors.red));
    if (data) {
      console.log(this.colors.dim + JSON.stringify(data, null, 2) + this.colors.reset);
    }
    
    this.writeToFile({
      timestamp: this.formatTimestamp(),
      level: 'ERROR',
      message,
      data
    });
  }

  /**
   * Log update attempt with structured data
   */
  logUpdate(entry: UpdateLogEntry): void {
    const message = entry.success 
      ? `✅ Headline updated successfully (${entry.durationMs}ms)`
      : `❌ Headline update failed (${entry.durationMs}ms)`;
    
    const color = entry.success ? this.colors.green : this.colors.red;
    console.log(this.formatConsoleMessage('UPDATE', message, color));
    
    // Pretty print the update details
    console.log(this.colors.dim + '  Old: ' + this.colors.reset + entry.oldHeadline);
    console.log(this.colors.dim + '  New: ' + this.colors.reset + entry.newHeadline);
    
    if (entry.error) {
      console.log(this.colors.red + '  Error: ' + entry.error + this.colors.reset);
    }
    
    // Write to updates log file
    try {
      const logDir = path.dirname(config.updatesLogPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(config.updatesLogPath, logLine);
    } catch (error) {
      this.error('Failed to write update log', error);
    }
  }

  /**
   * Log a separator line for better readability
   */
  separator(): void {
    console.log(this.colors.dim + '─'.repeat(80) + this.colors.reset);
  }

  /**
   * Log a banner message
   */
  banner(message: string): void {
    const border = '═'.repeat(message.length + 4);
    console.log(this.colors.bright + this.colors.blue + border + this.colors.reset);
    console.log(this.colors.bright + this.colors.blue + `║ ${message} ║` + this.colors.reset);
    console.log(this.colors.bright + this.colors.blue + border + this.colors.reset);
  }

  /**
   * Log script start information
   */
  logStart(mode: 'continuous' | 'once', runs?: number): void {
    this.banner('🚀 Naukri Pulse Script Started');
    this.info(`Mode: ${mode}`);
    if (runs) {
      this.info(`Runs: ${runs}`);
    }
    this.info(`Headless: ${config.headless}`);
    this.info(`Delay range: ${config.minDelaySeconds}-${config.maxDelaySeconds} seconds`);
    this.info(`Headlines pool: ${config.headlinePool.length} options`);
    this.separator();
  }

  /**
   * Log script completion
   */
  logComplete(): void {
    this.separator();
    this.banner('✅ Naukri Pulse Script Completed');
  }

  /**
   * Log next run information
   */
  logNextRun(delaySeconds: number): void {
    const nextRunTime = new Date(Date.now() + delaySeconds * 1000);
    this.info(`⏰ Next run scheduled in ${delaySeconds} seconds (${nextRunTime.toLocaleString()})`);
  }

  /**
   * Log session validation result
   */
  logSessionValidation(isValid: boolean, redirectUrl?: string): void {
    if (isValid) {
      this.info('✅ Session is valid, proceeding with update');
    } else {
      this.warn('❌ Session expired or invalid', { redirectUrl });
      this.warn('Please run: npm run login');
    }
  }
}

// Export singleton logger instance
export const log = new Logger();

/**
 * Utility function to ensure log directory exists
 */
export function ensureLogDirectory(): void {
  const logDir = path.dirname(config.updatesLogPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    log.debug(`Created log directory: ${logDir}`);
  }
}

/**
 * Read the last headline from file
 */
export function getLastHeadline(): string | null {
  try {
    if (fs.existsSync(config.lastHeadlinePath)) {
      return fs.readFileSync(config.lastHeadlinePath, 'utf-8').trim();
    }
  } catch (error) {
    log.warn('Failed to read last headline file', error);
  }
  return null;
}

/**
 * Save the last used headline to file
 */
export function saveLastHeadline(headline: string): void {
  try {
    const dir = path.dirname(config.lastHeadlinePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(config.lastHeadlinePath, headline);
    log.debug(`Saved last headline: ${headline}`);
  } catch (error) {
    log.error('Failed to save last headline', error);
  }
}