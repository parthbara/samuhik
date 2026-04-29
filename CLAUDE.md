# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server (http://localhost:5173), proxies /api/llm -> LM Studio at localhost:1234
npm run build        # production build -> dist/
npm run preview      # preview the production build
npm run llm:bridge   # start the local CORS bridge (port 8787) that forwards to LM Studio at port 1234
```

There is no test suite and no linter configured.

## Architecture

This is a single-page React app (Vite + Tailwind) that demos a unified AI inbox for multi-channel commerce messaging (WhatsApp, Instagram, Messenger). All state lives in `src/App.jsx` with `useState`; there is no external state library.

### Three views (toggled by `DemoNavigation`)

| View | Purpose |
|------|---------|
| **Admin Inbox** | Three-column layout: conversation queue (`QueuePanel`), active chat (`ChatPanel`), customer context sidebar (`ContextPanel`) |
| **Customer Demo** | Simulates the buyer side; messages flow into the same shared state so both admin and customer views stay in sync |
| **Spreadsheet** | Read-only table view of inventory and order activity derived from `conversations` and `posInventory` state |

### AI reply flow (`handleCustomerMessage` in App.jsx)

1. Customer message is appended to conversation state.
2. `generateAutoReply` (`src/utils/llmService.js`) is called — sends the full message history plus live inventory as a structured JSON-schema prompt to the LM Studio OpenAI-compatible endpoint.
3. LLM returns `{ intent, reply, orderData }`. The `intent` drives side effects:
   - `"order"` → `processOrder` fuzzy-matches the item name against `posInventory` and deducts stock.
   - `"escalate"` → `disableAiForChat` sets `aiEnabled: false` and adds `"Needs Human"` tag.
4. On LLM error, the fallback escalates automatically.

### LLM connectivity — three modes

| Mode | How |
|------|-----|
| **Local dev** | Vite proxy (`/api/llm` → `http://localhost:1234/v1`). LM Studio must be running with CORS enabled. |
| **Production (Netlify)** | `netlify/functions/llm.mjs` is a serverless proxy; reads `LM_STUDIO_BASE_URL` env var (your HTTPS tunnel URL) and forwards requests. |
| **Browser URL override** | Append `?llm=<url>` to any URL; value is persisted to `localStorage` as `samuhik-llm-base-url`. |

### WhatsApp / real messaging (not wired in the UI yet)

`src/services/evolutionApiService.js` contains helpers for the Evolution API (Docker-based WhatsApp bridge):
- `parseIncomingWebhook(payload)` normalises incoming webhook payloads to the internal conversation shape.
- `sendOutboundMessage(platform, conversationId, text)` sends replies via Evolution API.
- Requires `VITE_EVOLUTION_API_URL` and `VITE_EVOLUTION_API_KEY` env vars.

### Environment variables

| Variable | Where used | Purpose |
|----------|-----------|---------|
| `VITE_LLM_BASE_URL` | `llmService.js` | Override default LLM endpoint (`/api/llm`) at build time |
| `VITE_LM_STUDIO_MODEL` | `llmService.js` | Override default model name |
| `VITE_EVOLUTION_API_URL` | `evolutionApiService.js` | Evolution API base URL |
| `VITE_EVOLUTION_API_KEY` | `evolutionApiService.js` | Evolution API key |
| `LM_STUDIO_BASE_URL` | Netlify function | HTTPS tunnel pointing at LM Studio (server-side only) |
| `LM_STUDIO_BRIDGE_PORT` | `lmstudio-cors-bridge.mjs` | Bridge listen port (default 8787) |
| `LM_STUDIO_ORIGIN` | `lmstudio-cors-bridge.mjs` | LM Studio address (default `http://127.0.0.1:1234`) |

Copy `.env.example` to `.env` and fill in values for local development.

## Key design constraints

- The LLM prompt enforces a strict JSON schema response (`response_format: json_schema`) with three possible intents: `chat`, `order`, `escalate`. The model is expected to use `<|think|>` privately before outputting the JSON.
- `parseJsonPayload` in `llmService.js` strips markdown fences and `<think>…</think>` blocks before parsing, so the model can reason before its structured output.
- Inventory fuzzy matching (`processOrder`) scores items by exact match > substring > token overlap — no external library.
- The app targets Romanized Nepali customer messages; the system prompt and sample conversations reflect this.
