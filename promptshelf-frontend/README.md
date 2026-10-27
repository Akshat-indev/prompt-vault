# PromptShelf Frontend

A modern, developer-focused workspace for organizing, customizing, and reusing AI prompt templates with dynamic variable interpolation.

## Features

- **Prompt Library**: Manage reusable prompts with categories (Coding, Debugging, Writing, Research, Productivity, Other), tags, and favorites.
- **Dynamic Variable Builder**: Automatically detects `{{variable}}` syntax in prompt templates, dynamically generates input forms, and provides a real-time substituted preview.
- **Deterministic Prompt Generation**: Pure local string processing. No external AI API keys or network dependencies required for prompt compilation.
- **Robust Copying**: Browser Clipboard API with automatic fallback and temporary success indicators. Prevents accidental copying when required variables are missing.
- **Search & Filtering**: Search across title, description, content, and tags with keyboard shortcut (`/`), category filters, favorite toggles, and sorting.
- **Grid and List Views**: Switch between responsive card grid and dense list layouts.
- **Offline First**: Uses versioned browser `localStorage` (`promptshelf:v1`) as the primary user persistence layer, with an integrated REST API client for backend synchronization.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide React (Icons)

## Getting Started

### 1. Install dependencies

```bash
cd promptshelf-frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
VITE_API_URL=http://localhost:3001/api
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Architecture & Storage Note

The frontend uses `localStorage` (`promptshelf:v1`) as its primary, zero-config persistence layer. When the Express backend is running on `http://localhost:3001`, the sidebar displays an active "API Connected" badge and allows bidirectional synchronization.
