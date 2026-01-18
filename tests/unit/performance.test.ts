// Unit Tests - Performance Metrics
import { describe, it, expect, beforeEach } from 'vitest';
import {
    measureAsync,
    measureSync,
    getMetrics,
    getAverageMetric,
    clearMetrics,
} from '@/shared/lib/performance';

describe('Performance Metrics', () => {
    beforeEach(() => {
        clearMetrics();
    });

    it('should measure sync function duration', () => {
        const result = measureSync('test-sync', () => {
            let sum = 0;
            for (let i = 0; i < 1000; i++) sum += i;
            return sum;
        });

        expect(result).toBe(499500);
        const metrics = getMetrics();
        expect(metrics).toHaveLength(1);
        expect(metrics[0].name).toBe('test-sync');
        expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should measure async function duration', async () => {
        const result = await measureAsync('test-async', async () => {
            await new Promise((r) => setTimeout(r, 10));
            return 'done';
        });

        expect(result).toBe('done');
        const metrics = getMetrics();
        expect(metrics).toHaveLength(1);
        expect(metrics[0].name).toBe('test-async');
        expect(metrics[0].duration).toBeGreaterThanOrEqual(10);
    });

    it('should track errors with :error suffix', () => {
        expect(() =>
            measureSync('test-error', () => {
                throw new Error('Test error');
            })
        ).toThrow('Test error');

        const metrics = getMetrics();
        expect(metrics).toHaveLength(1);
        expect(metrics[0].name).toBe('test-error:error');
    });

    it('should calculate average metric', () => {
        measureSync('average-test', () => 1);
        measureSync('average-test', () => 2);
        measureSync('average-test', () => 3);

        const avg = getAverageMetric('average-test');
        expect(avg).not.toBeNull();
        expect(avg).toBeGreaterThanOrEqual(0);
    });

    it('should return null for unknown metric', () => {
        const avg = getAverageMetric('unknown');
        expect(avg).toBeNull();
    });

    it('should clear metrics', () => {
        measureSync('clear-test', () => 1);
        expect(getMetrics()).toHaveLength(1);

        clearMetrics();
        expect(getMetrics()).toHaveLength(0);
    });
});
