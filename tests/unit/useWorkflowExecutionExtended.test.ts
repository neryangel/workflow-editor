// Unit Tests - useWorkflowExecution Hook (Extended)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkflowExecution } from '@features/workflow-editor/hooks/useWorkflowExecution';
import type { Node, Edge } from '@xyflow/react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useWorkflowExecution (Extended)', () => {
    const mockNodes: Node[] = [
        { id: 'node-1', type: 'inputText', position: { x: 0, y: 0 }, data: { label: 'Input' } },
        { id: 'node-2', type: 'llm', position: { x: 100, y: 0 }, data: { label: 'LLM' } },
    ];

    const mockEdges: Edge[] = [
        {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            sourceHandle: 'out',
            targetHandle: 'in',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Execution Flow', () => {
        it('should set isRunning to true during execution', async () => {
            mockFetch.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () =>
                                resolve({
                                    ok: true,
                                    json: async () => ({ success: true, nodes: mockNodes }),
                                }),
                            50
                        )
                    )
            );

            const { result } = renderHook(() => useWorkflowExecution());

            act(() => {
                result.current.executeWorkflow(mockNodes, mockEdges);
            });

            expect(result.current.isRunning).toBe(true);

            await waitFor(() => {
                expect(result.current.isRunning).toBe(false);
            });
        });

        it('should return nodes on successful execution', async () => {
            const successfulNodes = [{ id: 'result-1', data: { output: 'success' } }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, nodes: successfulNodes }),
            });

            const { result } = renderHook(() => useWorkflowExecution());

            let resultNodes: Node[] | null = null;
            await act(async () => {
                resultNodes = await result.current.executeWorkflow(mockNodes, mockEdges);
            });

            expect(resultNodes).toEqual(successfulNodes);
        });

        it('should call onExecutionStart and onExecutionEnd callbacks', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, nodes: [] }),
            });

            const onExecutionStart = vi.fn();
            const onExecutionEnd = vi.fn();
            const { result } = renderHook(() =>
                useWorkflowExecution({ onExecutionStart, onExecutionEnd })
            );

            await act(async () => {
                await result.current.executeWorkflow(mockNodes, mockEdges);
            });

            expect(onExecutionStart).toHaveBeenCalledTimes(1);
            expect(onExecutionEnd).toHaveBeenCalledWith(true);
        });
    });

    describe('Error Handling', () => {
        it('should throw error on API failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: false, error: 'Execution failed' }),
            });

            const { result } = renderHook(() => useWorkflowExecution());

            await expect(
                act(async () => {
                    await result.current.executeWorkflow(mockNodes, mockEdges);
                })
            ).rejects.toThrow('Execution failed');
        });

        it('should call onExecutionEnd with false on failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: false, error: 'Failed' }),
            });

            const onExecutionEnd = vi.fn();
            const { result } = renderHook(() => useWorkflowExecution({ onExecutionEnd }));

            try {
                await act(async () => {
                    await result.current.executeWorkflow(mockNodes, mockEdges);
                });
            } catch {
                // Expected
            }

            expect(onExecutionEnd).toHaveBeenCalledWith(false);
        });

        it('should return null when execution is aborted', async () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            mockFetch.mockRejectedValueOnce(abortError);

            const { result } = renderHook(() => useWorkflowExecution());

            let resultNodes: Node[] | null = null;
            await act(async () => {
                resultNodes = await result.current.executeWorkflow(mockNodes, mockEdges);
            });

            expect(resultNodes).toBeNull();
        });
    });

    describe('Request Format', () => {
        it('should send correctly formatted request body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, nodes: [] }),
            });

            const { result } = renderHook(() => useWorkflowExecution());

            await act(async () => {
                await result.current.executeWorkflow(mockNodes, mockEdges);
            });

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/run-workflow',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            const callArgs = mockFetch.mock.calls[0];
            const body = JSON.parse(callArgs[1].body);

            expect(body.nodes).toHaveLength(2);
            expect(body.edges).toHaveLength(1);
        });
    });
});
