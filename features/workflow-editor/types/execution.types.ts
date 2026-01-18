// Execution Types - Engine and execution-related types

import { WorkflowNode, WorkflowEdge } from "./workflow.types";

export interface DependencyGraph {
  adjacency: Map<string, string[]>;
  inDegree: Map<string, number>;
  edgeMap: Map<string, WorkflowEdge[]>;
}

export interface ExecutionContext {
  nodeId: string;
  inputs: Map<string, unknown>;
  onStatusChange?: (status: "running" | "success" | "error") => void;
}

export interface ExecutionResult {
  success: boolean;
  nodes?: WorkflowNode[];
  error?: string;
}

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  outputs: Record<string, unknown>;
  error?: string;
}
