import React from 'react';
import { SpendSnapshot } from '../types';

interface SpendTrendsTabProps {
  snapshot: SpendSnapshot;
  isDark?: boolean;
  onSelectPeriod: (monthKey: string) => void;
}

export const SpendTrendsTab: React.FC<SpendTrendsTabProps> = ({
  snapshot,
  isDark = true,
}) => {
  // Aggregate real daily spend from snapshot events
  const debits = (snapshot.filteredEvents || []).filter(e => e.direction === 'OUTFLOW' && e.economicType !== 'REFUND');
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

  const maxDaySpend = Math.max(1, ...days.map(d => d.spend), snapshot.highestSpendDay || 1);
  const lowestDaySpend = Math.min(...days.filter(d => d.spend > 0).map(d => d.spend), snapshot.totalSpend > 0 ? 6 : 0);

  // Compute cumulative spending curve points
  let runningTotal = 0;
  const cumulativePoints = days.map((d, idx) => {
    runningTotal += d.spend;
    const x = Math.round((idx / (daysInPeriod - 1)) * 400);
    const y = snapshot.totalSpend > 0 ? Math.round(110 - ((runningTotal / snapshot.totalSpend) * 90)) : 100;
    return { x, y, total: runningTotal };
  });

  const svgLineD = `M 0 110 ` + cumulativePoints.map(p => `L ${p.x} ${p.y}`).join(' ');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. DAILY SPENDING ACTIVITY ─────────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-jade-500">📊</span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
              Daily Spending Activity
            </h3>
          </div>
          <span className="text-xs text-jade-500 font-medium">
            {daysInPeriod} days tracked ({snapshot.periodLabel})
          </span>
        </div>

        {/* 31 Bars Chart Container */}
        <div className="pt-4">
          <div className="h-44 flex items-end justify-between gap-1.5 border-b border-abyss-border pb-1 relative">
            <div className="absolute top-0 left-0 text-[10px] text-abyss-textMuted font-mono">
              ₹{maxDaySpend.toLocaleString('en-IN')}
            </div>
            <div className="absolute top-1/2 left-0 text-[10px] text-abyss-textMuted font-mono">
              ₹{Math.round(maxDaySpend / 2).toLocaleString('en-IN')}
            </div>

            {days.map((d) => {
              const heightPct = maxDaySpend > 0 ? Math.max(d.spend > 0 ? 8 : 2, Math.round((d.spend / maxDaySpend) * 100)) : 4;
              const isPeak = d.spend === maxDaySpend && d.spend > 0;

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      isPeak 
                        ? 'bg-jade-500' 
                        : d.spend > 0 
                        ? 'bg-jade-500/40 hover:bg-jade-500' 
                        : 'bg-abyss-well'
                    }`}
                    title={`Day ${d.day}: ₹${d.spend.toLocaleString('en-IN')}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. CUMULATIVE SPENDING TRAJECTORY ───────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-synapse-500">📈</span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
              Cumulative Spending Trajectory
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-jade-500">
            Total: ₹{snapshot.totalSpend.toLocaleString('en-IN')}
          </span>
        </div>

        {/* SVG Line Chart (Solid Zero Gradient) */}
        <div className="pt-2">
          <svg className="w-full h-40" viewBox="0 0 400 120">
            <path d={svgLineD} fill="none" className="stroke-jade-500" strokeWidth="2.5" />
            <circle cx="400" cy={cumulativePoints[cumulativePoints.length - 1]?.y || 20} r="4.5" className="fill-jade-500 stroke-abyss-canvas" strokeWidth="2" />
          </svg>

          <div className="flex justify-between text-[11px] font-mono pt-2 font-medium text-abyss-textMuted">
            <span>Day 1: ₹0</span>
            <span className="text-jade-500">Day {daysInPeriod}: ₹{snapshot.totalSpend.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* ── 3. VELOCITY & SPENDING BOUNDS ───────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-base text-synapse-500">🌀</span>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
            Velocity & Spending Bounds
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Daily Avg */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-abyss-well border border-abyss-border">
            <span className="text-xs font-bold uppercase tracking-wider text-abyss-textMuted block">Daily Avg Velocity</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-jade-500 mt-1">
              ₹{snapshot.dailyAvgSpend.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Highest Day */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-abyss-well border border-abyss-border">
            <span className="text-xs font-bold uppercase tracking-wider text-abyss-textMuted block">Peak Spending Day</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-pulse-500 mt-1">
              ₹{snapshot.highestSpendDay.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Lowest Day */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-abyss-well border border-abyss-border">
            <span className="text-xs font-bold uppercase tracking-wider text-abyss-textMuted block">Floor Spending Day</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-abyss-textPrimary mt-1">
              ₹{lowestDaySpend.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
