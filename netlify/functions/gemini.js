// ─── Model routing ────────────────────────────────────────────────────────────
// All models are free-tier Gemini API. Complexity scored server-side.
// Verify IDs at: https://ai.google.dev/gemini-api/docs/models
const MODEL_ROUTING = {
  simple:  'gemini-2.5-flash-lite',  // greetings, single stock checks — fastest free option
  medium:  'gemini-2.5-flash',       // orders, multi-step — main workhorse
  complex: 'gemini-2.5-flash',       // disputes/payments — same model, larger token window
};
// Opportunistic extra tier, tried only after every Gemini model above is exhausted.
// Gemma's availability on the free generateContent endpoint isn't documented the way
// the Gemini IDs are, so this is deliberately last and deliberately non-fatal: if the
// ID 404s, the waterfall logs it and moves on rather than failing the reply.
// Override with GEMMA_MODEL in Netlify once you've confirmed an ID in AI Studio.
// Gemma also doesn't JSON-format reliably, hence the extra prompt enforcement below.
const GEMMA_FALLBACK = process.env.GEMMA_MODEL || 'gemma-3-27b-it';

function classifyComplexity(messages, tags = []) {
  const latest = (messages.at(-1)?.text || '').toLowerCase();
  const count  = messages.length;

  if (
    count > 8 ||
    latest.length > 150 ||
    tags.includes('Needs Human') ||
    /refund|dispute|complain|problem|broke|wrong|cheat|fraud|angry|frustrated/.test(latest) ||
    /payment|qr|esewa|khalti|bank|transfer|paisa/.test(latest)
  ) return 'complex';

  if (
    count <= 2 &&
    latest.length < 40 &&
    /^(hi|hello|namaste|hey|yo|k cha|ok|thik|available\?|price\?|cha\?|stock\?)/.test(latest.trim())
  ) return 'simple';

  return 'medium';
}

// ─── Live Nepal gold price ────────────────────────────────────────────────────
// Fetches XAU/USD (Yahoo Finance) + USD→NPR (exchangerate-api), converts to tola.
// Module-level cache survives within a warm Netlify function instance (~1 hr TTL).
let _goldCache = null;
let _goldCacheAt = 0;
const GOLD_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchGoldRates() {
  if (_goldCache && Date.now() - _goldCacheAt < GOLD_CACHE_TTL) {
    return _goldCache;
  }
  try {
    // COMEX gold futures (GC=F) as the XAU/USD proxy — keyless, and the only free
    // spot source that still answers. The previous provider, metals.live, has been
    // returning 404 for every request, which is why this silently served the stale
    // reference numbers below on every single gold question.
    // exchangerate-api.com free tier works from Lambda/Netlify without issues.
    const [metalsRes, fxRes] = await Promise.all([
      fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d',
        { headers: { 'User-Agent': 'Mozilla/5.0' } } // Yahoo 403s an empty UA
      ),
      fetch('https://api.exchangerate-api.com/v4/latest/USD'),
    ]);
    if (!metalsRes.ok) throw new Error(`gold feed HTTP ${metalsRes.status}`);
    if (!fxRes.ok)     throw new Error(`fx feed HTTP ${fxRes.status}`);

    const metalsData = await metalsRes.json();
    const fxData     = await fxRes.json();

    const xauUsd  = metalsData?.chart?.result?.[0]?.meta?.regularMarketPrice; // USD/troy oz
    const nprRate = fxData?.rates?.NPR;                                       // NPR per USD
    if (!xauUsd)  throw new Error('no regularMarketPrice in gold response');
    if (!nprRate) throw new Error('no NPR rate in fx response');

    // 1 tola = 11.6638 g, 1 troy oz = 31.1035 g  →  factor ≈ 0.37499
    const tolaFactor = 11.6638 / 31.1035;
    const fineNpr    = Math.round(xauUsd * nprRate * tolaFactor);
    const tejabiNpr  = Math.round(fineNpr * (22 / 24)); // Tejabi = 22K

    _goldCache   = { fine: fineNpr, tejabi: tejabiNpr, source: 'live' };
    _goldCacheAt = Date.now();
    console.log(`[GOLD] live: XAU $${xauUsd}/oz, NPR ${nprRate}/USD → Rs ${fineNpr}/tola`);
    return _goldCache;
  } catch (err) {
    // Reference rates keep the AI answering, but they go stale fast, so cache the
    // failure briefly rather than re-hitting a dead feed on every gold question.
    console.warn('[GOLD] live fetch failed, using reference rates:', err.message);
    _goldCache   = { fine: 162800, tejabi: 157500, source: 'reference' };
    _goldCacheAt = Date.now() - (GOLD_CACHE_TTL - 5 * 60 * 1000); // retry in 5 min
    return _goldCache;
  }
}

