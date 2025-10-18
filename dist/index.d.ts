/**
 * Main application class
 */
declare class NaukriPulseApp {
    private appState;
    /**
     * Parse command line arguments
     */
    private parseArgs;
    /**
     * Display help information
     */
    private showHelp;
    /**
     * Setup graceful shutdown handlers
     */
    private setupShutdownHandlers;
    /**
     * Sleep with cancellation support
     */
    private sleepWithCancellation;
    /**
     * Perform a single update cycle
     */
    private performUpdateCycle;
    /**
     * Main execution loop
     */
    private runMainLoop;
    /**
     * Validate environment and dependencies
     */
    private validateEnvironment;
    /**
     * Main application entry point
     */
    run(): Promise<void>;
}
/**
 * Main execution function
 */
declare function main(): Promise<void>;
export { NaukriPulseApp };
export default main;
//# sourceMappingURL=index.d.ts.map