import React from 'react';
import { SpendSnapshot, SpendTab, ActiveModule } from '../types';

interface SpendHeaderProps {
  snapshot: SpendSnapshot;
  activeTab: SpendTab;
  activeModule?: ActiveModule;
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

  return (
    <div className="space-y-4 mb-6 animate-emergence">
      {/* ── TOP SECTION TITLE & QUICK ACTIONS ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Title and Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg font-bold shadow-sm backdrop-blur-xl">
            ⚡
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Spend Intelligence
            </h1>
            <p className="text-xs text-white/60 font-medium">
              {totalParsedCount.toLocaleString('en-IN')} Transactions Reconciled • {snapshot.periodKey}
            </p>
          </div>
        </div>

        {/* Right Action Icons (Gaze Interactive) */}
        <div className="flex items-center gap-2">
          {/* Ask AI Copilot Button */}
          <button
            onClick={onOpenCopilot}
            className="spatial-btn px-4 py-2 text-xs flex items-center gap-1.5"
            title="Ask AI Copilot"
          >
            <span>💬</span>
            <span>AI Copilot</span>
          </button>

          {/* Filter Modal Trigger */}
          <button
            onClick={onOpenFilter}
            className="spatial-btn px-4 py-2 text-xs flex items-center gap-1.5"
            title="Filter Transactions"
          >
            <span>⚡</span>
            <span>Filters</span>
          </button>

          {/* Diagnostics Button */}
          <button
            onClick={onOpenDiagnostics}
            className="spatial-btn w-9 h-9 flex items-center justify-center text-sm"
            title="Security Diagnostics"
          >
            🛡️
          </button>
        </div>
      </div>

      {/* ── ROW 1: DATE HORIZON FILTER PILLS (SWIPEABLE HORIZONTAL BAR) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {dateRanges.map((range) => {
          const isSelected = snapshot.periodKey === range.key || (range.key === '2026-08' && snapshot.periodKey === '2026-08');
          return (
            <button
              key={range.key}
              onClick={() => onSelectPeriod(range.key)}
              className={`px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSelected
                  ? 'spatial-btn-selected rounded-full'
                  : 'spatial-btn'
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      {/* ── ROW 2: MAIN TAB BAR ORNAMENT (VISIONOS SEGMENTED CONTROL) ──── */}
      <div className="flex items-center gap-1.5 p-1.5 spatial-ornament overflow-x-auto no-scrollbar w-fit">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive
                  ? 'spatial-btn-selected'
                  : 'text-white/70 hover:text-white hover:bg-white/15'
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
