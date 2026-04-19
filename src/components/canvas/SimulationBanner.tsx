import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useExecutionState } from '../../hooks/useExecutionState';

/**
 * Floating banner shown INSIDE the canvas during/after simulation.
 * Sits at the top-center of the canvas area.
 */
export function SimulationBanner() {
  const { isRunning, simulationResult, activeNodeId } = useExecutionState();

  const isVisible = isRunning || !!simulationResult;
  const isDone    = !isRunning && !!simulationResult;
  const isSuccess = isDone && simulationResult?.status === 'completed';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`sim-banner ${isDone ? (isSuccess ? 'sim-banner--success' : 'sim-banner--fail') : 'sim-banner--running'}`}
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {!isDone && (
            <>
              <Loader2 size={15} className="spin" />
              <span>Simulation running{activeNodeId ? ` — executing node…` : '…'}</span>
            </>
          )}
          {isDone && isSuccess && (
            <>
              <CheckCircle2 size={15} />
              <span>Simulation complete — {simulationResult!.steps.length} steps executed</span>
            </>
          )}
          {isDone && !isSuccess && (
            <>
              <XCircle size={15} />
              <span>Simulation failed — opening results panel</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
