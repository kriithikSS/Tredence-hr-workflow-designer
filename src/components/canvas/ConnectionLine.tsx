import type { ConnectionLineComponentProps } from '@xyflow/react';
import { getStraightPath } from '@xyflow/react';

/**
 * Custom connection line shown while the user is dragging a new edge.
 * Shows a dashed animated line with an arrowhead pointing at the cursor.
 */
export function ConnectionLine({
  fromX, fromY, toX, toY,
}: ConnectionLineComponentProps) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Offset the tip slightly so the arrowhead sits at the cursor
  const tipX = toX - (dx / len) * 6;
  const tipY = toY - (dy / len) * 6;

  const [path] = getStraightPath({ sourceX: fromX, sourceY: fromY, targetX: tipX, targetY: tipY });

  return (
    <g>
      <defs>
        <marker
          id="conn-arrow"
          markerWidth="10" markerHeight="10"
          refX="6" refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6366F1" />
        </marker>
      </defs>

      {/* Glow trail */}
      <path
        d={path}
        fill="none"
        stroke="rgba(99,102,241,0.15)"
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* Main animated line */}
      <path
        d={path}
        fill="none"
        stroke="#6366F1"
        strokeWidth={2.5}
        strokeDasharray="6 4"
        strokeLinecap="round"
        markerEnd="url(#conn-arrow)"
        style={{ animation: 'dash-march 0.4s linear infinite' }}
      />

      {/* "+" circle at the cursor tip */}
      <circle cx={toX} cy={toY} r={10} fill="#6366F1" opacity={0.12} />
      <circle cx={toX} cy={toY} r={6}  fill="#6366F1" />
      <text
        x={toX} y={toY}
        textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={11} fontWeight={700}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >+</text>
    </g>
  );
}
