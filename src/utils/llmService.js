const LM_STUDIO_MODEL =
  import.meta.env.VITE_LM_STUDIO_MODEL || "gemma-4-e4b-uncensored-hauhaucs-aggressive";
const LLM_BASE_URL = import.meta.env.VITE_LLM_BASE_URL || "/api/llm";
const LLM_TIMEOUT_MS = 15000;
const FALLBACK_RESPONSE = {
  intent: "escalate",
  reply: "System offline. Connecting to human.",
};

function getLlmBaseUrl() {
  const params = new URLSearchParams(window.location.search);
  const urlOverride = params.get("llm") || params.get("llmBaseUrl");

  if (urlOverride) {
    window.localStorage.setItem("samuhik-llm-base-url", urlOverride);
  }

  return (window.localStorage.getItem("samuhik-llm-base-url") || LLM_BASE_URL).replace(/\/$/, "");
}

function buildSystemPrompt(posInventory) {
  return `You are the Samuhik AI Assistant. You handle customer service for an optical wholesaler. You understand Romanized Nepali. You have access to current inventory:
${JSON.stringify(posInventory, null, 2)}

You MUST always respond in valid JSON.
- If answering a question, output: { "intent": "chat", "reply": "Your Romanized Nepali response" }
- If the user confirms an order, extract it and output: { "intent": "order", "reply": "Confirmation message", "orderData": { "item": "lens type", "quantity": number } }
- If the user is angry or requests a human, output: { "intent": "escalate", "reply": "Hold on, connecting to a human." }

Use the <|think|> token to reason privately about Romanized Nepali intent before selecting the intent, but your final assistant message must contain only the valid JSON object.`;
}

function toOpenAiMessages(messages, posInventory) {
  return [
    {
      role: "system",
      content: buildSystemPrompt(posInventory),
    },
    ...messages.map((message) => ({
      role: message.from === "customer" ? "user" : "assistant",
      content: message.from === "customer" ? message.text : JSON.stringify({ intent: "chat", reply: message.text }),
    })),
  ];
}

function parseJsonPayload(content) {
  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("LLM did not return a JSON object.");
    }
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }
}

function normalizeLlmPayload(payload) {
  const intent = ["chat", "order", "escalate"].includes(payload?.intent) ? payload.intent : "chat";
  const reply =
    payload?.reply ||
    payload?.response ||
    payload?.message ||
    "Maile bujhe. Ekchin ma confirm garera pathauchu.";

  return {
    intent,
    reply,
    orderData: payload?.orderData,
  };
}

export async function generateAutoReply({ messages, posInventory }) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const response = await fetch(`${getLlmBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: LM_STUDIO_MODEL,
        temperature: 0.2,
        max_tokens: 280,
        stop: ["<|im_end|>", "\n\n<|im_start|>"],
        messages: toOpenAiMessages(messages, posInventory),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "samuhik_ai_response",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                intent: {
                  type: "string",
                  enum: ["chat", "order", "escalate"],
                },
                reply: {
                  type: "string",
                },
                orderData: {
                  anyOf: [
                    {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        item: { type: "string" },
                        quantity: { type: "number" },
                      },
                      required: ["item", "quantity"],
                    },
                    { type: "null" },
                  ],
                },
              },
              required: ["intent", "reply", "orderData"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio request failed with ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("LM Studio returned an empty response.");
    }

    return normalizeLlmPayload(parseJsonPayload(content));
  } catch (error) {
    return FALLBACK_RESPONSE;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
