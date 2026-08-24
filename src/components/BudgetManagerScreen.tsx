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
    <div className="space-y-6">
      {/* 1. Overall Monthly Budget Card */}
      <div className={`p-6 sm:p-8 rounded-[30px] border transition relative overflow-hidden ${
        isDark ? 'bg-[#0E1C23]/90 border-cyan-500/15 shadow-xl shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
              Monthly Budget Utilization
            </span>
            <div className={`text-2xl sm:text-4xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              ₹{Math.round(totalSpend).toLocaleString('en-IN')}{' '}
              <span className="text-sm sm:text-base text-slate-500 font-normal">
                / ₹{monthlyBudgetLimit.toLocaleString('en-IN')} Target Limit
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBudget(!isEditingBudget)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-[#00F2FE] border-white/10' 
                : 'bg-cyan-50 hover:bg-cyan-100 text-[#0369A1] border-cyan-200 shadow-sm'
            }`}
          >
            {isEditingBudget ? 'Cancel Edit' : 'Edit Budget Limit'}
          </button>
        </div>

        {isEditingBudget && (
          <div className={`mb-4 p-4 rounded-2xl border flex items-center gap-3 max-w-md ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-sm text-slate-500">₹</span>
            <input
              type="number"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className={`flex-1 bg-transparent text-sm font-bold outline-none font-mono ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}
            />
            <button
              onClick={() => {
                const val = parseFloat(customInput);
                if (val > 0) setMonthlyBudgetLimit(val);
                setIsEditingBudget(false);
              }}
              className="px-4 py-1.5 bg-cyan-500 text-black font-bold text-xs rounded-xl shadow-sm"
            >
              Save Limit
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className={`h-4 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
          <div
            style={{ width: `${budgetPct}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPct >= 90 ? 'bg-rose-500' : budgetPct >= 75 ? 'bg-amber-500' : isDark ? 'bg-[#00F2FE]' : 'bg-[#0284C7]'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{budgetPct}% of target budget consumed</span>
          <span className={`font-bold font-mono ${isOverBudget ? 'text-rose-500' : isDark ? 'text-[#00F2FE]' : 'text-teal-600'}`}>
            {isOverBudget 
              ? `₹${Math.abs(Math.round(remainingBudget)).toLocaleString('en-IN')} Over Budget` 
              : `₹${Math.round(remainingBudget).toLocaleString('en-IN')} Safe to Spend`}
          </span>
        </div>
      </div>

      {/* 2. Category-Specific Budget Breakdown */}
      <div className={`p-6 sm:p-8 rounded-[30px] border transition ${
        isDark ? 'bg-[#0E1C23]/90 border-cyan-500/15 shadow-xl shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
          Category Budgets & Velocity
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const categoryBudgetLimit = Math.round(monthlyBudgetLimit * (cat.pct / 100 || 0.15));
            const catUtilization = Math.min(100, Math.round((cat.amount / (categoryBudgetLimit || 1)) * 100));

            return (
              <div
                key={cat.category}
                className={`p-4 rounded-2xl border transition ${
                  isDark ? 'bg-[#12232B] border-white/5' : 'bg-[#F8FAFC] border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      ●
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{cat.category}</div>
                      <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>{cat.eventCount} transactions</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-extrabold font-mono ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      ₹{Math.round(cat.amount).toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Allocation: ₹{categoryBudgetLimit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                  <div
                    style={{ width: `${catUtilization}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all"
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
