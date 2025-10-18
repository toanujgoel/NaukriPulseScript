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
exports.config = void 0;
exports.loadConfig = loadConfig;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables
dotenv.config();
/**
 * Parse boolean from environment variable
 */
function parseBoolean(value, defaultValue) {
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true';
}
/**
 * Parse number from environment variable
 */
function parseNumber(value, defaultValue) {
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
/**
 * Parse comma-separated string array
 */
function parseStringArray(value, defaultValue) {
    if (!value)
        return defaultValue;
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
}
/**
 * Validate log level
 */
function parseLogLevel(value) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!value || !validLevels.includes(value)) {
        return 'info';
    }
    return value;
}
/**
 * Get absolute path from relative path
 */
function getAbsolutePath(relativePath) {
    return path.resolve(process.cwd(), relativePath);
}
/**
 * Load and validate configuration from environment variables
 */
function loadConfig() {
    const config = {
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
function validateConfig(config) {
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
exports.config = loadConfig();
//# sourceMappingURL=config.js.map