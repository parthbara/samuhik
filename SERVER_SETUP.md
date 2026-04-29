# Samuhik Remote Server Setup

This guide outlines how to configure the 24/7 PC to act as the backend engine for Samuhik. You will need to run LM Studio for the AI and Docker for the WhatsApp bridge.

## 1. AI Setup (LM Studio)
1. Download Gemma 4 E4B in LM Studio.
2. Go to the Local Server tab. Check **Enable CORS**.
3. Start the server (Port 1234).
4. Use Ngrok to expose the port: `ngrok http 1234`.
5. Send the generated HTTPS URL to the frontend developer to put in `VITE_LLM_BASE_URL`.

## 2. Middleware Setup (Evolution API via Docker)
1. Install Docker Desktop.
2. Create a `docker-compose.yml` file on your desktop with the standard Atendimento Smart Evolution API and Redis configuration (Port 8080).
3. Run `docker-compose up -d`.
4. Run a second Ngrok instance for the API: `ngrok http 8080`.
5. Send this second URL to the frontend developer for `VITE_EVOLUTION_API_URL`.
