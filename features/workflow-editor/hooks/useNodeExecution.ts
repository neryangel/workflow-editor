// useNodeExecution - Hook for executing individual nodes

import { useState, useCallback } from "react";
import { WorkflowNodeType } from "../types";

export interface UseNodeExecutionOptions {
  onStatusChange?: (
    nodeId: string,
    status: "idle" | "running" | "success" | "error",
  ) => void;
}

export interface UseNodeExecutionReturn {
  isExecuting: string | null; // nodeId being executed
  executeNode: (
    nodeId: string,
    nodeType: WorkflowNodeType,
    inputs: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
}

export function useNodeExecution(
  options: UseNodeExecutionOptions = {},
): UseNodeExecutionReturn {
  const { onStatusChange } = options;
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const executeNode = useCallback(
    async (
      nodeId: string,
      nodeType: WorkflowNodeType,
      inputs: Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      setIsExecuting(nodeId);
      onStatusChange?.(nodeId, "running");

      try {
        // Mock execution based on node type
        await new Promise((resolve) =>
          setTimeout(resolve, 500 + Math.random() * 500),
        );

        let outputs: Record<string, unknown> = {};

        switch (nodeType) {
          case "llm": {
            const systemText = (inputs.in_system as string) || "";
            const inputText = (inputs.in_text as string) || "";
            outputs = {
              out_text: systemText
                ? `[Enhanced] ${inputText}`
                : `[Processed] ${inputText}`,
            };
            break;
          }
          case "imageGen": {
            const prompt = (inputs.in_text as string) || "";
            const seed = encodeURIComponent(prompt.slice(0, 30) || "default");
            outputs = {
              out_image: `https://picsum.photos/seed/${seed}/400/300`,
            };
            break;
          }
          case "videoGen": {
            outputs = {
              out_video:
                "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
            };
            break;
          }
          case "extractFrame": {
            outputs = {
              out_image: "https://picsum.photos/seed/frame/400/300",
            };
            break;
          }
          default:
            // Input nodes just pass through
            outputs = {};
        }

        onStatusChange?.(nodeId, "success");
        return outputs;
      } catch (error) {
        onStatusChange?.(nodeId, "error");
        throw error;
      } finally {
        setIsExecuting(null);
      }
    },
    [onStatusChange],
  );

  return {
    isExecuting,
    executeNode,
  };
}
