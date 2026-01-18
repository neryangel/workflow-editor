# Deployment Guide

## Local Development

```bash
# Clone and install
git clone <repo-url>
cd workflow-editor
npm install

# Copy environment
cp .env.example .env.local

# Start development
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Docker Deployment

```bash
# Build image
docker build -t workflow-editor .

# Run container
docker run -p 3000:3000 workflow-editor
```

## Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables:
    - `GEMINI_API_KEY` (optional)
    - `NEXT_PUBLIC_SENTRY_DSN` (optional)
3. Deploy

## Environment Variables

| Variable                 | Required | Description                          |
| ------------------------ | -------- | ------------------------------------ |
| `GEMINI_API_KEY`         | No       | Gemini API key (mock mode if absent) |
| `NEXT_PUBLIC_SENTRY_DSN` | No       | Sentry error tracking                |

## Health Checks

| Endpoint         | Purpose   |
| ---------------- | --------- |
| `/`              | Home page |
| `/workflows/new` | Editor    |
| `/api/ai/llm`    | LLM API   |
