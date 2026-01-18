"use client";

import { useCallback, useRef, useState } from "react";
import { Node, Edge } from "@xyflow/react";

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY_SIZE = 50;

export function useUndoRedo(
  initialNodes: Node[] = [],
  initialEdges: Edge[] = [],
) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const historyRef = useRef<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const pointerRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  // Update canUndo/canRedo state
  const updateCanUndoRedo = useCallback(() => {
    setCanUndo(pointerRef.current > 0);
    setCanRedo(pointerRef.current < historyRef.current.length - 1);
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }

      // Remove any future states (when we make a new change after undo)
      const newHistory = historyRef.current.slice(0, pointerRef.current + 1);

      // Add new state
      newHistory.push({ nodes: newNodes, edges: newEdges });

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      } else {
        pointerRef.current++;
      }

      historyRef.current = newHistory;
      updateCanUndoRedo();
    },
    [updateCanUndoRedo],
  );

  // Undo action
  const undo = useCallback(() => {
    if (pointerRef.current <= 0) return false;

    isUndoRedoRef.current = true;
    pointerRef.current--;

    const state = historyRef.current[pointerRef.current];
    setNodes(state.nodes);
    setEdges(state.edges);
    updateCanUndoRedo();

    return true;
  }, [updateCanUndoRedo]);

  // Redo action
  const redo = useCallback(() => {
    if (pointerRef.current >= historyRef.current.length - 1) return false;

    isUndoRedoRef.current = true;
    pointerRef.current++;

    const state = historyRef.current[pointerRef.current];
    setNodes(state.nodes);
    setEdges(state.edges);
    updateCanUndoRedo();

    return true;
  }, [updateCanUndoRedo]);

  // Wrapper for setNodes that saves to history
  const setNodesWithHistory = useCallback(
    (updater: Node[] | ((nodes: Node[]) => Node[])) => {
      setNodes((prev) => {
        const newNodes =
          typeof updater === "function" ? updater(prev) : updater;
        // Save to history on next tick to get the latest edges too
        setTimeout(() => {
          saveToHistory(newNodes, edges);
        }, 0);
        return newNodes;
      });
    },
    [edges, saveToHistory],
  );

  // Wrapper for setEdges that saves to history
  const setEdgesWithHistory = useCallback(
    (updater: Edge[] | ((edges: Edge[]) => Edge[])) => {
      setEdges((prev) => {
        const newEdges =
          typeof updater === "function" ? updater(prev) : updater;
        // Save to history on next tick to get the latest nodes too
        setTimeout(() => {
          saveToHistory(nodes, newEdges);
        }, 0);
        return newEdges;
      });
    },
    [nodes, saveToHistory],
  );

  // Reset history (for loading workflows)
  const resetHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    historyRef.current = [{ nodes: newNodes, edges: newEdges }];
    pointerRef.current = 0;
    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  return {
    nodes,
    edges,
    setNodes: setNodesWithHistory,
    setEdges: setEdgesWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
