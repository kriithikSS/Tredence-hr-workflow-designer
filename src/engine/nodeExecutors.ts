import type { WorkflowNodeData } from '../types/nodes';
import type { ExecuteResult, ExecutionContext } from './types';
import { useMockConfig } from '../hooks/useMockConfig';

export type NodeExecutor = (data: WorkflowNodeData, ctx: ExecutionContext) => Promise<ExecuteResult>;

export const startExecutor: NodeExecutor = async () => ({
  status: 'completed',
  output: { triggeredAt: new Date().toISOString() },
});

export const taskExecutor: NodeExecutor = async (data) => ({
  status: 'completed',
  output: { assignee: (data as { assignee?: string }).assignee || 'Unassigned' },
});

export const approvalExecutor: NodeExecutor = async (data, ctx) => {
  const d = data as { approverRole?: string; autoApproveThreshold?: number; useGlobalProbability?: boolean };
  
  // Follow global slider if useGlobalProbability is true or undefined (legacy nodes).
  // Otherwise, strictly follow the local threshold, even if it is 0.
  const prob = (d.useGlobalProbability !== false)
    ? ctx.approvalProbability
    : (d.autoApproveThreshold ?? 0) / 100;

  const approved = Math.random() < prob;
  return {
    status: 'completed',
    branch: approved ? 'approved' : 'rejected',
    output: {
      decision: approved ? 'Approved' : 'Rejected',
      approvedBy: d.approverRole ?? 'Manager',
    },
  };
};

export const automatedExecutor: NodeExecutor = async (data, ctx) => {
  const d = data as { actionId?: string; onFailure?: string };
  const mockConfig = useMockConfig.getState();

  // 1. Hard failure if forced in settings
  if (mockConfig.forceFullFailure) {
    return { status: 'failed', error: mockConfig.failureMessage || `Action "${d.actionId}" failed` };
  }

  // 2. Random failure based on the slider (Approval Probability = Success Probability)
  // If slider is 100%, random() > 1.0 is never true, so 0% chance of failure.
  // If slider is 80%, random() > 0.8 is true 20% of the time.
  if (d.onFailure === 'stop' && Math.random() > ctx.approvalProbability) {
    return { status: 'failed', error: `Action "${d.actionId}" failed: connection timeout` };
  }

  return {
    status: 'completed',
    output: { action: d.actionId, executedAt: new Date().toISOString() },
  };
};

export const endExecutor: NodeExecutor = async () => ({
  status: 'completed',
  output: { completedAt: new Date().toISOString() },
});

export const defaultExecutor: NodeExecutor = async () => ({ status: 'completed' });
