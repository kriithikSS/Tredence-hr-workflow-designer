import { create } from 'zustand';
import type { SimulationResult } from '../types/api';

interface ValidationErrorItem { message: string; nodeId?: string; }

export interface ExecutionVisualState {
  isRunning: boolean;
  activeNodeId: string | null;
  activeEdgeId: string | null;
  completedNodeIds: string[];
  failedNodeIds: string[];
  // ── User settings — NEVER reset between runs ──────────────────────
  stepSpeed: number;           // ms delay per step
  approvalProbability: number; // 0–1
  // ── Last simulation result — persists until next run ──────────────
  simulationResult: SimulationResult | null;
  simulationErrors: ValidationErrorItem[];
}

interface ExecutionActions {
  setActiveNode: (id: string | null) => void;
  setActiveEdge: (id: string | null) => void;
  markCompleted: (id: string) => void;
  markFailed: (id: string) => void;
  setIsRunning: (v: boolean) => void;
  setStepSpeed: (ms: number) => void;
  setApprovalProbability: (p: number) => void;
  setSimulationResult: (r: SimulationResult | null) => void;
  setSimulationErrors: (e: ValidationErrorItem[]) => void;
  /** Resets only the visual animation state — preserves user slider settings */
  resetExecution: () => void;
  /** Full reset including results (used by Re-run) */
  clearResults: () => void;
}

export const useExecutionState = create<ExecutionVisualState & ExecutionActions>((set) => ({
  // initial state
  isRunning: false,
  activeNodeId: null,
  activeEdgeId: null,
  completedNodeIds: [],
  failedNodeIds: [],
  stepSpeed: 700,
  approvalProbability: 0.8,
  simulationResult: null,
  simulationErrors: [],

  setActiveNode: (id) => set({ activeNodeId: id }),
  setActiveEdge: (id) => set({ activeEdgeId: id }),
  markCompleted: (id) => set((s) => ({ completedNodeIds: [...s.completedNodeIds, id], activeNodeId: null })),
  markFailed:    (id) => set((s) => ({ failedNodeIds:    [...s.failedNodeIds, id],    activeNodeId: null })),
  setIsRunning:  (v)  => set({ isRunning: v }),
  setStepSpeed:  (ms) => set({ stepSpeed: ms }),
  setApprovalProbability: (p) => set({ approvalProbability: p }),
  setSimulationResult:    (r) => set({ simulationResult: r }),
  setSimulationErrors:    (e) => set({ simulationErrors: e }),

  // ── Only clears animation state — stepSpeed & approvalProbability UNCHANGED ──
  resetExecution: () => set((s) => ({
    isRunning: false,
    activeNodeId: null,
    activeEdgeId: null,
    completedNodeIds: [],
    failedNodeIds: [],
    // intentionally NOT resetting: stepSpeed, approvalProbability
    simulationResult: s.simulationResult, // keep last result visible
    simulationErrors: s.simulationErrors,
  })),

  clearResults: () => set({
    isRunning: false,
    activeNodeId: null,
    activeEdgeId: null,
    completedNodeIds: [],
    failedNodeIds: [],
    simulationResult: null,
    simulationErrors: [],
  }),
}));
