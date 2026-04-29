import { supabase } from '../db/client.mjs';

function fuzzyMatch(items, query) {
  const q = String(query).toLowerCase().trim();
  if (!q) return null;

  const scored = items
    .map((item) => {
      const name = item.name.toLowerCase();
      const tokens = name.split(/\s+/);
      const score =
        name === q ? 100
        : name.includes(q) ? 80
        : q.includes(name) ? 70
        : tokens.filter((t) => q.includes(t)).length * 10;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  return best && best.score > 0 ? best.item : null;
}

export async function processOrder({ tenantId, conversationId, contactId, orderData }) {
  const quantity = Math.max(1, Math.round(Number(orderData?.quantity) || 1));
  const requestedItem = String(orderData?.item || '').trim();
  if (!requestedItem) return null;

  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .eq('tenant_id', tenantId);

  const matched = fuzzyMatch(inventory || [], requestedItem);
  const unitPrice = matched?.price ?? null;
  const totalAmount = unitPrice !== null ? unitPrice * quantity : null;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      contact_id: contactId,
      inventory_id: matched?.id ?? null,
      item_name: requestedItem,
      quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('[orderService] insert failed:', error.message);
    return null;
  }

  if (matched) {
    await supabase
      .from('inventory')
      .update({ stock: Math.max(0, matched.stock - quantity) })
      .eq('id', matched.id);
  }

  return order;
}
