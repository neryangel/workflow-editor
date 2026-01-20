// useExecutionHistory - Hook for managing workflow execution history

import { useState, useCallback, useEffect } from 'react';
import { ExecutionLog, ExecutionFilter, ExecutionStats, ExecutionComparison } from '../types';
import { WorkflowNode, WorkflowEdge } from '../types';

const STORAGE_KEY = 'execution-history';
const MAX_HISTORY_ITEMS = 100; // Keep last 100 executions

export interface UseExecutionHistoryReturn {
  // History state
  history: ExecutionLog[];
  filteredHistory: ExecutionLog[];
  currentFilter: ExecutionFilter;

  // Actions
  addExecution: (
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    duration: number,
    status: 'success' | 'failed' | 'cancelled',
    error?: string,
    variables?: Record<string, string | number | boolean>,
    workflowName?: string
  ) => void;
  clearHistory: () => void;
  deleteExecution: (id: string) => void;
  setFilter: (filter: ExecutionFilter) => void;

  // Replay
  replayExecution: (id: string) => { nodes: WorkflowNode[]; edges: WorkflowEdge[]; variables?: Record<string, string | number | boolean> } | null;

  // Comparison
  compareExecutions: (id1: string, id2: string) => ExecutionComparison | null;

  // Stats
  getStats: () => ExecutionStats;

  // Export
  exportHistory: (ids?: string[]) => string;
  importHistory: (json: string) => void;
}

