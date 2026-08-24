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

  const mainTabs: Array<{ id: SpendTab; label: string }> = [
    { id: 'OVERVIEW', label: 'Overview' },
    { id: 'TRANSACTIONS', label: 'Transactions' },
    { id: 'CATEGORIES', label: 'Categories' },
    { id: 'MERCHANTS', label: 'Merchants' },
    { id: 'COMMITMENTS', label: 'Commitments' },
    { id: 'TRENDS', label: 'Trends' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
      {/* ── TOP MODULE SELECTOR BAR (SMS INTELLIGENCE vs BANK STATEMENTS) ── */}
      {onSelectModule && (
        <div className={`p-1.5 rounded-2xl border flex items-center justify-between gap-2 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => onSelectModule('SMS_INTELLIGENCE')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
              activeModule === 'SMS_INTELLIGENCE'
                ? isDark
                  ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5] shadow-sm'
                  : 'bg-white text-slate-950 border-slate-300 shadow-sm'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <span>📱</span>
            <span>SMS Spend Intelligence</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              activeModule === 'SMS_INTELLIGENCE'
                ? 'bg-black/20 text-slate-950 font-bold'
                : 'bg-white/10 text-slate-400'
            }`}>
              {totalParsedCount} SMS
            </span>
          </button>

          <button
            onClick={() => onSelectModule('BANK_STATEMENTS')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
              activeModule === 'BANK_STATEMENTS'
                ? isDark
                  ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5] shadow-sm'
                  : 'bg-white text-slate-950 border-slate-300 shadow-sm'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <span>🏛️</span>
            <span>Bank Statement Forensics</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
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
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border font-black text-base transition flex-shrink-0 ${
              isDark 
                ? 'bg-[#152028] border-[#273B49] text-slate-200 hover:bg-[#1C2C38]' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
          >
            ‹
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Solid BytFloww Logo */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#00BFA5] flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-slate-950 font-black text-sm">▷</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`text-sm sm:text-lg font-black tracking-tight truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Spend Intelligence
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
                <span className={`font-black truncate ${isDark ? 'text-[#00F2FE]' : 'text-teal-800'}`}>
                  {totalParsedCount.toLocaleString('en-IN')} SMS (Live)
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
              className={`px-3 h-9 sm:h-10 rounded-2xl flex items-center gap-1.5 border font-black text-xs transition ${
                isDark 
                  ? 'bg-[#152028] border-[#273B49] text-[#00F2FE] hover:bg-[#1C2C38]' 
                  : 'bg-white border-slate-300 text-teal-800 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <span>🏛️</span>
              <span className="hidden sm:inline">Statement Hub</span>
            </button>
          )}

          {/* Ask AI Copilot Bubble Button */}
          <button
            onClick={onOpenCopilot}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition text-sm ${
              isDark 
                ? 'bg-[#152028] border-[#273B49] text-slate-200 hover:bg-[#1C2C38]' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
            title="Ask AI Copilot"
          >
            💬
          </button>

          {/* Security Shield / Diagnostics */}
          <button
            onClick={onOpenDiagnostics}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition text-sm ${
              isDark 
                ? 'bg-[#152028] border-[#273B49] text-emerald-400 hover:bg-[#1C2C38]' 
                : 'bg-white border-slate-300 text-teal-700 hover:bg-slate-100 shadow-sm'
            }`}
            title="Security Shield & Diagnostics"
          >
            🛡️
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition text-xs sm:text-sm ${
              isDark 
                ? 'bg-[#152028] border-[#273B49] text-slate-200 hover:bg-[#1C2C38]' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
            title="Theme Toggle"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Profile TU Avatar */}
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center font-black text-xs shadow-sm ${
            isDark ? 'bg-[#1E2E3B] border-[#2E4558] text-white' : 'bg-slate-800 border-slate-900 text-white'
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
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-black whitespace-nowrap transition border flex-shrink-0 ${
                isSelected
                  ? isDark 
                    ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5] shadow-md shadow-teal-500/20' 
                    : 'bg-[#0D9488] text-white border-[#0D9488] shadow-md'
                  : isDark
                  ? 'bg-[#152028] text-slate-300 border-[#273B49] hover:bg-[#1C2C38] hover:text-white'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
              }`}
            >
              {range.label}
            </button>
          );
        })}

        {/* Filters Button */}
        <button
          onClick={onOpenFilter}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-black whitespace-nowrap border transition flex-shrink-0 ${
            isDark 
              ? 'bg-[#152028] text-slate-300 border-[#273B49] hover:bg-[#1C2C38]' 
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-sm'
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
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs font-black whitespace-nowrap transition border flex-shrink-0 ${
                isActive
                  ? isDark 
                    ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5] shadow-md shadow-teal-500/20' 
                    : 'bg-[#0D9488] text-white border-[#0D9488] shadow-md'
                  : isDark
                  ? 'bg-[#152028] text-slate-300 border-[#273B49] hover:bg-[#1C2C38] hover:text-white'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
              }`}
            >
              {isActive && <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-slate-950' : 'bg-white'}`} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
