/** Shared mutable singleton read by MSW handlers at request time */

export interface AutomationActionConfig {
  id: string;
  label: string;
  params: string[];
  isBuiltIn: boolean;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST';
  url: string;
  status: number;
  durationMs: number;
  requestBody?: unknown;
  responseBody?: unknown;
}

export const BUILT_IN_ACTIONS: AutomationActionConfig[] = [
  { id: 'send_email',    label: 'Send Email',         params: ['to', 'subject', 'body'],          isBuiltIn: true },
  { id: 'generate_doc',  label: 'Generate Document',  params: ['template', 'recipient'],          isBuiltIn: true },
  { id: 'slack_notify',  label: 'Slack Notification', params: ['channel', 'message'],             isBuiltIn: true },
  { id: 'update_hris',   label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'],   isBuiltIn: true },
  { id: 'create_ticket', label: 'Create IT Ticket',   params: ['system', 'category'],             isBuiltIn: true },
  { id: 'schedule_meet', label: 'Schedule Meeting',   params: ['attendees', 'duration'],          isBuiltIn: true },
];

export interface MockConfigShape {
  actions: AutomationActionConfig[];
  simulateDelayMs: number;
  stepSuccessRate: number;   // 0–1
  forceFullFailure: boolean;
  failureMessage: string;
}

/** Mutable singleton — handlers read this on every request */
export const mockConfig: MockConfigShape = {
  actions: [...BUILT_IN_ACTIONS],
  simulateDelayMs: 800,
  stepSuccessRate: 1.0,
  forceFullFailure: false,
  failureMessage: 'Simulation failed',
};

/** Live log of API calls */
export const apiLog: ApiLogEntry[] = [];
const logSubscribers: Array<() => void> = [];

export function subscribeToApiLog(cb: () => void): () => void {
  logSubscribers.push(cb);
  return () => {
    const i = logSubscribers.indexOf(cb);
    if (i !== -1) logSubscribers.splice(i, 1);
  };
}

export function logApiCall(entry: Omit<ApiLogEntry, 'id'>): void {
  apiLog.unshift({ ...entry, id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` });
  if (apiLog.length > 100) apiLog.length = 100;
  logSubscribers.forEach((cb) => cb());
}
