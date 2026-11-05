// ============================================================================
// Anonymous College Confession Platform - Rate Limit Middleware
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

/**
 * In-memory store for rate limiting.
 * Maps IP address (or other identifier) to request count and window reset time.
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Periodically clean up expired entries to prevent memory leaks.
 * Runs every 60 seconds.
 */
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    });
  }, CLEANUP_INTERVAL_MS);

  // Allow the process to exit even if the timer is running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// Start cleanup on module load
startCleanup();

/**
 * Check whether a request from the given IP is within the rate limit.
 *
 * @param ip          - Client IP address or unique identifier
 * @param maxRequests - Maximum allowed requests within the time window
 * @param windowMs    - Time window in milliseconds
 * @returns           - Whether the request is allowed, and optional retry delay
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  // No existing entry or window has expired — start a fresh window
  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true };
  }

  // Within the current window
  if (existing.count < maxRequests) {
    existing.count += 1;
    return { allowed: true };
  }

  // Rate limit exceeded
  const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
  return {
    allowed: false,
    retryAfter,
  };
}

/**
 * Reset the rate limit for a specific IP (useful for testing).
 */
export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Clear all rate limit entries (useful for testing).
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
