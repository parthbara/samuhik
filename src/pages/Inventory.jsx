import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ALL_TENANTS } from '../lib/mockData';
import { Package, Search, AlertTriangle, ArrowDownToLine } from 'lucide-react';

const Inventory = () => {
  const { inventory } = useData();
  const { profile } = useAuth();
  const [tenantFilter, setTenantFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const tenants = profile?.role === 'super_admin' ? ALL_TENANTS : [];
  
  const visibleInventory = inventory.filter((item) => {
    // Tenant filter
    if (tenantFilter !== 'all' && (item.tenant_id || item.tenantId) !== tenantFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.item.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Inventory <span className="text-accent">&</span> Stock</h2>
          <p className="text-secondary text-sm mt-1 font-medium">Real-time stock levels and pricing from your POS.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {tenants.length > 0 && (
            <select
              value={tenantFilter}
              onChange={(event) => setTenantFilter(event.target.value)}
              className="bg-surface border border-subtle text-primary px-4 py-2 rounded-xl font-semibold text-sm outline-none focus-ring transition-all"
            >
              <option value="all">All tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface border border-subtle rounded-xl text-sm outline-none focus-ring transition-all text-primary placeholder:text-muted min-w-[240px]" 
              placeholder="Search SKU or name..." 
            />
          </div>
          <button className="flex items-center gap-2 bg-elevated border border-subtle text-primary px-4 py-2 rounded-xl font-semibold text-sm hover:bg-hover transition-all group">
            <ArrowDownToLine className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl shadow-lg stat-card">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Total SKUs</p>
          <p className="text-4xl font-black text-primary">{visibleInventory.length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-lg stat-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warm rounded-full mix-blend-screen filter blur-[64px] opacity-10"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Low Stock Items</p>
          <p className="text-4xl font-black text-warm">{visibleInventory.filter(i => i.stock <= 15 && i.stock > 0).length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-lg stat-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-full mix-blend-screen filter blur-[64px] opacity-10"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Out of Stock</p>
          <p className="text-4xl font-black text-rose-400">{visibleInventory.filter(i => i.stock === 0).length}</p>
        </div>
      </div>

      <div className="relative z-10 glass-card rounded-2xl shadow-2xl overflow-hidden border border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/50 border-b border-subtle">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">SKU</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">Product Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">Price</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">Stock Level</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {visibleInventory.length > 0 && visibleInventory.map((item) => {
                const isOutOfStock = item.stock === 0;
                const isLowStock = item.stock > 0 && item.stock <= 15;
                const isGoodStock = item.stock > 15;

                return (
                  <tr key={item.id} className="hover:bg-hover/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-secondary">{item.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-primary">{item.item}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">
                      Rs. {item.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px] h-1.5 bg-surface border border-subtle rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full shadow-[0_0_8px_currentColor] ${
                              isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-warm' : 'bg-accent'
                            }`}
                            style={{ width: `${Math.min(100, (item.stock / 100) * 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-warm' : 'text-primary'}`}>
                          {item.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isOutOfStock 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : isLowStock 
                            ? 'bg-warm/10 text-warm border-warm/20' 
                            : 'bg-accent/10 text-accent border-accent/20'
                      }`}>
                        {isOutOfStock || isLowStock ? <AlertTriangle className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {visibleInventory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center bg-surface/30">
                    <Package className="mx-auto mb-3 h-12 w-12 text-muted opacity-50" />
                    <p className="text-sm font-semibold text-secondary">No inventory matches your filters.</p>
                    {inventory.length === 0 && (
                      <p className="mt-1 text-sm text-muted">Connect PasalOS or a custom POS webhook from Settings to pull stock data.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
