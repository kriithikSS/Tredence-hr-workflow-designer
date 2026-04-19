import type { NodeProps } from '@xyflow/react';
import type { StartNodeData } from '../../types/nodes';
import { BaseNode } from './BaseNode';

export function StartNode({ id, data, selected }: NodeProps) {
  const d = data as StartNodeData;
  const triggerLabels = { manual: 'Manual trigger', scheduled: 'Scheduled', event: 'Event-based' };
  return (
    <BaseNode
      id={id}
      variant="start"
      label={d.label || 'Start'}
      subtitle={triggerLabels[d.triggerType] || 'Manual trigger'}
      selected={selected}
      validationErrors={d.validationErrors}
      showTargetHandle={false}
    />
  );
}
