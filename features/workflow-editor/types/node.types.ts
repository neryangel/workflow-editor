// Node Types - Node data structures and status

import { PortDefinition } from "./port.types";

export type NodeStatus = "idle" | "running" | "success" | "error";

export type NodeCategory = "input" | "models" | "utility";

export interface NodeData {
  label: string;
  status: NodeStatus;
  inputs: Record<string, PortDefinition>;
  outputs: Record<string, PortDefinition>;
  meta?: Record<string, unknown>;
  error?: string;
}

// All supported node types
export type WorkflowNodeType =
  | "inputText"
  | "inputImage"
  | "inputVideo"
  | "inputAudio"
  | "systemPrompt"
  | "llm"
  | "imageGen"
  | "videoGen"
  | "extractFrame"
  | "upscaler"
  | "audioGen"
  | "comment"
  | "variable"
  | "output";
