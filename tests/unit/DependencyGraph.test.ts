// DependencyGraph Unit Tests
import { describe, it, expect } from "vitest";
import { DependencyGraph } from "@features/workflow-editor/services/engine/DependencyGraph";
import { WorkflowEdge } from "@features/workflow-editor/types";

describe("DependencyGraph", () => {
  describe("construction", () => {
    it("should create empty graph with no nodes", () => {
      const graph = new DependencyGraph([], []);
      expect(graph.getAllNodeIds()).toHaveLength(0);
    });

    it("should create graph with nodes and no edges", () => {
      const graph = new DependencyGraph(["a", "b", "c"], []);
      expect(graph.getAllNodeIds()).toHaveLength(3);
      expect(graph.getInDegree("a")).toBe(0);
      expect(graph.getInDegree("b")).toBe(0);
    });

    it("should create graph with edges", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b"], edges);
      expect(graph.getSuccessors("a")).toContain("b");
      expect(graph.getInDegree("b")).toBe(1);
    });
  });

  describe("getSuccessors", () => {
    it("should return empty array for node with no successors", () => {
      const graph = new DependencyGraph(["a", "b"], []);
      expect(graph.getSuccessors("a")).toHaveLength(0);
    });

    it("should return successors for connected node", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "a",
          target: "c",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b", "c"], edges);
      expect(graph.getSuccessors("a")).toEqual(["b", "c"]);
    });
  });

  describe("getIncomingEdges", () => {
    it("should return incoming edges for a node", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "c",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "b",
          target: "c",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b", "c"], edges);
      const incoming = graph.getIncomingEdges("c");
      expect(incoming).toHaveLength(2);
      expect(incoming.map((e) => e.source)).toEqual(["a", "b"]);
    });
  });

  describe("detectCycle", () => {
    it("should return null for acyclic graph", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "b",
          target: "c",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b", "c"], edges);
      expect(graph.detectCycle()).toBeNull();
    });

    it("should detect simple cycle", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "b",
          target: "a",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b"], edges);
      const cycle = graph.detectCycle();
      expect(cycle).not.toBeNull();
      expect(cycle?.length).toBeGreaterThan(0);
    });

    it("should detect cycle in larger graph", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "b",
          target: "c",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e3",
          source: "c",
          target: "a",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b", "c"], edges);
      expect(graph.detectCycle()).not.toBeNull();
    });

    it("should return null for disconnected acyclic graph", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b", "c", "d"], edges);
      expect(graph.detectCycle()).toBeNull();
    });
  });

  describe("topologicalSort", () => {
    it("should return empty array for empty graph", () => {
      const graph = new DependencyGraph([], []);
      expect(graph.topologicalSort()).toHaveLength(0);
    });

    it("should return single node", () => {
      const graph = new DependencyGraph(["a"], []);
      expect(graph.topologicalSort()).toEqual(["a"]);
    });

    it("should sort linear chain", () => {
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "b",
          target: "c",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b", "c"], edges);
      const sorted = graph.topologicalSort();
      expect(sorted.indexOf("a")).toBeLessThan(sorted.indexOf("b"));
      expect(sorted.indexOf("b")).toBeLessThan(sorted.indexOf("c"));
    });

    it("should sort diamond graph", () => {
      // a -> b, a -> c, b -> d, c -> d
      const edges: WorkflowEdge[] = [
        {
          id: "e1",
          source: "a",
          target: "b",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "a",
          target: "c",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e3",
          source: "b",
          target: "d",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e4",
          source: "c",
          target: "d",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];
      const graph = new DependencyGraph(["a", "b", "c", "d"], edges);
      const sorted = graph.topologicalSort();
      expect(sorted.indexOf("a")).toBe(0);
      expect(sorted.indexOf("d")).toBe(3);
    });
  });
});
