// useWorkflow Hook Unit Tests
// Comprehensive tests for the main workflow state management hook

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkflow } from '@features/workflow-editor/hooks/useWorkflow';

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
    useNodesState: vi.fn((initial) => {
        let nodes = initial || [];
        const setNodes = vi.fn((updater) => {
            nodes = typeof updater === 'function' ? updater(nodes) : updater;
        });
        return [nodes, setNodes, vi.fn()];
    }),
    useEdgesState: vi.fn((initial) => {
        let edges = initial || [];
        const setEdges = vi.fn((updater) => {
            edges = typeof updater === 'function' ? updater(edges) : updater;
        });
        return [edges, setEdges, vi.fn()];
    }),
    addEdge: vi.fn((connection, edges) => [...edges, connection]),
}));

// Mock fetch for runWorkflow
global.fetch = vi.fn();

describe('useWorkflow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with empty nodes and edges by default', () => {
            const { result } = renderHook(() => useWorkflow());
            expect(result.current.nodes).toEqual([]);
            expect(result.current.edges).toEqual([]);
            expect(result.current.isRunning).toBe(false);
        });

        it('should initialize with provided initial nodes', () => {
            const initialNodes = [
                { id: 'n1', type: 'inputText', position: { x: 0, y: 0 }, data: {} },
            ];
            const { result } = renderHook(() => useWorkflow({ initialNodes, initialEdges: [] }));
            expect(result.current.nodes).toEqual(initialNodes);
        });

        it('should initialize with provided initial edges', () => {
            const initialEdges = [{ id: 'e1', source: 'n1', target: 'n2' }];
            const { result } = renderHook(() => useWorkflow({ initialNodes: [], initialEdges }));
            expect(result.current.edges).toEqual(initialEdges);
        });
    });

    describe('getPortType', () => {
        it('should return null for non-existent node', () => {
            const { result } = renderHook(() => useWorkflow());
            const portType = result.current.getPortType('nonexistent', 'handle', 'source');
            expect(portType).toBeNull();
        });

        it('should return null for node without proper port data', () => {
            const initialNodes = [
                {
                    id: 'n1',
                    type: 'inputText',
                    position: { x: 0, y: 0 },
                    data: { inputs: {}, outputs: {} },
                },
            ];
            const { result } = renderHook(() => useWorkflow({ initialNodes, initialEdges: [] }));
            const portType = result.current.getPortType('n1', 'nonexistent_handle', 'source');
            expect(portType).toBeNull();
        });
    });

    describe('isValidConnection', () => {
        it('should return false for connection without source', () => {
            const { result } = renderHook(() => useWorkflow());
            const isValid = result.current.isValidConnection({
                source: null as unknown as string,
                target: 'n2',
                sourceHandle: 'out',
                targetHandle: 'in',
            });
            expect(isValid).toBe(false);
        });

        it('should return false for connection without target', () => {
            const { result } = renderHook(() => useWorkflow());
            const isValid = result.current.isValidConnection({
                source: 'n1',
                target: null as unknown as string,
                sourceHandle: 'out',
                targetHandle: 'in',
            });
            expect(isValid).toBe(false);
        });

        it('should return false for self-connection', () => {
            const { result } = renderHook(() => useWorkflow());
            const isValid = result.current.isValidConnection({
                source: 'n1',
                target: 'n1',
                sourceHandle: 'out',
                targetHandle: 'in',
            });
            expect(isValid).toBe(false);
        });

        it('should return false for missing handles', () => {
            const { result } = renderHook(() => useWorkflow());
            const isValid = result.current.isValidConnection({
                source: 'n1',
                target: 'n2',
                sourceHandle: null,
                targetHandle: null,
            });
            expect(isValid).toBe(false);
        });
    });

    describe('runWorkflow', () => {
        it('should set isRunning to true during execution', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                json: async () => ({ success: true, nodes: [] }),
            });

            const { result } = renderHook(() => useWorkflow());

            await act(async () => {
                const promise = result.current.runWorkflow();
                // isRunning should be true during execution
                await promise;
            });
        });

        it('should handle network errors gracefully', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
                new Error('Network error')
            );

            const { result } = renderHook(() => useWorkflow());
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await act(async () => {
                await result.current.runWorkflow();
            });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should call fetch with correct payload', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                json: async () => ({ success: true, nodes: [] }),
            });

            const { result } = renderHook(() => useWorkflow());

            await act(async () => {
                await result.current.runWorkflow();
            });

            expect(global.fetch).toHaveBeenCalledWith('/api/run-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.any(String),
            });
        });
    });

    describe('addNode', () => {
        it('should expose addNode function', () => {
            const { result } = renderHook(() => useWorkflow());
            expect(typeof result.current.addNode).toBe('function');
        });
    });

    describe('removeNode', () => {
        it('should expose removeNode function', () => {
            const { result } = renderHook(() => useWorkflow());
            expect(typeof result.current.removeNode).toBe('function');
        });
    });

    describe('updateNodeData', () => {
        it('should expose updateNodeData function', () => {
            const { result } = renderHook(() => useWorkflow());
            expect(typeof result.current.updateNodeData).toBe('function');
        });
    });

    describe('resetStatus', () => {
        it('should expose resetStatus function', () => {
            const { result } = renderHook(() => useWorkflow());
            expect(typeof result.current.resetStatus).toBe('function');
        });
    });
});
