// ── Mock Data for Demo Mode ─────────────────────────────────────────────────
// This file provides all the seed data for running the app without Supabase.

export const DEMO_TENANT = {
  id: 'tenant-001',
  name: 'Parth Optical House',
  evolution_api_url: 'https://evo.demo.samuhik.ai',
  evolution_api_key: 'demo-evolution-key-abc123',
  evolution_instance: 'parth-optical-wa',
  api_key_hash: 'demo_hash_abc123',
  created_at: '2026-03-15T08:00:00Z',
};

export const DEMO_TENANT_2 = {
  id: 'tenant-002',
  name: 'Kathmandu Fashion Hub',
  evolution_api_url: '',
  evolution_api_key: '',
  evolution_instance: '',
  api_key_hash: 'demo_hash_xyz789',
  created_at: '2026-04-10T10:30:00Z',
};

// ── Demo Users (login credentials) ─────────────────────────────────────────
// Use these emails with password "demo1234" to log in.
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

// ── Demo Contacts ───────────────────────────────────────────────────────────
const DEMO_CONTACTS = [
  {
    id: 'contact-001',
    name: 'Bikash Maharjan',
    phone: '+977-9841234567',
    metadata: {
      role: 'Regular Customer',
      address: 'Patan, Lalitpur',
      lifetimeValue: 'Rs 12,500',
      notes: ['Prefers anti-glare lenses', 'Last visit: March 2026'],
      activity: [
        { type: 'order', text: 'Ordered Crizal UV lenses', date: '2026-03-20' },
        { type: 'message', text: 'Asked about new frames', date: '2026-04-25' },
      ],
    },
  },
  {
    id: 'contact-002',
    name: 'Anita Tamang',
    phone: '+977-9861234568',
    metadata: {
      role: 'VIP Customer',
      address: 'Thamel, Kathmandu',
      lifetimeValue: 'Rs 45,000',
      notes: ['High-value buyer', 'Interested in premium brands'],
      activity: [
        { type: 'order', text: 'Purchased Ray-Ban Aviator', date: '2026-04-15' },
      ],
    },
  },
  {
    id: 'contact-003',
    name: 'Sujan Thapa',
    phone: '+977-9801234569',
    metadata: {
      role: 'New Customer',
      address: 'Baneshwor, Kathmandu',
      lifetimeValue: 'Rs 3,200',
      notes: [],
      activity: [],
    },
  },
  {
    id: 'contact-004',
    name: 'Priya Sharma',
    phone: '+977-9812345670',
    metadata: {
      role: 'Wholesale Buyer',
      address: 'Bhaktapur',
      lifetimeValue: 'Rs 125,000',
      notes: ['Bulk orders monthly', 'Needs GST invoice'],
      activity: [
        { type: 'order', text: 'Bulk order: 50x reading glasses', date: '2026-04-28' },
      ],
    },
  },
];

