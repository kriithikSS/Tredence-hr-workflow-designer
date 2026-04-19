import { useState, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useExecutionState } from '../../hooks/useExecutionState';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';

export function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, label, selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const { activeEdgeId } = useExecutionState();
  const { setEdges } = useWorkflowStore();
  const isActive = activeEdgeId === id;

  const [hovered, setHovered]       = useState(false);
  const [editingLabel, setEditing]  = useState(false);
  const [labelDraft, setLabelDraft] = useState((label as string) ?? '');

  const showToolbar = (hovered || selected) && !isActive;

  const handleDelete = useCallback(() => {
    const current = useWorkflowStore.getState().edges;
    setEdges(current.filter((e) => e.id !== id));
  }, [id, setEdges]);

  const handleLabelSave = useCallback(() => {
    const current = useWorkflowStore.getState().edges;
    setEdges(current.map((e) => e.id === id ? { ...e, label: labelDraft } : e));
    setEditing(false);
  }, [id, labelDraft, setEdges]);

  const strokeColor  = isActive ? '#22C55E' : selected ? '#6366F1' : hovered ? '#6366F1' : '#CBD5E1';
  const strokeWidth  = isActive || selected || hovered ? 2.5 : 2;
  const markerSuffix = isActive ? 'active' : selected || hovered ? 'selected' : 'default';

  return (
    <>
      {/* Invisible wide hit-area so edge is easy to hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: '6 3',
          filter: isActive
            ? 'drop-shadow(0 0 6px rgba(34,197,94,0.6))'
            : selected || hovered
            ? 'drop-shadow(0 0 4px rgba(99,102,241,0.4))'
            : undefined,
          transition: 'stroke 0.2s, stroke-width 0.2s',
          pointerEvents: 'none',
        }}
        markerEnd={`url(#arrow-${markerSuffix})`}
      />

      {/* Travelling dot on active edge */}
      {isActive && (
        <circle r={5} fill="#22C55E" style={{ filter: 'drop-shadow(0 0 4px #22C55E)' }}>
          <animateMotion dur="0.6s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Edge label (always visible if set) */}
      {label && !editingLabel && (
        <EdgeLabelRenderer>
          <div
            className="edge-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              borderColor: selected ? '#6366F1' : undefined,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Floating edge toolbar — delete + edit label */}
      {showToolbar && (
        <EdgeLabelRenderer>
          <div
            className="edge-toolbar"
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {editingLabel ? (
              <div className="edge-toolbar__label-editor">
                <input
                  className="edge-label-input"
                  value={labelDraft}
                  autoFocus
                  onChange={(e) => setLabelDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLabelSave();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  placeholder="Edge label…"
                />
                <button className="edge-toolbar__btn edge-toolbar__btn--confirm" onClick={handleLabelSave}><Check size={11}/></button>
                <button className="edge-toolbar__btn" onClick={() => setEditing(false)}><X size={11}/></button>
              </div>
            ) : (
              <div className="edge-toolbar__actions">
                <button
                  className="edge-toolbar__btn edge-toolbar__btn--label"
                  onClick={() => { setLabelDraft((label as string) ?? ''); setEditing(true); }}
                  title="Edit label"
                >
                  <Edit2 size={11}/> {label ? 'Edit label' : 'Add label'}
                </button>
                <div className="edge-toolbar__divider" />
                <button
                  className="edge-toolbar__btn edge-toolbar__btn--delete"
                  onClick={handleDelete}
                  title="Delete edge"
                >
                  <Trash2 size={11}/> Delete
                </button>
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
