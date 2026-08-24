import React from 'react';
import { SpendSnapshot } from '../types';

interface SpendTrendsTabProps {
  snapshot: SpendSnapshot;
  isDark: boolean;
  onSelectPeriod: (monthKey: string) => void;
}

export const SpendTrendsTab: React.FC<SpendTrendsTabProps> = ({
  snapshot,
  isDark,
}) => {
  // Aggregate real daily spend from snapshot events
  const debits = snapshot.filteredEvents.filter(e => e.direction === 'OUTFLOW' && e.economicType !== 'REFUND');
  const daySpendMap = new Map<number, number>();

  for (const d of debits) {
    const day = new Date(d.timestamp).getDate();
    daySpendMap.set(day, (daySpendMap.get(day) || 0) + d.amount);
  }

  const daysInPeriod = 31;
  const days = Array.from({ length: daysInPeriod }, (_, i) => {
    const dayNum = i + 1;
    const spend = Math.round(daySpendMap.get(dayNum) || 0);
    return { day: dayNum, spend };
  });

  const maxDaySpend = Math.max(1, ...days.map(d => d.spend), snapshot.highestSpendDay);
  const lowestDaySpend = Math.min(...days.filter(d => d.spend > 0).map(d => d.spend), snapshot.totalSpend > 0 ? 6 : 0);

  // Compute cumulative spending curve points
  let runningTotal = 0;
  const cumulativePoints = days.map((d, idx) => {
    runningTotal += d.spend;
    const x = Math.round((idx / (daysInPeriod - 1)) * 400);
    const y = snapshot.totalSpend > 0 ? Math.round(110 - ((runningTotal / snapshot.totalSpend) * 90)) : 100;
    return { x, y, total: runningTotal };
  });

  const svgPathD = `M 0 110 ` + cumulativePoints.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L 400 120 L 0 120 Z`;
  const svgLineD = `M 0 110 ` + cumulativePoints.map(p => `L ${p.x} ${p.y}`).join(' ');

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── 1. DAILY SPENDING ACTIVITY ─────────────────────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-4 backdrop-blur-2xl shadow-2xl transition ${
        isDark ? 'bg-[#10181E]/85 border-white/[0.08] shadow-black/60' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#00F2FE]">📊</span>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Daily Spending Activity
            </h3>
          </div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {daysInPeriod} days tracked ({snapshot.periodLabel})
          </span>
        </div>

        {/* 31 Bars Chart Container */}
        <div className="pt-4">
          <div className="h-44 flex items-end justify-between gap-1 border-b border-slate-200 dark:border-white/10 pb-1 relative">
            <div className="absolute top-2 left-0 text-[10px] text-slate-400 font-mono">
              ₹{maxDaySpend.toLocaleString('en-IN')}
            </div>
            <div className="absolute top-1/2 left-0 text-[10px] text-slate-400 font-mono">
              ₹{Math.round(maxDaySpend / 2).toLocaleString('en-IN')}
            </div>

            {days.map((d) => {
              const heightPct = maxDaySpend > 0 ? Math.max(d.spend > 0 ? 8 : 2, Math.round((d.spend / maxDaySpend) * 100)) : 4;
              const isPeak = d.spend === maxDaySpend && d.spend > 0;

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isPeak 
                        ? 'bg-[#00BFA5] shadow-lg shadow-[#00BFA5]/50' 
                        : d.spend > 0 
                        ? 'bg-[#00BFA5]/80' 
                        : isDark ? 'bg-slate-700/40' : 'bg-slate-200'
                    }`}
                    title={`Day ${d.day}: ₹${d.spend.toLocaleString('en-IN')}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. CUMULATIVE SPENDING AREA CHART ───────────────────────────── */}
      <div className={`p-6 rounded-[28px] border space-y-3 ${
        isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base text-[#00BFA5]">📈</span>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Cumulative Spending
            </h3>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Period Total: ₹{snapshot.totalSpend.toLocaleString('en-IN')}
          </span>
        </div>

        {/* SVG Area Chart (Solid Fill, No Linear Gradient) */}
        <div className="pt-3">
          <svg className="w-full h-36" viewBox="0 0 400 120">
            <path d={svgPathD} fill={isDark ? 'rgba(0, 191, 165, 0.15)' : 'rgba(13, 148, 136, 0.12)'} />
            <path d={svgLineD} fill="none" stroke={isDark ? '#00BFA5' : '#0D9488'} strokeWidth="2.5" />
            <circle cx="400" cy={cumulativePoints[cumulativePoints.length - 1]?.y || 20} r="4" fill={isDark ? '#00BFA5' : '#0D9488'} stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>Day 1: ₹0</span>
            <span>Day {daysInPeriod}: ₹{snapshot.totalSpend.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* ── 3. VELOCITY & SPENDING BOUNDS ───────────────────────────────── */}
      <div className={`p-6 rounded-[28px] border space-y-4 ${
        isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base text-[#00BFA5]">🌀</span>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Velocity & Spending Bounds
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Daily Avg */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#0A2420] border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <span className={`text-[10px] block font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Daily Avg</span>
            <div className="text-sm sm:text-base font-black font-mono text-[#00BFA5] mt-1">
              ₹{snapshot.dailyAvgSpend.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Highest Day */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#2A1117] border-rose-500/20' : 'bg-rose-50/70 border-rose-200'
          }`}>
            <span className={`text-[10px] block font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Highest Day</span>
            <div className="text-sm sm:text-base font-black font-mono text-rose-500 mt-1">
              ₹{snapshot.highestSpendDay.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Lowest Day */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[10px] block font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Lowest Day</span>
            <div className={`text-sm sm:text-base font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              ₹{lowestDaySpend.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
