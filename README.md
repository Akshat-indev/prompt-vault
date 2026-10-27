# PromptShelf

**PromptShelf** is a personal workspace for saving, organizing, customizing, and reusing AI prompt templates. It features dynamic template variable detection (e.g. `{{role}}`, `{{task}}`, `{{language}}`), automatic form generation, live substituted previewing, one-click copying to ChatGPT, Claude, Cursor, and an integrated **AI Prompt Intelligence** system for turning specific prompts into generalized templates.

> **Deterministic Core**: Prompt customization and substitution are 100% deterministic local string processing. No external AI APIs, tokens, or API keys are required for browsing, searching, editing, or copying prompts.

---

## Workspace Structure

The project is structured into two independent applications:

```
PromptVault/
├── promptshelf-frontend/       # React 19 + Vite + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── components/         # Layout & common modal/toast UI
│   │   ├── features/library/   # Library view, Prompt cards, filters, search
│   │   ├── features/editor/    # Create/Edit modal with live variable detector
│   │   ├── features/builder/   # Variable form, live preview, copy substitution
│   │   ├── features/analyzer/  # AI Prompt Intelligence modal & side-by-side view
│   │   ├── hooks/              # Custom usePrompts hook
│   │   ├── lib/                # Storage abstraction & REST API client
│   │   ├── types/              # Prompt, categories, and filter interfaces
│   │   └── utils/              # Template parsing, clipboard fallback, date
│   ├── README.md
│   └── .env.example
│
├── promptshelf-backend/        # Node.js + Express + TypeScript + Zod + OpenAI SDK
│   ├── src/
│   │   ├── controllers/        # Prompt, health, and AI analyze controllers
│   │   ├── middleware/         # Zod validation & centralized error handler
│   │   ├── routes/             # REST routes (/api/prompts, /api/health)
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Storage service & AI Service
│   │   ├── types/              # Server DTOs and models
│   │   ├── app.ts              # Express application factory with CORS
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── README.md
│   └── .env.example
│
└── README.md                   # Master workspace guide
```

---

## Quickstart Guide

### Prerequisites
- Node.js >= 18 (Tested on v24.20.0)
- npm >= 9

---

### 1. Run the Backend API

```bash
cd promptshelf-backend
npm install
npm run dev
```

- Server URL: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`
- Prompts REST API: `http://localhost:3001/api/prompts`

### 2. Run the Frontend Workspace

In a second terminal:

```bash
cd promptshelf-frontend
npm install
npm run dev
```

- App URL: `http://localhost:5173`

The frontend opens directly into the functional workspace with pre-populated developer templates.

---

## AI Prompt Intelligence (Optional LLM Integration)

PromptShelf includes an AI Prompt Intelligence system that analyzes raw prompts, identifies their purpose, categorizes them, generates tags, and generalizes specific values into reusable `{{variable_name}}` templates.

### Configuring AI Provider

In `promptshelf-backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
# Optional custom base URL (e.g. for Groq, OpenRouter, Ollama, Azure, or proxy):
# OPENAI_BASE_URL=https://api.openai.com/v1
```

- The API key remains strictly server-side and is never sent to or visible in the browser.
- When an API key is not configured, the rest of PromptShelf (browsing, searching, editing, variables builder, copying) remains completely functional.
- The UI displays an inline guidance card if a user tries to run AI analysis without a configured key.

---

## Environment Variables

### Backend (`promptshelf-backend/.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP port for the Express REST API |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Permitted CORS origin(s) |
| `NODE_ENV` | `development` | Set to `production` for production builds |
| `OPENAI_API_KEY` | *(optional)* | OpenAI API key for AI Prompt Intelligence |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use for analysis & generalization |
| `OPENAI_BASE_URL` | *(optional)* | Optional custom base URL for OpenAI-compatible proxies |

### Frontend (`promptshelf-frontend/.env`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001/api` | Base URL for the backend REST API |

---

## Automated Test Suites

Both applications include comprehensive automated test suites:

```bash
# Test backend REST endpoints & AI validation
npm run test:backend

# Test frontend template parsing & variable substitution
npm run test:frontend
```

## Deploying to Vercel and Render

The repository is deployable as a standard monorepo. Deploy the frontend from
`promptshelf-frontend` on Vercel and create the backend from the root
`render.yaml` Blueprint on Render.

1. Deploy the Vercel project with **Root Directory** set to
   `promptshelf-frontend`. The Vercel build configuration is in that folder's
   `vercel.json`. The first deployment can use the default API URL; the backend
   URL is not known yet.
2. In Render, create a new Blueprint from this repository. Set the
   `FRONTEND_ORIGIN` value to the Vercel production URL (for example,
   `https://your-project.vercel.app`) when prompted.
3. After the Render service is live, set `VITE_API_URL` in the Vercel project
   to `https://<your-render-service>.onrender.com/api` and redeploy the
   frontend.
4. Optionally add `GEMINI_API_KEY` (and `GEMINI_MODEL`) to the Render service
   to enable AI prompt analysis.

The Render Blueprint uses its free plan. Free Render services have ephemeral
storage, so backend JSON data may reset after a restart or redeploy. The
frontend's browser-local prompt library remains stored in localStorage.
