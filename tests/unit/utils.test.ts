// Unit Tests - Utils
import { describe, it, expect, vi } from 'vitest';
import { formatTime, delay, generateId, cn } from '@/shared/lib/utils';

describe('Utils', () => {
    describe('formatTime', () => {
        it('should format 0 seconds as 0:00', () => {
            expect(formatTime(0)).toBe('0:00');
        });

        it('should format 60 seconds as 1:00', () => {
            expect(formatTime(60)).toBe('1:00');
        });

        it('should format 90 seconds as 1:30', () => {
            expect(formatTime(90)).toBe('1:30');
        });

        it('should format 125 seconds as 2:05', () => {
            expect(formatTime(125)).toBe('2:05');
        });

        it('should handle large values', () => {
            expect(formatTime(3661)).toBe('61:01');
        });
    });

    describe('delay', () => {
        it('should return a promise', () => {
            vi.useFakeTimers();
            const result = delay(100);
            expect(result).toBeInstanceOf(Promise);
            vi.useRealTimers();
        });

        it('should resolve after specified time', async () => {
            vi.useFakeTimers();
            const promise = delay(100);
            vi.advanceTimersByTime(100);
            await expect(promise).resolves.toBeUndefined();
            vi.useRealTimers();
        });
    });

    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });

        it('should use default prefix', () => {
            const id = generateId();
            expect(id.startsWith('node-')).toBe(true);
        });

        it('should use custom prefix', () => {
            const id = generateId('edge');
            expect(id.startsWith('edge-')).toBe(true);
        });

        it('should include timestamp', () => {
            const id = generateId();
            expect(id.split('-').length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('cn', () => {
        it('should combine classes', () => {
            expect(cn('a', 'b', 'c')).toBe('a b c');
        });

        it('should filter out falsy values', () => {
            expect(cn('a', null, 'b', undefined, 'c', false)).toBe('a b c');
        });

        it('should return empty string for no classes', () => {
            expect(cn()).toBe('');
        });

        it('should handle single class', () => {
            expect(cn('single')).toBe('single');
        });

        it('should handle conditional classes', () => {
            const isActive = true;
            const isDisabled = false;
            expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
        });
    });
});
