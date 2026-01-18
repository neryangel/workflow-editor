// Rate Limiter Utility
// Simple in-memory rate limiter for API protection with proper cleanup

interface RateLimitEntry {
    count: number;
    lastReset: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number; // Time until reset in ms
}

/**
 * Check if a request is allowed based on rate limiting
 * @param identifier - Unique identifier for the rate limit bucket (e.g., IP, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now - entry.lastReset >= config.windowMs) {
        // New window
        rateLimitStore.set(identifier, { count: 1, lastReset: now });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        };
    }

    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: config.windowMs - (now - entry.lastReset),
        };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetIn: config.windowMs - (now - entry.lastReset),
    };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual reset scenarios
 */
export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier);
}

/**
 * Clear all rate limit entries
 * Useful for testing or graceful shutdown
 */
export function clearAllRateLimits(): void {
    rateLimitStore.clear();
}

/**
 * Get current store size for monitoring
 */
export function getRateLimitStoreSize(): number {
    return rateLimitStore.size;
}

// Cleanup interval reference for proper cleanup
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the cleanup interval for old entries
 * Called automatically on first use, can be stopped with stopCleanup()
 */
export function startCleanup(intervalMs: number = 60000): void {
    if (cleanupInterval) return; // Already running

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        const staleThreshold = 300000; // 5 minutes

        for (const [key, entry] of rateLimitStore.entries()) {
            if (now - entry.lastReset > staleThreshold) {
                rateLimitStore.delete(key);
            }
        }
    }, intervalMs);

    // Prevent interval from keeping Node.js process alive
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}

/**
 * Stop the cleanup interval
 * Should be called during graceful shutdown or in tests
 */
export function stopCleanup(): void {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}

// Auto-start cleanup on module load (with unref to not block process exit)
startCleanup();