export function useExecutionHistory(): UseExecutionHistoryReturn {
  const [history, setHistory] = useState<ExecutionLog[]>([]);
  const [currentFilter, setCurrentFilter] = useState<ExecutionFilter>({ status: 'all' });

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const withDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          ...(item.metadata?.dateFrom && { metadata: { ...item.metadata, dateFrom: new Date(item.metadata.dateFrom) } }),
          ...(item.metadata?.dateTo && { metadata: { ...item.metadata, dateTo: new Date(item.metadata.dateTo) } }),
        }));
        setHistory(withDates);
      } catch (error) {
        console.error('Failed to load execution history:', error);
      }
    }
  }, []);

  // Save history to localStorage
  const saveToStorage = useCallback((newHistory: ExecutionLog[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  }, []);

  // Add a new execution to history
  const addExecution = useCallback(
    (
      nodes: WorkflowNode[],
      edges: WorkflowEdge[],
      duration: number,
      status: 'success' | 'failed' | 'cancelled',
      error?: string,
      variables?: Record<string, string | number | boolean>,
      workflowName?: string
    ) => {
      const execution: ExecutionLog = {
        id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        duration,
        status,
        nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
        edges: JSON.parse(JSON.stringify(edges)), // Deep clone
        variables: variables ? { ...variables } : undefined,
        error,
        workflowName,
      };

      setHistory((prev) => {
        const updated = [execution, ...prev];
        // Keep only the last MAX_HISTORY_ITEMS
        const trimmed = updated.slice(0, MAX_HISTORY_ITEMS);
        saveToStorage(trimmed);
        return trimmed;
      });
    },
    [saveToStorage]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Delete a specific execution
  const deleteExecution = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Filter history
  const filteredHistory = history.filter((item) => {
    if (currentFilter.status && currentFilter.status !== 'all' && item.status !== currentFilter.status) {
      return false;
    }
    if (currentFilter.dateFrom && item.timestamp < currentFilter.dateFrom) {
      return false;
    }
    if (currentFilter.dateTo && item.timestamp > currentFilter.dateTo) {
      return false;
    }
    if (currentFilter.workflowId && item.workflowId !== currentFilter.workflowId) {
      return false;
    }
    if (currentFilter.search) {
      const searchLower = currentFilter.search.toLowerCase();
      const matchesName = item.workflowName?.toLowerCase().includes(searchLower);
      const matchesError = item.error?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesError) {
        return false;
      }
    }
    return true;
  });

  // Replay execution
  const replayExecution = useCallback(
    (id: string) => {
      const execution = history.find((item) => item.id === id);
      if (!execution) return null;

      return {
        nodes: JSON.parse(JSON.stringify(execution.nodes)),
        edges: JSON.parse(JSON.stringify(execution.edges)),
        variables: execution.variables ? { ...execution.variables } : undefined,
      };
    },
    [history]
  );

  // Compare two executions
  const compareExecutions = useCallback(
    (id1: string, id2: string): ExecutionComparison | null => {
      const exec1 = history.find((item) => item.id === id1);
      const exec2 = history.find((item) => item.id === id2);

      if (!exec1 || !exec2) return null;

      const nodeIds1 = new Set(exec1.nodes.map((n) => n.id));
      const nodeIds2 = new Set(exec2.nodes.map((n) => n.id));

      const added = exec2.nodes.filter((n) => !nodeIds1.has(n.id)).map((n) => n.id);
      const removed = exec1.nodes.filter((n) => !nodeIds2.has(n.id)).map((n) => n.id);
      const common = exec1.nodes.filter((n) => nodeIds2.has(n.id)).map((n) => n.id);

      const varKeys1 = new Set(Object.keys(exec1.variables || {}));
      const varKeys2 = new Set(Object.keys(exec2.variables || {}));

      const addedVars = Array.from(varKeys2).filter((k) => !varKeys1.has(k));
      const removedVars = Array.from(varKeys1).filter((k) => !varKeys2.has(k));
      const modifiedVars = Array.from(varKeys1).filter(
        (k) => varKeys2.has(k) && (exec1.variables?.[k] !== exec2.variables?.[k])
      );

      return {
        execution1: exec1,
        execution2: exec2,
        differences: {
          nodes: {
            added,
            removed,
            modified: common.filter((nodeId) => {
              const node1 = exec1.nodes.find((n) => n.id === nodeId);
              const node2 = exec2.nodes.find((n) => n.id === nodeId);
              return JSON.stringify(node1?.data) !== JSON.stringify(node2?.data);
            }),
          },
          variables: {
            added: addedVars,
            removed: removedVars,
            modified: modifiedVars,
          },
          results: [],
        },
      };
    },
    [history]
  );

  // Get statistics
  const getStats = useCallback((): ExecutionStats => {
    const total = history.length;
    const successful = history.filter((item) => item.status === 'success').length;
    const avgDuration =
      total > 0
        ? history.reduce((sum, item) => sum + item.duration, 0) / total
        : 0;

    const errorCounts = new Map<string, number>();
    history
      .filter((item) => item.error)
      .forEach((item) => {
        const error = item.error!;
        errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      });

    const mostFrequentErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalExecutions: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgDuration,
      recentExecutions: history.slice(0, 10),
      mostFrequentErrors,
    };
  }, [history]);

  // Export history
  const exportHistory = useCallback(
    (ids?: string[]) => {
      const toExport = ids
        ? history.filter((item) => ids.includes(item.id))
        : history;
      return JSON.stringify(toExport, null, 2);
    },
    [history]
  );

  // Import history
  const importHistory = useCallback(
    (json: string) => {
      try {
        const imported = JSON.parse(json) as ExecutionLog[];
        setHistory((prev) => {
          const updated = [...imported, ...prev];
          const unique = Array.from(
            new Map(updated.map((item) => [item.id, item])).values()
          );
          const trimmed = unique.slice(0, MAX_HISTORY_ITEMS);
          saveToStorage(trimmed);
          return trimmed;
        });
      } catch (error) {
        console.error('Failed to import history:', error);
      }
    },
    [saveToStorage]
  );

  return {
    history,
    filteredHistory,
    currentFilter,
    addExecution,
    clearHistory,
    deleteExecution,
    setFilter: setCurrentFilter,
    replayExecution,
    compareExecutions,
    getStats,
    exportHistory,
    importHistory,
  };
}
