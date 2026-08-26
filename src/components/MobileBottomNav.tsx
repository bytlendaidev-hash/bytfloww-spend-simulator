import React, { useState } from 'react';
import { SpendTab, ActiveModule } from '../types';

interface MobileBottomNavProps {
  activeTab: SpendTab;
  onSelectTab: (tab: SpendTab) => void;
  activeModule?: ActiveModule;
  onSwitchModule?: (module: ActiveModule) => void;
  onOpenThemeStudio: () => void;
  onOpenDiagnostics?: () => void;
  onOpenUpload?: () => void;
  onLogout?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  activeModule,
  onSwitchModule,
  onOpenThemeStudio,
  onOpenDiagnostics,
  onOpenUpload,
  onLogout,
}) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const primaryTabs: Array<{ id: SpendTab; label: string; icon: string }> = [
    { id: 'OVERVIEW', label: 'Overview', icon: '⚡' },
    { id: 'TRANSACTIONS', label: 'Ledger', icon: '📋' },
    { id: 'CATEGORIES', label: 'Categories', icon: '📊' },
    { id: 'MERCHANTS', label: 'Merchants', icon: '🛍️' },
    { id: 'COMMITMENTS', label: 'Bills', icon: '💳' },
  ];

  const secondaryTabs: Array<{ id: SpendTab; label: string; icon: string; desc: string }> = [
    { id: 'TRENDS', label: 'Trends & Analytics', icon: '📈', desc: 'Velocity & period burn breakdown' },
    { id: 'BUDGETS', label: 'Budget Manager', icon: '🎯', desc: 'Monthly limits & headroom' },
    { id: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: '🔄', desc: 'Recurring debits & autopsy' },
    { id: 'ACCOUNTS', label: 'Bank & Card Accounts', icon: '🏦', desc: 'Balances & credit limits' },
    { id: 'ASSISTANT', label: 'AI Forensic Copilot', icon: '✨', desc: 'Deterministic spending AI' },
  ];

  const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* ── 1. STICKY BOTTOM NAVIGATION BAR (MOBILE ONLY) ────────────────── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-abyss-card/95 backdrop-blur-2xl border-t border-abyss-border px-1 py-1.5 shadow-2xl safe-area-pb"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-h-[50px] relative ${
                  isActive
                    ? 'text-jade-500 font-bold'
                    : 'text-abyss-textMuted hover:text-abyss-textPrimary'
                }`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-jade-500 shadow-sm shadow-jade-500/50 animate-emergence" />
                )}
                <span className={`text-lg leading-none transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-semibold tracking-tight mt-1 leading-none truncate max-w-full">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* "More" Drawer Trigger */}
          <button
            onClick={() => setShowMoreDrawer(true)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-h-[50px] relative ${
              isSecondaryActive || showMoreDrawer
                ? 'text-synapse-400 font-bold'
                : 'text-abyss-textMuted hover:text-abyss-textPrimary'
            }`}
          >
            {isSecondaryActive && (
              <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-synapse-500 shadow-sm shadow-synapse-500/50" />
            )}
            <span className={`text-lg leading-none transition-transform duration-200 ${isSecondaryActive ? 'scale-110' : ''}`}>
              ✨
            </span>
            <span className="text-[10px] font-semibold tracking-tight mt-1 leading-none">
              {isSecondaryActive ? activeTab.slice(0, 5) : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* ── 2. MORE OPTIONS BOTTOM SHEET DRAWER ─────────────────────────── */}
      {showMoreDrawer && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md animate-emergence"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div 
            className="w-full bg-abyss-card border-t border-abyss-border rounded-t-[28px] p-6 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle */}
            <div className="w-12 h-1.5 bg-abyss-border rounded-full mx-auto" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-abyss-textPrimary tracking-tight">
                  Financial Intelligence Suite
                </h3>
                <p className="text-xs text-abyss-textMuted font-medium">
                  Extended modules, forensic engines & theme controls
                </p>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="w-8 h-8 rounded-full bg-abyss-well flex items-center justify-center text-abyss-textMuted text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Extended Feature Tabs Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-abyss-textMuted block px-1">
                Extended Modules
              </span>
              <div className="grid grid-cols-1 gap-2">
                {secondaryTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onSelectTab(tab.id);
                        setShowMoreDrawer(false);
                      }}
                      className={`p-3.5 rounded-2xl flex items-center justify-between text-left transition border ${
                        isActive
                          ? 'bg-abyss-elevated border-jade-500 text-jade-500 shadow-md ring-1 ring-jade-500'
                          : 'bg-abyss-well border-abyss-border text-abyss-textPrimary hover:bg-abyss-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tab.icon}</span>
                        <div>
                          <div className="text-xs font-bold leading-none">{tab.label}</div>
                          <div className="text-[10px] text-abyss-textMuted mt-1">{tab.desc}</div>
                        </div>
                      </div>
                      <span className="text-xs text-abyss-textMuted">→</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Module Switcher Pills on Mobile */}
            {onSwitchModule && (
              <div className="space-y-2 pt-2 border-t border-abyss-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-abyss-textMuted block px-1">
                  Active Platform Mode
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onSwitchModule('BANK_STATEMENTS');
                      setShowMoreDrawer(false);
                    }}
                    className={`p-3 rounded-xl text-xs font-bold text-center border ${
                      activeModule === 'BANK_STATEMENTS'
                        ? 'spatial-btn-selected'
                        : 'spatial-btn'
                    }`}
                  >
                    📊 Bank Forensics Hub
                  </button>
                  <button
                    onClick={() => {
                      onSwitchModule('SMS_INTELLIGENCE');
                      setShowMoreDrawer(false);
                    }}
                    className={`p-3 rounded-xl text-xs font-bold text-center border ${
                      activeModule === 'SMS_INTELLIGENCE'
                        ? 'spatial-btn-selected'
                        : 'spatial-btn'
                    }`}
                  >
                    📱 SMS Spend Simulator
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions (Theme Studio, Upload, Diagnostics, Sign Out) */}
            <div className="pt-2 border-t border-abyss-border grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  onOpenThemeStudio();
                  setShowMoreDrawer(false);
                }}
                className="p-3 rounded-xl bg-jade-500/15 text-jade-500 border border-jade-500/30 flex items-center justify-center gap-2"
              >
                <span>🎨</span>
                <span>Theme Studio</span>
              </button>

              {onOpenDiagnostics && (
                <button
                  onClick={() => {
                    onOpenDiagnostics();
                    setShowMoreDrawer(false);
                  }}
                  className="p-3 rounded-xl bg-abyss-well text-abyss-textPrimary border border-abyss-border flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  <span>Diagnostics</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setShowMoreDrawer(false);
                  }}
                  className="col-span-2 p-3 rounded-xl bg-pulse-500/10 text-pulse-500 border border-pulse-500/20 flex items-center justify-center gap-2 font-bold"
                >
                  <span>🚪</span>
                  <span>Sign Out Session</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
