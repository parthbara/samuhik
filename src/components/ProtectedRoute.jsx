import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin can access everything
  if (profile.role === 'super_admin') {
    return children;
  }

  if (requiredRole && profile.role !== requiredRole) {
    // If agent tries to access admin, redirect to inbox
    if (profile.role === 'agent' && (requiredRole === 'admin' || requiredRole === 'super_admin')) {
      return <Navigate to="/inbox" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
