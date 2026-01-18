// Unit Tests - useWorkflowPersist Hook
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWorkflowPersist } from "@features/workflow-editor/hooks/useWorkflowPersist";
import { Node, Edge } from "@xyflow/react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("useWorkflowPersist", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should initialize with default workflow name", () => {
    const { result } = renderHook(() => useWorkflowPersist());
    expect(result.current.workflowName).toBe("Untitled Workflow");
  });

  it("should initialize with null currentWorkflowId", () => {
    const { result } = renderHook(() => useWorkflowPersist());
    expect(result.current.currentWorkflowId).toBeNull();
  });

  it("should initialize with empty savedWorkflows", () => {
    const { result } = renderHook(() => useWorkflowPersist());
    expect(result.current.savedWorkflows).toEqual([]);
  });

  it("should allow setting workflow name", () => {
    const { result } = renderHook(() => useWorkflowPersist());

    act(() => {
      result.current.setWorkflowName("My Test Workflow");
    });

    expect(result.current.workflowName).toBe("My Test Workflow");
  });

  it("should have enableAutoSave initially false", () => {
    const { result } = renderHook(() => useWorkflowPersist());
    expect(result.current.enableAutoSave).toBe(false);
  });

  it("should toggle autoSave", () => {
    const { result } = renderHook(() => useWorkflowPersist());

    act(() => {
      result.current.setEnableAutoSave(true);
    });

    expect(result.current.enableAutoSave).toBe(true);
  });

  it("should save workflow and return id", () => {
    const { result } = renderHook(() => useWorkflowPersist());
    const nodes = [
      { id: "n1", position: { x: 0, y: 0 }, data: {}, type: "inputText" },
    ] as Node[];
    const edges: Edge[] = [];

    let savedId: string;
    act(() => {
      savedId = result.current.saveWorkflow(nodes, edges);
    });

    expect(savedId!).toBeTruthy();
    expect(savedId!.startsWith("wf-")).toBe(true);
  });

  it("should create new workflow", () => {
    const { result } = renderHook(() => useWorkflowPersist());

    act(() => {
      result.current.setWorkflowName("Test");
    });

    act(() => {
      result.current.createNewWorkflow();
    });

    expect(result.current.workflowName).toBe("Untitled Workflow");
    expect(result.current.currentWorkflowId).toBeNull();
  });

  it("should export workflow as JSON", () => {
    const { result } = renderHook(() => useWorkflowPersist());
    const nodes = [
      { id: "n1", position: { x: 0, y: 0 }, data: {}, type: "inputText" },
    ] as Node[];
    const edges: Edge[] = [];

    let json: string;
    act(() => {
      json = result.current.exportWorkflow(nodes, edges);
    });

    const parsed = JSON.parse(json!);
    expect(parsed.nodes).toBeDefined();
    expect(parsed.edges).toBeDefined();
    expect(parsed.version).toBe("1.0");
  });

  it("should import workflow from JSON", () => {
    const { result } = renderHook(() => useWorkflowPersist());
    const json = JSON.stringify({
      name: "Imported Workflow",
      nodes: [
        { id: "n1", position: { x: 100, y: 100 }, data: {}, type: "inputText" },
      ],
      edges: [],
    });

    let imported: { nodes: Node[]; edges: Edge[] } | null;
    act(() => {
      imported = result.current.importWorkflow(json);
    });

    expect(imported!).not.toBeNull();
    expect(imported!.nodes).toHaveLength(1);
    expect(result.current.workflowName).toBe("Imported Workflow");
  });
});
