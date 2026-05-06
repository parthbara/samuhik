import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart3,
  Bot,
  FileSpreadsheet,
  Inbox,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Shield,
  Sun,
  Users,
  Wand2,
} from 'lucide-react';

const navItems = [
  { to: '/vendor', icon: LayoutDashboard, label: 'Platform', superOnly: true },
  { to: '/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/inventory', icon: Shield, label: 'Inventory', adminOnly: true },
  { to: '/admin/orders', icon: FileSpreadsheet, label: 'Orders', adminOnly: true },
  { to: '/admin/config', icon: Settings, label: 'Settings', adminOnly: true },
  { to: '/admin/users', icon: Users, label: 'Team', adminOnly: true },
];

const Sidebar = ({ onNavigate }) => {
  const { profile, logout } = useAuth();
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  if (!profile) return null;

  return (
    <aside className="flex h-full w-[184px] flex-col border-r border-subtle bg-surface text-secondary">
      <div className="border-b border-subtle px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-primary">Samuhik</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Ops Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          if (item.superOnly && profile.role !== 'super_admin') return null;
          if (item.adminOnly && profile.role !== 'admin' && profile.role !== 'super_admin') return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-transparent text-secondary hover:border-medium hover:bg-hover hover:text-primary'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-subtle px-3 py-3">
        <div className="mb-3 rounded-lg border border-subtle bg-elevated p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-800">
              {profile.name?.charAt(0) || profile.email.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-primary">{profile.name || 'User'}</p>
              <p className="truncate text-[10px] font-semibold uppercase text-muted">{profile.role.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold text-muted">
            <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Live</span>
            <span className="flex items-center gap-1"><Wand2 className="h-3 w-3" /> Demo</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLight(!isLight)}
          className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-secondary hover:bg-hover hover:text-primary"
        >
          <span className="flex items-center gap-2">
            {isLight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Theme
          </span>
          <span className="text-[10px] uppercase">{isLight ? 'Light' : 'Dark'}</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-hover hover:text-primary"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
