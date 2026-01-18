// Unit Tests - useUndoRedo Hook
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUndoRedo } from "@features/workflow-editor/hooks/useUndoRedo";
import { Node, Edge } from "@xyflow/react";

describe("useUndoRedo", () => {
  it("should initialize with provided nodes and edges", () => {
    const initialNodes = [
      { id: "n1", position: { x: 0, y: 0 }, data: {} },
    ] as Node[];
    const initialEdges = [{ id: "e1", source: "n1", target: "n2" }] as Edge[];

    const { result } = renderHook(() =>
      useUndoRedo(initialNodes, initialEdges),
    );

    expect(result.current.nodes).toEqual(initialNodes);
    expect(result.current.edges).toEqual(initialEdges);
  });

  it("should start with canUndo false and canRedo false", () => {
    const { result } = renderHook(() => useUndoRedo([], []));

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("should update nodes through setNodes", () => {
    const { result } = renderHook(() => useUndoRedo([], []));

    const newNodes = [
      { id: "n1", position: { x: 100, y: 100 }, data: {} },
    ] as Node[];

    act(() => {
      result.current.setNodes(newNodes);
    });

    expect(result.current.nodes).toEqual(newNodes);
  });

  it("should update edges through setEdges", () => {
    const { result } = renderHook(() => useUndoRedo([], []));

    const newEdges = [{ id: "e1", source: "n1", target: "n2" }] as Edge[];

    act(() => {
      result.current.setEdges(newEdges);
    });

    expect(result.current.edges).toEqual(newEdges);
  });

  it("should reset history with resetHistory", () => {
    const initialNodes = [
      { id: "n1", position: { x: 0, y: 0 }, data: {} },
    ] as Node[];
    const { result } = renderHook(() => useUndoRedo(initialNodes, []));

    const newNodes = [
      { id: "n2", position: { x: 50, y: 50 }, data: {} },
    ] as Node[];
    const newEdges = [{ id: "e1", source: "n2", target: "n3" }] as Edge[];

    act(() => {
      result.current.resetHistory(newNodes, newEdges);
    });

    expect(result.current.nodes).toEqual(newNodes);
    expect(result.current.edges).toEqual(newEdges);
    expect(result.current.canUndo).toBe(false);
  });

  it("should provide undo function", () => {
    const { result } = renderHook(() => useUndoRedo([], []));
    expect(typeof result.current.undo).toBe("function");
  });

  it("should provide redo function", () => {
    const { result } = renderHook(() => useUndoRedo([], []));
    expect(typeof result.current.redo).toBe("function");
  });
});
