import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { config } from './utils/config';
import { log, ensureLogDirectory } from './utils/log';
import { randomSleep } from './utils/random';

/**
 * One-time login script to authenticate and save session state
 * This script launches a headed browser for manual OTP completion
 */
class LoginManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * Initialize browser and context
   */
  private async initBrowser(): Promise<void> {
    log.info('🚀 Launching browser for authentication...');
    
    this.browser = await chromium.launch({
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
  private async navigateToLogin(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    log.info('📱 Navigating to Naukri login page...');
    await this.page.goto('https://www.naukri.com/nlogin/login', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Wait for page to fully load
    await randomSleep(2000, 4000);
    
    log.info('✅ Login page loaded successfully');
  }

  /**
   * Wait for user to complete login process
   */
  private async waitForLoginCompletion(): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');
    
    log.banner('🔐 Manual Login Required');
    log.info('Please complete the login process in the browser window:');
    log.info('1. Enter your email/mobile number');
    log.info('2. Enter your password');
    log.info('3. Complete OTP verification if required');
    log.info('4. Wait for redirect to profile page');
    log.separator();
    
    // Wait for either profile page or login failure
    try {
      await Promise.race([
        // Success: redirected to profile page
        this.page.waitForURL('**/mnjuser/profile**', { timeout: 300000 }),
        // Alternative success: any profile-related URL
        this.page.waitForURL('**/mnjuser/**', { timeout: 300000 })
      ]);
      
      log.info('✅ Login successful! Detected profile page.');
      return true;
    } catch (error) {
      // Check current URL to provide better feedback
      const currentUrl = this.page.url();
      log.error('❌ Login timeout or failed', { currentUrl });
      
      if (currentUrl.includes('nlogin')) {
        log.warn('Still on login page. Please check credentials and try again.');
      }
      
      return false;
    }
  }

  /**
   * Verify we're on the correct profile page
   */
  private async verifyProfilePage(): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');
    
    const currentUrl = this.page.url();
    log.info(`Current URL: ${currentUrl}`);
    
    // Check if we're on a profile-related page
    if (currentUrl.includes('/mnjuser/profile') || currentUrl.includes('/mnjuser/')) {
      log.info('✅ Successfully reached profile area');
      
      // Try to navigate to the specific profile URL we need
      try {
        await this.page.goto(config.naukriProfileUrl, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        log.info('✅ Navigated to target profile URL');
        return true;
      } catch (error) {
        log.warn('Could not navigate to target profile URL, but login appears successful', error);
        return true; // Still consider it successful
      }
    }
    
    log.error('❌ Not on profile page after login');
    return false;
  }

  /**
   * Save authentication state for future use
   */
  private async saveAuthState(): Promise<void> {
    if (!this.context) throw new Error('Context not initialized');
    
    try {
      // Ensure auth directory exists
      const authDir = path.dirname(config.storageStatePath);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      
      // Save storage state
      await this.context.storageState({ path: config.storageStatePath });
      
      log.info('💾 Authentication state saved successfully');
      log.info(`📁 Saved to: ${config.storageStatePath}`);
    } catch (error) {
      log.error('❌ Failed to save authentication state', error);
      throw error;
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
   * Main login flow
   */
  async performLogin(): Promise<boolean> {
    try {
      // Ensure log directory exists
      ensureLogDirectory();
      
      log.logStart('once');
      log.banner('🔐 Naukri Authentication Setup');
      
      // Initialize browser
      await this.initBrowser();
      
      // Navigate to login page
      await this.navigateToLogin();
      
      // Wait for manual login completion
      const loginSuccess = await this.waitForLoginCompletion();
      if (!loginSuccess) {
        log.error('❌ Login process failed or timed out');
        return false;
      }
      
      // Verify we're on the profile page
      const profileVerified = await this.verifyProfilePage();
      if (!profileVerified) {
        log.error('❌ Could not verify profile page access');
        return false;
      }
      
      // Save authentication state
      await this.saveAuthState();
      
      log.separator();
      log.info('🎉 Authentication setup completed successfully!');
      log.info('You can now run the automation script with:');
      log.info('  npm start     (continuous mode)');
      log.info('  npm run once  (single run)');
      log.separator();
      
      return true;
    } catch (error) {
      log.error('❌ Login process failed', error);
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const loginManager = new LoginManager();
  
  try {
    const success = await loginManager.performLogin();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log.error('Fatal error during login process', error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log.info('🛑 Login process interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.info('🛑 Login process terminated');
  process.exit(0);
});

// Run the login process if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    log.error('Unhandled error in login process', error);
    process.exit(1);
  });
}

export { LoginManager };