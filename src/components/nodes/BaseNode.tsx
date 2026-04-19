import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  PlayCircle, CheckSquare, ThumbsUp, Zap, StopCircle,
  AlertTriangle, X, CheckCircle2,
} from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useExecutionState } from '../../hooks/useExecutionState';

export type NodeVariant = 'start' | 'task' | 'approval' | 'automated' | 'end';

interface BaseNodeProps {
  id: string;
  variant: NodeVariant;
  label: string;
  subtitle?: string;
  selected?: boolean;
  validationErrors?: string[];
  children?: React.ReactNode;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
}

const VARIANT_CONFIG: Record<NodeVariant, {
  color: string; bg: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
}> = {
  start:     { color: '#22C55E', bg: '#F0FDF4', icon: PlayCircle,  badge: 'Start' },
  task:      { color: '#3B82F6', bg: '#EFF6FF', icon: CheckSquare, badge: 'Task' },
  approval:  { color: '#F59E0B', bg: '#FFFBEB', icon: ThumbsUp,    badge: 'Approval' },
  automated: { color: '#8B5CF6', bg: '#F5F3FF', icon: Zap,         badge: 'Automated' },
  end:       { color: '#EF4444', bg: '#FEF2F2', icon: StopCircle,  badge: 'End' },
};

export function BaseNode({
  id, variant, label, subtitle, selected,
  validationErrors, children,
  showSourceHandle = true, showTargetHandle = true,
}: BaseNodeProps) {
  const { color, bg, icon: Icon, badge } = VARIANT_CONFIG[variant];
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  // ── Execution visual state ───────────────────────────────────────────────
  const { activeNodeId, completedNodeIds, failedNodeIds, isRunning } = useExecutionState();
  const isActive    = isRunning && activeNodeId === id;
  const isCompleted = completedNodeIds.includes(id);
  const isFailed    = failedNodeIds.includes(id);

  const hasErrors = validationErrors && validationErrors.length > 0;

  return (
    <div
      className={[
        'base-node',
        selected    ? 'base-node--selected'  : '',
        hasErrors   ? 'base-node--error'     : '',
        isActive    ? 'base-node--active'    : '',
        isCompleted ? 'base-node--completed' : '',
        isFailed    ? 'base-node--failed'    : '',
      ].filter(Boolean).join(' ')}
      style={{ '--node-color': color, '--node-bg': bg } as React.CSSProperties}
    >
      {showTargetHandle && (
        <Handle type="target" position={Position.Top} className="node-handle" />
      )}

      <div className="node-type-bar" style={{ background: color }} />

      {/* Execution status overlay icon */}
      {(isCompleted || isFailed) && (
        <div className={`node-status-overlay ${isFailed ? 'node-status-overlay--fail' : ''}`}>
          {isFailed
            ? <AlertTriangle size={14} />
            : <CheckCircle2 size={14} />}
        </div>
      )}

      <div className="node-header">
        <div className="node-icon" style={{ background: `${color}20`, color }}>
          <Icon size={16} />
        </div>
        <div className="node-title-group">
          <span className="node-badge" style={{ color, background: `${color}15` }}>{badge}</span>
          <h3 className="node-label">{label}</h3>
          {subtitle && <p className="node-subtitle">{subtitle}</p>}
        </div>
        <button
          className="node-delete-btn"
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          title="Remove node"
        >
          <X size={14} />
        </button>
      </div>

      {children && <div className="node-body">{children}</div>}

      {hasErrors && (
        <div className="node-errors">
          <AlertTriangle size={12} />
          <span>{validationErrors![0]}</span>
        </div>
      )}

      {showSourceHandle && (
        <Handle type="source" position={Position.Bottom} className="node-handle" />
      )}
    </div>
  );
}
