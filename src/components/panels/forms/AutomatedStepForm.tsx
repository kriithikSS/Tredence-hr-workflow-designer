import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { useAutomations } from '../../../hooks/useAutomations';
import type { AutomatedStepNodeData } from '../../../types/nodes';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  label:        z.string().min(1, 'Title is required'),
  actionId:     z.string().min(1, 'Action is required'),
  actionParams: z.record(z.string(), z.string()),
  onFailure:    z.enum(['retry', 'skip', 'stop']),
});

export function AutomatedStepForm({ nodeId, data }: { nodeId: string; data: AutomatedStepNodeData }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { automations, loading } = useAutomations();
  const { register, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label:        data.label,
      actionId:     data.actionId,
      actionParams: data.actionParams,
      onFailure:    data.onFailure,
    },
  });

  const actionId     = watch('actionId');
  const actionParams = watch('actionParams');
  const selectedAction = automations.find((a) => a.id === actionId);

  useEffect(() => {
    const sub = watch((value) => updateNodeData(nodeId, value as Partial<AutomatedStepNodeData>));
    return () => sub.unsubscribe();
  }, [watch, nodeId, updateNodeData]);

  if (loading) {
    return (
      <div className="form-loading">
        <Loader2 size={20} className="spin" />
        <span>Loading actions...</span>
      </div>
    );
  }

  return (
    <form className="node-form">
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className={`form-input ${errors.label ? 'form-input--error' : ''}`}
          {...register('label')}
          placeholder="e.g. Send Welcome Email"
        />
        {errors.label && <span className="form-error">{errors.label.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Action *</label>
        <select
          className={`form-select ${errors.actionId ? 'form-input--error' : ''}`}
          {...register('actionId')}
        >
          <option value="">Select an action...</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
        {errors.actionId && <span className="form-error">{errors.actionId.message}</span>}
      </div>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="form-group">
          <label className="form-label">Action Parameters</label>
          <div className="action-params">
            {selectedAction.params.map((param) => (
              <div key={param} className="form-group">
                <label className="form-label form-label--sm">{param}</label>
                <input
                  className="form-input form-input--sm"
                  value={actionParams?.[param] || ''}
                  onChange={(e) =>
                    setValue('actionParams', { ...actionParams, [param]: e.target.value })
                  }
                  placeholder={`Enter ${param}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">On Failure</label>
        <select className="form-select" {...register('onFailure')}>
          <option value="retry">Retry</option>
          <option value="skip">Skip</option>
          <option value="stop">Stop workflow</option>
        </select>
      </div>
    </form>
  );
}
