# HR Workflow Designer — Complete Project Documentation

---

## What Is This Project?

The **HR Workflow Designer** is an interactive, browser-based visual workflow engine built specifically for Human Resources departments. It lets HR professionals design, validate, simulate, and export structured approval workflows — the kind that normally live inside expensive enterprise tools like ServiceNow, Workday, or Jira.

Think of it as a **flowchart tool that actually executes**. Not just draws boxes — it runs a real graph-traversal engine that walks through your workflow step by step, makes branching decisions (approve or reject), and shows you exactly what happened at each node in a live, animated view.

---

## Who Is This For?

| Persona | What they get |
|---|---|
| **HR Professionals** | Design onboarding, leave, and verification workflows visually without code |
| **Engineering Evaluators** | A working demonstration of DSA, graph theory, React architecture, and product thinking |
| **Product Managers** | A prototype-quality tool to show stakeholders how automation workflows could work |

---

## What Problems Does It Solve?

1. **Workflow opacity** — HR processes are often undocumented or trapped in email chains. This tool makes them visual and explicit.
2. **Testing without consequences** — The simulation engine lets you "run" a workflow before deploying it, catching dead-ends and disconnected nodes.
3. **No-code configurability** — Each node has a rich form-based configuration. Roles, due dates, actions, failure behaviors — all configurable without touching code.

---

## Complete Feature List

### Visual Canvas (Drag & Drop)
- Infinite canvas powered by React Flow with dot-grid background
- Drag nodes from the left palette onto the canvas
- Connect nodes by dragging from one handle to another
- **Auto Layout** — one click re-arranges nodes using the Dagre algorithm
- **MiniMap** — bottom-right overview with colored node squares and viewport mask
- Zoom controls with styled panel
- Click to select opens configuration panel on the right
- Delete nodes with hover ✕ button or Backspace/Delete key
- **Undo/Redo** — 30-step history stack (Zustand)

---

### Node Types (5 total)

#### 1. Start Node (Green)
- Defines how the workflow is triggered
- Config: workflow label, trigger type (Manual/Scheduled/Event), metadata key-value pairs
- Every workflow must have exactly one

#### 2. Task Node (Blue)
- Represents a human action completed by an assignee
- Config: label, description, assignee, due date, priority (Low/Medium/High), custom fields

#### 3. Approval Node (Amber)
- A decision gate — someone must approve or reject
- Config: label, approver role (Manager/HRBP/Director/Custom), auto-approve threshold, rejection label
- **Two output handles** — green (Approved) and red (Rejected) — different workflow paths from each
- Engine randomly decides based on the configurable Approval Probability slider

#### 4. Automated Step Node (Purple)
- A system action that runs automatically — no human required
- Config: label, action (from Actions Manager), on-failure behavior (Retry/Skip/Stop)
- Has a realistic 5% random failure chance when `onFailure = stop`

#### 5. End Node (Red)
- Marks workflow completion
- Config: end label, completion message, summary email toggle + recipients

---

### Execution Engine (Graph Traversal — Priority 1)

**Algorithm: Iterative DFS from the Start node**
- Builds an adjacency map (`Map<nodeId, AdjacencyEntry[]>`) from the edges array
- Traverses nodes in execution order, respecting edge direction
- Visited set prevents infinite loops on cyclic graphs
- **Approval branching**: filters outgoing edges by `sourceHandle` — follows only `'approved'` or `'rejected'` edges based on random outcome
- The engine is an `async function*` (async generator) that yields one `ExecutionStep` at a time
- Validates graph before running: missing start/end, disconnected nodes

**Graph utilities**
- `buildMaps()` — adjacency map + node map
- `findStartNode()` — locates the start node
- `hasCycle()` — DFS cycle detection (visited + in-stack sets)
- `validateGraph()` — structural checks

---

### Execution Visualization (Priority 2)

When you click Simulate:
1. Canvas visualization starts — panel stays **closed**
2. Floating amber banner at top-center: "Simulation running..."
3. Each node animates live:
   - Amber pulsing glow = currently executing
   - Green ring + ✓ overlay = completed successfully
   - Red ring + shake animation = failed
4. Active edge turns **green with a travelling dot** (`animateMotion`)
5. Banner turns green: "Simulation complete — N steps executed"
6. **Sandbox panel slides up** automatically with the full log

Speed: Slow (1500ms) / Normal (700ms) / Fast (150ms) — configurable in Settings

---

### Simulation Results Panel

- Timeline of every executed step
- Each step shows: type badge, label, status, duration, output values
- **Branch indicator** for Approval nodes — ✓ Approved or ✗ Rejected in green/red
- Re-run button — closes panel, reruns on canvas, reopens with fresh results
- Slider settings persist between runs (Approval Probability never resets)

---

### Template System

**3 Built-in Templates**
- Employee Onboarding (6 nodes)
- Leave Approval (6 nodes)
- Document Verification (6 nodes)

**Custom Template Manager**
- Save current canvas via "Save as Template…" in the Templates dropdown
- Modal: Template Name + Description + node/edge count preview
- My Templates section in dropdown with delete buttons per template
- Persisted in `localStorage` — survives browser close/refresh

---

### Mock Backend Studio

Opened via the ⚡ Backend Studio button (purple gradient) in the toolbar.

**Tab 1 — Actions Manager**
- View all automation actions (6 built-in locked, unlimited custom)
- Add custom action: ID + Label + comma-separated params
- Edit custom action label or params inline
- Delete custom actions
- Changes immediately available in the Automated Step config form
- Persisted in localStorage

