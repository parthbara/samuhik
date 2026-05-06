const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are Samuhik AI, a Nepal retail shop assistant for omnichannel commerce.

Respond as a practical sales/support agent for a shop. You can answer product questions, ask for missing order details, summarize availability, and create an order confirmation when the customer clearly confirms.

Language rules:
- If the customer writes in English, reply in English.
- If the customer writes in Romanized Nepali, reply in Romanized Nepali.
- Do not mix English and Romanized Nepali in the same sentence unless quoting a product name.
- Keep replies short enough for WhatsApp/Instagram.
- Use polite modern Nepali words like Hajur and Tapai naturally.

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
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(200, {
      intent: 'support',
      urgency: 'low',
      reply: 'Hajur, demo AI key configure bhayepachi ma live reply dinchhu. Ahile human agent connect gardai chhu.',
      orderData: null,
      simulated: true,
    });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const conversation = body.conversation || {};
    const messages = (conversation.messages || []).slice(-12);
    const inventory = body.inventory || [];
    const orders = body.orders || [];

    const userPrompt = JSON.stringify({
      customer: conversation.customerName,
      channel: conversation.platform,
      tags: conversation.tags || [],
      inventory,
      orders,
      messages: messages.map((message) => ({
        role: message.from === 'customer' ? 'customer' : message.from === 'ai' ? 'assistant' : 'agent',
        text: message.text,
      })),
    });

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 500,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const data = await upstream.json();
    if (!upstream.ok) {
      return json(502, { error: data?.error?.message || 'Gemini request failed' });
    }

    const text = extractText(data);
    if (!text) return json(502, { error: 'Gemini returned an empty response' });

    return json(200, JSON.parse(text));
  } catch (error) {
    return json(500, { error: error.message || 'Gemini function failed' });
  }
}
