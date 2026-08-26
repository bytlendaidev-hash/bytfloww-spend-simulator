import React, { useState } from 'react';
import { CategoryBreakdownItem, FinancialEvent } from '../types';

interface SpendCategoriesTabProps {
  categories: CategoryBreakdownItem[];
  events: FinancialEvent[];
  isDark: boolean;
  totalSpend: number;
  onSelectEvent: (event: FinancialEvent) => void;
}

export const SpendCategoriesTab: React.FC<SpendCategoriesTabProps> = ({
  categories,
  events,
  isDark,
  totalSpend,
  onSelectEvent,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getCategoryEvents = (catName: string) => {
    return events.filter(e => e.category === catName && e.direction === 'OUTFLOW');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8 animate-emergence">
      {/* ── 1. SPENDS BY CATEGORY DONUT CHART CARD ──────────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border transition-all duration-300 backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/80 border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white/85 border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-base font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Spends by Category
            </h3>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Spend • August 2026 Live Analysis
            </span>
          </div>

          <button className={`flex items-center gap-1 px-3.5 py-1.5 rounded-2xl text-xs font-black border transition backdrop-blur-md ${
            isDark ? 'bg-white/[0.05] border-white/[0.08] text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <span>📅 August 2026</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Ring with Center Total */}
          <div className="sm:col-span-5 flex items-center justify-center relative">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke={isDark ? '#1E293B' : '#E2E8F0'}
                strokeWidth="12"
              />
              {/* Dynamic segments */}
              {(() => {
                let accumulatedPct = 0;
                return categories.map((cat) => {
                  const strokeDasharray = `${cat.pct * 2.388} 238.8`;
                  const strokeDashoffset = `-${accumulatedPct * 2.388}`;
                  accumulatedPct += cat.pct;

                  return (
                    <circle
                      key={cat.category}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                });
              })()}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-lg font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ₹{Math.round(totalSpend).toLocaleString('en-IN')}
              </span>
              <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Spend
              </span>
            </div>
          </div>

          {/* Right Progress Rows */}
          <div className="sm:col-span-7 space-y-3">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                    <span className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cat.pct}%</span>
                    <span className={`font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-black/40' : 'bg-slate-100'}`}>
                  <div 
                    style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. CATEGORY DIRECTORY ───────────────────────────────────────── */}
      <div className={`p-6 rounded-[28px] border space-y-4 transition-all duration-300 backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/80 border-white/[0.08] shadow-lg shadow-black/40' : 'bg-white/85 border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Category Directory
          </h3>
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sorted by Total Spend
          </span>
        </div>

        <div className="space-y-2.5">
          {categories.map((cat) => {
            const isExpanded = expandedCategory === cat.category;
            const catEvents = isExpanded ? getCategoryEvents(cat.category) : [];

            return (
              <div
                key={cat.category}
                className={`p-4 rounded-2xl border transition-all duration-150 backdrop-blur-xl ${
                  isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]' : 'bg-slate-50/80 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div 
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                  className="cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm"
                        style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                      >
                        {cat.category.slice(0, 1)}
                      </div>
                      <div>
                        <div className={`text-xs sm:text-sm font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {cat.category}
                        </div>
                        <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {cat.eventCount} transactions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-xs sm:text-sm font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          ₹{cat.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] font-black" style={{ color: cat.color }}>
                          {cat.pct}%
                        </div>
                      </div>
                      <span className={`text-slate-400 text-sm font-black transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}>
                        ›
                      </span>
                    </div>
                  </div>

                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-black/40' : 'bg-slate-200'}`}>
                    <div 
                      style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: cat.color }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Expanded Sub-transactions */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-2 animate-fade-in">
                    {catEvents.map(e => (
                      <div 
                        key={e.id}
                        onClick={() => onSelectEvent(e)}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs transition backdrop-blur-md ${
                          isDark ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'bg-white hover:bg-slate-100 border border-slate-200/80 shadow-sm'
                        }`}
                      >
                        <div>
                          <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.merchant}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{e.dateFormatted} • {e.paymentMode}</div>
                        </div>
                        <div className="font-mono font-black text-rose-500 dark:text-rose-400">
                          -₹{e.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
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


