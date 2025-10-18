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
exports.HeadlineUpdater = void 0;
exports.updateHeadlineOnce = updateHeadlineOnce;
const test_1 = require("@playwright/test");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./utils/config");
const log_1 = require("./utils/log");
const random_1 = require("./utils/random");
const selectors_1 = require("./utils/selectors");
/**
 * Headline updater class with robust error handling and retry logic
 */
class HeadlineUpdater {
    browser = null;
    context = null;
    page = null;
    startTime = 0;
    /**
     * Initialize browser with saved authentication state
     */
    async initBrowser() {
        log_1.log.debug('🚀 Initializing browser for headline update...');
        // Check if storage state exists
        if (!fs.existsSync(config_1.config.storageStatePath)) {
            throw new Error('Authentication state not found. Please run: npm run login');
        }
        this.browser = await test_1.chromium.launch({
            headless: config_1.config.headless,
            args: [
                '--no-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        // Load saved authentication state
        this.context = await this.browser.newContext({
            storageState: config_1.config.storageStatePath,
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        this.page = await this.context.newPage();
        this.page.setDefaultTimeout(config_1.config.timeoutMs);
        log_1.log.debug('✅ Browser initialized with saved authentication');
    }
    /**
     * Navigate to profile page and verify authentication
     */
    async navigateToProfile() {
        if (!this.page)
            throw new Error('Page not initialized');
        log_1.log.debug('📱 Navigating to profile page...');
        try {
            await this.page.goto(config_1.config.naukriProfileUrl, {
                waitUntil: 'networkidle',
                timeout: config_1.config.timeoutMs
            });
            // Wait for page to stabilize
            await (0, random_1.randomSleep)(2000, 4000);
            const currentUrl = this.page.url();
            log_1.log.debug(`Current URL: ${currentUrl}`);
            // Check if redirected to login page (session expired)
            if (currentUrl.includes('/nlogin/')) {
                log_1.log.sessionValidation(false, currentUrl);
                return false;
            }
            log_1.log.sessionValidation(true);
            return true;
        }
        catch (error) {
            log_1.log.error('Failed to navigate to profile page', error);
            return false;
        }
    }
    /**
     * Get current headline from the page
     */
    async getCurrentHeadline() {
        if (!this.page)
            throw new Error('Page not initialized');
        log_1.log.debug('📖 Reading current headline...');
        const currentHeadline = await (0, selectors_1.getTextWithFallback)(this.page, selectors_1.SELECTORS.PROFILE.CURRENT_HEADLINE, 10000);
        if (currentHeadline) {
            log_1.log.debug(`Current headline: "${currentHeadline}"`);
        }
        else {
            log_1.log.warn('Could not read current headline from page');
        }
        return currentHeadline;
    }
    /**
     * Select a new headline based on rotation rules
     */
    selectNewHeadline(currentHeadline) {
        const lastUsedHeadline = (0, log_1.getLastHeadline)();
        const excludeList = [];
        // Exclude current headline if found
        if (currentHeadline) {
            excludeList.push(currentHeadline);
        }
        // Exclude last used headline if found
        if (lastUsedHeadline) {
            excludeList.push(lastUsedHeadline);
        }
        log_1.log.debug('Headline selection criteria:', {
            pool: config_1.config.headlinePool,
            current: currentHeadline,
            lastUsed: lastUsedHeadline,
            excluding: excludeList
        });
        // Try to find a headline that's not in the exclude list
        const newHeadline = (0, random_1.randomChoiceExcluding)(config_1.config.headlinePool, excludeList);
        if (!newHeadline) {
            log_1.log.warn('No suitable headline found for rotation (all options excluded)');
            return null;
        }
        log_1.log.debug(`Selected new headline: "${newHeadline}"`);
        return newHeadline;
    }
    /**
     * Format headline with timestamp if configured
     */
    formatHeadline(baseHeadline) {
        if (!config_1.config.appendTimestamp) {
            return baseHeadline;
        }
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        return `${baseHeadline} | Updated ${timestamp}`;
    }
    /**
     * Update the headline on the page
     */
    async updateHeadlineOnPage(newHeadline) {
        if (!this.page)
            throw new Error('Page not initialized');
        log_1.log.debug('✏️ Starting headline update process...');
        try {
            // Step 1: Click edit button
            log_1.log.debug('Clicking edit headline button...');
            const editClicked = await (0, selectors_1.clickWithFallback)(this.page, selectors_1.SELECTORS.PROFILE.EDIT_HEADLINE_BUTTON, { timeout: 15000, retries: 3 });
            if (!editClicked) {
                throw new Error('Could not click edit headline button');
            }
            // Wait for edit mode to activate
            await (0, random_1.randomSleep)(1000, 2000);
            // Step 2: Clear and type new headline
            log_1.log.debug('Typing new headline...');
            const typeSuccess = await (0, selectors_1.typeWithFallback)(this.page, selectors_1.SELECTORS.PROFILE.HEADLINE_INPUT, newHeadline, {
                timeout: 15000,
                delay: (0, random_1.randomTypingDelay)(),
                clear: true
            });
            if (!typeSuccess) {
                throw new Error('Could not type new headline');
            }
            // Wait before saving
            await (0, random_1.randomSleep)(1000, 2000);
            // Step 3: Click save button
            log_1.log.debug('Clicking save button...');
            const saveClicked = await (0, selectors_1.clickWithFallback)(this.page, selectors_1.SELECTORS.PROFILE.SAVE_BUTTON, { timeout: 15000, retries: 3 });
            if (!saveClicked) {
                throw new Error('Could not click save button');
            }
            // Step 4: Wait for save confirmation
            log_1.log.debug('Waiting for save confirmation...');
            await this.page.waitForLoadState('networkidle', { timeout: 15000 });
            // Optional: Look for success message
            try {
                await (0, selectors_1.getTextWithFallback)(this.page, selectors_1.SELECTORS.PROFILE.SUCCESS_MESSAGE, 5000);
                log_1.log.debug('✅ Success message detected');
            }
            catch (error) {
                log_1.log.debug('No explicit success message found, but proceeding');
            }
            log_1.log.debug('✅ Headline update completed successfully');
            return true;
        }
        catch (error) {
            log_1.log.error('❌ Failed to update headline on page', error);
            return false;
        }
    }
    /**
     * Take a screenshot on failure for debugging
     */
    async takeFailureScreenshot(error) {
        if (!this.page)
            return;
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const screenshotPath = path.join(config_1.config.screenshotsPath, `failed-${timestamp}.png`);
            // Ensure screenshots directory exists
            const screenshotDir = path.dirname(screenshotPath);
            if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            await this.page.screenshot({
                path: screenshotPath,
                fullPage: true
            });
            log_1.log.debug(`📸 Failure screenshot saved: ${screenshotPath}`);
        }
        catch (screenshotError) {
            log_1.log.warn('Failed to take failure screenshot', screenshotError);
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
     * Main update function
     */
    async updateHeadline() {
        this.startTime = Date.now();
        let oldHeadline = '';
        let newHeadline = '';
        try {
            // Initialize browser
            await this.initBrowser();
            // Navigate to profile and verify authentication
            const authValid = await this.navigateToProfile();
            if (!authValid) {
                throw new Error('Authentication expired. Please run: npm run login');
            }
            // Get current headline
            const currentHeadline = await this.getCurrentHeadline();
            oldHeadline = currentHeadline || 'Unknown';
            // Select new headline
            const selectedHeadline = this.selectNewHeadline(currentHeadline);
            if (!selectedHeadline) {
                // Graceful skip when no suitable headline is available
                const duration = Date.now() - this.startTime;
                log_1.log.info('⏭️ Skipping update - no suitable headline available');
                return {
                    success: true, // Consider this a successful skip
                    oldHeadline,
                    newHeadline: oldHeadline,
                    durationMs: duration
                };
            }
            // Format headline with timestamp if needed
            newHeadline = this.formatHeadline(selectedHeadline);
            // Update headline on page
            const updateSuccess = await this.updateHeadlineOnPage(newHeadline);
            if (!updateSuccess) {
                throw new Error('Failed to update headline on page');
            }
            // Save the base headline (without timestamp) as last used
            (0, log_1.saveLastHeadline)(selectedHeadline);
            const duration = Date.now() - this.startTime;
            return {
                success: true,
                oldHeadline,
                newHeadline,
                durationMs: duration
            };
        }
        catch (error) {
            const duration = Date.now() - this.startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Take screenshot for debugging
            await this.takeFailureScreenshot(errorMessage);
            return {
                success: false,
                oldHeadline,
                newHeadline,
                durationMs: duration,
                error: errorMessage
            };
        }
        finally {
            await this.cleanup();
        }
    }
}
exports.HeadlineUpdater = HeadlineUpdater;
/**
 * Standalone function to perform a single headline update
 */
async function updateHeadlineOnce() {
    const updater = new HeadlineUpdater();
    const result = await updater.updateHeadline();
    // Log the result
    const logEntry = {
        timestamp: new Date().toISOString(),
        oldHeadline: result.oldHeadline,
        newHeadline: result.newHeadline,
        success: result.success,
        durationMs: result.durationMs,
        ...(result.error && { error: result.error })
    };
    log_1.log.logUpdate(logEntry);
    return result;
}
// Export for use in other modules
exports.default = HeadlineUpdater;
//# sourceMappingURL=updateHeadline.js.map