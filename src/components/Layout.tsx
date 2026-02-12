import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Avatar from './Avatar';

interface LayoutProps {
  children: React.ReactNode;
}

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-chamber-navy rounded-lg flex items-center justify-center shadow-lg group-hover:bg-chamber-gold transition-colors duration-300">
                <span className="text-white font-serif font-bold text-xl">L</span>
              </div>
              <span className="font-serif font-bold text-2xl text-chamber-navy tracking-tight transform group-hover:translate-x-1 transition-transform duration-300">
                localchambers<span className="text-chamber-gold">.ai</span>
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-sm font-medium text-slate-600 hover:text-chamber-navy transition-colors relative group">
              Find a Chamber
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-chamber-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/agents" className="text-sm font-medium text-slate-600 hover:text-chamber-navy transition-colors relative group">
              For AI Agents
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-chamber-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/admin" className="text-sm font-bold text-chamber-gold hover:text-chamber-navy transition-colors">Chamber Portal</Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <Link to="/login" className="text-sm font-medium text-chamber-navy hover:text-chamber-gold transition-colors">Log in</Link>
            <Link to="/onboarding" className="bg-chamber-navy text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-chamber-light border-t border-slate-200 mt-auto pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="mb-8">
        <span className="text-chamber-navy font-serif font-bold text-2xl opacity-50">localchambers.ai</span>
      </div>
      <p className="text-center text-slate-400 text-sm mb-8 font-medium max-w-md">
        Connecting local businesses with the trusted networks that power community growth.
      </p>
      <div className="flex gap-8 mb-8">
        <Link to="/agents" className="text-xs text-slate-500 hover:text-chamber-gold uppercase tracking-wider font-bold transition-colors">
          AI Agent Access
        </Link>
        <Link to="/admin" className="text-xs text-slate-500 hover:text-chamber-gold uppercase tracking-wider font-bold transition-colors">
          Chamber Admin
        </Link>
        <a href="#" className="text-xs text-slate-500 hover:text-chamber-gold uppercase tracking-wider font-bold transition-colors">
          Privacy Policy
        </a>
      </div>
      <p className="text-center text-slate-300 text-xs">
        &copy; {new Date().getFullYear()} localchambers.ai
      </p>
    </div>
  </footer>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/onboarding'].some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col bg-chamber-light font-sans text-slate-800 selection:bg-chamber-gold/20 selection:text-chamber-navy">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-chamber-navy text-white px-4 py-2 rounded-md z-50 font-bold shadow-lg">
        Skip to main content
      </a>
      {!isAuthPage && <Navbar />}

      <main id="main-content" className="flex-grow relative">
        {children}
      </main>

      {!isAuthPage && <Footer />}

      {/* Global AI Avatar - Always present but context-aware */}
      <Avatar
        isVisible={true}
        initialMessage="Welcome to localchambers.ai. I'm your guide to finding the perfect business network."
      />
    </div>
  );
};
