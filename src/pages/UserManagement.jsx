import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ALL_USERS_WITH_TENANTS, ALL_TENANTS, DEMO_USERS } from '../lib/mockData';
import { DEMO_MODE } from '../lib/config';
import { UserPlus, Trash2, Shield, User, X, Building2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const UserManagement = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
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
      addToast('Team member added successfully', 'success');
      return;
    }

    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase.from('users').insert({
      email: newEmail,
      name: newName,
      role: newRole,
      tenant_id: newTenantId || profile.tenant_id
    });

    if (error) {
      addToast('Error adding user: ' + error.message, 'error');
    } else {
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      fetchUsers();
      addToast('Team member added successfully', 'success');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    if (DEMO_MODE) {
      setUsers(prev => prev.filter(u => u.id !== id));
      addToast('Team member removed', 'info');
      return;
    }

    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) addToast('Error removing user: ' + error.message, 'error');
    else {
      fetchUsers();
      addToast('Team member removed', 'info');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>

      <div className="relative z-10 flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Team Management</h2>
          <p className="text-secondary text-sm mt-1 font-medium">
            {profile.role === 'super_admin' ? 'Manage all users across the platform.' : 'Manage staff access and roles for your store.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dim text-deep px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,212,170,0.3)] hover:shadow-[0_0_20px_rgba(0,212,170,0.5)]"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="relative z-10 glass-card rounded-2xl shadow-2xl overflow-hidden border border-subtle">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface/50 border-b border-subtle">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">Member</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">Store</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">Role</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {users.map((u, idx) => (
              <tr key={u.id} className={`transition-colors hover:bg-hover/50 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-surface/30'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-accent font-bold text-sm shadow-sm">
                      {u.name?.charAt(0) || u.email.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{u.name || 'Pending Invitation'}</p>
                      <p className="text-xs text-secondary mt-0.5">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-secondary font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    {u.tenants?.name || 'Platform (Super Admin)'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : (u.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-surface text-secondary border-subtle')
                  }`}>
                    {u.role === 'super_admin' ? <Shield className="w-3 h-3" /> : (u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />)}
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-muted">
                  {u.supabase_uid !== profile.supabase_uid && (
                    <button 
                      onClick={() => handleRemove(u.id)}
                      className="hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
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
          <div className="p-12 text-center text-muted font-medium bg-surface/30">No team members found.</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-elevated border border-subtle rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-subtle flex justify-between items-center bg-surface/50">
              <h3 className="font-extrabold text-primary text-lg">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-primary transition-colors p-1 rounded-lg hover:bg-hover">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-5">
              {profile.role === 'super_admin' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Assign to Store</label>
                  <select
                    required
                    value={newTenantId}
                    onChange={(e) => setNewTenantId(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-subtle rounded-xl focus-ring outline-none transition-all text-sm font-medium text-primary"
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-subtle rounded-xl focus-ring outline-none transition-all text-sm text-primary placeholder:text-muted/50"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-subtle rounded-xl focus-ring outline-none transition-all text-sm text-primary placeholder:text-muted/50"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-subtle rounded-xl focus-ring outline-none transition-all text-sm font-medium text-primary"
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
                  className="flex-1 px-4 py-3 border border-subtle text-secondary font-bold rounded-xl hover:bg-hover hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-accent text-deep font-bold rounded-xl hover:bg-accent-dim shadow-[0_0_15px_rgba(0,212,170,0.2)] transition-all"
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
