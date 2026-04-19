import { useState } from 'react';
import {
  Download, Upload, LayoutDashboard, CheckCircle2,
  Undo2, Redo2, ChevronDown, Play, Loader2,
  BookmarkPlus, Trash2, Zap, Moon, Sun,
} from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useExecutionState } from '../../hooks/useExecutionState';
import { useCustomTemplates } from '../../hooks/useCustomTemplates';
import { useMockConfig } from '../../hooks/useMockConfig';
import { useTheme } from '../../hooks/useTheme';
import { applyDagreLayout, exportWorkflow, downloadJSON } from '../../utils/graphHelpers';
import { WORKFLOW_TEMPLATES } from '../../utils/templates';
import { runWorkflowSimulation } from '../../engine/simulationRunner';
import { SaveTemplateModal } from './SaveTemplateModal';

export function CanvasToolbar() {
  const {
    workflowTitle, setWorkflowTitle, nodes, edges, setNodes,
    loadTemplate, undo, redo, past, future, setIsSandboxOpen
  } = useWorkflowStore();

  const { isRunning } = useExecutionState();
  const { templates: customTemplates, deleteTemplate } = useCustomTemplates();
  const { setIsBackendStudioOpen, logSnapshot } = useMockConfig();
  const { isDark, toggleTheme } = useTheme();

  const [editingTitle, setEditingTitle]   = useState(false);
  const [titleVal, setTitleVal]           = useState(workflowTitle);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleTitleBlur = () => { setWorkflowTitle(titleVal); setEditingTitle(false); };

  const handleAutoLayout = () => {
    const laid = applyDagreLayout(nodes, edges, 'TB');
    setNodes(laid as typeof nodes);
  };

  const handleExport = () => {
    const json = exportWorkflow(nodes, edges, workflowTitle);
    downloadJSON(json, `${workflowTitle.replace(/\s+/g, '_')}.json`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed.nodes && parsed.edges) {
            useWorkflowStore.getState().setNodes(parsed.nodes);
            useWorkflowStore.getState().setEdges(parsed.edges);
            if (parsed.title) { setWorkflowTitle(parsed.title); setTitleVal(parsed.title); }
          }
        } catch { /* ignore */ }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLoadBuiltIn = (id: string) => {
    loadTemplate(id);
    const tpl = WORKFLOW_TEMPLATES.find((t) => t.id === id);
    if (tpl) setTitleVal(tpl.title);
    setShowTemplates(false);
  };

  const handleLoadCustom = (id: string) => {
    const tpl = customTemplates.find((t) => t.id === id);
    if (!tpl) return;
    useWorkflowStore.getState().setNodes(tpl.nodes as typeof nodes);
    useWorkflowStore.getState().setEdges(tpl.edges as typeof edges);
    setTitleVal(tpl.title);
    setWorkflowTitle(tpl.title);
    setShowTemplates(false);
  };

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTemplate(id);
  };

  const handleSimulate = () => {
    if (isRunning) return;
    runWorkflowSimulation();
  };

  return (
    <>
      <header className="canvas-toolbar">
        {/* ── Left ── */}
        <div className="toolbar-left">
          <div className="toolbar-brand">
            <div className="brand-logo"><CheckCircle2 size={20} /></div>
            <span className="brand-name">HR Flow</span>
          </div>
          <div className="toolbar-divider" />

          {editingTitle ? (
            <input
              className="toolbar-title-input"
              value={titleVal}
              autoFocus
              onChange={(e) => setTitleVal(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            />
          ) : (
            <button className="toolbar-title" onClick={() => setEditingTitle(true)} title="Click to rename">
              {workflowTitle}<span className="toolbar-title-edit-hint">✎</span>
            </button>
          )}

          {/* Template selector */}
          <div style={{ position: 'relative' }}>
            <button
              className="toolbar-btn toolbar-btn--ghost"
              onClick={() => setShowTemplates((v) => !v)}
            >
              Templates <ChevronDown size={13} />
            </button>
            {showTemplates && (
              <div className="template-dropdown">
                <div className="template-dropdown__section-label">Built-in</div>
                {WORKFLOW_TEMPLATES.map((tpl) => (
                  <button key={tpl.id} className="template-option" onClick={() => handleLoadBuiltIn(tpl.id)}>
                    {tpl.title}
                  </button>
                ))}

                {customTemplates.length > 0 && (
                  <>
                    <div className="template-dropdown__divider" />
                    <div className="template-dropdown__section-label">My Templates</div>
                    {customTemplates.map((tpl) => (
                      <div key={tpl.id} className="template-option template-option--custom">
                        <button className="template-option__name" onClick={() => handleLoadCustom(tpl.id)}>
                          {tpl.title}
                        </button>
                        <button
                          className="template-option__delete"
                          onClick={(e) => handleDeleteCustom(e, tpl.id)}
                          title="Delete template"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                <div className="template-dropdown__divider" />
                <button className="template-option template-option--save" onClick={() => { setShowTemplates(false); setShowSaveModal(true); }}>
                  <BookmarkPlus size={13} /> Save current as template…
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right ── */}
        <div className="toolbar-right">
          <button className="toolbar-btn toolbar-btn--ghost" onClick={undo} disabled={past.length === 0 || isRunning} title="Undo"><Undo2 size={16} /></button>
          <button className="toolbar-btn toolbar-btn--ghost" onClick={redo} disabled={future.length === 0 || isRunning} title="Redo"><Redo2 size={16} /></button>
          <div className="toolbar-divider" />
          <button className="toolbar-btn toolbar-btn--ghost" onClick={handleAutoLayout} disabled={isRunning}><LayoutDashboard size={16} /><span>Layout</span></button>
          <button className="toolbar-btn toolbar-btn--ghost" onClick={handleImport} disabled={isRunning}><Upload size={16} /><span>Import</span></button>
          <button className="toolbar-btn toolbar-btn--ghost" onClick={handleExport} disabled={isRunning}><Download size={16} /><span>Export</span></button>

          {/* Dark mode toggle */}
          <button
            className="toolbar-btn toolbar-btn--ghost toolbar-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {/* Backend Studio button */}
          <button
            className="toolbar-btn toolbar-btn--studio"
            onClick={() => setIsBackendStudioOpen(true)}
            disabled={isRunning}
            title="Open Backend Studio"
          >
            <Zap size={16} />
            <span>Backend Studio</span>
            {logSnapshot.length > 0 && (
              <span className="toolbar-studio-badge">{logSnapshot.length}</span>
            )}
          </button>

          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden' }}>
            <button 
              className="toolbar-btn toolbar-btn--primary" 
              onClick={handleSimulate} 
              disabled={isRunning}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: '1px solid rgba(255,255,255,0.2)' }}
            >
              {isRunning
                ? <><Loader2 size={16} className="spin" /><span>Running...</span></>
                : <><Play size={16} /><span>Simulate</span></>
              }
            </button>
            <button 
              className="toolbar-btn toolbar-btn--primary" 
              onClick={() => setIsSandboxOpen(true)}
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingLeft: 6, paddingRight: 6 }}
              title="Open Logs Window"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </header>

      <SaveTemplateModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
    </>
  );
}