**Tab 2 — Simulate Config**
- Response Delay slider (0–3000ms)
- Step Success Rate slider (0–100%) — reduce to test error UI
- Force Full Failure toggle → API returns HTTP 500 immediately
- Custom error message
- All settings take effect on next API call, no reload needed

**Tab 3 — API Log**
- Real-time feed of every `GET /api/automations` and `POST /api/simulate` call
- Shows: timestamp, method badge, URL, status code, duration
- Click to expand: full Request + Response JSON in dark code block
- Clear button, live call count badge on toolbar button

---

### Node Registry Architecture (Priority 3)

`src/registry/NodeRegistry.ts` is the single source of truth:
```
NodeRegistry[type].component   → Canvas component
NodeRegistry[type].form        → Config panel form
NodeRegistry[type].meta        → Label, colour, icon, palette group
NodeRegistry[type].defaultData → On-drop defaults
NodeRegistry[type].execute     → Engine executor
```

Adding a new node type = one entry in this file. Canvas, palette, config panel, and engine derive from it automatically.

---

### Import / Export

- **Export** — downloads workflow as `.json` (nodes + edges + title)
- **Import** — file picker loads any compatible `.json` back onto the canvas

---

## How to Create a Workflow With All Features

### Step 1 — Add Nodes
Drag from the left palette onto the canvas in this order:
- Start → Task → Approval → Automated Step (approved path) → End
- Also: Approval → Task (rejected path) → back to Approval (loop)

### Step 2 — Connect Them
- Drag from a node's **bottom handle** to the next node's **top handle**
- For the Approval node: drag from the **green handle** for the approved path, **red handle** for rejection

### Step 3 — Configure Each Node
Click a node to open its config panel:
- **Start**: Trigger Type = "Event"
- **Task**: Assignee = "HR Admin", Priority = High, Due Date = pick a date
- **Approval**: Approver = Manager, Rejection Label = "Needs Revision"
- **Automated Step**: Action = "Send Email", On Failure = "Retry"
- **End**: Enable summary email, set recipients

### Step 4 — Configure the Backend Studio
Click ⚡ Backend Studio:
- **Actions tab**: Click "+ Add Action" → ID: `trigger_zapier`, Label: "Trigger Zapier", Params: `webhook_url` → Save
- **Simulate tab**: Set Approval Probability to 50%, Response Delay to 500ms
- Close the studio

### Step 5 — Run Simulation
Click **Simulate** in the toolbar:
- Watch each node light up amber then turn green/red
- See which approval branch the engine chose (the chosen edge glows)
- Results panel opens automatically with the full log

### Step 6 — Save as Template
Click **Templates** → **"Save current as template…"**
- Name: "Manager Approval Flow"
- Description: "With Zapier integration"
- Click Save → ✓ success animation
- Your template now appears in "My Templates" → survives page refresh

### Step 7 — Export
Click **Export** → downloads `Manager_Approval_Flow.json` for sharing

---

## Project Architecture

```
src/
├── engine/                    Pure graph logic — no React
│   ├── types.ts               Interfaces: ExecutionStep, ExecutionContext
│   ├── graphUtils.ts          Adjacency map, cycle detection, start node finder
│   ├── nodeExecutors.ts       Per-type async executor functions
│   ├── executionEngine.ts     Core DFS async generator
│   └── simulationRunner.ts   Standalone runner (engine + store updates)
│
├── registry/
│   └── NodeRegistry.ts        Single source of truth for all node types
│
├── api/
│   ├── mockConfig.ts          Mutable singleton — MSW handlers read this
│   ├── handlers.ts            MSW request handlers (dynamic, read mockConfig)
│   └── worker.ts              MSW service worker setup
│
├── hooks/
│   ├── useWorkflowStore.ts    Canvas state + undo/redo (Zustand)
│   ├── useExecutionState.ts   Transient visual state during simulation
│   ├── useSimulation.ts       Thin simulation hook wrapper
│   ├── useCustomTemplates.ts  User templates (localStorage via Zustand persist)
│   └── useMockConfig.ts       Backend Studio config (localStorage + mockConfig sync)
│
├── components/
│   ├── canvas/                Toolbar, palette, canvas, edges, SimulationBanner
│   ├── nodes/                 5 node components + BaseNode
│   ├── panels/                NodeConfigPanel + 5 form components
│   ├── sandbox/               SandboxPanel + ExecutionLog
│   └── backend/               BackendStudio + ActionsEditor + SimulateConfig + ApiLog
│
├── types/
│   ├── nodes.ts               TypeScript interfaces for all node data shapes
│   └── api.ts                 API request/response types
│
└── utils/
    ├── templates.ts           3 built-in workflow templates
    └── graphHelpers.ts        Dagre layout, export/import utilities
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 + TypeScript (strict) | Type safety + modern React patterns |
| Build | Vite | Fast HMR, minimal config |
| Canvas | React Flow v11 | Mature graph UI, custom node/edge support |
| State | Zustand + persist | Simple, powerful, no boilerplate |
| Forms | React Hook Form + Zod | Zero re-renders, schema-first validation |
| Animations | Framer Motion | Declarative spring animations |
| Layout | Dagre | Industry-standard DAG layout algorithm |
| Mock API | MSW (Mock Service Worker) | Intercepts real fetch calls, no server needed |
| Icons | Lucide React | Consistent, lightweight SVG icons |
| Fonts | Inter (Google Fonts) | Professional sans-serif |
| Styling | Vanilla CSS | Maximum control, no class name conflicts |
