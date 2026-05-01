import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 bg-deep overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-elevated border-b border-subtle flex items-center px-4 z-40">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-primary hover:bg-hover rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="ml-2 font-bold text-primary tracking-tight">Samuhik AI</span>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-deep/80 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-0 left-0 bottom-0 w-64 bg-elevated shadow-2xl animate-slide-up sm:animate-none"
            onClick={e => e.stopPropagation()}
            style={{ animationName: 'slide-right' }}
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-secondary hover:text-primary bg-hover rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="min-h-0 flex-1 flex flex-col min-w-0 overflow-y-auto md:mt-0 mt-14">
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
