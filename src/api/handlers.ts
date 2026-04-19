import { http, HttpResponse } from 'msw';
import { mockConfig, logApiCall } from './mockConfig';
import type { SimulateRequest } from '../types/api';

export const handlers = [
  // GET /api/automations — returns live action list from mockConfig
  http.get('/api/automations', () => {
    const t0 = Date.now();
    const body = mockConfig.actions.map(({ id, label, params }) => ({ id, label, params }));
    logApiCall({
      timestamp: new Date().toISOString(),
      method: 'GET',
      url: '/api/automations',
      status: 200,
      durationMs: Date.now() - t0,
      responseBody: body,
    });
    return HttpResponse.json(body);
  }),

  // POST /api/simulate — respects delay, success rate, and force-fail from mockConfig
  http.post('/api/simulate', async ({ request }) => {
    const t0 = Date.now();
    const body = await request.json() as SimulateRequest;

    await new Promise((r) => setTimeout(r, mockConfig.simulateDelayMs));

    if (mockConfig.forceFullFailure) {
      const res = { status: 'failed', steps: [], error: mockConfig.failureMessage };
      logApiCall({ timestamp: new Date().toISOString(), method: 'POST', url: '/api/simulate', status: 500, durationMs: Date.now() - t0, requestBody: { nodes: body.nodes.length, edges: body.edges.length }, responseBody: res });
      return HttpResponse.json(res, { status: 500 });
    }

    const steps = body.nodes.map((node, i) => ({
      nodeId: node.id,
      type: node.type,
      label: node.label,
      status: (Math.random() < mockConfig.stepSuccessRate ? 'completed' : 'failed') as 'completed' | 'failed',
      duration: i === 0 || node.type === 'end' ? 0 : node.type === 'automated' ? 300 : 700,
    }));

    const res = { status: steps.some((s) => s.status === 'failed') ? 'failed' : 'completed', steps };
    logApiCall({ timestamp: new Date().toISOString(), method: 'POST', url: '/api/simulate', status: 200, durationMs: Date.now() - t0, requestBody: { nodes: body.nodes.length, edges: body.edges.length }, responseBody: { status: res.status, steps: steps.length } });
    return HttpResponse.json(res);
  }),
];
