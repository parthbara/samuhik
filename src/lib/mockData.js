// ═══════════════════════════════════════════════════════════════════════════
//  Seed data for demo authentication, tenants, conversations & inventory.
//  When DEMO_MODE is true every provider uses this data exclusively.
// ═══════════════════════════════════════════════════════════════════════════

// ── Tenants ──────────────────────────────────────────────────────────────

export const DEMO_TENANT = {
  id: 'tenant-001',
  name: 'Parth Optical House',
  store_context_prompt: 'You are an assistant for an optical store in Kathmandu. Help customers with lenses, frames, repairs, appointments, and delivery.',
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
  {
    id: 'customer-001',
    supabase_uid: 'uid-customer-001',
    email: 'customer@demo.com',
    password: 'demo1234',
    name: 'Simulated Customer',
    role: 'customer',
    tenant_id: 'tenant-001',
    tenants: { ...DEMO_TENANT },
    created_at: '2026-05-01T09:00:00Z',
  },
];

export const ALL_TENANTS = [
  { ...DEMO_TENANT, users: [{ count: 2 }] },
  { ...DEMO_TENANT_2, users: [{ count: 0 }] },
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

// ── Demo Conversations ──────────────────────────────────────────────────

export const DEMO_CONVERSATIONS = [

  {
    id: 'conv-001',
    tenant_id: 'tenant-001',
    customerName: 'Simulated Customer',
    customerUserId: 'customer-001',
    platform: 'whatsapp',
    tags: [],
    aiEnabled: true,
    initials: 'SC',
    role: 'Retail Buyer',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unread: 0,
    phone: '+977-9841234567',
    address: 'Baluwatar, Kathmandu',
    lifetimeValue: 'Rs. 45,200',
    email: 'simulated.customer@gmail.com',
    leadStage: 'New',
    assignedTo: 'Sita Gurung',
    urgency: 'low',
    intent: 'general_inquiry',
    messages: [],
  },
  {
    id: 'conv-002',
    tenant_id: 'tenant-001',
    customerName: 'Sunita Thapa',
    platform: 'instagram',
    tags: ['Needs Human', 'Urgent'],
    aiEnabled: false,
    initials: 'ST',
    role: 'Retail Customer',
    time: '11:05',
    unread: 3,
    phone: '+977-9861234567',
    address: 'Patan, Lalitpur',
    lifetimeValue: 'Rs. 12,800',
    email: 'sunita.thapa@gmail.com',
    leadStage: 'Complaint',
    assignedTo: 'Unassigned',
    urgency: 'high',
    intent: 'refund_request',
    messages: [
      { from: 'customer', time: '10:40', text: 'Hello, hijo leko frame tutyo 2 din mai. Very disappointed.' },
      { from: 'ai', time: '10:40', text: 'I apologize about the frame issue. Let me connect you with our team for immediate assistance.' },
      { from: 'customer', time: '10:45', text: 'Quality nai ramro chaina. Paisa waste bhayo.' },
      { from: 'customer', time: '11:00', text: 'Hello?? Koi cha?' },
      { from: 'customer', time: '11:05', text: 'Reply gardinu na please. Refund chahiyo malai.' },
    ],
  },
  {
    id: 'conv-003',
    tenant_id: 'tenant-001',
    customerName: 'Dr. Ankit Joshi',
    platform: 'whatsapp',
    tags: ['VIP', 'Appointment'],
    aiEnabled: true,
    initials: 'AJ',
    role: 'Eye Specialist',
    time: '12:40',
    unread: 0,
    phone: '+977-9801234567',
    address: 'Durbarmarg, Kathmandu',
    lifetimeValue: 'Rs. 1,24,500',
    email: 'ankit.joshi@gmail.com',
    leadStage: 'VIP',
    assignedTo: 'Ram Shrestha',
    urgency: 'medium',
    intent: 'delivery_status',
    messages: [
      { from: 'customer', time: '12:30', text: 'Progressive 1.67 lens 6 pair chahiyo. Aaja bihana order deko thiye, kati pugiyo?' },
      { from: 'ai', time: '12:30', text: 'Namaste Doctor sahab! Tapai ko order #ORD-1010 — 6× Progressive 1.67 already completed cha. Invoice generated bhaisakyo.' },
      { from: 'customer', time: '12:35', text: 'Delivery kati bela huncha?' },
      { from: 'ai', time: '12:35', text: 'Aaja 4 PM samma delivery huncha Durbarmarg ma. Rider le call garcha delivery aghi.' },
      { from: 'customer', time: '12:40', text: 'Thik cha dhanyabad 🙏' },
      { from: 'agent', time: '12:40', text: 'Thank you Doctor sahab! Delivery confirmed for 4 PM. 🙏' },
    ],
  },
  {
    id: 'conv-004',
    tenant_id: 'tenant-002',
    customerName: 'Priya Sharma',
    platform: 'instagram',
    tags: ['New Lead'],
    aiEnabled: true,
    initials: 'PS',
    role: 'Online Shopper',
    time: '14:00',
    unread: 1,
    phone: '+977-9821234567',
    address: 'Bhaktapur',
    lifetimeValue: 'Rs. 3,200',
    messages: [
      { from: 'customer', time: '13:45', text: 'Yo story ma dekhako graphic tee XL ma available cha?' },
      { from: 'ai', time: '13:45', text: 'Namaste Priya! Ji XL size available cha. Rs. 850 ho. Color options: Black, Navy, White. Kun color pasand garnu bhayo?' },
      { from: 'customer', time: '13:50', text: 'Black ma 2 ta ani Navy ma 1 ta dinu. Delivery charge kati?' },
      { from: 'ai', time: '13:50', text: '3 pieces — Rs. 2,550 total. Kathmandu vitra free delivery! Bhaktapur lai Rs. 100 extra lagcha. Confirm garnu huncha?' },
      { from: 'customer', time: '14:00', text: 'Confirm hai. eSewa bata pay garchu.' },
    ],
  },
  {
    id: 'conv-005',
    tenant_id: 'tenant-001',
    customerName: 'Bimal Rai',
    platform: 'messenger',
    tags: ['Follow-up'],
    aiEnabled: true,
    initials: 'BR',
    role: 'Walk-in Customer',
    time: '09:10',
    unread: 0,
    phone: '+977-9851234567',
    address: 'Baneshwor, Kathmandu',
    lifetimeValue: 'Rs. 8,500',
    messages: [
      { from: 'customer', time: '09:00', text: 'Hijo ko eye checkup ko report kati bela auncha?' },
      { from: 'ai', time: '09:00', text: 'Namaste Bimal ji! Tapai ko report ready cha. Aaja shop ma aayera lina saknu huncha. Opening time 10 AM.' },
      { from: 'customer', time: '09:05', text: 'Online pathaidinu na possible cha?' },
      { from: 'ai', time: '09:05', text: 'Ji, email ma pathaidinchu. Tapai ko email address dinuhos ta.' },
      { from: 'customer', time: '09:10', text: 'bimal.rai@gmail.com' },
      { from: 'agent', time: '09:10', text: 'Report email garidiyo Bimal ji. Check your inbox! 📧' },
    ],
  },
  {
    id: 'conv-006',
    tenant_id: 'tenant-002',
    customerName: 'Aarav Gurung',
    platform: 'whatsapp',
    tags: ['Wholesale'],
    aiEnabled: true,
    initials: 'AG',
    role: 'Bulk Buyer',
    time: '15:30',
    unread: 0,
    phone: '+977-9871234567',
    address: 'Pokhara',
    lifetimeValue: 'Rs. 67,500',
    messages: [
      { from: 'customer', time: '15:00', text: 'Scarves 50 pcs assorted colors ko quote pathaunu na' },
      { from: 'ai', time: '15:00', text: 'Namaste Aarav ji! 50 pcs assorted scarves — Rs. 350/pc wholesale rate. Total Rs. 17,500. PDF quote ready cha, email garnu?' },
      { from: 'customer', time: '15:15', text: 'Email gardinu. Ani linen pants ko pani rate dinuhos.' },
      { from: 'ai', time: '15:15', text: 'Email sent! Linen pants: Rs. 2,200 retail, wholesale 10+ pcs ma Rs. 1,900/pc. Sizes L, XL, XXL available.' },
      { from: 'customer', time: '15:30', text: 'Thik cha, scarves ko confirm gardinuhos. Pants pachi herchu.' },
    ],
  },
];

// ── Demo Inventory ──────────────────────────────────────────────────────

export const DEMO_INVENTORY = [
  { id: 'SKU-OPT-001', tenant_id: 'tenant-001', item: 'BlueCut Single Vision 1.56',    stock: 42,  price: 450  },
  { id: 'SKU-OPT-002', tenant_id: 'tenant-001', item: 'Progressive 1.67 Lens',          stock: 18,  price: 1200 },
  { id: 'SKU-OPT-003', tenant_id: 'tenant-001', item: 'Anti-Glare Coating Kit',          stock: 85,  price: 350  },
  { id: 'SKU-OPT-004', tenant_id: 'tenant-001', item: 'Rimless Titanium Frame',          stock: 7,   price: 8500 },
  { id: 'SKU-OPT-005', tenant_id: 'tenant-001', item: 'Contact Lens Solution 300ml',     stock: 120, price: 200  },
  { id: 'SKU-OPT-006', tenant_id: 'tenant-001', item: 'Reading Glasses +2.5',            stock: 35,  price: 600  },
  { id: 'SKU-OPT-007', tenant_id: 'tenant-001', item: 'Photochromic Grey 1.56',          stock: 12,  price: 900  },
  { id: 'SKU-OPT-008', tenant_id: 'tenant-001', item: 'Lens Cleaning Microfiber (50pc)', stock: 200, price: 80   },
  { id: 'SKU-FSH-001', tenant_id: 'tenant-002', item: 'Cotton Kurta Set',                stock: 18,  price: 1800 },
  { id: 'SKU-FSH-002', tenant_id: 'tenant-002', item: 'Graphic T-Shirt (Assorted)',      stock: 45,  price: 850  },
  { id: 'SKU-FSH-003', tenant_id: 'tenant-002', item: 'Denim Jacket — Unisex',           stock: 8,   price: 3200 },
  { id: 'SKU-FSH-004', tenant_id: 'tenant-002', item: 'Linen Pants — L/XL/XXL',          stock: 22,  price: 2200 },
  { id: 'SKU-FSH-005', tenant_id: 'tenant-002', item: 'Assorted Scarves (Silk Blend)',    stock: 60,  price: 350  },
  { id: 'SKU-FSH-006', tenant_id: 'tenant-002', item: 'Casual Sneakers — White',         stock: 3,   price: 2800 },
];
