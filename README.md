# Samuhik Omnichannel Inbox Demo

Samuhik is a Netlify-ready React demo for a multi-tenant omnichannel inbox. It uses the existing Supabase project through environment variables and does not require local backend services or database migrations.

## Local Development

```bash
npm install
npm run dev -- --port 5173
```

Open `http://localhost:5173`.

## Environment Variables

Set these locally in `.env` and in the Netlify dashboard:

```text
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DEMO_MODE=true
```

For the Gemini serverless integration phase, add this only in Netlify function environment variables:

```text
GEMINI_API_KEY=your-gemini-api-key
```

Do not expose Gemini keys with a `VITE_` prefix.

## Netlify Deploy

The included `netlify.toml` builds with `npm run build` and publishes `dist`.

The demo intentionally does not include SQL migrations or Supabase backend setup instructions. It must run against the existing Supabase schema and keys.
