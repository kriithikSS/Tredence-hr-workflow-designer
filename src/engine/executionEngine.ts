import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '../hooks/useWorkflowStore';
import type { ExecutionStep, ExecutionContext, ExecuteResult } from './types';
import type { NodeExecutor } from './nodeExecutors';
import { defaultExecutor } from './nodeExecutors';
import { buildMaps, findStartNode } from './graphUtils';

export type ExecutorMap = Record<string, NodeExecutor>;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Core graph traversal engine.
 *
 * Algorithm: Iterative DFS starting from the Start node.
 *   - For each node: yield 'executing', await executor, yield result.
 *   - For Approval nodes: filter outgoing edges by sourceHandle matching the branch taken.
 *   - For failed nodes with onFailure='stop': halt traversal.
 *
 * Loop support:
 *   Instead of a binary visited Set (which would stop at the first back-edge),
 *   we use an executionCount Map. Each node may execute up to MAX_LOOP_ITERATIONS
 *   times. This lets rejection loops (Approval → Task → Approval) complete naturally.
 *   A global MAX_TOTAL_STEPS guard prevents runaway infinite loops.
 */
const MAX_LOOP_ITERATIONS = 3;  // max times a single node can execute
const MAX_TOTAL_STEPS     = 60; // hard safety cap across the whole run

export async function* executeWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
  executors: ExecutorMap,
  ctx: ExecutionContext,
): AsyncGenerator<ExecutionStep> {
  const { adjacency, nodeMap } = buildMaps(nodes, edges);
  const startNode = findStartNode(nodes);

  if (!startNode) {
    throw new Error('No Start node found in workflow.');
  }

  // executionCount[nodeId] = how many times this node has already run
  const executionCount = new Map<string, number>();
  let totalSteps = 0;

  // Stack entries: { nodeId, incomingEdgeId }
  const stack: { nodeId: string; edgeId?: string }[] = [{ nodeId: startNode.id }];

  while (stack.length > 0) {
    const { nodeId, edgeId } = stack.pop()!;

    const timesRun = executionCount.get(nodeId) ?? 0;

    // Prevent infinite loops per node
    if (timesRun >= MAX_LOOP_ITERATIONS) {
      const label = (nodeMap.get(nodeId)?.data as { label?: string })?.label ?? nodeId;
      yield {
        nodeId, nodeLabel: label, nodeType: nodeMap.get(nodeId)?.type ?? 'unknown',
        status: 'failed', durationMs: 0,
        error: `Loop limit reached: executed ${MAX_LOOP_ITERATIONS} times.`
      };
      continue;
    }

    // Hard cap to prevent runaway graphs
    if (totalSteps >= MAX_TOTAL_STEPS) {
      yield {
        nodeId, nodeLabel: 'System', nodeType: 'system',
        status: 'failed', durationMs: 0,
        error: `Max steps (${MAX_TOTAL_STEPS}) reached. Graph may be malformed.`
      };
      break;
    }

    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // Mark this execution
    executionCount.set(nodeId, timesRun + 1);
    totalSteps++;

    const label = (node.data as { label?: string }).label ?? nodeId;

    // ── Phase 1: Signal that this node is executing ──────────────────────
    yield {
      nodeId, nodeLabel: label, nodeType: node.type ?? '',
      status: 'executing', edgeId, durationMs: 0,
    };

    await delay(ctx.stepSpeed);

    // ── Phase 2: Execute the node ────────────────────────────────────────
    const executor = executors[node.type ?? ''] ?? defaultExecutor;
    const t0 = Date.now();
    let result: ExecuteResult;
    try {
      result = await executor(node.data, ctx);
    } catch (err) {
      result = { status: 'failed', error: String(err) };
    }
    const durationMs = Date.now() - t0;

    // ── Phase 3: Yield execution result ──────────────────────────────────
    yield {
      nodeId, nodeLabel: label, nodeType: node.type ?? '',
      status: result.status, branch: result.branch,
      output: result.output, error: result.error,
      edgeId, durationMs,
    };

    // ── Phase 4: Handle failure ──────────────────────────────────────────
    if (result.status === 'failed') {
      const d = node.data as { onFailure?: string };
      if (d.onFailure === 'stop' || node.type === 'end') break;
      // 'skip' or 'retry' → continue to next nodes anyway
    }

    // End node → stop traversal (don't enqueue anything after End)
    if (node.type === 'end') break;

    // ── Phase 5: Determine next nodes ────────────────────────────────────
    const outgoing = adjacency.get(nodeId) ?? [];
    let nextEdges = outgoing;

    // Approval branching: only traverse the branch that was taken
    if (node.type === 'approval' && result.branch) {
      const branched = outgoing.filter((e) => e.sourceHandle === result.branch);
      nextEdges = branched.length > 0 ? branched : outgoing;
    }

    // Push in reverse so left-most edge processes first (DFS stack order)
    for (let i = nextEdges.length - 1; i >= 0; i--) {
      const { targetId, edgeId: eid } = nextEdges[i];
      stack.push({ nodeId: targetId, edgeId: eid });
    }
  }
}
