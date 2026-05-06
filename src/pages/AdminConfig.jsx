import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  AlertCircle,
  Bot,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  MessageCircle,
  MessageSquareText,
  Music2,
  Plug,
  RefreshCw,
  Route,
  ShieldCheck,
} from 'lucide-react';
import SectionCard from '../components/settings/SectionCard';
import ToggleSwitch from '../components/settings/ToggleSwitch';

const CHANNELS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    tone: 'emerald',
    accent: 'border-emerald-500/20 bg-emerald-500/5',
    copy: 'Primary channel for Nepali retail and wholesale buyers.',
    placeholder: 'https://remote-server.example.com/webhooks/whatsapp',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Camera,
    tone: 'rose',
    accent: 'border-rose-500/20 bg-rose-500/5',
    copy: 'Capture product inquiries, story replies, and catalogue DMs.',
    placeholder: 'https://remote-server.example.com/webhooks/instagram',
  },
  {
    id: 'messenger',
    label: 'Messenger',
    icon: MessageSquareText,
    tone: 'blue',
    accent: 'border-blue-500/20 bg-blue-500/5',
    copy: 'Unify Facebook page messages and follow-up support.',
    placeholder: 'https://remote-server.example.com/webhooks/messenger',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: Music2,
    tone: 'slate',
    accent: 'border-subtle bg-surface/50',
    copy: 'Prepare for TikTok Shop comments, leads, and creator messages.',
    placeholder: 'https://remote-server.example.com/webhooks/tiktok',
  },
];

const makeInitialChannelState = () =>
  CHANNELS.reduce((state, channel) => ({
    ...state,
    [channel.id]: {
      enabled: channel.id !== 'tiktok',
      webhookUrl: channel.id !== 'tiktok' ? `https://remote-server.example.com/webhooks/${channel.id}` : '',
      connected: channel.id !== 'tiktok',
    },
  }), {});

