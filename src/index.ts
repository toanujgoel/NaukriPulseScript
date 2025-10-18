import { config } from './utils/config';
import { log, ensureLogDirectory } from './utils/log';
import { randomLoopDelay } from './utils/random';
import { updateHeadlineOnce, UpdateResult } from './updateHeadline';

/**
 * Command line arguments interface
 */
interface CommandLineArgs {
  runs: number;
  help: boolean;
}

/**
 * Application state for graceful shutdown
 */
class AppState {
  private isShuttingDown = false;
  private currentRun = 0;
  private totalRuns = 0;

  setShuttingDown(value: boolean): void {
    this.isShuttingDown = value;
  }

  isShutdownRequested(): boolean {
    return this.isShuttingDown;
  }

  setCurrentRun(run: number): void {
    this.currentRun = run;
  }

  getCurrentRun(): number {
    return this.currentRun;
  }

  setTotalRuns(runs: number): void {
    this.totalRuns = runs;
  }

  getTotalRuns(): number {
    return this.totalRuns;
  }
}

/**
 * Main application class
 */
class NaukriPulseApp {
  private appState = new AppState();

  /**
   * Parse command line arguments
   */
  private parseArgs(): CommandLineArgs {
    const args = process.argv.slice(2);
    const result: CommandLineArgs = {
      runs: config.runs,
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
          } else {
            log.error('Invalid value for --runs argument');
            process.exit(1);
          }
          break;
          
        case '--help':
        case '-h':
          result.help = true;
          break;
          
        default:
          if (arg.startsWith('--')) {
            log.warn(`Unknown argument: ${arg}`);
          }
          break;
      }
    }

    return result;
  }

  /**
   * Display help information
   */
  private showHelp(): void {
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
  private setupShutdownHandlers(): void {
    const gracefulShutdown = (signal: string) => {
      log.info(`🛑 Received ${signal}, initiating graceful shutdown...`);
      this.appState.setShuttingDown(true);
      
      // Give some time for current operation to complete
      setTimeout(() => {
        log.info('🔚 Shutdown complete');
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
  private async sleepWithCancellation(seconds: number): Promise<boolean> {
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
  private async performUpdateCycle(): Promise<UpdateResult> {
    log.info('🔄 Starting headline update cycle...');
    
    try {
      const result = await updateHeadlineOnce();
      
      if (result.success) {
        if (result.oldHeadline === result.newHeadline) {
          log.info('⏭️ Update skipped - no suitable headline available');
        } else {
          log.info(`✅ Headline updated successfully in ${result.durationMs}ms`);
        }
      } else {
        log.error(`❌ Update failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      log.error('💥 Unexpected error during update cycle', error);
      
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
  private async runMainLoop(maxRuns: number): Promise<void> {
    this.appState.setTotalRuns(maxRuns);
    const isContinuous = maxRuns === 0;
    let runCount = 0;
    let successCount = 0;
    let failureCount = 0;

    log.logStart(isContinuous ? 'continuous' : 'once', maxRuns || undefined);

    while (!this.appState.isShutdownRequested()) {
      // Check if we've reached the maximum runs
      if (!isContinuous && runCount >= maxRuns) {
        break;
      }

      runCount++;
      this.appState.setCurrentRun(runCount);

      log.separator();
      if (isContinuous) {
        log.info(`📊 Starting run #${runCount} (continuous mode)`);
      } else {
        log.info(`📊 Starting run #${runCount} of ${maxRuns}`);
      }

      // Perform update cycle
      const result = await this.performUpdateCycle();
      
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Log statistics
      log.info(`📈 Statistics: ${successCount} successful, ${failureCount} failed`);

      // Check if we should continue
      if (!isContinuous && runCount >= maxRuns) {
        break;
      }

      if (this.appState.isShutdownRequested()) {
        break;
      }

      // Calculate delay for next run
      const delaySeconds = randomLoopDelay(config.minDelaySeconds, config.maxDelaySeconds);
      log.logNextRun(delaySeconds);

      // Sleep with cancellation support
      const shouldContinue = await this.sleepWithCancellation(delaySeconds);
      if (!shouldContinue) {
        break;
      }
    }

    // Final statistics
    log.separator();
    log.info(`📊 Final Statistics:`);
    log.info(`  Total runs: ${runCount}`);
    log.info(`  Successful: ${successCount}`);
    log.info(`  Failed: ${failureCount}`);
    log.info(`  Success rate: ${runCount > 0 ? ((successCount / runCount) * 100).toFixed(1) : 0}%`);
    
    log.logComplete();
  }

  /**
   * Validate environment and dependencies
   */
  private validateEnvironment(): boolean {
    try {
      // Validate configuration
      if (config.headlinePool.length === 0) {
        log.error('❌ No headlines configured in HEADLINE_POOL');
        return false;
      }

      if (config.minDelaySeconds >= config.maxDelaySeconds) {
        log.error('❌ MIN_DELAY_SECONDS must be less than MAX_DELAY_SECONDS');
        return false;
      }

      // Ensure required directories exist
      ensureLogDirectory();

      log.debug('✅ Environment validation passed');
      return true;
    } catch (error) {
      log.error('❌ Environment validation failed', error);
      return false;
    }
  }

  /**
   * Main application entry point
   */
  async run(): Promise<void> {
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

    } catch (error) {
      log.error('💥 Fatal error in main application', error);
      process.exit(1);
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const app = new NaukriPulseApp();
  await app.run();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error('🚨 Unhandled Promise Rejection', { reason, promise });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('🚨 Uncaught Exception', error);
  process.exit(1);
});

// Run the application if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { NaukriPulseApp };
export default main;