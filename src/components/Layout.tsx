import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Settings, ChevronDown, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const UserMenu: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center gap-6">
        <Link to="/login" className="text-sm font-medium text-chamber-navy hover:text-chamber-gold transition-colors">Log in</Link>
        <Link to="/onboarding" className="bg-chamber-navy text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
          Get Started
        </Link>
      </div>
    );
  }

  const userName = user.displayName || user.email?.split('@')[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group"
      >
        <div className="w-8 h-8 rounded-full bg-chamber-navy flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:bg-chamber-gold transition-colors">
          {userName?.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none gap-0.5" title={`${userName}${isAdmin ? ' (Admin)' : ''}`}>
          <span className="text-sm font-bold text-chamber-navy max-w-[100px] truncate">{userName}</span>
          {isAdmin && <span className="text-[9px] text-chamber-gold font-extrabold uppercase tracking-tighter">Admin</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Account</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-chamber-gold hover:bg-amber-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Chamber Portal
            </Link>

            <div className="h-px bg-slate-50 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/search" className="text-sm font-medium text-slate-600 hover:text-chamber-navy transition-colors relative group">
              Find a Chamber
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-chamber-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/agents" className="text-sm font-medium text-slate-600 hover:text-chamber-navy transition-colors relative group">
              For AI Agents
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-chamber-gold transition-all group-hover:w-full"></span>
            </Link>

            <div className="h-6 w-px bg-slate-200"></div>

            <UserMenu />
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
