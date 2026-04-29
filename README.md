# Samuhik AI Inbox Demo

## Local Development

```bash
npm install
npm run dev -- --port 5173
```

Open `http://localhost:5173`.

LM Studio should be running at `http://127.0.0.1:1234/v1` with the model:

```text
gemma-4-e4b-uncensored-hauhaucs-aggressive
```

## Netlify Deploy

Netlify settings are already in `netlify.toml`.

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

The deployed app uses a Netlify Function at `/api/llm/*`. That function forwards requests to your PC through an HTTPS tunnel.

This is the setup that works across phones, tablets, and other laptops while your PC is on:

1. Start LM Studio local server.
2. Run the local CORS bridge:

```bash
npm run llm:bridge
```

3. Expose the bridge with an HTTPS tunnel.

Example target for any tunnel tool:

```text
http://127.0.0.1:8787
```

The tunnel should give you a public HTTPS URL, for example:

```text
https://your-tunnel.example.com
```

4. In Netlify, set this environment variable:

```text
LM_STUDIO_BASE_URL=https://your-tunnel.example.com/v1
```

5. Redeploy the site.
6. Open the Netlify URL on any device.

Request path in production:

```text
Netlify app -> /api/llm/chat/completions -> Netlify Function -> HTTPS tunnel -> your PC bridge -> LM Studio
```

## Local Browser Override

For quick local testing, the app still supports a browser override:

```text
https://your-site.netlify.app/?lmstudio=https://your-tunnel.example.com/v1
```

That value is saved in browser local storage as `samuhik-llm-base-url`. For reliable public demos, prefer the Netlify `LM_STUDIO_BASE_URL` function setup above.
