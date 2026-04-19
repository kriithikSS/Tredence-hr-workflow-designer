import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import type { WorkflowNodeData } from '../types/nodes';
import { WORKFLOW_TEMPLATES } from '../utils/templates';

export type WorkflowNode = Node<WorkflowNodeData>;

interface Snapshot { nodes: WorkflowNode[]; edges: Edge[] }

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  workflowTitle: string;
  isSandboxOpen: boolean;
  past: Snapshot[];
  future: Snapshot[];

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (conn: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  setSelectedNode: (id: string | null) => void;
  setWorkflowTitle: (title: string) => void;
  setIsSandboxOpen: (open: boolean) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  loadTemplate: (templateId: string) => void;
  clearAllNodeErrors: () => void;
  undo: () => void;
  redo: () => void;
  _snapshot: () => void;
}

const DEFAULT_TEMPLATE = WORKFLOW_TEMPLATES[0];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: DEFAULT_TEMPLATE.nodes as WorkflowNode[],
  edges: DEFAULT_TEMPLATE.edges,
  selectedNodeId: null,
  workflowTitle: DEFAULT_TEMPLATE.title,
  isSandboxOpen: false,
  past: [],
  future: [],

  // ── Snapshot (call before any destructive mutation) ─────────────────────
  _snapshot: () => {
    const { nodes, edges, past } = get();
    set({ past: [...past.slice(-29), { nodes, edges }], future: [] });
  },

  // ── Undo / Redo ──────────────────────────────────────────────────────────
  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future.slice(0, 29)],
      selectedNodeId: null,
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past.slice(-29), { nodes, edges }],
      future: future.slice(1),
      selectedNodeId: null,
    });
  },

  // ── React Flow handlers ──────────────────────────────────────────────────
  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as WorkflowNode[] })),

  onEdgesChange: (changes) => {
    const hasRemoval = changes.some((c) => c.type === 'remove');
    if (hasRemoval) get()._snapshot();
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) }));
  },

  onConnect: (conn) => {
    get()._snapshot();
    set((s) => ({
      edges: [
        ...s.edges,
        { ...conn, id: `e-${Date.now()}`, animated: true, type: 'custom' },
      ],
    }));
  },

  // ── Node mutations ───────────────────────────────────────────────────────
  addNode: (node) => {
    get()._snapshot();
    set((s) => ({ nodes: [...s.nodes, node] }));
  },

  deleteNode: (id) => {
    get()._snapshot();
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
  },

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n
      ),
    })),

  clearAllNodeErrors: () =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({
        ...n,
        data: { ...n.data, validationErrors: [] } as WorkflowNodeData,
      })),
    })),

  // ── Misc ─────────────────────────────────────────────────────────────────
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setWorkflowTitle: (title) => set({ workflowTitle: title }),
  setIsSandboxOpen: (open) => set({ isSandboxOpen: open }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  loadTemplate: (templateId) => {
    const tpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    get()._snapshot();
    set({
      nodes: tpl.nodes as WorkflowNode[],
      edges: tpl.edges,
      workflowTitle: tpl.title,
      selectedNodeId: null,
    });
  },
}));
