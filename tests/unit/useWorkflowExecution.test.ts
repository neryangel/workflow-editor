// useWorkflowExecution Hook Unit Tests
// Tests for workflow execution with AbortController and race condition prevention

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWorkflowExecution } from '@features/workflow-editor/hooks/useWorkflowExecution';

// Mock fetch
global.fetch = vi.fn();

describe('useWorkflowExecution', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with isRunning as false', () => {
            const { result } = renderHook(() => useWorkflowExecution());
            expect(result.current.isRunning).toBe(false);
        });

        it('should return executeWorkflow function', () => {
            const { result } = renderHook(() => useWorkflowExecution());
            expect(typeof result.current.executeWorkflow).toBe('function');
        });

        it('should return cancelExecution function', () => {
            const { result } = renderHook(() => useWorkflowExecution());
            expect(typeof result.current.cancelExecution).toBe('function');
        });
    });

    describe('cancelExecution', () => {
        it('should not throw when called without active execution', () => {
            const { result } = renderHook(() => useWorkflowExecution());

            expect(() => {
                result.current.cancelExecution();
            }).not.toThrow();
        });
    });

    describe('options', () => {
        it('should accept onExecutionStart callback', () => {
            const onExecutionStart = vi.fn();
            const { result } = renderHook(() => useWorkflowExecution({ onExecutionStart }));
            expect(result.current).toBeDefined();
        });

        it('should accept onExecutionEnd callback', () => {
            const onExecutionEnd = vi.fn();
            const { result } = renderHook(() => useWorkflowExecution({ onExecutionEnd }));
            expect(result.current).toBeDefined();
        });

        it('should accept both callbacks', () => {
            const onExecutionStart = vi.fn();
            const onExecutionEnd = vi.fn();
            const { result } = renderHook(() =>
                useWorkflowExecution({ onExecutionStart, onExecutionEnd })
            );
            expect(result.current).toBeDefined();
        });
    });
});
