import { Page, Locator } from '@playwright/test';
import { log } from './log';

/**
 * Selector configuration for robust element location
 */
export interface SelectorConfig {
  primary: string;
  fallbacks: readonly string[];
  description: string;
}

/**
 * Naukri.com selectors with fallback strategies
 */
export const SELECTORS = {
  // Login page selectors
  LOGIN: {
    EMAIL_INPUT: {
      primary: 'input[placeholder*="email" i], input[name*="email" i]',
      fallbacks: [
        '#usernameField',
        'input[type="email"]',
        'input[data-test*="email"]'
      ],
      description: 'Email input field'
    },
    PASSWORD_INPUT: {
      primary: 'input[placeholder*="password" i], input[name*="password" i]',
      fallbacks: [
        '#passwordField',
        'input[type="password"]',
        'input[data-test*="password"]'
      ],
      description: 'Password input field'
    },
    LOGIN_BUTTON: {
      primary: 'button:has-text("Login"), input[value*="Login" i]',
      fallbacks: [
        'button[type="submit"]',
        '.loginButton',
        'button[data-test*="login"]'
      ],
      description: 'Login submit button'
    }
  },

  // Profile page selectors
  PROFILE: {
    EDIT_HEADLINE_BUTTON: {
      primary: 'button:has-text(/edit.*headline/i)',
      fallbacks: [
        'button:has-text(/edit/i)',
        '.edit-headline',
        '[data-test*="edit-headline"]',
        '.resumeHeadline button',
        '.profile-headline button'
      ],
      description: 'Edit headline button'
    },
    HEADLINE_INPUT: {
      primary: 'input[placeholder*="headline" i], textarea[placeholder*="headline" i]',
      fallbacks: [
        'input[data-test*="headline"]',
        'textarea[data-test*="headline"]',
        '.headline-input',
        '.resume-headline input',
        '.profile-headline input',
        'input[name*="headline" i]'
      ],
      description: 'Resume headline input field'
    },
    SAVE_BUTTON: {
      primary: 'button:has-text(/save|update/i)',
      fallbacks: [
        'button[type="submit"]',
        '.save-button',
        '.update-button',
        'button[data-test*="save"]',
        'button[data-test*="update"]'
      ],
      description: 'Save/Update button'
    },
    SUCCESS_MESSAGE: {
      primary: ':has-text(/updated|saved|success/i)',
      fallbacks: [
        '.success-message',
        '.notification.success',
        '.alert-success',
        '[data-test*="success"]'
      ],
      description: 'Success confirmation message'
    },
    CURRENT_HEADLINE: {
      primary: '.resumeHeadline .widgetHead, .profile-headline .text',
      fallbacks: [
        '.headline-text',
        '.resume-headline-display',
        '[data-test*="headline-display"]',
        '.profile-summary .headline'
      ],
      description: 'Current headline display text'
    }
  },

  // Navigation selectors
  NAVIGATION: {
    PROFILE_LINK: {
      primary: 'a[href*="/mnjuser/profile"], a:has-text(/profile/i)',
      fallbacks: [
        '.profile-link',
        'nav a:has-text(/profile/i)',
        '[data-test*="profile-link"]'
      ],
      description: 'Profile navigation link'
    },
    LOGOUT_LINK: {
      primary: 'a:has-text(/logout|sign out/i)',
      fallbacks: [
        '.logout-link',
        '[data-test*="logout"]',
        'button:has-text(/logout/i)'
      ],
      description: 'Logout link'
    }
  },

  // Common UI elements
  COMMON: {
    LOADING_SPINNER: {
      primary: '.loading, .spinner, [data-loading="true"]',
      fallbacks: [
        '.loader',
        '.progress',
        '[aria-label*="loading" i]'
      ],
      description: 'Loading spinner or indicator'
    },
    ERROR_MESSAGE: {
      primary: '.error-message, .alert-error, .notification.error',
      fallbacks: [
        '.error',
        '.alert-danger',
        '[data-test*="error"]'
      ],
      description: 'Error message display'
    },
    MODAL_CLOSE: {
      primary: 'button:has-text(/close|×/), .modal-close',
      fallbacks: [
        '.close-button',
        '[aria-label*="close" i]',
        '.modal .close'
      ],
      description: 'Modal close button'
    }
  }
} as const;

/**
 * Get a locator with fallback strategies
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration with fallbacks
 * @returns Promise<Locator | null>
 */
