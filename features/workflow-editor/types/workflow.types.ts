// Workflow Types - Workflow structure and API types

import { NodeData, WorkflowNodeType } from './node.types';

export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    position: { x: number; y: number };
    data: NodeData;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    createdAt: Date;
    updatedAt: Date;
}

// API Request/Response types
export interface RunWorkflowRequest {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    variables?: Record<string, string | number | boolean>;
}

export interface RunWorkflowResponse {
    success: boolean;
    nodes?: WorkflowNode[];
    error?: string;
}
