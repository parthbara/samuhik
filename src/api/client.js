const BASE = '/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Conversations ──────────────────────────────────────────────────────────────
export const api = {
  getConversations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/conversations${qs ? `?${qs}` : ''}`);
  },

  getMessages: (conversationId) =>
    apiFetch(`/conversations/${conversationId}/messages`),

  patchConversation: (id, updates) =>
    apiFetch(`/conversations/${id}`, { method: 'PATCH', body: updates }),

  sendMessage: (conversationId, text) =>
    apiFetch('/send', { method: 'POST', body: { conversation_id: conversationId, text } }),

  // Simulate a customer message (triggers the full pipeline server-side)
  simulate: (conversationId, text) =>
    apiFetch('/simulate', { method: 'POST', body: { conversation_id: conversationId, text } }),

  getInventory: () => apiFetch('/inventory'),

  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/orders${qs ? `?${qs}` : ''}`);
  },
};
