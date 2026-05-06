import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
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
  Reserved:          'bg-accent/10 text-accent ring-accent/20',
  'Awaiting payment': 'bg-warm/10 text-warm ring-warm/20',
  Scheduled:         'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
  Completed:         'bg-surface text-muted ring-subtle border border-subtle',
  Shipped:           'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  Quoted:            'bg-purple-500/10 text-purple-400 ring-purple-500/20',
};

const channelDotColor = {
  WhatsApp:  'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
  Instagram: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
  Messenger: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
  TikTok:    'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]',
};

/* ── Sub-components ──────────────────────────────────────────────────────── */

const SourceBadge = ({ source }) => {
  const isAi = source === 'ai_generated';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
      isAi ? 'bg-accent/10 text-accent ring-1 ring-accent/20 border border-accent/30' : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 border border-blue-500/30'
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
      className="border-b border-subtle px-4 py-3 font-bold cursor-pointer select-none hover:bg-hover transition-colors group text-[11px] uppercase tracking-widest text-muted"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-muted/50 group-hover:text-secondary transition-colors">
          {active
            ? (asc ? <ArrowUp className="h-3 w-3 text-accent" /> : <ArrowDown className="h-3 w-3 text-accent" />)
            : <ArrowUpDown className="h-3 w-3" />}
        </span>
      </span>
    </th>
  );
};

