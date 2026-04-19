import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { ApprovalNodeData } from '../../types/nodes';
import { BaseNode } from './BaseNode';

export function ApprovalNode({ id, data, selected }: NodeProps) {
  const d = data as ApprovalNodeData;
  const roleLabel = d.approverRole === 'Custom' ? (d.customRole || 'Custom') : d.approverRole;

  return (
    <BaseNode
      id={id}
      variant="approval"
      label={d.label || 'Approval'}
      subtitle={roleLabel}
      selected={selected}
      validationErrors={d.validationErrors}
      showSourceHandle={false}
    >
      {d.autoApproveThreshold > 0 && (
        <div className="node-meta-row">
          <span className="node-chip node-chip--amber">Auto @ {d.autoApproveThreshold}%</span>
        </div>
      )}

      {/* Dual output labels + handles */}
      <div className="approval-handles">
        <span className="approval-handle-label approval-handle-label--approved">✓ Approved</span>
        <span className="approval-handle-label approval-handle-label--rejected">✗ {d.rejectionLabel || 'Rejected'}</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="approved"
        style={{ left: '30%', background: '#22C55E', borderColor: '#16A34A', width: 10, height: 10 }}
        className="node-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        style={{ left: '70%', background: '#EF4444', borderColor: '#DC2626', width: 10, height: 10 }}
        className="node-handle"
      />
    </BaseNode>
  );
}
