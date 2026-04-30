import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ALL_USERS_WITH_TENANTS, ALL_TENANTS, DEMO_USERS } from '../lib/mockData';
import { UserPlus, Trash2, Shield, User, X, Search, Building2 } from 'lucide-react';

const DEMO_MODE = true;

const UserManagement = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('agent');
  const [newTenantId, setNewTenantId] = useState('');

  useEffect(() => {
    fetchUsers();
    if (profile.role === 'super_admin') {
      fetchTenants();
    } else {
      setNewTenantId(profile.tenant_id);
    }
  }, [profile]);

  const fetchUsers = async () => {
    setLoading(true);

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 200));
      if (profile.role === 'super_admin') {
        setUsers([...ALL_USERS_WITH_TENANTS]);
      } else {
        setUsers(ALL_USERS_WITH_TENANTS.filter(u => u.tenant_id === profile.tenant_id));
      }
      setLoading(false);
      return;
    }

    // Real Supabase path
    const { supabase } = await import('../lib/supabase');
    let query = supabase.from('users').select('*, tenants(name)');
    
    if (profile.role !== 'super_admin') {
      query = query.eq('tenant_id', profile.tenant_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) console.error('Error fetching users:', error.message);
    else setUsers(data);
    setLoading(false);
  };

  const fetchTenants = async () => {
    if (DEMO_MODE) {
      setTenants(ALL_TENANTS.map(t => ({ id: t.id, name: t.name })));
      return;
    }

    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase.from('tenants').select('id, name');
    setTenants(data || []);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (DEMO_MODE) {
      const newUser = {
        id: 'user-' + Date.now(),
        supabase_uid: 'uid-' + Date.now(),
        email: newEmail,
        name: newName,
        role: newRole,
        tenant_id: newTenantId || profile.tenant_id,
        tenants: tenants.find(t => t.id === (newTenantId || profile.tenant_id)) || null,
        created_at: new Date().toISOString(),
      };
      setUsers(prev => [newUser, ...prev]);
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      return;
    }

    // Real Supabase path
    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase.from('users').insert({
      email: newEmail,
      name: newName,
      role: newRole,
      tenant_id: newTenantId || profile.tenant_id
    });

    if (error) {
      alert('Error adding user: ' + error.message);
    } else {
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      fetchUsers();
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    if (DEMO_MODE) {
      setUsers(prev => prev.filter(u => u.id !== id));
      return;
    }

    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) alert('Error removing user: ' + error.message);
    else fetchUsers();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Management</h2>
          <p className="text-slate-500 text-sm mt-1">
            {profile.role === 'super_admin' ? 'Manage all users across the platform.' : 'Manage staff access and roles for your store.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-100"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Member</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Store</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Role</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                      {u.name?.charAt(0) || u.email.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{u.name || 'Pending Invitation'}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Building2 className="w-3.5 h-3.5" />
                    {u.tenants?.name || 'Platform (Super Admin)'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'super_admin' ? 'bg-purple-50 text-purple-600' : (u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600')
                  }`}>
                    {u.role === 'super_admin' ? <Shield className="w-3 h-3" /> : (u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />)}
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-slate-400">
                  {u.supabase_uid !== profile.supabase_uid && (
                    <button 
                      onClick={() => handleRemove(u.id)}
                      className="hover:text-rose-500 p-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400">No team members found.</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {profile.role === 'super_admin' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assign to Store</label>
                  <select
                    required
                    value={newTenantId}
                    onChange={(e) => setNewTenantId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  >
                    <option value="">Select a store...</option>
                    <option value="NULL">Platform (No Store)</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                >
                  <option value="agent">Staff / Agent</option>
                  <option value="admin">Store Admin</option>
                  {profile.role === 'super_admin' && <option value="super_admin">Vendor / Super Admin</option>}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
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
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
