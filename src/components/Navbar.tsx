import React from 'react';
import { User } from '../types.js';
import { Truck, LogOut, BookOpen, AlertCircle } from 'lucide-react';

interface NavbarProps {
  currentPage: 'landing' | 'auth' | 'dashboard';
  onNavigate: (page: 'landing' | 'auth' | 'dashboard') => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenGuide: () => void;
  activeAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  onOpenGuide,
  activeAlertsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#0B0E14]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-950/40 border border-amber-400/30 group-hover:from-amber-400 group-hover:to-amber-600 transition-all">
              <Truck className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors">
                TIREGUARD <span className="text-amber-400">AI</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-amber-400 ${
              currentPage === 'landing' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            System Demo
          </button>
          <button
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'auth')}
            className={`transition-colors hover:text-amber-400 ${
              currentPage === 'dashboard' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Fleet Dashboard
          </button>
          <button
            onClick={onOpenGuide}
            className="transition-colors hover:text-amber-400 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Run Guide</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {activeAlertsCount > 0 && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded transition-colors"
                  title={`${activeAlertsCount} active safety alerts`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{activeAlertsCount} Alerts</span>
                </button>
              )}

              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-amber-400/90 font-mono">
                  {currentUser.role.split(' ')[0]}
                </p>
              </div>

              {currentPage !== 'dashboard' && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-sm transition-colors whitespace-nowrap"
                >
                  Console
                </button>
              )}

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded border border-slate-700/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('auth')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 rounded border border-slate-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-md shadow-amber-950/30 transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
