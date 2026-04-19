import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { KeyValueEditor } from '../KeyValueEditor';
import type { StartNodeData } from '../../../types/nodes';

const schema = z.object({
  label:       z.string().min(1, 'Title is required'),
  triggerType: z.enum(['manual', 'scheduled', 'event']),
  metadata:    z.array(z.object({ key: z.string(), value: z.string() })),
});

export function StartNodeForm({ nodeId, data }: { nodeId: string; data: StartNodeData }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label:       data.label,
      triggerType: data.triggerType,
      metadata:    data.metadata,
    },
  });

  const metadata = watch('metadata');

  // Live sync to store
  useEffect(() => {
    const sub = watch((value) => {
      updateNodeData(nodeId, value as Partial<StartNodeData>);
    });
    return () => sub.unsubscribe();
  }, [watch, nodeId, updateNodeData]);

  return (
    <form className="node-form" onSubmit={handleSubmit(() => {})}>
      <div className="form-group">
        <label className="form-label">Start Title *</label>
        <input
          className={`form-input ${errors.label ? 'form-input--error' : ''}`}
          {...register('label')}
          placeholder="e.g. New Hire Onboarding"
        />
        {errors.label && <span className="form-error">{errors.label.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Trigger Type</label>
        <select className="form-select" {...register('triggerType')}>
          <option value="manual">Manual</option>
          <option value="scheduled">Scheduled</option>
          <option value="event">Event-based</option>
        </select>
      </div>

      <KeyValueEditor
        label="Metadata"
        value={metadata || []}
        onChange={(pairs) => setValue('metadata', pairs)}
      />
    </form>
  );
}