function isGoldQuery(messages) {
  const recent = messages.slice(-3).map(m => m.text || '').join(' ').toLowerCase();
  return /\b(gold|suna|tola|tejabi|chhaassi|chandi|silver)\b/.test(recent)
      && /\b(rate|price|bhau|dam|kati|kitna|how much|quanto)\b/.test(recent);
}

// ─── Core system prompt ───────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are the official AI assistant for the shop mentioned in the STORE SPECIFIC CONTEXT.

Respond as a professional Sales & Support Concierge for this specific shop. Your goal is to provide a "tons smoother" experience by guiding the customer through these stages:

STAGE 1: GREETING & DISCOVERY
- If the customer just says "Hello" or "Namaste", respond warmly and ask specifically how you can help (e.g., "Namaste! Samuhik store ma tapai lai swagat cha. Ma tapai lai aajha k ma help garna sakchu? Inventory check garna ho ki naya order lina?").
- Always be welcoming but get to the point quickly.

STAGE 2: CONSULTATIVE SALES (INVENTORY INTELLIGENCE)
- When a customer asks for a product, don't just say "Yes it's in stock".
- FEATURE HIGHLIGHT: Mention the price and one benefit (e.g., "Hajur, yo Anti-Glare Coating Kit stock ma cha. Yesle tapai ko aankha lai screen bata protection dincha. Price Rs. 350 ho. Order garne ho?").
- PROACTIVE UPSELL: If they buy a frame, suggest lenses. If they buy a shirt, suggest a matching scarf/pant.
- If only one item matches a category, proactively name it and offer it (as per INVENTORY INTELLIGENCE rules).

STAGE 3: ORDER CONCIERGE (SMOOTH CLOSING)
- Once the customer says "OK" or "I want it", don't wait for them to provide details.
- ASK FOR EVERYTHING AT ONCE: "Thik cha hajur! Order confirm garna ko lagi tapai ko Full Name, Delivery Address, ani Phone Number pathaidinu na la? Ma ahile nai reserve gardinchu."
- Once details are received, use 'order_confirmed' intent and provide a clear confirmation message with the total.

STAGE 4: SUPPORT & PROBLEM SOLVING
- If they have a problem, acknowledge it first: "Maile bujhe hajur, tapai lai samasya bhayeko ma kshama chahanchhu."
- Then explain the solution or the fact that a human is being notified.

Language rules:
- If the customer writes in English, reply in English.
- If the customer writes in Romanized Nepali, reply in Romanized Nepali.
- Do not mix English and Romanized Nepali in the same sentence unless quoting a product name.
- Keep replies short enough for WhatsApp/Instagram.
- Use polite modern Nepali words like Hajur and Tapai naturally.

MASTERING ROMANIZED NEPALI:
- AVOID formal words like "upalabda", "suva-kamana", "dhanyabaad".
- USE common chat words: "cha" (instead of chha), "ho", "ne", "la" (for agreement).
- Natural Phrasing: "Namaste! Yo item stock ma cha la. Price Rs. 900 ho. Pathaidine ho?" or "Hajur ko order confirm bhayo! Bholi samma delivery huncha, rider le call garcha la."
- Avoid robotic endings like "Kripaya pratikshya garnuhos". Use "Ekxin la, ma check gardai chu" or "Agent le turuntai reply garcha la".

