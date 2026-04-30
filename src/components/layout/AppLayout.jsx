import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="flex h-dvh min-h-0 bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
