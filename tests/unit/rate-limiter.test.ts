// Unit Tests - Rate Limiter
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit } from '@/shared/lib/rate-limiter';

describe('Rate Limiter', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should allow first request', () => {
        const result = checkRateLimit('test-user-1', { windowMs: 1000, maxRequests: 5 });
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
    });

    it('should track request count', () => {
        const config = { windowMs: 1000, maxRequests: 3 };

        const r1 = checkRateLimit('test-user-2', config);
        const r2 = checkRateLimit('test-user-2', config);
        const r3 = checkRateLimit('test-user-2', config);

        expect(r1.remaining).toBe(2);
        expect(r2.remaining).toBe(1);
        expect(r3.remaining).toBe(0);
    });

    it('should block when limit exceeded', () => {
        const config = { windowMs: 1000, maxRequests: 2 };

        checkRateLimit('test-user-3', config);
        checkRateLimit('test-user-3', config);
        const blocked = checkRateLimit('test-user-3', config);

        expect(blocked.allowed).toBe(false);
        expect(blocked.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
        const config = { windowMs: 1000, maxRequests: 2 };

        checkRateLimit('test-user-4', config);
        checkRateLimit('test-user-4', config);

        // Advance time past window
        vi.advanceTimersByTime(1001);

        const result = checkRateLimit('test-user-4', config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);
    });

    it('should track different users separately', () => {
        const config = { windowMs: 1000, maxRequests: 1 };

        const userA = checkRateLimit('user-a', config);
        const userB = checkRateLimit('user-b', config);

        expect(userA.allowed).toBe(true);
        expect(userB.allowed).toBe(true);
    });
});
