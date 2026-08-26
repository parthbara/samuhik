// ═══════════════════════════════════════════════════════════════════════════
//  Seed data for demo authentication, tenants, conversations & inventory.
//  When DEMO_MODE is true every provider uses this data exclusively.
// ═══════════════════════════════════════════════════════════════════════════

// ── Tenants ──────────────────────────────────────────────────────────────

export const DEMO_TENANT = {
  id: 'tenant-001',
  name: 'KTM Optical House',
  store_context_prompt: 'You are an assistant for KTM Optical House, a premier optical store in Kathmandu. Help customers with lenses, frames, repairs, appointments, and delivery.',
  web_search_enabled: false,
  enabled_platforms: ['whatsapp', 'instagram', 'messenger'],
  api_key_hash: 'demo_hash_abc123',
  created_at: '2026-03-15T08:00:00Z',
};

export const DEMO_TENANT_2 = {
  id: 'tenant-002',
  name: 'Kathmandu Fashion Hub',
  store_context_prompt: 'You are an assistant for a clothing store. Help customers with sizes, color availability, prices, delivery, and exchanges.',
  web_search_enabled: true,
  enabled_platforms: ['instagram', 'tiktok'],
  api_key_hash: 'demo_hash_xyz789',
  created_at: '2026-04-10T10:30:00Z',
};

// ── Users ────────────────────────────────────────────────────────────────

export const DEMO_USERS = [
  {
    id: 'user-boss',
    supabase_uid: 'uid-boss',
    email: 'parth@samuhik.com',
    password: 'KAIZEN@0110',
    name: 'Parth (Platform Owner)',
    role: 'platform_owner',
    tenant_id: null,
    created_at: '2026-05-09T00:00:00Z',
  },
  {
    id: 'user-super',
    supabase_uid: 'uid-super',
    email: 'parth@samuhik.ai',
    password: 'demo1234',
    name: 'Parth (Super Admin)',
    role: 'super_admin',
    tenant_id: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-admin-1',
    supabase_uid: 'uid-admin-1',
    email: 'admin@demo.com',
    password: 'demo1234',
    name: 'Store Admin',
    role: 'admin',
    tenant_id: 'tenant-001',
    created_at: '2026-03-15T08:30:00Z',
  },
  {
    id: 'user-agent-1',
    supabase_uid: 'uid-agent-1',
    email: 'customer@demo.com',
    password: 'demo1234',
    name: 'Demo Agent',
    role: 'agent',
    tenant_id: 'tenant-001',
    created_at: '2026-03-16T09:00:00Z',
  }
];

export const ALL_TENANTS = [DEMO_TENANT, DEMO_TENANT_2];

export const ALL_USERS_WITH_TENANTS = [...DEMO_USERS];

// ── Demo Conversations ──────────────────────────────────────────────────

// Only the landing-page WhatsApp simulator conversation is seeded.
// Real tenant inboxes start empty — conversations come from live usage.
export const DEMO_CONVERSATIONS = [
  {
    id: 'simulator-guest',
    tenant_id: 'tenant-001',
    customerName: 'Guest User',
    platform: 'whatsapp',
    tags: ['New'],
    aiEnabled: true,
    messages: [],
    initials: 'GU',
    role: 'Customer',
    time: 'Now',
    unread: 0,
    phone: '',
    address: '',
    lifetimeValue: '$0',
    notes: [],
    activity: []
  },
];

// ── Demo Inventory ──────────────────────────────────────────────────────

export const DEMO_INVENTORY = [
  {
    id: 'inv-1',
    tenant_id: 'tenant-001',
    item: 'Ray-Ban Aviator Classic',
    stock: 12,
    price: 15000,
    sku: 'RB-3025'
  },
  {
    id: 'inv-2',
    tenant_id: 'tenant-001',
    item: 'Oakley Holbrook',
    stock: 8,
    price: 18500,
    sku: 'OO-9102'
  },
  {
    id: 'inv-3',
    tenant_id: 'tenant-001',
    item: 'Basic Reading Glasses +1.5',
    stock: 50,
    price: 1200,
    sku: 'RG-150'
  }
];
