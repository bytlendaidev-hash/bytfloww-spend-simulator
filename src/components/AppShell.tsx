import React, { useState, useEffect } from 'react';
import { SpatialBackground } from './SpatialBackground';
import { BytLendLogo } from './BytLendLogo';
import { ThemeStudioModal } from './ThemeStudioModal';
import { SidebarNavigation } from './SidebarNavigation';
import { MobileBottomNav } from './MobileBottomNav';
import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId } from '../theme/themes';
import { SpendTab, ActiveModule, StatementSection } from '../types';

interface AppShellProps {
  children: React.ReactNode;
  rawCount?: number;
  onOpenUpload?: () => void;
  onOpenDiagnostics?: () => void;
  activeModule?: ActiveModule;
  onSwitchModule?: (module: ActiveModule) => void;
  currentUser?: { name: string; email: string; phone: string } | null;
  onLogout?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  activeTab?: SpendTab | StatementSection;
  onSelectTab?: (tab: any) => void;
  counts?: {
    transactions?: number;
    categories?: number;
    merchants?: number;
    commitments?: number;
    p2pCount?: number;
    lendersCount?: number;
  };
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onOpenDiagnostics,
  onOpenUpload,
  activeModule = 'BANK_STATEMENTS',
  onSwitchModule,
  currentUser,
  onLogout,
  isDark = true,
  onToggleTheme,
  activeTab = 'OVERVIEW',
  onSelectTab = () => {},
  counts = {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemeStudio, setShowThemeStudio] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeTemplateId>(getActiveThemeId());

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<ThemeTemplateId>) => {
      if (e.detail) {
        setCurrentThemeId(e.detail);
      }
    };
    window.addEventListener('theme-template-change' as any, handleThemeChange);
    return () => window.removeEventListener('theme-template-change' as any, handleThemeChange);
  }, []);

  const currentTheme = THEME_TEMPLATES[currentThemeId] || THEME_TEMPLATES.aurora_cyber;

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col bg-abyss-canvas text-abyss-textPrimary selection:bg-cyan-500/30 selection:text-white transition-colors duration-300">
      {/* ── 1. DYNAMIC AMBIENT BACKGROUND ENVIRONMENT ─────────────────────── */}
      <SpatialBackground isDark={isDark} />

      {/* ── 2. STICKY TOP APP BAR (HEADER) ────────────────────────────────── */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-abyss-border flex items-center justify-between gap-3 shrink-0 z-40 bg-abyss-card/90 backdrop-blur-xl">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <BytLendLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-abyss-textPrimary">
              Byt<span className="text-cyan-400">Floww</span>
            </span>
            <span className="hidden sm:inline-flex text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 tracking-wider uppercase items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              FINTECH OS
            </span>
          </div>
        </div>

        {/* Center Module Switcher Segmented Control */}
        {onSwitchModule && currentUser && (
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-abyss-well border border-abyss-border gap-1 shadow-inner">
            <button
              onClick={() => onSwitchModule('BANK_STATEMENTS')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeModule === 'BANK_STATEMENTS'
                  ? 'btn-neon-action shadow-neon-cyan'
                  : 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-card'
              }`}
            >
              <span>📊</span>
              <span>Bank Forensics Hub</span>
            </button>
            <button
              onClick={() => onSwitchModule('SMS_INTELLIGENCE')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeModule === 'SMS_INTELLIGENCE'
                  ? 'btn-neon-action shadow-neon-cyan'
                  : 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-card'
              }`}
            >
              <span>📱</span>
              <span>SMS Spend Twin</span>
            </button>
          </div>
        )}

        {/* Right Header Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Studio Button */}
          <button
            onClick={() => setShowThemeStudio(true)}
            className="spatial-btn px-3 py-1.5 text-xs flex items-center gap-1.5 border-cyan-500/30 text-cyan-400 hover:border-cyan-400"
            title="Theme Studio"
          >
            <span>🎨</span>
            <span className="hidden sm:inline font-bold">Theme Studio</span>
            <span className="w-2 h-2 rounded-full hidden xs:inline" style={{ backgroundColor: currentTheme.swatches.primary }} />
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="spatial-btn px-2.5 sm:px-3 py-1.5 text-xs flex items-center gap-1"
            title={`Switch to ${isDark ? 'Light Mode' : 'Dark Mode'}`}
          >
            <span>{isDark ? '☀️' : '🌙'}</span>
            <span className="hidden lg:inline font-semibold">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* User Session Profile Chip */}
          {currentUser && (
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-abyss-well border border-abyss-border text-xs">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-bold text-abyss-textPrimary leading-none truncate max-w-[110px]">
                  {currentUser.name}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Dropdown Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden spatial-btn w-8 h-8 flex items-center justify-center text-xs"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* ── MOBILE TOP DROPDOWN MENU ──────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 border-b border-abyss-border space-y-3 animate-emergence bg-abyss-card/95 backdrop-blur-xl z-40">
          {currentUser && (
            <div className="p-3 rounded-2xl bg-abyss-well border border-abyss-border flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-abyss-textPrimary">{currentUser.name}</div>
                <div className="text-[10px] text-abyss-textMuted font-mono">{currentUser.phone}</div>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-xs text-rose-500 font-bold px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20"
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
                className={`p-2.5 rounded-xl text-xs font-bold text-center border transition ${
                  activeModule === 'BANK_STATEMENTS'
                    ? 'btn-neon-action shadow-neon-cyan'
                    : 'bg-abyss-well border-abyss-border text-abyss-textSecondary'
                }`}
              >
                📊 Bank Forensics
              </button>
              <button
                onClick={() => {
                  onSwitchModule('SMS_INTELLIGENCE');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold text-center border transition ${
                  activeModule === 'SMS_INTELLIGENCE'
                    ? 'btn-neon-action shadow-neon-cyan'
                    : 'bg-abyss-well border-abyss-border text-abyss-textSecondary'
                }`}
              >
                📱 SMS Simulator
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 3. MAIN DASHBOARD WORKSPACE BODY (SIDEBAR + 100% VISIBLE VIEWPORT) */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Fixed Sidebar Navigation */}
        {currentUser && (
          <SidebarNavigation
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            activeModule={activeModule}
            onSwitchModule={onSwitchModule}
            onOpenThemeStudio={() => setShowThemeStudio(true)}
            onOpenDiagnostics={onOpenDiagnostics}
            isDark={isDark}
            onToggleTheme={onToggleTheme || (() => {})}
            counts={counts}
          />
        )}

        {/* Central Workspace Scroll Container (Single-layer independent scrolling) */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 lg:p-7 space-y-6 touch-scroll pb-24 md:pb-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── 4. STICKY MOBILE BOTTOM NAVIGATION BAR ────────────────────────── */}
      {currentUser && (
        <MobileBottomNav
          activeTab={activeTab as SpendTab}
          onSelectTab={onSelectTab}
          activeModule={activeModule}
          onSwitchModule={onSwitchModule}
          onOpenThemeStudio={() => setShowThemeStudio(true)}
          onOpenDiagnostics={onOpenDiagnostics}
          onOpenUpload={onOpenUpload}
          onLogout={onLogout}
        />
      )}

      {/* ── 5. THEME STUDIO MODAL ─────────────────────────────────────────── */}
      <ThemeStudioModal
        isOpen={showThemeStudio}
        onClose={() => setShowThemeStudio(false)}
        isDark={isDark}
        onToggleDark={onToggleTheme || (() => {})}
      />
    </div>
  );
};
