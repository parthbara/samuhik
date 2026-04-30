import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ALL_TENANTS } from '../lib/mockData';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  Filter,
  LayoutGrid,
  Search,
  UserRoundCheck,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — In production, replace with: api.getOrders({ tenant_id })
   The Fastify backend already exposes GET /api/orders with tenant scoping.
   ═══════════════════════════════════════════════════════════════════════════ */

const ORDER_ROWS = [
  { ticket_no: 'TKT-2026-0001', tenant_id: 'tenant-001', order_id: 'ORD-1007', customer: 'Maya Optical Store',    channel: 'WhatsApp',  item: 'BlueCut 1.56 lens',        quantity: 10, unit_price: 450,  status: 'Reserved',        order_source: 'ai_generated',  assignee: 'Samuhik AI',     resolution: 'AI extracted order and reserved stock',            created_at: '2026-04-30 10:22' },
  { ticket_no: 'TKT-2026-0002', tenant_id: 'tenant-002', order_id: 'ORD-1008', customer: 'Kathmandu Fashion Hub', channel: 'Instagram', item: 'Cotton kurta set',          quantity: 2,  unit_price: 1800, status: 'Awaiting payment', order_source: 'human_agent',   assignee: 'Ram Shrestha',   resolution: 'Manual quote sent after size confirmation',        created_at: '2026-04-30 11:05' },
  { ticket_no: 'TKT-2026-0003', tenant_id: 'tenant-001', order_id: 'ORD-1009', customer: 'Retail Walk-in Lead',   channel: 'Messenger', item: 'Eye checkup appointment',   quantity: 1,  unit_price: 500,  status: 'Scheduled',       order_source: 'ai_generated',  assignee: 'Samuhik AI',     resolution: 'AI created appointment ticket',                    created_at: '2026-04-30 12:40' },
  { ticket_no: 'TKT-2026-0004', tenant_id: 'tenant-001', order_id: 'ORD-1010', customer: 'Pokhara Optics',        channel: 'WhatsApp',  item: 'Progressive 1.67 lens',    quantity: 6,  unit_price: 1200, status: 'Completed',       order_source: 'ai_generated',  assignee: 'Samuhik AI',     resolution: 'Stock deducted, invoice generated',                created_at: '2026-04-30 08:15' },
  { ticket_no: 'TKT-2026-0005', tenant_id: 'tenant-002', order_id: 'ORD-1011', customer: 'Online DM Buyer',       channel: 'Instagram', item: 'Denim jacket M',            quantity: 1,  unit_price: 3200, status: 'Shipped',         order_source: 'human_agent',   assignee: 'Sita Gurung',    resolution: 'Shipped via courier, tracking shared',             created_at: '2026-04-30 09:00' },
  { ticket_no: 'TKT-2026-0006', tenant_id: 'tenant-001', order_id: 'ORD-1012', customer: 'Lalitpur Opticals',     channel: 'WhatsApp',  item: 'Anti-glare coating',        quantity: 20, unit_price: 350,  status: 'Reserved',        order_source: 'ai_generated',  assignee: 'Samuhik AI',     resolution: 'Bulk order reserved, pending payment confirmation', created_at: '2026-04-30 13:30' },
  { ticket_no: 'TKT-2026-0007', tenant_id: 'tenant-002', order_id: 'ORD-1013', customer: 'TikTok Live Viewer',    channel: 'TikTok',   item: 'Graphic T-shirt XL',        quantity: 3,  unit_price: 850,  status: 'Awaiting payment', order_source: 'ai_generated',  assignee: 'Samuhik AI',     resolution: 'AI captured order from live comment',              created_at: '2026-04-30 14:00' },
  { ticket_no: 'TKT-2026-0008', tenant_id: 'tenant-001', order_id: 'ORD-1014', customer: 'Bhaktapur Eye Center',  channel: 'Messenger', item: 'Contact lens solution',     quantity: 12, unit_price: 200,  status: 'Completed',       order_source: 'human_agent',   assignee: 'Ram Shrestha',   resolution: 'Repeat order, auto-applied wholesale price',       created_at: '2026-04-29 16:20' },
  { ticket_no: 'TKT-2026-0009', tenant_id: 'tenant-002', order_id: 'ORD-1015', customer: 'Wholesale Enquiry',     channel: 'WhatsApp',  item: 'Assorted scarves (50 pcs)', quantity: 50, unit_price: 350,  status: 'Quoted',          order_source: 'human_agent',   assignee: 'Sita Gurung',    resolution: 'Bulk quote PDF sent, awaiting confirmation',       created_at: '2026-04-29 11:45' },
  { ticket_no: 'TKT-2026-0010', tenant_id: 'tenant-001', order_id: 'ORD-1016', customer: 'Walk-in Referral',      channel: 'WhatsApp',  item: 'Rimless titanium frame',    quantity: 1,  unit_price: 8500, status: 'Awaiting payment', order_source: 'ai_generated',  assignee: 'Samuhik AI',     resolution: 'AI recommended frame based on face shape query',   created_at: '2026-04-29 10:00' },
  { ticket_no: 'TKT-2026-0011', tenant_id: 'tenant-002', order_id: 'ORD-1017', customer: 'Repeat Buyer',          channel: 'Instagram', item: 'Linen pants L',             quantity: 2,  unit_price: 2200, status: 'Shipped',         order_source: 'ai_generated',  assignee: 'Samuhik AI',     resolution: 'Recognized returning customer, applied 5% loyalty', created_at: '2026-04-28 15:30' },
  { ticket_no: 'TKT-2026-0012', tenant_id: 'tenant-001', order_id: 'ORD-1018', customer: 'Emergency Repair',      channel: 'WhatsApp',  item: 'Frame repair service',      quantity: 1,  unit_price: 300,  status: 'Completed',       order_source: 'human_agent',   assignee: 'Ram Shrestha',   resolution: 'Same-day repair completed and picked up',          created_at: '2026-04-28 09:10' },
];

