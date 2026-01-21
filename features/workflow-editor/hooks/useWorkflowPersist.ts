// useWorkflowPersist - Hook for saving and loading workflows

import { useState, useCallback, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNode, WorkflowEdge } from '../types';

const STORAGE_KEY = 'workflow-editor-workflows';
const CURRENT_WORKFLOW_KEY = 'workflow-editor-current';

export interface SavedWorkflow {
    id: string;
    name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    createdAt: string;
    updatedAt: string;
}

export interface UseWorkflowPersistReturn {
    // Current workflow
    currentWorkflowId: string | null;
    workflowName: string;
    setWorkflowName: (name: string) => void;

    // Persistence actions
    saveWorkflow: (nodes: Node[], edges: Edge[]) => string;
    loadWorkflow: (id: string) => { nodes: Node[]; edges: Edge[] } | null;
    deleteWorkflow: (id: string) => void;

    // List
    savedWorkflows: SavedWorkflow[];

    // Auto-save
    enableAutoSave: boolean;
    setEnableAutoSave: (enabled: boolean) => void;

    // Export/Import
    exportWorkflow: (nodes: Node[], edges: Edge[]) => string;
    importWorkflow: (json: string) => { nodes: Node[]; edges: Edge[] } | null;

    // New workflow
    createNewWorkflow: () => void;
}

function generateId(): string {
    return `wf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function getStoredWorkflows(): SavedWorkflow[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function setStoredWorkflows(workflows: SavedWorkflow[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function useWorkflowPersist(): UseWorkflowPersistReturn {
    // Initialize from localStorage synchronously to avoid the setState-in-effect issue
    const initialData = useMemo(() => {
        if (typeof window === 'undefined') {
            return { workflows: [], currentId: null, name: 'Untitled Workflow' };
        }
        try {
            const workflows = getStoredWorkflows();
            const currentId = localStorage.getItem(CURRENT_WORKFLOW_KEY);
            const currentWorkflow = currentId ? workflows.find((w) => w.id === currentId) : null;
            return {
                workflows,
                currentId,
                name: currentWorkflow?.name || 'Untitled Workflow',
            };
        } catch {
            // Handle private browsing or quota errors
            return { workflows: [], currentId: null, name: 'Untitled Workflow' };
        }
    }, []);

    const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>(initialData.workflows);
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
        initialData.currentId
    );
    const [workflowName, setWorkflowName] = useState(initialData.name);
    const [enableAutoSave, setEnableAutoSave] = useState(false);

    // Save workflow
    const saveWorkflow = useCallback(
        (nodes: Node[], edges: Edge[]): string => {
            const now = new Date().toISOString();
            const id = currentWorkflowId || generateId();

            const workflowData: SavedWorkflow = {
                id,
                name: workflowName,
                nodes: nodes.map((n) => ({
                    id: n.id,
                    type: n.type as string,
                    position: n.position,
                    data: n.data as unknown,
                })) as unknown as WorkflowNode[],
                edges: edges.map((e) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle || '',
                    targetHandle: e.targetHandle || '',
                })),
                createdAt: currentWorkflowId
                    ? savedWorkflows.find((w) => w.id === currentWorkflowId)?.createdAt || now
                    : now,
                updatedAt: now,
            };

            const existing = savedWorkflows.filter((w) => w.id !== id);
            const updated = [workflowData, ...existing];

            setStoredWorkflows(updated);
            setSavedWorkflows(updated);
            setCurrentWorkflowId(id);
            localStorage.setItem(CURRENT_WORKFLOW_KEY, id);

            return id;
        },
        [currentWorkflowId, workflowName, savedWorkflows]
    );

    // Load workflow
    const loadWorkflow = useCallback(
        (id: string): { nodes: Node[]; edges: Edge[] } | null => {
            const workflow = savedWorkflows.find((w) => w.id === id);
            if (!workflow) return null;

            setCurrentWorkflowId(id);
            setWorkflowName(workflow.name);
            localStorage.setItem(CURRENT_WORKFLOW_KEY, id);

            return {
                nodes: workflow.nodes.map((n) => ({
                    id: n.id,
                    type: n.type,
                    position: n.position,
                    data: n.data as unknown,
                })) as unknown as Node[],
                edges: workflow.edges.map((e) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle,
                    targetHandle: e.targetHandle,
                })),
            };
        },
        [savedWorkflows]
    );

    // Delete workflow
    const deleteWorkflow = useCallback(
        (id: string) => {
            const updated = savedWorkflows.filter((w) => w.id !== id);
            setStoredWorkflows(updated);
            setSavedWorkflows(updated);

            if (currentWorkflowId === id) {
                setCurrentWorkflowId(null);
                setWorkflowName('Untitled Workflow');
                localStorage.removeItem(CURRENT_WORKFLOW_KEY);
            }
        },
        [savedWorkflows, currentWorkflowId]
    );

    // Export workflow as JSON
    const exportWorkflow = useCallback(
        (nodes: Node[], edges: Edge[]): string => {
            const data = {
                name: workflowName,
                version: '1.0',
                exportedAt: new Date().toISOString(),
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
            };
            return JSON.stringify(data, null, 2);
        },
        [workflowName]
    );

    // Import workflow from JSON
    const importWorkflow = useCallback((json: string): { nodes: Node[]; edges: Edge[] } | null => {
        try {
            const data = JSON.parse(json);
            if (!data.nodes || !data.edges) return null;

            if (data.name) {
                setWorkflowName(data.name);
            }
            setCurrentWorkflowId(null); // New imported workflow

            return {
                nodes: data.nodes,
                edges: data.edges,
            };
        } catch {
            return null;
        }
    }, []);

    // Create new workflow
    const createNewWorkflow = useCallback(() => {
        setCurrentWorkflowId(null);
        setWorkflowName('Untitled Workflow');
        localStorage.removeItem(CURRENT_WORKFLOW_KEY);
    }, []);

    return {
        currentWorkflowId,
        workflowName,
        setWorkflowName,
        saveWorkflow,
        loadWorkflow,
        deleteWorkflow,
        savedWorkflows,
        enableAutoSave,
        setEnableAutoSave,
        exportWorkflow,
        importWorkflow,
        createNewWorkflow,
    };
}
