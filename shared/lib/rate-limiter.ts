// Rate Limiter Utility
// Simple in-memory rate limiter for API protection

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

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.lastReset > 300000) {
            // 5 minutes
            rateLimitStore.delete(key);
        }
    }
}, 60000);
