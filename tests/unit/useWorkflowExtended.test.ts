// Unit Tests - useWorkflow Hook (Extended)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkflow } from '@features/workflow-editor/hooks/useWorkflow';
import type { Node, Edge } from '@xyflow/react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useWorkflow (Extended)', () => {
    const mockNodes: Node[] = [
        {
            id: 'node-1',
            type: 'inputText',
            position: { x: 0, y: 0 },
            data: {
                label: 'Text Input',
                status: 'idle',
                inputs: {},
                outputs: { out_text: { type: 'text' } },
            },
        },
        {
            id: 'node-2',
            type: 'llm',
            position: { x: 200, y: 0 },
            data: {
                label: 'LLM',
                status: 'idle',
                inputs: { in_text: { type: 'text' } },
                outputs: { out_text: { type: 'text' } },
            },
        },
    ];

    const mockEdges: Edge[] = [];

    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('Node Operations Extended', () => {
        it('should add a node with correct position', () => {
            const { result } = renderHook(() => useWorkflow());

            act(() => {
                result.current.addNode('inputText', { x: 150, y: 250 });
            });

            expect(result.current.nodes[0].position).toEqual({ x: 150, y: 250 });
        });

        it('should remove node and associated edges', () => {
            const nodesWithEdge: Edge[] = [
                {
                    id: 'e1',
                    source: 'node-1',
                    target: 'node-2',
                    sourceHandle: 'out_text',
                    targetHandle: 'in_text',
                },
            ];

            const { result } = renderHook(() =>
                useWorkflow({ initialNodes: mockNodes, initialEdges: nodesWithEdge })
            );

            expect(result.current.edges).toHaveLength(1);

            act(() => {
                result.current.removeNode('node-1');
            });

            expect(result.current.edges).toHaveLength(0);
        });

        it('should preserve other nodes when removing one', () => {
            const { result } = renderHook(() => useWorkflow({ initialNodes: mockNodes }));

            act(() => {
                result.current.removeNode('node-1');
            });

            expect(result.current.nodes).toHaveLength(1);
            expect(result.current.nodes[0].id).toBe('node-2');
        });
    });

    describe('Connection Validation Extended', () => {
        it('should reject connection to non-existent node', () => {
            const { result } = renderHook(() => useWorkflow({ initialNodes: mockNodes }));

            const isValid = result.current.isValidConnection({
                source: 'node-1',
                target: 'non-existent',
                sourceHandle: 'out_text',
                targetHandle: 'in_text',
            });

            expect(isValid).toBe(false);
        });

        it('should reject connection from non-existent port', () => {
            const { result } = renderHook(() => useWorkflow({ initialNodes: mockNodes }));

            const isValid = result.current.isValidConnection({
                source: 'node-1',
                target: 'node-2',
                sourceHandle: 'non_existent_port',
                targetHandle: 'in_text',
            });

            expect(isValid).toBe(false);
        });
    });

    describe('Workflow Execution Extended', () => {
        it('should call API with correct payload', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, nodes: [] }),
            });

            const { result } = renderHook(() =>
                useWorkflow({ initialNodes: mockNodes, initialEdges: mockEdges })
            );

            await act(async () => {
                await result.current.runWorkflow();
            });

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/run-workflow',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        it('should merge result nodes with existing nodes', async () => {
            const resultNodes = [
                {
                    id: 'node-1',
                    data: { label: 'Updated', status: 'success' },
                },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, nodes: resultNodes }),
            });

            const { result } = renderHook(() => useWorkflow({ initialNodes: mockNodes }));

            await act(async () => {
                await result.current.runWorkflow();
            });

            const node1 = result.current.nodes.find((n) => n.id === 'node-1');
            expect(node1?.data.status).toBe('success');
        });
    });

    describe('Edge Styling', () => {
        it('should add edge with stroke style', () => {
            const { result } = renderHook(() => useWorkflow({ initialNodes: mockNodes }));

            act(() => {
                result.current.onConnect({
                    source: 'node-1',
                    target: 'node-2',
                    sourceHandle: 'out_text',
                    targetHandle: 'in_text',
                });
            });

            expect(result.current.edges[0].style).toHaveProperty('strokeWidth', 2);
        });
    });
});
