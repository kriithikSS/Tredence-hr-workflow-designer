/**
 * Standalone simulation runner — can be called from any component (toolbar, panel, etc.)
 * Does NOT use React hooks, reads/writes stores directly via .getState()
 *
 * Flow:
 *  1. Clear previous state
 *  2. Validate graph → stamp errors on nodes if invalid
 *  3. Run engine (yields steps → canvas visualises live)
 *  4. Store result in useExecutionState
 *  5. Open sandbox panel
 */

import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '../hooks/useWorkflowStore';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { useExecutionState } from '../hooks/useExecutionState';
import { executeWorkflow } from './executionEngine';
import { registryExecutorMap } from '../registry/NodeRegistry';
import type { SimulationResult } from '../types/api';

interface ValidationError { message: string; nodeId?: string; }

function validateGraph(nodes: WorkflowNode[], edges: Edge[]): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!nodes.some((n) => n.type === 'start')) errs.push({ message: 'Workflow must have a Start node.' });
  if (!nodes.some((n) => n.type === 'end'))   errs.push({ message: 'Workflow must have an End node.' });
  nodes.forEach((n) => {
    const lbl = (n.data as { label?: string }).label || n.id;
    if (n.type !== 'end'   && !edges.some((e) => e.source === n.id))
      errs.push({ message: `"${lbl}" has no outgoing connection.`, nodeId: n.id });
    if (n.type !== 'start' && !edges.some((e) => e.target === n.id))
      errs.push({ message: `"${lbl}" has no incoming connection.`, nodeId: n.id });
  });
  return errs;
}

export async function runWorkflowSimulation(): Promise<void> {
  const wfStore = useWorkflowStore.getState();
  const exStore = useExecutionState.getState();

  const { nodes, edges } = wfStore;

  // 1. Clear previous visual state (preserve slider settings)
  wfStore.clearAllNodeErrors();
  exStore.clearResults();

  // 2. Validate
  const validationErrors = validateGraph(nodes, edges);
  if (validationErrors.length > 0) {
    exStore.setSimulationErrors(validationErrors);
    // Stamp errors on nodes
    const byNode = new Map<string, string[]>();
    validationErrors.forEach((e) => {
      if (e.nodeId) byNode.set(e.nodeId, [...(byNode.get(e.nodeId) ?? []), e.message]);
    });
    byNode.forEach((msgs, id) =>
      wfStore.updateNodeData(id, { validationErrors: msgs } as never)
    );
    // Open panel to show errors
    wfStore.setIsSandboxOpen(true);
    return;
  }

  // 3. Run engine — canvas visualises live, panel stays CLOSED
  exStore.setIsRunning(true);
  const { stepSpeed, approvalProbability } = exStore; // user's current slider values

  const collectedSteps: SimulationResult['steps'] = [];

  try {
    const engine = executeWorkflow(nodes, edges, registryExecutorMap, {
      stepSpeed,
      approvalProbability,
    });

    for await (const step of engine) {
      const ex = useExecutionState.getState();
      if (step.status === 'executing') {
        ex.setActiveNode(step.nodeId);
        if (step.edgeId) ex.setActiveEdge(step.edgeId);
      } else if (
        step.status === 'completed' ||
        step.status === 'failed' ||
        step.status === 'skipped'
      ) {
        if (step.status === 'completed') ex.markCompleted(step.nodeId);
        else if (step.status === 'failed') ex.markFailed(step.nodeId);
        ex.setActiveEdge(null);

        collectedSteps.push({
          nodeId:   step.nodeId,
          label:    step.nodeLabel,
          type:     step.nodeType,
          status:   step.status,
          duration: step.durationMs + stepSpeed,
          branch:   step.branch,
          output:   step.output,
          error:    step.error,
        });
      }
    }

    const failed = collectedSteps.some((s) => s.status === 'failed');
    useExecutionState.getState().setSimulationResult({
      status: failed ? 'failed' : 'completed',
      steps: collectedSteps,
    });
  } catch (err) {
    useExecutionState.getState().setSimulationResult({
      status: 'failed',
      steps: collectedSteps,
      error: String(err),
    });
  } finally {
    useExecutionState.getState().setIsRunning(false);
    useExecutionState.getState().setActiveNode(null);
    useExecutionState.getState().setActiveEdge(null);
    // 4. NOW open the sandbox panel to show results
    useWorkflowStore.getState().setIsSandboxOpen(true);
  }
}
