import { useState } from 'react';
import { Lock, Trash2, Plus, Check, X, Edit2 } from 'lucide-react';
import { useMockConfig } from '../../hooks/useMockConfig';

export function ActionsEditor() {
  const { actions, addAction, updateAction, deleteAction } = useMockConfig();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', label: '', params: '' });
  const [editForm, setEditForm] = useState({ label: '', params: '' });

  const handleAdd = () => {
    if (!form.id.trim() || !form.label.trim()) return;
    addAction({
      id: form.id.trim().toLowerCase().replace(/\s+/g, '_'),
      label: form.label.trim(),
      params: form.params.split(',').map((p) => p.trim()).filter(Boolean),
    });
    setForm({ id: '', label: '', params: '' });
    setAdding(false);
  };

  const handleEdit = (id: string) => {
    const ac = actions.find((a) => a.id === id);
    if (!ac) return;
    setEditingId(id);
    setEditForm({ label: ac.label, params: ac.params.join(', ') });
  };

  const handleEditSave = (id: string) => {
    updateAction(id, {
      label: editForm.label.trim(),
      params: editForm.params.split(',').map((p) => p.trim()).filter(Boolean),
    });
    setEditingId(null);
  };

  return (
    <div className="bs-actions">
      <div className="bs-actions__header">
        <span className="bs-section-title">Automation Actions</span>
        <button className="bs-add-btn" onClick={() => setAdding(true)}>
          <Plus size={13} /> Add Action
        </button>
      </div>

      {adding && (
        <div className="bs-action-form">
          <input className="bs-input" placeholder="action_id" value={form.id}     onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} />
          <input className="bs-input" placeholder="Label"     value={form.label}  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <input className="bs-input" placeholder="params (comma-separated)" value={form.params} onChange={(e) => setForm((f) => ({ ...f, params: e.target.value }))} />
          <div className="bs-action-form__btns">
            <button className="bs-btn bs-btn--primary" onClick={handleAdd}><Check size={13}/> Save</button>
            <button className="bs-btn bs-btn--ghost" onClick={() => setAdding(false)}><X size={13}/> Cancel</button>
          </div>
        </div>
      )}

      <div className="bs-action-list">
        {actions.map((ac) => (
          <div key={ac.id} className="bs-action-row">
            <div className="bs-action-row__icon">
              {ac.isBuiltIn ? <Lock size={12} color="#94A3B8" /> : <Edit2 size={12} color="#8B5CF6" />}
            </div>

            {editingId === ac.id ? (
              <div className="bs-action-edit">
                <input className="bs-input bs-input--sm" value={editForm.label}  onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))} />
                <input className="bs-input bs-input--sm" value={editForm.params} onChange={(e) => setEditForm((f) => ({ ...f, params: e.target.value }))} placeholder="params"/>
                <button className="bs-btn bs-btn--primary bs-btn--xs" onClick={() => handleEditSave(ac.id)}><Check size={11}/></button>
                <button className="bs-btn bs-btn--ghost bs-btn--xs"   onClick={() => setEditingId(null)}><X size={11}/></button>
              </div>
            ) : (
              <div className="bs-action-info">
                <code className="bs-action-id">{ac.id}</code>
                <span className="bs-action-label">{ac.label}</span>
                <span className="bs-action-params">{ac.params.join(', ') || '—'}</span>
              </div>
            )}

            {!ac.isBuiltIn && editingId !== ac.id && (
              <div className="bs-action-row__controls">
                <button className="bs-icon-btn" onClick={() => handleEdit(ac.id)} title="Edit"><Edit2 size={13}/></button>
                <button className="bs-icon-btn bs-icon-btn--danger" onClick={() => deleteAction(ac.id)} title="Delete"><Trash2 size={13}/></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
