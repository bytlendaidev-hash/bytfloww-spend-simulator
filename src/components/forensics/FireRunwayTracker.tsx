import React, { useMemo } from 'react';
import { ForensicDataset } from '../../engine/statementForensicsData';
import { CanonicalTransaction } from '../../types';
import { calculateFireAndEmergencyHealth } from '../../engine/forensicsAdvancedEngine';

interface FireRunwayTrackerProps {
  dataset: ForensicDataset;
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const FireRunwayTracker: React.FC<FireRunwayTrackerProps> = ({
  dataset,
  transactions,
  isDark,
}) => {
  const fireHealth = useMemo(() => {
    return calculateFireAndEmergencyHealth(dataset, transactions);
  }, [dataset, transactions]);

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP FIRE & RUNWAY HUD ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-jade-900/20 border-jade-500/30' : 'bg-jade-50 border-jade-200'}`}>
          <div className="text-[10px] font-bold uppercase text-jade-500">Current Liquid Reserve</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-jade-500">
            ₹{fireHealth.currentLiquidReserve.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-jade-500/80 mt-0.5">Liquid bank balance</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-synapse-900/20 border-synapse-500/30' : 'bg-synapse-50 border-synapse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-synapse-400 light:text-synapse-700">Monthly Essential Burn</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-synapse-400 light:text-synapse-700">
            ₹{fireHealth.monthlyLifestyleBurn.toLocaleString('en-IN')}/mo
          </div>
          <div className="text-[10px] text-synapse-400/80 mt-0.5">True lifestyle cost of living</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-telemetry-900/20 border-telemetry-500/30' : 'bg-telemetry-50 border-telemetry-200'}`}>
          <div className="text-[10px] font-bold uppercase text-telemetry-500">Survival Runway</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-telemetry-500">
            {fireHealth.emergencyMonthsAvailable} Months
          </div>
          <div className="text-[10px] text-telemetry-500/80 mt-0.5">Without active income</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="text-[10px] font-bold uppercase text-ochre-500">Resilience Tier</div>
          <div className="text-lg font-black mt-1 text-ochre-500">
            {fireHealth.statusTier.replace(/_/g, ' ')}
          </div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">Emergency buffer status</div>
        </div>
      </div>

      {/* ── FIRE MILESTONE ROADMAP ────────────────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
              <span>🎯</span>
              <span>Financial Independence & Emergency Fund Roadmap</span>
            </h2>
            <p className="text-xs mt-0.5 text-abyss-textMuted">
              Benchmark milestones to achieve institutional financial resilience and debt elimination.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {fireHealth.milestones.map((ms, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                ms.isAchieved
                  ? 'bg-jade-500/10 border-jade-500/30'
                  : 'bg-abyss-well border-abyss-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                    ms.isAchieved ? 'bg-jade-500 text-abyss-canvas' : 'bg-abyss-canvas text-abyss-textMuted border border-abyss-border'
                  }`}>
                    {ms.isAchieved ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-abyss-textPrimary">{ms.label}</h3>
                    <p className="text-[10px] text-abyss-textMuted mt-0.5">{ms.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-black">
                    <span className={ms.isAchieved ? 'text-jade-500' : 'text-abyss-textPrimary'}>
                      ₹{ms.currentAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-abyss-textMuted"> / ₹{ms.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                    ms.isAchieved
                      ? 'bg-jade-500/20 text-jade-500'
                      : 'bg-ochre-500/20 text-ochre-500'
                  }`}>
                    {ms.isAchieved ? 'ACHIEVED 🎉' : `${ms.completionPercentage}% PROGRESS`}
                  </span>
                </div>
              </div>

              {/* Progress Bar (Solid Colors) */}
              <div className="w-full h-2 rounded-full bg-abyss-canvas overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    ms.isAchieved ? 'bg-jade-500' : 'bg-ochre-500'
                  }`}
                  style={{ width: `${Math.max(3, ms.completionPercentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
