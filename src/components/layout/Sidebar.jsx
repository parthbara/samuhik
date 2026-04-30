import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Inbox,
  Settings,
  Users,
  LogOut,
  Bot,
  Shield,
  LayoutDashboard,
  FileSpreadsheet,
} from 'lucide-react';

const Sidebar = () => {
  const { profile, logout } = useAuth();

  const navItems = [
    { to: '/vendor', icon: LayoutDashboard, label: 'Platform', superOnly: true },
    { to: '/inbox', icon: Inbox, label: 'Inbox' },
    { to: '/inventory', icon: Shield, label: 'Inventory', adminOnly: true },
    { to: '/admin/orders', icon: FileSpreadsheet, label: 'Orders', adminOnly: true },
    { to: '/admin/config', icon: Settings, label: 'Settings', adminOnly: true },
    { to: '/admin/users', icon: Users, label: 'Team', adminOnly: true },
  ];

  if (!profile) return null;

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Samuhik</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.superOnly && profile.role !== 'super_admin') return null;
          if (item.adminOnly && profile.role !== 'admin' && profile.role !== 'super_admin') return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 font-medium'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
            {profile.name?.charAt(0) || profile.email.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{profile.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
