import React, { useState } from 'react';
import { SpendTab, ActiveModule } from '../types';
import { BytLendLogo } from './BytLendLogo';
import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId } from '../theme/themes';

interface SidebarNavigationProps {
  activeTab: SpendTab;
  onSelectTab: (tab: SpendTab) => void;
  activeModule?: ActiveModule;
  onSwitchModule?: (module: ActiveModule) => void;
  onOpenThemeStudio: () => void;
  onOpenDiagnostics?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  counts?: {
    transactions?: number;
    categories?: number;
    merchants?: number;
    commitments?: number;
  };
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onSelectTab,
  activeModule,
  onSwitchModule,
  onOpenThemeStudio,
  onOpenDiagnostics,
  isDark,
  onToggleTheme,
  counts = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeThemeId = getActiveThemeId();
  const theme = THEME_TEMPLATES[activeThemeId] || THEME_TEMPLATES.apex_obsidian;

  const mainNavGroups: Array<{
    title: string;
    items: Array<{ id: SpendTab; label: string; icon: string; badge?: number }>;
  }> = [
    {
      title: 'CORE INTELLIGENCE',
      items: [
        { id: 'OVERVIEW', label: 'Overview', icon: '⚡' },
        { id: 'TRANSACTIONS', label: 'Transactions', icon: '📋', badge: counts.transactions },
        { id: 'CATEGORIES', label: 'Categories', icon: '📊', badge: counts.categories },
        { id: 'MERCHANTS', label: 'Merchants', icon: '🛍️', badge: counts.merchants },
      ],
    },
    {
      title: 'FORENSICS & VAULT',
      items: [
        { id: 'COMMITMENTS', label: 'Commitments', icon: '💳', badge: counts.commitments },
        { id: 'TRENDS', label: 'Trends & Velocity', icon: '📈' },
        { id: 'BUDGETS', label: 'Budget Manager', icon: '🎯' },
        { id: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: '🔄' },
        { id: 'ACCOUNTS', label: 'Bank & Card Accounts', icon: '🏦' },
      ],
    },
    {
      title: 'NEURAL COPILOT',
      items: [
        { id: 'ASSISTANT', label: 'AI Forensic Copilot', icon: '✨' },
      ],
    },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 z-30 border-r border-abyss-border bg-abyss-card/90 backdrop-blur-xl ${
        isExpanded ? 'w-64 p-5' : 'w-20 p-3'
      }`}
      aria-label="Desktop Navigation"
    >
      {/* ── TOP SECTION: BRAND LOGO & EXPAND TOGGLE ─────────────────────── */}
      <div className="space-y-6">
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer group flex items-center gap-3"
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <BytLendLogo size="sm" />
            {isExpanded && (
              <div className="animate-emergence">
                <div className="font-bold text-sm text-abyss-textPrimary leading-none flex items-center">
                  Byt<span className="text-jade-500 font-black ml-0.5">Floww</span>
                </div>
                <span className="text-[9px] font-mono text-jade-500 font-bold tracking-wider uppercase block mt-0.5">
                  FINTECH OS
                </span>
              </div>
            )}
          </div>

          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="w-7 h-7 rounded-lg bg-abyss-well hover:bg-abyss-elevated text-abyss-textMuted hover:text-abyss-textPrimary text-xs flex items-center justify-center transition"
              title="Collapse"
            >
              ◀
            </button>
          )}
        </div>

        {/* ── NAVIGATION GROUPS & ICONS ─────────────────────────────────── */}
        <nav className="space-y-5 overflow-y-auto no-scrollbar">
          {mainNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              {isExpanded ? (
                <span className="text-[9px] font-mono font-bold tracking-widest text-abyss-textMuted uppercase block px-2.5 mb-1">
                  {group.title}
                </span>
              ) : (
                <div className="w-full h-px bg-abyss-border my-2 opacity-50" />
              )}

              {group.items.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`w-full flex items-center rounded-2xl transition-all duration-200 group relative ${
                      isExpanded 
                        ? 'px-3.5 py-2.5 gap-3 justify-between' 
                        : 'p-3 justify-center'
                    } ${
                      isActive
                        ? 'bg-jade-500 text-black font-black shadow-md shadow-jade-500/25 ring-1 ring-jade-500'
                        : 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-well/70'
                    }`}
                    title={!isExpanded ? `${tab.label}` : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {tab.icon}
                      </span>
                      {isExpanded && (
                        <span className="text-xs tracking-tight truncate leading-none">
                          {tab.label}
                        </span>
                      )}
                    </div>

                    {/* Badge Counter */}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-black/20 text-black'
                          : 'bg-abyss-well text-abyss-textSecondary'
                      }`}>
                        {tab.badge}
                      </span>
                    )}

                    {/* Hover Floating Tooltip on Compact Rail Mode */}
                    {!isExpanded && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-abyss-elevated border border-abyss-border text-abyss-textPrimary text-xs font-bold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {tab.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── BOTTOM UTILITIES (THEME STUDIO, THEME TOGGLE, DIAGNOSTICS) ─── */}
      <div className="pt-4 border-t border-abyss-border space-y-2">
        {/* Theme Studio Trigger */}
        <button
          onClick={onOpenThemeStudio}
          className={`w-full flex items-center rounded-2xl p-2.5 transition border border-jade-500/30 text-jade-500 bg-jade-500/10 hover:bg-jade-500/20 group relative ${
            isExpanded ? 'px-3.5 gap-3' : 'justify-center'
          }`}
          title={!isExpanded ? 'Theme Studio (5 Themes)' : undefined}
        >
          <span className="text-base group-hover:rotate-12 transition-transform">🎨</span>
          {isExpanded && (
            <div className="text-left leading-none">
              <span className="text-xs font-bold block">Theme Studio</span>
              <span className="text-[9px] text-jade-400/80 font-mono mt-0.5">{theme.name}</span>
            </div>
          )}
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center rounded-2xl p-2.5 transition bg-abyss-well hover:bg-abyss-elevated text-abyss-textPrimary border border-abyss-border ${
            isExpanded ? 'px-3.5 gap-3' : 'justify-center'
          }`}
          title={!isExpanded ? (isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
        >
          <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
          {isExpanded && (
            <span className="text-xs font-semibold">
              {isDark ? 'Light Ceramic' : 'Dark Obsidian'}
            </span>
          )}
        </button>

        {/* Expand / Collapse Bar Button when compact */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-abyss-textMuted hover:text-abyss-textPrimary text-xs transition hover:bg-abyss-well"
            title="Expand Sidebar"
          >
            ▶
          </button>
        )}
      </div>
    </aside>
  );
};
