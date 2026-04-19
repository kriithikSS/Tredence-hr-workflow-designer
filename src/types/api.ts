export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulateRequest {
  nodes: { id: string; type: string; label: string; data: Record<string, unknown> }[];
  edges: { id: string; source: string; target: string; label?: string }[];
}

export interface SimulationStepResult {
  nodeId: string;
  label: string;
  type: string;
  status: 'completed' | 'failed' | 'skipped';
  duration: number;
  branch?: 'approved' | 'rejected';
  output?: Record<string, unknown>;
  error?: string;
}

export interface SimulationResult {
  status: 'completed' | 'failed';
  steps: SimulationStepResult[];
  error?: string;
}
