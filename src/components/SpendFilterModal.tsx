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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div 
        className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border transition-all animate-fade-in ${
          isDark 
            ? 'bg-[#0E1C23] border-cyan-500/20 text-[#E2ECEF]' 
            : 'bg-white border-slate-200 text-[#0F172A]'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-white/10' : 'border-slate-100'
        }`}>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Filter Transactions</h3>
            <p className={`text-xs ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Refine by direction, category, or account</p>
          </div>
          <button 
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar text-xs">
          {/* Direction Filter */}
          <div>
            <span className={`font-semibold block mb-2 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-600'}`}>Direction</span>
            <div className="grid grid-cols-3 gap-2">
              {['ALL', 'OUTFLOW', 'INFLOW'].map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdateFilter({ directionFilter: d as any })}
                  className={`py-2 rounded-xl font-bold border transition ${
                    filterState.directionFilter === d
                      ? 'bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] text-black border-transparent font-extrabold shadow-sm'
                      : isDark ? 'bg-[#12232B] text-[#8A9EA8] border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {d === 'ALL' ? 'All' : d === 'OUTFLOW' ? 'Debits' : 'Credits'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <span className={`font-semibold block mb-2 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-600'}`}>Category</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onUpdateFilter({ selectedCategory: null })}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  filterState.selectedCategory === null
                    ? 'bg-cyan-500/20 text-[#00F2FE] border-cyan-500/40 font-bold'
                    : isDark ? 'bg-[#12232B] text-[#8A9EA8] border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
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
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    filterState.selectedCategory === c.category
                      ? 'bg-cyan-500/20 text-[#00F2FE] border-cyan-500/40 font-bold'
                      : isDark ? 'bg-[#12232B] text-[#8A9EA8] border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {c.category}
                </button>
              ))}
            </div>
          </div>

          {/* Account Filter */}
          <div>
            <span className={`font-semibold block mb-2 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-600'}`}>Bank Account</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onUpdateFilter({ selectedAccount: null })}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  filterState.selectedAccount === null
                    ? 'bg-cyan-500/20 text-[#00F2FE] border-cyan-500/40 font-bold'
                    : isDark ? 'bg-[#12232B] text-[#8A9EA8] border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
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
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    filterState.selectedAccount === a.accountMask
                      ? 'bg-cyan-500/20 text-[#00F2FE] border-cyan-500/40 font-bold'
                      : isDark ? 'bg-[#12232B] text-[#8A9EA8] border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
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
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#9B51E0] text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};
