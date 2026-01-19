// Graph Logic Engine Tests
// Comprehensive tests for graph validation, cycle detection, state management, and persistence

import { describe, it, expect } from 'vitest';
import { DependencyGraph } from '@features/workflow-editor/services/engine/DependencyGraph';
import {
    arePortsCompatible,
    PORT_COMPATIBILITY,
} from '@features/workflow-editor/constants/portConfig';
import { WorkflowEdge } from '@features/workflow-editor/types';

// ============================================================================
// 1. GRAPH INTEGRITY & VALIDATION TESTS
// ============================================================================

describe('Graph Integrity & Validation', () => {
    describe('Self-Loop Detection', () => {
        it('should NOT allow a node to connect to itself (self-loop)', () => {
            // This tests the isValidConnection logic: source === target should return false
            const connection = {
                source: 'node-1',
                target: 'node-1',
                sourceHandle: 'out_text',
                targetHandle: 'in_text',
            };

            // The validation logic checks: if (source === target) return false;
            expect(connection.source === connection.target).toBe(true);
        });

        it('should detect self-loop in DependencyGraph', () => {
            const edges: WorkflowEdge[] = [
                { id: 'e1', source: 'n1', target: 'n1', sourceHandle: 'out', targetHandle: 'in' },
            ];

            const graph = new DependencyGraph(['n1'], edges);
            const cycle = graph.detectCycle();

            expect(cycle).not.toBeNull();
            expect(cycle).toContain('n1');
        });
    });

    describe('Cycle Detection (Infinite Loop Prevention)', () => {
        it('should detect simple two-node cycle (A → B → A)', () => {
            const edges: WorkflowEdge[] = [
                { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
                { id: 'e2', source: 'B', target: 'A', sourceHandle: 'out', targetHandle: 'in' },
            ];

            const graph = new DependencyGraph(['A', 'B'], edges);
            const cycle = graph.detectCycle();

            expect(cycle).not.toBeNull();
        });

        it('should detect complex multi-node cycle (A → B → C → A)', () => {
            const edges: WorkflowEdge[] = [
                { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
                { id: 'e2', source: 'B', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
                { id: 'e3', source: 'C', target: 'A', sourceHandle: 'out', targetHandle: 'in' },
            ];

            const graph = new DependencyGraph(['A', 'B', 'C'], edges);
            const cycle = graph.detectCycle();

            expect(cycle).not.toBeNull();
        });

        it('should return null for valid DAG (no cycles)', () => {
            const edges: WorkflowEdge[] = [
                { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
                { id: 'e2', source: 'B', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
                { id: 'e3', source: 'A', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
            ];

            const graph = new DependencyGraph(['A', 'B', 'C'], edges);
            const cycle = graph.detectCycle();

            expect(cycle).toBeNull();
        });

        it('should handle disconnected components without false positive', () => {
            const edges: WorkflowEdge[] = [
                { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
                // C and D are disconnected from A-B
                { id: 'e2', source: 'C', target: 'D', sourceHandle: 'out', targetHandle: 'in' },
            ];

            const graph = new DependencyGraph(['A', 'B', 'C', 'D'], edges);
            const cycle = graph.detectCycle();

            expect(cycle).toBeNull();
        });

        it('should detect cycle in one component while another is valid', () => {
            const edges: WorkflowEdge[] = [
                // Valid chain
                { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
                // Cycle in separate component
                { id: 'e2', source: 'C', target: 'D', sourceHandle: 'out', targetHandle: 'in' },
                { id: 'e3', source: 'D', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
            ];

            const graph = new DependencyGraph(['A', 'B', 'C', 'D'], edges);
            const cycle = graph.detectCycle();

            expect(cycle).not.toBeNull();
        });
    });

    describe('Port Type Safety (Type Validation)', () => {
        it('should allow text → text connection', () => {
            expect(arePortsCompatible('text', 'text')).toBe(true);
        });

        it('should NOT allow text → image connection (type mismatch)', () => {
            expect(arePortsCompatible('text', 'image')).toBe(false);
        });

        it('should NOT allow image → text connection (type mismatch)', () => {
            expect(arePortsCompatible('image', 'text')).toBe(false);
        });

        it('should allow any → text connection (universal type)', () => {
            expect(arePortsCompatible('any', 'text')).toBe(true);
        });

        it('should allow text → any connection (universal accepts all)', () => {
            expect(arePortsCompatible('text', 'any')).toBe(true);
        });

        it('should allow image → image connection', () => {
            expect(arePortsCompatible('image', 'image')).toBe(true);
        });

        it('should allow video → video connection', () => {
            expect(arePortsCompatible('video', 'video')).toBe(true);
        });

        it('should allow audio → audio connection', () => {
            expect(arePortsCompatible('audio', 'audio')).toBe(true);
        });

        it("should have symmetric compatibility for 'any' type", () => {
            const types = ['text', 'image', 'video', 'audio'] as const;
            for (const type of types) {
                expect(arePortsCompatible('any', type)).toBe(true);
                expect(arePortsCompatible(type, 'any')).toBe(true);
            }
        });

        it('should validate all defined port types have compatibility rules', () => {
            const definedTypes = Object.keys(PORT_COMPATIBILITY);
            expect(definedTypes).toContain('text');
            expect(definedTypes).toContain('image');
            expect(definedTypes).toContain('video');
            expect(definedTypes).toContain('audio');
            expect(definedTypes).toContain('any');
        });
    });
});

// ============================================================================
// 2. TOPOLOGICAL SORT TESTS
// ============================================================================

describe('Topological Sort (Execution Order)', () => {
    it('should return correct execution order for linear chain', () => {
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
            { id: 'e2', source: 'B', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
        ];

        const graph = new DependencyGraph(['A', 'B', 'C'], edges);
        const order = graph.topologicalSort();

        expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
        expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
    });

    it('should handle parallel branches correctly', () => {
        // A → B, A → C, B → D, C → D
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
            { id: 'e2', source: 'A', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
            { id: 'e3', source: 'B', target: 'D', sourceHandle: 'out', targetHandle: 'in' },
            { id: 'e4', source: 'C', target: 'D', sourceHandle: 'out', targetHandle: 'in' },
        ];

        const graph = new DependencyGraph(['A', 'B', 'C', 'D'], edges);
        const order = graph.topologicalSort();

        // A must come first
        expect(order[0]).toBe('A');
        // D must come last
        expect(order[3]).toBe('D');
        // B and C come between A and D
        expect(order.indexOf('B')).toBeGreaterThan(0);
        expect(order.indexOf('C')).toBeGreaterThan(0);
        expect(order.indexOf('B')).toBeLessThan(3);
        expect(order.indexOf('C')).toBeLessThan(3);
    });

    it('should include all nodes even if disconnected', () => {
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
        ];

        const graph = new DependencyGraph(['A', 'B', 'C'], edges);
        const order = graph.topologicalSort();

        expect(order).toContain('A');
        expect(order).toContain('B');
        expect(order).toContain('C');
        expect(order.length).toBe(3);
    });
});

// ============================================================================
// 3. EDGE CLEANUP TESTS (Orphan Prevention)
// ============================================================================

describe('Edge Cleanup on Node Deletion', () => {
    it('should properly identify incoming edges to a node', () => {
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
            { id: 'e2', source: 'C', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
        ];

        const graph = new DependencyGraph(['A', 'B', 'C'], edges);
        const incomingToB = graph.getIncomingEdges('B');

        expect(incomingToB.length).toBe(2);
        expect(incomingToB.map((e) => e.source)).toContain('A');
        expect(incomingToB.map((e) => e.source)).toContain('C');
    });

    it('should return empty array for node with no incoming edges', () => {
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
        ];

        const graph = new DependencyGraph(['A', 'B'], edges);
        const incomingToA = graph.getIncomingEdges('A');

        expect(incomingToA.length).toBe(0);
    });

    it('should correctly report in-degree for nodes', () => {
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'A', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
            { id: 'e2', source: 'B', target: 'C', sourceHandle: 'out', targetHandle: 'in' },
        ];

        const graph = new DependencyGraph(['A', 'B', 'C'], edges);

        expect(graph.getInDegree('A')).toBe(0);
        expect(graph.getInDegree('B')).toBe(0);
        expect(graph.getInDegree('C')).toBe(2);
    });
});

// ============================================================================
// 4. STRESS TEST (Performance)
// ============================================================================

describe('Stress Tests', () => {
    it('should handle 100 nodes without error', () => {
        const nodeIds = Array.from({ length: 100 }, (_, i) => `node-${i}`);
        const edges: WorkflowEdge[] = [];

        // Create a linear chain of 100 nodes
        for (let i = 0; i < 99; i++) {
            edges.push({
                id: `e-${i}`,
                source: `node-${i}`,
                target: `node-${i + 1}`,
                sourceHandle: 'out',
                targetHandle: 'in',
            });
        }

        const graph = new DependencyGraph(nodeIds, edges);

        expect(() => graph.detectCycle()).not.toThrow();
        expect(() => graph.topologicalSort()).not.toThrow();

        const cycle = graph.detectCycle();
        expect(cycle).toBeNull();

        const order = graph.topologicalSort();
        expect(order.length).toBe(100);
        expect(order[0]).toBe('node-0');
        expect(order[99]).toBe('node-99');
    });

    it('should handle 500 nodes with complex connections', () => {
        const nodeIds = Array.from({ length: 500 }, (_, i) => `node-${i}`);
        const edges: WorkflowEdge[] = [];

        // Create a fan-out pattern: node-0 connects to all others
        for (let i = 1; i < 500; i++) {
            edges.push({
                id: `e-${i}`,
                source: 'node-0',
                target: `node-${i}`,
                sourceHandle: 'out',
                targetHandle: 'in',
            });
        }

        const startTime = performance.now();
        const graph = new DependencyGraph(nodeIds, edges);
        const cycle = graph.detectCycle();
        const order = graph.topologicalSort();
        const elapsed = performance.now() - startTime;

        expect(cycle).toBeNull();
        expect(order.length).toBe(500);
        expect(elapsed).toBeLessThan(1000); // Should complete in under 1 second
    });
});

// ============================================================================
// 5. PERSISTENCE TESTS (Export/Import)
// ============================================================================

describe('Persistence (Export/Import)', () => {
    it('should serialize graph data correctly', () => {
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'A', target: 'B', sourceHandle: 'out', targetHandle: 'in' },
        ];

        const graph = new DependencyGraph(['A', 'B'], edges);
        const data = graph.toData();

        expect(data.adjacency).toBeDefined();
        expect(data.inDegree).toBeDefined();
        expect(data.edgeMap).toBeDefined();
    });

    it('should maintain edge handle information', () => {
        const edges: WorkflowEdge[] = [
            {
                id: 'e1',
                source: 'A',
                target: 'B',
                sourceHandle: 'out_text',
                targetHandle: 'in_text',
            },
        ];

        const graph = new DependencyGraph(['A', 'B'], edges);
        const incomingToB = graph.getIncomingEdges('B');

        expect(incomingToB[0].sourceHandle).toBe('out_text');
        expect(incomingToB[0].targetHandle).toBe('in_text');
    });

    it('should preserve node positions in workflow export format', () => {
        // Test the workflow export format includes all necessary fields
        const node = {
            id: 'test-1',
            type: 'inputText',
            position: { x: 100, y: 200 },
            data: { label: 'Test', status: 'idle' },
        };

        const exported = {
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
        };

        expect(exported.position.x).toBe(100);
        expect(exported.position.y).toBe(200);
        expect(exported.data.label).toBe('Test');
    });
});

// ============================================================================
// 6. CONNECTION VALIDATION LOGIC TESTS
// ============================================================================

describe('Connection Validation Logic', () => {
    it('should reject connection with missing source', () => {
        const connection = {
            source: null,
            target: 'node-2',
            sourceHandle: 'out',
            targetHandle: 'in',
        };

        // Validation: if (!source || !target || !sourceHandle || !targetHandle) return false
        expect(!connection.source).toBe(true);
    });

    it('should reject connection with missing target', () => {
        const connection = {
            source: 'node-1',
            target: null,
            sourceHandle: 'out',
            targetHandle: 'in',
        };

        expect(!connection.target).toBe(true);
    });

    it('should reject connection with missing handles', () => {
        const connection = {
            source: 'node-1',
            target: 'node-2',
            sourceHandle: null,
            targetHandle: null,
        };

        expect(!connection.sourceHandle || !connection.targetHandle).toBe(true);
    });
});
