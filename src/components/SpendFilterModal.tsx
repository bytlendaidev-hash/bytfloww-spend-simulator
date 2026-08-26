import React from 'react';
import { FilterState, CategoryBreakdownItem, DetectedAccount } from '../types';

interface SpendFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onUpdateFilter: (update: Partial<FilterState>) => void;
  categories: CategoryBreakdownItem[];
  accounts: DetectedAccount[];
  isDark: boolean;
}

export const SpendFilterModal: React.FC<SpendFilterModalProps> = ({
  isOpen,
  onClose,
  filterState,
  onUpdateFilter,
  categories,
  accounts,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-2xl p-0 sm:p-4 animate-emergence">
      <div className="spatial-modal w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-abyss-border">
          <div>
            <h3 className="text-base font-black tracking-tight text-abyss-textPrimary">Filter Transactions</h3>
            <p className="text-xs font-medium text-abyss-textMuted">Refine by direction, category, or account</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition"
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar text-xs">
          {/* Direction Filter */}
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] block mb-2 text-abyss-textMuted">Direction</span>
            <div className="grid grid-cols-3 gap-2">
              {['ALL', 'OUTFLOW', 'INFLOW'].map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdateFilter({ directionFilter: d as any })}
                  className={`py-2.5 rounded-xl font-black text-xs border transition-all duration-150 active:scale-95 ${
                    filterState.directionFilter === d
                      ? 'bg-jade-500 text-abyss-canvas border-jade-500 shadow-solid-sm' 
                      : 'bg-abyss-well text-abyss-textSecondary border-abyss-border hover:bg-abyss-elevated'
                  }`}
                >
                  {d === 'ALL' ? 'All' : d === 'OUTFLOW' ? 'Debits' : 'Credits'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] block mb-2 text-abyss-textMuted">Category</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onUpdateFilter({ selectedCategory: null })}
                className={`px-3 py-1.5 rounded-xl border font-black text-xs transition-all duration-150 active:scale-95 ${
                  filterState.selectedCategory === null
                    ? 'bg-jade-500/20 text-jade-500 border-jade-500/40' 
                    : 'bg-abyss-well text-abyss-textSecondary border-abyss-border hover:bg-abyss-elevated'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.category}
                  onClick={() => onUpdateFilter({ 
                    selectedCategory: filterState.selectedCategory === c.category ? null : c.category 
                  })}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all duration-150 active:scale-95 ${
                    filterState.selectedCategory === c.category
                      ? 'bg-jade-500/20 text-jade-500 border-jade-500/40 font-black' 
                      : 'bg-abyss-well text-abyss-textSecondary border-abyss-border hover:bg-abyss-elevated'
                  }`}
                >
                  {c.category}
                </button>
              ))}
            </div>
          </div>

          {/* Account Filter */}
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] block mb-2 text-abyss-textMuted">Bank Account</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onUpdateFilter({ selectedAccount: null })}
                className={`px-3 py-1.5 rounded-xl border font-black text-xs transition-all duration-150 active:scale-95 ${
                  filterState.selectedAccount === null
                    ? 'bg-jade-500/20 text-jade-500 border-jade-500/40' 
                    : 'bg-abyss-well text-abyss-textSecondary border-abyss-border hover:bg-abyss-elevated'
                }`}
              >
                All Accounts
              </button>
              {accounts.map((a) => (
                <button
                  key={a.accountMask}
                  onClick={() => onUpdateFilter({ 
                    selectedAccount: filterState.selectedAccount === a.accountMask ? null : a.accountMask 
                  })}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all duration-150 active:scale-95 ${
                    filterState.selectedAccount === a.accountMask
                      ? 'bg-jade-500/20 text-jade-500 border-jade-500/40 font-black' 
                      : 'bg-abyss-well text-abyss-textSecondary border-abyss-border hover:bg-abyss-elevated'
                  }`}
                >
                  {a.institution} (*{a.accountMask})
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="spatial-btn-selected w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};
