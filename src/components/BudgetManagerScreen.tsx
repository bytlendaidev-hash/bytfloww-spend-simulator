import React, { useState, useEffect } from 'react';
import { CategoryBreakdownItem } from '../types';

interface BudgetManagerScreenProps {
  categories: CategoryBreakdownItem[];
  totalSpend: number;
  isDark?: boolean;
}

export const BudgetManagerScreen: React.FC<BudgetManagerScreenProps> = ({
  categories,
  totalSpend,
}) => {
  const initialBudget = Math.round(totalSpend > 0 ? (totalSpend * 1.15 / 1000) * 1000 : 50000);
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState<number>(initialBudget);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [customInput, setCustomInput] = useState(`${initialBudget}`);

  useEffect(() => {
    const calculated = Math.round(totalSpend > 0 ? (totalSpend * 1.15 / 1000) * 1000 : 50000);
    setMonthlyBudgetLimit(calculated);
    setCustomInput(`${calculated}`);
  }, [totalSpend]);

  const budgetPct = Math.min(100, Math.round((totalSpend / (monthlyBudgetLimit || 1)) * 100));
  const remainingBudget = monthlyBudgetLimit - totalSpend;
  const isOverBudget = remainingBudget < 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. OVERALL MONTHLY BUDGET SPATIAL CARD ───────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-white/60 block">
              Monthly Budget Utilization
            </span>
            <div className="text-2xl sm:text-5xl font-bold font-mono mt-1 text-white">
              ₹{Math.round(totalSpend).toLocaleString('en-IN')}{' '}
              <span className="text-sm sm:text-lg font-sans font-medium text-white/50">
                / ₹{monthlyBudgetLimit.toLocaleString('en-IN')} Target Limit
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBudget(!isEditingBudget)}
            className="spatial-btn px-4 py-2 text-xs text-white"
          >
            {isEditingBudget ? 'Cancel Edit' : '⚙️ Adjust Target Limit'}
          </button>
        </div>

        {isEditingBudget && (
          <div className="p-4 rounded-[14px] bg-white/5 border border-white/15 flex items-center gap-3 max-w-md animate-emergence">
            <span className="text-sm text-white/50 font-bold">₹</span>
            <input
              type="number"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold outline-none font-mono text-white"
            />
            <button
              onClick={() => {
                const val = parseFloat(customInput);
                if (val > 0) setMonthlyBudgetLimit(val);
                setIsEditingBudget(false);
              }}
              className="spatial-btn-selected px-4 py-2 text-xs rounded-full"
            >
              Save Limit
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="h-3 rounded-full overflow-hidden p-0.5 bg-black/40 border border-white/15">
          <div
            style={{ width: `${budgetPct}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPct >= 90 ? 'bg-[#FF453A]' : budgetPct >= 75 ? 'bg-[#FF9F0A]' : 'bg-gradient-to-r from-[#0A84FF] to-[#30D158]'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-white/60">{budgetPct}% of target budget consumed</span>
          <span className={isOverBudget ? 'text-[#FF453A]' : 'text-[#30D158]'}>
            {isOverBudget 
              ? `₹${Math.abs(Math.round(remainingBudget)).toLocaleString('en-IN')} Over Budget` 
              : `₹${Math.round(remainingBudget).toLocaleString('en-IN')} Safe to Spend`}
          </span>
        </div>
      </div>

      {/* ── 2. CATEGORY-SPECIFIC BUDGET BREAKDOWN ───────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <h4 className="text-base font-bold tracking-tight text-white">
          Category Budgets & Velocity
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const categoryBudgetLimit = Math.round(monthlyBudgetLimit * (cat.pct / 100 || 0.15));
            const catUtilization = Math.min(100, Math.round((cat.amount / (categoryBudgetLimit || 1)) * 100));

            return (
              <div
                key={cat.category}
                className="p-4 sm:p-5 rounded-[14px] bg-white/5 border border-white/10 hover:bg-white/15 transition-all duration-300 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center font-bold text-xs shadow-sm"
                      style={{ backgroundColor: `${cat.color}30`, color: cat.color }}
                    >
                      ●
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">{cat.category}</div>
                      <div className="text-xs text-white/50 font-medium">{cat.eventCount} transactions</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">
                      ₹{Math.round(cat.amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-white/40">
                      Cap: ₹{categoryBudgetLimit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(2, catUtilization)}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
