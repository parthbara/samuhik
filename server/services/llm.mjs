import { config } from '../config.mjs';

const FALLBACK = { intent: 'escalate', reply: 'System offline. Connecting to human.', orderData: null };

function buildSystemPrompt(inventory) {
  return `You are the Samuhik AI Assistant. You handle customer service for an optical wholesaler.
You understand Romanized Nepali.

Current inventory:
${JSON.stringify(inventory, null, 2)}

Always respond with a single JSON object — nothing else:
- General / price inquiry: { "intent": "chat",     "reply": "...", "orderData": null }
- Order confirmation:      { "intent": "order",    "reply": "...", "orderData": { "item": "...", "quantity": N } }
- Angry / wants human:     { "intent": "escalate", "reply": "...", "orderData": null }

You may reason privately using <|think|>...</|think|> before the JSON, but your final output must be only the JSON object.`;
}

// DB messages → OpenAI chat format
function toOpenAiMessages(dbMessages, inventory) {
  return [
    { role: 'system', content: buildSystemPrompt(inventory) },
    ...dbMessages.map((m) => ({
      role: m.sender_type === 'customer' ? 'user' : 'assistant',
      content:
        m.sender_type === 'customer'
          ? m.content
          : JSON.stringify({ intent: 'chat', reply: m.content }),
    })),
  ];
}

function parseJsonPayload(raw) {
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/<\|think\|>[\s\S]*?<\/\|think\|>/gi, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first === -1 || last <= first) throw new Error('No JSON object in LLM response');
    return JSON.parse(cleaned.slice(first, last + 1));
  }
}

function normalize(raw) {
  const intent = ['chat', 'order', 'escalate'].includes(raw?.intent) ? raw.intent : 'chat';
  return {
    intent,
    reply: raw?.reply || raw?.response || raw?.message || 'Ekchin, confirm garera pathauchu.',
    orderData: raw?.orderData ?? null,
  };
}

async function callOnce(baseUrl, model, messages, signal) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 320,
      stop: ['<|im_end|>', '\n\n<|im_start|>'],
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'samuhik_reply',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['intent', 'reply', 'orderData'],
            properties: {
              intent:    { type: 'string', enum: ['chat', 'order', 'escalate'] },
              reply:     { type: 'string' },
              orderData: {
                anyOf: [
                  {
                    type: 'object',
                    additionalProperties: false,
                    required: ['item', 'quantity'],
                    properties: {
                      item:     { type: 'string' },
                      quantity: { type: 'number' },
                    },
                  },
                  { type: 'null' },
                ],
              },
            },
          },
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty LLM response');

  return normalize(parseJsonPayload(content));
}

export async function callLlm({ tenant, messages, inventory }) {
  const baseUrl = (tenant.llm_base_url || config.lmStudioBaseUrl).replace(/\/$/, '');
  const model = tenant.llm_model || config.lmStudioModel;
  const openAiMessages = toOpenAiMessages(messages, inventory);

  let lastError;
  for (let attempt = 0; attempt <= config.llmMaxRetries; attempt++) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), config.llmTimeoutMs);
    try {
      const result = await callOnce(baseUrl, model, openAiMessages, controller.signal);
      clearTimeout(tid);
      return result;
    } catch (err) {
      clearTimeout(tid);
      lastError = err;
      if (attempt < config.llmMaxRetries) {
        // exponential back-off: 1s, 2s
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  console.error(`[llm] failed after ${config.llmMaxRetries + 1} attempts:`, lastError?.message);
  return FALLBACK;
}
