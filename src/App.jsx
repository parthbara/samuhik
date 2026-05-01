import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Inbox from './pages/Inbox';
import Inventory from './pages/Inventory';
import AdminConfig from './pages/AdminConfig';
import UserManagement from './pages/UserManagement';
import VendorDashboard from './pages/vendor/VendorDashboard';
import Orders from './pages/Orders';

const RootRedirect = () => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;
  
  if (profile.role === 'super_admin') return <Navigate to="/vendor" replace />;
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
              
              <Route element={
                <ProtectedRoute>
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

                {/* Vendor Routes */}
                <Route path="/vendor" element={
                  <ProtectedRoute requiredRole="super_admin">
                    <VendorDashboard />
                  </ProtectedRoute>
                } />

              </Route>

              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
