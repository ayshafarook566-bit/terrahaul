import React, { useState, useEffect } from 'react';
import { User } from './types.js';
import { ApiClient } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { DumperBackground } from './components/DumperBackground.js';
import { LandingPage } from './components/LandingPage.js';
import { AuthPage } from './components/AuthPage.js';
import { Dashboard } from './components/Dashboard.js';
import { RunInstructionsModal } from './components/RunInstructionsModal.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [showRunGuide, setShowRunGuide] = useState<boolean>(false);
  const [unblurBackground, setUnblurBackground] = useState<boolean>(false);

  // Check saved session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('terrahaul_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    // Fetch active alerts for badge
    ApiClient.getStats()
      .then((stats) => {
        setActiveAlertsCount(stats.activeAlertsCount);
      })
      .catch(() => {});
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('terrahaul_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('terrahaul_user');
    } catch {
      // ignore
    }
    setCurrentPage('landing');
  };

  return (
    <div className="relative min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Heavy CSS Blurred Dumper Truck Background */}
      <DumperBackground
        unblurPreview={unblurBackground}
        onTogglePreview={() => setUnblurBackground(!unblurBackground)}
      />

      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'dashboard' && !currentUser) {
            setCurrentPage('auth');
          } else {
            setCurrentPage(page);
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenGuide={() => setShowRunGuide(true)}
        activeAlertsCount={activeAlertsCount}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 relative z-10">
        {currentPage === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentPage(currentUser ? 'dashboard' : 'auth')}
            onExploreConsole={() => {
              if (currentUser) {
                setCurrentPage('dashboard');
              } else {
                // Auto sign in as demo manager for fast seamless trial
                ApiClient.login({
                  email: 'admin@terrahaul.com',
                  password: 'password123',
                })
                  .then(({ user }) => {
                    handleAuthSuccess(user);
                  })
                  .catch(() => {
                    setCurrentPage('auth');
                  });
              }
            }}
            onOpenGuide={() => setShowRunGuide(true)}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onBackToLanding={() => setCurrentPage('landing')}
          />
        )}

        {currentPage === 'dashboard' && currentUser && (
          <Dashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenGuide={() => setShowRunGuide(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#070A0F]/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">TIREGUARD AI</span>
            <span>·</span>
            <span>Smart Dumper Truck Tire & Fleet Protection</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowRunGuide(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Terminal & Mobile Guide
            </button>
            <span>·</span>
            <button
              onClick={() => setUnblurBackground(!unblurBackground)}
              className="hover:text-amber-400 transition-colors"
            >
              {unblurBackground ? 'Blur Dumper Truck' : 'Inspect Truck Graphic'}
            </button>
          </div>
        </div>
      </footer>

      {/* Local & Mobile Run Instructions Modal */}
      <RunInstructionsModal
        isOpen={showRunGuide}
        onClose={() => setShowRunGuide(false)}
      />
    </div>
  );
}
