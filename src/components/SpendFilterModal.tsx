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
        className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl border transition-all duration-200 animate-fade-in ${
          isDark 
            ? 'bg-[#10181E] border-white/[0.08] text-white shadow-black/80' 
            : 'bg-white border-slate-200/90 text-slate-900 shadow-xl'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}>
          <div>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Filter Transactions</h3>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Refine by direction, category, or account</p>
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
            <span className={`font-black uppercase tracking-wider text-[10px] block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Direction</span>
            <div className="grid grid-cols-3 gap-2">
              {['ALL', 'OUTFLOW', 'INFLOW'].map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdateFilter({ directionFilter: d as any })}
                  className={`py-2.5 rounded-xl font-black text-xs border transition-all duration-150 active:scale-95 ${
                    filterState.directionFilter === d
                      ? isDark 
                        ? 'bg-brand-viridian text-slate-950 border-brand-viridian shadow-md shadow-brand-viridian/20' 
                        : 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                      : isDark 
                        ? 'bg-[#142027] text-slate-300 border-white/[0.06] hover:bg-[#1a2832]' 
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {d === 'ALL' ? 'All' : d === 'OUTFLOW' ? 'Debits' : 'Credits'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <span className={`font-black uppercase tracking-wider text-[10px] block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onUpdateFilter({ selectedCategory: null })}
                className={`px-3 py-1.5 rounded-xl border font-black text-xs transition-all duration-150 active:scale-95 ${
                  filterState.selectedCategory === null
                    ? isDark 
                      ? 'bg-brand-viridian/20 text-brand-viridian border-brand-viridian/40' 
                      : 'bg-emerald-100 text-brand-800 border-brand-300'
                    : isDark 
                      ? 'bg-[#142027] text-slate-300 border-white/[0.06] hover:bg-[#1a2832]' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
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
                      ? isDark 
                        ? 'bg-brand-viridian/20 text-brand-viridian border-brand-viridian/40 font-black' 
                        : 'bg-emerald-100 text-brand-800 border-brand-300 font-black'
                      : isDark 
                        ? 'bg-[#142027] text-slate-300 border-white/[0.06] hover:bg-[#1a2832]' 
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {c.category}
                </button>
              ))}
            </div>
          </div>

          {/* Account Filter */}
          <div>
            <span className={`font-black uppercase tracking-wider text-[10px] block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bank Account</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onUpdateFilter({ selectedAccount: null })}
                className={`px-3 py-1.5 rounded-xl border font-black text-xs transition-all duration-150 active:scale-95 ${
                  filterState.selectedAccount === null
                    ? isDark 
                      ? 'bg-brand-viridian/20 text-brand-viridian border-brand-viridian/40' 
                      : 'bg-emerald-100 text-brand-800 border-brand-300'
                    : isDark 
                      ? 'bg-[#142027] text-slate-300 border-white/[0.06] hover:bg-[#1a2832]' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
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
                      ? isDark 
                        ? 'bg-brand-viridian/20 text-brand-viridian border-brand-viridian/40 font-black' 
                        : 'bg-emerald-100 text-brand-800 border-brand-300 font-black'
                      : isDark 
                        ? 'bg-[#142027] text-slate-300 border-white/[0.06] hover:bg-[#1a2832]' 
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
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
          className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95 shadow-md ${
            isDark 
              ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark shadow-brand-viridian/25' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
          }`}
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};

