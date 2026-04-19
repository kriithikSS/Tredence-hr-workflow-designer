import type { KeyValuePair } from '../../types/nodes';
import { Plus, Trash2 } from 'lucide-react';

interface KeyValueEditorProps {
  value: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  label?: string;
}

export function KeyValueEditor({ value, onChange, label = 'Custom Fields' }: KeyValueEditorProps) {
  const addRow = () => onChange([...value, { key: '', value: '' }]);
  const removeRow = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: 'key' | 'value', v: string) => {
    const updated = value.map((p, idx) => idx === i ? { ...p, [field]: v } : p);
    onChange(updated);
  };

  return (
    <div className="kv-editor">
      <div className="kv-editor__header">
        <span className="form-label">{label}</span>
        <button type="button" className="kv-add-btn" onClick={addRow}>
          <Plus size={12} /> Add
        </button>
      </div>
      {value.length === 0 && (
        <p className="kv-empty">No entries yet. Click Add to create one.</p>
      )}
      {value.map((pair, i) => (
        <div key={i} className="kv-row">
          <input
            className="form-input kv-input"
            placeholder="Key"
            value={pair.key}
            onChange={(e) => updateRow(i, 'key', e.target.value)}
          />
          <input
            className="form-input kv-input"
            placeholder="Value"
            value={pair.value}
            onChange={(e) => updateRow(i, 'value', e.target.value)}
          />
          <button type="button" className="kv-delete-btn" onClick={() => removeRow(i)}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
