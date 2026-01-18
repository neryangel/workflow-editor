# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  app/                                                        │
│  ├── api/ai/llm/        → LLM API (Gemini integration)      │
│  ├── api/run-workflow/  → Workflow execution API            │
│  └── workflows/new/     → Editor page                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feature Layer                             │
├─────────────────────────────────────────────────────────────┤
│  features/workflow-editor/                                   │
│  ├── components/                                             │
│  │   ├── canvas/        → WorkflowCanvas (React Flow)       │
│  │   ├── nodes/         → Node components                    │
│  │   ├── sidebar/       → Node palette                       │
│  │   └── toolbar/       → Actions toolbar                    │
│  ├── hooks/             → State management hooks             │
│  ├── services/          → Business logic                     │
│  │   ├── engine/        → Workflow execution engine          │
│  │   └── executors/     → Node type executors                │
│  └── types/             → TypeScript definitions             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shared Layer                              │
├─────────────────────────────────────────────────────────────┤
│  shared/                                                     │
│  ├── components/        → ErrorBoundary, Toast, Loading     │
│  └── lib/               → API schemas (Zod), env validation │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input → Canvas → Node State → Workflow Engine → Executors → API → Output
     ↑                    ↓
     └──────── Undo/Redo History ────────────────────────────────┘
```

## Key Technologies

| Layer      | Technology              |
| ---------- | ----------------------- |
| Framework  | Next.js 16 (App Router) |
| Canvas     | @xyflow/react           |
| Styling    | Tailwind CSS 4          |
| Validation | Zod                     |
| Testing    | Vitest + Playwright     |
| Monitoring | Sentry                  |
| CI/CD      | GitHub Actions          |
