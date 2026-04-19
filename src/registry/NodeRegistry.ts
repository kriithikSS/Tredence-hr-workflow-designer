import React from 'react';
import { PlayCircle, CheckSquare, ThumbsUp, Zap, StopCircle } from 'lucide-react';
import type { NodeProps } from '@xyflow/react';

import { StartNode } from '../components/nodes/StartNode';
import { TaskNode } from '../components/nodes/TaskNode';
import { ApprovalNode } from '../components/nodes/ApprovalNode';
import { AutomatedStepNode } from '../components/nodes/AutomatedStepNode';
import { EndNode } from '../components/nodes/EndNode';

import { StartNodeForm } from '../components/panels/forms/StartNodeForm';
import { TaskNodeForm } from '../components/panels/forms/TaskNodeForm';
import { ApprovalNodeForm } from '../components/panels/forms/ApprovalNodeForm';
import { AutomatedStepForm } from '../components/panels/forms/AutomatedStepForm';
import { EndNodeForm } from '../components/panels/forms/EndNodeForm';

import {
  startExecutor, taskExecutor, approvalExecutor,
  automatedExecutor, endExecutor,
} from '../engine/nodeExecutors';
import type { NodeExecutor } from '../engine/nodeExecutors';
import type { WorkflowNodeData } from '../types/nodes';

export interface NodeMeta {
  label: string;
  badge: string;
  color: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
  paletteGroup: 'Flow Control' | 'Human Steps' | 'System Steps';
}

export interface NodeDefinition {
  // Rendering
  component: React.ComponentType<NodeProps>;
  // Config panel form
  form: React.ComponentType<{ nodeId: string; data: WorkflowNodeData }>;
  // Metadata for palette + config panel header
  meta: NodeMeta;
  // Default data placed on canvas when dropped
  defaultData: WorkflowNodeData;
  // Engine executor
  execute: NodeExecutor;
}

/**
 * NodeRegistry — single source of truth for every node type.
 *
 * Adding a new node type = one entry here.
 * Everything else (canvas, palette, config panel, engine) derives from this.
 */
export const NodeRegistry: Record<string, NodeDefinition> = {
  start: {
    component: StartNode,
    form: StartNodeForm as React.ComponentType<{ nodeId: string; data: WorkflowNodeData }>,
    meta: {
      label: 'Start Node', badge: 'Start', color: '#22C55E',
      icon: PlayCircle, description: 'Workflow entry point',
      paletteGroup: 'Flow Control',
    },
    defaultData: { type: 'start', label: 'New Start', triggerType: 'manual', metadata: [] } as WorkflowNodeData,
    execute: startExecutor,
  },

  task: {
    component: TaskNode,
    form: TaskNodeForm as React.ComponentType<{ nodeId: string; data: WorkflowNodeData }>,
    meta: {
      label: 'Task Node', badge: 'Task', color: '#3B82F6',
      icon: CheckSquare, description: 'Human task assignment',
      paletteGroup: 'Human Steps',
    },
    defaultData: {
      type: 'task', label: 'New Task', description: '',
      assignee: '', dueDate: '', priority: 'medium', customFields: [],
    } as WorkflowNodeData,
    execute: taskExecutor,
  },

  approval: {
    component: ApprovalNode,
    form: ApprovalNodeForm as React.ComponentType<{ nodeId: string; data: WorkflowNodeData }>,
    meta: {
      label: 'Approval Node', badge: 'Approval', color: '#F59E0B',
      icon: ThumbsUp, description: 'Manager/HR approval step',
      paletteGroup: 'Human Steps',
    },
    defaultData: {
      type: 'approval', label: 'New Approval', approverRole: 'Manager',
      useGlobalProbability: true,
      autoApproveThreshold: 0, rejectionLabel: 'Rejected',
    } as WorkflowNodeData,
    execute: approvalExecutor,
  },

  automated: {
    component: AutomatedStepNode,
    form: AutomatedStepForm as React.ComponentType<{ nodeId: string; data: WorkflowNodeData }>,
    meta: {
      label: 'Automated Step', badge: 'Automated', color: '#8B5CF6',
      icon: Zap, description: 'System-triggered action',
      paletteGroup: 'System Steps',
    },
    defaultData: {
      type: 'automated', label: 'Automated Step',
      actionId: 'send_email', actionParams: {}, onFailure: 'retry',
    } as WorkflowNodeData,
    execute: automatedExecutor,
  },

  end: {
    component: EndNode,
    form: EndNodeForm as React.ComponentType<{ nodeId: string; data: WorkflowNodeData }>,
    meta: {
      label: 'End Node', badge: 'End', color: '#EF4444',
      icon: StopCircle, description: 'Workflow completion',
      paletteGroup: 'Flow Control',
    },
    defaultData: {
      type: 'end', label: 'End', endMessage: 'Workflow complete.',
      sendSummary: false, summaryRecipients: '',
    } as WorkflowNodeData,
    execute: endExecutor,
  },
};

// ── Derived maps used by consumers ──────────────────────────────────────────

/** React Flow nodeTypes object — derived from registry, defined at module level to be stable */
export const registryNodeTypes = Object.fromEntries(
  Object.entries(NodeRegistry).map(([type, def]) => [type, def.component]),
);

/** Executor map for the execution engine */
export const registryExecutorMap = Object.fromEntries(
  Object.entries(NodeRegistry).map(([type, def]) => [type, def.execute]),
);

/** Palette groups in display order */
export const PALETTE_GROUP_ORDER = ['Flow Control', 'Human Steps', 'System Steps'] as const;
