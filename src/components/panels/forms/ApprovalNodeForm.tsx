import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import type { ApprovalNodeData } from '../../../types/nodes';

const schema = z.object({
  label:                 z.string().min(1, 'Title is required'),
  approverRole:          z.enum(['Manager', 'HRBP', 'Director', 'Custom']),
  customRole:            z.string().optional(),
  useGlobalProbability:  z.boolean().optional(),
  autoApproveThreshold:  z.number().min(0).max(100),
  rejectionLabel:        z.string(),
});

export function ApprovalNodeForm({ nodeId, data }: { nodeId: string; data: ApprovalNodeData }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label:                data.label,
      approverRole:         data.approverRole,
      customRole:           data.customRole,
      useGlobalProbability: data.useGlobalProbability ?? true,
      autoApproveThreshold: data.autoApproveThreshold,
      rejectionLabel:       data.rejectionLabel,
    },
  });

  const approverRole = watch('approverRole');
  const useGlobalProbability = watch('useGlobalProbability');

  useEffect(() => {
    const sub = watch((value) => updateNodeData(nodeId, value as Partial<ApprovalNodeData>));
    return () => sub.unsubscribe();
  }, [watch, nodeId, updateNodeData]);

  return (
    <form className="node-form">
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className={`form-input ${errors.label ? 'form-input--error' : ''}`}
          {...register('label')}
          placeholder="e.g. Manager Sign-off"
        />
        {errors.label && <span className="form-error">{errors.label.message}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Approver Role</label>
        <select className="form-select" {...register('approverRole')}>
          <option value="Manager">Manager</option>
          <option value="HRBP">HRBP</option>
          <option value="Director">Director</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      {approverRole === 'Custom' && (
        <div className="form-group">
          <label className="form-label">Custom Role Name</label>
          <input className="form-input" {...register('customRole')} placeholder="e.g. Department Head" />
        </div>
      )}

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input 
          type="checkbox" 
          id="use-global" 
          {...register('useGlobalProbability')} 
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <label htmlFor="use-global" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
          Follow Global Slider
        </label>
      </div>

      {!useGlobalProbability && (
        <div className="form-group">
          <label className="form-label">
            Auto-Approve Threshold (%)
            <span className="form-hint">Set to 0 to force 100% rejection</span>
          </label>
          <input
            type="number"
            className="form-input"
            {...register('autoApproveThreshold', { valueAsNumber: true })}
            min={0}
            max={100}
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Rejection Path Label</label>
        <input className="form-input" {...register('rejectionLabel')} placeholder="e.g. Rejected — Return to HR" />
      </div>

      <div className="form-info-box">
        <span className="form-info-icon">ℹ</span>
        <span>Connect the <strong>Approved</strong> (left) and <strong>Rejected</strong> (right) output handles to different next steps.</span>
      </div>
    </form>
  );
}
