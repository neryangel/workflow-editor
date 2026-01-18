// DependencyGraph - Graph operations for workflow execution

import { WorkflowEdge } from "../../types";

export interface GraphNode {
  id: string;
}

export interface DependencyGraphData {
  adjacency: Map<string, string[]>;
  inDegree: Map<string, number>;
  edgeMap: Map<string, WorkflowEdge[]>;
}

export class DependencyGraph {
  private adjacency: Map<string, string[]>;
  private inDegree: Map<string, number>;
  private edgeMap: Map<string, WorkflowEdge[]>;

  constructor(nodeIds: string[], edges: WorkflowEdge[]) {
    this.adjacency = new Map();
    this.inDegree = new Map();
    this.edgeMap = new Map();

    // Initialize all nodes
    for (const id of nodeIds) {
      this.adjacency.set(id, []);
      this.inDegree.set(id, 0);
      this.edgeMap.set(id, []);
    }

    // Build graph from edges
    for (const edge of edges) {
      const successors = this.adjacency.get(edge.source) || [];
      successors.push(edge.target);
      this.adjacency.set(edge.source, successors);

      this.inDegree.set(edge.target, (this.inDegree.get(edge.target) || 0) + 1);

      const targetEdges = this.edgeMap.get(edge.target) || [];
      targetEdges.push(edge);
      this.edgeMap.set(edge.target, targetEdges);
    }
  }

  getSuccessors(nodeId: string): string[] {
    return this.adjacency.get(nodeId) || [];
  }

  getInDegree(nodeId: string): number {
    return this.inDegree.get(nodeId) || 0;
  }

  getIncomingEdges(nodeId: string): WorkflowEdge[] {
    return this.edgeMap.get(nodeId) || [];
  }

  getAllNodeIds(): string[] {
    return Array.from(this.adjacency.keys());
  }

  /**
   * Detect cycles using DFS
   * Returns the cycle path if found, null otherwise
   */
  detectCycle(): string[] | null {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      for (const successor of this.getSuccessors(nodeId)) {
        if (!visited.has(successor)) {
          if (dfs(successor)) return true;
        } else if (recStack.has(successor)) {
          return true;
        }
      }

      path.pop();
      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.getAllNodeIds()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) {
          return path;
        }
      }
    }

    return null;
  }

  /**
   * Topological sort using Kahn's algorithm
   */
  topologicalSort(): string[] {
    const result: string[] = [];
    const inDegree = new Map(this.inDegree);
    const queue: string[] = [];

    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      for (const successor of this.getSuccessors(nodeId)) {
        const newDegree = (inDegree.get(successor) || 0) - 1;
        inDegree.set(successor, newDegree);
        if (newDegree === 0) {
          queue.push(successor);
        }
      }
    }

    return result;
  }

  toData(): DependencyGraphData {
    return {
      adjacency: this.adjacency,
      inDegree: this.inDegree,
      edgeMap: this.edgeMap,
    };
  }
}