export async function getLocatorWithFallback(
  page: Page, 
  selectorConfig: SelectorConfig
): Promise<Locator | null> {
  const { primary, fallbacks, description } = selectorConfig;
  
  // Try primary selector first
  try {
    const primaryLocator = page.locator(primary);
    if (await primaryLocator.count() > 0) {
      log.debug(`Found element using primary selector for ${description}: ${primary}`);
      return primaryLocator.first();
    }
  } catch (error) {
    log.debug(`Primary selector failed for ${description}: ${primary}`, error);
  }

  // Try fallback selectors
  for (const fallback of fallbacks) {
    try {
      const fallbackLocator = page.locator(fallback);
      if (await fallbackLocator.count() > 0) {
        log.debug(`Found element using fallback selector for ${description}: ${fallback}`);
        return fallbackLocator.first();
      }
    } catch (error) {
      log.debug(`Fallback selector failed for ${description}: ${fallback}`, error);
    }
  }

  log.warn(`No element found for ${description} using any selector`);
  return null;
}

/**
 * Wait for an element to be visible with fallback strategies
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise<Locator | null>
 */
export async function waitForElementWithFallback(
  page: Page,
  selectorConfig: SelectorConfig,
  timeoutMs: number = 30000
): Promise<Locator | null> {
  const { primary, fallbacks, description } = selectorConfig;
  
  // Try primary selector first
  try {
    const primaryLocator = page.locator(primary);
    await primaryLocator.first().waitFor({ state: 'visible', timeout: timeoutMs / (fallbacks.length + 1) });
    log.debug(`Element visible using primary selector for ${description}: ${primary}`);
    return primaryLocator.first();
  } catch (error) {
    log.debug(`Primary selector timeout for ${description}: ${primary}`);
  }

  // Try fallback selectors
  for (const fallback of fallbacks) {
    try {
      const fallbackLocator = page.locator(fallback);
      await fallbackLocator.first().waitFor({ state: 'visible', timeout: timeoutMs / (fallbacks.length + 1) });
      log.debug(`Element visible using fallback selector for ${description}: ${fallback}`);
      return fallbackLocator.first();
    } catch (error) {
      log.debug(`Fallback selector timeout for ${description}: ${fallback}`);
    }
  }

  log.warn(`No visible element found for ${description} within timeout`);
  return null;
}

/**
 * Click an element with retry logic and fallback selectors
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param options Click options
 * @returns Promise<boolean> Success status
 */
export async function clickWithFallback(
  page: Page,
  selectorConfig: SelectorConfig,
  options: { timeout?: number; retries?: number } = {}
): Promise<boolean> {
  const { timeout = 30000, retries = 3 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const element = await waitForElementWithFallback(page, selectorConfig, timeout);
      if (!element) {
        log.warn(`Attempt ${attempt}: Element not found for ${selectorConfig.description}`);
        continue;
      }

      await element.click();
      log.debug(`Successfully clicked ${selectorConfig.description} on attempt ${attempt}`);
      return true;
    } catch (error) {
      log.warn(`Attempt ${attempt} failed to click ${selectorConfig.description}:`, error);
      if (attempt < retries) {
        await page.waitForTimeout(1000 * attempt); // Exponential backoff
      }
    }
  }

  log.error(`Failed to click ${selectorConfig.description} after ${retries} attempts`);
  return false;
}

/**
 * Type text with human-like behavior
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param text Text to type
 * @param options Typing options
 * @returns Promise<boolean> Success status
 */
export async function typeWithFallback(
  page: Page,
  selectorConfig: SelectorConfig,
  text: string,
  options: { timeout?: number; delay?: number; clear?: boolean } = {}
): Promise<boolean> {
  const { timeout = 30000, delay = 50, clear = true } = options;
  
  try {
    const element = await waitForElementWithFallback(page, selectorConfig, timeout);
    if (!element) {
      log.error(`Element not found for typing: ${selectorConfig.description}`);
      return false;
    }

    if (clear) {
      await element.clear();
    }
    
    await element.type(text, { delay });
    log.debug(`Successfully typed text into ${selectorConfig.description}`);
    return true;
  } catch (error) {
    log.error(`Failed to type into ${selectorConfig.description}:`, error);
    return false;
  }
}

/**
 * Get text content with fallback selectors
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param timeout Timeout in milliseconds
 * @returns Promise<string | null>
 */
export async function getTextWithFallback(
  page: Page,
  selectorConfig: SelectorConfig,
  timeout: number = 30000
): Promise<string | null> {
  try {
    const element = await waitForElementWithFallback(page, selectorConfig, timeout);
    if (!element) {
      log.warn(`Element not found for text extraction: ${selectorConfig.description}`);
      return null;
    }

    const text = await element.textContent();
    log.debug(`Successfully extracted text from ${selectorConfig.description}: ${text?.substring(0, 50)}...`);
    return text?.trim() || null;
  } catch (error) {
    log.error(`Failed to extract text from ${selectorConfig.description}:`, error);
    return null;
  }
}