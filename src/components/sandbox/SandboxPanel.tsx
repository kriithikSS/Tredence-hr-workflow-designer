import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, AlertTriangle, CheckCircle2, ChevronDown, Play, Zap } from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useExecutionState } from '../../hooks/useExecutionState';
import { useMockConfig } from '../../hooks/useMockConfig';
import { runWorkflowSimulation } from '../../engine/simulationRunner';
import { ExecutionLog } from './ExecutionLog';

export function SandboxPanel() {
  const { isSandboxOpen, setIsSandboxOpen } = useWorkflowStore();
  const { simulationResult, simulationErrors, stepSpeed, approvalProbability, clearResults } = useExecutionState();
  const { setIsBackendStudioOpen } = useMockConfig();

  const handleClose = () => setIsSandboxOpen(false);
  const handleRerun = () => { setIsSandboxOpen(false); clearResults(); runWorkflowSimulation(); };

  const speedLabel = stepSpeed <= 300 ? 'Fast' : stepSpeed <= 800 ? 'Normal' : 'Slow';

  const openStudio = () => {
    setIsSandboxOpen(false);
    setIsBackendStudioOpen(true);
  };

  return (
    <AnimatePresence>
      {isSandboxOpen && (
        <>
          <motion.div
            className="sandbox-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="sandbox-panel"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            {/* ── Header ── */}
            <div className="sandbox-header">
              <div className="sandbox-header__left">
                <div className="sandbox-drag-handle"><ChevronDown size={16} /></div>
                <div>
                  <h2 className="sandbox-title">Workflow Simulator</h2>
                  <p className="sandbox-subtitle">Real graph traversal — execution follows edges step by step</p>
                </div>
              </div>
              <div className="sandbox-header__actions">

                {/* Live settings pill — shows current values, click to open Backend Studio */}
                <button className="sandbox-settings-pill" onClick={openStudio} title="Open Backend Studio to change settings">
                  <Zap size={12} />
                  <span>{speedLabel}</span>
                  <span className="pill-dot" />
                  <span>{Math.round(approvalProbability * 100)}% approve</span>
                </button>

                {simulationResult && (
                  <button className="sandbox-btn sandbox-btn--ghost" onClick={handleRerun}>
                    <RotateCcw size={15} /> Re-run
                  </button>
                )}
                <button className="sandbox-close" onClick={handleClose}><X size={18} /></button>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="sandbox-body">

              {/* Validation errors */}
              {simulationErrors.length > 0 && (
                <div className="sandbox-errors">
                  <div className="sandbox-errors__header">
                    <AlertTriangle size={16} /><span>Validation Errors ({simulationErrors.length})</span>
                  </div>
                  <ul className="sandbox-errors__list">
                    {simulationErrors.map((e, i) => <li key={i}>{e.message}</li>)}
                  </ul>
                  <button className="sandbox-btn sandbox-btn--primary" style={{ marginTop: 12 }} onClick={handleRerun}>
                    <Play size={13} /> Fix &amp; Re-run
                  </button>
                </div>
              )}

              {/* Simulation results */}
              {simulationResult && (
                <div className="sandbox-results">
                  <div className={`sandbox-result-status ${simulationResult.status === 'completed' ? 'sandbox-result-status--success' : 'sandbox-result-status--error'}`}>
                    <CheckCircle2 size={18} />
                    <span>
                      Simulation {simulationResult.status === 'completed' ? 'Completed Successfully' : 'Failed'}
                    </span>
                    <span className="result-step-count">{simulationResult.steps.length} steps executed</span>
                  </div>
                  {simulationResult.error && <p className="sandbox-error-msg">{simulationResult.error}</p>}
                  <ExecutionLog steps={simulationResult.steps} />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
