import React, { useState, useEffect } from 'react';
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
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = ({ onNavigate }) => {
  const { profile, logout } = useAuth();
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

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
    <div className="w-64 bg-elevated text-secondary flex flex-col h-full border-r border-subtle">
      <div className="p-6 flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-accent filter blur opacity-50"></div>
          <div className="relative bg-surface p-2 rounded-lg border border-subtle">
            <Bot className="w-6 h-6 text-accent" />
          </div>
        </div>
        <span className="text-xl font-extrabold text-primary tracking-tight">Samuhik</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.superOnly && profile.role !== 'super_admin') return null;
          if (item.adminOnly && profile.role !== 'admin' && profile.role !== 'super_admin') return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                    : 'hover:bg-hover hover:text-primary border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-subtle bg-surface/50">
        <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-hover border border-subtle">
          <div className="w-8 h-8 rounded-lg bg-surface border border-subtle flex items-center justify-center text-xs font-bold text-primary uppercase shadow-[0_0_10px_rgba(0,212,170,0.1)]">
            {profile.name?.charAt(0) || profile.email.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{profile.name || 'User'}</p>
            <p className="text-xs text-muted truncate capitalize">{profile.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={() => setIsLight(!isLight)}
          className="flex items-center justify-between w-full px-3 py-2.5 mb-2 rounded-xl text-secondary hover:bg-hover hover:text-primary transition-all font-medium text-sm"
        >
          <span className="flex items-center gap-3">
            {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isLight ? 'Light Mode' : 'Dark Mode'}
          </span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${isLight ? 'bg-accent/20 border border-accent/30' : 'bg-surface border border-subtle'}`}>
            <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] rounded-full transition-transform ${isLight ? 'translate-x-4 bg-accent' : 'bg-secondary'}`} />
          </div>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-transparent transition-all font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
