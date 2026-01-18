// Workflow Templates

import { Node, Edge } from "@xyflow/react";
import { NodeData } from "../types";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "text" | "image" | "video" | "custom";
  nodes: Node[];
  edges: Edge[];
  thumbnail?: string;
}

// Helper to create node with proper data
const createNode = (
  id: string,
  type: string,
  position: { x: number; y: number },
  data: NodeData,
): Node => ({
  id,
  type,
  position,
  data: data as unknown as Record<string, unknown>,
});

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "text-enhancement",
    name: "Text Enhancement",
    description: "Enhance text using AI",
    category: "text",
    nodes: [
      createNode(
        "text-1",
        "inputText",
        { x: 100, y: 200 },
        {
          label: "Input Text",
          status: "idle",
          inputs: {},
          outputs: { out_text: { type: "text" } },
        },
      ),
      createNode(
        "llm-1",
        "llm",
        { x: 450, y: 200 },
        {
          label: "Gemini 2.5 Flash",
          status: "idle",
          inputs: { in_system: { type: "text" }, in_text: { type: "text" } },
          outputs: { out_text: { type: "text" } },
        },
      ),
    ],
    edges: [
      {
        id: "e1",
        source: "text-1",
        target: "llm-1",
        sourceHandle: "out_text",
        targetHandle: "in_text",
      },
    ],
  },
  {
    id: "text-to-image",
    name: "Text to Image",
    description: "Generate image from text prompt",
    category: "image",
    nodes: [
      createNode(
        "text-1",
        "inputText",
        { x: 100, y: 200 },
        {
          label: "Prompt",
          status: "idle",
          inputs: {},
          outputs: { out_text: { type: "text" } },
        },
      ),
      createNode(
        "img-1",
        "imageGen",
        { x: 450, y: 200 },
        {
          label: "Nano Banana Pro",
          status: "idle",
          inputs: { in_text: { type: "text" }, in_image: { type: "image" } },
          outputs: { out_image: { type: "image" } },
        },
      ),
    ],
    edges: [
      {
        id: "e1",
        source: "text-1",
        target: "img-1",
        sourceHandle: "out_text",
        targetHandle: "in_text",
      },
    ],
  },
  {
    id: "full-video-pipeline",
    name: "Video Generation Pipeline",
    description: "Create video from text with AI enhancement",
    category: "video",
    nodes: [
      createNode(
        "text-1",
        "inputText",
        { x: 100, y: 100 },
        {
          label: "Scene Description",
          status: "idle",
          inputs: {},
          outputs: { out_text: { type: "text" } },
        },
      ),
      createNode(
        "llm-1",
        "llm",
        { x: 100, y: 350 },
        {
          label: "Script Writer",
          status: "idle",
          inputs: { in_system: { type: "text" }, in_text: { type: "text" } },
          outputs: { out_text: { type: "text" } },
        },
      ),
      createNode(
        "img-1",
        "imageGen",
        { x: 450, y: 100 },
        {
          label: "Key Frame Generator",
          status: "idle",
          inputs: { in_text: { type: "text" }, in_image: { type: "image" } },
          outputs: { out_image: { type: "image" } },
        },
      ),
      createNode(
        "vid-1",
        "videoGen",
        { x: 450, y: 350 },
        {
          label: "Video Generator",
          status: "idle",
          inputs: { in_text: { type: "text" }, in_image: { type: "image" } },
          outputs: { out_video: { type: "video" } },
        },
      ),
    ],
    edges: [
      {
        id: "e1",
        source: "text-1",
        target: "llm-1",
        sourceHandle: "out_text",
        targetHandle: "in_text",
      },
      {
        id: "e2",
        source: "text-1",
        target: "img-1",
        sourceHandle: "out_text",
        targetHandle: "in_text",
      },
      {
        id: "e3",
        source: "llm-1",
        target: "vid-1",
        sourceHandle: "out_text",
        targetHandle: "in_text",
      },
      {
        id: "e4",
        source: "img-1",
        target: "vid-1",
        sourceHandle: "out_image",
        targetHandle: "in_image",
      },
    ],
  },
  {
    id: "video-frame-extract",
    name: "Video Frame Extraction",
    description: "Extract and enhance frames from video",
    category: "video",
    nodes: [
      createNode(
        "video-1",
        "inputVideo",
        { x: 100, y: 200 },
        {
          label: "Input Video",
          status: "idle",
          inputs: {},
          outputs: { out_video: { type: "video" } },
        },
      ),
      createNode(
        "extract-1",
        "extractFrame",
        { x: 450, y: 200 },
        {
          label: "Extract Frame",
          status: "idle",
          inputs: { in_video: { type: "video" } },
          outputs: { out_image: { type: "image" } },
          meta: { timestamp: 0 },
        },
      ),
    ],
    edges: [
      {
        id: "e1",
        source: "video-1",
        target: "extract-1",
        sourceHandle: "out_video",
        targetHandle: "in_video",
      },
    ],
  },
];

// Get templates by category
export function getTemplatesByCategory(
  category: WorkflowTemplate["category"],
): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter((t) => t.category === category);
}

// Get template by ID
export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}
