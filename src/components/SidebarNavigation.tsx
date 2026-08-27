import React, { useState } from 'react';
import { SpendTab, ActiveModule, StatementSection } from '../types';
import { BytLendLogo } from './BytLendLogo';
import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId } from '../theme/themes';

interface SidebarNavigationProps {
  activeTab: SpendTab | StatementSection;
  onSelectTab: (tab: any) => void;
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
    p2pCount?: number;
    lendersCount?: number;
  };
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onSelectTab,
  activeModule = 'BANK_STATEMENTS',
  onSwitchModule,
  onOpenThemeStudio,
  onOpenDiagnostics,
  isDark,
  onToggleTheme,
  counts = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const activeThemeId = getActiveThemeId();
  const theme = THEME_TEMPLATES[activeThemeId] || THEME_TEMPLATES.royal_indigo;

  // Navigation Items when inside BANK_STATEMENTS Module
  const bankNavGroups: Array<{
    title: string;
    items: Array<{ id: StatementSection; label: string; icon: string; badge?: number }>;
  }> = [
    {
      title: 'CORE FORENSICS',
      items: [
        { id: 'OVERVIEW', label: 'Executive Summary', icon: '⚡' },
        { id: 'P2P_TRANSFERS', label: 'P2P & UPI Transfers', icon: '👥', badge: counts.p2pCount },
        { id: 'SALARY_AUDIT', label: 'Salary Intelligence', icon: '💼' },
        { id: 'TRANSACTIONS', label: 'Master Transactions', icon: '📋', badge: counts.transactions },
      ],
    },
    {
      title: 'CREDIT & DEBT RADAR',
      items: [
        { id: 'LOANS_NBFC', label: 'Loans & NBFC Radar', icon: '🏦', badge: counts.lendersCount },
        { id: 'CARDS_EMIS', label: 'Cards & EMIs', icon: '💳' },
        { id: 'EPFO_TRACKER', label: 'EPFO Passbook', icon: '🏛️' },
        { id: 'INVESTMENTS', label: 'Investments & Crypto', icon: '📈' },
      ],
    },
    {
      title: 'DEEP AUDITS & LEDGER',
      items: [
        { id: 'RECONCILIATION', label: 'Reconciliation Audit', icon: '⚖️' },
        { id: 'SPEND_DNA', label: 'Spend DNA & Merchants', icon: '🛍️' },
        { id: 'HEATMAP', label: 'Ledger Calendar', icon: '📅' },
        { id: 'RISK_ANOMALIES', label: 'Anomaly Radar', icon: '🚨' },
        { id: 'RAW_VIEW', label: 'Raw Bank Ledger', icon: '📑' },
      ],
    },
  ];

  // Navigation Items when inside SMS_INTELLIGENCE Module
  const smsNavGroups: Array<{
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

  const activeGroups = activeModule === 'BANK_STATEMENTS' ? bankNavGroups : smsNavGroups;

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 z-30 border-r border-abyss-border bg-abyss-card/95 backdrop-blur-xl h-full select-none ${
        isExpanded ? 'w-64 p-4' : 'w-20 p-3'
      }`}
      aria-label="Desktop Navigation"
    >
      {/* ── TOP SECTION: MODULE SWITCHER & COLLAPSE TOGGLE ─────────────── */}
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} shrink-0`}>
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-synapse-400 tracking-wider">
                {activeModule === 'BANK_STATEMENTS' ? 'Bank Forensics' : 'SMS Intelligence'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse" />
            </div>
          ) : (
            <BytLendLogo size="sm" />
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-lg bg-abyss-well hover:bg-abyss-elevated text-abyss-textMuted hover:text-abyss-textPrimary text-xs flex items-center justify-center transition border border-abyss-border"
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* ── NAVIGATION GROUPS & SCROLLABLE RAIL ──────────────────────── */}
        <nav className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
          {activeGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {isExpanded ? (
                <span className="text-[9px] font-mono font-bold tracking-widest text-abyss-textMuted uppercase block px-2.5 mb-1 opacity-80">
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
                    className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${
                      isExpanded 
                        ? 'px-3 py-2 gap-2.5 justify-between text-left' 
                        : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-synapse-500 text-white font-black shadow-solid-sm ring-1 ring-synapse-400'
                        : 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-well'
                    }`}
                    title={!isExpanded ? `${tab.label}` : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-base shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {tab.icon}
                      </span>
                      {isExpanded && (
                        <span className="text-xs font-semibold tracking-tight truncate leading-tight">
                          {tab.label}
                        </span>
                      )}
                    </div>

                    {/* Badge Counter */}
                    {isExpanded && tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-abyss-well text-abyss-textMuted border border-abyss-border'
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

      {/* ── BOTTOM UTILITIES (THEME STUDIO & TOGGLES) ──────────────────── */}
      <div className="pt-3 border-t border-abyss-border space-y-2 shrink-0">
        {/* Theme Studio Trigger */}
        <button
          onClick={onOpenThemeStudio}
          className={`w-full flex items-center rounded-xl p-2 transition border border-synapse-500/30 text-synapse-400 bg-synapse-500/10 hover:bg-synapse-500/20 group relative ${
            isExpanded ? 'px-3 gap-2.5' : 'justify-center'
          }`}
          title={!isExpanded ? 'Theme Studio (5 Themes)' : undefined}
        >
          <span className="text-base group-hover:rotate-12 transition-transform shrink-0">🎨</span>
          {isExpanded && (
            <div className="text-left leading-none truncate">
              <span className="text-xs font-bold block">Theme Studio</span>
              <span className="text-[9px] text-synapse-400/80 font-mono mt-0.5">{theme.name}</span>
            </div>
          )}
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center rounded-xl p-2 transition bg-abyss-well hover:bg-abyss-elevated text-abyss-textPrimary border border-abyss-border ${
            isExpanded ? 'px-3 gap-2.5' : 'justify-center'
          }`}
          title={!isExpanded ? (isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
        >
          <span className="text-base shrink-0">{isDark ? '☀️' : '🌙'}</span>
          {isExpanded && (
            <span className="text-xs font-semibold truncate">
              {isDark ? 'Light Ceramic' : 'Dark Obsidian'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
