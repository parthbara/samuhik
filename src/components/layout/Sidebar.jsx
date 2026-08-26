import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
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
  Store,
  ChevronDown
} from 'lucide-react';

const navItems = [
  { to: '/platform', icon: LayoutDashboard, label: 'Command Center', superOnly: true },
  { to: '/inbox', icon: Inbox, label: 'Global Inbox' },
  { to: '/simulate', icon: Bot, label: 'Simulate', tenantOnly: true },
  { to: '/inventory', icon: Shield, label: 'Inventory', adminOnly: true },
  { to: '/admin/orders', icon: FileSpreadsheet, label: 'Orders', adminOnly: true },
  { to: '/admin/config', icon: Settings, label: 'Config', adminOnly: true },
  { to: '/admin/users', icon: Users, label: 'Team', adminOnly: true },
];

const Sidebar = ({ onNavigate }) => {
  const { profile, logout } = useAuth();
  const { vendors, selectedVendorId, setSelectedVendorId } = useData();
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');
  
  const isHigherAdmin = ['platform_owner', 'super_admin'].includes(profile?.role);

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  if (!profile) return null;

  return (
    <aside className="flex h-full w-[220px] flex-col sidebar-root">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Logo className="scale-75 origin-left" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-8">
        {navItems.map((item) => {
          const isHigherAdmin = ['platform_owner', 'super_admin'].includes(profile.role);
          const isAnyAdmin = isHigherAdmin || profile.role === 'admin';

          if (item.superOnly && !isHigherAdmin) return null;
          if (item.adminOnly && !isAnyAdmin) return null;
          if (item.tenantOnly && !profile?.tenant_id) return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'sidebar-nav-active'
                    : 'sidebar-nav-item'
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 sidebar-footer">
        <div className="mb-6 rounded p-3 sidebar-user-card">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded sidebar-avatar text-[10px] font-bold">
              {profile.name?.charAt(0) || profile.email.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold sidebar-user-name uppercase tracking-tight">{profile.name || 'User'}</p>
              <p className="truncate text-[9px] sidebar-user-role uppercase tracking-widest">{profile.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsLight(!isLight)}
            className="flex w-full items-center justify-between rounded px-3 py-2 text-[9px] font-bold uppercase tracking-widest sidebar-action transition-colors"
          >
            <span className="flex items-center gap-2">
              {isLight ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              Theme
            </span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-[9px] font-bold uppercase tracking-widest sidebar-logout transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
