import React, { useState } from 'react';
import {
  Tag,
  MapPin,
  Phone,
  Mail,
  ClipboardList,
  ShoppingBag,
  Clock3,
  Plus,
  ChevronRight,
  Pencil,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Camera,
  MessageSquareText,
  Music2,
  Copy,
  BarChart3,
  Ticket,
  CreditCard,
  Send,
} from 'lucide-react';
import ChannelBadge from './ChannelBadge';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const CHANNEL_META = {
  whatsapp:  { label: 'WhatsApp',  icon: MessageCircle,     color: 'bg-emerald-500', tint: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30' },
  instagram: { label: 'Instagram', icon: Camera,            color: 'bg-gradient-to-tr from-purple-500 to-pink-500', tint: 'bg-rose-500/20 text-rose-400 ring-rose-500/30' },
  messenger: { label: 'Messenger', icon: MessageSquareText, color: 'bg-blue-500', tint: 'bg-blue-500/20 text-blue-400 ring-blue-500/30' },
  tiktok:    { label: 'TikTok',    icon: Music2,            color: 'bg-slate-800', tint: 'bg-slate-500/20 text-slate-300 ring-slate-500/30' },
};

const PRIORITY_CLASSES = {
  urgent: 'bg-red-500/20 text-red-400 ring-red-500/30',
  high: 'bg-warm/20 text-warm ring-warm/30',
  normal: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
  low: 'bg-slate-500/20 text-slate-400 ring-slate-500/30',
};

const TICKET_STATUS_CLASSES = {
  open: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  closed: 'bg-surface text-muted border border-subtle',
  pending: 'bg-warm/20 text-warm border border-warm/30',
};

/* ── Sub-components ───────────────────────────────────────────────────────── */

const SectionHeader = ({ icon: Icon, title, count, action, actionLabel = 'View All' }) => (
  <div className="mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-muted" />}
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-surface border border-subtle px-1 text-[10px] font-bold text-secondary">
            {count}
          </span>
        )}
      </h4>
    </div>
    {action && (
      <button
        type="button"
        onClick={action}
        className="flex items-center gap-1 text-[11px] font-bold text-accent hover:text-accent-dim transition-colors"
      >
        {actionLabel}
        <ChevronRight className="h-3 w-3" />
      </button>
    )}
  </div>
);

