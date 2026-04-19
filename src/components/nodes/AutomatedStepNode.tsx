import type { NodeProps } from '@xyflow/react';
import type { AutomatedStepNodeData } from '../../types/nodes';
import { BaseNode } from './BaseNode';

const ACTION_LABELS: Record<string, string> = {
  send_email:    '📧 Send Email',
  generate_doc:  '📄 Generate Doc',
  slack_notify:  '💬 Slack Notify',
  update_hris:   '🗄 Update HRIS',
  create_ticket: '🎫 Create Ticket',
  schedule_meet: '📅 Schedule Meet',
};

const FAIL_COLORS: Record<string, string> = {
  retry: '#16A34A', skip: '#D97706', stop: '#DC2626',
};

export function AutomatedStepNode({ id, data, selected }: NodeProps) {
  const d = data as AutomatedStepNodeData;
  const actionLabel = ACTION_LABELS[d.actionId] || `⚡ ${d.actionId}`;
  const failColor = FAIL_COLORS[d.onFailure] ?? '#94A3B8';

  return (
    <BaseNode
      id={id}
      variant="automated"
      label={d.label || 'Automated Step'}
      selected={selected}
      validationErrors={d.validationErrors}
    >
      <div className="node-meta-row">
        <span className="node-chip node-chip--violet">{actionLabel}</span>
        <span className="node-chip" style={{ color: failColor, background: `${failColor}15` }}>
          {d.onFailure}
        </span>
      </div>
    </BaseNode>
  );
}
