// Unit Tests - Retry Utility
import { describe, it, expect, vi } from 'vitest';
import { withRetry, isRetryableError } from '@/shared/lib/retry';

describe('Retry Utility', () => {
    it('should return value on first success', async () => {
        const fn = vi.fn().mockResolvedValue('success');
        const result = await withRetry(fn);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
        const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('success');

        const result = await withRetry(fn, { baseDelayMs: 1 });
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('always fail'));

        await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 1 })).rejects.toThrow(
            'always fail'
        );
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should respect shouldRetry option', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('not retryable'));

        await expect(
            withRetry(fn, {
                shouldRetry: () => false,
                baseDelayMs: 1,
            })
        ).rejects.toThrow('not retryable');
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('isRetryableError', () => {
    it('should return true for timeout errors', () => {
        expect(isRetryableError(new Error('Request timeout'))).toBe(true);
    });

    it('should return true for network errors', () => {
        expect(isRetryableError(new Error('Network error'))).toBe(true);
    });

    it('should return false for other errors', () => {
        expect(isRetryableError(new Error('Validation failed'))).toBe(false);
    });

    it('should return false for non-Error', () => {
        expect(isRetryableError('string error')).toBe(false);
    });
});
