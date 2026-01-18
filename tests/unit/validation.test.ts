// Unit Tests - Validation Utilities
import { describe, it, expect } from 'vitest';
import {
    validateNodeId,
    validateWorkflowName,
    validatePrompt,
    validateUrl,
} from '@/shared/lib/validation';

describe('Validation Utilities', () => {
    describe('validateNodeId', () => {
        it('should accept valid node ID', () => {
            const result = validateNodeId('node-1');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accept ID with underscores', () => {
            const result = validateNodeId('my_node_123');
            expect(result.valid).toBe(true);
        });

        it('should reject empty ID', () => {
            const result = validateNodeId('');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Node ID is required');
        });

        it('should reject ID with special characters', () => {
            const result = validateNodeId('node@#$');
            expect(result.valid).toBe(false);
        });
    });

    describe('validateWorkflowName', () => {
        it('should accept valid name', () => {
            const result = validateWorkflowName('My Workflow');
            expect(result.valid).toBe(true);
        });

        it('should reject empty name', () => {
            const result = validateWorkflowName('');
            expect(result.valid).toBe(false);
        });

        it('should reject name over 100 chars', () => {
            const result = validateWorkflowName('a'.repeat(101));
            expect(result.valid).toBe(false);
        });
    });

    describe('validatePrompt', () => {
        it('should accept valid prompt', () => {
            const result = validatePrompt('Generate an image');
            expect(result.valid).toBe(true);
        });

        it('should reject empty prompt', () => {
            const result = validatePrompt('');
            expect(result.valid).toBe(false);
        });

        it('should reject prompt over 10000 chars', () => {
            const result = validatePrompt('a'.repeat(10001));
            expect(result.valid).toBe(false);
        });
    });

    describe('validateUrl', () => {
        it('should accept valid URL', () => {
            const result = validateUrl('https://example.com');
            expect(result.valid).toBe(true);
        });

        it('should reject invalid URL', () => {
            const result = validateUrl('not-a-url');
            expect(result.valid).toBe(false);
        });

        it('should reject empty URL', () => {
            const result = validateUrl('');
            expect(result.valid).toBe(false);
        });
    });
});
