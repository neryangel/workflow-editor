// Unit Tests - Security Utilities
import { describe, it, expect } from 'vitest';
import {
    sanitizeHtml,
    generateSecureId,
    detectInjection,
    maskSensitiveData,
} from '@/shared/lib/security';

describe('Security Utilities', () => {
    describe('sanitizeHtml', () => {
        it('should escape HTML tags', () => {
            expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
            );
        });

        it('should escape ampersands', () => {
            expect(sanitizeHtml('A & B')).toBe('A &amp; B');
        });

        it('should not modify safe strings', () => {
            expect(sanitizeHtml('Hello World')).toBe('Hello World');
        });
    });

    describe('generateSecureId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateSecureId();
            const id2 = generateSecureId();
            expect(id1).not.toBe(id2);
        });

        it('should include prefix', () => {
            const id = generateSecureId('node-');
            expect(id.startsWith('node-')).toBe(true);
        });

        it('should have expected format', () => {
            const id = generateSecureId();
            expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
        });
    });

    describe('detectInjection', () => {
        it('should detect script tags', () => {
            expect(detectInjection('<script>alert(1)</script>')).toBe(true);
        });

        it('should detect javascript: URLs', () => {
            expect(detectInjection('javascript:alert(1)')).toBe(true);
        });

        it('should detect event handlers', () => {
            expect(detectInjection('onclick=alert(1)')).toBe(true);
        });

        it('should not flag safe input', () => {
            expect(detectInjection('Hello World')).toBe(false);
        });
    });

    describe('maskSensitiveData', () => {
        it('should mask most of the string', () => {
            expect(maskSensitiveData('my-secret-api-key')).toBe('my-s*************');
        });

        it('should mask short strings completely', () => {
            expect(maskSensitiveData('abc')).toBe('***');
        });

        it('should respect visibleChars parameter', () => {
            expect(maskSensitiveData('abcdefgh', 2)).toBe('ab******');
        });
    });
});
