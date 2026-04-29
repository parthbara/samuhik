-- =============================================================================
-- Samuhik v1 — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TENANTS ──────────────────────────────────────────────────────────────────
-- One row per business client. api_key_hash = SHA-256 of the raw key.
CREATE TABLE IF NOT EXISTS tenants (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT        NOT NULL,
  api_key_hash       TEXT        NOT NULL UNIQUE,
  evolution_instance TEXT,                     -- Evolution API instance name
  evolution_api_url  TEXT,                     -- e.g. https://evo.example.com
  evolution_api_key  TEXT,
  llm_base_url       TEXT,                     -- null → use server default
  llm_model          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── USERS (agents / admins per tenant) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  supabase_uid UUID,                           -- links to Supabase Auth
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- ─── CONTACTS (buyers, cross-platform identity) ───────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT 'New Customer',
  phone       TEXT,
  platform    TEXT        NOT NULL CHECK (platform IN ('whatsapp', 'instagram', 'messenger')),
  platform_id TEXT        NOT NULL,             -- WhatsApp JID, IG handle, etc.
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, platform, platform_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_tenant    ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_platform  ON contacts(tenant_id, platform, platform_id);

-- ─── CONVERSATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id               UUID        NOT NULL REFERENCES contacts(id),
  platform                 TEXT        NOT NULL CHECK (platform IN ('whatsapp', 'instagram', 'messenger')),
  platform_conversation_id TEXT        NOT NULL,  -- raw JID / chat ID
  status                   TEXT        NOT NULL DEFAULT 'open'
                                         CHECK (status IN ('open', 'resolved', 'escalated')),
  ai_enabled               BOOLEAN     NOT NULL DEFAULT TRUE,
  tags                     TEXT[]      NOT NULL DEFAULT '{}',
  assigned_agent_id        UUID        REFERENCES users(id),
  unread_count             INT         NOT NULL DEFAULT 0,
  last_message_at          TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, platform_conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status  ON conversations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_updated ON conversations(tenant_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_platform_id    ON conversations(tenant_id, platform_conversation_id);

-- ─── MESSAGES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type     TEXT        NOT NULL CHECK (sender_type IN ('customer', 'ai', 'agent')),
  content         TEXT        NOT NULL,
  metadata        JSONB       NOT NULL DEFAULT '{}',  -- raw Evolution payload or LLM response
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_tenant       ON messages(tenant_id, created_at DESC);

-- ─── INVENTORY ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku        TEXT         NOT NULL,
  name       TEXT         NOT NULL,
  stock      INT          NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_inventory_tenant ON inventory(tenant_id);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID          NOT NULL REFERENCES conversations(id),
  contact_id      UUID          NOT NULL REFERENCES contacts(id),
  inventory_id    UUID          REFERENCES inventory(id),  -- null if item not matched
  item_name       TEXT          NOT NULL,
  quantity        INT           NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(12,2),
  total_amount    NUMERIC(12,2),
  status          TEXT          NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','packed','in_transit','delivered','cancelled')),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant       ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_conversation ON orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_contact      ON orders(contact_id);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_updated ON inventory;
CREATE TRIGGER trg_inventory_updated
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── RPC: atomic unread counter increment ─────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_unread(conv_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations SET unread_count = unread_count + 1 WHERE id = conv_id;
END;
$$;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- The Node backend uses service role (bypasses RLS).
-- These policies protect direct Supabase dashboard / anon key access.

ALTER TABLE tenants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;

-- Helper: resolve caller's tenant_id from Supabase Auth uid
CREATE OR REPLACE FUNCTION caller_tenant_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT tenant_id FROM users WHERE supabase_uid = auth.uid() LIMIT 1;
$$;

CREATE POLICY "users_own_tenant"         ON users         FOR ALL USING (tenant_id = caller_tenant_id());
CREATE POLICY "contacts_own_tenant"      ON contacts      FOR ALL USING (tenant_id = caller_tenant_id());
CREATE POLICY "conversations_own_tenant" ON conversations FOR ALL USING (tenant_id = caller_tenant_id());
CREATE POLICY "messages_own_tenant"      ON messages      FOR ALL USING (tenant_id = caller_tenant_id());
CREATE POLICY "inventory_own_tenant"     ON inventory     FOR ALL USING (tenant_id = caller_tenant_id());
CREATE POLICY "orders_own_tenant"        ON orders        FOR ALL USING (tenant_id = caller_tenant_id());

-- =============================================================================
-- Seed: default inventory for the optical demo tenant
-- Replace the UUID with your actual tenant id after creating a tenant.
-- =============================================================================
-- INSERT INTO inventory (tenant_id, sku, name, stock, price) VALUES
--   ('<tenant-id>', 'lens-blue-156',  'Blue-cut lenses 1.56',      40,  520),
--   ('<tenant-id>', 'lens-blue-161',  'Blue-cut lenses 1.61',      24,  780),
--   ('<tenant-id>', 'lens-anti-glare','Anti-glare lenses',          12,  430),
--   ('<tenant-id>', 'lens-progressive','Progressive lenses',        18, 1950),
--   ('<tenant-id>', 'lens-cr',        'CR single vision lenses',   96,  180);
