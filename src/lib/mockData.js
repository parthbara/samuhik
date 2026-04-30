// Lightweight seed data for demo authentication and tenant management.
// Inbox and inventory intentionally start empty so live middleware/POS data can own those states.

export const DEMO_TENANT = {
  id: 'tenant-001',
  name: 'Parth Optical House',
  evolution_api_url: 'https://evo.demo.samuhik.ai',
  evolution_api_key: 'demo-evolution-key-abc123',
  evolution_instance: 'parth-optical-wa',
  store_context_prompt: 'You are an assistant for an optical store in Kathmandu. Help customers with lenses, frames, repairs, appointments, and delivery.',
  web_search_enabled: false,
  enabled_platforms: ['whatsapp', 'instagram', 'messenger'],
  api_key_hash: 'demo_hash_abc123',
  created_at: '2026-03-15T08:00:00Z',
};

export const DEMO_TENANT_2 = {
  id: 'tenant-002',
  name: 'Kathmandu Fashion Hub',
  evolution_api_url: '',
  evolution_api_key: '',
  evolution_instance: '',
  store_context_prompt: 'You are an assistant for a clothing store. Help customers with sizes, color availability, prices, delivery, and exchanges.',
  web_search_enabled: true,
  enabled_platforms: ['instagram', 'tiktok'],
  api_key_hash: 'demo_hash_xyz789',
  created_at: '2026-04-10T10:30:00Z',
};

export const DEMO_USERS = [
  {
    id: 'user-001',
    supabase_uid: 'uid-super-001',
    email: 'parth@samuhik.ai',
    password: 'demo1234',
    name: 'Parth',
    role: 'super_admin',
    tenant_id: null,
    tenants: null,
    created_at: '2026-03-10T06:00:00Z',
  },
  {
    id: 'user-002',
    supabase_uid: 'uid-admin-002',
    email: 'admin@demo.com',
    password: 'demo1234',
    name: 'Ram Shrestha',
    role: 'admin',
    tenant_id: 'tenant-001',
    tenants: { ...DEMO_TENANT },
    created_at: '2026-03-16T09:00:00Z',
  },
  {
    id: 'user-003',
    supabase_uid: 'uid-agent-003',
    email: 'agent@demo.com',
    password: 'demo1234',
    name: 'Sita Gurung',
    role: 'agent',
    tenant_id: 'tenant-001',
    tenants: { ...DEMO_TENANT },
    created_at: '2026-04-01T11:00:00Z',
  },
];

export const ALL_TENANTS = [
  {
    ...DEMO_TENANT,
    users: [{ count: 2 }],
  },
  {
    ...DEMO_TENANT_2,
    users: [{ count: 0 }],
  },
];

export const ALL_USERS_WITH_TENANTS = DEMO_USERS.map((user) => ({
  ...user,
  tenants:
    user.tenant_id === 'tenant-001'
      ? { name: DEMO_TENANT.name }
      : user.tenant_id === 'tenant-002'
        ? { name: DEMO_TENANT_2.name }
        : null,
}));
