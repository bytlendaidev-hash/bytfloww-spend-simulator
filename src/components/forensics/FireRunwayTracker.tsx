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

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP FIRE & RUNWAY HUD ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[10px] font-bold uppercase text-emerald-400">Current Liquid Reserve</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-emerald-400">
            ₹{fireHealth.currentLiquidReserve.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Liquid bank balance</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-purple-950/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
          <div className="text-[10px] font-bold uppercase text-purple-400">Monthly Essential Burn</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-purple-400">
            ₹{fireHealth.monthlyLifestyleBurn.toLocaleString('en-IN')}/mo
          </div>
          <div className="text-[10px] text-purple-400/80 mt-0.5">True lifestyle cost of living</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">Survival Runway</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-indigo-400">
            {fireHealth.emergencyMonthsAvailable} Months
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">Without active income</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">Resilience Tier</div>
          <div className="text-lg font-black mt-1 text-amber-400">
            {fireHealth.statusTier.replace(/_/g, ' ')}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Emergency buffer status</div>
        </div>
      </div>

      {/* ── FIRE MILESTONE ROADMAP ────────────────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>🎯</span>
              <span>Financial Independence & Emergency Fund Roadmap</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                  ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                  : (isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200')
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                    ms.isAchieved ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                  }`}>
                    {ms.isAchieved ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-black">{ms.label}</h3>
                    <p className="text-[10px] opacity-70 mt-0.5">{ms.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-black">
                    <span className={ms.isAchieved ? 'text-emerald-400' : 'text-slate-300'}>
                      ₹{ms.currentAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-500"> / ₹{ms.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                    ms.isAchieved
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {ms.isAchieved ? 'ACHIEVED 🎉' : `${ms.completionPercentage}% PROGRESS`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800/40 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    ms.isAchieved ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-indigo-500'
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
