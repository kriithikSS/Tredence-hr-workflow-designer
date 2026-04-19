import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookmarkPlus, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useCustomTemplates } from '../../hooks/useCustomTemplates';
import type { TWorkflowNode } from '../../utils/templates';
import type { Edge } from '@xyflow/react';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveTemplateModal({ isOpen, onClose }: SaveTemplateModalProps) {
  const { nodes, edges, workflowTitle } = useWorkflowStore();
  const { saveTemplate } = useCustomTemplates();
  const [title, setTitle]       = useState(workflowTitle);
  const [description, setDesc]  = useState('');
  const [saved, setSaved]       = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    saveTemplate(title.trim(), description.trim(), nodes as TWorkflowNode[], edges as Edge[]);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const handleClose = () => { setSaved(false); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="save-modal"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {saved ? (
              <div className="save-modal__success">
                <CheckCircle2 size={36} color="#22C55E" />
                <p>Template Saved!</p>
              </div>
            ) : (
              <>
                <div className="save-modal__header">
                  <div className="save-modal__icon"><BookmarkPlus size={18} /></div>
                  <h2>Save as Template</h2>
                  <button className="save-modal__close" onClick={handleClose}><X size={16} /></button>
                </div>

                <div className="save-modal__body">
                  <label className="save-modal__label">
                    Template Name *
                    <input
                      className="save-modal__input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. PIP Process"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                  </label>
                  <label className="save-modal__label">
                    Description
                    <textarea
                      className="save-modal__input save-modal__textarea"
                      value={description}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Optional description…"
                      rows={2}
                    />
                  </label>
                  <p className="save-modal__hint">
                    {nodes.length} nodes · {edges.length} edges will be saved
                  </p>
                </div>

                <div className="save-modal__footer">
                  <button className="save-modal__btn save-modal__btn--ghost" onClick={handleClose}>Cancel</button>
                  <button
                    className="save-modal__btn save-modal__btn--primary"
                    onClick={handleSave}
                    disabled={!title.trim()}
                  >
                    <BookmarkPlus size={14} /> Save Template
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
