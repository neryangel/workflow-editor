# Workflow Editor 🎨

A professional-grade visual workflow editor for creative AI pipelines, built with Next.js 16 and React Flow.

![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Tests](https://img.shields.io/badge/Tests-62%20Passing-green)
![ESLint](https://img.shields.io/badge/ESLint-0%20Errors-brightgreen)
![Build](https://img.shields.io/badge/Build-Passing-success)

## ✨ Features

- 🎯 **Visual Node Editor** - Drag & drop workflow building
- 🤖 **AI Integration** - LLM, Image Gen, Video Gen nodes
- ⚡ **Real-time Execution** - Watch workflows run live
- 💾 **Persistence** - Save/load workflows locally
- ⌨️ **Keyboard Shortcuts** - Undo/Redo, Delete, Save
- 🧪 **Fully Tested** - 62 tests (Unit + E2E)

## 🚀 Quick Start

```bash
# Install
npm install

# Development
npm run dev

# Open http://localhost:3000/workflows/new
```

## 🧪 Testing

```bash
npm run test:unit     # 41 unit tests (Vitest)
npm run test:e2e      # 21 E2E tests (Playwright)
npm run test:coverage # With coverage report
```

## 🏗️ Tech Stack

| Category   | Technology          |
| ---------- | ------------------- |
| Framework  | Next.js 16          |
| Canvas     | @xyflow/react       |
| Styling    | Tailwind CSS 4      |
| Testing    | Vitest + Playwright |
| CI/CD      | GitHub Actions      |
| Monitoring | Sentry              |

## 📁 Project Structure

```
├── app/                    # Next.js pages & API
│   ├── api/ai/llm/        # LLM API endpoint
│   ├── api/run-workflow/  # Workflow execution
│   └── workflows/new/     # Editor page
├── features/workflow-editor/
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # Business logic
│   └── types/             # TypeScript types
├── shared/                # Shared utilities
└── tests/                 # Test suites
```

## 🛡️ Security

- ✅ HSTS, XSS Protection, CSP headers
- ✅ Dependabot automated updates
- ✅ Environment validation with Zod

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feat/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push (`git push origin feat/amazing`)
5. Open Pull Request

Uses [Conventional Commits](https://conventionalcommits.org/).

## 📄 License

MIT
