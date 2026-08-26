// Reference rates used only when both Gemini and the live gold API are unreachable.
const GOLD_REFERENCE = { fine: 162800, tejabi: 157500, silver: 2050 };

const FALLBACK_REPLIES = [
  'Hajur, yo item stock ma cha. Tapai kati quantity lina khojnu bhako ho?',
  'Hajur, maile bujhe. Tapai delivery location pathaidinuhos, ma order confirm garna help garchu.',
  'Hajur, payment link ani final total confirm garera pathauchhu.',
];

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last  = text.lastIndexOf('}');
    if (first !== -1 && last > first) return JSON.parse(text.slice(first, last + 1));
  }
  return null;
}

function isGoldQuery(text) {
  const t = text.toLowerCase();
  return /\b(gold|suna|tola|tejabi|chhaassi|chandi|silver)\b/.test(t)
      && /\b(rate|price|bhau|dam|kati|kitna|how much)\b/.test(t);
}

export async function generateAssistantReply({ conversation, inventory, orders = [] }) {
  try {
    const tenantId     = conversation.tenant_id;
    const storePrompt  = localStorage.getItem(`samuhik_system_prompt_${tenantId}`) || '';
    const shopOwner    = localStorage.getItem(`samuhik_shop_owner_${tenantId}`) || '';
    const contactNumber = localStorage.getItem(`samuhik_contact_number_${tenantId}`) || '';

    const savedEngine = localStorage.getItem('samuhik_platform_engine');
    const engine      = savedEngine ? JSON.parse(savedEngine) : {
      defaultModel:       'gemini-2.5-flash',
      webhookReceiverUrl: '/.netlify/functions/gemini',
    };

    const response = await fetch(engine.webhookReceiverUrl || '/.netlify/functions/gemini', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      // Server ignores body.model for routing — it classifies complexity itself.
      // We still send it as a hint for the platform engine override case.
      body: JSON.stringify({
        conversation,
        inventory,
        orders,
        tenantPrompt:  storePrompt,
        shopOwner,
        contactNumber,
        model:         engine.defaultModel,
        temperature:   engine.temperature,
        maxTokens:     engine.maxTokens,
      }),
    });

    if (!response.ok) throw new Error(`Gemini function failed: ${response.status}`);
    const payload = await response.json();
    const parsed  = typeof payload.reply === 'string' ? safeJson(payload.reply) : payload;
    return {
      intent:    parsed?.intent    || payload.intent    || 'general_inquiry',
      urgency:   parsed?.urgency   || payload.urgency   || 'low',
      reply:     parsed?.reply     || payload.reply     || FALLBACK_REPLIES[0],
      orderData: parsed?.orderData || payload.orderData || null,
    };
  } catch (error) {
    // ── Offline / no-key fallback ─────────────────────────────────────────────
    console.error('AI Assistant Error:', error);
    const latest = conversation?.messages?.at(-1)?.text || '';

    // Gold price: return reference rates with a clear "indicative" caveat
    if (isGoldQuery(latest)) {
      return {
        intent:    'general_inquiry',
        urgency:   'low',
        reply:     `Hajur! Indicative gold rate (reference): Fine Gold (24K) — Rs. ${GOLD_REFERENCE.fine.toLocaleString()} / tola, Tejabi (22K) — Rs. ${GOLD_REFERENCE.tejabi.toLocaleString()} / tola, Chandi — Rs. ${GOLD_REFERENCE.silver.toLocaleString()} / tola. Live rate confirm garna please ek choti store ma aaunus la.`,
        orderData: null,
      };
    }

    const text         = latest.toLowerCase();
    const isOrder      = /confirm|order|dinu/.test(text);
    const quantityMatch = text.match(/\b(\d+)\s*(pair|pcs|piece|ta|ota)?\b/);
    const quantity     = quantityMatch ? Number(quantityMatch[1]) : 1;
    const item         = inventory.find(e => text.includes(e.item.toLowerCase().split(' ')[0])) || inventory[0];

    return {
      intent:    isOrder ? 'order_confirmed' : 'general_inquiry',
      urgency:   /refund|urgent/.test(text) ? 'high' : 'low',
      reply:     isOrder
        ? `Hajur, ${quantity} ${item?.item || 'item'} ko order reserved gareko chhu. Payment confirm bhayepachi dispatch process start hunchha.`
        : FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)],
      orderData: isOrder ? {
        item:     item?.item || 'Demo item',
        quantity,
        price:    item?.price || null,
        total:    item?.price ? item.price * quantity : null,
      } : null,
    };
  }
}
