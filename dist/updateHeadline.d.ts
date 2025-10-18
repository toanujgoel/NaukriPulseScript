/**
 * Result of a headline update attempt
 */
export interface UpdateResult {
    success: boolean;
    oldHeadline: string;
    newHeadline: string;
    durationMs: number;
    error?: string;
}
/**
 * Headline updater class with robust error handling and retry logic
 */
export declare class HeadlineUpdater {
    private browser;
    private context;
    private page;
    private startTime;
    /**
     * Initialize browser with saved authentication state
     */
    private initBrowser;
    /**
     * Navigate to profile page and verify authentication
     */
    private navigateToProfile;
    /**
     * Get current headline from the page
     */
    private getCurrentHeadline;
    /**
     * Select a new headline based on rotation rules
     */
    private selectNewHeadline;
    /**
     * Format headline with timestamp if configured
     */
    private formatHeadline;
    /**
     * Update the headline on the page
     */
    private updateHeadlineOnPage;
    /**
     * Take a screenshot on failure for debugging
     */
    private takeFailureScreenshot;
    /**
     * Clean up browser resources
     */
    private cleanup;
    /**
     * Main update function
     */
    updateHeadline(): Promise<UpdateResult>;
}
/**
 * Standalone function to perform a single headline update
 */
export declare function updateHeadlineOnce(): Promise<UpdateResult>;
export default HeadlineUpdater;
//# sourceMappingURL=updateHeadline.d.ts.map