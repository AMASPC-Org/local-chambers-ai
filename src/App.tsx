import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Skeleton } from './components/Skeleton';

// --- Lazy-loaded routes (code-split into separate chunks) ---

// Public pages
const SearchResults = React.lazy(() => import('./pages/SearchResults').then(m => ({ default: m.SearchResults })));
const ChamberProfile = React.lazy(() => import('./pages/ChamberProfile').then(m => ({ default: m.ChamberProfile })));
const GetStarted = React.lazy(() => import('./pages/GetStarted').then(m => ({ default: m.GetStarted })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const AgentIndex = React.lazy(() => import('./pages/AgentIndex').then(m => ({ default: m.AgentIndex })));

// Auth pages
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const SignUp = React.lazy(() => import('./pages/SignUp').then(m => ({ default: m.SignUp })));
// New Onboarding Flow
const Onboarding = React.lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));

// Admin pages
const AdminLogin = React.lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminVerify = React.lazy(() => import('./pages/AdminVerify').then(m => ({ default: m.AdminVerify })));
const AdminWizard = React.lazy(() => import('./pages/AdminWizard').then(m => ({ default: m.AdminWizard })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts').then(m => ({ default: m.AdminProducts })));

// --- Suspense Wrappers ---

/** Card grid fallback for search/directory pages */
const DirectoryFallback = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <Skeleton.CardGrid count={6} />
  </div>
);

/** Profile page fallback */
const ProfileFallback = () => <Skeleton.ProfilePage />;

/** Admin page fallback */
const AdminFallback = () => <Skeleton.AdminPage />;

/** Auth form fallback */
const AuthFallback = () => <Skeleton.AuthForm />;

// --- App ---

import { APIProvider } from '@vis.gl/react-google-maps';

export default function App() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <ErrorBoundary>
      <APIProvider apiKey={googleMapsApiKey}>
        <HashRouter>
          <Layout>
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-chamber-gold border-t-transparent rounded-full animate-spin"></div></div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Suspense fallback={<DirectoryFallback />}><SearchResults /></Suspense>} />
                <Route path="/chamber/:id" element={<Suspense fallback={<ProfileFallback />}><ChamberProfile /></Suspense>} />
                <Route path="/checkout" element={<Suspense fallback={<DirectoryFallback />}><Checkout /></Suspense>} />
                <Route path="/get-started" element={<Suspense fallback={<DirectoryFallback />}><GetStarted /></Suspense>} />
                <Route path="/agents" element={<Suspense fallback={<DirectoryFallback />}><AgentIndex /></Suspense>} />

                {/* Auth Routes */}
                <Route path="/login" element={<Suspense fallback={<AuthFallback />}><Login /></Suspense>} />
                <Route path="/signup" element={<Suspense fallback={<AuthFallback />}><SignUp /></Suspense>} />
                <Route path="/onboarding/*" element={<Suspense fallback={<AuthFallback />}><Onboarding /></Suspense>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Suspense fallback={<AuthFallback />}><AdminLogin /></Suspense>} />
                <Route path="/admin/verify" element={<Suspense fallback={<AuthFallback />}><AdminVerify /></Suspense>} />
                <Route path="/admin/wizard" element={<Suspense fallback={<AdminFallback />}><AdminWizard /></Suspense>} />
                <Route path="/admin/dashboard" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
                <Route path="/admin/products" element={<Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense>} />
              </Routes>
            </Suspense>
          </Layout>
        </HashRouter>
      </APIProvider>
    </ErrorBoundary>
  );
}