const Orders = () => {
  const { profile } = useAuth();
  const { orders } = useData();
  const isSuperAdmin = profile?.role === 'super_admin';
  const tenants = isSuperAdmin ? ALL_TENANTS : [];

  const [tenantFilter, setTenantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [query, setQuery] = useState('');

  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' });
  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  const baseRows = useMemo(() => {
    const rows = [...(orders || []), ...ORDER_ROWS];
    if (!isSuperAdmin && profile?.tenant_id) {
      return rows.filter((r) => r.tenant_id === profile.tenant_id);
    }
    return rows;
  }, [isSuperAdmin, profile?.tenant_id, orders]);

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

  const handleExportCSV = () => {
    const headers = ['Ticket No', 'Order ID', 'Store', 'Customer', 'Phone', 'Address', 'Channel', 'Item', 'Quantity', 'Unit Price', 'Total Price', 'Source', 'Status', 'Assignee', 'Resolution', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredRows.map(row => [
        row.ticket_no,
        row.order_id,
        tenantName(row.tenant_id),
        `"${row.customer}"`,
        `"${row.phone || '-'}"`,
        `"${row.address || '-'}"`,
        row.channel,
        `"${row.item}"`,
        row.quantity,
        row.unit_price,
        row.quantity * row.unit_price,
        row.order_source,
        row.status,
        `"${row.assignee}"`,
        `"${row.resolution}"`,
        row.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `samuhik_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-8 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>
      
      <div className="relative z-10 mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            {isSuperAdmin ? 'Super Admin' : 'Store Admin'}
          </p>
          <h2 className="mt-1 text-3xl font-extrabold text-primary tracking-tight">Orders & Ticket Spreadsheet</h2>
          <p className="mt-1 text-sm text-secondary font-medium">
            Track tickets generated by the LLM and orders finalized by human agents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="glass-card rounded-2xl px-5 py-4 shadow-lg stat-card">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Tickets</p>
            <p className="mt-1 text-3xl font-black text-primary">{filteredRows.length}</p>
          </div>
          <div className="glass-card rounded-2xl px-5 py-4 shadow-lg stat-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent rounded-full mix-blend-screen filter blur-[48px] opacity-10"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">AI Orders</p>
            <p className="mt-1 text-3xl font-black text-accent">{aiCount}</p>
          </div>
          <div className="glass-card rounded-2xl px-5 py-4 shadow-lg stat-card relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full mix-blend-screen filter blur-[48px] opacity-10"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Human</p>
            <p className="mt-1 text-3xl font-black text-blue-400">{humanCount}</p>
          </div>
          <div className="glass-card rounded-2xl px-5 py-4 shadow-lg stat-card">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Revenue</p>
            <p className="mt-1 text-2xl font-black text-primary">Rs. {totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <section className="relative z-10 overflow-hidden rounded-2xl border border-subtle glass-card shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-subtle bg-surface/80 backdrop-blur-md px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20 glow-accent">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-primary">Operational Spreadsheet</h3>
              <p className="text-[11px] font-mono text-muted">Sortable · Filterable · API-ready</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {tenants.length > 0 && (
              <label className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <select
                  value={tenantFilter}
                  onChange={(e) => setTenantFilter(e.target.value)}
                  className="h-10 rounded-xl border border-subtle bg-surface pl-9 pr-8 text-sm font-semibold outline-none focus-ring text-primary transition-all"
                >
                  <option value="all">All stores</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-subtle bg-surface px-3 text-sm font-semibold outline-none focus-ring text-primary transition-all"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
              ))}
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-10 rounded-xl border border-subtle bg-surface px-3 text-sm font-semibold outline-none focus-ring text-primary transition-all"
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All channels' : c}</option>
              ))}
            </select>

            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-10 rounded-xl border border-subtle bg-surface pl-9 pr-8 text-sm font-semibold outline-none focus-ring text-primary transition-all"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>

            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-subtle bg-surface pl-9 pr-3 text-sm outline-none focus-ring text-primary placeholder:text-muted sm:w-56 transition-all"
                placeholder="Search ticket, customer, item..."
              />
            </label>

            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden h-10 items-center gap-2 rounded-xl border border-subtle bg-elevated px-4 text-sm font-bold text-primary hover:bg-hover hover:border-medium transition-colors sm:inline-flex group"
            >
              <Download className="h-4 w-4 text-secondary group-hover:text-accent transition-colors" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-surface/50 border-b border-subtle">
              <tr>
                <SortableHeader label="Ticket No" sortKey="ticket_no" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Order" sortKey="order_id" currentSort={sort} onSort={handleSort} />
                {isSuperAdmin && <th className="border-b border-subtle px-4 py-3 font-bold text-[11px] uppercase tracking-widest text-muted">Store</th>}
                <SortableHeader label="Customer" sortKey="customer" currentSort={sort} onSort={handleSort} />
                <th className="border-b border-subtle px-4 py-3 font-bold text-[11px] uppercase tracking-widest text-muted">Contact</th>
                <th className="border-b border-subtle px-4 py-3 font-bold text-[11px] uppercase tracking-widest text-muted">Location</th>
                <th className="border-b border-subtle px-4 py-3 font-bold text-[11px] uppercase tracking-widest text-muted">Channel</th>
                <SortableHeader label="Item" sortKey="item" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Qty" sortKey="quantity" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Unit ₹" sortKey="unit_price" currentSort={sort} onSort={handleSort} />
                <th className="border-b border-subtle px-4 py-3 font-bold text-[11px] uppercase tracking-widest text-muted">Total</th>
                <th className="border-b border-subtle px-4 py-3 font-bold text-[11px] uppercase tracking-widest text-muted">Source</th>
                <th className="border-b border-subtle px-4 py-3 font-bold text-[11px] uppercase tracking-widest text-muted">Status</th>
                <SortableHeader label="Assignee" sortKey="assignee" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Resolution" sortKey="resolution" currentSort={sort} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {filteredRows.map((row, idx) => (
                <tr key={row.ticket_no} className={`transition-colors hover:bg-hover/80 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-surface/30'}`}>
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-accent">{row.ticket_no}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-secondary">{row.order_id}</td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-subtle px-2.5 py-1 text-[10px] font-bold text-primary">
                        <Building2 className="h-3 w-3 text-secondary" />
                        {tenantName(row.tenant_id)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3.5 font-semibold text-primary">{row.customer}</td>
                  <td className="px-4 py-3.5 text-xs text-secondary">{row.phone || '-'}</td>
                  <td className="px-4 py-3.5 text-xs text-secondary max-w-[120px] truncate" title={row.address || '-'}>{row.address || '-'}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary">
                      <span className={`h-2 w-2 rounded-full ${channelDotColor[row.channel] || 'bg-slate-400'}`} />
                      {row.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-[180px] truncate text-primary">{row.item}</td>
                  <td className="px-4 py-3.5 font-bold text-center text-primary">{row.quantity}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-secondary">Rs.{row.unit_price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">Rs.{(row.unit_price * row.quantity).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5"><SourceBadge source={row.order_source} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${statusClasses[row.status] || 'bg-surface text-secondary ring-subtle border border-subtle'}`}>
                      {(row.status === 'Completed' || row.status === 'Shipped') ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-secondary font-medium">{row.assignee}</td>
                  <td className="px-4 py-3.5 max-w-[220px] truncate text-xs text-muted">{row.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-subtle bg-surface/50 px-5 py-3 backdrop-blur-md">
          <p className="text-xs text-muted">
            Showing <span className="font-bold text-primary">{filteredRows.length}</span> of{' '}
            <span className="font-bold text-primary">{baseRows.length}</span> rows
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-muted">
            <span>AI: <span className="font-bold text-accent">{aiCount}</span></span>
            <span>Human: <span className="font-bold text-blue-400">{humanCount}</span></span>
            <span>Fulfilled: <span className="font-bold text-primary">{completedCount}</span></span>
            <span>Total: <span className="font-bold text-primary">Rs. {totalRevenue.toLocaleString('en-IN')}</span></span>
          </div>
        </div>

        {filteredRows.length === 0 && (
          <div className="px-6 py-16 text-center bg-surface/30">
            <LayoutGrid className="mx-auto mb-3 h-12 w-12 text-muted opacity-50" />
            <p className="text-sm font-semibold text-secondary">No orders match your filters</p>
            <p className="mt-1 text-sm text-muted">Try adjusting the status, channel, or search query.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;
