import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '../hooks/useWorkflowStore';

export interface AdjacencyEntry {
  edgeId: string;
  targetId: string;
  sourceHandle?: string | null;
}

export type AdjacencyMap = Map<string, AdjacencyEntry[]>;
export type NodeMap = Map<string, WorkflowNode>;

export function buildMaps(nodes: WorkflowNode[], edges: Edge[]): { adjacency: AdjacencyMap; nodeMap: NodeMap } {
  const adjacency: AdjacencyMap = new Map();
  const nodeMap: NodeMap = new Map();

  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    adjacency.set(n.id, []);
  });

  edges.forEach((e) => {
    const list = adjacency.get(e.source) ?? [];
    list.push({ edgeId: e.id, targetId: e.target, sourceHandle: e.sourceHandle });
    adjacency.set(e.source, list);
  });

  return { adjacency, nodeMap };
}

export function findStartNode(nodes: WorkflowNode[]): WorkflowNode | undefined {
  return nodes.find((n) => n.type === 'start');
}

/** DFS cycle detection — returns true if a cycle exists */
export function hasCycle(nodes: WorkflowNode[], edges: Edge[]): boolean {
  const { adjacency } = buildMaps(nodes, edges);
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string): boolean {
    visited.add(id);
    inStack.add(id);
    for (const { targetId } of adjacency.get(id) ?? []) {
      if (!visited.has(targetId) && dfs(targetId)) return true;
      if (inStack.has(targetId)) return true;
    }
    inStack.delete(id);
    return false;
  }

  for (const n of nodes) {
    if (!visited.has(n.id) && dfs(n.id)) return true;
  }
  return false;
}
