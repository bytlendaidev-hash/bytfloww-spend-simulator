import React, { useState, useEffect } from 'react';
import { CategoryBreakdownItem } from '../types';

interface BudgetManagerScreenProps {
  categories?: CategoryBreakdownItem[];
  totalSpend?: number;
  isDark?: boolean;
  snapshot?: any;
  onBack?: () => void;
}

export const BudgetManagerScreen: React.FC<BudgetManagerScreenProps> = ({
  categories: propCategories,
  totalSpend: propTotalSpend,
  snapshot,
}) => {
  const categories = propCategories || snapshot?.categoryDistribution || [];
  const totalSpend = propTotalSpend !== undefined ? propTotalSpend : (snapshot?.totalSpend || 0);
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
            <span className="text-xs uppercase font-semibold tracking-wider text-abyss-textMuted block">
              Monthly Budget Utilization
            </span>
            <div className="text-2xl sm:text-5xl font-bold font-mono mt-1 text-abyss-textPrimary">
              ₹{Math.round(totalSpend).toLocaleString('en-IN')}{' '}
              <span className="text-sm sm:text-lg font-sans font-medium text-abyss-textMuted">
                / ₹{monthlyBudgetLimit.toLocaleString('en-IN')} Target Limit
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBudget(!isEditingBudget)}
            className="spatial-btn px-4 py-2 text-xs text-abyss-textPrimary"
          >
            {isEditingBudget ? 'Cancel Edit' : '⚙️ Adjust Target Limit'}
          </button>
        </div>

        {isEditingBudget && (
          <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border flex items-center gap-3 max-w-md animate-emergence">
            <span className="text-sm text-abyss-textMuted font-bold">₹</span>
            <input
              type="number"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold outline-none font-mono text-abyss-textPrimary"
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

        {/* Progress Bar (Solid Colors) */}
        <div className="h-3 rounded-full overflow-hidden p-0.5 bg-abyss-canvas border border-abyss-border">
          <div
            style={{ width: `${budgetPct}%` }}
            className={`h-full rounded-full transition-all duration-300 ${
              budgetPct >= 90 ? 'bg-pulse-500' : budgetPct >= 75 ? 'bg-ochre-500' : 'bg-jade-500'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-abyss-textMuted">{budgetPct}% of target budget consumed</span>
          <span className={isOverBudget ? 'text-pulse-500' : 'text-jade-500'}>
            {isOverBudget 
              ? `₹${Math.abs(Math.round(remainingBudget)).toLocaleString('en-IN')} Over Budget` 
              : `₹${Math.round(remainingBudget).toLocaleString('en-IN')} Safe to Spend`}
          </span>
        </div>
      </div>

      {/* ── 2. CATEGORY-SPECIFIC BUDGET BREAKDOWN ───────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <h4 className="text-base font-bold tracking-tight text-abyss-textPrimary">
          Category Budgets & Velocity
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat: CategoryBreakdownItem) => {
            const categoryBudgetLimit = Math.round(monthlyBudgetLimit * (cat.pct / 100 || 0.15));
            const catUtilization = Math.min(100, Math.round((cat.amount / (categoryBudgetLimit || 1)) * 100));

            return (
              <div
                key={cat.category}
                className="p-4 sm:p-5 rounded-[14px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition-all duration-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center font-bold text-xs shadow-sm"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      ●
                    </div>
                    <div>
                      <div className="text-sm font-bold text-abyss-textPrimary tracking-tight">{cat.category}</div>
                      <div className="text-xs text-abyss-textMuted font-medium">{cat.eventCount} transactions</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-abyss-textPrimary">
                      ₹{Math.round(cat.amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-abyss-textMuted">
                      Cap: ₹{categoryBudgetLimit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="h-1.5 rounded-full bg-abyss-canvas overflow-hidden">
                  <div
                    style={{ width: `${Math.max(2, catUtilization)}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all duration-200"
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
