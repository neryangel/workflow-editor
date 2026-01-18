// useWorkflow - Main state management hook for workflow editor

import { useState, useCallback } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from "@xyflow/react";
import { NodeData, WorkflowNodeType, PortType } from "../types";
import { NODE_REGISTRY, PORT_COLORS, arePortsCompatible } from "../constants";

export interface UseWorkflowOptions {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export interface UseWorkflowReturn {
  // State
  nodes: Node[];
  edges: Edge[];
  isRunning: boolean;

  // Actions
  onNodesChange: ReturnType<typeof useNodesState>[2];
  onEdgesChange: ReturnType<typeof useEdgesState>[2];
  onConnect: (connection: Connection) => void;
  addNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  runWorkflow: () => Promise<void>;
  resetStatus: () => void;

  // Validation
  isValidConnection: (connection: Connection | Edge) => boolean;
  getPortType: (
    nodeId: string,
    handleId: string,
    type: "source" | "target",
  ) => PortType | null;
}

export function useWorkflow(
  options: UseWorkflowOptions = {},
): UseWorkflowReturn {
  const { initialNodes = [], initialEdges = [] } = options;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [isRunning, setIsRunning] = useState(false);

  // Get port type from node data
  const getPortType = useCallback(
    (
      nodeId: string,
      handleId: string,
      type: "source" | "target",
    ): PortType | null => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node?.data) return null;

      const data = node.data as unknown as NodeData;
      if (type === "source") {
        return data.outputs[handleId]?.type ?? null;
      }
      return data.inputs[handleId]?.type ?? null;
    },
    [nodes],
  );

  // Validate connection
  const isValidConnection = useCallback(
    (connection: Connection | Edge): boolean => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target || !sourceHandle || !targetHandle) return false;
      if (source === target) return false;

      const sourceType = getPortType(source, sourceHandle, "source");
      const targetType = getPortType(target, targetHandle, "target");

      if (!sourceType || !targetType) return false;
      return arePortsCompatible(sourceType, targetType);
    },
    [getPortType],
  );

  // Handle connection with colored edges
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return;

      const sourceType = getPortType(
        connection.source!,
        connection.sourceHandle!,
        "source",
      );
      const edgeColor = sourceType ? PORT_COLORS[sourceType] : "#64748b";

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            style: { strokeWidth: 2, stroke: edgeColor },
            animated: false,
          },
          eds,
        ),
      );
    },
    [setEdges, isValidConnection, getPortType],
  );

  // Add node to canvas
  const addNode = useCallback(
    (type: WorkflowNodeType, position: { x: number; y: number }) => {
      const definition = NODE_REGISTRY.find((n) => n.type === type);
      if (!definition) return;

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { ...definition.defaultData },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  // Remove node
  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
      );
    },
    [setNodes, setEdges],
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }),
      );
    },
    [setNodes],
  );

  // Reset all nodes to idle
  const resetStatus = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, status: "idle", error: undefined },
      })),
    );
  }, [setNodes]);

  // Run workflow via API
  const runWorkflow = useCallback(async () => {
    setIsRunning(true);
    resetStatus();

    try {
      const response = await fetch("/api/run-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const result = await response.json();

      if (result.success && result.nodes) {
        setNodes((nds) =>
          nds.map((node) => {
            const resultNode = result.nodes.find(
              (rn: { id: string }) => rn.id === node.id,
            );
            return resultNode ? { ...node, data: resultNode.data } : node;
          }),
        );
      } else if (result.error) {
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: { ...node.data, status: "error", error: result.error },
          })),
        );
      }
    } catch (error) {
      console.error("Workflow execution failed:", error);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, status: "error", error: "Network error" },
        })),
      );
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, setNodes, resetStatus]);

  return {
    nodes,
    edges,
    isRunning,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    removeNode,
    updateNodeData,
    runWorkflow,
    resetStatus,
    isValidConnection,
    getPortType,
  };
}
