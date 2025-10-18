/**
 * One-time login script to authenticate and save session state
 * This script launches a headed browser for manual OTP completion
 */
declare class LoginManager {
    private browser;
    private context;
    private page;
    /**
     * Initialize browser and context
     */
    private initBrowser;
    /**
     * Navigate to Naukri login page
     */
    private navigateToLogin;
    /**
     * Wait for user to complete login process
     */
    private waitForLoginCompletion;
    /**
     * Verify we're on the correct profile page
     */
    private verifyProfilePage;
    /**
     * Save authentication state for future use
     */
    private saveAuthState;
    /**
     * Clean up browser resources
     */
    private cleanup;
    /**
     * Main login flow
     */
    performLogin(): Promise<boolean>;
}
export { LoginManager };
//# sourceMappingURL=login.d.ts.map