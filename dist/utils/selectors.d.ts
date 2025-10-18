import { Page, Locator } from '@playwright/test';
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
export declare const SELECTORS: {
    readonly LOGIN: {
        readonly EMAIL_INPUT: {
            readonly primary: "input[placeholder*=\"email\" i], input[name*=\"email\" i]";
            readonly fallbacks: readonly ["#usernameField", "input[type=\"email\"]", "input[data-test*=\"email\"]"];
            readonly description: "Email input field";
        };
        readonly PASSWORD_INPUT: {
            readonly primary: "input[placeholder*=\"password\" i], input[name*=\"password\" i]";
            readonly fallbacks: readonly ["#passwordField", "input[type=\"password\"]", "input[data-test*=\"password\"]"];
            readonly description: "Password input field";
        };
        readonly LOGIN_BUTTON: {
            readonly primary: "button:has-text(\"Login\"), input[value*=\"Login\" i]";
            readonly fallbacks: readonly ["button[type=\"submit\"]", ".loginButton", "button[data-test*=\"login\"]"];
            readonly description: "Login submit button";
        };
    };
    readonly PROFILE: {
        readonly EDIT_HEADLINE_BUTTON: {
            readonly primary: "button:has-text(/edit.*headline/i)";
            readonly fallbacks: readonly ["button:has-text(/edit/i)", ".edit-headline", "[data-test*=\"edit-headline\"]", ".resumeHeadline button", ".profile-headline button"];
            readonly description: "Edit headline button";
        };
        readonly HEADLINE_INPUT: {
            readonly primary: "input[placeholder*=\"headline\" i], textarea[placeholder*=\"headline\" i]";
            readonly fallbacks: readonly ["input[data-test*=\"headline\"]", "textarea[data-test*=\"headline\"]", ".headline-input", ".resume-headline input", ".profile-headline input", "input[name*=\"headline\" i]"];
            readonly description: "Resume headline input field";
        };
        readonly SAVE_BUTTON: {
            readonly primary: "button:has-text(/save|update/i)";
            readonly fallbacks: readonly ["button[type=\"submit\"]", ".save-button", ".update-button", "button[data-test*=\"save\"]", "button[data-test*=\"update\"]"];
            readonly description: "Save/Update button";
        };
        readonly SUCCESS_MESSAGE: {
            readonly primary: ":has-text(/updated|saved|success/i)";
            readonly fallbacks: readonly [".success-message", ".notification.success", ".alert-success", "[data-test*=\"success\"]"];
            readonly description: "Success confirmation message";
        };
        readonly CURRENT_HEADLINE: {
            readonly primary: ".resumeHeadline .widgetHead, .profile-headline .text";
            readonly fallbacks: readonly [".headline-text", ".resume-headline-display", "[data-test*=\"headline-display\"]", ".profile-summary .headline"];
            readonly description: "Current headline display text";
        };
    };
    readonly NAVIGATION: {
        readonly PROFILE_LINK: {
            readonly primary: "a[href*=\"/mnjuser/profile\"], a:has-text(/profile/i)";
            readonly fallbacks: readonly [".profile-link", "nav a:has-text(/profile/i)", "[data-test*=\"profile-link\"]"];
            readonly description: "Profile navigation link";
        };
        readonly LOGOUT_LINK: {
            readonly primary: "a:has-text(/logout|sign out/i)";
            readonly fallbacks: readonly [".logout-link", "[data-test*=\"logout\"]", "button:has-text(/logout/i)"];
            readonly description: "Logout link";
        };
    };
    readonly COMMON: {
        readonly LOADING_SPINNER: {
            readonly primary: ".loading, .spinner, [data-loading=\"true\"]";
            readonly fallbacks: readonly [".loader", ".progress", "[aria-label*=\"loading\" i]"];
            readonly description: "Loading spinner or indicator";
        };
        readonly ERROR_MESSAGE: {
            readonly primary: ".error-message, .alert-error, .notification.error";
            readonly fallbacks: readonly [".error", ".alert-danger", "[data-test*=\"error\"]"];
            readonly description: "Error message display";
        };
        readonly MODAL_CLOSE: {
            readonly primary: "button:has-text(/close|×/), .modal-close";
            readonly fallbacks: readonly [".close-button", "[aria-label*=\"close\" i]", ".modal .close"];
            readonly description: "Modal close button";
        };
    };
};
/**
 * Get a locator with fallback strategies
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration with fallbacks
 * @returns Promise<Locator | null>
 */
export declare function getLocatorWithFallback(page: Page, selectorConfig: SelectorConfig): Promise<Locator | null>;
/**
 * Wait for an element to be visible with fallback strategies
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise<Locator | null>
 */
export declare function waitForElementWithFallback(page: Page, selectorConfig: SelectorConfig, timeoutMs?: number): Promise<Locator | null>;
/**
 * Click an element with retry logic and fallback selectors
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param options Click options
 * @returns Promise<boolean> Success status
 */
export declare function clickWithFallback(page: Page, selectorConfig: SelectorConfig, options?: {
    timeout?: number;
    retries?: number;
}): Promise<boolean>;
/**
 * Type text with human-like behavior
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param text Text to type
 * @param options Typing options
 * @returns Promise<boolean> Success status
 */
export declare function typeWithFallback(page: Page, selectorConfig: SelectorConfig, text: string, options?: {
    timeout?: number;
    delay?: number;
    clear?: boolean;
}): Promise<boolean>;
/**
 * Get text content with fallback selectors
 * @param page Playwright page instance
 * @param selectorConfig Selector configuration
 * @param timeout Timeout in milliseconds
 * @returns Promise<string | null>
 */
export declare function getTextWithFallback(page: Page, selectorConfig: SelectorConfig, timeout?: number): Promise<string | null>;
//# sourceMappingURL=selectors.d.ts.map