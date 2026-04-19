import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from '../types/nodes';

export type TWorkflowNode = Node<WorkflowNodeData>;

export interface WorkflowTemplate {
  id: string;
  title: string;
  nodes: TWorkflowNode[];
  edges: Edge[];
}

// Node height ~110px + 60px gap = 170px step. Approval node is taller (~150px) so gets 190px.
// All nodes centered at x=380 so they look balanced in the viewport.
const CX = 380;

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    title: 'Employee Onboarding',
    nodes: [
      { id: 's1',  type: 'start',     position: { x: CX, y: 40  }, data: { type: 'start',    label: 'New Hire Onboarding',  triggerType: 'manual', metadata: [] } },
      { id: 't1',  type: 'task',      position: { x: CX, y: 210 }, data: { type: 'task',     label: 'Collect Documents',    description: 'Gather required employee documents', assignee: 'HR Admin', dueDate: '', priority: 'high', customFields: [] } },
      { id: 'a1',  type: 'approval',  position: { x: CX, y: 390 }, data: { type: 'approval', label: 'Manager Sign-off',     approverRole: 'Manager', autoApproveThreshold: 90, rejectionLabel: 'Return to HR' } },
      { id: 'au1', type: 'automated', position: { x: CX, y: 590 }, data: { type: 'automated', label: 'Send Welcome Email',  actionId: 'send_email',  actionParams: { to: 'new.hire@company.com', subject: 'Welcome!' }, onFailure: 'retry' } },
      { id: 'au2', type: 'automated', position: { x: CX, y: 760 }, data: { type: 'automated', label: 'Update HRIS Record',  actionId: 'update_hris', actionParams: { field: 'status', value: 'active' }, onFailure: 'stop' } },
      { id: 'e1',  type: 'end',       position: { x: CX, y: 930 }, data: { type: 'end',      label: 'Onboarding Complete', endMessage: 'Employee successfully onboarded.', sendSummary: true, summaryRecipients: 'hr@company.com' } },
    ],
    edges: [
      { id: 'e1', source: 's1',  target: 't1',  animated: true, type: 'custom' },
      { id: 'e2', source: 't1',  target: 'a1',  animated: true, type: 'custom' },
      { id: 'e3', source: 'a1',  target: 'au1', animated: true, type: 'custom', sourceHandle: 'approved', label: 'Approved' },
      { id: 'e4', source: 'au1', target: 'au2', animated: true, type: 'custom' },
      { id: 'e5', source: 'au2', target: 'e1',  animated: true, type: 'custom' },
    ],
  },
  {
    id: 'leave',
    title: 'Leave Approval',
    nodes: [
      { id: 's1',  type: 'start',     position: { x: CX, y: 40  }, data: { type: 'start',    label: 'Leave Request Submitted', triggerType: 'event', metadata: [] } },
      { id: 't1',  type: 'task',      position: { x: CX, y: 210 }, data: { type: 'task',     label: 'Fill Leave Form', description: 'Employee completes the leave request form', assignee: 'Employee', dueDate: '', priority: 'medium', customFields: [] } },
      { id: 'a1',  type: 'approval',  position: { x: CX, y: 390 }, data: { type: 'approval', label: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0, rejectionLabel: 'Denied' } },
      { id: 'au1', type: 'automated', position: { x: CX, y: 590 }, data: { type: 'automated', label: 'Notify Employee', actionId: 'send_email', actionParams: { to: 'employee@company.com', subject: 'Leave Approved' }, onFailure: 'retry' } },
      { id: 'au2', type: 'automated', position: { x: CX, y: 760 }, data: { type: 'automated', label: 'Update Leave Balance', actionId: 'update_hris', actionParams: { field: 'leave_balance', value: '-1' }, onFailure: 'stop' } },
      { id: 'e1',  type: 'end',       position: { x: CX, y: 930 }, data: { type: 'end',      label: 'Leave Approved', endMessage: 'Leave request processed successfully.', sendSummary: false, summaryRecipients: '' } },
    ],
    edges: [
      { id: 'e1', source: 's1',  target: 't1',  animated: true, type: 'custom' },
      { id: 'e2', source: 't1',  target: 'a1',  animated: true, type: 'custom' },
      { id: 'e3', source: 'a1',  target: 'au1', animated: true, type: 'custom', sourceHandle: 'approved', label: 'Approved' },
      { id: 'e4', source: 'au1', target: 'au2', animated: true, type: 'custom' },
      { id: 'e5', source: 'au2', target: 'e1',  animated: true, type: 'custom' },
    ],
  },
  {
    id: 'document',
    title: 'Document Verification',
    nodes: [
      { id: 's1',  type: 'start',     position: { x: CX, y: 40  }, data: { type: 'start',    label: 'Document Submitted', triggerType: 'event', metadata: [] } },
      { id: 't1',  type: 'task',      position: { x: CX, y: 210 }, data: { type: 'task',     label: 'Upload Documents', description: 'Employee uploads required documents', assignee: 'Employee', dueDate: '', priority: 'high', customFields: [] } },
      { id: 'au1', type: 'automated', position: { x: CX, y: 380 }, data: { type: 'automated', label: 'Auto Verify Docs', actionId: 'generate_doc', actionParams: { template: 'verification', recipient: 'hr@company.com' }, onFailure: 'retry' } },
      { id: 'a1',  type: 'approval',  position: { x: CX, y: 550 }, data: { type: 'approval', label: 'HR Review', approverRole: 'HRBP', autoApproveThreshold: 0, rejectionLabel: 'Incomplete' } },
      { id: 'au2', type: 'automated', position: { x: CX, y: 750 }, data: { type: 'automated', label: 'Notify HR Systems', actionId: 'update_hris', actionParams: { field: 'docs_verified', value: 'true' }, onFailure: 'stop' } },
      { id: 'e1',  type: 'end',       position: { x: CX, y: 920 }, data: { type: 'end',      label: 'Verification Complete', endMessage: 'All documents verified.', sendSummary: true, summaryRecipients: 'hr@company.com' } },
    ],
    edges: [
      { id: 'e1', source: 's1',  target: 't1',  animated: true, type: 'custom' },
      { id: 'e2', source: 't1',  target: 'au1', animated: true, type: 'custom' },
      { id: 'e3', source: 'au1', target: 'a1',  animated: true, type: 'custom' },
      { id: 'e4', source: 'a1',  target: 'au2', animated: true, type: 'custom', sourceHandle: 'approved', label: 'Verified' },
      { id: 'e5', source: 'au2', target: 'e1',  animated: true, type: 'custom' },
    ],
  },
];