// ── Demo Conversations with Messages ────────────────────────────────────────
export const DEMO_CONVERSATIONS = [
  {
    id: 'conv-001',
    customerName: 'Bikash Maharjan',
    platform: 'whatsapp',
    tags: ['Needs Human', 'VIP'],
    aiEnabled: true,
    messages: [
      { from: 'customer', time: '10:15', text: 'Namaste dai, mero chashma ko glass change garna sakchha?' },
      { from: 'ai', time: '10:15', text: '<|think|> Customer wants to change their lens glass. Let me check inventory for lens options.\n\nNamaste Bikash ji! Hajurko chashma ko glass change garna sakinchha. Hamilai Crizal UV, BlueCut, ra normal glass sabai chha. Kun type ko glass chahinchha?' },
      { from: 'customer', time: '10:18', text: 'BlueCut chaiyeko ho, kati parcha?' },
      { from: 'ai', time: '10:18', text: '<|think|> Customer asking about BlueCut lens pricing. Let me check inventory.\n\nBlueCut anti-glare lens ko price Rs 2,500 ho single vision ko lagi. Progressive lens ma Rs 4,200 parcha. Hajurko prescription kati chha?' },
      { from: 'customer', time: '10:22', text: 'Mero power -2.5 chha duitai aankha ma. Aja nai auna sakinchha?' },
    ],
    initials: 'BM',
    role: 'Regular Customer',
    time: '10:22',
    unread: 3,
    phone: '+977-9841234567',
    address: 'Patan, Lalitpur',
    lifetimeValue: 'Rs 12,500',
    notes: ['Prefers anti-glare lenses', 'Last visit: March 2026'],
    activity: [
      { type: 'order', text: 'Ordered Crizal UV lenses', date: '2026-03-20' },
      { type: 'message', text: 'Asked about new frames', date: '2026-04-25' },
    ],
  },
  {
    id: 'conv-002',
    customerName: 'Anita Tamang',
    platform: 'instagram',
    tags: ['Order Placed'],
    aiEnabled: false,
    messages: [
      { from: 'customer', time: '09:30', text: 'Hi! I saw your new collection on IG. Do you have the round tortoise frames?' },
      { from: 'agent', time: '09:35', text: 'Hi Anita! Yes, we have the round tortoise frames in stock. Comes in 2 sizes. Would you like to try them?' },
      { from: 'customer', time: '09:40', text: 'Yes! Can I come in this afternoon? Also what\'s the price range?' },
      { from: 'agent', time: '09:42', text: 'Frame starts at Rs 3,500. We\'re open till 7 PM today. See you soon!' },
    ],
    initials: 'AT',
    role: 'VIP Customer',
    time: '09:42',
    unread: 0,
    phone: '+977-9861234568',
    address: 'Thamel, Kathmandu',
    lifetimeValue: 'Rs 45,000',
    notes: ['High-value buyer', 'Interested in premium brands'],
    activity: [
      { type: 'order', text: 'Purchased Ray-Ban Aviator', date: '2026-04-15' },
    ],
  },
  {
    id: 'conv-003',
    customerName: 'Sujan Thapa',
    platform: 'messenger',
    tags: ['New Lead'],
    aiEnabled: true,
    messages: [
      { from: 'customer', time: '14:05', text: 'Hello, do you do eye checkups?' },
      { from: 'ai', time: '14:05', text: '<|think|> New customer asking about eye checkups. Our store offers free eye tests.\n\nHello Sujan ji! Yes, hami free eye checkup gardai chhau. Appointment lina chahanuhunchha? Available time slots: 10AM-12PM ra 2PM-5PM.' },
    ],
    initials: 'ST',
    role: 'New Customer',
    time: '14:05',
    unread: 1,
    phone: '+977-9801234569',
    address: 'Baneshwor, Kathmandu',
    lifetimeValue: 'Rs 3,200',
    notes: [],
    activity: [],
  },
  {
    id: 'conv-004',
    customerName: 'Priya Sharma',
    platform: 'whatsapp',
    tags: ['Wholesale', 'High Priority'],
    aiEnabled: false,
    messages: [
      { from: 'customer', time: '11:00', text: 'Ram ji, I need 50 pairs of reading glasses for my shop in Bhaktapur. +1.0 to +3.0 range.' },
      { from: 'agent', time: '11:10', text: 'Namaste Priya ji! I\'ll prepare a quotation for the bulk order. We have stock for all powers.' },
      { from: 'customer', time: '11:15', text: 'Great! Also include 20 pieces of BlueCut computer glasses. Need delivery by Friday.' },
      { from: 'agent', time: '11:20', text: 'Noted! I\'ll send the invoice with GST shortly. Delivery by Friday is possible.' },
      { from: 'customer', time: '16:30', text: 'Any update on the quotation?' },
    ],
    initials: 'PS',
    role: 'Wholesale Buyer',
    time: '16:30',
    unread: 1,
    phone: '+977-9812345670',
    address: 'Bhaktapur',
    lifetimeValue: 'Rs 125,000',
    notes: ['Bulk orders monthly', 'Needs GST invoice'],
    activity: [
      { type: 'order', text: 'Bulk order: 50x reading glasses', date: '2026-04-28' },
    ],
  },
];

// ── Demo Inventory ──────────────────────────────────────────────────────────
export const DEMO_INVENTORY = [
  { id: 'OPT-CRIZAL-SV', item: 'Crizal UV Single Vision Lens', stock: 45, price: 2200 },
  { id: 'OPT-BLUECUT-SV', item: 'BlueCut Anti-Glare Lens (Single Vision)', stock: 32, price: 2500 },
  { id: 'OPT-BLUECUT-PROG', item: 'BlueCut Progressive Lens', stock: 12, price: 4200 },
  { id: 'FRM-RAYBAN-AVI', item: 'Ray-Ban Aviator Classic RB3025', stock: 8, price: 15500 },
  { id: 'FRM-ROUND-TORT', item: 'Round Tortoise Acetate Frame', stock: 22, price: 3500 },
  { id: 'FRM-TITAN-HALF', item: 'Titan Half-Rim Titanium Frame', stock: 18, price: 4800 },
  { id: 'OPT-READ-100', item: 'Reading Glass +1.0', stock: 120, price: 450 },
  { id: 'OPT-READ-150', item: 'Reading Glass +1.5', stock: 95, price: 450 },
  { id: 'OPT-READ-200', item: 'Reading Glass +2.0', stock: 80, price: 450 },
  { id: 'OPT-READ-250', item: 'Reading Glass +2.5', stock: 60, price: 450 },
  { id: 'OPT-READ-300', item: 'Reading Glass +3.0', stock: 40, price: 450 },
  { id: 'ACC-CASE-HARD', item: 'Premium Hard Shell Case', stock: 55, price: 350 },
  { id: 'ACC-CLOTH-MF', item: 'Microfiber Cleaning Cloth', stock: 200, price: 80 },
  { id: 'OPT-PHOTO-SV', item: 'Photochromic Single Vision Lens', stock: 15, price: 3800 },
  { id: 'OPT-CONTACT-M', item: 'Monthly Contact Lens (-1.0 to -8.0)', stock: 5, price: 1200 },
];

// ── All Tenants (for VendorDashboard) ───────────────────────────────────────
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

// ── All Users with tenant info (for UserManagement) ─────────────────────────
export const ALL_USERS_WITH_TENANTS = DEMO_USERS.map(u => ({
  ...u,
  tenants: u.tenant_id === 'tenant-001' 
    ? { name: DEMO_TENANT.name } 
    : (u.tenant_id === 'tenant-002' ? { name: DEMO_TENANT_2.name } : null),
}));
