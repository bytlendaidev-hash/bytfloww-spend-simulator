import React from 'react';
import { SpendSnapshot, SpendTab, ActiveModule } from '../types';

interface SpendHeaderProps {
  snapshot: SpendSnapshot;
  isDark: boolean;
  activeTab: SpendTab;
  activeModule?: ActiveModule;
  onSelectTab: (tab: SpendTab) => void;
  onSelectModule?: (module: ActiveModule) => void;
  onSelectPeriod: (periodKey: string) => void;
  onOpenFilter: () => void;
  onOpenCopilot: () => void;
  onOpenUpload: () => void;
  onOpenDiagnostics: () => void;
  onToggleTheme: () => void;
  totalParsedCount: number;
}

export const SpendHeader: React.FC<SpendHeaderProps> = ({
  snapshot,
  isDark,
  activeTab,
  activeModule = 'SMS_INTELLIGENCE',
  onSelectTab,
  onSelectModule,
  onSelectPeriod,
  onOpenFilter,
  onOpenCopilot,
  onOpenUpload,
  onOpenDiagnostics,
  onToggleTheme,
  totalParsedCount,
}) => {
  const dateRanges = [
    { key: 'TODAY', label: 'Today' },
    { key: '7D', label: '7 Days' },
    { key: '30D', label: '30 Days' },
    { key: '2026-08', label: 'This Month' },
    { key: 'YEAR', label: 'This Year' },
    { key: 'ALL', label: 'All Time' },
  ];

  const mainTabs: Array<{ id: SpendTab; label: string; icon: string }> = [
    { id: 'OVERVIEW', label: 'Overview', icon: '⚡' },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: '📋' },
    { id: 'CATEGORIES', label: 'Categories', icon: '📊' },
    { id: 'MERCHANTS', label: 'Merchants', icon: '🛍️' },
    { id: 'COMMITMENTS', label: 'Commitments', icon: '💳' },
    { id: 'TRENDS', label: 'Trends', icon: '📈' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 animate-emergence">
      {/* ── TOP MODULE SELECTOR BAR (SMS INTELLIGENCE vs BANK STATEMENTS) ── */}
      {onSelectModule && (
        <div className={`p-1.5 rounded-2xl border flex items-center justify-between gap-2 transition-all backdrop-blur-xl ${
          isDark ? 'bg-[#0E1720]/80 border-white/[0.08]' : 'bg-slate-200/70 border-slate-300/70'
        }`}>
          <button
            onClick={() => onSelectModule('SMS_INTELLIGENCE')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 border ${
              activeModule === 'SMS_INTELLIGENCE'
                ? isDark
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 border-emerald-400/50 shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-900 border-slate-200 shadow-sm'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <span>📱</span>
            <span>SMS Spend Intelligence</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
              activeModule === 'SMS_INTELLIGENCE'
                ? isDark ? 'bg-black/25 text-slate-950 font-bold' : 'bg-slate-100 text-slate-900 font-bold'
                : isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-300/60 text-slate-700'
            }`}>
              {totalParsedCount.toLocaleString('en-IN')} SMS
            </span>
          </button>

          <button
            onClick={() => onSelectModule('BANK_STATEMENTS')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 border ${
              activeModule === 'BANK_STATEMENTS'
                ? isDark
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 border-emerald-400/50 shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-900 border-slate-200 shadow-sm'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <span>🏛️</span>
            <span>Bank Statement Forensics</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
              RENDER API
            </span>
          </button>
        </div>
      )}

      {/* ── TOP APP BAR (MOBILE RESPONSIVE) ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Back Arrow + Logo + Spend Intelligence Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button 
            onClick={() => onSelectTab('OVERVIEW')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border font-black text-base transition-all duration-150 flex-shrink-0 active:scale-95 backdrop-blur-xl ${
              isDark 
                ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-200' 
                : 'bg-white/80 border-slate-200/90 text-slate-800 hover:bg-white shadow-sm'
            }`}
            title="Back to Overview"
          >
            ‹
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Solid BytFloww Logo */}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
              isDark 
                ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/25' 
                : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/20'
            }`}>
              <span className="font-black text-sm">▷</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`text-sm sm:text-lg font-black font-heading tracking-tight truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Spend Intelligence
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className={`font-black truncate ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {totalParsedCount.toLocaleString('en-IN')} SMS (Live Dataset)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {onSelectModule && (
            <button
              onClick={() => onSelectModule('BANK_STATEMENTS')}
              className={`px-3 h-9 sm:h-10 rounded-2xl flex items-center gap-1.5 border font-black text-xs transition-all duration-150 active:scale-95 backdrop-blur-xl ${
                isDark 
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 shadow-sm'
              }`}
            >
              <span>🏛️</span>
              <span className="hidden sm:inline">Statement Hub</span>
            </button>
          )}

          {/* Ask AI Copilot Bubble Button */}
          <button
            onClick={onOpenCopilot}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition-all duration-150 active:scale-95 text-sm backdrop-blur-xl ${
              isDark 
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm'
            }`}
            title="Ask AI Copilot"
          >
            💬
          </button>

          {/* Security Shield / Diagnostics */}
          <button
            onClick={onOpenDiagnostics}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition-all duration-150 active:scale-95 text-sm backdrop-blur-xl ${
              isDark 
                ? 'bg-white/[0.05] border-white/[0.08] text-emerald-400 hover:bg-white/[0.1]' 
                : 'bg-white/80 border-slate-200/90 text-emerald-700 hover:bg-white shadow-sm'
            }`}
            title="Security Shield & Diagnostics"
          >
            🛡️
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition-all duration-150 active:scale-95 text-xs sm:text-sm backdrop-blur-xl ${
              isDark 
                ? 'bg-white/[0.05] border-white/[0.08] text-amber-300 hover:bg-white/[0.1]' 
                : 'bg-white/80 border-slate-200/90 text-slate-800 hover:bg-white shadow-sm'
            }`}
            title="Theme Toggle"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Profile TU Avatar */}
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center font-black text-xs shadow-sm backdrop-blur-xl ${
            isDark ? 'bg-white/[0.08] border-white/[0.12] text-white' : 'bg-slate-900 border-slate-900 text-white'
          }`}>
            TU
          </div>
        </div>
      </div>

      {/* ── ROW 1: DATE HORIZON FILTER PILLS (SWIPEABLE HORIZONTAL BAR) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1">
        {dateRanges.map((range) => {
          const isSelected = snapshot.periodKey === range.key || (range.key === '2026-08' && snapshot.periodKey === '2026-08');
          return (
            <button
              key={range.key}
              onClick={() => onSelectPeriod(range.key)}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-black whitespace-nowrap transition-all duration-150 border flex-shrink-0 active:scale-95 backdrop-blur-xl ${
                isSelected
                  ? isDark 
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 border-emerald-400/50 shadow-md shadow-emerald-500/25 font-black' 
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                  : isDark
                  ? 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                  : 'bg-white/80 text-slate-700 border-slate-200/90 hover:bg-white hover:text-slate-900 shadow-sm'
              }`}
            >
              {range.label}
            </button>
          );
        })}

        {/* Filters Button */}
        <button
          onClick={onOpenFilter}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-black whitespace-nowrap border transition-all duration-150 flex-shrink-0 active:scale-95 backdrop-blur-xl ${
            isDark 
              ? 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]' 
              : 'bg-white/80 text-slate-800 border-slate-200/90 hover:bg-white shadow-sm'
          }`}
        >
          <span>⚡</span>
          <span>Filters</span>
        </button>
      </div>

      {/* ── ROW 2: MAIN SUB-TABS (SWIPEABLE HORIZONTAL BAR) ─────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs font-black whitespace-nowrap transition-all duration-150 border flex-shrink-0 active:scale-95 backdrop-blur-xl ${
                isActive
                  ? isDark 
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 border-emerald-400/50 shadow-md shadow-emerald-500/25' 
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : isDark
                  ? 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                  : 'bg-white/80 text-slate-700 border-slate-200/90 hover:bg-white hover:text-slate-900 shadow-sm'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {isActive && <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-slate-950' : 'bg-white'}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};


