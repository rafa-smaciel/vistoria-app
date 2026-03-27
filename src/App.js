'use client';

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import VistorIAErrorBoundary from './components/VistorIAErrorBoundary';
import VistorIARouteGuard from './components/VistorIARouteGuard';

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const CheckinFlow = React.lazy(() => import('./pages/CheckinFlow'));
const CheckoutFlow = React.lazy(() => import('./pages/CheckoutFlow'));
const InspectionResult = React.lazy(() => import('./pages/InspectionResult'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const Proposta = React.lazy(() => import('./pages/Proposta'));
const Docs = React.lazy(() => import('./pages/Docs'));

const SuspenseFallback = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#f8fafc', color: '#0EA5E9',
    fontSize: 14, fontFamily: '-apple-system, sans-serif',
  }}>
    Carregando...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VistorIAErrorBoundary>
          <React.Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/proposta" element={<Proposta />} />
              <Route path="/docs" element={<Docs />} />

              {/* Guarded — operador */}
              <Route path="/checkin" element={
                <VistorIARouteGuard>
                  <CheckinFlow />
                </VistorIARouteGuard>
              } />
              <Route path="/checkout" element={
                <VistorIARouteGuard>
                  <CheckoutFlow />
                </VistorIARouteGuard>
              } />
              <Route path="/checkout/:id" element={
                <VistorIARouteGuard>
                  <CheckoutFlow />
                </VistorIARouteGuard>
              } />
              <Route path="/resultado/:id" element={
                <VistorIARouteGuard>
                  <InspectionResult />
                </VistorIARouteGuard>
              } />

              {/* Guarded — gestor */}
              <Route path="/dashboard" element={
                <VistorIARouteGuard minRole="gestor">
                  <Dashboard />
                </VistorIARouteGuard>
              } />

              {/* Guarded — admin */}
              <Route path="/configuracoes" element={
                <VistorIARouteGuard minRole="admin">
                  <AdminSettings />
                </VistorIARouteGuard>
              } />
            </Routes>
          </React.Suspense>
        </VistorIAErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
