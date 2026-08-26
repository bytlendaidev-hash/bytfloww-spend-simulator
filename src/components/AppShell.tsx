import React, { useState } from 'react';
import { SpatialBackground } from './SpatialBackground';

interface AppShellProps {
  children: React.ReactNode;
  rawCount?: number;
  onOpenUpload?: () => void;
  onOpenDiagnostics?: () => void;
  activeModule?: 'SMS_INTELLIGENCE' | 'BANK_STATEMENTS';
  onSwitchModule?: (module: 'SMS_INTELLIGENCE' | 'BANK_STATEMENTS') => void;
  currentUser?: { name: string; email: string; phone: string } | null;
  onLogout?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onOpenDiagnostics,
  activeModule = 'BANK_STATEMENTS',
  onSwitchModule,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCycleEnvironment = () => {
    const envs = ['living_room', 'twilight_penthouse', 'cosmic_mesh'] as const;
    const cur = localStorage.getItem('bytfloww_spatial_env') || 'living_room';
    const nextIndex = (envs.indexOf(cur as any) + 1) % envs.length;
    const nextEnv = envs[nextIndex];
    localStorage.setItem('bytfloww_spatial_env', nextEnv);
    window.dispatchEvent(new CustomEvent('spatial-env-change', { detail: nextEnv }));
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden p-0 sm:p-3 lg:p-6 flex flex-col justify-between text-white selection:bg-[#0A84FF]/30 selection:text-white">
      {/* ── 1. IMMERSIVE SPATIAL COSMIC ENVIRONMENT ─────────────────────── */}
      <SpatialBackground />

      {/* ── 2. VISIONOS FLOATING SPATIAL GLASS WINDOW (Edge-to-Edge on Mobile) ───── */}
      <div className="w-full max-w-[1520px] mx-auto my-auto relative z-10 flex flex-col spatial-window rounded-none sm:rounded-[24px] border-x-0 sm:border min-h-screen sm:min-h-0 shadow-2xl">
        
        {/* ── WINDOW TITLEBAR & CONTROLS ───────────────────────────────── */}
        <header className="px-4 sm:px-8 py-3.5 sm:py-4 border-b border-white/15 flex items-center justify-between gap-3 sticky top-0 z-40 bg-[#0c1017]/80 backdrop-blur-2xl sm:bg-transparent sm:backdrop-blur-none">
          {/* Brand Identity & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] bg-gradient-to-br from-[#0A84FF] to-[#6366F1] flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-[0_4px_16px_rgba(10,132,255,0.4)]">
                BF
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#30D158] border-2 border-[#070B0E] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  BytFloww
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 tracking-wider uppercase">
                  VISIONOS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/60">
                <span className="text-[#30D158] font-semibold">● Verified Ledger</span>
                <span className="hidden sm:inline text-white/40">• Spatial Computing</span>
              </div>
            </div>
          </div>

          {/* Module Switcher Ornament (Desktop Segmented Control) */}
          {onSwitchModule && currentUser && (
            <div className="hidden md:flex items-center p-1 spatial-ornament gap-1">
              <button
                onClick={() => onSwitchModule('BANK_STATEMENTS')}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 ${
                  activeModule === 'BANK_STATEMENTS'
                    ? 'spatial-btn-selected'
                    : 'text-white/70 hover:text-white hover:bg-white/15'
                }`}
              >
                <span>📊</span>
                <span>Bank Forensics Hub</span>
              </button>
              <button
                onClick={() => onSwitchModule('SMS_INTELLIGENCE')}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 ${
                  activeModule === 'SMS_INTELLIGENCE'
                    ? 'spatial-btn-selected'
                    : 'text-white/70 hover:text-white hover:bg-white/15'
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
              <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#0A84FF]/25 border border-[#0A84FF]/40 flex items-center justify-center text-[10px] font-bold text-[#0A84FF]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-semibold text-white leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-white/40 font-mono leading-none mt-0.5">
                    {currentUser.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Environment Switcher (Desktop Header) */}
            <button
              onClick={handleCycleEnvironment}
              className="hidden sm:flex spatial-btn px-3.5 py-1.5 text-xs items-center gap-1.5"
              title="Switch Spatial Environment"
            >
              <span>🥽</span>
              <span className="hidden md:inline">Environment</span>
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
          <div className="md:hidden px-4 py-4 border-b border-white/15 space-y-3 animate-fade-in bg-black/80 backdrop-blur-3xl">
            {currentUser && (
              <div className="p-3.5 rounded-[16px] bg-white/10 border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-white/40 font-mono">{currentUser.phone}</div>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs text-[#FF453A] font-semibold hover:underline px-2 py-1 bg-[#FF453A]/10 rounded-full border border-[#FF453A]/20"
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
              <span>Change Spatial Background Room</span>
            </button>
          </div>
        )}

        {/* ── 3. WINDOW MAIN WORKSPACE (WITH MOBILE BOTTOM PADDING) ─────── */}
        <main className="p-3 sm:p-6 lg:p-8 relative z-10 flex-1 pb-24 md:pb-8 touch-scroll">
          {children}
        </main>

        {/* ── 4. WINDOW FOOTER STATUS STRIP (DESKTOP) ───────────────────── */}
        <footer className="hidden sm:flex px-6 py-4 border-t border-white/10 flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            <span className="font-semibold text-white/80">BytFloww Spatial Financial OS</span>
            <span>•</span>
            <span className="text-white/40">Apple visionOS Spatial Architecture</span>
          </div>
          <div className="text-[11px] font-mono text-white/40">
            SHA-256 Verified Ledger • Zero Dummy Data Policy
          </div>
        </footer>

        {/* ── 5. NATIVE ANDROID/MOBILE STICKY BOTTOM NAVIGATION BAR ──────── */}
        {onSwitchModule && (
          <nav 
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 spatial-bottom-nav px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around"
            aria-label="Mobile Navigation"
          >
            <button
              onClick={() => onSwitchModule('BANK_STATEMENTS')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
                activeModule === 'BANK_STATEMENTS'
                  ? 'text-white font-bold scale-105'
                  : 'text-white/50 font-medium'
              }`}
            >
              <span className={`text-lg p-1 rounded-full ${activeModule === 'BANK_STATEMENTS' ? 'bg-white/20 text-white' : ''}`}>
                📊
              </span>
              <span className="text-[10px] leading-none">Forensics</span>
            </button>

            <button
              onClick={() => onSwitchModule('SMS_INTELLIGENCE')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
                activeModule === 'SMS_INTELLIGENCE'
                  ? 'text-white font-bold scale-105'
                  : 'text-white/50 font-medium'
              }`}
            >
              <span className={`text-lg p-1 rounded-full ${activeModule === 'SMS_INTELLIGENCE' ? 'bg-white/20 text-white' : ''}`}>
                📱
              </span>
              <span className="text-[10px] leading-none">SMS Live</span>
            </button>

            <button
              onClick={handleCycleEnvironment}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-white/50 font-medium active:scale-95"
            >
              <span className="text-lg p-1 rounded-full">🥽</span>
              <span className="text-[10px] leading-none">Theme</span>
            </button>

            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-white/50 font-medium active:scale-95"
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
