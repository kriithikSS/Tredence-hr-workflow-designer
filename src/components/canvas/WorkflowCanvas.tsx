import { useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, useReactFlow, ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { CustomEdge } from './CustomEdge';
import { ConnectionLine } from './ConnectionLine';
import { SimulationBanner } from './SimulationBanner';
import { registryNodeTypes } from '../../registry/NodeRegistry';
import { NodeRegistry } from '../../registry/NodeRegistry';
import { useTheme } from '../../hooks/useTheme';

// Stable module-level references
const edgeTypes = { custom: CustomEdge };
const DEFAULT_EDGE_OPTIONS = { type: 'custom', animated: false };

/**
 * SVG marker definitions injected once into the React Flow SVG defs.
 * Three variants: default (grey), selected/hover (indigo), active/engine (green).
 */
function EdgeMarkers() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <marker id="arrow-default"  markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#CBD5E1" />
        </marker>
        <marker id="arrow-selected" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#6366F1" />
        </marker>
        <marker id="arrow-active"   markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#22C55E" />
        </marker>
      </defs>
    </svg>
  );
}

export function WorkflowCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    setSelectedNode, addNode,
  } = useWorkflowStore();

  const { isDark } = useTheme();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type');
    if (!type || !NodeRegistry[type]) return;

    const bounds = reactFlowWrapper.current!.getBoundingClientRect();
    const position = screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });

    addNode({
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: NodeRegistry[type].defaultData,
    });
  }, [addNode, screenToFlowPosition]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div ref={reactFlowWrapper} className="canvas-wrapper">
      <EdgeMarkers />
      <SimulationBanner />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={registryNodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        connectionLineComponent={ConnectionLine}
        connectionLineStyle={{ strokeWidth: 0 }}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        elevateEdgesOnSelect
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.8}
          color={isDark ? '#2E3F58' : '#A8B8CC'}
        />
        <Controls showInteractive={false} className="canvas-controls" />
        <MiniMap
          nodeColor={(n) => {
            const def = NodeRegistry[n.type ?? ''];
            return def?.meta.color ?? '#64748B';
          }}
          maskColor="rgba(203,213,225,0.55)"
          className="canvas-minimap"
        />
      </ReactFlow>
    </div>
  );
}
