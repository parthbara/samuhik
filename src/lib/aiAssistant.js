const FALLBACK_REPLIES = [
  'Hajur, yo item stock ma chha. Tapai kati quantity lina khojnu bhako ho?',
  'Hajur, maile bujhe. Tapai delivery location pathaidinuhos, ma order confirm garna help garchu.',
  'Hajur, payment link ani final total confirm garera pathauchhu.',
];

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last > first) {
      return JSON.parse(text.slice(first, last + 1));
    }
  }
  return null;
}

export async function generateAssistantReply({ conversation, inventory, orders = [] }) {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation, inventory, orders }),
    });

    if (!response.ok) throw new Error(`Gemini function failed: ${response.status}`);
    const payload = await response.json();
    const parsed = typeof payload.reply === 'string' ? safeJson(payload.reply) : payload;
    return {
      intent: parsed?.intent || payload.intent || 'general_inquiry',
      urgency: parsed?.urgency || payload.urgency || 'low',
      reply: parsed?.reply || payload.reply || FALLBACK_REPLIES[0],
      orderData: parsed?.orderData || payload.orderData || null,
    };
  } catch {
    const latest = conversation?.messages?.at(-1)?.text?.toLowerCase() || '';
    const isOrder = latest.includes('confirm') || latest.includes('order') || latest.includes('dinu');
    const quantityMatch = latest.match(/\b(\d+)\s*(pair|pcs|piece|ta|ota)?/);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    const item =
      inventory.find((entry) => latest.includes(entry.item.toLowerCase().split(' ')[0].toLowerCase())) ||
      inventory.find((entry) => /bluecut|lens/.test(latest) && entry.item.toLowerCase().includes('bluecut')) ||
      inventory[0];
    return {
      intent: isOrder ? 'order_confirmed' : 'general_inquiry',
      urgency: latest.includes('refund') || latest.includes('urgent') ? 'high' : 'low',
      reply: isOrder
        ? `Hajur, ${quantity} ${item?.item || 'item'} ko order reserved gareko chhu. Payment confirm bhayepachi dispatch process start hunchha.`
        : FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)],
      orderData: isOrder
        ? {
            item: item?.item || 'Demo item',
            quantity,
            price: item?.price || null,
            total: item?.price ? item.price * quantity : null,
          }
        : null,
    };
  }
}
