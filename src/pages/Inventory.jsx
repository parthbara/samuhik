import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ALL_TENANTS } from '../lib/mockData';
import { Package, Search, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const { inventory } = useData();
  const { profile } = useAuth();
  const [tenantFilter, setTenantFilter] = React.useState('all');
  const tenants = profile?.role === 'super_admin' ? ALL_TENANTS : [];
  const visibleInventory = inventory.filter((item) => {
    if (tenantFilter === 'all') return true;
    return (item.tenant_id || item.tenantId) === tenantFilter;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory & Stock</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time stock levels and pricing from your POS.</p>
        </div>
        <div className="flex gap-3">
          {tenants.length > 0 && (
            <select
              value={tenantFilter}
              onChange={(event) => setTenantFilter(event.target.value)}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
              placeholder="Search SKU or name..." 
            />
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-all">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total SKUs</p>
          <p className="text-3xl font-bold text-slate-900">{visibleInventory.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Low Stock Items</p>
          <p className="text-3xl font-bold text-amber-600">{visibleInventory.filter(i => i.stock <= 15).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-rose-600">{visibleInventory.filter(i => i.stock === 0).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">SKU</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Product Name</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Price</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Stock Level</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleInventory.length > 0 && visibleInventory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.id}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{item.item}</p>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  Rs. {item.price.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.stock <= 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (item.stock / 100) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600">{item.stock}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.stock <= 15 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {item.stock <= 15 ? <AlertTriangle className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                    {item.stock <= 15 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
            {visibleInventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No inventory synced yet.</p>
                  <p className="mt-1 text-sm text-slate-400">Connect PasalOS or a custom POS webhook from Settings to pull stock data.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
