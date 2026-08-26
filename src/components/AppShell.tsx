import React, { useEffect, useState } from 'react';
import { SpatialBackground } from './SpatialBackground';

interface AppShellProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  rawCount: number;
  onOpenUpload: () => void;
  onOpenDiagnostics: () => void;
  activeModule?: 'SMS_INTELLIGENCE' | 'BANK_STATEMENTS';
  onSwitchModule?: (module: 'SMS_INTELLIGENCE' | 'BANK_STATEMENTS') => void;
  currentUser?: { name: string; email: string; phone: string } | null;
  onLogout?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  isDark,
  onToggleTheme,
  rawCount,
  onOpenUpload,
  onOpenDiagnostics,
  activeModule = 'BANK_STATEMENTS',
  onSwitchModule,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
      isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
    }`}>
      {/* ── 1. AMBIENT SPATIAL ENVIRONMENTAL BACKGROUND ──────────────────── */}
      <SpatialBackground isDark={isDark} />

      {/* ── 2. TOP FLOATING SPATIAL GLASS NAVIGATION BAR ─────────────────── */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-200 border-b backdrop-blur-2xl ${
        isDark 
          ? 'bg-[#0A1016]/80 border-white/[0.08] shadow-lg shadow-black/50' 
          : 'bg-white/80 border-slate-200/85 shadow-sm shadow-slate-900/5'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition shadow-lg ${
                isDark 
                  ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/25' 
                  : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/20'
              }`}>
                BF
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A1016] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-base tracking-tight font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  BytFloww
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wider uppercase transition ${
                  isDark 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                }`}>
                  SPATIAL OS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-emerald-400 font-bold">● Real Ledger</span>
                <span className="text-slate-500 hidden sm:inline">• Zero Dummy Data</span>
              </div>
            </div>
          </div>

          {/* Desktop Module Switcher Pill */}
          {onSwitchModule && currentUser && (
            <div className={`hidden md:flex items-center p-1 rounded-2xl border backdrop-blur-xl ${
              isDark ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-100/90 border-slate-200/90'
            }`}>
              <button
                onClick={() => onSwitchModule('BANK_STATEMENTS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 ${
                  activeModule === 'BANK_STATEMENTS'
                    ? (isDark ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span>📊</span>
                <span>Bank Forensics Hub</span>
              </button>
              <button
                onClick={() => onSwitchModule('SMS_INTELLIGENCE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 ${
                  activeModule === 'SMS_INTELLIGENCE'
                    ? (isDark ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span>📱</span>
                <span>SMS Spend Simulator</span>
              </button>
            </div>
          )}

          {/* Action Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* User Session Profile Chip (Desktop) */}
            {currentUser && (
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs backdrop-blur-xl ${
                isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white/80 border-slate-200/90 shadow-sm'
              }`}>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-[10px] font-black text-emerald-400">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className={`text-[11px] font-bold leading-none truncate max-w-[110px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">
                    {currentUser.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostics Button */}
            <button
              onClick={onOpenDiagnostics}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all duration-150 active:scale-95 backdrop-blur-xl ${
                isDark 
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-200' 
                  : 'bg-white/90 hover:bg-slate-100 border-slate-200/90 text-slate-800 shadow-sm'
              }`}
              title="Session Diagnostics"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm border transition-all duration-150 active:scale-95 backdrop-blur-xl ${
                isDark 
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-amber-300' 
                  : 'bg-white/90 hover:bg-slate-100 border-slate-200/90 text-slate-800 shadow-sm'
              }`}
              title="Toggle Dark / Light Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-9 h-9 rounded-2xl flex items-center justify-center text-sm border transition ${
                isDark ? 'bg-white/[0.05] border-white/[0.08] text-white' : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-sm'
              }`}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden px-4 py-4 border-t space-y-3 animate-fade-in backdrop-blur-2xl ${
            isDark ? 'bg-[#0A1016]/95 border-white/[0.08]' : 'bg-white/95 border-slate-200/90 shadow-xl'
          }`}>
            {currentUser && (
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="text-xs font-bold">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{currentUser.phone}</div>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs text-rose-400 font-bold hover:underline"
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
                  className={`p-2.5 rounded-xl text-xs font-black text-center border ${
                    activeModule === 'BANK_STATEMENTS'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : (isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700')
                  }`}
                >
                  📊 Bank Forensics
                </button>
                <button
                  onClick={() => {
                    onSwitchModule('SMS_INTELLIGENCE');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-black text-center border ${
                    activeModule === 'SMS_INTELLIGENCE'
                      ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                      : (isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700')
                  }`}
                >
                  📱 SMS Simulator
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {children}
      </main>

      {/* Footer / Status Strip */}
      <footer className={`mt-12 py-6 border-t text-center text-xs transition-colors relative z-10 ${
        isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200/80 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-400">BytFloww Spatial Financial Operating System</span>
            <span>•</span>
            <span>v6.0 VisionOS Spatial Glass</span>
          </div>
          <div className="text-[11px] font-mono opacity-80">
            SHA-256 Ledger Integrity • Zero Dummy Data Policy
          </div>
        </div>
      </footer>
    </div>
  );
};

