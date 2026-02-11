import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
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

// Admin pages
const AdminLogin = React.lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminVerify = React.lazy(() => import('./pages/AdminVerify').then(m => ({ default: m.AdminVerify })));
const AdminWizard = React.lazy(() => import('./pages/AdminWizard').then(m => ({ default: m.AdminWizard })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts').then(m => ({ default: m.AdminProducts })));

// --- Layout Components ---

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-chamber-navy rounded-sm flex items-center justify-center">
                <span className="text-chamber-gold font-serif font-bold text-lg">L</span>
              </div>
              <span className="font-serif font-bold text-xl text-chamber-navy tracking-tight">
                localchambers<span className="text-chamber-gold">.ai</span>
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-sm font-medium text-slate-500 hover:text-chamber-navy transition-colors">Find a Chamber</Link>
            <Link to="/agents" className="text-sm font-medium text-slate-500 hover:text-chamber-navy transition-colors">For AI Agents</Link>
            <Link to="/admin" className="text-sm font-bold text-chamber-gold hover:text-chamber-navy transition-colors">Chamber Portal</Link>
            <div className="h-6 w-px bg-slate-300"></div>
            <Link to="/login" className="text-sm font-medium text-chamber-navy hover:text-chamber-gold transition-colors">Log in</Link>
            <Link to="/get-started" className="bg-chamber-navy text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-indigo-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-chamber-light border-t border-slate-200 mt-auto">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <p className="text-center text-slate-400 text-sm mb-4 font-serif">
        &copy; 2026 localchambers.ai. Connecting Business to Community.
      </p>
      <div className="flex gap-6">
        <Link to="/agents" className="text-xs text-slate-400 hover:text-chamber-gold uppercase tracking-wider font-semibold transition-colors">
          AI Agent Index
        </Link>
        <Link to="/admin" className="text-xs text-slate-400 hover:text-chamber-gold uppercase tracking-wider font-semibold transition-colors">
          Claim Listing
        </Link>
      </div>
    </div>
  </footer>
);

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

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-chamber-light font-sans text-slate-800">
          <Routes>
            {/* Main App Layout */}
            <Route path="*" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Suspense fallback={<DirectoryFallback />}><SearchResults /></Suspense>} />
                    <Route path="/chamber/:id" element={<Suspense fallback={<ProfileFallback />}><ChamberProfile /></Suspense>} />
                    <Route path="/checkout" element={<Suspense fallback={<DirectoryFallback />}><Checkout /></Suspense>} />
                    <Route path="/get-started" element={<Suspense fallback={<DirectoryFallback />}><GetStarted /></Suspense>} />
                    <Route path="/agents" element={<Suspense fallback={<DirectoryFallback />}><AgentIndex /></Suspense>} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
            
            {/* Auth & Admin Layouts (No standard Navbar/Footer) */}
            <Route path="/login" element={<Suspense fallback={<AuthFallback />}><Login /></Suspense>} />
            <Route path="/signup" element={<Suspense fallback={<AuthFallback />}><SignUp /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<AuthFallback />}><AdminLogin /></Suspense>} />
            <Route path="/admin/verify" element={<Suspense fallback={<AuthFallback />}><AdminVerify /></Suspense>} />
            <Route path="/admin/wizard" element={<Suspense fallback={<AdminFallback />}><AdminWizard /></Suspense>} />
            <Route path="/admin/dashboard" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
            <Route path="/admin/products" element={<Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense>} />
          </Routes>
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
}