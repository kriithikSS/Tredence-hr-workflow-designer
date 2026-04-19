import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockConfig, BUILT_IN_ACTIONS, apiLog, subscribeToApiLog } from '../api/mockConfig';
import type { AutomationActionConfig, ApiLogEntry } from '../api/mockConfig';

interface MockConfigState {
  // ── Actions ────────────────────────────────────────────────────────
  actions: AutomationActionConfig[];
  addAction: (a: { id: string; label: string; params: string[] }) => void;
  updateAction: (id: string, patch: { label?: string; params?: string[] }) => void;
  deleteAction: (id: string) => void;

  // ── Simulate config ────────────────────────────────────────────────
  simulateDelayMs: number;
  stepSuccessRate: number;
  forceFullFailure: boolean;
  failureMessage: string;
  setSimulateDelayMs: (v: number) => void;
  setStepSuccessRate: (v: number) => void;
  setForceFullFailure: (v: boolean) => void;
  setFailureMessage: (v: string) => void;

  // ── API log (live, not persisted) ─────────────────────────────────
  logSnapshot: ApiLogEntry[];
  refreshLog: () => void;
  clearLog: () => void;

  // ── Panel state ────────────────────────────────────────────────────
  isBackendStudioOpen: boolean;
  setIsBackendStudioOpen: (v: boolean) => void;
}

function syncToMockConfig(state: Partial<MockConfigState>) {
  if (state.actions !== undefined)         mockConfig.actions = state.actions;
  if (state.simulateDelayMs !== undefined) mockConfig.simulateDelayMs = state.simulateDelayMs;
  if (state.stepSuccessRate !== undefined) mockConfig.stepSuccessRate = state.stepSuccessRate;
  if (state.forceFullFailure !== undefined) mockConfig.forceFullFailure = state.forceFullFailure;
  if (state.failureMessage !== undefined)  mockConfig.failureMessage = state.failureMessage;
}

export const useMockConfig = create<MockConfigState>()(
  persist(
    (set, get) => ({
      actions: [...BUILT_IN_ACTIONS],
      simulateDelayMs: 800,
      stepSuccessRate: 1.0,
      forceFullFailure: false,
      failureMessage: 'Simulation failed',
      logSnapshot: [],
      isBackendStudioOpen: false,

      addAction: (a) => {
        const next = [...get().actions, { ...a, isBuiltIn: false }];
        set({ actions: next });
        syncToMockConfig({ actions: next });
      },
      updateAction: (id, patch) => {
        const next = get().actions.map((ac) => ac.id === id ? { ...ac, ...patch } : ac);
        set({ actions: next });
        syncToMockConfig({ actions: next });
      },
      deleteAction: (id) => {
        const next = get().actions.filter((ac) => ac.isBuiltIn || ac.id !== id);
        set({ actions: next });
        syncToMockConfig({ actions: next });
      },

      setSimulateDelayMs: (v) => { set({ simulateDelayMs: v }); syncToMockConfig({ simulateDelayMs: v }); },
      setStepSuccessRate: (v) => { set({ stepSuccessRate: v }); syncToMockConfig({ stepSuccessRate: v }); },
      setForceFullFailure: (v) => { set({ forceFullFailure: v }); syncToMockConfig({ forceFullFailure: v }); },
      setFailureMessage: (v) => { set({ failureMessage: v }); syncToMockConfig({ failureMessage: v }); },

      refreshLog: () => set({ logSnapshot: [...apiLog] }),
      clearLog:   () => { apiLog.length = 0; set({ logSnapshot: [] }); },

      setIsBackendStudioOpen: (v) => set({ isBackendStudioOpen: v }),
    }),
    {
      name: 'hr-mock-config',
      partialize: (s) => ({
        actions: s.actions,
        simulateDelayMs: s.simulateDelayMs,
        stepSuccessRate: s.stepSuccessRate,
        forceFullFailure: s.forceFullFailure,
        failureMessage: s.failureMessage,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydrate, push persisted values into the live mockConfig singleton
        if (state) syncToMockConfig(state);
        // Subscribe to API log changes so logSnapshot stays fresh
        subscribeToApiLog(() => useMockConfig.getState().refreshLog());
      },
    },
  ),
);

// Subscribe immediately (in case onRehydrateStorage hasn't fired yet)
subscribeToApiLog(() => useMockConfig.getState().refreshLog());
