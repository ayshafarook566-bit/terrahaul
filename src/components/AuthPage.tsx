import React, { useState } from 'react';
import { User, UserRole } from '../types.js';
import { ApiClient } from '../services/api.js';
import { Truck, ShieldCheck, UserCheck, KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onBackToLanding: () => void;
}

const ROLES: UserRole[] = [
  'Fleet Operations Manager',
  'Pit Dispatch Controller',
  'Haul Truck Operator',
  'Mine Safety Officer',
  'Equipment Superintendent',
];

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBackToLanding }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Fleet Operations Manager');
  const [siteId, setSiteId] = useState<string>('Apex Pit Alpha');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter your email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long');

        const { user } = await ApiClient.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          siteId,
        });
        onAuthSuccess(user);
      } else {
        if (!email.trim() || !password) throw new Error('Please enter both email and password');
        const { user } = await ApiClient.login({
          email: email.trim(),
          password,
        });
        onAuthSuccess(user);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (presetEmail: string, presetPass: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { user } = await ApiClient.login({
        email: presetEmail,
        password: presetPass,
      });
      onAuthSuccess(user);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#101522]/95 border border-amber-500/30 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-3 shadow-inner">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {isRegisterMode ? 'Register Mining Operator' : 'TireGuard AI Access'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegisterMode
              ? 'Create your personnel account with pit role authorization'
              : 'Enter your credentials to manage haul fleet and dispatch'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              !isRegisterMode ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              isRegisterMode ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@terrahaul.com"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operational Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-slate-100">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mine / Quarry Site Location
                </label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Apex Pit Alpha">Apex Pit Alpha (Copper & Gold)</option>
                  <option value="Northern Ridge Quarry">Northern Ridge Quarry (Iron Ore)</option>
                  <option value="Granite Basin Pit 04">Granite Basin Pit 04 (Aggregate)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>{isRegisterMode ? 'Complete Registration' : 'Authorize & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick 1-Click Demo Credentials
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@terrahaul.com', 'password123')}
              disabled={loading}
              className="p-2 text-left bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded transition-all cursor-pointer"
            >
              <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Chief Dispatcher</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin@terrahaul.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('dispatch@terrahaul.com', 'dispatch123')}
              disabled={loading}
              className="p-2 text-left bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded transition-all cursor-pointer"
            >
              <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pit Dispatcher</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">dispatch@terrahaul.com</div>
            </button>
          </div>
        </div>

        {/* Back to landing */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            ← Return to System Overview
          </button>
        </div>
      </div>
    </div>
  );
};
