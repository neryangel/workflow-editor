// Unit Tests - Logger
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/shared/lib/logger';

describe('Logger', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should have debug method', () => {
        expect(typeof logger.debug).toBe('function');
    });

    it('should have info method', () => {
        expect(typeof logger.info).toBe('function');
    });

    it('should have warn method', () => {
        expect(typeof logger.warn).toBe('function');
    });

    it('should have error method', () => {
        expect(typeof logger.error).toBe('function');
    });

    it('should log info messages', () => {
        logger.info('Test message');
        expect(console.log).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
        logger.warn('Warning message');
        expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
        logger.error('Error message');
        expect(console.error).toHaveBeenCalled();
    });

    it('should accept context object', () => {
        logger.info('Message with context', { userId: '123' });
        expect(console.log).toHaveBeenCalled();
    });
});
