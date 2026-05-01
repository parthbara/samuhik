# Samuhik AI — Handover Document

> **Date:** 2026-05-01 (v3 — dark cinematic theme & full UI polish)  
> **Branch:** `new-updates-parth`  
> **Status:** Build verified ✅ · Demo mode fully populated & functional · Ready for backend wiring

---

## 1. Project Summary

**Samuhik** is an **omnichannel AI inbox** purpose-built for Nepali commerce.  
It unifies customer conversations from **WhatsApp, Instagram, Messenger, and TikTok** into a single operator interface, powered by an on-premise LLM — **Gemma 4 E4B** — running on [LM Studio](https://lmstudio.ai).

### Core capabilities

| Feature | Detail |
|---|---|
| **AI Auto-Reply** | Gemma 4 E4B generates structured JSON responses (`chat`, `order`, `escalate`) in **Romanized Nepali** with `<|think|>` chain-of-thought reasoning. |
| **Multi-Tenant SaaS** | Each business (optical shop, clothing store, etc.) is an isolated **tenant** in Supabase with its own users, conversations, inventory, and WhatsApp instance. |
| **Role-Based Access** | Three roles — `super_admin` (platform vendor), `admin` (store owner), `agent` (staff) — with route-level gating and Supabase RLS. |
| **WhatsApp Bridge** | [Evolution API](https://github.com/EvolutionAPI/evolution-api) (Docker) acts as the WhatsApp middleware; webhooks push inbound messages into the Fastify backend. |
| **Inventory + Orders** | AI-driven order capture with fuzzy SKU matching; stock deduction is atomic in Postgres. |
| **Orders Spreadsheet** | Sortable, filterable data grid for all orders/tickets with tenant, status, channel, and source dropdowns. |
| **Customer Sidebar** | Sambad.io-competitive context panel with channel status, contact info, internal notes, tickets, and CRM. |

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite 6 · Tailwind CSS 3 · React Router 7 · Lucide Icons |
| Backend | Node.js · Fastify 5 · Supabase JS SDK v2 |
| Database | Supabase (PostgreSQL 15 + Realtime + Auth) |
| AI Engine | LM Studio → Gemma 4 E4B (uncensored, Romanized Nepali tuned) |
| Messaging | Evolution API (Docker) · Redis |
| Hosting | Netlify (frontend) · Dedicated 24/7 PC (LM Studio + Evolution API) |

---

## 2. What Changed in This Update

### 2.1 Visual Overhaul (Dark Cinematic Theme)

**File:** `src/index.css` & All UI Components

The entire platform was transitioned from a generic light SaaS interface to a **premium, dark cinematic aesthetic** to impress stakeholders and differentiate from competitors.

| Feature | Detail |
|---|---|
| **Deep Slate Foundation** | Replaced white backgrounds with `#0a0a0f` for reduced eye strain and a modern "pro" app feel. |
| **Electric Teal Accents** | Applied `#00d4aa` (vibrant teal) for primary actions, badges, and glows, creating striking contrast. |
| **Glassmorphism** | Cards, sidebars, and modals now use semi-transparent `rgba()` backgrounds with `backdrop-blur` for depth. |
| **Mesh Gradients & Noise** | Added subtle, slow-moving animated background mesh gradients and static noise overlays for texture. |
| **Micro-Animations** | Hover states (`hover:border-medium`, `transition-all`), smooth toast pop-ins (`animate-slide-up`), and skeleton loading principles implemented. |

### 2.2 Global Configuration & Demo Population

**Files:** `src/lib/config.js` & `src/lib/mockData.js`

- **Centralized `DEMO_MODE`:** Moved the hardcoded `DEMO_MODE` toggle out of individual contexts and into a single source of truth (`src/lib/config.js`).
- **Rich Mock Data:** The Inbox and Inventory pages are no longer empty. Added 6 detailed Nepali commerce conversation threads and 14 mock SKUs (lenses, frames, apparel) to make the demo instantly impactful.
- **Global Toast System:** Introduced `ToastProvider` and wired it into `AdminConfig`, `UserManagement`, and `VendorDashboard` for real-time success/error feedback.

### 2.3 Final Polish & Demo Refinements (May 2 Update)

- **Dark/Light Mode Toggle**: Added a seamless theme switcher in the Sidebar (`Sidebar.jsx`).
- **Eye-Comfort Light Theme**: Implemented a warm, low-glare light theme (`.light` in `index.css`) with soft off-whites (`#f8f9fa`) and muted teal accents to reduce eye strain.
- **Toggle Switch Fixes**: Re-aligned the custom toggle switches across all pages (including inline `ChatWindow.jsx` toggles) to prevent circle overflow.
- **Pre-Connected Mock Channels**: Updated the initial state in `AdminConfig.jsx` to pre-fill webhooks for WhatsApp, Instagram, and Messenger, setting them to `connected` by default for a more alive demo experience.
- **Removed Redundancies**: Cleaned up duplicated "Tomorrow Wiring" readiness checklists from the Settings pages.

### 2.4 Orders Spreadsheet (Enhanced)

**File:** `src/pages/Orders.jsx`:** `src/pages/Orders.jsx`

The Orders page was completely rebuilt with a robust, spreadsheet-style data grid:

| Feature | Detail |
|---|---|
| **Tenant dropdown** | Super admins see "All stores" + individual tenant options. Admins see only their own data. |
| **Status dropdown** | Filter by: Reserved, Awaiting payment, Scheduled, Completed, Shipped, Quoted |
| **Channel dropdown** | Filter by: WhatsApp, Instagram, Messenger, TikTok |
| **Source dropdown** | Filter by: AI Generated, Human Agent |
| **Sortable columns** | Click any header to sort asc/desc (Ticket, Order, Customer, Item, Qty, Unit price, Assignee, Resolution, Created) |
| **Search** | Free-text search across ticket no, order ID, customer, item, channel, assignee |
| **Revenue calc** | Live total revenue calculation in footer and stat cards |
| **12 mock rows** | Rich demo data across 2 tenants, multiple channels, all statuses |
| **Export CSV** | Button ready (wiring needed) |
| **Alternating rows** | Visual zebra striping for readability |

**API mapping:** In production, replace `ORDER_ROWS` with `api.getOrders({ tenant_id, status, ... })`. The Fastify backend already exposes `GET /api/orders` with tenant scoping.

### 2.2 Customer Context Sidebar (New)

**File:** `src/components/inbox/ContextPanel.jsx`

The right-side panel in the Inbox was rebuilt from scratch to match Sambad.io's feature set:

| Section | Features |
|---|---|
| **Avatar** | Large avatar with initials + channel badge overlay (WhatsApp/Instagram/Messenger icon) |
| **Channel status** | Shows active channel with live status indicator |
| **Contact info** | Phone, email, location, lifetime value — all with copy-to-clipboard |
| **Internal notes** | Author attribution with initials, timestamps, expandable list, inline "add note" input |
| **Tickets** | Priority badges (Urgent/High/Normal/Low), status pills (Open/Closed/Pending), expand/collapse |
| **CRM** | Customer deals with "New" badge, email, company name, pipeline count |
| **Empty state** | Graceful "Select a conversation" placeholder when no chat is active |

**Demo data:** When real conversation data doesn't include notes/tickets/CRM, the panel generates realistic demo data. In production, these sections will pull from Supabase tables.

### 2.3 Sidebar Navigation (Cleaned)

**File:** `src/components/layout/Sidebar.jsx`

| Role | Visible Nav Items |
|---|---|
| `super_admin` | Platform, Inbox, Inventory, Orders, Settings, Team |
| `admin` | Inbox, Inventory, Orders, Settings, Team |
| `agent` | Inbox |

**Note:** There is ONE unified "Orders" page. Super admins see it with a tenant filter dropdown + Store column. Admins see only their own tenant's orders. No separate "Data Grid" — it's the same page with role-aware rendering.

### 2.4 Routing (Cleaned)

**File:** `src/App.jsx`

| Route | Role | Component |
|---|---|---|
| `/login` | Public | Login |
| `/vendor` | super_admin | VendorDashboard (Platform overview) |
| `/inbox` | Any auth | Inbox |
| `/inventory` | admin+ | Inventory |
| `/admin/orders` | admin+ | Orders (spreadsheet) |
| `/admin/config` | admin+ | AdminConfig |
| `/admin/users` | admin+ | UserManagement |

`super_admin` bypasses all role checks, so they can access all admin routes.

### 2.5 Inbox Layout (Cleaned)

**File:** `src/pages/Inbox.jsx`

- Removed `RecentOrdersPanel` strip from between ChatWindow and ContextPanel (it was redundant — tickets are now in the sidebar)
- ChatWindow renders directly as a flex child, giving it full height

---

## 3. File Map

### Frontend (`src/`)

```
src/
├── App.jsx                          # Route tree with ProtectedRoute guards
├── main.jsx                         # Vite entry point
├── index.css                        # Tailwind directives + base styles
│
├── api/
│   └── client.js                    # API client (apiFetch + endpoint helpers)
│
├── components/
│   ├── ProtectedRoute.jsx           # Role-based route guard
│   ├── inbox/
│   │   ├── Avatar.jsx               # Gradient avatar with initials
│   │   ├── ChannelBadge.jsx         # WhatsApp/Instagram/Messenger badge
│   │   ├── ChatQueue.jsx            # Left sidebar: search, filters, conversation list
│   │   ├── ChatWindow.jsx           # Main chat area: header, messages, composer
│   │   ├── ContextPanel.jsx         # ★ RIGHT SIDEBAR: customer info, notes, tickets, CRM
│   │   └── MessageBubble.jsx        # Individual message bubble
│   ├── layout/
│   │   ├── AppLayout.jsx            # Shell: sidebar + <Outlet>
│   │   └── Sidebar.jsx              # ★ Navigation (role-aware, cleaned)
│   └── settings/
│       ├── SectionCard.jsx          # Reusable card with header icon + tone
│       └── ToggleSwitch.jsx         # Toggle switch component
│
├── contexts/
│   ├── AuthContext.jsx              # Demo + Supabase auth (DEMO_MODE toggle)
│   └── DataContext.jsx              # Demo + Supabase data (DEMO_MODE toggle)
│
├── lib/
│   ├── mockData.js                  # Demo tenants, users, ALL_TENANTS
│   └── supabase.js                  # Supabase client singleton
│
├── pages/
│   ├── AdminConfig.jsx              # Store settings: channels, POS, routing
│   ├── Inbox.jsx                    # 3-panel inbox layout
│   ├── Inventory.jsx                # Stock table with tenant filter
│   ├── Login.jsx                    # Email/password login
│   ├── Orders.jsx                   # ★ ORDERS SPREADSHEET (tenant/status/channel/source filters)
│   ├── UserManagement.jsx           # Team CRUD
│   └── vendor/
│       ├── VendorDashboard.jsx      # Super admin platform overview
│       └── SuperAdminDashboard.jsx  # Re-export of VendorDashboard
│
├── services/
│   └── evolutionApiService.js       # Evolution API webhook parser + outbound sender
│
└── utils/                           # (empty — available for shared helpers)
```

### Backend (`server/`)

```
server/
├── index.mjs                        # Fastify server entry
├── config.mjs                       # Environment config loader
├── db/
│   ├── client.mjs                   # Supabase server client
│   ├── schema.sql                   # Full multi-tenant Postgres schema + RLS
│   └── seed_tenant.mjs             # Tenant provisioning script
├── middleware/
│   └── auth.mjs                     # API key → tenant lookup middleware
├── routes/
│   ├── conversations.mjs            # GET/PATCH conversations, messages, inventory, orders
│   └── webhook.mjs                  # Evolution API inbound webhook receiver
└── services/
    ├── evolution.mjs                # Outbound message sender
    ├── llm.mjs                      # LM Studio API wrapper
    ├── orderService.mjs             # Fuzzy SKU matching + order insert + stock deduction
    └── pipeline.mjs                 # Full message pipeline: inbound → LLM → response → order
```

---

## 4. Demo Mode

Both `AuthContext.jsx` and `DataContext.jsx` have a `DEMO_MODE = true` toggle at the top. When enabled:

- **Auth:** Uses hardcoded `DEMO_USERS` from `mockData.js`
- **Data:** Returns empty arrays for conversations/inventory (no Supabase calls)
- **Orders:** Uses `ORDER_ROWS` hardcoded in `Orders.jsx` (12 rich mock rows)
- **Customer sidebar:** Generates realistic demo notes, tickets, CRM data

### Demo Credentials

| Email | Password | Role |
|---|---|---|
| `parth@samuhik.ai` | `demo1234` | super_admin |
| `admin@demo.com` | `demo1234` | admin |
| `agent@demo.com` | `demo1234` | agent |

---

## 5. What Needs to Be Done Next

### Priority 1 — Backend Wiring

| Task | File(s) | Notes |
|---|---|---|
| Connect Orders to API | `Orders.jsx` | Replace `ORDER_ROWS` with `api.getOrders()`. Backend route exists at `GET /api/orders`. |
| Connect Inventory to API | `Inventory.jsx` | Replace empty state with `api.getInventory()`. Backend route exists at `GET /api/inventory`. |
| Connect Customer sidebar | `ContextPanel.jsx` | Notes, tickets, CRM need new Supabase tables (`contact_notes`, `tickets`, `crm_deals`). |
| Connect Internal Notes | `ContextPanel.jsx` | Add POST endpoint for notes. Schema: `{ tenant_id, contact_id, author_id, text, created_at }`. |
| Export CSV | `Orders.jsx` | Wire the "Export CSV" button to generate and download a CSV of filtered rows. |

### Priority 2 — Schema Extensions

```sql
-- Internal notes on customer contacts
CREATE TABLE contact_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Support tickets
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  conversation_id UUID REFERENCES conversations(id),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Priority 3 — Polish

| Task | Notes |
|---|---|
| Flip `DEMO_MODE` to `false` | In `AuthContext.jsx` and `DataContext.jsx` when Supabase is provisioned |
| PasalOS integration | AdminConfig POS sync → real webhook to PasalOS or custom POS |
| Evolution API pairing | Pair WhatsApp number via Evolution API dashboard |
| Netlify deploy | Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_KEY` in Netlify env |

---

## 6. Environment Variables

### Frontend (Vite — `VITE_` prefix)

| Variable | Example |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` |
| `VITE_API_KEY` | `raw-hex-key` |

### Backend (Node / Fastify)

| Variable | Example |
|---|---|
| `PORT` | `3001` |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |
| `LM_STUDIO_BASE_URL` | `http://127.0.0.1:8787` |
| `LM_STUDIO_MODEL` | `gemma-4-e4b-uncensored-hauhaucs-aggressive` |
| `EVOLUTION_API_URL` | `https://evo.yourdomain.com` |
| `EVOLUTION_API_KEY` | `your-key` |
| `EVOLUTION_INSTANCE` | `samuhik-instance` |

---

## 7. Quick Start (Development)

```bash
# 1. Clone & install
git clone <repo-url> && cd samuhik
npm install

# 2. Create .env (copy from .env.example, fill in values)
cp .env.example .env

# 3. Start frontend (demo mode — no backend needed)
npm run dev

# 4. Login at http://localhost:5173
#    Super admin: parth@samuhik.ai / demo1234
#    Store admin: admin@demo.com / demo1234
```

For full-stack development with backend:

```bash
npm run llm:bridge    # Terminal 1 — CORS bridge (port 8787)
npm run server:dev    # Terminal 2 — Fastify backend (port 3001)
npm run dev           # Terminal 3 — Vite frontend (port 5173)
```

---

*Generated by Antigravity · 2026-04-30 · v2*
