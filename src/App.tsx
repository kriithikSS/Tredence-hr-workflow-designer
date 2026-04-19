import './index.css';
import { ReactFlowProvider } from '@xyflow/react';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { NodePalette } from './components/canvas/NodePalette';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeConfigPanel } from './components/panels/NodeConfigPanel';
import { SandboxPanel } from './components/sandbox/SandboxPanel';
import { BackendStudio } from './components/backend/BackendStudio';

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="app-shell">
        <CanvasToolbar />
        <div className="app-body">
          <NodePalette />
          <main className="app-canvas">
            <WorkflowCanvas />
          </main>
          <NodeConfigPanel />
        </div>
        <SandboxPanel />
        <BackendStudio />
      </div>
    </ReactFlowProvider>
  );
}
