"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaukriPulseApp = void 0;
const config_1 = require("./utils/config");
const log_1 = require("./utils/log");
const random_1 = require("./utils/random");
const updateHeadline_1 = require("./updateHeadline");
/**
 * Application state for graceful shutdown
 */
class AppState {
    isShuttingDown = false;
    currentRun = 0;
    totalRuns = 0;
    setShuttingDown(value) {
        this.isShuttingDown = value;
    }
    isShutdownRequested() {
        return this.isShuttingDown;
    }
    setCurrentRun(run) {
        this.currentRun = run;
    }
    getCurrentRun() {
        return this.currentRun;
    }
    setTotalRuns(runs) {
        this.totalRuns = runs;
    }
    getTotalRuns() {
        return this.totalRuns;
    }
}
/**
 * Main application class
 */
class NaukriPulseApp {
    appState = new AppState();
    /**
     * Parse command line arguments
     */
    parseArgs() {
        const args = process.argv.slice(2);
        const result = {
            runs: config_1.config.runs,
            help: false
        };
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            switch (arg) {
                case '--runs':
                    const runsValue = args[i + 1];
                    if (runsValue && !isNaN(parseInt(runsValue))) {
                        result.runs = parseInt(runsValue);
                        i++; // Skip next argument as it's the value
                    }
                    else {
                        log_1.log.error('Invalid value for --runs argument');
                        process.exit(1);
                    }
                    break;
                case '--help':
                case '-h':
                    result.help = true;
                    break;
                default:
                    if (arg.startsWith('--')) {
                        log_1.log.warn(`Unknown argument: ${arg}`);
                    }
                    break;
            }
        }
        return result;
    }
    /**
     * Display help information
     */
    showHelp() {
        console.log(`
🚀 Naukri Pulse Script - Automated Resume Headline Updater

USAGE:
  npm start                    Run in continuous mode (infinite loop)
  npm run once                 Run once and exit
  ts-node src/index.ts         Run with default configuration
  ts-node src/index.ts --runs 5   Run 5 times and exit

OPTIONS:
  --runs <number>             Number of update cycles to run (0 = infinite)
  --help, -h                  Show this help message

EXAMPLES:
  npm start                   # Continuous mode with random delays
  npm run once               # Single update and exit
  ts-node src/index.ts --runs 10  # Run 10 update cycles

CONFIGURATION:
  Edit .env file to customize:
  - HEADLESS: Browser visibility (true/false)
  - MIN_DELAY_SECONDS: Minimum delay between updates
  - MAX_DELAY_SECONDS: Maximum delay between updates
  - HEADLINE_POOL: Comma-separated list of headlines
  - And more...

AUTHENTICATION:
  Run 'npm run login' first to authenticate with Naukri.com

For more information, check the README.md file.
`);
    }
    /**
     * Setup graceful shutdown handlers
     */
    setupShutdownHandlers() {
        const gracefulShutdown = (signal) => {
            log_1.log.info(`🛑 Received ${signal}, initiating graceful shutdown...`);
            this.appState.setShuttingDown(true);
            // Give some time for current operation to complete
            setTimeout(() => {
                log_1.log.info('🔚 Shutdown complete');
                process.exit(0);
            }, 5000);
        };
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        // Handle Windows-specific signals
        if (process.platform === 'win32') {
            process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
        }
    }
    /**
     * Sleep with cancellation support
     */
    async sleepWithCancellation(seconds) {
        const sleepMs = seconds * 1000;
        const checkInterval = 1000; // Check for shutdown every second
        let elapsed = 0;
        while (elapsed < sleepMs && !this.appState.isShutdownRequested()) {
            await new Promise(resolve => setTimeout(resolve, Math.min(checkInterval, sleepMs - elapsed)));
            elapsed += checkInterval;
        }
        return !this.appState.isShutdownRequested();
    }
    /**
     * Perform a single update cycle
     */
    async performUpdateCycle() {
        log_1.log.info('🔄 Starting headline update cycle...');
        try {
            const result = await (0, updateHeadline_1.updateHeadlineOnce)();
            if (result.success) {
                if (result.oldHeadline === result.newHeadline) {
                    log_1.log.info('⏭️ Update skipped - no suitable headline available');
                }
                else {
                    log_1.log.info(`✅ Headline updated successfully in ${result.durationMs}ms`);
                }
            }
            else {
                log_1.log.error(`❌ Update failed: ${result.error}`);
            }
            return result;
        }
        catch (error) {
            log_1.log.error('💥 Unexpected error during update cycle', error);
            return {
                success: false,
                oldHeadline: 'Unknown',
                newHeadline: 'Unknown',
                durationMs: 0,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Main execution loop
     */
    async runMainLoop(maxRuns) {
        this.appState.setTotalRuns(maxRuns);
        const isContinuous = maxRuns === 0;
        let runCount = 0;
        let successCount = 0;
        let failureCount = 0;
        log_1.log.logStart(isContinuous ? 'continuous' : 'once', maxRuns || undefined);
        while (!this.appState.isShutdownRequested()) {
            // Check if we've reached the maximum runs
            if (!isContinuous && runCount >= maxRuns) {
                break;
            }
            runCount++;
            this.appState.setCurrentRun(runCount);
            log_1.log.separator();
            if (isContinuous) {
                log_1.log.info(`📊 Starting run #${runCount} (continuous mode)`);
            }
            else {
                log_1.log.info(`📊 Starting run #${runCount} of ${maxRuns}`);
            }
            // Perform update cycle
            const result = await this.performUpdateCycle();
            if (result.success) {
                successCount++;
            }
            else {
                failureCount++;
            }
            // Log statistics
            log_1.log.info(`📈 Statistics: ${successCount} successful, ${failureCount} failed`);
            // Check if we should continue
            if (!isContinuous && runCount >= maxRuns) {
                break;
            }
            if (this.appState.isShutdownRequested()) {
                break;
            }
            // Calculate delay for next run
            const delaySeconds = (0, random_1.randomLoopDelay)(config_1.config.minDelaySeconds, config_1.config.maxDelaySeconds);
            log_1.log.logNextRun(delaySeconds);
            // Sleep with cancellation support
            const shouldContinue = await this.sleepWithCancellation(delaySeconds);
            if (!shouldContinue) {
                break;
            }
        }
        // Final statistics
        log_1.log.separator();
        log_1.log.info(`📊 Final Statistics:`);
        log_1.log.info(`  Total runs: ${runCount}`);
        log_1.log.info(`  Successful: ${successCount}`);
        log_1.log.info(`  Failed: ${failureCount}`);
        log_1.log.info(`  Success rate: ${runCount > 0 ? ((successCount / runCount) * 100).toFixed(1) : 0}%`);
        log_1.log.logComplete();
    }
    /**
     * Validate environment and dependencies
     */
    validateEnvironment() {
        try {
            // Validate configuration
            if (config_1.config.headlinePool.length === 0) {
                log_1.log.error('❌ No headlines configured in HEADLINE_POOL');
                return false;
            }
            if (config_1.config.minDelaySeconds >= config_1.config.maxDelaySeconds) {
                log_1.log.error('❌ MIN_DELAY_SECONDS must be less than MAX_DELAY_SECONDS');
                return false;
            }
            // Ensure required directories exist
            (0, log_1.ensureLogDirectory)();
            log_1.log.debug('✅ Environment validation passed');
            return true;
        }
        catch (error) {
            log_1.log.error('❌ Environment validation failed', error);
            return false;
        }
    }
    /**
     * Main application entry point
     */
    async run() {
        try {
            // Parse command line arguments
            const args = this.parseArgs();
            // Show help if requested
            if (args.help) {
                this.showHelp();
                return;
            }
            // Validate environment
            if (!this.validateEnvironment()) {
                process.exit(1);
            }
            // Setup shutdown handlers
            this.setupShutdownHandlers();
            // Run main loop
            await this.runMainLoop(args.runs);
        }
        catch (error) {
            log_1.log.error('💥 Fatal error in main application', error);
            process.exit(1);
        }
    }
}
exports.NaukriPulseApp = NaukriPulseApp;
/**
 * Main execution function
 */
async function main() {
    const app = new NaukriPulseApp();
    await app.run();
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log_1.log.error('🚨 Unhandled Promise Rejection', { reason, promise });
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log_1.log.error('🚨 Uncaught Exception', error);
    process.exit(1);
});
// Run the application if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
exports.default = main;
//# sourceMappingURL=index.js.map