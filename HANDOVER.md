# Samuhik AI — Handover Document

> **Date:** 2026-04-30  
> **Branch:** `parthupdate_vendor_logins`  
> **Status:** Build verified ✅ · Ready for backend provisioning

---

## 1. Project Summary

**Samuhik** is an **omnichannel AI inbox** purpose-built for Nepali commerce.  
It unifies customer conversations from **WhatsApp, Instagram, and Messenger** into a single operator interface, powered by an on-premise LLM — **Gemma 4 E4B** — running on [LM Studio](https://lmstudio.ai).

### Core capabilities

| Feature | Detail |
|---|---|
| **AI Auto-Reply** | Gemma 4 E4B generates structured JSON responses (`chat`, `order`, `escalate`) in **Romanized Nepali** with `<\|think\|>` chain-of-thought reasoning. |
| **Multi-Tenant SaaS** | Each business (optical shop, clothing store, etc.) is an isolated **tenant** in Supabase with its own users, conversations, inventory, and WhatsApp instance. |
| **Role-Based Access** | Three roles — `super_admin` (platform vendor), `admin` (store owner), `agent` (staff) — with route-level gating and Supabase RLS. |
| **WhatsApp Bridge** | [Evolution API](https://github.com/EvolutionAPI/evolution-api) (Docker) acts as the WhatsApp middleware; webhooks push inbound messages into the Fastify backend. |
| **Inventory + Orders** | AI-driven order capture with fuzzy SKU matching; stock deduction is atomic in Postgres. |

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite 6 · Tailwind CSS 3 · React Router 7 |
| Backend | Node.js · Fastify 5 · Supabase JS SDK v2 |
| Database | Supabase (PostgreSQL 15 + Realtime + Auth) |
| AI Engine | LM Studio → Gemma 4 E4B (uncensored, Romanized Nepali tuned) |
| Messaging | Evolution API (Docker) · Redis |
| Hosting | Netlify (frontend) · Dedicated 24/7 PC (LM Studio + Evolution API) |

---

## 2. Architecture: Multi-Tenant Supabase Migration

### 2.1 What Changed (MockAuth → Supabase Auth)

The original codebase used **mock authentication** with hardcoded demo credentials and in-memory state (`useState` in `App.jsx`). This has been completely replaced:

| Before | After |
|---|---|
| `MockAuthContext` with dummy users | `AuthContext` backed by `supabase.auth.signInWithPassword()` |
| Single-user, single-store | Multi-tenant with `tenants` table and `tenant_id` FK on every data table |
| In-memory conversations/inventory | Supabase Postgres with Realtime subscriptions (`postgres_changes`) |
| No route protection | `ProtectedRoute` component with role hierarchy (`super_admin > admin > agent`) |
| No vendor/platform view | `VendorDashboard` at `/vendor` for the platform operator |

### 2.2 Authentication Flow

```
Login.jsx
  └─► supabase.auth.signInWithPassword({ email, password })
        └─► onAuthStateChange fires
              └─► AuthContext.fetchProfile(uid)
                    └─► SELECT * FROM users WHERE supabase_uid = auth.uid()
                          └─► profile.role determines routing:
                                ├── super_admin → /vendor
                                ├── admin       → /admin/config
                                └── agent       → /inbox
```

**Key file:** `src/contexts/AuthContext.jsx`

- On mount: `supabase.auth.getSession()` restores the session from `localStorage`.
- On auth change: `onAuthStateChange` updates the user and fetches their `users` row (joined with `tenants`).
- `login(email, password)` and `logout()` are exposed via React Context.

### 2.3 Role-Based Routing

**Key file:** `src/App.jsx`

| Route | Required Role | Component |
|---|---|---|
| `/login` | Public | `Login` |
| `/inbox` | Any authenticated | `Inbox` |
| `/inventory` | `admin`+ | `Inventory` |
| `/admin/config` | `admin`+ | `AdminConfig` |
| `/admin/users` | `admin`+ | `UserManagement` |
| `/vendor` | `super_admin` only | `VendorDashboard` |

The `ProtectedRoute` wrapper (`src/components/ProtectedRoute.jsx`) enforces access:
- `super_admin` bypasses all role checks (can see everything).
- `agent` accessing admin routes is redirected to `/inbox`.
- Unauthenticated users are redirected to `/login`.

### 2.4 Data Isolation (Tenant Scoping)

**Key file:** `src/contexts/DataContext.jsx`

All data queries filter by `tenant_id`:

```javascript
// Conversations — scoped unless super_admin
if (profile.role !== 'super_admin') {
  convQuery = convQuery.eq('tenant_id', tenantId);
}

// Realtime subscription — also scoped
filter: profile.role === 'super_admin'
  ? undefined
  : `tenant_id=eq.${profile.tenant_id}`
```

This is enforced at **two levels**:
1. **Application layer** — queries add `.eq('tenant_id', ...)` (see `DataContext.jsx`, `UserManagement.jsx`).
2. **Database layer** — PostgreSQL RLS policies use `caller_tenant_id()` (see Section 3.2).

### 2.5 Database Schema

**Key file:** `server/db/schema.sql`

```
tenants
  ├── users            (FK: tenant_id)
  ├── contacts         (FK: tenant_id)
  │     └── conversations (FK: tenant_id, contact_id)
  │           ├── messages   (FK: tenant_id, conversation_id)
  │           └── orders     (FK: tenant_id, conversation_id, contact_id)
  └── inventory        (FK: tenant_id)
```

Every table uses `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`.

### 2.6 Vendor Dashboard

**Key file:** `src/pages/vendor/VendorDashboard.jsx`

The `super_admin` sees a platform overview at `/vendor`:
- Total stores (tenants), active Evolution instances, message volume, LLM load.
- Tenant table with store name, integration status, staff count, creation date.
- "Add New Store" modal that inserts into `tenants` directly.

### 2.7 Sidebar Navigation

**Key file:** `src/components/layout/Sidebar.jsx`

Navigation items are conditionally rendered based on role:
- `superOnly: true` → only visible to `super_admin` (Platform link).
- `adminOnly: true` → visible to `admin` and `super_admin` (Inventory, Settings, Team).
- No flag → visible to all authenticated users (Inbox).

---

## 3. Admin Action Items

> **These steps must be completed by the backend administrator before the app is functional.**

### 3.1 Supabase Project Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (or self-hosted).
2. Open **SQL Editor** and run the entire contents of:

   ```
   server/db/schema.sql
   ```

   This creates all tables, indexes, triggers, RPC functions, enables RLS, and creates tenant-scoping policies.

3. **Important:** The schema includes a `super_admin` role value not in the SQL `CHECK` constraint. You must update the `users.role` CHECK to include it:

   ```sql
   ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
   ALTER TABLE users ADD CONSTRAINT users_role_check
     CHECK (role IN ('super_admin', 'admin', 'agent'));
   ```

### 3.2 RLS Policies (Already in schema.sql — Verify)

The schema file creates these RLS policies. **Verify they are active** in Supabase Dashboard → Authentication → Policies:

| Table | Policy Name | Rule |
|---|---|---|
| `users` | `users_own_tenant` | `tenant_id = caller_tenant_id()` |
| `contacts` | `contacts_own_tenant` | `tenant_id = caller_tenant_id()` |
| `conversations` | `conversations_own_tenant` | `tenant_id = caller_tenant_id()` |
| `messages` | `messages_own_tenant` | `tenant_id = caller_tenant_id()` |
| `inventory` | `inventory_own_tenant` | `tenant_id = caller_tenant_id()` |
| `orders` | `orders_own_tenant` | `tenant_id = caller_tenant_id()` |

**Missing policy:** The `tenants` table has RLS enabled but **no policy defined**. You need to add one:

```sql
-- Super admins can see all tenants; others see only their own
CREATE POLICY "tenants_access" ON tenants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.supabase_uid = auth.uid()
      AND (users.role = 'super_admin' OR users.tenant_id = tenants.id)
  )
);
```

### 3.3 Create the First Supabase Auth User (Super Admin)

1. Go to **Supabase Dashboard → Authentication → Users → Add User**.
2. Create a user with email (e.g., `parth@samuhik.ai`) and a password.
3. Copy the user's **UUID** from the dashboard.
4. Insert a `users` row linking them:

   ```sql
   INSERT INTO users (tenant_id, email, name, role, supabase_uid)
   VALUES (
     NULL,                    -- super_admin has no tenant
     'parth@samuhik.ai',
     'Parth',
     'super_admin',
     '<paste-supabase-auth-uuid-here>'
   );
   ```

   > **Note:** `tenant_id` is `NOT NULL` in the current schema. For `super_admin` users who operate at the platform level, you'll need to either:
   >
   > (a) Create a special "platform" tenant and assign it, OR  
   > (b) Alter the column: `ALTER TABLE users ALTER COLUMN tenant_id DROP NOT NULL;`
   >
   > **Recommended:** Option (b) — super admins transcend tenants.

### 3.4 Seed the First Tenant (Store)

Use the provisioning script:

```bash
# Ensure .env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
node server/db/seed_tenant.mjs "My Optical Shop"
```

This will:
- Generate a raw API key and store its SHA-256 hash in `tenants.api_key_hash`.
- Create the tenant row with Evolution API defaults from `.env`.
- Seed 5 demo inventory items (optical lenses).
- Print the **raw API key** — save it for `VITE_API_KEY`.

### 3.5 Environment Variables

Create a `.env` file in the project root. All required variables:

#### Backend (Node / Fastify)

| Variable | Example Value | Notes |
|---|---|---|
| `PORT` | `3001` | Fastify listen port |
| `NODE_ENV` | `development` | |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | **Never expose to browser** |
| `LM_STUDIO_BASE_URL` | `http://127.0.0.1:8787` | CORS bridge port |
| `LM_STUDIO_MODEL` | `gemma-4-e4b-uncensored-hauhaucs-aggressive` | Model loaded in LM Studio |
| `LLM_TIMEOUT_MS` | `30000` | |
| `LLM_MAX_RETRIES` | `2` | |
| `EVOLUTION_API_URL` | `https://evo.yourdomain.com` | Per-tenant overridable |
| `EVOLUTION_API_KEY` | `your-key` | |
| `EVOLUTION_INSTANCE` | `samuhik-instance` | |
| `EVOLUTION_WEBHOOK_SECRET` | *(optional)* | HMAC verification |

#### Frontend (Vite — must be prefixed with `VITE_`)

| Variable | Example Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Same URL as backend |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | **Anon/public key** (safe for browser) |
| `VITE_API_KEY` | `raw-hex-key` | Matches hash in `tenants.api_key_hash` |

> ⚠️ **Note:** `.env.example` currently does NOT include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The frontend code in `src/lib/supabase.js` reads these. Add them to your `.env`.

### 3.6 Server Infrastructure (24/7 PC)

The platform requires a **dedicated always-on machine** running two services:

#### A) LM Studio (AI Engine)

1. Install [LM Studio](https://lmstudio.ai) on the server PC.
2. Download the model: **Gemma 4 E4B** (uncensored / hauhaucs aggressive variant).
3. Go to **Local Server** tab → ✅ **Enable CORS** → Start on port `1234`.
4. Start the CORS bridge (included in the project):

   ```bash
   npm run llm:bridge    # Starts on port 8787, forwards to LM Studio at 1234
   ```

5. For remote access: expose port `1234` via [Ngrok](https://ngrok.com):

   ```bash
   ngrok http 1234
   ```

   Use the HTTPS URL as `LM_STUDIO_BASE_URL` in Netlify's env vars.

#### B) Evolution API (WhatsApp Bridge)

1. Install [Docker Desktop](https://docker.com/products/docker-desktop) on the server PC.
2. Create `docker-compose.yml` with the standard Evolution API + Redis stack (port `8080`).
3. Start:

   ```bash
   docker-compose up -d
   ```

4. Pair a WhatsApp number via the Evolution API dashboard.
5. For remote access:

   ```bash
   ngrok http 8080
   ```

   Use the HTTPS URL as `EVOLUTION_API_URL`.

#### C) Fastify Backend

Start the API server (handles webhooks, LLM calls, order processing):

```bash
npm run server          # Production
npm run server:dev      # Development with --watch
```

### 3.7 Netlify Deployment

The frontend deploys to Netlify. Required configuration:

- **Build command:** `npm run build`
- **Publish directory:** `dist/`
- **Environment variables** (in Netlify Dashboard → Site settings → Environment variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_KEY`
  - `LM_STUDIO_BASE_URL` (for the serverless function)

The Netlify function at `netlify/functions/llm.mjs` proxies LLM calls using `LM_STUDIO_BASE_URL`.

---

## 4. Files Changed in This Update

### New Files

| File | Purpose |
|---|---|
| `src/contexts/AuthContext.jsx` | Supabase Auth context (replaces MockAuth) |
| `src/contexts/DataContext.jsx` | Tenant-scoped data fetching + Realtime subscriptions |
| `src/lib/supabase.js` | Supabase client singleton |
| `src/components/ProtectedRoute.jsx` | Role-based route guard |
| `src/components/layout/Sidebar.jsx` | Role-aware navigation sidebar |
| `src/components/layout/AppLayout.jsx` | Shell layout with sidebar |
| `src/pages/Login.jsx` | Supabase email/password login |
| `src/pages/vendor/VendorDashboard.jsx` | Platform-level tenant management |
| `src/pages/UserManagement.jsx` | Team member CRUD (tenant-scoped) |
| `src/pages/AdminConfig.jsx` | Store settings (Evolution API config per tenant) |
| `server/db/schema.sql` | Full multi-tenant Postgres schema with RLS |
| `server/db/seed_tenant.mjs` | Tenant provisioning script |
| `HANDOVER.md` | This document |

### Modified Files

| File | Change |
|---|---|
| `src/App.jsx` | Role-based routing tree with `ProtectedRoute` guards |
| `package.json` | Added `@supabase/supabase-js`, `react-router-dom`, server scripts |
| `.env.example` | Added Supabase and Evolution API variables |
| `vite.config.js` | Proxy `/api/*` to Fastify backend |

### Removed

| File | Reason |
|---|---|
| `MockAuthContext` (if it existed as a file) | Replaced by real Supabase auth |

---

## 5. Quick Start (Development)

```bash
# 1. Clone & install
git clone <repo-url> && cd samuhik
npm install

# 2. Create .env (copy from .env.example, fill in Supabase + LM Studio values)
cp .env.example .env

# 3. Run the Supabase schema
#    → Paste server/db/schema.sql into Supabase SQL Editor

# 4. Seed your first tenant
node server/db/seed_tenant.mjs "My Shop"

# 5. Start all services
npm run llm:bridge    # Terminal 1 — CORS bridge (port 8787)
npm run server:dev    # Terminal 2 — Fastify backend (port 3001)
npm run dev           # Terminal 3 — Vite frontend (port 5173)
```

---

*Generated by Antigravity · 2026-04-30*
