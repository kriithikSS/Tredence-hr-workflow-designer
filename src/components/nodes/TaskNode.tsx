import type { NodeProps } from '@xyflow/react';
import type { TaskNodeData } from '../../types/nodes';
import { BaseNode } from './BaseNode';

const priorityColors: Record<string, string> = {
  high: '#EF4444', medium: '#F59E0B', low: '#22C55E',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function TaskNode({ id, data, selected }: NodeProps) {
  const d = data as TaskNodeData;
  return (
    <BaseNode
      id={id}
      variant="task"
      label={d.label || 'Task'}
      subtitle={d.assignee ? `Assignee: ${d.assignee}` : undefined}
      selected={selected}
      validationErrors={d.validationErrors}
    >
      <div className="node-meta-row">
        {d.dueDate && (
          <span className="node-chip node-chip--blue">📅 {formatDate(d.dueDate)}</span>
        )}
        {d.priority && (
          <span
            className="node-chip"
            style={{ color: priorityColors[d.priority], background: `${priorityColors[d.priority]}15` }}
          >
            {d.priority.toUpperCase()}
          </span>
        )}
      </div>
    </BaseNode>
  );
}
