/**
 * POS Sync — Inbound webhook receiver
 * POST /.netlify/functions/pos-sync
 *
 * Your POS system (PasalOS, Lightspeed, custom) POSTs to this URL
 * whenever inventory changes. Samuhik upserts the data into Supabase.
 *
 * Required environment variables (set in Netlify dashboard):
 *   SAMUHIK_POS_API_KEY       — shared secret, sent by the POS in x-api-key header
 *   SUPABASE_SERVICE_ROLE_KEY — bypasses RLS for server-side writes
 *   VITE_SUPABASE_URL         — your Supabase project URL
 *
 * Expected request:
 *   Header:  x-api-key: <SAMUHIK_POS_API_KEY>
 *   Body:    { "tenant_id": "uuid", "items": [{ "sku", "name", "price", "stock" }] }
 *
 * PasalOS-specific notes:
 *   - PasalOS webhook payload uses "product_code" for SKU → mapped below
 *   - PasalOS sends "selling_price" not "price" → mapped below
 *   - PasalOS sends "quantity_on_hand" not "stock" → mapped below
 *   All three fields have a normalise() pass so both formats work simultaneously.
 */

import { createClient } from '@supabase/supabase-js';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-signature',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

/** Normalise a single item object from any POS format into Samuhik's shape */
function normaliseItem(raw) {
  return {
    // PasalOS uses "product_code", standard uses "sku"
    sku: String(raw.sku || raw.product_code || raw.barcode || '').trim(),
    // PasalOS uses "product_name", standard uses "name"
    name: String(raw.name || raw.product_name || raw.title || raw.sku || '').trim(),
    // PasalOS uses "selling_price", standard uses "price"
    price: Number(raw.price ?? raw.selling_price ?? raw.unit_price ?? 0),
    // PasalOS uses "quantity_on_hand", standard uses "stock"
    stock: Number(raw.stock ?? raw.quantity_on_hand ?? raw.qty ?? raw.quantity ?? 0),
    // Optional category for future filtering
    category: raw.category || raw.product_category || null,
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // ── Authentication ────────────────────────────────────────────────────────
  const incomingKey = event.headers['x-api-key'] || event.headers['x-Api-Key'];
  const expectedKey = process.env.SAMUHIK_POS_API_KEY;

  if (expectedKey && incomingKey !== expectedKey) {
    console.error('[pos-sync] Unauthorized — bad or missing x-api-key');
    return json(401, { error: 'Unauthorized. Set x-api-key header matching SAMUHIK_POS_API_KEY.' });
  }

  if (!expectedKey) {
    // Key not configured yet — allow through but flag it in logs
    console.warn('[pos-sync] SAMUHIK_POS_API_KEY not set — running unauthenticated (dev/setup mode)');
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body;
  try {
    let raw = event.body || '{}';
    if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const tenantId = body.tenant_id;

  // Support both { items: [...] } and PasalOS bulk format { products: [...] }
  const rawItems = body.items || body.products || body.inventory || [];

  if (!tenantId) return json(400, { error: 'tenant_id is required' });
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return json(400, { error: 'items array is required and must be non-empty' });
  }

  // ── Normalise items ───────────────────────────────────────────────────────
  const items = rawItems.map(normaliseItem);
  const invalid = items.filter(i => !i.sku);
  if (invalid.length > 0) {
    return json(400, { error: `${invalid.length} item(s) missing sku/product_code field` });
  }

  // ── Supabase upsert ───────────────────────────────────────────────────────
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // Supabase not wired yet — return simulated success so the POS can test the connection
    console.warn('[pos-sync] Supabase not configured — returning simulated success');
    return json(200, {
      ok: true,
      synced: items.length,
      simulated: true,
      message: 'Endpoint reachable. Configure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify to persist data.',
      items: items.map(i => i.sku),
    });
  }

  // Use the service role key so this server-side write bypasses RLS
  const supabase = createClient(supabaseUrl, serviceKey);

  const rows = items.map(item => ({
    tenant_id: tenantId,
    sku: item.sku,
    name: item.name || item.sku,
    price: item.price,
    stock: item.stock,
  }));

  const { error: upsertError } = await supabase
    .from('inventory')
    .upsert(rows, { onConflict: 'tenant_id,sku' });

  if (upsertError) {
    console.error('[pos-sync] Supabase upsert error:', upsertError.message);
    return json(500, { error: 'Database write failed', detail: upsertError.message });
  }

  console.log(`[pos-sync] Synced ${rows.length} items for tenant ${tenantId}`);
  return json(200, {
    ok: true,
    synced: rows.length,
    message: `Synced ${rows.length} item(s) for tenant ${tenantId}`,
    items: rows.map(r => r.sku),
  });
}
