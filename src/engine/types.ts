export type ExecutionStatus = 'idle' | 'executing' | 'completed' | 'failed' | 'skipped';
export type ApprovalBranch = 'approved' | 'rejected';

export interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: ExecutionStatus;
  branch?: ApprovalBranch;
  output?: Record<string, unknown>;
  error?: string;
  durationMs: number;
  edgeId?: string;
}

export interface ExecutionContext {
  stepSpeed: number;          // ms delay between steps
  approvalProbability: number; // 0–1, chance of approval
}

export interface ExecuteResult {
  status: 'completed' | 'failed' | 'skipped';
  branch?: ApprovalBranch;
  output?: Record<string, unknown>;
  error?: string;
}
