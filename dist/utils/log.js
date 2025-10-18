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
exports.log = exports.LogLevel = void 0;
exports.ensureLogDirectory = ensureLogDirectory;
exports.getLastHeadline = getLastHeadline;
exports.saveLastHeadline = saveLastHeadline;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./config");
/**
 * Log levels enum
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class with pretty console output and file logging
 */
class Logger {
    logLevel;
    colors = {
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
        this.logLevel = this.parseLogLevel(config_1.config.logLevel);
    }
    parseLogLevel(level) {
        switch (level.toLowerCase()) {
            case 'debug': return LogLevel.DEBUG;
            case 'info': return LogLevel.INFO;
            case 'warn': return LogLevel.WARN;
            case 'error': return LogLevel.ERROR;
            default: return LogLevel.INFO;
        }
    }
    shouldLog(level) {
        return level >= this.logLevel;
    }
    formatTimestamp() {
        return new Date().toISOString();
    }
    formatConsoleMessage(level, message, color) {
        const timestamp = new Date().toLocaleTimeString();
        const levelPadded = level.padEnd(5);
        return `${this.colors.dim}${timestamp}${this.colors.reset} ${color}${levelPadded}${this.colors.reset} ${message}`;
    }
    writeToFile(entry) {
        try {
            const logDir = path.dirname(config_1.config.updatesLogPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(config_1.config.updatesLogPath, logLine);
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
    /**
     * Log debug message
     */
    debug(message, data) {
        if (!this.shouldLog(LogLevel.DEBUG))
            return;
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
    info(message, data) {
        if (!this.shouldLog(LogLevel.INFO))
            return;
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
    warn(message, data) {
        if (!this.shouldLog(LogLevel.WARN))
            return;
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
    error(message, data) {
        if (!this.shouldLog(LogLevel.ERROR))
            return;
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
    logUpdate(entry) {
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
            const logDir = path.dirname(config_1.config.updatesLogPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(config_1.config.updatesLogPath, logLine);
        }
        catch (error) {
            this.error('Failed to write update log', error);
        }
    }
    /**
     * Log a separator line for better readability
     */
    separator() {
        console.log(this.colors.dim + '─'.repeat(80) + this.colors.reset);
    }
    /**
     * Log a banner message
     */
    banner(message) {
        const border = '═'.repeat(message.length + 4);
        console.log(this.colors.bright + this.colors.blue + border + this.colors.reset);
        console.log(this.colors.bright + this.colors.blue + `║ ${message} ║` + this.colors.reset);
        console.log(this.colors.bright + this.colors.blue + border + this.colors.reset);
    }
    /**
     * Log script start information
     */
    logStart(mode, runs) {
        this.banner('🚀 Naukri Pulse Script Started');
        this.info(`Mode: ${mode}`);
        if (runs) {
            this.info(`Runs: ${runs}`);
        }
        this.info(`Headless: ${config_1.config.headless}`);
        this.info(`Delay range: ${config_1.config.minDelaySeconds}-${config_1.config.maxDelaySeconds} seconds`);
        this.info(`Headlines pool: ${config_1.config.headlinePool.length} options`);
        this.separator();
    }
    /**
     * Log script completion
     */
    logComplete() {
        this.separator();
        this.banner('✅ Naukri Pulse Script Completed');
    }
    /**
     * Log next run information
     */
    logNextRun(delaySeconds) {
        const nextRunTime = new Date(Date.now() + delaySeconds * 1000);
        this.info(`⏰ Next run scheduled in ${delaySeconds} seconds (${nextRunTime.toLocaleString()})`);
    }
    /**
     * Log session validation result
     */
    logSessionValidation(isValid, redirectUrl) {
        if (isValid) {
            this.info('✅ Session is valid, proceeding with update');
        }
        else {
            this.warn('❌ Session expired or invalid', { redirectUrl });
            this.warn('Please run: npm run login');
        }
    }
}
// Export singleton logger instance
exports.log = new Logger();
/**
 * Utility function to ensure log directory exists
 */
function ensureLogDirectory() {
    const logDir = path.dirname(config_1.config.updatesLogPath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        exports.log.debug(`Created log directory: ${logDir}`);
    }
}
/**
 * Read the last headline from file
 */
function getLastHeadline() {
    try {
        if (fs.existsSync(config_1.config.lastHeadlinePath)) {
            return fs.readFileSync(config_1.config.lastHeadlinePath, 'utf-8').trim();
        }
    }
    catch (error) {
        exports.log.warn('Failed to read last headline file', error);
    }
    return null;
}
/**
 * Save the last used headline to file
 */
function saveLastHeadline(headline) {
    try {
        const dir = path.dirname(config_1.config.lastHeadlinePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(config_1.config.lastHeadlinePath, headline);
        exports.log.debug(`Saved last headline: ${headline}`);
    }
    catch (error) {
        exports.log.error('Failed to save last headline', error);
    }
}
//# sourceMappingURL=log.js.map