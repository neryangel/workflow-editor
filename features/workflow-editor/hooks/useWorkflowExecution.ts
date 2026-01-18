'use client';

import { useCallback, useRef, useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNode, WorkflowEdge } from '../types';

export interface UseWorkflowExecutionOptions {
    onExecutionStart?: () => void;
    onExecutionEnd?: (success: boolean) => void;
}

export interface UseWorkflowExecutionReturn {
    isRunning: boolean;
    executeWorkflow: (nodes: Node[], edges: Edge[]) => Promise<Node[] | null>;
    cancelExecution: () => void;
}

/**
 * Hook for executing workflows with proper cancellation support
 * Prevents race conditions by tracking current execution
 */
export function useWorkflowExecution(
    options: UseWorkflowExecutionOptions = {}
): UseWorkflowExecutionReturn {
    const { onExecutionStart, onExecutionEnd } = options;
    const [isRunning, setIsRunning] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const executionIdRef = useRef<number>(0);

    const cancelExecution = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const executeWorkflow = useCallback(
        async (nodes: Node[], edges: Edge[]): Promise<Node[] | null> => {
            // Cancel any previous execution
            cancelExecution();

            // Create new abort controller for this execution
            abortControllerRef.current = new AbortController();
            const currentExecutionId = ++executionIdRef.current;

            setIsRunning(true);
            onExecutionStart?.();

            try {
                const response = await fetch('/api/run-workflow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: abortControllerRef.current.signal,
                    body: JSON.stringify({
                        nodes: nodes.map((n) => ({
                            id: n.id,
                            type: n.type,
                            position: n.position,
                            data: n.data,
                        })),
                        edges: edges.map((e) => ({
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            sourceHandle: e.sourceHandle,
                            targetHandle: e.targetHandle,
                        })),
                    }),
                });

                // Check if this execution is still the current one
                if (currentExecutionId !== executionIdRef.current) {
                    return null; // Execution was superseded
                }

                const result = await response.json();

                if (result.success && result.nodes) {
                    onExecutionEnd?.(true);
                    return result.nodes;
                } else {
                    onExecutionEnd?.(false);
                    throw new Error(result.error || 'Workflow execution failed');
                }
            } catch (error) {
                // Ignore abort errors
                if (error instanceof Error && error.name === 'AbortError') {
                    return null;
                }
                onExecutionEnd?.(false);
                throw error;
            } finally {
                // Only update state if this is still the current execution
                if (currentExecutionId === executionIdRef.current) {
                    setIsRunning(false);
                    abortControllerRef.current = null;
                }
            }
        },
        [cancelExecution, onExecutionStart, onExecutionEnd]
    );

    return {
        isRunning,
        executeWorkflow,
        cancelExecution,
    };
}
