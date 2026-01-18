// Unit Tests - API Schemas Validation
import { describe, it, expect } from "vitest";
import {
  llmRequestSchema,
  runWorkflowRequestSchema,
  workflowNodeSchema,
  workflowEdgeSchema,
} from "@/shared/lib/api-schemas";

describe("API Schemas", () => {
  describe("llmRequestSchema", () => {
    it("should accept valid request with prompt only", () => {
      const result = llmRequestSchema.safeParse({ prompt: "Hello world" });
      expect(result.success).toBe(true);
    });

    it("should accept valid request with prompt and systemPrompt", () => {
      const result = llmRequestSchema.safeParse({
        prompt: "Hello world",
        systemPrompt: "You are a helpful assistant",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty prompt", () => {
      const result = llmRequestSchema.safeParse({ prompt: "" });
      expect(result.success).toBe(false);
    });

    it("should reject missing prompt", () => {
      const result = llmRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject prompt over 10000 chars", () => {
      const result = llmRequestSchema.safeParse({ prompt: "a".repeat(10001) });
      expect(result.success).toBe(false);
    });
  });

  describe("workflowNodeSchema", () => {
    it("should accept valid node", () => {
      const result = workflowNodeSchema.safeParse({
        id: "node-1",
        type: "inputText",
        data: { label: "Test" },
      });
      expect(result.success).toBe(true);
    });

    it("should accept node with position", () => {
      const result = workflowNodeSchema.safeParse({
        id: "node-1",
        type: "inputText",
        position: { x: 100, y: 200 },
        data: {},
      });
      expect(result.success).toBe(true);
    });

    it("should reject node without id", () => {
      const result = workflowNodeSchema.safeParse({
        type: "inputText",
        data: {},
      });
      expect(result.success).toBe(false);
    });

    it("should reject node without type", () => {
      const result = workflowNodeSchema.safeParse({ id: "node-1", data: {} });
      expect(result.success).toBe(false);
    });
  });

  describe("workflowEdgeSchema", () => {
    it("should accept valid edge", () => {
      const result = workflowEdgeSchema.safeParse({
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      });
      expect(result.success).toBe(true);
    });

    it("should accept edge with handles", () => {
      const result = workflowEdgeSchema.safeParse({
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "out_text",
        targetHandle: "in_text",
      });
      expect(result.success).toBe(true);
    });

    it("should reject edge without source", () => {
      const result = workflowEdgeSchema.safeParse({
        id: "edge-1",
        target: "node-2",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("runWorkflowRequestSchema", () => {
    it("should accept valid workflow request", () => {
      const result = runWorkflowRequestSchema.safeParse({
        nodes: [{ id: "n1", type: "inputText", data: {} }],
        edges: [],
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty workflow", () => {
      const result = runWorkflowRequestSchema.safeParse({
        nodes: [],
        edges: [],
      });
      expect(result.success).toBe(true);
    });

    it("should reject too many nodes (>100)", () => {
      const nodes = Array.from({ length: 101 }, (_, i) => ({
        id: `n${i}`,
        type: "inputText",
        data: {},
      }));
      const result = runWorkflowRequestSchema.safeParse({ nodes, edges: [] });
      expect(result.success).toBe(false);
    });

    it("should reject missing nodes array", () => {
      const result = runWorkflowRequestSchema.safeParse({ edges: [] });
      expect(result.success).toBe(false);
    });
  });
});
