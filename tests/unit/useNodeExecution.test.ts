// useNodeExecution Hook Unit Tests
// Tests for individual node execution handling

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNodeExecution } from '@features/workflow-editor/hooks/useNodeExecution';

describe('useNodeExecution', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with isExecuting as null', () => {
            const { result } = renderHook(() => useNodeExecution());
            expect(result.current.isExecuting).toBeNull();
        });

        it('should return executeNode function', () => {
            const { result } = renderHook(() => useNodeExecution());
            expect(typeof result.current.executeNode).toBe('function');
        });
    });

    describe('executeNode', () => {
        it('should set isExecuting to nodeId during execution', async () => {
            vi.useRealTimers(); // Use real timers for async test
            const { result } = renderHook(() => useNodeExecution());

            let executionPromise: Promise<Record<string, unknown>>;
            act(() => {
                executionPromise = result.current.executeNode('node1', 'llm', {});
            });

            // During execution, isExecuting should be set
            expect(result.current.isExecuting).toBe('node1');

            await act(async () => {
                await executionPromise;
            });

            // After execution, isExecuting should be null
            expect(result.current.isExecuting).toBeNull();
        });

        it('should call onStatusChange with running status', async () => {
            vi.useRealTimers();
            const onStatusChange = vi.fn();
            const { result } = renderHook(() => useNodeExecution({ onStatusChange }));

            await act(async () => {
                await result.current.executeNode('node1', 'llm', {});
            });

            expect(onStatusChange).toHaveBeenCalledWith('node1', 'running');
        });

        it('should call onStatusChange with success status on completion', async () => {
            vi.useRealTimers();
            const onStatusChange = vi.fn();
            const { result } = renderHook(() => useNodeExecution({ onStatusChange }));

            await act(async () => {
                await result.current.executeNode('node1', 'inputText', {});
            });

            expect(onStatusChange).toHaveBeenCalledWith('node1', 'success');
        });
    });

    describe('LLM node execution', () => {
        it('should return enhanced text with system prompt', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            let outputs: Record<string, unknown> = {};
            await act(async () => {
                outputs = await result.current.executeNode('node1', 'llm', {
                    in_system: 'Be helpful',
                    in_text: 'Hello',
                });
            });

            expect(outputs.out_text).toBe('[Enhanced] Hello');
        });

        it('should return processed text without system prompt', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            let outputs: Record<string, unknown> = {};
            await act(async () => {
                outputs = await result.current.executeNode('node1', 'llm', {
                    in_text: 'Hello',
                });
            });

            expect(outputs.out_text).toBe('[Processed] Hello');
        });
    });

    describe('ImageGen node execution', () => {
        it('should return image URL based on prompt', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            let outputs: Record<string, unknown> = {};
            await act(async () => {
                outputs = await result.current.executeNode('node1', 'imageGen', {
                    in_text: 'A beautiful sunset',
                });
            });

            expect(outputs.out_image).toContain('https://picsum.photos/seed/');
            expect(outputs.out_image).toContain('/400/300');
        });

        it('should use default seed for empty prompt', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            let outputs: Record<string, unknown> = {};
            await act(async () => {
                outputs = await result.current.executeNode('node1', 'imageGen', {});
            });

            expect(outputs.out_image).toContain('default');
        });
    });

    describe('VideoGen node execution', () => {
        it('should return video URL', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            let outputs: Record<string, unknown> = {};
            await act(async () => {
                outputs = await result.current.executeNode('node1', 'videoGen', {});
            });

            expect(outputs.out_video).toContain('mp4');
        });
    });

    describe('ExtractFrame node execution', () => {
        it('should return frame image URL', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            let outputs: Record<string, unknown> = {};
            await act(async () => {
                outputs = await result.current.executeNode('node1', 'extractFrame', {});
            });

            expect(outputs.out_image).toContain('picsum.photos');
        });
    });

    describe('Default/Input node execution', () => {
        it('should return empty outputs for input nodes', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            let outputs: Record<string, unknown> = {};
            await act(async () => {
                outputs = await result.current.executeNode('node1', 'inputText', {});
            });

            expect(outputs).toEqual({});
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined inputs gracefully', async () => {
            vi.useRealTimers();
            const { result } = renderHook(() => useNodeExecution());

            await expect(
                act(async () => {
                    await result.current.executeNode('node1', 'llm', {
                        in_text: undefined as unknown as string,
                    });
                })
            ).resolves.not.toThrow();
        });
    });
});
