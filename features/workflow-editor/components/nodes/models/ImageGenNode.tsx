"use client";

import { memo, useCallback, useState } from "react";
import { NodeProps, useReactFlow, useEdges } from "@xyflow/react";
import { BaseNode } from "../base/BaseNode";
import { HandleRow } from "../base/NodeHandle";
import { NodeData } from "../../../types";
import { PORT_COLORS } from "../../../constants";
import { Loader2, Play } from "lucide-react";

function ImageGenNodeComponent({ id, data, selected }: NodeProps) {
  const { getNodes, setNodes } = useReactFlow();
  const edges = useEdges();
  const [isRunning, setIsRunning] = useState(false);
  const nodeData = data as unknown as NodeData;
  const outputValue = nodeData.outputs?.out_image?.value as string | undefined;
  const imageColor = PORT_COLORS.image;

  const getInputsFromConnections = useCallback(() => {
    const inputs: Record<string, unknown> = {};
    const nodes = getNodes();
    const incomingEdges = edges.filter((e) => e.target === id);

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode?.data) continue;

      const sourceData = sourceNode.data as unknown as NodeData;
      const outputPort = edge.sourceHandle;
      const inputPort = edge.targetHandle;

      if (outputPort && inputPort) {
        const outputValue = sourceData.outputs?.[outputPort]?.value;
        inputs[inputPort] = outputValue;
      }
    }

    return inputs;
  }, [edges, getNodes, id]);

  const handleRunNode = useCallback(async () => {
    setIsRunning(true);

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, status: "running" } }
          : node,
      ),
    );

    try {
      const inputs = getInputsFromConnections();
      await new Promise((resolve) =>
        setTimeout(resolve, 1200 + Math.random() * 800),
      );

      const promptText = (inputs.in_text as string) || "generated";
      const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(promptText)}/400/300`;

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== id) return node;
          const currentData = node.data as unknown as NodeData;
          return {
            ...node,
            data: {
              ...currentData,
              status: "success",
              outputs: {
                ...currentData.outputs,
                out_image: {
                  ...currentData.outputs.out_image,
                  value: placeholderUrl,
                },
              },
            },
          };
        }),
      );
    } catch (error) {
      console.error("Node execution failed:", error);
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  status: "error",
                  error: "Execution failed",
                },
              }
            : node,
        ),
      );
    } finally {
      setIsRunning(false);
    }
  }, [id, setNodes, getInputsFromConnections]);

  return (
    <BaseNode
      label={nodeData.label}
      status={nodeData.status}
      error={nodeData.error}
      selected={selected}
    >
      <div className="flex flex-col gap-3">
        <div
          className="aspect-video rounded-lg border-2 overflow-hidden min-h-[120px] flex items-center justify-center"
          style={{
            borderColor:
              nodeData.status === "success" ? `${imageColor}50` : "transparent",
            backgroundColor: "#0f172a",
          }}
        >
          {nodeData.status === "running" || isRunning ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-slate-500" />
            </div>
          ) : outputValue ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={outputValue}
              alt="Generated"
              className="w-full h-full object-cover"
            />
          ) : (
            <p className="text-xs text-slate-600">Output will appear here</p>
          )}
        </div>

        <button
          onClick={handleRunNode}
          disabled={isRunning}
          className={`w-full py-2 px-3 text-sm font-medium rounded-lg border
                        flex items-center justify-center gap-2 transition-colors
                        ${
                          isRunning
                            ? "bg-slate-700 border-slate-600 text-slate-400 cursor-wait"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                        }`}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Run
            </>
          )}
        </button>

        <HandleRow
          inputs={[
            { id: "in_text", type: "text", label: "text" },
            { id: "in_image", type: "image", label: "image" },
          ]}
          outputs={[{ id: "out_image", type: "image", label: "image" }]}
        />
      </div>
    </BaseNode>
  );
}

export const ImageGenNode = memo(ImageGenNodeComponent);
