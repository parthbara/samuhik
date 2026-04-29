/**
 * One-time tenant provisioning script.
 * Usage: node server/db/seed_tenant.mjs
 *
 * Generates a raw API key, hashes it, inserts a tenant row,
 * and prints the raw key (store it — it's never saved in DB).
 */

import 'dotenv/config';
import { createHash, randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const rawKey = randomBytes(32).toString('hex');
const hash = createHash('sha256').update(rawKey).digest('hex');

const tenantName = process.argv[2] || 'Samuhik Optical Demo';

const { data, error } = await supabase
  .from('tenants')
  .insert({
    name: tenantName,
    api_key_hash: hash,
    evolution_instance: process.env.EVOLUTION_INSTANCE || null,
    evolution_api_url: process.env.EVOLUTION_API_URL || null,
    evolution_api_key: process.env.EVOLUTION_API_KEY || null,
    llm_base_url: null,   // null = use server default
    llm_model: null,
  })
  .select()
  .single();

if (error) {
  console.error('Failed to create tenant:', error.message);
  process.exit(1);
}

// Seed default inventory for this tenant
await supabase.from('inventory').insert([
  { tenant_id: data.id, sku: 'lens-blue-156',   name: 'Blue-cut lenses 1.56',    stock: 40, price: 520  },
  { tenant_id: data.id, sku: 'lens-blue-161',   name: 'Blue-cut lenses 1.61',    stock: 24, price: 780  },
  { tenant_id: data.id, sku: 'lens-anti-glare', name: 'Anti-glare lenses',        stock: 12, price: 430  },
  { tenant_id: data.id, sku: 'lens-progressive', name: 'Progressive lenses',      stock: 18, price: 1950 },
  { tenant_id: data.id, sku: 'lens-cr',         name: 'CR single vision lenses', stock: 96, price: 180  },
]);

console.log('\n✓ Tenant created\n');
console.log(`  Tenant ID  : ${data.id}`);
console.log(`  Name       : ${data.name}`);
console.log(`\n  RAW API KEY (set this as VITE_API_KEY in .env):`);
console.log(`  ${rawKey}`);
console.log('\n  This key is shown once. The hash is stored in DB.\n');
