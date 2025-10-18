/**
 * Random utility functions for human-like behavior simulation
 */
/**
 * Generate a random integer between min and max (inclusive)
 */
export declare function randomInt(min: number, max: number): number;
/**
 * Generate a random float between min and max
 */
export declare function randomFloat(min: number, max: number): number;
/**
 * Generate a random delay in milliseconds for human-like typing
 * @param minMs Minimum delay in milliseconds (default: 20)
 * @param maxMs Maximum delay in milliseconds (default: 120)
 */
export declare function randomTypingDelay(minMs?: number, maxMs?: number): number;
/**
 * Generate a random delay between actions in milliseconds
 * @param minMs Minimum delay in milliseconds (default: 100)
 * @param maxMs Maximum delay in milliseconds (default: 500)
 */
export declare function randomActionDelay(minMs?: number, maxMs?: number): number;
/**
 * Generate a random delay for the main loop in seconds
 * @param minSeconds Minimum delay in seconds
 * @param maxSeconds Maximum delay in seconds
 */
export declare function randomLoopDelay(minSeconds: number, maxSeconds: number): number;
/**
 * Generate a random delay with some variance around a base value
 * @param baseMs Base delay in milliseconds
 * @param variancePercent Variance as a percentage (0-100)
 */
export declare function randomDelayWithVariance(baseMs: number, variancePercent?: number): number;
/**
 * Sleep for a random amount of time
 * @param minMs Minimum sleep time in milliseconds
 * @param maxMs Maximum sleep time in milliseconds
 */
export declare function randomSleep(minMs: number, maxMs: number): Promise<void>;
/**
 * Sleep for a specific amount of time with some random variance
 * @param baseMs Base sleep time in milliseconds
 * @param variancePercent Variance as a percentage (default: 10%)
 */
export declare function sleepWithVariance(baseMs: number, variancePercent?: number): Promise<void>;
/**
 * Choose a random element from an array
 * @param array Array to choose from
 * @returns Random element from the array
 */
export declare function randomChoice<T>(array: T[]): T;
/**
 * Choose a random element from an array, excluding specific elements
 * @param array Array to choose from
 * @param exclude Elements to exclude
 * @returns Random element from the filtered array
 */
export declare function randomChoiceExcluding<T>(array: T[], exclude: T[]): T | null;
/**
 * Shuffle an array randomly (Fisher-Yates algorithm)
 * @param array Array to shuffle
 * @returns New shuffled array
 */
export declare function shuffleArray<T>(array: T[]): T[];
/**
 * Generate a random boolean with a given probability
 * @param probability Probability of returning true (0-1)
 */
export declare function randomBoolean(probability?: number): boolean;
/**
 * Add random jitter to coordinates for more human-like mouse movements
 * @param x Original x coordinate
 * @param y Original y coordinate
 * @param maxJitter Maximum jitter in pixels (default: 3)
 */
export declare function addCoordinateJitter(x: number, y: number, maxJitter?: number): {
    x: number;
    y: number;
};
/**
 * Generate a timestamp with random seconds for uniqueness
 */
export declare function randomTimestamp(): string;
//# sourceMappingURL=random.d.ts.map