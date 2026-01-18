"use client";

import { useCallback, useRef, DragEvent, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NodePalette } from "../sidebar";
import { WorkflowToolbar } from "../toolbar";
import {
  InputTextNode,
  ImageInputNode,
  VideoInputNode,
  AudioInputNode,
  LLMNode,
  ImageGenNode,
  VideoGenNode,
  ExtractFrameNode,
  CommentNode,
  VariableNode,
  OutputNode,
} from "../nodes";
import {
  NODE_REGISTRY,
  arePortsCompatible,
  PORT_COLORS,
} from "../../constants";
import { NodeData, PortType, WorkflowNodeType } from "../../types";
import { Play, Loader2 } from "lucide-react";

// Register custom node types
const nodeTypes: NodeTypes = {
  inputText: InputTextNode,
  inputImage: ImageInputNode,
  inputVideo: VideoInputNode,
  inputAudio: AudioInputNode,
  systemPrompt: InputTextNode,
  llm: LLMNode,
  imageGen: ImageGenNode,
  videoGen: VideoGenNode,
  extractFrame: ExtractFrameNode,
  upscaler: ImageGenNode,
  audioGen: ImageGenNode,
  comment: CommentNode,
  variable: VariableNode,
  output: OutputNode,
};

// Get port type from handle ID and node data
function getPortType(
  nodeId: string,
  handleId: string,
  handleType: "source" | "target",
  nodes: Node[],
): PortType | null {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node || !node.data) return null;

  const data = node.data as unknown as NodeData;
  if (handleType === "source") {
    return data.outputs[handleId]?.type ?? null;
  } else {
    return data.inputs[handleId]?.type ?? null;
  }
}

// Get edge color based on port type
function getEdgeColor(portType: PortType | null): string {
  if (!portType) return "#64748b";
  return PORT_COLORS[portType] || "#64748b";
}

function WorkflowEditorInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { screenToFlowPosition, fitView } = useReactFlow();

  // Typed connection validation
  const isValidConnection = useCallback(
    (connection: Connection | Edge): boolean => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target || !sourceHandle || !targetHandle) return false;
      if (source === target) return false;

      const sourceType = getPortType(source, sourceHandle, "source", nodes);
      const targetType = getPortType(target, targetHandle, "target", nodes);

      if (!sourceType || !targetType) return false;
      return arePortsCompatible(sourceType, targetType);
    },
    [nodes],
  );

  // Handle new connections with colored edges
  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        const sourceType = getPortType(
          params.source!,
          params.sourceHandle!,
          "source",
          nodes,
        );
        const edgeColor = getEdgeColor(sourceType);

        setEdges((eds) =>
          addEdge(
            {
              ...params,
              style: { strokeWidth: 2, stroke: edgeColor },
              animated: false,
            },
            eds,
          ),
        );
      }
    },
    [setEdges, isValidConnection, nodes],
  );

  // Handle drag over canvas
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/reactflow",
      ) as WorkflowNodeType;
      if (!type) return;

      const nodeDefinition = NODE_REGISTRY.find((n) => n.type === type);
      if (!nodeDefinition) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { ...nodeDefinition.defaultData },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  // Load workflow handler (from toolbar)
  const handleLoad = useCallback(
    (loadedNodes: Node[], loadedEdges: Edge[]) => {
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setTimeout(() => fitView(), 100);
    },
    [setNodes, setEdges, fitView],
  );

  // Clear workflow handler (for new workflow)
  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // Run workflow
  const handleRun = useCallback(async () => {
    setIsRunning(true);

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: "idle",
          error: undefined,
        },
      })),
    );

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
            if (resultNode) {
              return { ...node, data: resultNode.data };
            }
            return node;
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
  }, [nodes, edges, setNodes]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <WorkflowToolbar
        nodes={nodes}
        edges={edges}
        onLoad={handleLoad}
        onClear={handleClear}
      />

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        <NodePalette />

        <div ref={reactFlowWrapper} className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            defaultEdgeOptions={{
              style: { strokeWidth: 2, stroke: "#64748b" },
            }}
            connectionLineStyle={{ strokeWidth: 2, stroke: "#22c55e" }}
            className="bg-slate-950"
          >
            <Background color="#1e293b" gap={16} size={1} />
            <Controls className="!bg-slate-900 !border-slate-800 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-700" />
            <MiniMap
              className="!bg-slate-900 !border-slate-800"
              nodeColor="#4ade80"
              maskColor="rgba(15, 23, 42, 0.8)"
            />

            <Panel position="top-right" className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning || nodes.length === 0}
                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
                                    transition-all duration-200
                                    ${
                                      isRunning
                                        ? "bg-slate-700 text-slate-300 cursor-wait"
                                        : nodes.length === 0
                                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                                          : "bg-white text-slate-900 hover:bg-slate-100"
                                    }
                                `}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run all
                  </>
                )}
              </button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
}
