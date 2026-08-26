import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleHome = {
  platform_owner: '/platform',
  super_admin: '/platform',
  admin: '/admin/config',
  agent: '/inbox',
  customer: '/customer',
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#030712' }}>
        <div className="flex flex-col items-center gap-4 rounded-2xl p-8" style={{ background: 'rgba(10,15,26,0.8)', border: '1px solid rgba(148,163,184,0.08)' }}>
          <div className="h-8 w-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#7c3aed', borderRightColor: '#6366f1' }} />
          <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requiredRole) return children;

  const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const isAdminRole = ['platform_owner', 'super_admin'].includes(profile.role);
  const canAccess = isAdminRole && !allowed.includes('customer');

  if (!allowed.includes(profile.role) && !canAccess) {
    return <Navigate to={roleHome[profile.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
