import React from 'react';
import { SpendSnapshot, SpendTab } from '../types';

interface SpendHeaderProps {
  snapshot: SpendSnapshot;
  isDark: boolean;
  activeTab: SpendTab;
  onSelectTab: (tab: SpendTab) => void;
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
  onSelectTab,
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
    <div className="space-y-4 mb-6">
      {/* ── TOP ANDROID APP BAR ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Back Arrow + Logo + Spend Intelligence Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('OVERVIEW')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border font-black text-base transition ${
              isDark 
                ? 'bg-[#152028] border-[#273B49] text-slate-200 hover:bg-[#1C2C38]' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
          >
            ‹
          </button>

          <div className="flex items-center gap-2.5">
            {/* Solid BytFloww Logo */}
            <div className="w-10 h-10 rounded-2xl bg-[#00BFA5] flex items-center justify-center shadow-md">
              <span className="text-slate-950 font-black text-sm">▷</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base sm:text-lg font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Spend Intelligence
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#00BFA5]" />
                <span className={`font-black ${isDark ? 'text-[#00F2FE]' : 'text-teal-800'}`}>
                  Syncing {totalParsedCount.toLocaleString('en-IN')}/3841 (Ready)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ask AI Copilot Bubble Button */}
          <button
            onClick={onOpenCopilot}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition ${
              isDark 
                ? 'bg-[#152028] border-[#273B49] text-slate-200 hover:bg-[#1C2C38]' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
            title="Ask AI Copilot"
          >
            💬
          </button>

          {/* Security Shield */}
          <button
            onClick={onOpenDiagnostics}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition ${
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
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition text-sm ${
              isDark 
                ? 'bg-[#152028] border-[#273B49] text-slate-200 hover:bg-[#1C2C38]' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
            title="Theme Toggle"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Profile TU Avatar */}
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-black text-xs shadow-sm ${
            isDark ? 'bg-[#1E2E3B] border-[#2E4558] text-white' : 'bg-slate-800 border-slate-900 text-white'
          }`}>
            TU
          </div>
        </div>
      </div>

      {/* ── ROW 1: DATE HORIZON FILTER PILLS ──────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {dateRanges.map((range) => {
          const isSelected = snapshot.periodKey === range.key || (range.key === '2026-08' && snapshot.periodKey === '2026-08');
          return (
            <button
              key={range.key}
              onClick={() => onSelectPeriod(range.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition border ${
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
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap border transition ${
            isDark 
              ? 'bg-[#152028] text-slate-300 border-[#273B49] hover:bg-[#1C2C38]' 
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-sm'
          }`}
        >
          <span>⚡</span>
          <span>Filters</span>
        </button>
      </div>

      {/* ── ROW 2: MAIN SUB-TABS (OVERVIEW, TRANSACTIONS, CATEGORIES...) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition border ${
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
