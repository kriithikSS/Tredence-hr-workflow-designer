import { useMockConfig } from '../../hooks/useMockConfig';
import { useExecutionState } from '../../hooks/useExecutionState';

export function SimulateConfig() {
  const {
    simulateDelayMs, setSimulateDelayMs,
    forceFullFailure, setForceFullFailure,
    failureMessage, setFailureMessage,
  } = useMockConfig();

  const {
    stepSpeed, setStepSpeed,
    approvalProbability, setApprovalProbability,
  } = useExecutionState();

  const successPct  = Math.round(approvalProbability * 100);
  const delayLabel  = simulateDelayMs === 0 ? 'Instant' : `${simulateDelayMs}ms`;
  const speedLabel  = stepSpeed <= 300 ? 'Fast' : stepSpeed <= 800 ? 'Normal' : 'Slow';

  return (
    <div className="bs-config">

      {/* ── Canvas / Engine settings ── */}
      <p className="bs-config-section-heading">Engine Settings</p>

      <div className="bs-config-grid">

        <div className="bs-config-row">
          <div className="bs-config-row__header">
            <span className="bs-config-label">Step Speed</span>
            <span className="bs-config-value">{speedLabel} ({stepSpeed}ms)</span>
          </div>
          <input
            type="range" min={150} max={1500} step={50}
            value={stepSpeed}
            onChange={(e) => setStepSpeed(Number(e.target.value))}
            className="bs-slider"
          />
          <div className="bs-slider-ticks"><span>Fast (150ms)</span><span>Normal</span><span>Slow (1.5s)</span></div>
        </div>

        <div className="bs-config-row">
          <div className="bs-config-row__header">
            <span className="bs-config-label">Approval Probability</span>
            <span className="bs-config-value" style={{ color: successPct < 40 ? '#EF4444' : successPct < 70 ? '#D97706' : '#22C55E' }}>
              {successPct}% approved
            </span>
          </div>
          <input
            type="range" min={0} max={100} step={5}
            value={successPct}
            onChange={(e) => setApprovalProbability(Number(e.target.value) / 100)}
            className="bs-slider"
          />
          <div className="bs-slider-ticks"><span>Always reject</span><span>50/50</span><span>Always approve</span></div>
        </div>

      </div>

      {/* ── API / MSW settings ── */}
      <p className="bs-config-section-heading" style={{ marginTop: 20 }}>Mock API Settings</p>
      <p className="bs-config__intro">
        Controls how <code>POST /api/simulate</code> responds. Changes take effect on the next call.
      </p>

      <div className="bs-config-grid">

        <div className="bs-config-row">
          <div className="bs-config-row__header">
            <span className="bs-config-label">API Response Delay</span>
            <span className="bs-config-value">{delayLabel}</span>
          </div>
          <input
            type="range" min={0} max={3000} step={100}
            value={simulateDelayMs}
            onChange={(e) => setSimulateDelayMs(Number(e.target.value))}
            className="bs-slider"
          />
          <div className="bs-slider-ticks"><span>0ms</span><span>1.5s</span><span>3s</span></div>
        </div>

        <div className="bs-config-row bs-config-row--toggle">
          <div>
            <span className="bs-config-label">Force Full Failure</span>
            <p className="bs-config-sublabel">API returns 500 immediately, skipping all steps</p>
          </div>
          <button
            className={`bs-toggle ${forceFullFailure ? 'bs-toggle--on' : ''}`}
            onClick={() => setForceFullFailure(!forceFullFailure)}
          >
            <span className="bs-toggle__knob" />
          </button>
        </div>

        <div className="bs-config-row">
          <span className="bs-config-label">Error Message</span>
          <input
            className="bs-input bs-input--full"
            value={failureMessage}
            onChange={(e) => setFailureMessage(e.target.value)}
            placeholder="Error message when forced fail…"
            disabled={!forceFullFailure}
          />
        </div>

      </div>
    </div>
  );
}
