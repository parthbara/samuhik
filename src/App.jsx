import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Inbox from './pages/Inbox';
import Inventory from './pages/Inventory';
import AdminConfig from './pages/AdminConfig';
import UserManagement from './pages/UserManagement';
import PlatformDashboard from './pages/platform/PlatformDashboard';
import Orders from './pages/Orders';
import CustomerSimulator from './pages/CustomerSimulator';

const RootRedirect = () => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;
  
  if (['platform_owner', 'super_admin'].includes(profile.role)) return <Navigate to="/platform" replace />;
  if (profile.role === 'customer') return <Navigate to="/customer" replace />;
  if (profile.role === 'admin') return <Navigate to="/admin/config" replace />;
  return <Navigate to="/inbox" replace />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/demo" element={<CustomerSimulator />} />
              <Route path="/simulate" element={
                <ProtectedRoute requiredRole={['admin', 'agent', 'super_admin', 'platform_owner']}>
                  <CustomerSimulator />
                </ProtectedRoute>
              } />
              <Route path="/customer" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerSimulator />
                </ProtectedRoute>
              } />
              
              <Route element={
                <ProtectedRoute requiredRole={['super_admin', 'admin', 'agent']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/inventory" element={
                  <ProtectedRoute requiredRole="admin">
                    <Inventory />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin">
                  <Route path="config" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminConfig />
                    </ProtectedRoute>
                  } />
                  <Route path="users" element={
                    <ProtectedRoute requiredRole="admin">
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute requiredRole="admin">
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route index element={<Navigate to="config" replace />} />
                </Route>

                {/* Platform Routes */}
                <Route path="/platform" element={
                  <ProtectedRoute requiredRole={['platform_owner', 'super_admin']}>
                    <PlatformDashboard />
                  </ProtectedRoute>
                } />

              </Route>

              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
