import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { Marketplace } from './pages/Marketplace';
import { LiveTrackerPage } from './pages/LiveTrackerPage';
import { ProviderRequestsPage } from './pages/ProviderRequestsPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route wrapper component
const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-800">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold">Loading AgriRenta...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Standalone Separate Admin Portal Section */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Protected Main Seeker & Provider Shell Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Marketplace Routes */}
            <Route path="rentals" element={<Marketplace />} />
            <Route path="marketplace" element={<Marketplace />} />

            {/* Live Geo Map Tracking Route */}
            <Route path="tracking" element={<LiveTrackerPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />

            {/* Provider Routes */}
            <Route
              path="provider/dashboard"
              element={
                <ProtectedRoute roleRequired="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="provider/add-equipment"
              element={
                <ProtectedRoute roleRequired="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="provider/requests"
              element={
                <ProtectedRoute roleRequired="provider">
                  <ProviderRequestsPage />
                </ProtectedRoute>
              }
            />

          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
