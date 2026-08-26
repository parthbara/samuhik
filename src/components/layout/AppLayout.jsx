import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import Logo from '../Logo';

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-deep font-sans antialiased">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 flex items-center px-6 z-40 bg-surface/80 backdrop-blur-md border-b border-subtle">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-md hover:bg-hover transition-all text-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="ml-4 flex items-center">
          <Logo className="scale-75 origin-left" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-0 left-0 bottom-0 w-72 shadow-2xl bg-surface border-r border-subtle transition-transform"
            style={{ animation: 'slide-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-subtle">
                <div className="flex items-center">
                  <Logo className="scale-75 origin-left" />
                </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md bg-elevated text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0 h-full border-r border-subtle">
        <Sidebar />
      </div>

      <main className="min-h-0 flex-1 flex flex-col min-w-0 md:mt-0 mt-16 bg-deep overflow-y-auto">
        <Outlet />
      </main>
      
      {/* CSS for slide right animation specific to mobile menu */}
      <style>{`
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
