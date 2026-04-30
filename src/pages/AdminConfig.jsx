import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Globe, Key, Save, AlertCircle, Building2 } from 'lucide-react';

const DEMO_MODE = true;

const AdminConfig = () => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    evolutionApiUrl: '',
    evolutionApiKey: '',
    evolutionInstance: ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.tenants) {
      setFormData({
        evolutionApiUrl: profile.tenants.evolution_api_url || '',
        evolutionApiKey: profile.tenants.evolution_api_key || '',
        evolutionInstance: profile.tenants.evolution_instance || ''
      });
      setLoading(false);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (DEMO_MODE) {
      // In demo mode just show success feedback
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      return;
    }

    // Real Supabase path
    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase
      .from('tenants')
      .update({
        evolution_api_url: formData.evolutionApiUrl,
        evolution_api_key: formData.evolutionApiKey,
        evolution_instance: formData.evolutionInstance
      })
      .eq('id', profile.tenant_id);

    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Store Configuration</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your WhatsApp integration and store identity.</p>
      </div>

      <div className="bg-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-xl shadow-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{profile.tenants?.name}</h3>
            <p className="text-indigo-100 text-sm opacity-80">Tenant ID: {profile.tenant_id}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Evolution API Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">WhatsApp Integration (Evolution API)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Evolution API URL</label>
              <input
                type="text"
                name="evolutionApiUrl"
                value={formData.evolutionApiUrl}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-mono"
                placeholder="https://evo.yourdomain.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Instance Name</label>
                <input
                  type="text"
                  name="evolutionInstance"
                  value={formData.evolutionInstance}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm"
                  placeholder="samuhik-instance"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    name="evolutionApiKey"
                    value={formData.evolutionApiKey}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm"
                    placeholder="••••••••••••••••"
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                The AI Assistant uses this connection to send and receive messages. Ensure your Evolution API instance is paired with a WhatsApp account.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {isSaved ? (
            <div className="text-emerald-600 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
              <Save className="w-4 h-4" />
              Settings saved successfully!
            </div>
          ) : (
            <div></div>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-slate-200 transform active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </form>

      <div className="mt-12 p-6 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">AI Engine Status</p>
        <p className="text-sm text-slate-600 font-medium italic">
          "Using Samuhik Global LLM (Romanized Nepali Optimized). Settings managed by platform vendor."
        </p>
      </div>
    </div>
  );
};

export default AdminConfig;
