const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

function normalizePlatform(rawPlatform) {
  const platform = String(rawPlatform || "whatsapp").toLowerCase();

  if (platform.includes("instagram")) return "instagram";
  if (platform.includes("messenger") || platform.includes("facebook")) return "messenger";
  return "whatsapp";
}

export async function parseIncomingWebhook(payload) {
  const event = payload?.data ?? payload;
  const platform = normalizePlatform(event?.platform || event?.instance || payload?.event);
  const conversationId =
    event?.remoteJid ||
    event?.key?.remoteJid ||
    event?.chatId ||
    event?.sender ||
    event?.from ||
    crypto.randomUUID();
  const text =
    event?.message?.conversation ||
    event?.message?.extendedTextMessage?.text ||
    event?.body ||
    event?.text ||
    "";

  return {
    id: String(conversationId),
    customerName: event?.pushName || event?.profileName || event?.name || "New Customer",
    platform,
    tags: [platform],
    aiEnabled: true,
    messages: text
      ? [
          {
            from: "customer",
            time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            text,
          },
        ]
      : [],
  };
}

export async function sendOutboundMessage(platform, conversationId, text) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error("Evolution API environment variables are not configured.");
  }

  const response = await fetch(`${EVOLUTION_API_URL.replace(/\/$/, "")}/message/sendText/${platform}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY,
      Authorization: `Bearer ${EVOLUTION_API_KEY}`,
    },
    body: JSON.stringify({
      number: conversationId,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Evolution API request failed with ${response.status}`);
  }

  return response.json();
}
