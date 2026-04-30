import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
    accent: 'border-emerald-200 bg-emerald-50/50',
    copy: 'Primary channel for Nepali retail and wholesale buyers.',
    placeholder: 'https://remote-server.example.com/webhooks/whatsapp',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Camera,
    tone: 'rose',
    accent: 'border-rose-200 bg-rose-50/50',
    copy: 'Capture product inquiries, story replies, and catalogue DMs.',
    placeholder: 'https://remote-server.example.com/webhooks/instagram',
  },
  {
    id: 'messenger',
    label: 'Messenger',
    icon: MessageSquareText,
    tone: 'blue',
    accent: 'border-blue-200 bg-blue-50/50',
    copy: 'Unify Facebook page messages and follow-up support.',
    placeholder: 'https://remote-server.example.com/webhooks/messenger',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: Music2,
    tone: 'slate',
    accent: 'border-slate-200 bg-slate-50',
    copy: 'Prepare for TikTok Shop comments, leads, and creator messages.',
    placeholder: 'https://remote-server.example.com/webhooks/tiktok',
  },
];

const makeInitialChannelState = () =>
  CHANNELS.reduce((state, channel) => ({
    ...state,
    [channel.id]: {
      enabled: channel.id === 'whatsapp',
      webhookUrl: '',
      connected: false,
    },
  }), {});

const AdminConfig = () => {
  const { profile } = useAuth();
  const [channelState, setChannelState] = useState(makeInitialChannelState);
  const [posEndpoint, setPosEndpoint] = useState('');
  const [posSyncState, setPosSyncState] = useState('idle');
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
  };

  const syncInventory = () => {
    setPosSyncState('syncing');
    setTimeout(() => setPosSyncState('synced'), 900);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Store Admin</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Omnichannel Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Connect customer channels, control AI routing, and sync stock from PasalOS or a custom POS.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{profile?.tenants?.name || 'Store workspace'}</p>
              <p className="text-xs text-slate-500">Tenant ID: {profile?.tenant_id || 'not assigned'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Channels</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{connectedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Routing</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{routingRules.aiFirst ? 'On' : 'Off'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">POS Sync</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{posSyncState === 'synced' ? 'Ready' : 'Draft'}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <SectionCard icon={Plug} title="Channel Connections" eyebrow="Inbox inputs" tone="indigo">
          <div className="grid gap-4 xl:grid-cols-2">
            {CHANNELS.map((channel) => {
              const Icon = channel.icon;
              const state = channelState[channel.id];

              return (
                <article key={channel.id} className={`rounded-2xl border p-4 ${channel.accent}`}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-800 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{channel.label}</h4>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{channel.copy}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={state.enabled}
                      onChange={(checked) => updateChannel(channel.id, { enabled: checked })}
                    />
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Incoming Webhook URL
                    </span>
                    <input
                      type="url"
                      value={state.webhookUrl}
                      onChange={(event) => updateChannel(channel.id, { webhookUrl: event.target.value, connected: false })}
                      className="w-full rounded-xl border border-white/80 bg-white px-4 py-2.5 font-mono text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      placeholder={channel.placeholder}
                    />
                  </label>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      state.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500 ring-1 ring-slate-200'
                    }`}>
                      {state.connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                      {state.connected ? 'Connected' : 'Not connected'}
                    </span>
                    <button
                      type="button"
                      onClick={() => connectChannel(channel.id)}
                      disabled={!state.webhookUrl.trim()}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:bg-slate-300 disabled:shadow-none"
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
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                PasalOS / Custom POS Webhook Endpoint
              </label>
              <input
                type="url"
                value={posEndpoint}
                onChange={(event) => {
                  setPosEndpoint(event.target.value);
                  setPosSyncState('idle');
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                placeholder="https://pasalos.example.com/webhooks/inventory"
              />
            </div>
            <button
              type="button"
              onClick={syncInventory}
              disabled={!posEndpoint.trim() || posSyncState === 'syncing'}
              className="h-12 rounded-xl bg-amber-600 px-6 text-sm font-bold text-white shadow-lg shadow-amber-100 hover:bg-amber-700 disabled:bg-slate-300 disabled:shadow-none"
            >
              {posSyncState === 'syncing' ? 'Syncing...' : 'Sync Inventory'}
            </button>
          </div>
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm leading-6 text-amber-900">
                Store Admins can manage their daily POS sync here. Super Admins can also audit and override tenant-level POS policy from the platform console.
              </p>
            </div>
          </div>
          {posSyncState === 'synced' && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Inventory sync simulated. This is ready for PasalOS API wiring tomorrow.
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Route} title="AI Routing & Ticket Rules" eyebrow="Handover policy" tone="blue">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <ToggleSwitch
                checked={routingRules.aiFirst}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, aiFirst: checked }))}
                label="AI-first replies"
                description="Let the LLM draft the first response before a human takes over."
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <ToggleSwitch
                checked={routingRules.routeAngryCustomers}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, routeAngryCustomers: checked }))}
                label="Escalate frustrated customers"
                description="Route angry or human-request messages directly to staff."
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <ToggleSwitch
                checked={routingRules.businessHoursOnly}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, businessHoursOnly: checked }))}
                label="Business-hours automation"
                description="Pause AI outside store hours and create follow-up tickets."
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <ToggleSwitch
                checked={routingRules.autoCreateTicket}
                onChange={(checked) => setRoutingRules((current) => ({ ...current, autoCreateTicket: checked }))}
                label="Auto-create tickets"
                description="Create an internal ticket when order intent or escalation is detected."
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Bot} title="Readiness Checklist" eyebrow="Tomorrow wiring" tone="emerald">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              'Supabase tenants, conversations, messages, and inventory tables',
              'Webhook receiver for incoming omnichannel payloads',
              'LLM context builder with tenant prompt and POS inventory snapshot',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
                <p className="text-sm font-semibold leading-6 text-emerald-950">{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminConfig;