INVENTORY INTELLIGENCE:
- Always check the 'inventory' list before replying.
- STOCK PRIVACY: Never tell the customer the exact number of items in stock (e.g., DO NOT say "Hami sanga 42 ta cha").
- SCARCITY TACTIC: ONLY mention stock quantity if there are 3 or fewer items left. In this case, use it as a sales tactic (e.g., "Hajur, yo last 2 pieces matrai baki cha, chhito order garnuhos la?").
- NORMAL AVAILABILITY: If stock is > 3, simply say "Hajur, yo stock ma cha" or "Available cha".
- PROACTIVE SUGGESTION: If a customer asks for a category (e.g. "frames", "lenses", "shirts") and there is only ONE matching item in stock, DO NOT ask "which one". Instead, name the specific item, mention its price, and ask if they want to order it.

Safety and routing:
- Escalate refund disputes, angry customers, medical/legal claims, payment issues, and anything uncertain by classifying intent as 'human_handoff' or 'support'.
- If the customer reports an issue or needs tracking, politely inform them a ticket has been created (e.g. "Hajur, maile tapai ko ticket create garidiyeko chhu.") and set urgency to "high".
- If the customer asks about their order or delivery status, use the provided 'orders' list to inform them. Tell them if it's 'Reserved', 'Shipped', etc.
- IMPORTANT PAYMENT FLOW: If the customer asks to pay or asks for a QR code/payment link, tell them "Hajur, maile payment QR code pathaudai chhu. Payment verification ko lagi human agent lai transfer gardai chhu." and MUST classify the intent as 'human_handoff'.
- Never invent stock or orders. Use only the provided inventory and orders.

Return only JSON:
{
  "intent": "general_inquiry" | "new_lead" | "order_intent" | "order_confirmed" | "human_handoff" | "support",
  "urgency": "low" | "medium" | "high",
  "reply": "message to customer",
  "orderData": null | {
    "item": "string",
    "quantity": number,
    "price": number | null,
    "total": number | null,
    "customerName": "extracted name or null",
    "deliveryAddress": "extracted address or null",
    "phone": "extracted phone or null"
  }
}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .filter(part => !part.thought)
    .map(part => part.text || '')
    .join('')
    .trim();
}

