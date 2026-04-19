import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import type { EndNodeData } from '../../../types/nodes';

const schema = z.object({
  label:              z.string().min(1, 'Title is required'),
  endMessage:         z.string().min(1, 'End message is required'),
  sendSummary:        z.boolean(),
  summaryRecipients:  z.string(),
});

export function EndNodeForm({ nodeId, data }: { nodeId: string; data: EndNodeData }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label:             data.label,
      endMessage:        data.endMessage,
      sendSummary:       data.sendSummary,
      summaryRecipients: data.summaryRecipients,
    },
  });

  const sendSummary = watch('sendSummary');

  useEffect(() => {
    const sub = watch((value) => updateNodeData(nodeId, value as Partial<EndNodeData>));
    return () => sub.unsubscribe();
  }, [watch, nodeId, updateNodeData]);

  return (
    <form className="node-form">
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className={`form-input ${errors.label ? 'form-input--error' : ''}`}
          {...register('label')}
          placeholder="e.g. Onboarding Complete"
        />
        {errors.label && <span className="form-error">{errors.label.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Completion Message *</label>
        <textarea
          className="form-textarea"
          {...register('endMessage')}
          placeholder="Message shown when workflow completes..."
          rows={3}
        />
        {errors.endMessage && <span className="form-error">{errors.endMessage.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-toggle-label">
          <input type="checkbox" className="form-toggle-input" {...register('sendSummary')} />
          <span className="form-toggle-track" />
          <span className="form-toggle-text">Send summary email</span>
        </label>
      </div>

      {sendSummary && (
        <div className="form-group">
          <label className="form-label">Summary Recipients</label>
          <input
            className="form-input"
            {...register('summaryRecipients')}
            placeholder="e.g. hr@company.com, manager@company.com"
          />
          <span className="form-hint">Comma-separated email addresses</span>
        </div>
      )}
    </form>
  );
}
