import React, { useMemo, useState, useEffect } from 'react';
import { ALL_TENANTS } from '../../lib/mockData';
import { 
  Building2, 
  Plus, 
  Search, 
  Users, 
  ExternalLink, 
  Settings2,
  Key,
  Brain,
  Globe2,
  MessageCircle,
  Camera,
  MessageSquareText,
  Music2,
  Layers3,
  Server,
  Database,
  SlidersHorizontal,
  Link2,
  ShieldCheck,
  ClipboardList,
  PackageSearch,
} from 'lucide-react';
import ToggleSwitch from '../../components/settings/ToggleSwitch';
import SectionCard from '../../components/settings/SectionCard';

const PLATFORM_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  { id: 'instagram', label: 'Instagram', icon: Camera, className: 'bg-rose-50 text-rose-700 ring-rose-100' },
  { id: 'messenger', label: 'Messenger', icon: MessageSquareText, className: 'bg-blue-50 text-blue-700 ring-blue-100' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, className: 'bg-slate-100 text-slate-700 ring-slate-200' },
];

const DEMO_MODE = true;

const buildTenantMessages = (tenant) => [
  {
    id: `${tenant?.id || 'tenant'}-msg-1`,
    channel: 'WhatsApp',
    customer: 'Retail buyer',
    preview: 'lens ko price list pathaunu na',
    status: 'AI drafted',
    priority: 'Normal',
  },
  {
    id: `${tenant?.id || 'tenant'}-msg-2`,
    channel: 'Instagram',
    customer: 'Catalogue lead',
    preview: 'yo frame ko black color available cha?',
    status: 'Waiting human',
    priority: 'High',
  },
];

const buildTenantInventory = (tenant) => [
  {
    sku: `${tenant?.id || 'TEN'}-SKU-001`,
    item: tenant?.name?.toLowerCase().includes('fashion') ? 'Cotton kurta set' : 'BlueCut single vision lens',
    stock: tenant?.name?.toLowerCase().includes('fashion') ? 18 : 42,
    syncStatus: 'Ready',
  },
  {
    sku: `${tenant?.id || 'TEN'}-SKU-002`,
    item: tenant?.name?.toLowerCase().includes('fashion') ? 'T-shirt assorted sizes' : 'Reading glasses bulk pack',
    stock: tenant?.name?.toLowerCase().includes('fashion') ? 7 : 120,
    syncStatus: 'Low stock watch',
  },
];

const SuperAdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [tenantBrainSettings, setTenantBrainSettings] = useState({});
  const [newTenantPlatforms, setNewTenantPlatforms] = useState(['whatsapp']);
  const [messageTenantId, setMessageTenantId] = useState('');
  const [inventoryTenantId, setInventoryTenantId] = useState('');
  const [platformEngine, setPlatformEngine] = useState({
    llmBaseUrl: 'https://remote-lmstudio.ngrok.app/v1',
    defaultModel: 'gemma-4-e4b-uncensored-hauhaucs-aggressive',
    globalGuardrailPrompt: 'Always answer in Romanized Nepali unless the customer writes in English. Escalate angry customers or sensitive requests.',
    webhookReceiverUrl: 'https://api.samuhik.local/webhooks/inbound',
    aiEnabledByDefault: true,
    allowTenantWebSearch: true,
    requireHumanForPayments: true,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 300));
      const demoTenants = [...ALL_TENANTS];
      setTenants(demoTenants);
      setMessageTenantId(demoTenants[0]?.id || '');
      setInventoryTenantId(demoTenants[0]?.id || '');
      setTenantBrainSettings(
        demoTenants.reduce((settings, tenant) => ({
          ...settings,
          [tenant.id]: {
            storeContextPrompt: tenant.store_context_prompt || '',
            webSearchEnabled: Boolean(tenant.web_search_enabled),
            enabledPlatforms: tenant.enabled_platforms || ['whatsapp'],
            aiRoutingMode: tenant.ai_routing_mode || 'ai_first',
            ticketSla: tenant.ticket_sla || '15 minutes',
            posEndpoint: tenant.pos_endpoint || '',
            channelEndpoints: tenant.channel_endpoints || {},
          },
        }), {})
      );
      setLoading(false);
      return;
    }

    // Real Supabase path
    const { supabase } = await import('../../lib/supabase');
    const { data, error } = await supabase
      .from('tenants')
      .select('*, users(count)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenants:', error.message);
    } else {
      setTenants(data);
      setMessageTenantId(data[0]?.id || '');
      setInventoryTenantId(data[0]?.id || '');
      setTenantBrainSettings(
        data.reduce((settings, tenant) => ({
          ...settings,
          [tenant.id]: {
            storeContextPrompt: tenant.store_context_prompt || '',
            webSearchEnabled: Boolean(tenant.web_search_enabled),
            enabledPlatforms: tenant.enabled_platforms || ['whatsapp'],
            aiRoutingMode: tenant.ai_routing_mode || 'ai_first',
            ticketSla: tenant.ticket_sla || '15 minutes',
            posEndpoint: tenant.pos_endpoint || '',
            channelEndpoints: tenant.channel_endpoints || {},
          },
        }), {})
      );
    }
    setLoading(false);
  };

  const selectedMessageTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === messageTenantId) || tenants[0],
    [messageTenantId, tenants]
  );

  const selectedInventoryTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === inventoryTenantId) || tenants[0],
    [inventoryTenantId, tenants]
  );

  const updateTenantBrainSetting = (tenantId, key, value) => {
    setTenantBrainSettings((current) => ({
      ...current,
      [tenantId]: {
        storeContextPrompt: '',
        webSearchEnabled: false,
        enabledPlatforms: ['whatsapp'],
        aiRoutingMode: 'ai_first',
        ticketSla: '15 minutes',
        posEndpoint: '',
        channelEndpoints: {},
        ...current[tenantId],
        [key]: value,
      },
    }));
  };

  const updateTenantChannelEndpoint = (tenantId, platformId, value) => {
    const current = tenantBrainSettings[tenantId]?.channelEndpoints || {};
    updateTenantBrainSetting(tenantId, 'channelEndpoints', {
      ...current,
      [platformId]: value,
    });
  };

  const toggleTenantPlatform = (tenantId, platformId) => {
    const current = tenantBrainSettings[tenantId]?.enabledPlatforms || ['whatsapp'];
    const next = current.includes(platformId)
      ? current.filter((item) => item !== platformId)
      : [...current, platformId];

    updateTenantBrainSetting(tenantId, 'enabledPlatforms', next);
  };

  const toggleNewTenantPlatform = (platformId) => {
    setNewTenantPlatforms((current) =>
      current.includes(platformId)
        ? current.filter((item) => item !== platformId)
        : [...current, platformId]
    );
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();

    if (DEMO_MODE) {
      // Add locally in demo mode
      const newTenant = {
        id: 'tenant-' + Date.now(),
        name: newTenantName,
        evolution_api_url: '',
        evolution_api_key: '',
        evolution_instance: '',
        store_context_prompt: '',
        web_search_enabled: false,
        enabled_platforms: newTenantPlatforms,
        api_key_hash: 'demo_' + Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        users: [{ count: 0 }],
      };
      setTenants(prev => [newTenant, ...prev]);
      setTenantBrainSettings(prev => ({
        ...prev,
        [newTenant.id]: {
          storeContextPrompt: '',
          webSearchEnabled: false,
          enabledPlatforms: newTenantPlatforms,
          aiRoutingMode: 'ai_first',
          ticketSla: '15 minutes',
          posEndpoint: '',
          channelEndpoints: {},
        },
      }));
      setShowAddModal(false);
      setNewTenantName('');
      setNewTenantPlatforms(['whatsapp']);
      return;
    }

    // Real Supabase path
    const { supabase } = await import('../../lib/supabase');
    const dummyHash = 'dummy_' + Math.random().toString(36).substring(7);
    
    const { data, error } = await supabase
      .from('tenants')
      .insert({ 
        name: newTenantName,
        api_key_hash: dummyHash 
      })
      .select()
      .single();

    if (error) {
      alert('Error creating tenant: ' + error.message);
    } else {
      setShowAddModal(false);
      setNewTenantName('');
      fetchTenants();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Platform Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all business customers and system health.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          Add New Store
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Stores</p>
          <p className="text-3xl font-bold text-slate-900">{tenants.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Instances</p>
          <p className="text-3xl font-bold text-emerald-600">
            {tenants.filter(t => t.evolution_instance).length}
          </p>
        </div>
        {/* Placeholder stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Messages</p>
          <p className="text-3xl font-bold text-indigo-600">1.2k</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">LLM Load</p>
          <p className="text-3xl font-bold text-slate-900">Normal</p>
        </div>
      </div>

      <SectionCard icon={Server} title="Platform Engine Controls" eyebrow="Super Admin master settings" tone="indigo">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Remote LLM Base URL</span>
            <input
              value={platformEngine.llmBaseUrl}
              onChange={(event) => setPlatformEngine((current) => ({ ...current, llmBaseUrl: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              placeholder="https://your-lmstudio-ngrok-url/v1"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Default Model</span>
            <input
              value={platformEngine.defaultModel}
              onChange={(event) => setPlatformEngine((current) => ({ ...current, defaultModel: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              placeholder="gemma-4-e4b..."
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Global Guardrail Prompt</span>
            <textarea
              rows={3}
              value={platformEngine.globalGuardrailPrompt}
              onChange={(event) => setPlatformEngine((current) => ({ ...current, globalGuardrailPrompt: event.target.value }))}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Inbound Webhook Receiver</span>
            <input
              value={platformEngine.webhookReceiverUrl}
              onChange={(event) => setPlatformEngine((current) => ({ ...current, webhookReceiverUrl: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              placeholder="https://your-api/webhooks/inbound"
            />
          </label>
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <ToggleSwitch
              checked={platformEngine.aiEnabledByDefault}
              onChange={(checked) => setPlatformEngine((current) => ({ ...current, aiEnabledByDefault: checked }))}
              label="AI enabled by default"
              description="New tenants start with AI auto-reply available."
            />
            <ToggleSwitch
              checked={platformEngine.allowTenantWebSearch}
              onChange={(checked) => setPlatformEngine((current) => ({ ...current, allowTenantWebSearch: checked }))}
              label="Allow tenant web search"
              description="Super Admin can still disable it tenant by tenant."
            />
            <ToggleSwitch
              checked={platformEngine.requireHumanForPayments}
              onChange={(checked) => setPlatformEngine((current) => ({ ...current, requireHumanForPayments: checked }))}
              label="Human approval for payment flows"
              description="Keeps sensitive commercial actions out of full automation."
            />
          </div>
        </div>
      </SectionCard>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <SectionCard icon={ClipboardList} title="Tenant Message Segregation" eyebrow="Omnichannel queue audit" tone="blue">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspect tenant messages
            </label>
            <select
              value={messageTenantId}
              onChange={(event) => setMessageTenantId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {buildTenantMessages(selectedMessageTenant).map((message) => (
              <div key={message.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{message.channel}</p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-900">{message.customer}</p>
                    <p className="mt-1 truncate text-sm text-slate-600">{message.preview}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    message.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {message.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={PackageSearch} title="Tenant Stock & Inventory" eyebrow="POS audit view" tone="amber">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspect tenant inventory
            </label>
            <select
              value={inventoryTenantId}
              onChange={(event) => setInventoryTenantId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">SKU</th>
                  <th className="px-4 py-3 font-bold">Item</th>
                  <th className="px-4 py-3 font-bold">Stock</th>
                  <th className="px-4 py-3 font-bold">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {buildTenantInventory(selectedInventoryTenant).map((item) => (
                  <tr key={item.sku}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.sku}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.item}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{item.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        item.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.syncStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Customers (Tenants)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" 
              placeholder="Filter stores..." 
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Store Name</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Integration</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Staff</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Created At</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{t.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {(tenantBrainSettings[t.id]?.enabledPlatforms || ['whatsapp']).map((platformId) => {
                      const platform = PLATFORM_OPTIONS.find((item) => item.id === platformId);
                      if (!platform) return null;
                      return (
                        <span key={platform.id} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${platform.className}`}>
                          {platform.label}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {t.users?.[0]?.count || 0} Members
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all" title="Manage Tenant">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all" title="View Dashboard">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tenants.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400">
            No customers onboarded yet.
          </div>
        )}
      </div>

      <section className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">Tenant Brain Controls</h3>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
            Super Admin
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {tenants.map((tenant) => {
            const settings = tenantBrainSettings[tenant.id] || {
              storeContextPrompt: '',
              webSearchEnabled: false,
              enabledPlatforms: ['whatsapp'],
              aiRoutingMode: 'ai_first',
              ticketSla: '15 minutes',
              posEndpoint: '',
              channelEndpoints: {},
            };

            return (
              <form key={tenant.id} className="p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{tenant.name}</h4>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">{tenant.id}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <Globe2 className="h-4 w-4 text-slate-500" />
                    <ToggleSwitch
                      checked={settings.webSearchEnabled}
                      onChange={(checked) => updateTenantBrainSetting(tenant.id, 'webSearchEnabled', checked)}
                      label="Enable Live Web Search Capability"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Provisioned Platforms
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const Icon = platform.icon;
                      const enabled = settings.enabledPlatforms?.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => toggleTenantPlatform(tenant.id, platform.id)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                            enabled
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-bold">{platform.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="block">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Store Context Prompt
                  </span>
                  <textarea
                    rows={4}
                    value={settings.storeContextPrompt}
                    onChange={(event) => updateTenantBrainSetting(tenant.id, 'storeContextPrompt', event.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="You are an assistant for a clothing store. Help customers with sizes, colors, delivery, and exchanges."
                  />
                </label>
                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-slate-500" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tenant Channel Endpoints</h5>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {PLATFORM_OPTIONS.map((platform) => {
                        const Icon = platform.icon;
                        const enabled = settings.enabledPlatforms?.includes(platform.id);
                        return (
                          <label key={platform.id} className={`${enabled ? '' : 'opacity-50'} block`}>
                            <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              <Icon className="h-3.5 w-3.5" />
                              {platform.label} Relay URL
                            </span>
                            <input
                              disabled={!enabled}
                              value={settings.channelEndpoints?.[platform.id] || ''}
                              onChange={(event) => updateTenantChannelEndpoint(tenant.id, platform.id, event.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed"
                              placeholder={`https://relay.example.com/${platform.id}/${tenant.id}`}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        AI Routing Mode
                      </span>
                      <select
                        value={settings.aiRoutingMode}
                        onChange={(event) => updateTenantBrainSetting(tenant.id, 'aiRoutingMode', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
                      >
                        <option value="ai_first">AI first, human fallback</option>
                        <option value="human_first">Human first</option>
                        <option value="business_hours">AI after hours only</option>
                      </select>
                    </label>
                    <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Database className="h-3.5 w-3.5" />
                        POS Endpoint
                      </span>
                      <input
                        value={settings.posEndpoint}
                        onChange={(event) => updateTenantBrainSetting(tenant.id, 'posEndpoint', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-indigo-500"
                        placeholder="https://pasalos.example.com/sync"
                      />
                    </label>
                    <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Ticket SLA
                      </span>
                      <input
                        value={settings.ticketSla}
                        onChange={(event) => updateTenantBrainSetting(tenant.id, 'ticketSla', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500"
                        placeholder="15 minutes"
                      />
                    </label>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
                  >
                    Save Brain Settings
                  </button>
                </div>
              </form>
            );
          })}
          {tenants.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-400">
              No tenants available for brain configuration.
            </div>
          )}
        </div>
      </section>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Register New Customer</h3>
            </div>
            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Business Name</label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Provision Platforms</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORM_OPTIONS.map((platform) => {
                    const Icon = platform.icon;
                    const enabled = newTenantPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => toggleNewTenantPlatform(platform.id)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                          enabled
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-bold">{platform.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 mb-4">
                <Key className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Creating a store will generate a unique tenant ID. You can later assign an administrator email to this store.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
