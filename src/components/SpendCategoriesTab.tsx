import React, { useState } from 'react';
import { CategoryBreakdownItem, FinancialEvent } from '../types';
import { getCategoryColor } from '../theme/tokens';

interface SpendCategoriesTabProps {
  categories?: CategoryBreakdownItem[];
  events?: FinancialEvent[];
  isDark?: boolean;
  totalSpend?: number;
  onSelectEvent?: (event: FinancialEvent) => void;
  onSelectCategory?: (category: CategoryBreakdownItem) => void;
  snapshot?: any;
}

export const SpendCategoriesTab: React.FC<SpendCategoriesTabProps> = ({
  categories,
  events,
  isDark = true,
  totalSpend,
  onSelectEvent,
  snapshot,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const effectiveCategories: CategoryBreakdownItem[] = categories || snapshot?.categoryDistribution || [];
  const effectiveTotalSpend = totalSpend || snapshot?.totalSpend || 0;
  const effectiveEvents: FinancialEvent[] = events || snapshot?.recentEvents || [];

  const getCategoryEvents = (catName: string) => {
    return effectiveEvents.filter((e: FinancialEvent) => e.category === catName && e.direction === 'OUTFLOW');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. SPENDS BY CATEGORY DONUT CHART CARD ──────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
              Spends by Category
            </h3>
            <p className="text-xs text-abyss-textMuted font-medium">
              Total Category Allocation • Deterministic Forensic Breakdown
            </p>
          </div>

          <span className="spatial-btn px-4 py-1.5 text-xs text-abyss-textPrimary border-abyss-border">
            📅 Current Period
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center pt-2">
          {/* Donut Chart Ring with Center Total */}
          <div className="sm:col-span-5 flex items-center justify-center relative">
            <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="var(--obsidian-border, #1E2840)"
                strokeWidth="11"
              />
              {/* Dynamic solid segments */}
              {(() => {
                let accumulatedPct = 0;
                return effectiveCategories.map((cat: CategoryBreakdownItem) => {
                  const strokeDasharray = `${cat.pct * 2.388} 238.8`;
                  const strokeDashoffset = `-${accumulatedPct * 2.388}`;
                  accumulatedPct += cat.pct;
                  const catColor = getCategoryColor(cat.category, isDark).solid;

                  return (
                    <circle
                      key={cat.category}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={catColor}
                      strokeWidth="11"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  );
                });
              })()}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-abyss-textPrimary tracking-tight">
                ₹{Math.round(effectiveTotalSpend).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-abyss-textMuted font-bold uppercase tracking-wider mt-0.5">
                Total Spend
              </span>
            </div>
          </div>

          {/* Right Progress Rows */}
          <div className="sm:col-span-7 space-y-3.5">
            {effectiveCategories.slice(0, 5).map((cat: CategoryBreakdownItem) => {
              const catColor = getCategoryColor(cat.category, isDark).solid;
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: catColor }} />
                      <span className="font-semibold text-abyss-textPrimary tracking-tight">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-abyss-textMuted font-bold">{cat.pct}%</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-abyss-textPrimary">
                        ₹{cat.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-abyss-well overflow-hidden">
                    <div 
                      style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: catColor }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. CATEGORY DIRECTORY ───────────────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
            Category Directory
          </h3>
          <span className="text-xs text-abyss-textMuted font-medium">
            Sorted by Total Spend
          </span>
        </div>

        <div className="space-y-3">
          {effectiveCategories.map((cat: CategoryBreakdownItem) => {
            const isExpanded = expandedCategory === cat.category;
            const catEvents = isExpanded ? getCategoryEvents(cat.category) : [];
            const catColors = getCategoryColor(cat.category, isDark);

            return (
              <div 
                key={cat.category}
                className="rounded-[18px] bg-abyss-well border border-abyss-border overflow-hidden transition-all duration-200"
              >
                <div 
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-abyss-elevated transition"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: catColors.solid }} />
                    <div>
                      <div className="text-sm font-bold text-abyss-textPrimary">
                        {cat.category}
                      </div>
                      <span className="text-[11px] text-abyss-textMuted">
                        {cat.eventCount} transactions • {cat.pct}% of period budget
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="font-mono font-bold text-sm sm:text-base text-abyss-textPrimary block">
                        ₹{cat.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-sm text-abyss-textMuted">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-abyss-card border-t border-abyss-border space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-abyss-textMuted block px-1">
                      Recent {cat.category} Events
                    </span>
                    {catEvents.length === 0 ? (
                      <p className="text-xs text-abyss-textMuted px-1">No detailed debits logged for this period.</p>
                    ) : (
                      catEvents.slice(0, 10).map((ev) => (
                        <div 
                          key={ev.id}
                          onClick={() => onSelectEvent && onSelectEvent(ev)}
                          className="p-2.5 rounded-xl hover:bg-abyss-well flex items-center justify-between text-xs cursor-pointer"
                        >
                          <span className="text-abyss-textPrimary font-medium">{ev.merchant}</span>
                          <span className="font-mono font-bold text-pulse-500">₹{ev.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
