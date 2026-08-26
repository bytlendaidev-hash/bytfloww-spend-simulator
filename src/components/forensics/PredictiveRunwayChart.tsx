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

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
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
        <div className="p-4 rounded-2xl border bg-abyss-well border-abyss-border">
          <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Current Liquid Buffer</div>
          <div className="text-xl font-black font-mono mt-1 text-jade-500">
            ₹{runwayData.currentEstimatedBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-abyss-textMuted mt-0.5">Latest balance checkpoint</div>
        </div>

        <div className="p-4 rounded-2xl border bg-abyss-well border-abyss-border">
          <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Avg Daily Outflow Burn</div>
          <div className="text-xl font-black font-mono mt-1 text-pulse-500">
            ₹{runwayData.avgDailyBurnRate.toLocaleString('en-IN')}/day
          </div>
          <div className="text-[10px] text-abyss-textMuted mt-0.5">Debt servicing + lifestyle</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-telemetry-900/20 border-telemetry-500/30' : 'bg-telemetry-50 border-telemetry-200'}`}>
          <div className="text-[10px] font-bold uppercase text-telemetry-500">30-Day Forecast</div>
          <div className={`text-xl font-black font-mono mt-1 ${runwayData.thirtyDayForecastBalance >= 0 ? 'text-jade-500' : 'text-pulse-500'}`}>
            {runwayData.thirtyDayForecastBalance >= 0 ? '+' : ''}₹{runwayData.thirtyDayForecastBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-telemetry-500/80 mt-0.5">Estimated end-of-month</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="text-[10px] font-bold uppercase text-ochre-500">Runway Health Status</div>
          <div className="text-lg font-black mt-1 text-ochre-500">
            {runwayData.status.replace(/_/g, ' ')}
          </div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">{runwayData.projectedRunwayDays} days without salary</div>
        </div>
      </div>

      {/* ── CONTINUOUS DAILY BALANCE PROGRESSION CHART ────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
              <span>📉</span>
              <span>17-Month Continuous Daily Balance Timeline</span>
            </h2>
            <p className="text-xs mt-0.5 text-abyss-textMuted">
              Tracking liquidity balance checkpoints across {dailyPoints.length} active transaction dates.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-jade-500">
              <span className="w-2 h-2 rounded-full bg-jade-500" />
              Salary Credits
            </span>
            <span className="flex items-center gap-1.5 text-telemetry-500">
              <span className="w-2 h-2 rounded-full bg-telemetry-500" />
              EPFO Claims
            </span>
          </div>
        </div>

        {/* SVG Curve Canvas (Solid Clean Line) */}
        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
            {/* Stroke Line (Solid Sovereign Jade) */}
            <polyline
              points={pathPoints}
              fill="none"
              className="stroke-jade-500"
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
                  className={p.isEpfoDay ? 'fill-telemetry-500 stroke-abyss-canvas' : 'fill-jade-500 stroke-abyss-canvas'}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-abyss-textMuted font-mono pt-1">
          <span>{dailyPoints[0]?.date || '01-Apr-2025'}</span>
          <span>Peak Balance: ₹{Math.round(maxBal).toLocaleString('en-IN')}</span>
          <span>{dailyPoints[dailyPoints.length - 1]?.date || '25-Aug-2026'}</span>
        </div>
      </div>

      {/* ── 90-DAY PREDICTIVE RUNWAY FORECAST TRAJECTORY ──────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
          <span>🔮</span>
          <span>90-Day Predictive Cash Flow Trajectory</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl border bg-abyss-well border-abyss-border">
            <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Day 30 Horizon</div>
            <div className="text-lg font-black font-mono mt-1 text-abyss-textPrimary">
              ₹{runwayData.thirtyDayForecastBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-abyss-textMuted mt-0.5">Post monthly salary cycle</div>
          </div>
          <div className="p-4 rounded-2xl border bg-abyss-well border-abyss-border">
            <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Day 60 Horizon</div>
            <div className="text-lg font-black font-mono mt-1 text-abyss-textPrimary">
              ₹{runwayData.sixtyDayForecastBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-abyss-textMuted mt-0.5">Expected debt rollover delta</div>
          </div>
          <div className="p-4 rounded-2xl border bg-abyss-well border-abyss-border">
            <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Day 90 Horizon</div>
            <div className="text-lg font-black font-mono mt-1 text-abyss-textPrimary">
              ₹{runwayData.ninetyDayForecastBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-abyss-textMuted mt-0.5">Quarterly liquidity posture</div>
          </div>
        </div>
      </div>
    </div>
  );
};
