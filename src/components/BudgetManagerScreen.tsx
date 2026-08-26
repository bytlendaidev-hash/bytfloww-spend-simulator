import React, { useState, useEffect } from 'react';
import { CategoryBreakdownItem } from '../types';

interface BudgetManagerScreenProps {
  categories: CategoryBreakdownItem[];
  totalSpend: number;
  isDark: boolean;
}

export const BudgetManagerScreen: React.FC<BudgetManagerScreenProps> = ({
  categories,
  totalSpend,
  isDark,
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
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* 1. Overall Monthly Budget Card */}
      <div className={`p-6 sm:p-8 rounded-[32px] border transition-all duration-200 relative overflow-hidden ${
        isDark ? 'bg-[#10181E] border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Monthly Budget Utilization
            </span>
            <div className={`text-2xl sm:text-4xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{Math.round(totalSpend).toLocaleString('en-IN')}{' '}
              <span className={`text-sm sm:text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                / ₹{monthlyBudgetLimit.toLocaleString('en-IN')} Target Limit
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBudget(!isEditingBudget)}
            className={`px-4 py-2 rounded-2xl text-xs font-black border transition-all duration-150 active:scale-95 ${
              isDark 
                ? 'bg-[#142027] hover:bg-[#1a2832] text-brand-viridian border-brand-viridian/30 shadow-md' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-brand-800 border-brand-200 shadow-sm'
            }`}
          >
            {isEditingBudget ? 'Cancel Edit' : '⚙️ Adjust Budget Target'}
          </button>
        </div>

        {isEditingBudget && (
          <div className={`mb-5 p-4 rounded-2xl border flex items-center gap-3 max-w-md animate-fade-in ${
            isDark ? 'bg-[#142027] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-sm text-slate-400 font-bold">₹</span>
            <input
              type="number"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className={`flex-1 bg-transparent text-sm font-black outline-none font-mono ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            />
            <button
              onClick={() => {
                const val = parseFloat(customInput);
                if (val > 0) setMonthlyBudgetLimit(val);
                setIsEditingBudget(false);
              }}
              className={`px-4 py-2 font-black text-xs rounded-xl transition shadow-sm ${
                isDark ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark' : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              Save Limit
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className={`h-3.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-black/40' : 'bg-slate-100'}`}>
          <div
            style={{ width: `${budgetPct}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPct >= 90 ? 'bg-rose-500' : budgetPct >= 75 ? 'bg-amber-500' : isDark ? 'bg-brand-viridian' : 'bg-brand-600'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{budgetPct}% of target budget consumed</span>
          <span className={`font-black font-mono ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>
            {isOverBudget 
              ? `₹${Math.abs(Math.round(remainingBudget)).toLocaleString('en-IN')} Over Budget` 
              : `₹${Math.round(remainingBudget).toLocaleString('en-IN')} Safe to Spend`}
          </span>
        </div>
      </div>

      {/* 2. Category-Specific Budget Breakdown */}
      <div className={`p-6 sm:p-8 rounded-[32px] border transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <h4 className={`text-sm font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Category Budgets & Velocity
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {categories.map((cat) => {
            const categoryBudgetLimit = Math.round(monthlyBudgetLimit * (cat.pct / 100 || 0.15));
            const catUtilization = Math.min(100, Math.round((cat.amount / (categoryBudgetLimit || 1)) * 100));

            return (
              <div
                key={cat.category}
                className={`p-4 rounded-2xl border transition-all duration-150 ${
                  isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      ●
                    </div>
                    <div>
                      <div className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.category}</div>
                      <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cat.eventCount} transactions</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{Math.round(cat.amount).toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Allocation: ₹{categoryBudgetLimit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-black/40' : 'bg-slate-200'}`}>
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

