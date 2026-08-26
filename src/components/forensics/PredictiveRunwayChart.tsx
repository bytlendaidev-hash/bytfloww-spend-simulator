import React, { useMemo } from 'react';
import { ForensicDataset } from '../../engine/statementForensicsData';
import { CanonicalTransaction } from '../../types';
import { buildDailyBalanceProgression, calculatePredictiveRunway } from '../../engine/forensicsAdvancedEngine';

interface PredictiveRunwayChartProps {
  dataset: ForensicDataset;
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const PredictiveRunwayChart: React.FC<PredictiveRunwayChartProps> = ({
  dataset,
  transactions,
  isDark,
}) => {
  const dailyPoints = useMemo(() => {
    return buildDailyBalanceProgression(transactions);
  }, [transactions]);

  const runwayData = useMemo(() => {
    return calculatePredictiveRunway(dataset, dailyPoints);
  }, [dataset, dailyPoints]);

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  // Find max and min balance for SVG scaling
  const balances = dailyPoints.map(p => p.balance);
  const maxBal = Math.max(...balances, 50000);
  const minBal = Math.min(...balances, 0);
  const range = Math.max(1, maxBal - minBal);

  // Sample points for clean SVG line
  const step = Math.max(1, Math.floor(dailyPoints.length / 80));
  const sampled = dailyPoints.filter((_, i) => i % step === 0);

  const svgWidth = 800;
  const svgHeight = 220;

  const pathPoints = sampled.map((p, idx) => {
    const x = (idx / Math.max(1, sampled.length - 1)) * svgWidth;
    const y = svgHeight - ((p.balance - minBal) / range) * (svgHeight - 40) - 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── TOP PREDICTIVE RUNWAY HUD ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-bold uppercase text-slate-400">Current Liquid Buffer</div>
          <div className="text-xl font-black font-mono mt-1 text-emerald-400">
            ₹{runwayData.currentEstimatedBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Latest balance checkpoint</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-bold uppercase text-slate-400">Avg Daily Outflow Burn</div>
          <div className="text-xl font-black font-mono mt-1 text-rose-400">
            ₹{runwayData.avgDailyBurnRate.toLocaleString('en-IN')}/day
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Debt servicing + lifestyle</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">30-Day Forecast</div>
          <div className={`text-xl font-black font-mono mt-1 ${runwayData.thirtyDayForecastBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {runwayData.thirtyDayForecastBalance >= 0 ? '+' : ''}₹{runwayData.thirtyDayForecastBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">Estimated end-of-month</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">Runway Health Status</div>
          <div className="text-lg font-black mt-1 text-amber-400">
            {runwayData.status.replace(/_/g, ' ')}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">{runwayData.projectedRunwayDays} days without salary</div>
        </div>
      </div>

      {/* ── CONTINUOUS DAILY BALANCE PROGRESSION CHART ────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>📉</span>
              <span>17-Month Continuous Daily Balance Timeline</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tracking liquidity balance checkpoints across {dailyPoints.length} active transaction dates.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Salary Credits
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              EPFO Claims
            </span>
          </div>
        </div>

        {/* SVG Curve Canvas */}
        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
            <defs>
              <linearGradient id="balanceGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? '#10B981' : '#059669'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isDark ? '#10B981' : '#059669'} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <polygon
              points={`0,${svgHeight} ${pathPoints} ${svgWidth},${svgHeight}`}
              fill="url(#balanceGlowGrad)"
            />

            {/* Stroke Line */}
            <polyline
              points={pathPoints}
              fill="none"
              stroke={isDark ? '#10B981' : '#059669'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Milestone annotation markers */}
            {sampled.map((p, idx) => {
              if (!p.isSalaryDay && !p.isEpfoDay) return null;
              const x = (idx / Math.max(1, sampled.length - 1)) * svgWidth;
              const y = svgHeight - ((p.balance - minBal) / range) * (svgHeight - 40) - 20;

              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="4.5"
                  fill={p.isEpfoDay ? '#00F2FE' : '#10B981'}
                  stroke={isDark ? '#080D11' : '#FFFFFF'}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
          <span>{dailyPoints[0]?.date || '01-Apr-2025'}</span>
          <span>Peak Balance: ₹{Math.round(maxBal).toLocaleString('en-IN')}</span>
          <span>{dailyPoints[dailyPoints.length - 1]?.date || '25-Aug-2026'}</span>
        </div>
      </div>

      {/* ── 90-DAY PREDICTIVE RUNWAY FORECAST TRAJECTORY ──────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <h2 className="text-base font-black flex items-center gap-2 font-heading">
          <span>🔮</span>
          <span>90-Day Predictive Cash Flow Trajectory</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-[10px] font-bold uppercase text-slate-400">Day 30 Horizon</div>
            <div className="text-lg font-black font-mono mt-1 text-slate-200">
              ₹{runwayData.thirtyDayForecastBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Post monthly salary cycle</div>
          </div>
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-[10px] font-bold uppercase text-slate-400">Day 60 Horizon</div>
            <div className="text-lg font-black font-mono mt-1 text-slate-200">
              ₹{runwayData.sixtyDayForecastBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Expected debt rollover delta</div>
          </div>
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-[10px] font-bold uppercase text-slate-400">Day 90 Horizon</div>
            <div className="text-lg font-black font-mono mt-1 text-slate-200">
              ₹{runwayData.ninetyDayForecastBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Quarterly liquidity posture</div>
          </div>
        </div>
      </div>
    </div>
  );
};
