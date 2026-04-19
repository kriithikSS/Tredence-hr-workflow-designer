import { useState } from 'react';
import { Trash2, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useMockConfig } from '../../hooks/useMockConfig';

export function ApiLog() {
  const { logSnapshot, clearLog } = useMockConfig();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded((p) => (p === id ? null : id));

  const fmt = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="bs-log">
      <div className="bs-log__toolbar">
        <span className="bs-section-title">API Calls ({logSnapshot.length})</span>
        {logSnapshot.length > 0 && (
          <button className="bs-btn bs-btn--ghost bs-btn--xs" onClick={clearLog}>
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {logSnapshot.length === 0 ? (
        <div className="bs-log__empty">
          <p>No API calls yet.</p>
          <p>Run a simulation or open the Automated Step config panel to trigger calls.</p>
        </div>
      ) : (
        <div className="bs-log__list">
          {logSnapshot.map((entry) => (
            <div key={entry.id} className="bs-log-entry">
              <button className="bs-log-entry__row" onClick={() => toggle(entry.id)}>
                <span className="bs-log-entry__time">{fmt(entry.timestamp)}</span>
                <span className={`bs-log-entry__method bs-log-entry__method--${entry.method.toLowerCase()}`}>
                  {entry.method}
                </span>
                <span className="bs-log-entry__url">{entry.url}</span>
                <span className={`bs-log-entry__status ${entry.status >= 400 ? 'bs-log-entry__status--err' : ''}`}>
                  {entry.status >= 400
                    ? <XCircle size={13} />
                    : <CheckCircle2 size={13} />}
                  {entry.status}
                </span>
                <span className="bs-log-entry__dur">{entry.durationMs}ms</span>
                {expanded === entry.id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>

              {expanded === entry.id && (
                <div className="bs-log-entry__detail">
                  {entry.requestBody !== undefined && (
                    <div className="bs-log-json">
                      <span className="bs-log-json__label">Request</span>
                      <pre>{JSON.stringify(entry.requestBody, null, 2)}</pre>
                    </div>
                  )}
                  <div className="bs-log-json">
                    <span className="bs-log-json__label">Response</span>
                    <pre>{JSON.stringify(entry.responseBody, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
