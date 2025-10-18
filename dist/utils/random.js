"use strict";
/**
 * Random utility functions for human-like behavior simulation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInt = randomInt;
exports.randomFloat = randomFloat;
exports.randomTypingDelay = randomTypingDelay;
exports.randomActionDelay = randomActionDelay;
exports.randomLoopDelay = randomLoopDelay;
exports.randomDelayWithVariance = randomDelayWithVariance;
exports.randomSleep = randomSleep;
exports.sleepWithVariance = sleepWithVariance;
exports.randomChoice = randomChoice;
exports.randomChoiceExcluding = randomChoiceExcluding;
exports.shuffleArray = shuffleArray;
exports.randomBoolean = randomBoolean;
exports.addCoordinateJitter = addCoordinateJitter;
exports.randomTimestamp = randomTimestamp;
/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Generate a random float between min and max
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Generate a random delay in milliseconds for human-like typing
 * @param minMs Minimum delay in milliseconds (default: 20)
 * @param maxMs Maximum delay in milliseconds (default: 120)
 */
function randomTypingDelay(minMs = 20, maxMs = 120) {
    return randomInt(minMs, maxMs);
}
/**
 * Generate a random delay between actions in milliseconds
 * @param minMs Minimum delay in milliseconds (default: 100)
 * @param maxMs Maximum delay in milliseconds (default: 500)
 */
function randomActionDelay(minMs = 100, maxMs = 500) {
    return randomInt(minMs, maxMs);
}
/**
 * Generate a random delay for the main loop in seconds
 * @param minSeconds Minimum delay in seconds
 * @param maxSeconds Maximum delay in seconds
 */
function randomLoopDelay(minSeconds, maxSeconds) {
    return randomInt(minSeconds, maxSeconds);
}
/**
 * Generate a random delay with some variance around a base value
 * @param baseMs Base delay in milliseconds
 * @param variancePercent Variance as a percentage (0-100)
 */
function randomDelayWithVariance(baseMs, variancePercent = 20) {
    const variance = baseMs * (variancePercent / 100);
    const minDelay = baseMs - variance;
    const maxDelay = baseMs + variance;
    return randomFloat(minDelay, maxDelay);
}
/**
 * Sleep for a random amount of time
 * @param minMs Minimum sleep time in milliseconds
 * @param maxMs Maximum sleep time in milliseconds
 */
async function randomSleep(minMs, maxMs) {
    const delay = randomInt(minMs, maxMs);
    return new Promise(resolve => setTimeout(resolve, delay));
}
/**
 * Sleep for a specific amount of time with some random variance
 * @param baseMs Base sleep time in milliseconds
 * @param variancePercent Variance as a percentage (default: 10%)
 */
async function sleepWithVariance(baseMs, variancePercent = 10) {
    const delay = randomDelayWithVariance(baseMs, variancePercent);
    return new Promise(resolve => setTimeout(resolve, delay));
}
/**
 * Choose a random element from an array
 * @param array Array to choose from
 * @returns Random element from the array
 */
function randomChoice(array) {
    if (array.length === 0) {
        throw new Error('Cannot choose from empty array');
    }
    const index = randomInt(0, array.length - 1);
    // Safe assertion since we've validated array length and index bounds
    return array[index];
}
/**
 * Choose a random element from an array, excluding specific elements
 * @param array Array to choose from
 * @param exclude Elements to exclude
 * @returns Random element from the filtered array
 */
function randomChoiceExcluding(array, exclude) {
    const filtered = array.filter(item => !exclude.includes(item));
    if (filtered.length === 0) {
        return null;
    }
    return randomChoice(filtered);
}
/**
 * Shuffle an array randomly (Fisher-Yates algorithm)
 * @param array Array to shuffle
 * @returns New shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        // Safe assertions since we're working within array bounds
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
/**
 * Generate a random boolean with a given probability
 * @param probability Probability of returning true (0-1)
 */
function randomBoolean(probability = 0.5) {
    return Math.random() < probability;
}
/**
 * Add random jitter to coordinates for more human-like mouse movements
 * @param x Original x coordinate
 * @param y Original y coordinate
 * @param maxJitter Maximum jitter in pixels (default: 3)
 */
function addCoordinateJitter(x, y, maxJitter = 3) {
    return {
        x: x + randomFloat(-maxJitter, maxJitter),
        y: y + randomFloat(-maxJitter, maxJitter)
    };
}
/**
 * Generate a timestamp with random seconds for uniqueness
 */
function randomTimestamp() {
    const now = new Date();
    const randomSeconds = randomInt(0, 59);
    now.setSeconds(randomSeconds);
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}
//# sourceMappingURL=random.js.map