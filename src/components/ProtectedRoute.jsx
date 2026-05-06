import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleHome = {
  super_admin: '/vendor',
  admin: '/admin/config',
  agent: '/inbox',
  customer: '/customer',
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-deep">
        <div className="rounded-lg border border-subtle bg-surface px-4 py-3 text-sm font-semibold text-secondary">
          Authenticating...
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requiredRole) return children;

  const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const canAccess = profile.role === 'super_admin' && !allowed.includes('customer');

  if (!allowed.includes(profile.role) && !canAccess) {
    return <Navigate to={roleHome[profile.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