const AdminConfig = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [channelState, setChannelState] = useState(makeInitialChannelState);
  const [posEndpoint, setPosEndpoint] = useState('');
  const [posSyncState, setPosSyncState] = useState('idle');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [routingRules, setRoutingRules] = useState({
    aiFirst: true,
    routeAngryCustomers: true,
    businessHoursOnly: false,
    autoCreateTicket: true,
  });

  const connectedCount = useMemo(
    () => Object.values(channelState).filter((channel) => channel.connected).length,
    [channelState]
  );

  const updateChannel = (channelId, updates) => {
    setChannelState((current) => ({
      ...current,
      [channelId]: {
        ...current[channelId],
        ...updates,
      },
    }));
  };

  const connectChannel = (channelId) => {
    const channel = channelState[channelId];
    updateChannel(channelId, {
      connected: Boolean(channel.webhookUrl.trim()),
      enabled: true,
    });
    
    addToast(`${CHANNELS.find(c => c.id === channelId).label} webhook connected successfully.`, 'success');
  };

  const syncInventory = () => {
    setPosSyncState('syncing');
    setTimeout(() => {
      setPosSyncState('synced');
      addToast('Inventory synced successfully from POS.', 'success');
    }, 900);
  };

  const saveRoutingRules = () => {
    addToast('AI routing rules saved.', 'success');
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8 relative">
      <div className="relative z-10 mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Store Admin</p>
          <h2 className="mt-1 text-3xl font-extrabold text-primary tracking-tight">Omnichannel Settings</h2>
          <p className="mt-1 text-sm text-secondary font-medium">
            Connect customer channels, control AI routing, and sync stock from PasalOS or a custom POS.
          </p>
        </div>
        <div className="glass-card rounded-2xl px-5 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent glow-accent">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">{profile?.tenants?.name || 'Store workspace'}</p>
              <p className="text-xs text-muted font-mono mt-0.5">ID: {profile?.tenant_id || 'not assigned'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-8 grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-2xl p-5 shadow-lg stat-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Connected Channels</p>
          <p className="text-4xl font-black text-primary">{connectedCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 shadow-lg stat-card relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">AI Routing</p>
          <p className="text-4xl font-black text-accent">{routingRules.aiFirst ? 'Active' : 'Paused'}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 shadow-lg stat-card relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">POS Sync</p>
          <p className="text-4xl font-black text-warm">{posSyncState === 'synced' ? 'Ready' : 'Draft'}</p>
        </div>
      </div>

      <div className="relative z-10 grid gap-6">
        <SectionCard icon={Plug} title="Channel Connections" eyebrow="Inbox inputs" tone="indigo">
          <div className="grid gap-4 xl:grid-cols-2">
            {CHANNELS.map((channel) => {
              const Icon = channel.icon;
              const state = channelState[channel.id];

              return (
                <article key={channel.id} className={`rounded-2xl border p-5 transition-all hover:bg-surface/80 ${channel.accent}`}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface border border-subtle text-primary shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-primary">{channel.label}</h4>
                        <p className="mt-1 text-xs leading-5 text-secondary">{channel.copy}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={state.enabled}
                      onChange={(checked) => {
                        updateChannel(channel.id, { enabled: checked });
                        addToast(`${channel.label} ${checked ? 'enabled' : 'disabled'}.`, 'info');
                      }}
                    />
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
                      Incoming Webhook URL
                    </span>
                    <input
                      type="url"
                      value={state.webhookUrl}
                      onChange={(event) => updateChannel(channel.id, { webhookUrl: event.target.value, connected: false })}
                      className="w-full rounded-xl border border-subtle bg-surface px-4 py-2.5 font-mono text-sm text-primary outline-none transition-all focus-ring placeholder:text-muted/50"
                      placeholder={channel.placeholder}
                    />
                  </label>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                      state.connected ? 'bg-accent/10 text-accent border-accent/20' : 'bg-surface text-secondary border-subtle'
                    }`}>
                      {state.connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                      {state.connected ? 'Connected' : 'Not connected'}
                    </span>
                    <button
                      type="button"
                      onClick={() => connectChannel(channel.id)}
                      disabled={!state.webhookUrl.trim()}
                      className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-deep hover:bg-accent-dim disabled:bg-surface disabled:text-muted disabled:border disabled:border-subtle transition-all"
                    >
                      Connect
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard icon={RefreshCw} title="External POS Integration" eyebrow="Store-owned stock sync" tone="amber">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
                PasalOS / Custom POS Webhook Endpoint
              </label>
              <input
                type="url"
                value={posEndpoint}
                onChange={(event) => {
                  setPosEndpoint(event.target.value);
                  setPosSyncState('idle');
                }}
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 font-mono text-sm text-primary outline-none transition-all focus-ring placeholder:text-muted/50"
                placeholder="https://pasalos.example.com/webhooks/inventory"
              />
            </div>
            <button
              type="button"
              onClick={syncInventory}
              disabled={!posEndpoint.trim() || posSyncState === 'syncing'}
              className="h-12 rounded-xl bg-warm px-6 text-sm font-bold text-deep hover:brightness-110 disabled:bg-surface disabled:text-muted disabled:border disabled:border-subtle transition-all"
            >
              {posSyncState === 'syncing' ? 'Syncing...' : 'Sync Inventory'}
            </button>
          </div>
          <div className="mt-4 rounded-xl border border-warm/20 bg-warm/5 p-4 flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warm" />
            <p className="text-sm leading-6 text-secondary">
              Store Admins can manage their daily POS sync here. Super Admins can also audit and override tenant-level POS policy from the platform console.
            </p>
          </div>
          {posSyncState === 'synced' && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Inventory sync simulated. This is ready for PasalOS API wiring tomorrow.
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Bot} title="AI System Prompt" eyebrow="Personality & rules" tone="emerald">
          <div className="mb-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
                Store-specific System Prompt
              </span>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full resize-none rounded-xl border border-subtle bg-surface px-4 py-3 text-sm leading-6 text-primary outline-none transition-all focus-ring placeholder:text-muted/50"
                placeholder="You are a helpful AI assistant for our store. Always reply in Romanized Nepali. Be polite and concise. Escalate when necessary."
              />
            </label>
          </div>
          <div className="flex justify-end">
             <button
              onClick={() => addToast('System prompt saved.', 'success')}
              className="rounded-xl bg-surface border border-subtle px-6 py-2.5 text-sm font-bold text-primary hover:bg-hover transition-all"
            >
              Save Prompt
            </button>
          </div>
        </SectionCard>

        <SectionCard icon={Route} title="AI Routing & Ticket Rules" eyebrow="Handover policy" tone="blue">
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div className="rounded-xl border border-subtle bg-surface/50 p-5 hover:bg-surface transition-colors">
              <ToggleSwitch
                checked={routingRules.aiFirst}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, aiFirst: checked }))}
                label="AI-first replies"
                description="Let the LLM draft the first response before a human takes over."
              />
            </div>
            <div className="rounded-xl border border-subtle bg-surface/50 p-5 hover:bg-surface transition-colors">
              <ToggleSwitch
                checked={routingRules.routeAngryCustomers}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, routeAngryCustomers: checked }))}
                label="Escalate frustrated customers"
                description="Route angry or human-request messages directly to staff."
              />
            </div>
            <div className="rounded-xl border border-subtle bg-surface/50 p-5 hover:bg-surface transition-colors">
              <ToggleSwitch
                checked={routingRules.businessHoursOnly}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, businessHoursOnly: checked }))}
                label="Business-hours automation"
                description="Pause AI outside store hours and create follow-up tickets."
              />
            </div>
            <div className="rounded-xl border border-subtle bg-surface/50 p-5 hover:bg-surface transition-colors">
              <ToggleSwitch
                checked={routingRules.autoCreateTicket}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, autoCreateTicket: checked }))}
                label="Auto-create tickets"
                description="Create an internal ticket when order intent or escalation is detected."
              />
            </div>
          </div>
          <div className="flex justify-end">
             <button
              onClick={saveRoutingRules}
              className="rounded-xl bg-surface border border-subtle px-6 py-2.5 text-sm font-bold text-primary hover:bg-hover transition-all"
            >
              Save Rules
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminConfig;
