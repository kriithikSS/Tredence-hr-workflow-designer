import { useState } from 'react';
import type { Edge } from '@xyflow/react';
import type { SimulationResult } from '../types/api';
import { useWorkflowStore } from './useWorkflowStore';
import type { WorkflowNode } from './useWorkflowStore';
import { useExecutionState } from './useExecutionState';
import { executeWorkflow } from '../engine/executionEngine';
import { registryExecutorMap } from '../registry/NodeRegistry';

interface ValidationError {
  type: 'missing_start' | 'missing_end' | 'no_outgoing' | 'no_incoming';
  message: string;
  nodeId?: string;
}

function validateGraph(nodes: WorkflowNode[], edges: Edge[]): ValidationError[] {
  const errs: ValidationError[] = [];
  const starts = nodes.filter((n) => n.type === 'start');
  const ends   = nodes.filter((n) => n.type === 'end');
  if (starts.length === 0) errs.push({ type: 'missing_start', message: 'Workflow must have a Start node.' });
  if (ends.length === 0)   errs.push({ type: 'missing_end',   message: 'Workflow must have an End node.' });
  nodes.forEach((n) => {
    const out = edges.some((e) => e.source === n.id);
    const inc = edges.some((e) => e.target === n.id);
    const lbl = (n.data as { label?: string }).label || n.id;
    if (n.type !== 'end'   && !out) errs.push({ type: 'no_outgoing', message: `"${lbl}" has no outgoing connection.`, nodeId: n.id });
    if (n.type !== 'start' && !inc) errs.push({ type: 'no_incoming', message: `"${lbl}" has no incoming connection.`, nodeId: n.id });
  });
  return errs;
}

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading]  = useState(false);
  const [errors,  setErrors]   = useState<ValidationError[]>([]);

  async function runSimulation(nodes: WorkflowNode[], edges: Edge[]) {
    // 1. Clear previous visual state
    useWorkflowStore.getState().clearAllNodeErrors();
    useExecutionState.getState().resetExecution();
    setResult(null);
    setErrors([]);

    // 2. Client-side validation
    const validationErrors = validateGraph(nodes, edges);
    setErrors(validationErrors);
    if (validationErrors.length > 0) {
      const byNode = new Map<string, string[]>();
      validationErrors.forEach((e) => {
        if (e.nodeId) byNode.set(e.nodeId, [...(byNode.get(e.nodeId) ?? []), e.message]);
      });
      byNode.forEach((msgs, id) =>
        useWorkflowStore.getState().updateNodeData(id, { validationErrors: msgs } as never)
      );
      return;
    }

    // 3. Run the real graph engine
    setLoading(true);
    useExecutionState.getState().setIsRunning(true);

    const { stepSpeed, approvalProbability } = useExecutionState.getState();
    const collectedSteps: SimulationResult['steps'] = [];

    try {
      const engine = executeWorkflow(nodes, edges, registryExecutorMap, {
        stepSpeed,
        approvalProbability,
      });

      for await (const step of engine) {
        const exec = useExecutionState.getState();

        if (step.status === 'executing') {
          exec.setActiveNode(step.nodeId);
          if (step.edgeId) exec.setActiveEdge(step.edgeId);
        } else if (step.status === 'completed' || step.status === 'failed' || step.status === 'skipped') {
          // Result step — update visual + collect for timeline
          if (step.status === 'completed') exec.markCompleted(step.nodeId);
          else if (step.status === 'failed') exec.markFailed(step.nodeId);
          exec.setActiveEdge(null);

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
      } // end for await

      const failed = collectedSteps.some((s) => s.status === 'failed');
      setResult({ status: failed ? 'failed' : 'completed', steps: collectedSteps });
    } catch (err) {
      setResult({ status: 'failed', steps: collectedSteps, error: String(err) });
    } finally {
      setLoading(false);
      useExecutionState.getState().setIsRunning(false);
      useExecutionState.getState().setActiveNode(null);
      useExecutionState.getState().setActiveEdge(null);
    }
  }

  function reset() {
    useWorkflowStore.getState().clearAllNodeErrors();
    useExecutionState.getState().resetExecution();
    setResult(null);
    setErrors([]);
  }

  return { result, loading, errors, runSimulation, reset };
}
