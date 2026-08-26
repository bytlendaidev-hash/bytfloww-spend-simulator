import React, { useState } from 'react';
import { SpatialBackground } from './SpatialBackground';
import { BytLendLogo } from './BytLendLogo';

interface AppShellProps {
  children: React.ReactNode;
  rawCount?: number;
  onOpenUpload?: () => void;
  onOpenDiagnostics?: () => void;
  activeModule?: 'SMS_INTELLIGENCE' | 'BANK_STATEMENTS';
  onSwitchModule?: (module: 'SMS_INTELLIGENCE' | 'BANK_STATEMENTS') => void;
  currentUser?: { name: string; email: string; phone: string } | null;
  onLogout?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onOpenDiagnostics,
  activeModule = 'BANK_STATEMENTS',
  onSwitchModule,
  currentUser,
  onLogout,
  isDark = true,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeMode = isDark ? 'dark' : 'light';

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  const handleCycleEnvironment = () => {
    const envs = ['titanium_prism', 'bytlend_champagne', 'living_room', 'twilight_penthouse', 'cosmic_mesh'] as const;
    const cur = localStorage.getItem('bytfloww_spatial_env') || (isDark ? 'titanium_prism' : 'bytlend_champagne');
    const nextIndex = (envs.indexOf(cur as any) + 1) % envs.length;
    const nextEnv = envs[nextIndex];
    localStorage.setItem('bytfloww_spatial_env', nextEnv);
    window.dispatchEvent(new CustomEvent('spatial-env-change', { detail: nextEnv }));
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden p-0 sm:p-3 lg:p-6 flex flex-col justify-between text-abyss-textPrimary dark:text-abyss-textPrimary light:text-alabaster-textPrimary selection:bg-jade-500/30 selection:text-white">
      {/* ── 1. SOLID BACKGROUND ENVIRONMENT ─────────────────────────────── */}
      <SpatialBackground isDark={isDark} />

      {/* ── 2. SOLID WINDOW CONTAINER (Edge-to-Edge on Mobile) ─────────── */}
      <div className="w-full max-w-[1520px] mx-auto my-auto relative z-10 flex flex-col spatial-window rounded-none sm:rounded-[24px] border-x-0 sm:border min-h-screen sm:min-h-0 shadow-solid-card-dark">
        
        {/* ── WINDOW TITLEBAR & CONTROLS ───────────────────────────────── */}
        <header className="px-4 sm:px-8 py-3.5 sm:py-4 border-b border-jade-500/20 flex items-center justify-between gap-3 sticky top-0 z-40 bg-abyss-card dark:bg-abyss-card light:bg-white">
          {/* Brand Identity & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <BytLendLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight flex items-center text-abyss-textPrimary dark:text-abyss-textPrimary light:text-alabaster-textPrimary">
                  Byt<span className="text-jade-500 font-black ml-0.5">Lend</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full bg-jade-500/15 text-jade-500 border border-jade-500/35 tracking-wider uppercase">
                  SOLID SOVEREIGN OS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-abyss-textMuted">
                <span className="text-jade-500 font-semibold">● Autonomous AI Forensics</span>
                <span className="hidden sm:inline text-abyss-textMuted/70">• Sovereign Jade & Synapse Iris</span>
              </div>
            </div>
          </div>

          {/* Module Switcher Ornament (Desktop Segmented Control) */}
          {onSwitchModule && currentUser && (
            <div className="hidden md:flex items-center p-1 spatial-ornament gap-1">
              <button
                onClick={() => onSwitchModule('BANK_STATEMENTS')}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
                  activeModule === 'BANK_STATEMENTS'
                    ? 'spatial-btn-selected'
                    : 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-well'
                }`}
              >
                <span>📊</span>
                <span>Bank Forensics Hub</span>
              </button>
              <button
                onClick={() => onSwitchModule('SMS_INTELLIGENCE')}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
                  activeModule === 'SMS_INTELLIGENCE'
                    ? 'spatial-btn-selected'
                    : 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-well'
                }`}
              >
                <span>📱</span>
                <span>SMS Spend Simulator</span>
              </button>
            </div>
          )}

          {/* Action Header Controls */}
          <div className="flex items-center gap-2">
            {/* User Session Profile Chip */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-abyss-well border border-jade-500/30 text-xs">
                <div className="w-6 h-6 rounded-full bg-jade-500/20 border border-jade-500/50 flex items-center justify-center text-[10px] font-bold text-jade-500">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-semibold text-abyss-textPrimary leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-abyss-textMuted font-mono leading-none mt-0.5">
                    {currentUser.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="spatial-btn px-3.5 py-1.5 text-xs flex items-center gap-1.5 border-jade-500/30"
              title={`Switch to ${themeMode === 'dark' ? 'Light Ceramic Mode' : 'Dark Obsidian Mode'}`}
            >
              <span>{themeMode === 'dark' ? '☀️' : '🌙'}</span>
              <span className="hidden sm:inline font-semibold">{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Environment Switcher */}
            <button
              onClick={handleCycleEnvironment}
              className="hidden sm:flex spatial-btn px-3.5 py-1.5 text-xs items-center gap-1.5 border-jade-500/30"
              title="Switch Spatial Environment Space"
            >
              <span>✨</span>
              <span className="hidden md:inline">Theme Space</span>
            </button>

            {/* Diagnostics Button */}
            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="spatial-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
                title="Session Diagnostics"
              >
                <span>⚡</span>
                <span className="hidden sm:inline">Diagnostics</span>
              </button>
            )}

            {/* Mobile Profile / Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden spatial-btn w-9 h-9 flex items-center justify-center text-sm"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? '✕' : currentUser ? currentUser.name.charAt(0).toUpperCase() : '☰'}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-4 border-b border-abyss-border space-y-3 animate-fade-in bg-abyss-card">
            {currentUser && (
              <div className="p-3.5 rounded-[16px] bg-abyss-well border border-abyss-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-abyss-textPrimary">{currentUser.name}</div>
                  <div className="text-[10px] text-abyss-textMuted font-mono">{currentUser.phone}</div>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs text-pulse-500 font-semibold hover:underline px-2 py-1 bg-pulse-500/10 rounded-full border border-pulse-500/20"
                  >
                    Sign Out 🚪
                  </button>
                )}
              </div>
            )}

            {onSwitchModule && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSwitchModule('BANK_STATEMENTS');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-full text-xs font-bold text-center border ${
                    activeModule === 'BANK_STATEMENTS'
                      ? 'spatial-btn-selected'
                      : 'spatial-btn'
                  }`}
                >
                  📊 Bank Forensics
                </button>
                <button
                  onClick={() => {
                    onSwitchModule('SMS_INTELLIGENCE');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-full text-xs font-bold text-center border ${
                    activeModule === 'SMS_INTELLIGENCE'
                      ? 'spatial-btn-selected'
                      : 'spatial-btn'
                  }`}
                >
                  📱 SMS Simulator
                </button>
              </div>
            )}

            {/* Mobile Environment Selector Pill */}
            <button
              onClick={() => {
                handleCycleEnvironment();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-full spatial-btn text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>🥽</span>
              <span>Change Theme Space</span>
            </button>
          </div>
        )}

        {/* ── 3. WINDOW MAIN WORKSPACE ──────────────────────────────────── */}
        <main className="p-3 sm:p-6 lg:p-8 relative z-10 flex-1 pb-24 md:pb-8 touch-scroll">
          {children}
        </main>

        {/* ── 4. WINDOW FOOTER STATUS STRIP (DESKTOP) ───────────────────── */}
        <footer className="hidden sm:flex px-6 py-4 border-t border-abyss-border flex-col sm:flex-row items-center justify-between gap-2 text-xs text-abyss-textMuted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-jade-500 animate-pulse" />
            <span className="font-semibold text-abyss-textPrimary">BytFloww Solid Financial OS</span>
            <span>•</span>
            <span className="text-abyss-textMuted">Sovereign Jade & Synapse Iris Architecture</span>
          </div>
          <div className="text-[11px] font-mono text-abyss-textMuted">
            SHA-256 Verified Ledger • Zero Dummy Data Policy
          </div>
        </footer>

        {/* ── 5. NATIVE MOBILE STICKY BOTTOM NAVIGATION BAR ─────────────── */}
        {onSwitchModule && (
          <nav 
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 spatial-bottom-nav px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around"
            aria-label="Mobile Navigation"
          >
            <button
              onClick={() => onSwitchModule('BANK_STATEMENTS')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
                activeModule === 'BANK_STATEMENTS'
                  ? 'text-jade-500 font-bold scale-105'
                  : 'text-abyss-textMuted font-medium'
              }`}
            >
              <span className={`text-lg p-1 rounded-full ${activeModule === 'BANK_STATEMENTS' ? 'bg-jade-500/20 text-jade-500' : ''}`}>
                📊
              </span>
              <span className="text-[10px] leading-none">Forensics</span>
            </button>

            <button
              onClick={() => onSwitchModule('SMS_INTELLIGENCE')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
                activeModule === 'SMS_INTELLIGENCE'
                  ? 'text-synapse-500 font-bold scale-105'
                  : 'text-abyss-textMuted font-medium'
              }`}
            >
              <span className={`text-lg p-1 rounded-full ${activeModule === 'SMS_INTELLIGENCE' ? 'bg-synapse-500/20 text-synapse-500' : ''}`}>
                📱
              </span>
              <span className="text-[10px] leading-none">SMS Live</span>
            </button>

            <button
              onClick={handleCycleEnvironment}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-abyss-textMuted font-medium active:scale-95"
            >
              <span className="text-lg p-1 rounded-full">🥽</span>
              <span className="text-[10px] leading-none">Theme</span>
            </button>

            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-abyss-textMuted font-medium active:scale-95"
              >
                <span className="text-lg p-1 rounded-full">⚡</span>
                <span className="text-[10px] leading-none">Status</span>
              </button>
            )}
          </nav>
        )}
      </div>
    </div>
  );
};
