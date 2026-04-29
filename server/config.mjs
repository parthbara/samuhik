import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Default LLM target — the existing CORS bridge running on port 8787
  lmStudioBaseUrl: (process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:8787').replace(/\/$/, '') + '/v1',
  lmStudioModel: process.env.LM_STUDIO_MODEL || 'gemma-4-e4b-uncensored-hauhaucs-aggressive',
  llmTimeoutMs: Number(process.env.LLM_TIMEOUT_MS) || 30000,
  llmMaxRetries: Number(process.env.LLM_MAX_RETRIES) || 2,

  // Evolution API defaults (can be overridden per tenant in DB)
  evolutionApiUrl: process.env.EVOLUTION_API_URL,
  evolutionApiKey: process.env.EVOLUTION_API_KEY,
  evolutionInstance: process.env.EVOLUTION_INSTANCE,

  // Secret for HMAC webhook verification (optional, recommended in prod)
  evolutionWebhookSecret: process.env.EVOLUTION_WEBHOOK_SECRET,
};

const required = ['supabaseUrl', 'supabaseServiceKey'];
for (const key of required) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable: ${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
  }
}
