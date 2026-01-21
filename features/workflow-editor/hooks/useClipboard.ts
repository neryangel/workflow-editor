// useClipboard - Hook for managing node clipboard operations

import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

export interface ClipboardData {
    nodes: Node[];
    edges: Edge[];
}

export interface UseClipboardReturn {
    hasClipboard: boolean;
    copyNodes: (nodes: Node[], edges: Edge[]) => void;
    pasteNodes: (offset?: { x: number; y: number }) => ClipboardData | null;
    duplicateNodes: (
        nodes: Node[],
        edges: Edge[],
        offset?: { x: number; y: number }
    ) => ClipboardData | null;
}

const DEFAULT_PASTE_OFFSET = { x: 50, y: 50 };

export function useClipboard(): UseClipboardReturn {
    const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

    // Copy selected nodes and their connecting edges
    const copyNodes = useCallback((nodes: Node[], edges: Edge[]) => {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length === 0) return;

        const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));

        // Find edges that connect selected nodes
        const selectedEdges = edges.filter(
            (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
        );

        setClipboard({
            nodes: JSON.parse(JSON.stringify(selectedNodes)), // Deep clone
            edges: JSON.parse(JSON.stringify(selectedEdges)), // Deep clone
        });
    }, []);

    // Generate unique ID for pasted/duplicated nodes
    const generateUniqueId = (baseId: string) => {
        return `${baseId}-copy-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    };

    // Paste nodes from clipboard
    const pasteNodes = useCallback(
        (offset = DEFAULT_PASTE_OFFSET): ClipboardData | null => {
            if (!clipboard) return null;

            // Create ID mapping for edges
            const idMap = new Map<string, string>();

            // Clone nodes with new IDs and offset positions
            const newNodes = clipboard.nodes.map((node) => {
                const newId = generateUniqueId(node.id);
                idMap.set(node.id, newId);

                return {
                    ...node,
                    id: newId,
                    position: {
                        x: node.position.x + offset.x,
                        y: node.position.y + offset.y,
                    },
                    selected: true, // Select pasted nodes
                    data: {
                        ...node.data,
                        status: 'idle', // Reset status
                        error: undefined,
                        result: undefined,
                    },
                };
            });

            // Clone edges with updated node IDs
            const newEdges = clipboard.edges
                .map((edge) => {
                    const newSourceId = idMap.get(edge.source);
                    const newTargetId = idMap.get(edge.target);

                    if (!newSourceId || !newTargetId) return null;

                    return {
                        ...edge,
                        id: `${newSourceId}-${edge.sourceHandle}-${newTargetId}-${edge.targetHandle}`,
                        source: newSourceId,
                        target: newTargetId,
                        selected: true,
                    } as Edge;
                })
                .filter((edge): edge is Edge => edge !== null);

            return {
                nodes: newNodes,
                edges: newEdges,
            };
        },
        [clipboard]
    );

    // Duplicate selected nodes without clipboard dependency
    const duplicateNodes = useCallback(
        (nodes: Node[], edges: Edge[], offset = DEFAULT_PASTE_OFFSET): ClipboardData | null => {
            const selectedNodes = nodes.filter((node) => node.selected);
            if (selectedNodes.length === 0) return null;

            const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));
            const selectedEdges = edges.filter(
                (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
            );

            // Create ID mapping for new nodes
            const idMap = new Map<string, string>();

            // Clone nodes with new IDs and offset positions
            const newNodes = selectedNodes.map((node) => {
                const newId = generateUniqueId(node.id);
                idMap.set(node.id, newId);

                return {
                    ...node,
                    id: newId,
                    position: {
                        x: node.position.x + offset.x,
                        y: node.position.y + offset.y,
                    },
                    selected: true,
                    data: {
                        ...node.data,
                        status: 'idle',
                        error: undefined,
                        result: undefined,
                    },
                };
            });

            // Clone edges with updated node IDs
            const newEdges = selectedEdges
                .map((edge) => {
                    const newSourceId = idMap.get(edge.source);
                    const newTargetId = idMap.get(edge.target);

                    if (!newSourceId || !newTargetId) return null;

                    return {
                        ...edge,
                        id: `${newSourceId}-${edge.sourceHandle || 'out'}-${newTargetId}-${edge.targetHandle || 'in'}`,
                        source: newSourceId,
                        target: newTargetId,
                        selected: true,
                    } as Edge;
                })
                .filter((edge): edge is Edge => edge !== null);

            return {
                nodes: newNodes,
                edges: newEdges,
            };
        },
        []
    );

    return {
        hasClipboard: clipboard !== null,
        copyNodes,
        pasteNodes,
        duplicateNodes,
    };
}
