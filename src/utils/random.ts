/**
 * Random utility functions for human-like behavior simulation
 */

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random delay in milliseconds for human-like typing
 * @param minMs Minimum delay in milliseconds (default: 20)
 * @param maxMs Maximum delay in milliseconds (default: 120)
 */
export function randomTypingDelay(minMs: number = 20, maxMs: number = 120): number {
  return randomInt(minMs, maxMs);
}

/**
 * Generate a random delay between actions in milliseconds
 * @param minMs Minimum delay in milliseconds (default: 100)
 * @param maxMs Maximum delay in milliseconds (default: 500)
 */
export function randomActionDelay(minMs: number = 100, maxMs: number = 500): number {
  return randomInt(minMs, maxMs);
}

/**
 * Generate a random delay for the main loop in seconds
 * @param minSeconds Minimum delay in seconds
 * @param maxSeconds Maximum delay in seconds
 */
export function randomLoopDelay(minSeconds: number, maxSeconds: number): number {
  return randomInt(minSeconds, maxSeconds);
}

/**
 * Generate a random delay with some variance around a base value
 * @param baseMs Base delay in milliseconds
 * @param variancePercent Variance as a percentage (0-100)
 */
export function randomDelayWithVariance(baseMs: number, variancePercent: number = 20): number {
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
export async function randomSleep(minMs: number, maxMs: number): Promise<void> {
  const delay = randomInt(minMs, maxMs);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Sleep for a specific amount of time with some random variance
 * @param baseMs Base sleep time in milliseconds
 * @param variancePercent Variance as a percentage (default: 10%)
 */
export async function sleepWithVariance(baseMs: number, variancePercent: number = 10): Promise<void> {
  const delay = randomDelayWithVariance(baseMs, variancePercent);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Choose a random element from an array
 * @param array Array to choose from
 * @returns Random element from the array
 */
export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot choose from empty array');
  }
  const index = randomInt(0, array.length - 1);
  return array[index];
}

/**
 * Choose a random element from an array, excluding specific elements
 * @param array Array to choose from
 * @param exclude Elements to exclude
 * @returns Random element from the filtered array
 */
export function randomChoiceExcluding<T>(array: T[], exclude: T[]): T | null {
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
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a random boolean with a given probability
 * @param probability Probability of returning true (0-1)
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Add random jitter to coordinates for more human-like mouse movements
 * @param x Original x coordinate
 * @param y Original y coordinate
 * @param maxJitter Maximum jitter in pixels (default: 3)
 */
export function addCoordinateJitter(x: number, y: number, maxJitter: number = 3): { x: number; y: number } {
  return {
    x: x + randomFloat(-maxJitter, maxJitter),
    y: y + randomFloat(-maxJitter, maxJitter)
  };
}

/**
 * Generate a timestamp with random seconds for uniqueness
 */
export function randomTimestamp(): string {
  const now = new Date();
  const randomSeconds = randomInt(0, 59);
  now.setSeconds(randomSeconds);
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}