const STATUS_OPTIONS = ['all', 'Reserved', 'Awaiting payment', 'Scheduled', 'Completed', 'Shipped', 'Quoted'];
const CHANNEL_OPTIONS = ['all', 'WhatsApp', 'Instagram', 'Messenger', 'TikTok'];
const SOURCE_OPTIONS = [
  { value: 'all', label: 'All sources' },
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'human_agent', label: 'Human Agent' },
];

const statusClasses = {
  Reserved:          'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'Awaiting payment': 'bg-amber-50 text-amber-700 ring-amber-100',
  Scheduled:         'bg-indigo-50 text-indigo-700 ring-indigo-100',
  Completed:         'bg-slate-100 text-slate-600 ring-slate-200',
  Shipped:           'bg-blue-50 text-blue-700 ring-blue-100',
  Quoted:            'bg-purple-50 text-purple-700 ring-purple-100',
};

const channelDotColor = {
  WhatsApp:  'bg-emerald-500',
  Instagram: 'bg-rose-500',
  Messenger: 'bg-blue-500',
  TikTok:    'bg-slate-700',
};

/* ── Sub-components ──────────────────────────────────────────────────────── */

const SourceBadge = ({ source }) => {
  const isAi = source === 'ai_generated';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
      isAi ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
    }`}>
      {isAi ? <Bot className="h-3 w-3" /> : <UserRoundCheck className="h-3 w-3" />}
      {isAi ? 'AI Generated' : 'Human Agent'}
    </span>
  );
};

const SortableHeader = ({ label, sortKey, currentSort, onSort }) => {
  const active = currentSort.key === sortKey;
  const asc = active && currentSort.dir === 'asc';
  return (
    <th
      className="border-b border-slate-200 px-4 py-3 font-bold cursor-pointer select-none hover:bg-slate-100/50 transition-colors group"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
          {active
            ? (asc ? <ArrowUp className="h-3 w-3 text-indigo-600" /> : <ArrowDown className="h-3 w-3 text-indigo-600" />)
            : <ArrowUpDown className="h-3 w-3" />}
        </span>
      </span>
    </th>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT — Store Admin Orders View
   Super Admins also see this with a tenant filter.
   ═══════════════════════════════════════════════════════════════════════════ */

const Orders = () => {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';
  const tenants = isSuperAdmin ? ALL_TENANTS : [];

  // ── Filters ────────────────────────────────────────────────────────────
  const [tenantFilter, setTenantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [query, setQuery] = useState('');

  // ── Sort ───────────────────────────────────────────────────────────────
  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' });
  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  // ── Compute ────────────────────────────────────────────────────────────
  const baseRows = useMemo(() => {
    // Non-super admins only see their own tenant's orders
    if (!isSuperAdmin && profile?.tenant_id) {
      return ORDER_ROWS.filter((r) => r.tenant_id === profile.tenant_id);
    }
    return ORDER_ROWS;
  }, [isSuperAdmin, profile?.tenant_id]);

  const filteredRows = useMemo(() => {
    let rows = baseRows.filter((row) => {
      if (tenantFilter !== 'all' && row.tenant_id !== tenantFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (channelFilter !== 'all' && row.channel !== channelFilter) return false;
      if (sourceFilter !== 'all' && row.order_source !== sourceFilter) return false;
      if (query) {
        const haystack = `${row.ticket_no} ${row.order_id} ${row.customer} ${row.item} ${row.channel} ${row.assignee}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    });

    rows.sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.dir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sort.dir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return rows;
  }, [baseRows, tenantFilter, statusFilter, channelFilter, sourceFilter, query, sort]);

  const totalRevenue = filteredRows.reduce((sum, r) => sum + (r.unit_price * r.quantity), 0);
  const aiCount = filteredRows.filter((r) => r.order_source === 'ai_generated').length;
  const humanCount = filteredRows.filter((r) => r.order_source === 'human_agent').length;
  const completedCount = filteredRows.filter((r) => r.status === 'Completed' || r.status === 'Shipped').length;

  const tenantName = (id) => ALL_TENANTS.find((t) => t.id === id)?.name || id;

  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-8">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {isSuperAdmin ? 'Super Admin' : 'Store Admin'}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Orders & Ticket Spreadsheet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track tickets generated by the LLM and orders finalized by human agents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tickets</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{filteredRows.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Orders</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{aiCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Human</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{humanCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue</p>
            <p className="mt-1 text-xl font-bold text-slate-900">Rs. {totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* ── Spreadsheet Card ─────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Operational Spreadsheet</h3>
              <p className="text-[11px] text-slate-500">Sortable · Filterable · API-ready</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Tenant Dropdown — only for super_admin */}
            {tenants.length > 0 && (
              <label className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={tenantFilter}
                  onChange={(e) => setTenantFilter(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="all">All stores</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
            )}

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
              ))}
            </select>

            {/* Channel */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All channels' : c}</option>
              ))}
            </select>

            {/* Source */}
            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>

            {/* Search */}
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 sm:w-56"
                placeholder="Search ticket, customer, item..."
              />
            </label>

            {/* Export */}
            <button
              type="button"
              className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors sm:inline-flex"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-white text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <SortableHeader label="Ticket No" sortKey="ticket_no" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Order" sortKey="order_id" currentSort={sort} onSort={handleSort} />
                {isSuperAdmin && <th className="border-b border-slate-200 px-4 py-3 font-bold">Store</th>}
                <SortableHeader label="Customer" sortKey="customer" currentSort={sort} onSort={handleSort} />
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Channel</th>
                <SortableHeader label="Item" sortKey="item" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Qty" sortKey="quantity" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Unit ₹" sortKey="unit_price" currentSort={sort} onSort={handleSort} />
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Total</th>
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Source</th>
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Status</th>
                <SortableHeader label="Assignee" sortKey="assignee" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Resolution" sortKey="resolution" currentSort={sort} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row, idx) => (
                <tr key={row.ticket_no} className={`transition-colors hover:bg-indigo-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600">{row.ticket_no}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{row.order_id}</td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {tenantName(row.tenant_id)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{row.customer}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${channelDotColor[row.channel] || 'bg-slate-400'}`} />
                      {row.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-[180px] truncate">{row.item}</td>
                  <td className="px-4 py-3.5 font-bold text-center">{row.quantity}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600">Rs.{row.unit_price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">Rs.{(row.unit_price * row.quantity).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5"><SourceBadge source={row.order_source} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${statusClasses[row.status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                      {(row.status === 'Completed' || row.status === 'Shipped') ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{row.assignee}</td>
                  <td className="px-4 py-3.5 max-w-[220px] truncate text-xs text-slate-500">{row.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filteredRows.length}</span> of{' '}
            <span className="font-bold text-slate-700">{baseRows.length}</span> rows
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>AI: <span className="font-bold text-emerald-600">{aiCount}</span></span>
            <span>Human: <span className="font-bold text-blue-600">{humanCount}</span></span>
            <span>Fulfilled: <span className="font-bold text-slate-700">{completedCount}</span></span>
            <span>Total: <span className="font-bold text-slate-900">Rs. {totalRevenue.toLocaleString('en-IN')}</span></span>
          </div>
        </div>

        {/* Empty */}
        {filteredRows.length === 0 && (
          <div className="px-6 py-16 text-center">
            <LayoutGrid className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No orders match your filters</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting the status, channel, or search query.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;
