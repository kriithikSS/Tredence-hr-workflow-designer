import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { NodeRegistry } from '../../registry/NodeRegistry';

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNode } = useWorkflowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const def  = selectedNode ? NodeRegistry[selectedNode.type ?? ''] : null;
  const meta = def?.meta;
  const Icon = meta?.icon;

  return (
    <AnimatePresence>
      {selectedNode && def && (
        <motion.aside
          key="config-panel"
          className="config-panel"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div
            className="config-panel__header"
            style={{ borderTopColor: meta?.color, borderTopWidth: 4, borderTopStyle: 'solid' }}
          >
            <div className="config-panel__title-row">
              {Icon && (
                <div className="config-panel__icon" style={{ color: meta?.color, background: `${meta?.color}18` }}>
                  <Icon size={16} />
                </div>
              )}
              <div>
                <h2 className="config-panel__title">{meta?.label ?? 'Configure Node'}</h2>
                <p className="config-panel__subtitle">ID: {selectedNode.id}</p>
              </div>
            </div>
            <button className="config-panel__close" onClick={() => setSelectedNode(null)}>
              <X size={16} />
            </button>
          </div>

          <div className="config-panel__body">
            {/* Form resolved entirely from registry — no switch statement */}
            {React.createElement(def.form, {
              nodeId: selectedNode.id,
              data: selectedNode.data,
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
