import { DEMO_CONVERSATIONS, DEMO_INVENTORY } from './mockData';

export const DEMO_CONVERSATIONS_KEY = 'samuhik_demo_conversations_v3';
export const DEMO_INVENTORY_KEY = 'samuhik_demo_inventory_v3';
export const DEMO_ORDERS_KEY = 'samuhik_demo_orders_v3';
export const DEMO_SYNC_EVENT = 'samuhik-demo-sync';

const clone = (value) => JSON.parse(JSON.stringify(value));

export function loadDemoConversations() {
  try {
    const stored = localStorage.getItem(DEMO_CONVERSATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.some((conversation) => conversation.customerUserId)) return parsed;
    }
  } catch {
    // Fall through to seed data when localStorage is unavailable or corrupt.
  }
  return clone(DEMO_CONVERSATIONS);
}

export function saveDemoConversations(conversations) {
  localStorage.setItem(DEMO_CONVERSATIONS_KEY, JSON.stringify(conversations));
  window.dispatchEvent(new CustomEvent(DEMO_SYNC_EVENT, { detail: conversations }));
}

export function loadDemoInventory() {
  try {
    const stored = localStorage.getItem(DEMO_INVENTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Fall through to seed data.
  }
  return clone(DEMO_INVENTORY);
}

export function saveDemoInventory(inventory) {
  localStorage.setItem(DEMO_INVENTORY_KEY, JSON.stringify(inventory));
  window.dispatchEvent(new CustomEvent(DEMO_SYNC_EVENT));
}

export function loadDemoOrders() {
  try {
    const stored = localStorage.getItem(DEMO_ORDERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Fall through to no dynamic orders.
  }
  return [];
}

export function saveDemoOrders(orders) {
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(DEMO_SYNC_EVENT));
}

export function resetDemoConversations() {
  const conversations = clone(DEMO_CONVERSATIONS);
  saveDemoConversations(conversations);
  saveDemoInventory(clone(DEMO_INVENTORY));
  saveDemoOrders([]);
  return conversations;
}

export function mutateDemoConversations(updater) {
  const current = loadDemoConversations();
  const next = updater(current);
  saveDemoConversations(next);
  return next;
}

export function appendDemoMessage(conversationId, message, updates = {}) {
  return mutateDemoConversations((current) =>
    current.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            ...updates,
            messages: [...conversation.messages, message],
            time: message.time,
          }
        : conversation
    )
  );
}

export function updateDemoConversation(conversationId, updates) {
  return mutateDemoConversations((current) =>
    current.map((conversation) =>
      conversation.id === conversationId ? { ...conversation, ...updates } : conversation
    )
  );
}

function matchInventoryItem(inventory, orderData = {}) {
  const wanted = String(orderData.item || '').toLowerCase();
  if (!wanted) return inventory[0];
  return (
    inventory.find((item) => item.item.toLowerCase() === wanted) ||
    inventory.find((item) => wanted.includes(item.item.toLowerCase()) || item.item.toLowerCase().includes(wanted)) ||
    inventory.find((item) => {
      const tokens = wanted.split(/\s+/).filter((token) => token.length > 2);
      return tokens.some((token) => item.item.toLowerCase().includes(token));
    }) ||
    inventory[0]
  );
}

export function placeDemoOrder({ conversation, orderData }) {
  const inventory = loadDemoInventory();
  const item = matchInventoryItem(
    inventory.filter((entry) => entry.tenant_id === conversation.tenant_id),
    orderData
  );
  const quantity = Math.max(1, Number(orderData?.quantity || 1));
  const unitPrice = Number(orderData?.price || item?.price || 0);
  const orderNumber = 1100 + loadDemoOrders().length;
  const createdAt = new Date();

  const nextInventory = inventory.map((entry) =>
    entry.id === item?.id
      ? {
          ...entry,
          stock: Math.max(0, Number(entry.stock || 0) - quantity),
        }
      : entry
  );

  const order = {
    ticket_no: `TKT-DEMO-${String(orderNumber).padStart(4, '0')}`,
    tenant_id: conversation.tenant_id,
    order_id: `ORD-DEMO-${orderNumber}`,
    customer: orderData?.customerName || conversation.customerName,
    phone: orderData?.phone || conversation.phone || '-',
    address: orderData?.deliveryAddress || conversation.address || '-',
    channel: (conversation.platform || 'whatsapp').replace(/^\w/, (char) => char.toUpperCase()),
    item: item?.item || orderData?.item || 'Demo item',
    quantity,
    unit_price: unitPrice,
    status: 'Reserved',
    order_source: 'ai_generated',
    assignee: 'Samuhik AI',
    resolution: 'AI captured order from simulator and reserved stock',
    created_at: createdAt.toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', ''),
  };

  saveDemoInventory(nextInventory);
  saveDemoOrders([order, ...loadDemoOrders()]);
  return { order, inventory: nextInventory };
}
