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
                    ? 'text-cyan-400 font-bold'
                    : 'text-abyss-textMuted hover:text-abyss-textPrimary'
                }`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-cyan-400 shadow-neon-cyan animate-emergence" />
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
                ? 'text-purple-400 font-bold'
                : 'text-abyss-textMuted hover:text-abyss-textPrimary'
            }`}
          >
            {isSecondaryActive && (
              <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-purple-500 shadow-neon-purple" />
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

      {/* ── 2. "MORE" BOTTOM SHEET DRAWER (MODAL OVERLAY) ────────────────── */}
      {showMoreDrawer && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-emergence"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div 
            className="bg-abyss-card border-t border-abyss-borderStrong rounded-t-[28px] p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle */}
            <div className="w-12 h-1.5 rounded-full bg-abyss-borderStrong mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-abyss-textPrimary">Extended Intelligence</h3>
                <p className="text-[11px] text-abyss-textMuted">Forensic tools, budgets, & system controls</p>
              </div>
              <button 
                onClick={() => setShowMoreDrawer(false)}
                className="w-7 h-7 rounded-full bg-abyss-well text-abyss-textMuted flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Module Switcher if available */}
            {onSwitchModule && (
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-abyss-well border border-abyss-border">
                <button
                  onClick={() => {
                    onSwitchModule('BANK_STATEMENTS');
                    setShowMoreDrawer(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold text-center transition ${
                    activeModule === 'BANK_STATEMENTS'
                      ? 'btn-neon-action shadow-neon-cyan'
                      : 'text-abyss-textSecondary'
                  }`}
                >
                  📊 Bank Forensics
                </button>
                <button
                  onClick={() => {
                    onSwitchModule('SMS_INTELLIGENCE');
                    setShowMoreDrawer(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold text-center transition ${
                    activeModule === 'SMS_INTELLIGENCE'
                      ? 'btn-neon-action shadow-neon-cyan'
                      : 'text-abyss-textSecondary'
                  }`}
                >
                  📱 SMS Twin
                </button>
              </div>
            )}

            {/* Secondary Forensic Tabs Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-abyss-textMuted uppercase block px-1">
                Forensics & Copilot
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
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                        isActive
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                          : 'bg-abyss-well border-abyss-border text-abyss-textSecondary hover:bg-abyss-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tab.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-abyss-textPrimary">{tab.label}</div>
                          <div className="text-[10px] text-abyss-textMuted">{tab.desc}</div>
                        </div>
                      </div>
                      {isActive && <span className="text-cyan-400 font-bold text-xs">Active</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions & Utilities */}
            <div className="pt-2 border-t border-abyss-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowMoreDrawer(false);
                    onOpenThemeStudio();
                  }}
                  className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>🎨</span> Theme Studio
                </button>
                {onOpenDiagnostics && (
                  <button
                    onClick={() => {
                      setShowMoreDrawer(false);
                      onOpenDiagnostics();
                    }}
                    className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>🩺</span> Diagnostics
                  </button>
                )}
              </div>

              {onOpenUpload && (
                <button
                  onClick={() => {
                    setShowMoreDrawer(false);
                    onOpenUpload();
                  }}
                  className="w-full p-2.5 rounded-xl bg-abyss-well border border-abyss-border text-xs font-bold text-abyss-textPrimary flex items-center justify-center gap-2"
                >
                  <span>📥</span> Upload New Statement / SMS Batch
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    setShowMoreDrawer(false);
                    onLogout();
                  }}
                  className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400 flex items-center justify-center gap-2"
                >
                  <span>🚪</span> Sign Out of Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
