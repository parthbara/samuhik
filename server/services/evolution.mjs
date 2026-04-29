import { config } from '../config.mjs';

export async function sendOutboundMessage({ tenant, conversationId, text }) {
  const apiUrl = (tenant.evolution_api_url || config.evolutionApiUrl || '').replace(/\/$/, '');
  const apiKey = tenant.evolution_api_key || config.evolutionApiKey;
  const instance = tenant.evolution_instance || config.evolutionInstance;

  if (!apiUrl || !apiKey || !instance) {
    throw new Error(`Evolution API not configured for tenant ${tenant.id}`);
  }

  const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
    body: JSON.stringify({
      number: conversationId,   // WhatsApp JID or phone number
      text,
      delay: 0,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Evolution API ${res.status}: ${body}`);
  }

  return res.json();
}

// Resolve tenant from the Evolution instance name embedded in a webhook
export function extractInstanceFromPayload(payload, queryInstance) {
  return (
    queryInstance ||
    payload?.instance ||
    payload?.data?.instance ||
    null
  );
}

// Normalise Evolution webhook payload into a flat inbound message shape
export function parseEvolutionWebhook(payload) {
  const data = payload?.data ?? payload;
  const msg = data?.message ?? {};

  const text =
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    data?.body ||
    data?.text ||
    '';

  const platformId =
    data?.key?.remoteJid ||
    data?.remoteJid ||
    data?.chatId ||
    data?.sender ||
    data?.from ||
    null;

  const name = data?.pushName || data?.profileName || data?.name || 'New Customer';

  const rawPlatform = String(data?.platform || payload?.instance || '').toLowerCase();
  const platform =
    rawPlatform.includes('instagram') ? 'instagram'
    : rawPlatform.includes('messenger') || rawPlatform.includes('facebook') ? 'messenger'
    : 'whatsapp';

  return { text: text.trim(), platformId, name, platform };
}
