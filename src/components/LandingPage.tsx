import React from 'react';
import {
  ArrowRight,
  Activity,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreConsole: () => void;
  onOpenGuide: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreConsole,
  onOpenGuide,
}) => {
  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col justify-center text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full text-center">
        {/* Simple Unboxed Subtitle */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-3">
          <span>Smart Mining & Quarry Telematics</span>
          <span aria-hidden="true">·</span>
          <span>Dumper Truck Safety</span>
        </div>

        {/* Main Brand Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50 uppercase leading-tight">
          TireGuard <span className="text-amber-400">AI</span>
        </h1>

        <p className="mt-2 text-base sm:text-lg text-slate-300 font-medium max-w-xl mx-auto">
          Smart Dumper Truck Tire & Fleet Protection
        </p>

        {/* Predict, Prevent, Action Cards (Simple Words) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* 1. Predict */}
          <div className="bg-[#101522]/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 backdrop-blur-md transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-amber-300">
              01. Predict
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              AI watches tire heat, air pressure, and tread wear 24/7. It spots leaks and overheating before a tire can burst.
            </p>
          </div>

          {/* 2. Prevent */}
          <div className="bg-[#101522]/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 backdrop-blur-md transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-cyan-300">
              02. Prevent
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Stops dangerous truck overloading and warns drivers if they move too fast down steep quarry hills.
            </p>
          </div>

          {/* 3. Action */}
          <div className="bg-[#101522]/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 backdrop-blur-md transition-all shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-amber-300">
              03. Action
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sends instant, simple alerts to the truck driver and control room with clear steps on what to do right away.
            </p>
          </div>
        </div>

        {/* Action Buttons: Register Fleet / Get Started */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Register Fleet</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onExploreConsole}
            className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/30 rounded shadow-md backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Open Live Dashboard</span>
          </button>
        </div>

        {/* Quiet Footnote Indicators */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Telematics Active
          </span>
          <span aria-hidden="true">·</span>
          <span>Express Backend + Local Database</span>
          <span aria-hidden="true">·</span>
          <button onClick={onOpenGuide} className="text-amber-400 underline hover:text-amber-300 cursor-pointer">
            How to Run Guide
          </button>
        </div>
      </div>
    </div>
  );
};
