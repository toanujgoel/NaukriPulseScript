import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './utils/config';
import { log, UpdateLogEntry, getLastHeadline, saveLastHeadline } from './utils/log';
import { randomChoiceExcluding, randomTypingDelay, randomSleep } from './utils/random';
import { SELECTORS, getTextWithFallback, clickWithFallback, typeWithFallback } from './utils/selectors';

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
export class HeadlineUpdater {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private startTime: number = 0;

  /**
   * Initialize browser with saved authentication state
   */
  private async initBrowser(): Promise<void> {
    log.debug('🚀 Initializing browser for headline update...');
    
    // Check if storage state exists
    if (!fs.existsSync(config.storageStatePath)) {
      throw new Error('Authentication state not found. Please run: npm run login');
    }

    this.browser = await chromium.launch({
      headless: config.headless,
      args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    // Load saved authentication state
    this.context = await this.browser.newContext({
      storageState: config.storageStatePath,
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(config.timeoutMs);
    
    log.debug('✅ Browser initialized with saved authentication');
  }

  /**
   * Navigate to profile page and verify authentication
   */
  private async navigateToProfile(): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');
    
    log.debug('📱 Navigating to profile page...');
    
    try {
      await this.page.goto(config.naukriProfileUrl, {
        waitUntil: 'networkidle',
        timeout: config.timeoutMs
      });
      
      // Wait for page to stabilize
      await randomSleep(2000, 4000);
      
      const currentUrl = this.page.url();
      log.debug(`Current URL: ${currentUrl}`);
      
      // Check if redirected to login page (session expired)
      if (currentUrl.includes('/nlogin/')) {
        log.logSessionValidation(false, currentUrl);
        return false;
      }
      
      log.logSessionValidation(true);
      return true;
    } catch (error) {
      log.error('Failed to navigate to profile page', error);
      return false;
    }
  }

  /**
   * Navigate to resume headline section by clicking on it
   */
  private async navigateToResumeHeadline(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    log.debug('📜 Navigating to resume headline section...');
    
    try {
      // First, click on the "Resume headline" text to navigate to that section
      const resumeHeadlineSelector = "xpath=//span[text()='Resume headline'][1]";
      const resumeHeadlineElement = this.page.locator(resumeHeadlineSelector);
      
      if (await resumeHeadlineElement.count() > 0) {
        log.debug('Found Resume headline section, clicking to navigate...');
        await resumeHeadlineElement.click();
        await randomSleep(1000, 2000); // Wait for navigation/expansion
        log.debug('Successfully clicked on Resume headline section');
      } else {
        log.warn('Resume headline section not found, continuing anyway...');
      }
      
    } catch (error) {
      log.warn('Error navigating to resume headline section, continuing anyway:', error);
    }
  }

  /**
   * Get current headline from the page
   */
  private async getCurrentHeadline(): Promise<string | null> {
    if (!this.page) throw new Error('Page not initialized');
    
    log.debug('📖 Reading current headline...');
    
    const currentHeadline = await getTextWithFallback(
      this.page,
      SELECTORS.PROFILE.CURRENT_HEADLINE,
      10000
    );
    
    if (currentHeadline) {
      log.debug(`Current headline: "${currentHeadline}"`);
    } else {
      log.warn('Could not read current headline from page');
    }
    
    return currentHeadline;
  }

  /**
   * Select a new headline based on rotation rules
   */
  private selectNewHeadline(currentHeadline: string | null): string | null {
    const lastUsedHeadline = getLastHeadline();
    const excludeList: string[] = [];
    
    // Exclude current headline if found
    if (currentHeadline) {
      excludeList.push(currentHeadline);
    }
    
    // Exclude last used headline if found
    if (lastUsedHeadline) {
      excludeList.push(lastUsedHeadline);
    }
    
    log.debug('Headline selection criteria:', {
      pool: config.headlinePool,
      current: currentHeadline,
      lastUsed: lastUsedHeadline,
      excluding: excludeList
    });
    
    // Try to find a headline that's not in the exclude list
    const newHeadline = randomChoiceExcluding(config.headlinePool, excludeList);
    
    if (!newHeadline) {
      log.warn('No suitable headline found for rotation (all options excluded)');
      return null;
    }
    
    log.debug(`Selected new headline: "${newHeadline}"`);
    return newHeadline;
  }

  /**
   * Format headline with timestamp if configured
   */
  private formatHeadline(baseHeadline: string): string {
    if (!config.appendTimestamp) {
      return baseHeadline;
    }
    
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `${baseHeadline} | Updated ${timestamp}`;
  }

  /**
   * Update the headline on the page
   */
  private async updateHeadlineOnPage(newHeadline: string): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');
    
    log.debug('✏️ Starting headline update process...');
    
    try {
      // Step 1: Click edit button
      log.debug('Clicking edit headline button...');
      const editClicked = await clickWithFallback(
        this.page,
        SELECTORS.PROFILE.EDIT_HEADLINE_BUTTON,
        { timeout: 15000, retries: 3 }
      );
      
      if (!editClicked) {
        throw new Error('Could not click edit headline button');
      }
      
      // Wait for edit mode to activate
      await randomSleep(1000, 2000);
      
      // Step 2: Clear and type new headline
      log.debug('Typing new headline...');
      const typeSuccess = await typeWithFallback(
        this.page,
        SELECTORS.PROFILE.HEADLINE_INPUT,
        newHeadline,
        { 
          timeout: 15000, 
          delay: randomTypingDelay(),
          clear: true 
        }
      );
      
      if (!typeSuccess) {
        throw new Error('Could not type new headline');
      }
      
      // Wait before saving
      await randomSleep(1000, 2000);
      
      // Step 3: Click save button
      log.debug('Clicking save button...');
      const saveClicked = await clickWithFallback(
        this.page,
        SELECTORS.PROFILE.SAVE_BUTTON,
        { timeout: 15000, retries: 3 }
      );
      
      if (!saveClicked) {
        throw new Error('Could not click save button');
      }
      
      // Step 4: Wait for save confirmation
      log.debug('Waiting for save confirmation...');
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Optional: Look for success message
      try {
        await getTextWithFallback(
          this.page,
          SELECTORS.PROFILE.SUCCESS_MESSAGE,
          5000
        );
        log.debug('✅ Success message detected');
      } catch (error) {
        log.debug('No explicit success message found, but proceeding');
      }
      
      log.debug('✅ Headline update completed successfully');
      return true;
    } catch (error) {
      log.error('❌ Failed to update headline on page', error);
      return false;
    }
  }

  /**
   * Take a screenshot on failure for debugging
   */
  private async takeFailureScreenshot(error: string): Promise<void> {
    if (!this.page) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const screenshotPath = path.join(config.screenshotsPath, `failed-${timestamp}.png`);
      
      // Ensure screenshots directory exists
      const screenshotDir = path.dirname(screenshotPath);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      log.debug(`📸 Failure screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      log.warn('Failed to take failure screenshot', screenshotError);
    }
  }

  /**
   * Clean up browser resources
   */
  private async cleanup(): Promise<void> {
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
      log.debug('🧹 Browser cleanup completed');
    } catch (error) {
      log.warn('Warning during cleanup', error);
    }
  }

  /**
   * Main update function
   */
  async updateHeadline(): Promise<UpdateResult> {
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

      // Scroll to ensure resume headline section is visible
      await this.navigateToResumeHeadline();

      // Get current headline
      const currentHeadline = await this.getCurrentHeadline();
      oldHeadline = currentHeadline || 'Unknown';
      
      // Select new headline
      const selectedHeadline = this.selectNewHeadline(currentHeadline);
      if (!selectedHeadline) {
        // Graceful skip when no suitable headline is available
        const duration = Date.now() - this.startTime;
        log.info('⏭️ Skipping update - no suitable headline available');
        
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
      saveLastHeadline(selectedHeadline);
      
      const duration = Date.now() - this.startTime;
      
      return {
        success: true,
        oldHeadline,
        newHeadline,
        durationMs: duration
      };
    } catch (error) {
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
    } finally {
      await this.cleanup();
    }
  }
}

/**
 * Standalone function to perform a single headline update
 */
export async function updateHeadlineOnce(): Promise<UpdateResult> {
  const updater = new HeadlineUpdater();
  const result = await updater.updateHeadline();
  
  // Log the result
  const logEntry: UpdateLogEntry = {
    timestamp: new Date().toISOString(),
    oldHeadline: result.oldHeadline,
    newHeadline: result.newHeadline,
    success: result.success,
    durationMs: result.durationMs,
    ...(result.error && { error: result.error })
  };
  
  log.logUpdate(logEntry);
  
  return result;
}

// Export for use in other modules
export default HeadlineUpdater;