// WorkflowEngine Unit Tests
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkflowEngine } from "@features/workflow-editor/services/engine/WorkflowEngine";
import { WorkflowNode, WorkflowEdge } from "@features/workflow-editor/types";

// Helper to create test nodes
function createNode(
  id: string,
  type: string,
  outputs: Record<string, unknown> = {},
): WorkflowNode {
  return {
    id,
    type: type as WorkflowNode["type"],
    position: { x: 0, y: 0 },
    data: {
      label: `Node ${id}`,
      status: "idle",
      inputs: {},
      outputs: Object.fromEntries(
        Object.entries(outputs).map(([key, value]) => [
          key,
          { type: "text", value },
        ]),
      ),
      meta: {},
    },
  };
}

describe("WorkflowEngine", () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  describe("execute", () => {
    it("should return error for empty nodes array", async () => {
      const result = await engine.execute([], []);
      expect(result.success).toBe(false);
      expect(result.error).toBe("No nodes to execute");
    });

    it("should execute single input node", async () => {
      const nodes: WorkflowNode[] = [
        createNode("n1", "inputText", { text: "Hello World" }),
      ];
      const result = await engine.execute(nodes, []);
      expect(result.success).toBe(true);
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes?.[0].data.status).toBe("success");
    });

    it("should detect cycle and return error", async () => {
      const nodes: WorkflowNode[] = [
        createNode("n1", "inputText"),
        createNode("n2", "inputText"),
      ];
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "n1",
          target: "n2",
          sourceHandle: "text",
          targetHandle: "text",
        },
        {
          id: "e2",
          source: "n2",
          target: "n1",
          sourceHandle: "text",
          targetHandle: "text",
        },
      ];
      const result = await engine.execute(nodes, edges);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Cycle detected");
    });

    it("should execute linear workflow", async () => {
      const nodes: WorkflowNode[] = [
        createNode("n1", "inputText", { text: "Input" }),
        createNode("n2", "inputText", { text: "" }),
      ];
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "n1",
          target: "n2",
          sourceHandle: "text",
          targetHandle: "text",
        },
      ];
      const result = await engine.execute(nodes, edges);
      expect(result.success).toBe(true);
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes?.[0].data.status).toBe("success");
      expect(result.nodes?.[1].data.status).toBe("success");
    });

    it("should handle parallel execution", async () => {
      const nodes: WorkflowNode[] = [
        createNode("root", "inputText", { text: "Root" }),
        createNode("a", "inputText"),
        createNode("b", "inputText"),
        createNode("c", "inputText"),
      ];
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "root",
          target: "a",
          sourceHandle: "text",
          targetHandle: "text",
        },
        {
          id: "e2",
          source: "root",
          target: "b",
          sourceHandle: "text",
          targetHandle: "text",
        },
        {
          id: "e3",
          source: "root",
          target: "c",
          sourceHandle: "text",
          targetHandle: "text",
        },
      ];
      const result = await engine.execute(nodes, edges);
      expect(result.success).toBe(true);
      expect(result.nodes?.every((n) => n.data.status === "success")).toBe(
        true,
      );
    });

    it("should respect concurrency limit", async () => {
      const customEngine = new WorkflowEngine(2);
      const nodes: WorkflowNode[] = [
        createNode("root", "inputText", { text: "Root" }),
        createNode("a", "inputText"),
        createNode("b", "inputText"),
        createNode("c", "inputText"),
      ];
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "root",
          target: "a",
          sourceHandle: "text",
          targetHandle: "text",
        },
        {
          id: "e2",
          source: "root",
          target: "b",
          sourceHandle: "text",
          targetHandle: "text",
        },
        {
          id: "e3",
          source: "root",
          target: "c",
          sourceHandle: "text",
          targetHandle: "text",
        },
      ];
      const result = await customEngine.execute(nodes, edges);
      expect(result.success).toBe(true);
    });
  });

  describe("registerExecutor", () => {
    it("should allow registering custom executor", async () => {
      const customExecutor = {
        nodeType: "inputText" as const,
        delay: (ms: number) => new Promise((r) => setTimeout(r, ms)),
        execute: vi.fn().mockResolvedValue({ result: "custom" }),
      };
      engine.registerExecutor(
        "inputText",
        customExecutor as unknown as Parameters<
          typeof engine.registerExecutor
        >[1],
      );

      const nodes: WorkflowNode[] = [createNode("n1", "inputText")];
      await engine.execute(nodes, []);

      expect(customExecutor.execute).toHaveBeenCalled();
    });
  });
});
