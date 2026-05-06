import React, { useMemo, useState, useEffect } from 'react';
import { ALL_TENANTS } from '../../lib/mockData';
import { DEMO_MODE } from '../../lib/config';
import { useToast } from '../../contexts/ToastContext';
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
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
  { id: 'instagram', label: 'Instagram', icon: Camera, className: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.3)]' },
  { id: 'messenger', label: 'Messenger', icon: MessageSquareText, className: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.3)]' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, className: 'bg-surface text-secondary border-subtle' },
];

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
  const { addToast } = useToast();
  
  const [platformEngine, setPlatformEngine] = useState({
    globalSystemPrompt: 'Always answer in Romanized Nepali unless the customer writes in English. Provide clear, concise answers. Escalate angry customers, refund requests, or sensitive queries immediately to a human agent.',
    webhookReceiverUrl: '/.netlify/functions/gemini',
    defaultModel: 'gemini-2.5-flash',
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

    const { supabase } = await import('../../lib/supabase');
    const { data, error } = await supabase
      .from('tenants')
      .select('*, users(count)')
      .order('created_at', { ascending: false });

    if (error) {
      addToast('Error fetching tenants: ' + error.message, 'error');
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
      const newTenant = {
        id: 'tenant-' + Date.now(),
        name: newTenantName,
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
      addToast('New store created successfully', 'success');
      return;
    }

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
      addToast('Error creating tenant: ' + error.message, 'error');
    } else {
      setShowAddModal(false);
      setNewTenantName('');
      fetchTenants();
      addToast('New store created successfully', 'success');
    }
  };

  const handleSavePlatformEngine = () => {
    addToast('Platform Engine Settings Saved', 'success');
  };
  
  const handleSaveBrainSettings = () => {
    addToast('Tenant Brain Settings Saved', 'success');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="relative z-10 flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Platform Overview</h2>
          <p className="text-secondary text-sm mt-1 font-medium">Manage all business customers and system health.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dim text-deep px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,212,170,0.3)] hover:shadow-[0_0_20px_rgba(0,212,170,0.5)]"
        >
          <Plus className="w-4 h-4" />
          Add New Store
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl shadow-lg stat-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Total Stores</p>
          <p className="text-4xl font-black text-primary">{tenants.length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-lg stat-card relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Connected Channels</p>
          <p className="text-4xl font-black text-accent">
            {tenants.reduce((acc, t) => acc + (tenantBrainSettings[t.id]?.enabledPlatforms?.length || 1), 0)}
          </p>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-lg stat-card relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Total Messages</p>
          <p className="text-4xl font-black text-blue-400">1.2k</p>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-lg stat-card">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">AI Engine</p>
          <p className="text-4xl font-black text-primary">Normal</p>
        </div>
      </div>

      <div className="relative z-10">
        <SectionCard icon={Server} title="Platform Engine Controls" eyebrow="Super Admin master settings" tone="indigo">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">Default Model</span>
              <input
                value={platformEngine.defaultModel}
                onChange={(event) => setPlatformEngine((current) => ({ ...current, defaultModel: event.target.value }))}
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 font-mono text-sm outline-none focus-ring text-primary transition-all"
                placeholder="gemini-2.5-flash"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">AI Function Route</span>
              <input
                value={platformEngine.webhookReceiverUrl}
                onChange={(event) => setPlatformEngine((current) => ({ ...current, webhookReceiverUrl: event.target.value }))}
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 font-mono text-sm outline-none focus-ring text-primary transition-all"
                placeholder="/.netlify/functions/gemini"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">Global System Prompt</span>
              <textarea
                rows={3}
                value={platformEngine.globalSystemPrompt}
                onChange={(event) => setPlatformEngine((current) => ({ ...current, globalSystemPrompt: event.target.value }))}
                className="w-full resize-none rounded-xl border border-subtle bg-surface px-4 py-3 text-sm leading-6 outline-none focus-ring text-primary transition-all"
              />
            </label>
            <div className="lg:col-span-2 grid gap-4 rounded-xl border border-subtle bg-surface/50 p-5 hover:bg-surface transition-colors">
              <ToggleSwitch
                checked={platformEngine.aiEnabledByDefault}
                onChange={(checked) => setPlatformEngine((current) => ({ ...current, aiEnabledByDefault: checked }))}
                label="AI enabled by default"
                description="New tenants start with AI auto-reply available."
              />
              <div className="h-px w-full bg-subtle"></div>
              <ToggleSwitch
                checked={platformEngine.allowTenantWebSearch}
                onChange={(checked) => setPlatformEngine((current) => ({ ...current, allowTenantWebSearch: checked }))}
                label="Allow tenant web search"
                description="Super Admin can still disable it tenant by tenant."
              />
              <div className="h-px w-full bg-subtle"></div>
              <ToggleSwitch
                checked={platformEngine.requireHumanForPayments}
                onChange={(checked) => setPlatformEngine((current) => ({ ...current, requireHumanForPayments: checked }))}
                label="Human approval for payment flows"
                description="Keeps sensitive commercial actions out of full automation."
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
             <button
              onClick={handleSavePlatformEngine}
              className="rounded-xl bg-surface border border-subtle px-6 py-2.5 text-sm font-bold text-primary hover:bg-hover transition-all"
            >
              Save Engine Settings
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="relative z-10 mt-8 grid gap-6 xl:grid-cols-2">
        <SectionCard icon={ClipboardList} title="Tenant Message Segregation" eyebrow="Omnichannel queue audit" tone="blue">
          <div className="mb-4">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Inspect tenant messages
            </label>
            <select
              value={messageTenantId}
              onChange={(event) => setMessageTenantId(event.target.value)}
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm font-bold text-primary outline-none focus-ring transition-all"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {buildTenantMessages(selectedMessageTenant).map((message) => (
              <div key={message.id} className="rounded-xl border border-subtle bg-surface p-4 hover:border-medium transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{message.channel}</p>
                    <p className="mt-1 truncate text-sm font-bold text-primary">{message.customer}</p>
                    <p className="mt-1 truncate text-sm text-secondary">{message.preview}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                    message.priority === 'High' ? 'bg-warm/10 text-warm border-warm/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
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
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Inspect tenant inventory
            </label>
            <select
              value={inventoryTenantId}
              onChange={(event) => setInventoryTenantId(event.target.value)}
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm font-bold text-primary outline-none focus-ring transition-all"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
          <div className="overflow-hidden rounded-xl border border-subtle bg-surface/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/50 text-[10px] uppercase tracking-widest text-muted border-b border-subtle">
                <tr>
                  <th className="px-4 py-3 font-bold">SKU</th>
                  <th className="px-4 py-3 font-bold">Item</th>
                  <th className="px-4 py-3 font-bold">Stock</th>
                  <th className="px-4 py-3 font-bold">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {buildTenantInventory(selectedInventoryTenant).map((item) => (
                  <tr key={item.sku} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-secondary">{item.sku}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{item.item}</td>
                    <td className="px-4 py-3 font-bold text-primary">{item.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        item.stock <= 10 ? 'bg-warm/10 text-warm border-warm/20' : 'bg-accent/10 text-accent border-accent/20'
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

      <div className="relative z-10 mt-8 glass-card rounded-2xl shadow-2xl border border-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-subtle bg-surface/50 flex items-center justify-between backdrop-blur-md">
          <h3 className="font-extrabold text-primary">Customers (Tenants)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input 
              className="pl-9 pr-4 py-2 bg-surface border border-subtle rounded-xl text-sm outline-none focus-ring text-primary placeholder:text-muted min-w-[200px] transition-all" 
              placeholder="Filter stores..." 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/30 border-b border-subtle">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Store Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Integration</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Staff</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Created At</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {tenants.map((t, idx) => (
                <tr key={t.id} className={`transition-colors hover:bg-hover/80 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-surface/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-primary shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{t.name}</p>
                        <p className="text-[10px] font-mono text-secondary mt-0.5">{t.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(tenantBrainSettings[t.id]?.enabledPlatforms || ['whatsapp']).map((platformId) => {
                        const platform = PLATFORM_OPTIONS.find((item) => item.id === platformId);
                        if (!platform) return null;
                        return (
                          <span key={platform.id} className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${platform.className}`}>
                            {platform.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                      <Users className="w-3.5 h-3.5" />
                      {t.users?.[0]?.count || 0} Members
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted font-mono">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-surface border border-transparent hover:border-subtle rounded-lg text-muted hover:text-primary transition-all" title="Manage Tenant">
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-surface border border-transparent hover:border-subtle rounded-lg text-muted hover:text-primary transition-all" title="View Dashboard">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tenants.length === 0 && !loading && (
          <div className="p-12 text-center text-muted font-medium bg-surface/30">
            No customers onboarded yet.
          </div>
        )}
      </div>

      <section className="relative z-10 mt-8 glass-card rounded-2xl shadow-2xl border border-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-subtle bg-surface/50 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <h3 className="font-extrabold text-primary">Tenant Brain Controls</h3>
          </div>
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400 glow-indigo">
            Super Admin
          </span>
        </div>

        <div className="divide-y divide-subtle">
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
              <form key={tenant.id} className="p-6 bg-transparent hover:bg-surface/20 transition-colors">
                <div className="mb-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-primary">{tenant.name}</h4>
                    <p className="mt-1 font-mono text-[11px] text-muted">{tenant.id}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 rounded-xl border border-subtle bg-surface/50 px-3 py-2">
                    <Globe2 className="h-4 w-4 text-secondary" />
                    <ToggleSwitch
                      checked={settings.webSearchEnabled}
                      onChange={(checked) => updateTenantBrainSetting(tenant.id, 'webSearchEnabled', checked)}
                      label="Enable Live Web Search"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-muted" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
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
                              ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 glow-indigo'
                              : 'border-subtle bg-surface text-secondary hover:bg-hover'
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
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">
                    Store Context Prompt
                  </span>
                  <textarea
                    rows={4}
                    value={settings.storeContextPrompt}
                    onChange={(event) => updateTenantBrainSetting(tenant.id, 'storeContextPrompt', event.target.value)}
                    className="w-full resize-none rounded-xl border border-subtle bg-surface px-4 py-3 text-sm leading-6 text-primary outline-none transition-all focus-ring placeholder:text-muted/50"
                    placeholder="You are an assistant for a clothing store. Help customers with sizes, colors, delivery, and exchanges."
                  />
                </label>
                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="rounded-2xl border border-subtle bg-surface/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted" />
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Tenant Channel Endpoints</h5>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {PLATFORM_OPTIONS.map((platform) => {
                        const Icon = platform.icon;
                        const enabled = settings.enabledPlatforms?.includes(platform.id);
                        return (
                          <label key={platform.id} className={`${enabled ? '' : 'opacity-30'} block transition-opacity`}>
                            <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                              <Icon className="h-3.5 w-3.5" />
                              {platform.label} Relay URL
                            </span>
                            <input
                              disabled={!enabled}
                              value={settings.channelEndpoints?.[platform.id] || ''}
                              onChange={(event) => updateTenantChannelEndpoint(tenant.id, platform.id, event.target.value)}
                              className="w-full rounded-xl border border-subtle bg-surface px-3 py-2.5 font-mono text-xs text-primary outline-none focus-ring disabled:cursor-not-allowed placeholder:text-muted/30"
                              placeholder={`https://relay.example.com/${platform.id}/${tenant.id}`}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <label className="block rounded-2xl border border-subtle bg-surface/30 p-4 hover:bg-surface transition-colors">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        AI Routing Mode
                      </span>
                      <select
                        value={settings.aiRoutingMode}
                        onChange={(event) => updateTenantBrainSetting(tenant.id, 'aiRoutingMode', event.target.value)}
                        className="w-full rounded-xl border border-subtle bg-surface px-3 py-2.5 text-sm font-semibold text-primary outline-none focus-ring"
                      >
                        <option value="ai_first">AI first, human fallback</option>
                        <option value="human_first">Human first</option>
                        <option value="business_hours">AI after hours only</option>
                      </select>
                    </label>
                    <label className="block rounded-2xl border border-subtle bg-surface/30 p-4 hover:bg-surface transition-colors">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                        <Database className="h-3.5 w-3.5" />
                        POS Endpoint
                      </span>
                      <input
                        value={settings.posEndpoint}
                        onChange={(event) => updateTenantBrainSetting(tenant.id, 'posEndpoint', event.target.value)}
                        className="w-full rounded-xl border border-subtle bg-surface px-3 py-2.5 font-mono text-xs text-primary outline-none focus-ring placeholder:text-muted/50"
                        placeholder="https://pasalos.example.com/sync"
                      />
                    </label>
                    <label className="block rounded-2xl border border-subtle bg-surface/30 p-4 hover:bg-surface transition-colors">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Ticket SLA
                      </span>
                      <input
                        value={settings.ticketSla}
                        onChange={(event) => updateTenantBrainSetting(tenant.id, 'ticketSla', event.target.value)}
                        className="w-full rounded-xl border border-subtle bg-surface px-3 py-2.5 text-sm font-semibold text-primary outline-none focus-ring placeholder:text-muted/50"
                        placeholder="15 minutes"
                      />
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBrainSettings}
                    className="rounded-xl bg-surface border border-subtle px-4 py-2 text-sm font-bold text-primary shadow-lg hover:bg-hover transition-colors"
                  >
                    Save Brain Settings
                  </button>
                </div>
              </form>
            );
          })}
          {tenants.length === 0 && !loading && (
            <div className="p-12 text-center text-muted font-medium bg-surface/30">
              No tenants available for brain configuration.
            </div>
          )}
        </div>
      </section>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-elevated border border-subtle rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-subtle flex justify-between items-center bg-surface/50">
              <h3 className="font-extrabold text-primary text-lg">Register New Customer</h3>
            </div>
            <form onSubmit={handleCreateTenant} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-subtle rounded-xl focus-ring outline-none transition-all text-sm text-primary placeholder:text-muted/50"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Provision Platforms</label>
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
                            ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 glow-indigo'
                            : 'border-subtle bg-surface text-secondary hover:bg-hover'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-bold">{platform.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 mb-4">
                <Key className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-secondary leading-relaxed">
                  Creating a store will generate a unique tenant ID. You can later assign an administrator email to this store.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-subtle text-secondary font-bold rounded-xl hover:bg-hover hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-accent text-deep font-bold rounded-xl hover:bg-accent-dim shadow-[0_0_15px_rgba(0,212,170,0.2)] transition-all"
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
