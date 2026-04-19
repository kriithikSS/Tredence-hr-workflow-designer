import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { KeyValueEditor } from '../KeyValueEditor';
import type { TaskNodeData } from '../../../types/nodes';

const schema = z.object({
  label:        z.string().min(1, 'Title is required'),
  description:  z.string(),
  assignee:     z.string().min(1, 'Assignee is required'),
  dueDate:      z.string(),
  priority:     z.enum(['low', 'medium', 'high']),
  customFields: z.array(z.object({ key: z.string(), value: z.string() })),
});

export function TaskNodeForm({ nodeId, data }: { nodeId: string; data: TaskNodeData }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { register, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label:        data.label,
      description:  data.description,
      assignee:     data.assignee,
      dueDate:      data.dueDate,
      priority:     data.priority,
      customFields: data.customFields,
    },
  });

  const customFields = watch('customFields');

  useEffect(() => {
    const sub = watch((value) => updateNodeData(nodeId, value as Partial<TaskNodeData>));
    return () => sub.unsubscribe();
  }, [watch, nodeId, updateNodeData]);

  return (
    <form className="node-form">
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className={`form-input ${errors.label ? 'form-input--error' : ''}`}
          {...register('label')}
          placeholder="e.g. Collect Documents"
        />
        {errors.label && <span className="form-error">{errors.label.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" {...register('description')} placeholder="Describe this task..." rows={3} />
      </div>

      <div className="form-group">
        <label className="form-label">Assignee *</label>
        <input
          className={`form-input ${errors.assignee ? 'form-input--error' : ''}`}
          {...register('assignee')}
          placeholder="e.g. HR Admin, Manager"
        />
        {errors.assignee && <span className="form-error">{errors.assignee.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          className="form-input"
          {...register('dueDate')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Priority</label>
        <div className="form-radio-group">
          {(['low', 'medium', 'high'] as const).map((p) => (
            <label key={p} className="form-radio-label">
              <input type="radio" value={p} {...register('priority')} />
              <span className={`priority-badge priority-badge--${p}`}>{p}</span>
            </label>
          ))}
        </div>
      </div>

      <KeyValueEditor
        label="Custom Fields"
        value={customFields || []}
        onChange={(pairs) => setValue('customFields', pairs)}
      />
    </form>
  );
}
