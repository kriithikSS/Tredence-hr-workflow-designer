import type { SimulationStepResult } from '../../types/api';
import { CheckCircle2, XCircle, SkipForward, Clock, GitBranch } from 'lucide-react';

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: '#22C55E', label: 'Passed' },
  failed:    { icon: XCircle,      color: '#EF4444', label: 'Failed' },
  skipped:   { icon: SkipForward,  color: '#94A3B8', label: 'Skipped' },
};

const TYPE_COLORS: Record<string, string> = {
  start:     '#22C55E',
  task:      '#3B82F6',
  approval:  '#F59E0B',
  automated: '#8B5CF6',
  end:       '#EF4444',
};

export function ExecutionLog({ steps }: { steps: SimulationStepResult[] }) {
  return (
    <div className="execution-log">
      {steps.map((step, i) => {
        const cfg   = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.completed;
        const Icon  = cfg.icon;
        const color = TYPE_COLORS[step.type] ?? '#64748B';

        return (
          <div key={`${step.nodeId}-${i}`} className="exec-step">
            {/* Vertical connector line */}
            {i < steps.length - 1 && <div className="exec-step__line" />}

            <div className="exec-step__dot" style={{ background: cfg.color, boxShadow: `0 0 0 4px ${cfg.color}20` }} />

            <div className="exec-step__card">
              <div className="exec-step__header">
                <span className="exec-step__badge" style={{ color, background: `${color}18` }}>
                  {step.type.toUpperCase()}
                </span>
                <span className="exec-step__name">{step.label}</span>

                {/* Branch indicator for approval nodes */}
                {step.branch && (
                  <span
                    className="exec-step__branch"
                    style={{
                      color: step.branch === 'approved' ? '#16A34A' : '#DC2626',
                      background: step.branch === 'approved' ? '#F0FDF4' : '#FEF2F2',
                    }}
                  >
                    <GitBranch size={10} />
                    {step.branch === 'approved' ? '✓ Approved' : '✗ Rejected'}
                  </span>
                )}
              </div>

              <div className="exec-step__footer">
                <span className="exec-step__status" style={{ color: cfg.color }}>
                  <Icon size={13} /> {cfg.label}
                </span>
                <span className="exec-step__duration">
                  <Clock size={11} /> {step.duration}ms
                </span>
              </div>

              {step.error && (
                <p className="exec-step__error">{step.error}</p>
              )}

              {step.output && Object.keys(step.output).length > 0 && (
                <div className="exec-step__output">
                  {Object.entries(step.output).map(([k, v]) => (
                    <span key={k} className="exec-step__output-item">
                      <b>{k}:</b> {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
