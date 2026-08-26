import React, { useState, useEffect } from 'react';
import { SpatialBackground } from './SpatialBackground';
import { BytLendLogo } from './BytLendLogo';
import { ThemeStudioModal } from './ThemeStudioModal';
import { SidebarNavigation } from './SidebarNavigation';
import { MobileBottomNav } from './MobileBottomNav';
import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId, setActiveThemeId } from '../theme/themes';
import { SpendTab, ActiveModule } from '../types';

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
  activeTab?: SpendTab;
  onSelectTab?: (tab: SpendTab) => void;
  counts?: {
    transactions?: number;
    categories?: number;
    merchants?: number;
    commitments?: number;
  };
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onOpenDiagnostics,
  onOpenUpload,
  activeModule = 'SMS_INTELLIGENCE',
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

  const currentTheme = THEME_TEMPLATES[currentThemeId] || THEME_TEMPLATES.apex_obsidian;

  const handleCycleTheme = () => {
    const themeKeys = Object.keys(THEME_TEMPLATES) as ThemeTemplateId[];
    const nextIndex = (themeKeys.indexOf(currentThemeId) + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    setActiveThemeId(nextTheme);
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden p-0 sm:p-3 lg:p-5 flex flex-col justify-between text-abyss-textPrimary selection:bg-jade-500/30 selection:text-white transition-colors duration-300">
      {/* ── 1. DYNAMIC BACKGROUND ENVIRONMENT ───────────────────────────── */}
      <SpatialBackground isDark={isDark} />

      {/* ── 2. MAIN APPLICATION CONTAINER (100% Edge-to-Edge on Mobile) ── */}
      <div className="w-full max-w-[1600px] mx-auto my-auto relative z-10 flex flex-col md:flex-row spatial-window rounded-none sm:rounded-[28px] border-x-0 sm:border min-h-screen sm:min-h-[92vh] shadow-2xl transition-all duration-300 overflow-hidden">
        
        {/* ── DESKTOP & TABLET SIDEBAR NAVIGATION (ICONS + RAIL) ────────── */}
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

        {/* ── MAIN WORKSPACE COLUMN ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── STICKY TOP APP BAR (MOBILE & DESKTOP HEADER) ─────────────── */}
          <header className="px-3.5 sm:px-6 lg:px-8 py-3 sm:py-3.5 border-b border-abyss-border flex items-center justify-between gap-3 sticky top-0 z-40 bg-abyss-card/95 backdrop-blur-xl">
            {/* Brand Identity & Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <BytLendLogo size="sm" />
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base tracking-tight flex items-center text-abyss-textPrimary">
                    Byt<span className="text-jade-500 font-black ml-0.5">Floww</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full bg-jade-500/15 text-jade-500 border border-jade-500/35 tracking-wider uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse" />
                    {currentTheme.name.toUpperCase()}
                  </span>
                </div>
                <div className="hidden xs:flex items-center gap-1.5 text-[10px] text-abyss-textMuted">
                  <span className="text-jade-500 font-semibold">● Autonomous AI Forensics</span>
                  <span className="hidden md:inline text-abyss-textMuted/70">• {currentTheme.tagline}</span>
                </div>
              </div>
            </div>

            {/* Module Switcher Segmented Control (Desktop & Tablet) */}
            {onSwitchModule && currentUser && (
              <div className="hidden lg:flex items-center p-1 spatial-ornament gap-1">
                <button
                  onClick={() => onSwitchModule('BANK_STATEMENTS')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
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
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 ${
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Theme Studio Button */}
              <button
                onClick={() => setShowThemeStudio(true)}
                className="spatial-btn px-2.5 sm:px-3.5 py-1.5 text-xs flex items-center gap-1.5 border-jade-500/30 text-jade-500 hover:scale-105"
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
                <span className="hidden md:inline font-semibold">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              {/* User Session Profile Chip */}
              {currentUser && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-abyss-well border border-abyss-border text-xs">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-jade-500/20 border border-jade-500/50 flex items-center justify-center text-[10px] font-bold text-jade-500">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-[11px] font-semibold text-abyss-textPrimary leading-none truncate max-w-[100px]">
                      {currentUser.name}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Menu Dropdown Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden spatial-btn w-8 h-8 flex items-center justify-center text-xs"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </header>

          {/* Mobile Top Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-4 py-4 border-b border-abyss-border space-y-3 animate-emergence bg-abyss-card">
              {currentUser && (
                <div className="p-3 rounded-2xl bg-abyss-well border border-abyss-border flex items-center justify-between">
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
                      className="text-xs text-pulse-500 font-semibold px-3 py-1 bg-pulse-500/10 rounded-full border border-pulse-500/20"
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
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border ${
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
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border ${
                      activeModule === 'SMS_INTELLIGENCE'
                        ? 'spatial-btn-selected'
                        : 'spatial-btn'
                    }`}
                  >
                    📱 SMS Simulator
                  </button>
                </div>
              )}

              {/* Theme Studio in Dropdown */}
              <button
                onClick={() => {
                  setShowThemeStudio(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl spatial-btn text-xs font-bold flex items-center justify-center gap-2 border-jade-500/40 text-jade-500"
              >
                <span>🎨</span>
                <span>Open Theme Studio (5 Themes)</span>
              </button>
            </div>
          )}

          {/* ── MAIN CONTENT WORKSPACE ──────────────────────────────────── */}
          <main className="p-3 sm:p-5 lg:p-7 relative z-10 flex-1 pb-28 md:pb-8 touch-scroll overflow-y-auto">
            {children}
          </main>

          {/* ── FOOTER STATUS STRIP (DESKTOP) ─────────────────────────── */}
          <footer className="hidden sm:flex px-6 py-3.5 border-t border-abyss-border flex-col sm:flex-row items-center justify-between gap-2 text-xs text-abyss-textMuted bg-abyss-card/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-jade-500 animate-pulse" />
              <span className="font-semibold text-abyss-textPrimary">BytFloww Solid Financial Intelligence OS</span>
              <span>•</span>
              <span className="text-abyss-textMuted font-mono">Theme: {currentTheme.name}</span>
            </div>
            <div className="text-[11px] font-mono text-abyss-textMuted flex items-center gap-3">
              <span>Deterministic AI Engine</span>
              <span>•</span>
              <span className="text-jade-500">SHA-256 Verified Ledger</span>
            </div>
          </footer>
        </div>
      </div>

      {/* ── 3. STICKY MOBILE BOTTOM NAVIGATION BAR (ANDROID STYLE) ──────── */}
      {currentUser && (
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          activeModule={activeModule}
          onSwitchModule={onSwitchModule}
          onOpenThemeStudio={() => setShowThemeStudio(true)}
          onOpenDiagnostics={onOpenDiagnostics}
          onOpenUpload={onOpenUpload}
          onLogout={onLogout}
        />
      )}

      {/* ── 4. THEME STUDIO MODAL ───────────────────────────────────────── */}
      <ThemeStudioModal
        isOpen={showThemeStudio}
        onClose={() => setShowThemeStudio(false)}
        isDark={isDark}
        onToggleDark={onToggleTheme || (() => {})}
      />
    </div>
  );
};
