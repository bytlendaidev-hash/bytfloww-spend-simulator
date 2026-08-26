import React, { useState, useMemo } from 'react';
import { ForensicDataset } from '../../engine/statementForensicsData';
import { CanonicalTransaction } from '../../types';
import { calculateLendersAprAnalysis, generateDebtFreedomPlan } from '../../engine/forensicsAdvancedEngine';

interface DebtFreedomSimulatorProps {
  dataset: ForensicDataset;
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const DebtFreedomSimulator: React.FC<DebtFreedomSimulatorProps> = ({
  dataset,
  transactions,
  isDark,
}) => {
  const [strategy, setStrategy] = useState<'AVALANCHE' | 'SNOWBALL'>('AVALANCHE');
  const [extraPayment, setExtraPayment] = useState<number>(5000);

  const aprAnalyses = useMemo(() => {
    return calculateLendersAprAnalysis(dataset, transactions);
  }, [dataset, transactions]);

  const payoffPlan = useMemo(() => {
    return generateDebtFreedomPlan(aprAnalyses, extraPayment, strategy);
  }, [aprAnalyses, extraPayment, strategy]);

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP KPI SUMMARY CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
          <div className="text-[10px] font-bold uppercase text-rose-400">Total Revolving Debt</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-rose-400">
            ₹{payoffPlan.totalDebtRemaining.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">{aprAnalyses.length} lenders analyzed</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[10px] font-bold uppercase text-emerald-400">Projected Interest Saved</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-emerald-400">
            ₹{payoffPlan.projectedInterestSaved.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">via {strategy} payoff</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">Debt-Free Freedom Date</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-indigo-400">
            {payoffPlan.projectedPayoffMonths} Months
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">{payoffPlan.payoffSchedule[payoffPlan.payoffSchedule.length - 1]?.monthLabel || 'Projected'}</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">Peak Effective APR</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-amber-400">
            {aprAnalyses[0]?.effectiveAnnualizedApr || 48}%
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">{aprAnalyses[0]?.lenderName || 'Short-term credit'}</div>
        </div>
      </div>

      {/* ── HIDDEN APR FORENSIC MATRIX ────────────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>🧮</span>
              <span>Hidden Annualized APR & Financing Cost Matrix</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Calculated from exact day-count velocity between loan disbursals and repayment debits.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="p-3">Lender & Facility</th>
                <th className="p-3 text-right">Total Borrowed</th>
                <th className="p-3 text-right">Total Repaid</th>
                <th className="p-3 text-right">Extra Paid / Fees</th>
                <th className="p-3 text-center">Avg Turnaround</th>
                <th className="p-3 text-right">Effective APR</th>
                <th className="p-3 text-center">Risk Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {aprAnalyses.map((l) => (
                <tr key={l.lenderId} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                  <td className="p-3">
                    <div className="font-bold">{l.lenderName}</div>
                    <div className="text-[10px] text-slate-400">{l.productType}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    ₹{l.totalBorrowed.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-rose-400">
                    ₹{l.totalRepaid.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400">
                    ₹{l.financingFeeOrInterest.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-center font-mono text-[11px]">
                    {l.avgTurnaroundDays} days
                  </td>
                  <td className="p-3 text-right font-mono font-black text-sm text-rose-400">
                    {l.effectiveAnnualizedApr.toFixed(1)}%
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      l.riskClassification === 'EXTREME_PREDATORY'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : l.riskClassification === 'HIGH_INTEREST'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {l.riskClassification.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INTERACTIVE PAYOFF SIMULATOR ──────────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-5`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>🎯</span>
              <span>Debt Freedom Payoff Simulator</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Optimize repayment velocity and see how extra monthly allocation slashes interest costs.
            </p>
          </div>

          <div className={`p-1 rounded-2xl border flex gap-1 ${isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setStrategy('AVALANCHE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                strategy === 'AVALANCHE'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              🏔️ Avalanche (High APR First)
            </button>
            <button
              onClick={() => setStrategy('SNOWBALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                strategy === 'SNOWBALL'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              ⛄ Snowball (Small Balance First)
            </button>
          </div>
        </div>

        {/* Extra Payment Slider */}
        <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider">Extra Monthly Debt Allocation</span>
            <span className="font-mono font-black text-sm text-emerald-400">+₹{extraPayment.toLocaleString('en-IN')}/mo</span>
          </div>
          <input
            type="range"
            min={0}
            max={30000}
            step={1000}
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>+₹0 (Minimum EMIs)</span>
            <span>+₹15,000/mo</span>
            <span>+₹30,000/mo (Max Acceleration)</span>
          </div>
        </div>

        {/* Month-by-Month Payoff Trajectory */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Payoff Trajectory & Milestones</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {payoffPlan.payoffSchedule.slice(0, 12).map((step) => (
              <div
                key={step.monthIndex}
                className={`p-3 rounded-2xl border text-center space-y-1 ${
                  step.clearedLenders.length > 0
                    ? (isDark ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300')
                    : (isDark ? 'bg-black/20 border-white/[0.06]' : 'bg-white border-slate-200')
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400">{step.monthLabel}</div>
                <div className="text-xs font-mono font-black text-rose-400">₹{step.totalBalance.toLocaleString('en-IN')}</div>
                {step.clearedLenders.length > 0 ? (
                  <div className="text-[9px] font-black text-emerald-400 truncate">
                    🎉 {step.clearedLenders[0]} Cleared!
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-500">Principal: ₹{step.principalPaidThisMonth.toLocaleString('en-IN')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
