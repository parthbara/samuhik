# Samuhik Netlify Demo Setup

## Netlify Environment Variables

Paste these into Netlify site settings:

```text
VITE_SUPABASE_URL=your-existing-supabase-url
VITE_SUPABASE_ANON_KEY=your-existing-supabase-anon-key
VITE_DEMO_MODE=true
GEMINI_API_KEY=your-gemini-api-key
```

Keep `GEMINI_API_KEY` server-side only. Do not create a `VITE_GEMINI_API_KEY`.

## Two-Tab Simulator Demo

1. Open the deployed app in two tabs.
2. Tab A login: `admin@demo.com` / `demo1234`.
3. Tab B login: `customer@demo.com` / `demo1234`.
4. In Tab B, switch between WhatsApp, Instagram, Messenger, and TikTok.
5. Send one of the suggested customer prompts.
6. Watch Tab A receive the same conversation in the inbox.

The simulator uses browser storage as a local message bus. It is intentionally not connected to Meta APIs, so it works without WhatsApp Business verification, Meta app review, webhook verification, or backend schema changes.

## Real Meta API Path Later

For production, use one of these paths:

- Chatwoot or another inbox provider as the Meta connector, then forward normalized messages into Samuhik.
- WhatsApp Cloud API webhooks into a Netlify function, then insert into the existing Supabase tables.
- A provider such as Twilio/360dialog if the client wants managed WhatsApp onboarding.

Do not change Supabase schema or RLS during this demo.
