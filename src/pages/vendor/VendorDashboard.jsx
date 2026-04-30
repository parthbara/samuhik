import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Plus, 
  Search, 
  Users, 
  ExternalLink, 
  Settings2,
  MoreVertical,
  Key
} from 'lucide-react';

const VendorDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tenants')
      .select('*, users(count)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenants:', error.message);
    } else {
      setTenants(data);
    }
    setLoading(false);
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    // Generate a placeholder API key hash for now
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                  {t.evolution_instance ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-medium text-slate-700">{t.evolution_instance}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not connected</span>
                  )}
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

export default VendorDashboard;
