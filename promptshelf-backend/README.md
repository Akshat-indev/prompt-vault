# PromptShelf Backend API

Production-ready REST API service for PromptShelf, built with Node.js, Express, TypeScript, Zod, and the official OpenAI SDK.

## Features

- **Prompt CRUD**: Full Create, Read, Update, and Delete endpoints for prompt templates.
- **AI Prompt Intelligence**: Dedicated `POST /api/prompts/analyze` endpoint for automatic prompt categorization, purpose summarization, tag generation, generalization into reusable templates, and variable parameter identification.
- **Search & Filtering**: Search across title, description, content, and tags; filter by category and favorite status; sort by recency or title.
- **Request Validation**: Thorough schema validation with Zod on request bodies, params, and query strings.
- **Persistence**: File-backed JSON storage (`data/prompts.json`) with automatic seeding and in-memory fallback.
- **Security**: Strict CORS configuration, sanitized errors without leaking stack traces or API keys in production, and centralized error handling.

## Requirements

- Node.js >= 18 (Tested on Node v24)
- npm >= 9

## Getting Started

### 1. Install dependencies

```bash
cd promptshelf-backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development

# Optional: AI Prompt Intelligence
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
```

### 3. Run Development Server

```bash
npm run dev
```

The server starts at `http://localhost:3001`.

### 4. Build for Production

```bash
npm run build
npm start
```

## API Specification

### Health Check
- `GET /api/health` - Service health status, version, and uptime.

### AI Prompt Intelligence
- `GET /api/prompts/ai-status` - Check whether AI provider is configured and active model name.
- `POST /api/prompts/analyze` - Analyze and generalize raw prompt text into reusable template with variables.
  - Body: `{ "prompt": "Raw prompt text to analyze" }`
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "category": "Coding",
        "tags": ["python", "debugging"],
        "purpose": "Analyze and debug software issues.",
        "generalized_prompt": "Debug the following {{language}} code: {{code}}",
        "variables": [
          {
            "name": "language",
            "description": "Programming language",
            "example": "Python"
          },
          {
            "name": "code",
            "description": "Code snippet to analyze",
            "example": "def calculate(): pass"
          }
        ]
      }
    }
    ```

### Prompts
- `GET /api/prompts` - List all prompts.
- `GET /api/prompts/:id` - Retrieve a specific prompt by UUID.
- `POST /api/prompts` - Create a new prompt.
- `PUT /api/prompts/:id` - Update an existing prompt.
- `DELETE /api/prompts/:id` - Delete a prompt by UUID.
- `PATCH /api/prompts/:id/favorite` - Toggle or set favorite status.
- `POST /api/prompts/reset` - Reset prompt library to the original curated seed prompts.

## Storage Architecture Note

The backend uses a typed file-backed persistence layer in `data/prompts.json` with safe atomic writes. This ensures prompt data is retained across server restarts without requiring external database drivers or native compilation toolchains.
