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
exports.LoginManager = void 0;
const test_1 = require("@playwright/test");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("./utils/config");
const log_1 = require("./utils/log");
const random_1 = require("./utils/random");
/**
 * One-time login script to authenticate and save session state
 * This script launches a headed browser for manual OTP completion
 */
class LoginManager {
    browser = null;
    context = null;
    page = null;
    /**
     * Initialize browser and context
     */
    async initBrowser() {
        log_1.log.info('🚀 Launching browser for authentication...');
        this.browser = await test_1.chromium.launch({
            headless: false, // Always headed for manual login
            slowMo: 100, // Slow down for better visibility
            args: [
                '--no-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        this.page = await this.context.newPage();
        // Set longer timeout for manual interactions
        this.page.setDefaultTimeout(300000); // 5 minutes
    }
    /**
     * Navigate to Naukri login page
     */
    async navigateToLogin() {
        if (!this.page)
            throw new Error('Page not initialized');
        log_1.log.info('📱 Navigating to Naukri login page...');
        await this.page.goto('https://www.naukri.com/nlogin/login', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        // Wait for page to fully load
        await (0, random_1.randomSleep)(2000, 4000);
        log_1.log.info('✅ Login page loaded successfully');
    }
    /**
     * Wait for user to complete login process
     */
    async waitForLoginCompletion() {
        if (!this.page)
            throw new Error('Page not initialized');
        log_1.log.banner('🔐 Manual Login Required');
        log_1.log.info('Please complete the login process in the browser window:');
        log_1.log.info('1. Enter your email/mobile number');
        log_1.log.info('2. Enter your password');
        log_1.log.info('3. Complete OTP verification if required');
        log_1.log.info('4. Wait for redirect to profile page');
        log_1.log.separator();
        // Wait for either profile page or login failure
        try {
            await Promise.race([
                // Success: redirected to profile page
                this.page.waitForURL('**/mnjuser/profile**', { timeout: 300000 }),
                // Alternative success: any profile-related URL
                this.page.waitForURL('**/mnjuser/**', { timeout: 300000 })
            ]);
            log_1.log.info('✅ Login successful! Detected profile page.');
            return true;
        }
        catch (error) {
            // Check current URL to provide better feedback
            const currentUrl = this.page.url();
            log_1.log.error('❌ Login timeout or failed', { currentUrl });
            if (currentUrl.includes('nlogin')) {
                log_1.log.warn('Still on login page. Please check credentials and try again.');
            }
            return false;
        }
    }
    /**
     * Verify we're on the correct profile page
     */
    async verifyProfilePage() {
        if (!this.page)
            throw new Error('Page not initialized');
        const currentUrl = this.page.url();
        log_1.log.info(`Current URL: ${currentUrl}`);
        // Check if we're on a profile-related page
        if (currentUrl.includes('/mnjuser/profile') || currentUrl.includes('/mnjuser/')) {
            log_1.log.info('✅ Successfully reached profile area');
            // Try to navigate to the specific profile URL we need
            try {
                await this.page.goto(config_1.config.naukriProfileUrl, {
                    waitUntil: 'networkidle',
                    timeout: 30000
                });
                log_1.log.info('✅ Navigated to target profile URL');
                return true;
            }
            catch (error) {
                log_1.log.warn('Could not navigate to target profile URL, but login appears successful', error);
                return true; // Still consider it successful
            }
        }
        log_1.log.error('❌ Not on profile page after login');
        return false;
    }
    /**
     * Save authentication state for future use
     */
    async saveAuthState() {
        if (!this.context)
            throw new Error('Context not initialized');
        try {
            // Ensure auth directory exists
            const authDir = path.dirname(config_1.config.storageStatePath);
            if (!fs.existsSync(authDir)) {
                fs.mkdirSync(authDir, { recursive: true });
            }
            // Save storage state
            await this.context.storageState({ path: config_1.config.storageStatePath });
            log_1.log.info('💾 Authentication state saved successfully');
            log_1.log.info(`📁 Saved to: ${config_1.config.storageStatePath}`);
        }
        catch (error) {
            log_1.log.error('❌ Failed to save authentication state', error);
            throw error;
        }
    }
    /**
     * Clean up browser resources
     */
    async cleanup() {
        try {
            if (this.page) {
                await this.page.close();
            }
            if (this.context) {
                await this.context.close();
            }
            if (this.browser) {
                await this.browser.close();
            }
            log_1.log.debug('🧹 Browser cleanup completed');
        }
        catch (error) {
            log_1.log.warn('Warning during cleanup', error);
        }
    }
    /**
     * Main login flow
     */
    async performLogin() {
        try {
            // Ensure log directory exists
            (0, log_1.ensureLogDirectory)();
            log_1.log.logStart('once');
            log_1.log.banner('🔐 Naukri Authentication Setup');
            // Initialize browser
            await this.initBrowser();
            // Navigate to login page
            await this.navigateToLogin();
            // Wait for manual login completion
            const loginSuccess = await this.waitForLoginCompletion();
            if (!loginSuccess) {
                log_1.log.error('❌ Login process failed or timed out');
                return false;
            }
            // Verify we're on the profile page
            const profileVerified = await this.verifyProfilePage();
            if (!profileVerified) {
                log_1.log.error('❌ Could not verify profile page access');
                return false;
            }
            // Save authentication state
            await this.saveAuthState();
            log_1.log.separator();
            log_1.log.info('🎉 Authentication setup completed successfully!');
            log_1.log.info('You can now run the automation script with:');
            log_1.log.info('  npm start     (continuous mode)');
            log_1.log.info('  npm run once  (single run)');
            log_1.log.separator();
            return true;
        }
        catch (error) {
            log_1.log.error('❌ Login process failed', error);
            return false;
        }
        finally {
            await this.cleanup();
        }
    }
}
exports.LoginManager = LoginManager;
/**
 * Main execution function
 */
async function main() {
    const loginManager = new LoginManager();
    try {
        const success = await loginManager.performLogin();
        process.exit(success ? 0 : 1);
    }
    catch (error) {
        log_1.log.error('Fatal error during login process', error);
        process.exit(1);
    }
}
// Handle process termination gracefully
process.on('SIGINT', () => {
    log_1.log.info('🛑 Login process interrupted by user');
    process.exit(0);
});
process.on('SIGTERM', () => {
    log_1.log.info('🛑 Login process terminated');
    process.exit(0);
});
// Run the login process if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        log_1.log.error('Unhandled error in login process', error);
        process.exit(1);
    });
}
//# sourceMappingURL=login.js.map