const DetailRow = ({ icon: Icon, label, value, copyable }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="group flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted leading-none mb-1">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-primary leading-tight truncate">{value || '—'}</p>
          {copyable && value && (
            <button
              type="button"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-all"
              title="Copy"
            >
              {copied
                ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NoteItem = ({ note }) => (
  <div className="rounded-xl border border-subtle bg-surface p-3 transition-colors hover:border-medium">
    <div className="mb-1.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 border border-accent/30 text-[10px] font-bold text-accent">
          {note.authorInitials || 'SA'}
        </span>
        <span className="text-xs font-bold text-primary">{note.author || 'Staff'}</span>
      </div>
      <span className="text-[10px] text-muted">{note.time || 'Just now'}</span>
    </div>
    <p className="text-xs text-secondary leading-relaxed">{note.text || note}</p>
  </div>
);

const TicketItem = ({ ticket }) => (
  <div className="rounded-xl border border-subtle bg-surface p-3 transition-all hover:border-medium hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-mono font-bold text-muted">#{ticket.id}</p>
        <p className="mt-1 text-sm font-semibold text-primary truncate">{ticket.title}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${PRIORITY_CLASSES[ticket.priority] || PRIORITY_CLASSES.normal}`}>
        {ticket.priority || 'Normal'}
      </span>
    </div>
    <div className="mt-2 flex items-center justify-between">
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TICKET_STATUS_CLASSES[ticket.status] || TICKET_STATUS_CLASSES.open}`}>
        {ticket.status || 'Open'}
      </span>
      <span className="text-[10px] text-muted">{ticket.time || ''}</span>
    </div>
  </div>
);

const CrmDealItem = ({ deal }) => (
  <div className="rounded-xl border border-subtle bg-surface p-3 transition-all hover:border-medium">
    <div className="flex items-center gap-2 mb-1">
      <span className={`flex h-2 w-2 rounded-full ${deal.isNew ? 'bg-accent shadow-[0_0_8px_rgba(0,212,170,0.8)]' : 'bg-muted'}`} />
      <span className="text-sm font-semibold text-primary">{deal.name}</span>
      {deal.isNew && <span className="rounded-full bg-accent/20 border border-accent/30 px-1.5 py-0.5 text-[9px] font-bold text-accent">New</span>}
    </div>
    <p className="text-xs text-secondary truncate">{deal.email}</p>
    <p className="mt-0.5 text-[11px] text-muted font-mono">{deal.company}</p>
  </div>
);

/* ── Demo data builders ───────────────────────────────────────────────────── */

const buildDemoNotes = (conversation) => [
  {
    author: 'Parth',
    authorInitials: 'PB',
    text: 'Customer asked about bulk pricing for lenses. Follow up tomorrow.',
    time: 'Apr 30, 9:15 AM',
  },
  {
    author: 'Sita Gurung',
    authorInitials: 'SG',
    text: 'Confirmed delivery address. Ready for dispatch.',
    time: 'Apr 30, 8:29 AM',
  },
];

const buildDemoTickets = (conversation) => [
  {
    id: '12',
    title: 'Lens prescription verification',
    status: 'open',
    priority: 'urgent',
    time: 'Apr 30, 4:45 PM',
  },
  {
    id: '9',
    title: 'Exchange request for wrong frame color',
    status: 'open',
    priority: 'high',
    time: 'Apr 30, 4:45 PM',
  },
  {
    id: '5',
    title: 'Delivery schedule update',
    status: 'closed',
    priority: 'normal',
    time: 'Apr 29, 2:30 PM',
  },
];

const buildDemoCrm = (conversation) => [
  {
    name: conversation?.customerName || 'Customer',
    email: `${(conversation?.customerName || 'customer').toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    company: 'Walk-in / Direct',
    isNew: true,
  },
];

/* ── Main Component ──────────────────────────────────────────────────────── */

const ContextPanel = ({ conversation }) => {
  const [newNote, setNewNote] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);

  if (!conversation) {
    return (
      <aside className="hidden w-80 flex-col border-l border-subtle bg-elevated xl:flex relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
        <div className="flex flex-1 items-center justify-center p-6 text-center relative z-10">
          <div>
            <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted opacity-50" />
            <p className="text-sm font-semibold text-secondary">Select a conversation</p>
            <p className="mt-1 text-xs text-muted">Customer details will appear here</p>
          </div>
        </div>
      </aside>
    );
  }

  const platform = conversation.platform || 'whatsapp';
  const channelMeta = CHANNEL_META[platform] || CHANNEL_META.whatsapp;
  const ChannelIcon = channelMeta.icon;

  const notes = conversation.notes?.length
    ? conversation.notes.map((n) => (typeof n === 'string' ? { text: n, author: 'Staff', authorInitials: 'ST', time: '' } : n))
    : buildDemoNotes(conversation);
  const visibleNotes = showAllNotes ? notes : notes.slice(0, 2);

  const tickets = conversation.tickets?.length ? conversation.tickets : buildDemoTickets(conversation);
  const visibleTickets = showAllTickets ? tickets : tickets.slice(0, 2);

  const crmDeals = conversation.crmDeals?.length ? conversation.crmDeals : buildDemoCrm(conversation);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    // In production this would POST to the API
    setNewNote('');
  };

  return (
    <aside className="hidden w-[340px] flex-col overflow-y-auto border-l border-subtle bg-elevated xl:flex relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* ── Customer Avatar & Name ──────────────────────────────────────── */}
        <div className="flex flex-col items-center border-b border-subtle px-6 pb-5 pt-6 bg-surface/50">
          <div className="relative mb-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20 ring-4 ring-deep">
              {conversation.initials || conversation.customerName?.charAt(0) || '?'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow-sm ring-2 ring-surface">
              <ChannelBadge platform={platform} size="sm" />
            </span>
          </div>
          <h3 className="text-base font-bold text-primary">{conversation.customerName}</h3>
          <p className="mt-0.5 text-xs text-muted font-mono">@{(conversation.customerName || '').toLowerCase().replace(/\s+/g, '_')}</p>
        </div>

        {/* ── Channel & Status ────────────────────────────────────────────── */}
        <div className="border-b border-subtle px-6 py-4">
          <SectionHeader title="Channel" />
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ring-1 ${channelMeta.tint}`}>
              <ChannelIcon className="h-3.5 w-3.5" />
              {channelMeta.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent ring-1 ring-accent/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />
              Active
            </span>
          </div>
        </div>

        {/* ── Contact Information ──────────────────────────────────────────── */}
        <div className="border-b border-subtle px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader title="Contact Information" />
            <button type="button" className="text-muted hover:text-accent transition-colors" title="Edit contact">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            <DetailRow icon={Phone} label="Phone" value={conversation.phone || '+977 98XX XXX XXX'} copyable />
            <DetailRow icon={Mail} label="Email" value={conversation.email || `${(conversation.customerName || 'customer').toLowerCase().replace(/\s+/g, '.')}@gmail.com`} copyable />
            <DetailRow icon={MapPin} label="Location" value={conversation.address || 'Kathmandu, Nepal'} />
            <DetailRow icon={ShoppingBag} label="Lifetime Value" value={conversation.lifetimeValue || 'Rs. 12,500'} />
          </div>
        </div>

        {/* ── Internal Notes ───────────────────────────────────────────────── */}
        <div className="border-b border-subtle px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader title="Internal Notes" count={notes.length} action={notes.length > 2 ? () => setShowAllNotes(!showAllNotes) : undefined} actionLabel={showAllNotes ? 'Show Less' : 'View All'} />
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface border border-subtle text-secondary hover:text-primary hover:border-medium transition-colors"
              title="Add note"
              onClick={() => setNewNote(newNote ? '' : ' ')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {newNote !== '' && (
            <div className="mb-3 flex gap-2">
              <input
                value={newNote.trim() ? newNote : ''}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a note..."
                className="flex-1 rounded-lg border border-subtle bg-surface px-3 py-2 text-xs text-primary outline-none focus-ring"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="rounded-lg bg-accent px-2.5 py-2 text-deep hover:bg-accent-dim transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="space-y-2">
            {visibleNotes.map((note, i) => (
              <NoteItem key={i} note={note} />
            ))}
          </div>
        </div>

        {/* ── Tickets ──────────────────────────────────────────────────────── */}
        <div className="border-b border-subtle px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader title="Tickets" count={tickets.length} action={tickets.length > 2 ? () => setShowAllTickets(!showAllTickets) : undefined} actionLabel={showAllTickets ? 'Show Less' : 'View All'} />
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface border border-subtle text-secondary hover:text-primary hover:border-medium transition-colors"
              title="Create ticket"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {visibleTickets.map((ticket) => (
              <TicketItem key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>

        {/* ── CRM ──────────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 mb-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader title="CRM" action={() => {}} actionLabel="View All" />
          </div>
          <div className="space-y-2">
            {crmDeals.map((deal, i) => (
              <CrmDealItem key={i} deal={deal} />
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-muted font-mono">
            {crmDeals.length} {crmDeals.length === 1 ? 'deal' : 'deals'} in pipeline
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ContextPanel;
