import type { NodeProps } from '@xyflow/react';
import type { EndNodeData } from '../../types/nodes';
import { BaseNode } from './BaseNode';

export function EndNode({ id, data, selected }: NodeProps) {
  const d = data as EndNodeData;
  return (
    <BaseNode
      id={id}
      variant="end"
      label={d.label || 'End'}
      subtitle={d.endMessage}
      selected={selected}
      validationErrors={d.validationErrors}
      showSourceHandle={false}
    >
      {d.sendSummary && (
        <div className="node-meta-row">
          <span className="node-chip node-chip--green">✉ Summary</span>
          {d.summaryRecipients && (
            <span className="node-chip">{d.summaryRecipients.split(',')[0].trim()}</span>
          )}
        </div>
      )}
    </BaseNode>
  );
}