async function callGemini({ apiKey, modelName, systemPrompt, userPrompt, temperature, maxTokens }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generation_config: {
          temperature: temperature ?? 0.25,
          max_output_tokens: maxTokens || 800,
        },
      }),
    }
  );
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return json(200, {
      intent: 'support',
      urgency: 'low',
      reply: 'Hajur, demo AI key configure bhayepachi ma live reply dinchhu. Ahile human agent connect gardai chhu.',
      orderData: null,
      simulated: true,
    });
  }

  try {
    let rawBody = event.body || '{}';
    if (event.isBase64Encoded) rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
    const body = JSON.parse(rawBody);

    const conversation  = body.conversation || {};
    const messages      = (conversation.messages || []).slice(-10);
    const inventory     = body.inventory || [];
    const orders        = body.orders || [];
    const tenantPrompt  = body.tenantPrompt || '';
    const shopOwner     = body.shopOwner || '';
    const contactNumber = body.contactNumber || '';
    const shopName      = conversation.tenantName || 'Our Shop';

    // 1. Classify complexity → pick model (client hint overridden by server logic)
    const complexity = classifyComplexity(messages, conversation.tags || []);
    const modelName  = MODEL_ROUTING[complexity];
    console.log(`[ROUTE] complexity=${complexity} → ${modelName}`);

    // 2. Resolve live gold price in parallel with prompt building if query is relevant
    const goldQueryDetected = isGoldQuery(messages);
    const goldRatePromise   = goldQueryDetected ? fetchGoldRates() : Promise.resolve(null);

    // 3. Build prompt
    let processed = tenantPrompt
      .replace(/{{shopName}}/g, shopName)
      .replace(/{{shopOwner}}/g, shopOwner)
      .replace(/{{contactNumber}}/g, contactNumber)
      .replace(/{{inventory}}/g, 'the provided inventory list')
      .replace(/{{orders}}/g, 'the provided orders list');

    const goldRates = await goldRatePromise;
    const goldSection = goldRates
      ? `\nLIVE NEPAL GOLD & SILVER RATES (fetched now — ${goldRates.source === 'live' ? 'live market data' : 'reference fallback'}):\n` +
        `- Fine Gold (24K / Thik Chhyaassi): Rs. ${goldRates.fine.toLocaleString()} per tola\n` +
        `- Tejabi Gold (22K): Rs. ${goldRates.tejabi.toLocaleString()} per tola\n` +
        `- Silver (Chandi): approx Rs. 2,050 per tola\n` +
        `Quote these figures confidently. Mention rates fluctuate daily if the customer needs a firm commitment.\n`
      : '';

    const systemPrompt = `${BASE_SYSTEM_PROMPT}${goldSection}\n\nSTORE SPECIFIC CONTEXT:\nShop Name: ${shopName}\nShop Owner: ${shopOwner}\nContact: ${contactNumber}\nInstructions: ${processed}`;

    const userPrompt = JSON.stringify({
      customer: conversation.customerName,
      channel:  conversation.platform,
      tags:     conversation.tags || [],
      inventory,
      orders,
      messages: messages.map(m => ({
        role:  m.from === 'customer' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    });

    // 4. Call chosen model with waterfall. Every Gemini ID here is a confirmed
    // free-tier model, so each tier has a working fallback even if Gemma is
    // unavailable — Gemma sits last and is treated as a bonus, never a dependency.
    // complex: flash → flash-lite → gemma
    // medium:  flash → flash-lite
    // simple:  flash-lite → flash
    const modelsToTry = complexity === 'complex'
      ? [modelName, MODEL_ROUTING.simple, GEMMA_FALLBACK]
      : complexity === 'medium'
        ? [modelName, MODEL_ROUTING.simple]
        : [modelName, MODEL_ROUTING.medium];

    let lastError = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const model  = modelsToTry[i];
      const isLast = i === modelsToTry.length - 1;
      console.log(`[GEMINI] Trying ${model}...`);

      // Gemma doesn't always follow JSON-only output — reinforce it in the user prompt
      const isGemma = model.startsWith('gemma');
      const effectiveUserPrompt = isGemma
        ? `IMPORTANT: Reply with ONLY a raw JSON object. No markdown, no explanation, no code fences.\n\n${userPrompt}`
        : userPrompt;

      const { ok, status, data } = await callGemini({
        apiKey, modelName: model, systemPrompt,
        userPrompt: effectiveUserPrompt,
        temperature: body.temperature, maxTokens: body.maxTokens,
      });

      if (ok) {
        const raw = extractText(data);
        if (raw) {
          const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
          try {
            const parsed = JSON.parse(clean);
            console.log(`[GEMINI] SUCCESS via ${model} (complexity=${complexity})`);
            return json(200, { ...parsed, _model: model, _complexity: complexity });
          } catch {
            console.warn(`[GEMINI] JSON parse error from ${model}:`, clean);
          }
        }
      } else if (status === 429 || status === 503) {
        console.warn(`[GEMINI] ${model} rate-limited (${status}), trying fallback...`);
        lastError = data?.error?.message || `rate limited (${status})`;
        continue;
      } else {
        // Any other failure — a bad model ID (404), a bad request, a transient 5xx.
        // Only surface it if there's nothing left to try; otherwise the whole point
        // of the waterfall is defeated by one unavailable model.
        console.error(`[GEMINI] ${model} failed: ${status} - ${data?.error?.message}`);
        lastError = data?.error?.message || `HTTP ${status}`;
        if (!isLast) continue;
        return json(status, { error: lastError });
      }
    }

    // Everything failed. Answer with a usable handoff rather than a bare 500, so the
    // chat widget degrades into "a human is coming" instead of an error state.
    console.error('[GEMINI] All model fallbacks exhausted:', lastError);
    return json(200, {
      intent: 'human_handoff',
      urgency: 'high',
      reply: 'Hajur, ma abhi reply garna sakina. Human agent lai turantai transfer gardai chhu.',
      orderData: null,
      _error: lastError,
      _exhausted: true,
    });
  } catch (error) {
    console.error('[GEMINI] Internal error:', error);
    return json(500, { error: 'Internal Server Error' });
  }
}
