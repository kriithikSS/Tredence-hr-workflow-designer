export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  key: string;
  value: string;
}

export type StartNodeData = {
  label: string;
  triggerType: 'manual' | 'scheduled' | 'event';
  metadata: KeyValuePair[];
  validationErrors?: string[];
};

export type TaskNodeData = {
  label: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  customFields: KeyValuePair[];
  validationErrors?: string[];
};

export type ApprovalNodeData = {
  label: string;
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'Custom';
  customRole?: string;
  useGlobalProbability?: boolean;
  autoApproveThreshold: number;
  rejectionLabel: string;
  validationErrors?: string[];
};

export type AutomatedStepNodeData = {
  label: string;
  actionId: string;
  actionParams: Record<string, string>;
  onFailure: 'retry' | 'skip' | 'stop';
  validationErrors?: string[];
};

export type EndNodeData = {
  label: string;
  endMessage: string;
  sendSummary: boolean;
  summaryRecipients: string;
  validationErrors?: string[];
};

export type WorkflowNodeData =
  | (StartNodeData & { type: 'start' })
  | (TaskNodeData & { type: 'task' })
  | (ApprovalNodeData & { type: 'approval' })
  | (AutomatedStepNodeData & { type: 'automated' })
  | (EndNodeData & { type: 'end' });
