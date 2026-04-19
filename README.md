# HR Workflow Designer

> A graph-based visual workflow execution engine for HR processes — built with React 18, TypeScript, React Flow, Zustand, and MSW.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF)](https://vitejs.dev/)

---

## Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd hr-workflow

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

**Requirements**: Node.js 18+ · npm 9+

> The app works fully offline — it uses MSW (Mock Service Worker) for API simulation. No backend server needed.

---

## What It Does

This is not just a drag-and-drop flowchart tool. It is a **visual workflow execution engine**:

1. Design a workflow on an infinite canvas by dragging nodes and connecting them
2. Configure each node (assignees, approvers, automation actions, failure strategies)
3. Click **Simulate** — a real DFS graph traversal engine runs through your workflow
4. Watch nodes light up **step by step** on the canvas with live animations
5. See the full execution log with branch decisions, durations, and output values

---

## Architecture

### High-Level Design

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  React UI Layer                                         │    │
│  │  CanvasToolbar → WorkflowCanvas → NodeConfigPanel       │    │
│  │  SandboxPanel  → BackendStudio  → SaveTemplateModal     │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │ reads/writes                          │
│  ┌───────────────────────▼─────────────────────────────────┐    │
│  │  State Layer (Zustand)                                  │    │
│  │  useWorkflowStore   — canvas nodes/edges/history        │    │
│  │  useExecutionState  — live visual simulation state      │    │
│  │  useCustomTemplates — user-saved templates (persisted)  │    │
│  │  useMockConfig      — backend config (persisted)        │    │
│  └──────────┬────────────────────────┬───────────────────--┘    │
│             │                        │                           │
│  ┌──────────▼──────────┐   ┌─────────▼──────────────────────┐   │
│  │  Execution Engine   │   │  Mock API Layer (MSW)          │   │
│  │  executionEngine.ts │   │  handlers.ts                   │   │
│  │  DFS graph traversal│   │  reads from mockConfig.ts      │   │
│  │  async generator    │   │  (shared mutable singleton)    │   │
│  └─────────────────────┘   └────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Node Registry Pattern

All node type definitions live in a single file:

```typescript
// src/registry/NodeRegistry.ts
const NodeRegistry = {
  task: {
    component: TaskNode,       // Canvas component
    form: TaskForm,            // Config panel form
    meta: { label, color, icon, group },
    defaultData: { ... },      // On-drop defaults
    execute: taskExecutor,     // Engine executor function
  },
  approval: { ... },
  automated: { ... },
  // ...
}
```

**Adding a new node type = one object in this file.** Canvas palette, config panel, and execution engine derive from it automatically. No switch statements anywhere.

### Execution Engine

```
simulationRunner.ts
    ↓ calls
executionEngine.ts (async generator)
    ↓ builds
buildMaps() → adjacency map + node map
    ↓ traverses
DFS from Start node
    ↓ at each node
nodeExecutors[type](node, context) → ExecuteResult
    ↓ yields
ExecutionStep { nodeId, status, branch, output, durationMs }
    ↓ consumed by
useExecutionState → updates canvas visual state
    ↓ when complete
Opens SandboxPanel with full log
```

**Approval branching logic:**
```typescript
// After approval node executes and returns branch = 'approved' | 'rejected'
const nextEdges = adjacencyMap.get(nodeId)
  .filter(edge => edge.sourceHandle === branch || !edge.sourceHandle);
```

### State Architecture

| Store | Persistence | Purpose |
|---|---|---|
| `useWorkflowStore` | ❌ Session only | Canvas nodes, edges, selected node, undo/redo stack |
| `useExecutionState` | ❌ Session only | Active node/edge IDs, completed/failed sets, speed settings |
| `useCustomTemplates` | ✅ localStorage | User-saved workflow templates |
| `useMockConfig` | ✅ localStorage | Backend Studio config — syncs to `mockConfig` singleton |

**Key design decision:** `useExecutionState` is separate from `useWorkflowStore` so that simulation runs do not pollute the undo/redo history. Slider settings (speed, approval probability) are kept in `useExecutionState` and are intentionally never reset between runs.

### MSW Architecture

```
localStorage
    ↓ (on app load, Zustand rehydrates)
useMockConfig store
    ↓ (on every mutation)
mockConfig.ts singleton (module-level object)
    ↓ (on every HTTP request)
MSW handlers read mockConfig at call time
    ↓ (after response)
logApiCall() → apiLog array → subscribeToApiLog notifies
    ↓
useMockConfig.logSnapshot → ApiLog component re-renders
```

---

## Project Structure

```
hr-workflow/
├── public/
│   └── mockServiceWorker.js      MSW service worker (auto-generated)
├── src/
│   ├── api/
│   │   ├── mockConfig.ts         Mutable singleton + pub-sub API logger
│   │   ├── handlers.ts           MSW handlers — dynamic, read mockConfig
│   │   └── worker.ts             MSW browser setup
│   ├── engine/
│   │   ├── types.ts              ExecutionStep, ExecutionContext interfaces
│   │   ├── graphUtils.ts         Adjacency map, cycle detect, validation
│   │   ├── nodeExecutors.ts      Per-type async executor functions
│   │   ├── executionEngine.ts    Core DFS async generator
│   │   └── simulationRunner.ts  Standalone entry point for simulation
│   ├── registry/
│   │   └── NodeRegistry.ts       Single source of truth for all node types
│   ├── hooks/
│   │   ├── useWorkflowStore.ts   Canvas state + history (Zustand)
│   │   ├── useExecutionState.ts  Visual simulation state (Zustand)
│   │   ├── useSimulation.ts      Thin hook wrapper
│   │   ├── useCustomTemplates.ts User templates (Zustand + persist)
│   │   └── useMockConfig.ts      Backend config (Zustand + persist + mockConfig sync)
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasToolbar.tsx      Top toolbar with all controls
│   │   │   ├── WorkflowCanvas.tsx     ReactFlow wrapper + canvas setup
│   │   │   ├── NodePalette.tsx        Left sidebar — draggable node types
│   │   │   ├── CustomEdge.tsx         Animated edge component
│   │   │   ├── SimulationBanner.tsx   Floating status chip during execution
│   │   │   └── SaveTemplateModal.tsx  Save-as-template dialog
│   │   ├── nodes/
│   │   │   ├── BaseNode.tsx           Shared card with execution state styling
│   │   │   ├── StartNode.tsx
│   │   │   ├── TaskNode.tsx
│   │   │   ├── ApprovalNode.tsx       Dual-handle approval node
│   │   │   ├── AutomatedStepNode.tsx
│   │   │   └── EndNode.tsx
│   │   ├── panels/
│   │   │   ├── NodeConfigPanel.tsx    Right-side config container
│   │   │   └── forms/                 Per-type form components
│   │   ├── sandbox/
│   │   │   ├── SandboxPanel.tsx      Bottom results panel (slide-up)
│   │   │   └── ExecutionLog.tsx      Step-by-step log with branch display
│   │   └── backend/
│   │       ├── BackendStudio.tsx     Main panel (3 tabs, slide-in from right)
│   │       ├── ActionsEditor.tsx     CRUD for automation actions
│   │       ├── SimulateConfig.tsx    API behavior sliders/toggles
│   │       └── ApiLog.tsx            Live HTTP call feed
│   ├── types/
│   │   ├── nodes.ts                  Data shape interfaces for all 5 node types
│   │   └── api.ts                    SimulateRequest/Response types
│   ├── utils/
│   │   ├── templates.ts              3 built-in workflow templates
│   │   └── graphHelpers.ts           Dagre layout, export, import
│   ├── App.tsx                       Root component
│   ├── main.tsx                      Entry point (MSW setup + React mount)
│   └── index.css                     All styles (1400+ lines, no Tailwind)
├── PROJECT_OVERVIEW.md               Full feature + usage documentation
├── README.md                         This file
├── package.json
├── tsconfig.json                     Strict TypeScript config
└── vite.config.ts
```

---

## Design Decisions

### 1. Vanilla CSS over Tailwind
**Decision**: All ~1400 lines of styles are standard CSS using CSS custom properties.

**Rationale**: Tailwind is optimised for utility-first speed, but it creates class-name coupling and makes it hard to apply complex stateful animations (pulse, shake, active-glow). The execution visualization requires carefully crafted `@keyframes` and compound CSS selectors (`base-node--active .node-handle`). Vanilla CSS gave complete control with zero abstraction overhead.

---

### 2. Async Generator for the Execution Engine
**Decision**: `executeWorkflow()` is an `async function*` that yields one step at a time.

**Rationale**: This decouples the engine from the UI completely. The engine has zero knowledge of React or Zustand — it just yields `ExecutionStep` objects. The simulation runner consumes the generator and maps each step to store updates. This means the engine can be tested in isolation (plain Node.js), and a pause/resume feature only requires storing the generator reference.

---

### 3. Separate `useExecutionState` from `useWorkflowStore`
**Decision**: Visual simulation state (active nodes, completed set) lives in its own Zustand slice.

**Rationale**: If simulation state lived in `useWorkflowStore`, every animated step during a simulation run would pollute the undo/redo history stack. Users would be able to "undo" back through a simulation, which makes no sense. Separating the stores keeps history clean.

---

### 4. NodeRegistry as Single Source of Truth
**Decision**: All node type metadata, components, forms, and executors live in one registry object.

**Rationale**: The original codebase had switch statements scattered across 6+ files. When adding a new node type, you'd have to find and update each one. The registry pattern reduces that to a single file edit. It's the same pattern used by VS Code's extension API and Webpack's plugin system.

---

### 5. Shared `mockConfig` Singleton for MSW
**Decision**: A module-level mutable object (`mockConfig`) is shared between the React app and MSW handlers.

**Rationale**: MSW handlers run in the main JavaScript thread (not the service worker), so they share the module scope with the app. This means the UI can mutate `mockConfig` directly, and the next handler invocation picks up the change without any message-passing or reload. The Backend Studio's changes are instantly effective.

---

### 6. `simulationRunner.ts` as a Non-Hook Entry Point
**Decision**: Simulation is triggered by calling `runWorkflowSimulation()` directly from the toolbar, not through a React hook or useEffect.

**Rationale**: A simulation is a one-shot operation, not a reactive side effect. Using a plain async function that calls `store.getState()` directly avoids stale closure issues and means the toolbar button can trigger the full engine without being wrapped in complex hook dependencies.

---

## What Was Completed

| Feature | Status |
|---|---|
| Drag-and-drop node palette | ✅ Complete |
| 5 node types with full config forms | ✅ Complete |
| Connect, delete, reposition nodes | ✅ Complete |
| Auto-layout (Dagre) | ✅ Complete |
| Undo/Redo (30 steps) | ✅ Complete |
| Import / Export JSON | ✅ Complete |
| DFS execution engine (graph traversal) | ✅ Complete |
| Approval branching (sourceHandle filtering) | ✅ Complete |
| Cycle detection | ✅ Complete |
| Graph validation (pre-run) | ✅ Complete |
| Step-by-step canvas visualization | ✅ Complete |
| Animated edges (travelling dot) | ✅ Complete |
| Node execution state animations (pulse/shake/glow) | ✅ Complete |
| Simulation results panel with full log | ✅ Complete |
| Execution speed control | ✅ Complete |
| Approval probability control (persistent) | ✅ Complete |
| 3 built-in workflow templates | ✅ Complete |
| Custom Template Manager (save/load/delete) | ✅ Complete |
| Mock Backend Studio (3 tabs) | ✅ Complete |
| Actions Manager (add/edit/delete) | ✅ Complete |
| API behavior config (delay, success rate, force-fail) | ✅ Complete |
| Live API call log | ✅ Complete |
| MiniMap with styled border and viewport mask | ✅ Complete |
| Floating simulation status banner | ✅ Complete |
| Node Registry pattern | ✅ Complete |
| TypeScript strict mode throughout | ✅ Complete |

---

## What Would Be Added With More Time

### High Priority

| Feature | Description | Effort |
|---|---|---|
| **Pause / Resume simulation** | Store the generator reference; add a Pause button that holds the loop and a Resume button that continues | ~4 hours |
| **Condition Node** | A new node type with a configurable expression evaluator — `if field > value → path A, else → path B`. Shows the engine's power with data-driven branching | ~1 day |
| **Real-time collaboration** | Use a CRDT library (e.g. Yjs + WebSocket) so multiple users can edit the same canvas simultaneously | ~3 days |
| **Export as BPMN XML** | Generate standard BPMN 2.0 XML so workflows can be imported into enterprise tools | ~2 days |

### Medium Priority

| Feature | Description | Effort |
|---|---|---|
| **Subworkflows** | Allow a node to embed another full workflow — call it and wait for completion | ~1 day |
| **Version history** | Track named versions of a workflow (like Git commits); diff and restore any version | ~2 days |
| **Webhook triggers** | Connect the Start node to a real HTTP endpoint that auto-starts simulation when called | ~4 hours |
| **Export logs as CSV** | Download execution results as a spreadsheet for HR reporting | ~2 hours |
| **Dark mode** | Full dark theme using CSS custom properties — token system already in place | ~4 hours |

### Lower Priority

| Feature | Description | Effort |
|---|---|---|
| **Mobile-responsive canvas** | Touch-friendly drag and zoom on iPad | ~2 days |
| **Node search/filter** | Search nodes on the canvas by label | ~2 hours |
| **SLA warnings** | Highlight task nodes where due dates have passed | ~3 hours |
| **Node comments** | Add sticky-note style comments to nodes for documentation | ~4 hours |
| **Workflow analytics** | After multiple simulation runs, show average completion time, most common failure points | ~1 day |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React + TypeScript | 18 / 5.x |
| Build tool | Vite | 8 |
| Canvas | React Flow | 11 |
| State management | Zustand | 5 |
| Form validation | React Hook Form + Zod | latest |
| Animations | Framer Motion | 12 |
| Graph layout | Dagre | 0.8 |
| Mock API | MSW (Mock Service Worker) | 2 |
| Icons | Lucide React | latest |
| Fonts | Inter (Google Fonts) | — |
| Styling | Vanilla CSS | — |

---

## Author Notes

This project was built to demonstrate that front-end engineering goes beyond building pretty UIs. The core execution engine implements real computer science concepts — DFS graph traversal, cycle detection, branching logic — and the architecture decisions (Registry pattern, separated state slices, shared singleton for MSW) reflect how senior engineers think about extensibility, testability, and decoupling.

The Backend Studio feature in particular is intentionally "senior-level" thinking: making the invisible visible. Most engineers would leave MSW as a hidden implementation detail. Surfacing it as a live, configurable dashboard shows awareness of the full system, not just the React layer.
