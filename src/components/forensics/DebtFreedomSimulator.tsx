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

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP KPI SUMMARY CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="spatial-card p-4 sm:p-5">
          <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Revolving Debt</div>
          <div className="text-lg sm:text-2xl font-bold font-mono mt-1 text-pulse-500">
            ₹{payoffPlan.totalDebtRemaining.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-abyss-textMuted mt-0.5">{aprAnalyses.length} lenders analyzed</div>
        </div>

        <div className="spatial-card p-4 sm:p-5">
          <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Projected Interest Saved</div>
          <div className="text-lg sm:text-2xl font-bold font-mono mt-1 text-jade-500">
            ₹{payoffPlan.projectedInterestSaved.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-abyss-textMuted mt-0.5">via {strategy} payoff</div>
        </div>

        <div className="spatial-card p-4 sm:p-5">
          <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Debt-Free Freedom Date</div>
          <div className="text-lg sm:text-2xl font-bold font-mono mt-1 text-abyss-textPrimary">
            {payoffPlan.projectedPayoffMonths} Months
          </div>
          <div className="text-[10px] text-abyss-textMuted mt-0.5">{payoffPlan.payoffSchedule[payoffPlan.payoffSchedule.length - 1]?.monthLabel || 'Projected'}</div>
        </div>

        <div className="spatial-card p-4 sm:p-5">
          <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Peak Effective APR</div>
          <div className="text-lg sm:text-2xl font-bold font-mono mt-1 text-ochre-500">
            {aprAnalyses[0]?.effectiveAnnualizedApr || 48}%
          </div>
          <div className="text-[10px] text-abyss-textMuted mt-0.5">{aprAnalyses[0]?.lenderName || 'Short-term credit'}</div>
        </div>
      </div>

      {/* ── HIDDEN APR FORENSIC MATRIX ────────────────────────────────────── */}
      <div className="spatial-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
              <span>🧮</span>
              <span>Hidden Annualized APR & Financing Cost Matrix</span>
            </h2>
            <p className="text-xs text-abyss-textMuted mt-0.5">
              Calculated from exact day-count velocity between loan disbursals and repayment debits.
            </p>
          </div>
        </div>

        <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-abyss-card text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider">
              <tr className="border-b border-abyss-border">
                <th className="p-3.5">Lender & Facility</th>
                <th className="p-3.5 text-right">Total Borrowed</th>
                <th className="p-3.5 text-right">Total Repaid</th>
                <th className="p-3.5 text-right">Extra Paid / Fees</th>
                <th className="p-3.5 text-center">Avg Turnaround</th>
                <th className="p-3.5 text-right">Effective APR</th>
                <th className="p-3.5 text-center">Risk Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-abyss-border">
              {aprAnalyses.map((l) => (
                <tr key={l.lenderId} className="hover:bg-abyss-elevated transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-abyss-textPrimary">{l.lenderName}</div>
                    <div className="text-[10px] text-abyss-textMuted">{l.productType}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-jade-500">
                    ₹{l.totalBorrowed.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-pulse-500">
                    ₹{l.totalRepaid.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-ochre-500">
                    ₹{l.financingFeeOrInterest.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-center font-mono text-[11px] text-abyss-textMuted">
                    {l.avgTurnaroundDays} days
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-sm text-pulse-500">
                    {l.effectiveAnnualizedApr.toFixed(1)}%
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      l.riskClassification === 'EXTREME_PREDATORY'
                        ? 'bg-pulse-500/20 text-pulse-500 border border-pulse-500/30'
                        : l.riskClassification === 'HIGH_INTEREST'
                        ? 'bg-ochre-500/20 text-ochre-500 border border-ochre-500/30'
                        : 'bg-jade-500/20 text-jade-500 border border-jade-500/30'
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
      <div className="spatial-card p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
              <span>🎯</span>
              <span>Debt Freedom Payoff Simulator</span>
            </h2>
            <p className="text-xs text-abyss-textMuted mt-0.5">
              Optimize repayment velocity and see how extra monthly allocation slashes interest costs.
            </p>
          </div>

          <div className="p-1 rounded-full bg-abyss-well border border-abyss-border flex gap-1">
            <button
              onClick={() => setStrategy('AVALANCHE')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                strategy === 'AVALANCHE'
                  ? 'spatial-btn-selected'
                  : 'text-abyss-textMuted hover:text-abyss-textPrimary'
              }`}
            >
              🏔️ Avalanche
            </button>
            <button
              onClick={() => setStrategy('SNOWBALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                strategy === 'SNOWBALL'
                  ? 'spatial-btn-selected'
                  : 'text-abyss-textMuted hover:text-abyss-textPrimary'
              }`}
            >
              ⛄ Snowball
            </button>
          </div>
        </div>

        {/* Extra Payment Slider */}
        <div className="p-5 rounded-[16px] bg-abyss-well border border-abyss-border space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-abyss-textMuted uppercase text-[10px] tracking-wider">Extra Monthly Debt Allocation</span>
            <span className="font-mono font-bold text-sm text-jade-500">+₹{extraPayment.toLocaleString('en-IN')}/mo</span>
          </div>
          <input
            type="range"
            min={0}
            max={30000}
            step={1000}
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full accent-jade-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-abyss-textMuted font-mono">
            <span>+₹0 (Minimum EMIs)</span>
            <span>+₹15,000/mo</span>
            <span>+₹30,000/mo (Max Acceleration)</span>
          </div>
        </div>

        {/* Month-by-Month Payoff Trajectory */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase text-abyss-textMuted tracking-wider">Payoff Trajectory & Milestones</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {payoffPlan.payoffSchedule.slice(0, 12).map((step) => (
              <div
                key={step.monthIndex}
                className={`p-3.5 rounded-[14px] border text-center space-y-1 ${
                  step.clearedLenders.length > 0
                    ? 'bg-jade-500/15 border-jade-500/30'
                    : 'bg-abyss-well border-abyss-border'
                }`}
              >
                <div className="text-[10px] font-bold text-abyss-textSecondary">{step.monthLabel}</div>
                <div className="text-xs font-mono font-bold text-pulse-500">₹{step.totalBalance.toLocaleString('en-IN')}</div>
                {step.clearedLenders.length > 0 ? (
                  <div className="text-[9px] font-bold text-jade-500 truncate">
                    🎉 {step.clearedLenders[0]} Cleared!
                  </div>
                ) : (
                  <div className="text-[9px] text-abyss-textMuted">Principal: ₹{step.principalPaidThisMonth.toLocaleString('en-IN')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
