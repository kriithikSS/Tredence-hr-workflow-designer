import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Settings2, List, Database } from 'lucide-react';
import { useMockConfig } from '../../hooks/useMockConfig';
import { ActionsEditor } from './ActionsEditor';
import { SimulateConfig } from './SimulateConfig';
import { ApiLog } from './ApiLog';

type TabId = 'actions' | 'config' | 'log';

const TABS: { id: TabId; label: string; icon: typeof Zap }[] = [
  { id: 'actions', label: 'Actions',    icon: Database   },
  { id: 'config',  label: 'Simulate',   icon: Settings2  },
  { id: 'log',     label: 'API Log',    icon: List       },
];

export function BackendStudio() {
  const { isBackendStudioOpen, setIsBackendStudioOpen, logSnapshot } = useMockConfig();
  const [activeTab, setActiveTab] = useState<TabId>('actions');

  return (
    <AnimatePresence>
      {isBackendStudioOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsBackendStudioOpen(false)}
          />
          <motion.aside
            className="backend-studio"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            {/* ── Header ── */}
            <div className="bs-header">
              <div className="bs-header__brand">
                <div className="bs-header__icon"><Zap size={16} /></div>
                <div>
                  <h2 className="bs-title">Mock Backend Studio</h2>
                  <p className="bs-subtitle">Manage actions · Configure API · Monitor calls</p>
                </div>
              </div>
              <button className="bs-close" onClick={() => setIsBackendStudioOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* ── Tabs ── */}
            <div className="bs-tabs">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    className={`bs-tab ${activeTab === t.id ? 'bs-tab--active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <Icon size={14} />
                    {t.label}
                    {t.id === 'log' && logSnapshot.length > 0 && (
                      <span className="bs-tab__badge">{logSnapshot.length}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab Content ── */}
            <div className="bs-body">
              {activeTab === 'actions' && <ActionsEditor />}
              {activeTab === 'config'  && <SimulateConfig />}
              {activeTab === 'log'     && <ApiLog />}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
