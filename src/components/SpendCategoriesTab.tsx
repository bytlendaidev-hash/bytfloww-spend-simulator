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
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── 1. SPENDS BY CATEGORY DONUT CHART CARD ──────────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border backdrop-blur-2xl shadow-2xl transition ${
        isDark ? 'bg-[#10181E]/85 border-white/[0.08] shadow-black/60' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Spends by Category
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Total Spend • August 2026
            </span>
          </div>

          <button className={`flex items-center gap-1 px-4 py-2 rounded-2xl text-xs font-black border transition ${
            isDark ? 'bg-white/[0.05] border-white/[0.08] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span>📅 This Month</span>
            <span className="text-[10px]">▼</span>
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
                stroke={isDark ? '#1E293B' : '#F1F5F9'}
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
              <span className={`text-lg font-black font-mono ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                ₹{Math.round(totalSpend).toLocaleString('en-IN')}
              </span>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total
              </span>
            </div>
          </div>

          {/* Right Progress Rows */}
          <div className="sm:col-span-7 space-y-3">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{cat.pct}%</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <div 
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. CATEGORY DIRECTORY ───────────────────────────────────────── */}
      <div className={`p-6 rounded-[28px] border space-y-4 ${
        isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Category Directory
          </h3>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sort by: <strong className="cursor-pointer">Amount ▼</strong>
          </span>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const isExpanded = expandedCategory === cat.category;
            const catEvents = isExpanded ? getCategoryEvents(cat.category) : [];

            return (
              <div
                key={cat.category}
                className={`p-4 rounded-2xl border transition ${
                  isDark ? 'bg-[#0B1217] border-white/5' : 'bg-[#F8FAFC] border-slate-200/80'
                }`}
              >
                <div 
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                  className="cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        {cat.category.slice(0, 1)}
                      </div>
                      <div>
                        <div className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                          {cat.category}
                        </div>
                        <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {cat.eventCount} spends
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-xs sm:text-sm font-black font-mono ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                          ₹{cat.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] font-bold" style={{ color: cat.color }}>
                          {cat.pct}%
                        </div>
                      </div>
                      <span className={`text-slate-400 text-xs font-bold transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        ›
                      </span>
                    </div>
                  </div>

                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                    <div 
                      style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Expanded Sub-transactions */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
                    {catEvents.map(e => (
                      <div 
                        key={e.id}
                        onClick={() => onSelectEvent(e)}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs ${
                          isDark ? 'bg-[#101920] hover:bg-white/5' : 'bg-white hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <div>
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{e.merchant}</div>
                          <div className="text-[10px] text-slate-400">{e.dateFormatted} • {e.paymentMode}</div>
                        </div>
                        <div className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                          ₹{e.amount.toLocaleString('en-IN')}
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
