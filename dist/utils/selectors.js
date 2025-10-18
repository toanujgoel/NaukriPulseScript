"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SELECTORS = void 0;
exports.getLocatorWithFallback = getLocatorWithFallback;
exports.waitForElementWithFallback = waitForElementWithFallback;
exports.clickWithFallback = clickWithFallback;
exports.typeWithFallback = typeWithFallback;
exports.getTextWithFallback = getTextWithFallback;
const log_1 = require("./log");
/**
 * Naukri.com selectors with fallback strategies
 */
exports.SELECTORS = {
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
};
/**
 * Get a locator with fallback strategies
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration with fallbacks
 * @returns Promise<Locator | null>
 */
async function getLocatorWithFallback(page, selectorConfig) {
    const { primary, fallbacks, description } = selectorConfig;
    // Try primary selector first
    try {
        const primaryLocator = page.locator(primary);
        if (await primaryLocator.count() > 0) {
            log_1.log.debug(`Found element using primary selector for ${description}: ${primary}`);
            return primaryLocator.first();
        }
    }
    catch (error) {
        log_1.log.debug(`Primary selector failed for ${description}: ${primary}`, error);
    }
    // Try fallback selectors
    for (const fallback of fallbacks) {
        try {
            const fallbackLocator = page.locator(fallback);
            if (await fallbackLocator.count() > 0) {
                log_1.log.debug(`Found element using fallback selector for ${description}: ${fallback}`);
                return fallbackLocator.first();
            }
        }
        catch (error) {
            log_1.log.debug(`Fallback selector failed for ${description}: ${fallback}`, error);
        }
    }
    log_1.log.warn(`No element found for ${description} using any selector`);
    return null;
}
/**
 * Wait for an element to be visible with fallback strategies
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise<Locator | null>
 */
async function waitForElementWithFallback(page, selectorConfig, timeoutMs = 30000) {
    const { primary, fallbacks, description } = selectorConfig;
    // Try primary selector first
    try {
        const primaryLocator = page.locator(primary);
        await primaryLocator.first().waitFor({ state: 'visible', timeout: timeoutMs / (fallbacks.length + 1) });
        log_1.log.debug(`Element visible using primary selector for ${description}: ${primary}`);
        return primaryLocator.first();
    }
    catch (error) {
        log_1.log.debug(`Primary selector timeout for ${description}: ${primary}`);
    }
    // Try fallback selectors
    for (const fallback of fallbacks) {
        try {
            const fallbackLocator = page.locator(fallback);
            await fallbackLocator.first().waitFor({ state: 'visible', timeout: timeoutMs / (fallbacks.length + 1) });
            log_1.log.debug(`Element visible using fallback selector for ${description}: ${fallback}`);
            return fallbackLocator.first();
        }
        catch (error) {
            log_1.log.debug(`Fallback selector timeout for ${description}: ${fallback}`);
        }
    }
    log_1.log.warn(`No visible element found for ${description} within timeout`);
    return null;
}
/**
 * Click an element with retry logic and fallback selectors
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param options Click options
 * @returns Promise<boolean> Success status
 */
async function clickWithFallback(page, selectorConfig, options = {}) {
    const { timeout = 30000, retries = 3 } = options;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const element = await waitForElementWithFallback(page, selectorConfig, timeout);
            if (!element) {
                log_1.log.warn(`Attempt ${attempt}: Element not found for ${selectorConfig.description}`);
                continue;
            }
            await element.click();
            log_1.log.debug(`Successfully clicked ${selectorConfig.description} on attempt ${attempt}`);
            return true;
        }
        catch (error) {
            log_1.log.warn(`Attempt ${attempt} failed to click ${selectorConfig.description}:`, error);
            if (attempt < retries) {
                await page.waitForTimeout(1000 * attempt); // Exponential backoff
            }
        }
    }
    log_1.log.error(`Failed to click ${selectorConfig.description} after ${retries} attempts`);
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
async function typeWithFallback(page, selectorConfig, text, options = {}) {
    const { timeout = 30000, delay = 50, clear = true } = options;
    try {
        const element = await waitForElementWithFallback(page, selectorConfig, timeout);
        if (!element) {
            log_1.log.error(`Element not found for typing: ${selectorConfig.description}`);
            return false;
        }
        if (clear) {
            await element.clear();
        }
        await element.type(text, { delay });
        log_1.log.debug(`Successfully typed text into ${selectorConfig.description}`);
        return true;
    }
    catch (error) {
        log_1.log.error(`Failed to type into ${selectorConfig.description}:`, error);
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
async function getTextWithFallback(page, selectorConfig, timeout = 30000) {
    try {
        const element = await waitForElementWithFallback(page, selectorConfig, timeout);
        if (!element) {
            log_1.log.warn(`Element not found for text extraction: ${selectorConfig.description}`);
            return null;
        }
        const text = await element.textContent();
        log_1.log.debug(`Successfully extracted text from ${selectorConfig.description}: ${text?.substring(0, 50)}...`);
        return text?.trim() || null;
    }
    catch (error) {
        log_1.log.error(`Failed to extract text from ${selectorConfig.description}:`, error);
        return null;
    }
}
//# sourceMappingURL=selectors.js.map