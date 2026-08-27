import React from 'react';
import { SpendSnapshot, SpendTab, ActiveModule } from '../types';

interface SpendHeaderProps {
  snapshot: SpendSnapshot;
  activeTab: SpendTab;
  activeModule?: ActiveModule;
  isDark?: boolean;
  onSelectTab: (tab: SpendTab) => void;
  onSelectModule?: (module: ActiveModule) => void;
  onSelectPeriod: (periodKey: string) => void;
  onOpenFilter: () => void;
  onOpenCopilot: () => void;
  onOpenUpload: () => void;
  onOpenDiagnostics: () => void;
  totalParsedCount: number;
}

export const SpendHeader: React.FC<SpendHeaderProps> = ({
  snapshot,
  activeTab,
  onSelectTab,
  onSelectPeriod,
  onOpenFilter,
  onOpenCopilot,
  onOpenDiagnostics,
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

  const isSurplus = snapshot.netCashflow >= 0;

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 animate-emergence">
      {/* ── 1. TOP TITLE & FINANCIAL TELEMETRY COMMAND BAR ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-[22px] bg-abyss-card border border-abyss-border relative overflow-hidden shadow-lg">
        {/* Left Section: Brand Title & Reconciled Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-[#1AE893] text-lg sm:text-xl font-bold shrink-0 shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-abyss-textPrimary font-fraunces">
                Capital <span className="text-[#00884E] dark:text-[#1AE893]">Intelligence</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#1AE893] border border-emerald-500/30 uppercase tracking-wider">
                ● LIVE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-abyss-textMuted font-medium flex items-center gap-1.5 sm:gap-2 mt-0.5">
              <span>{totalParsedCount.toLocaleString('en-IN')} Reconciled</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-[#1AE893] font-semibold">{snapshot.periodLabel}</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Live Telemetry Tickers & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Net Flow Ticker */}
          <div className="px-3 py-1.5 rounded-xl bg-abyss-well border border-abyss-border flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-abyss-textMuted uppercase font-bold">Net Flow</span>
            <span className={`font-mono font-bold ${isSurplus ? 'text-[#00884E] dark:text-[#1AE893]' : 'text-rose-500'}`}>
              {isSurplus ? '+' : '-'}₹{Math.abs(snapshot.netCashflow).toLocaleString('en-IN')}
            </span>
          </div>

          {/* AI Copilot Button */}
          <button
            onClick={onOpenCopilot}
            className="spatial-btn px-3 py-1.5 text-xs flex items-center gap-1.5 border-amber-500/30 text-amber-600 dark:text-[#E0A83F] bg-amber-500/10 hover:bg-amber-500/20"
            title="Ask AI Copilot"
          >
            <span>✨</span>
            <span className="font-bold hidden xs:inline">AI Copilot</span>
          </button>

          {/* Filter Modal Trigger */}
          <button
            onClick={onOpenFilter}
            className="spatial-btn px-3 py-1.5 text-xs flex items-center gap-1.5 border-amber-500/30 text-amber-600 dark:text-[#E0A83F] bg-amber-500/10 hover:bg-amber-500/20"
            title="Filter Transactions"
          >
            <span>⚡</span>
            <span>Filters</span>
          </button>

          {/* Diagnostics Button */}
          <button
            onClick={onOpenDiagnostics}
            className="spatial-btn w-8 h-8 flex items-center justify-center text-xs border-abyss-border"
            title="Security Diagnostics"
          >
            🛡️
          </button>
        </div>
      </div>

      {/* ── 2. DATE HORIZON FILTER PILLS (SWIPEABLE ON MOBILE) ─────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {dateRanges.map((range) => {
          const isSelected = snapshot.periodKey === range.key || (range.key === '2026-08' && snapshot.periodKey === '2026-08');
          return (
            <button
              key={range.key}
              onClick={() => onSelectPeriod(range.key)}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 rounded-full ${
                isSelected
                  ? 'btn-emerald-capsule shadow-sm'
                  : 'spatial-btn hover:border-emerald-500/30'
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      {/* ── 3. SECONDARY HORIZONTAL TAB STRIP (DESKTOP / QUICK TAB SWITCH) */}
      <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-abyss-well/60 border border-abyss-border/60 overflow-x-auto no-scrollbar max-w-full">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 ${
                isActive
                  ? 'tab-pill-active'
                  : 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-card'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
