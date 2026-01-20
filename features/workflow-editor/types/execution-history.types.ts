// Execution History Types - History tracking and replay

import { WorkflowNode, WorkflowEdge } from './workflow.types';

export interface ExecutionLog {
  id: string;
  workflowId?: string;
  workflowName?: string;
  timestamp: Date;
  duration: number; // in milliseconds
  status: 'success' | 'failed' | 'cancelled';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, string | number | boolean>;
  error?: string;
  nodeExecutionTimes?: Record<string, number>; // nodeId -> execution time in ms
  metadata?: {
    triggeredBy?: string;
    environment?: string;
    [key: string]: unknown;
  };
}

export interface ExecutionComparison {
  execution1: ExecutionLog;
  execution2: ExecutionLog;
  differences: {
    nodes: {
      added: string[];
      removed: string[];
      modified: string[];
    };
    variables: {
      added: string[];
      removed: string[];
      modified: string[];
    };
    results: {
      nodeId: string;
      field: string;
      value1: unknown;
      value2: unknown;
    }[];
  };
}

export interface ExecutionFilter {
  status?: 'success' | 'failed' | 'cancelled' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  workflowId?: string;
  search?: string;
}

export interface ExecutionStats {
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  recentExecutions: ExecutionLog[];
  mostFrequentErrors: {
    error: string;
    count: number;
  }[];
}
