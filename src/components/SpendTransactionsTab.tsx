import React, { useState, useMemo } from 'react';
import { FinancialEvent } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendTransactionsTabProps {
  events: FinancialEvent[];
  isDark: boolean;
  onSelectEvent: (event: FinancialEvent) => void;
  onSplitBill: (event: FinancialEvent) => void;
}

export const SpendTransactionsTab: React.FC<SpendTransactionsTabProps> = ({
  events,
  isDark,
  onSelectEvent,
  onSplitBill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPENSES' | 'INCOME' | 'TRANSFERS' | 'EMIS' | 'HIGH_VAL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Filter transactions
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (ev.economicType === 'EXCLUDED' || ev.category === 'Reminders') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          ev.merchant.toLowerCase().includes(q) ||
          ev.category.toLowerCase().includes(q) ||
          ev.notes.toLowerCase().includes(q) ||
          ev.referenceNumber.toLowerCase().includes(q) ||
          ev.accountHint.includes(q) ||
          ev.amount.toString().includes(q);
        if (!match) return false;
      }

      if (activeFilter === 'EXPENSES' && ev.direction !== 'OUTFLOW') return false;
      if (activeFilter === 'INCOME' && ev.direction !== 'INFLOW') return false;
      if (activeFilter === 'TRANSFERS' && ev.category !== 'Transfers') return false;
      if (activeFilter === 'EMIS' && !ev.category.toLowerCase().includes('emi')) return false;
      if (activeFilter === 'HIGH_VAL' && ev.amount < 1000) return false;

      return true;
    });
  }, [events, searchQuery, activeFilter]);

  const totalFilteredSpend = useMemo(() => {
    return filteredEvents
      .filter(e => e.direction === 'OUTFLOW')
      .reduce((s, e) => s + e.amount, 0);
  }, [filteredEvents]);

  const totalFilteredIncome = useMemo(() => {
    return filteredEvents
      .filter(e => e.direction === 'INFLOW')
      .reduce((s, e) => s + e.amount, 0);
  }, [filteredEvents]);

  const displayedEvents = filteredEvents.slice(0, page * pageSize);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── 1. SEARCH INPUT ─────────────────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="Search merchant, amount (>1k), UPI ID, Txn Ref..."
          className={`w-full px-5 py-3.5 pl-11 rounded-2xl text-xs sm:text-sm outline-none border transition backdrop-blur-xl ${
            isDark 
              ? 'bg-[#10181E]/85 border-white/[0.08] text-white placeholder-slate-500 focus:border-cyan-500/50 shadow-xl shadow-black/40' 
              : 'bg-white border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-[#00BFA5] shadow-sm'
          }`}
        />
        <span className="absolute left-4 top-3.5 text-xs text-slate-400">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── 2. QUICK FILTER CHIPS ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'EXPENSES', label: 'Expenses' },
          { key: 'INCOME', label: 'Income' },
          { key: 'TRANSFERS', label: 'Transfers' },
          { key: 'EMIS', label: 'EMIs & Loans' },
          { key: 'HIGH_VAL', label: 'High Value' },
        ].map((chip) => {
          const isSelected = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => { setActiveFilter(chip.key as any); setPage(1); }}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition border ${
                isSelected
                  ? isDark
                    ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5] shadow-md shadow-teal-500/20'
                    : 'bg-[#0D9488] text-white border-[#0D9488] shadow-md'
                  : isDark
                  ? 'border-[#273B49] text-slate-300 bg-[#152028] hover:bg-[#1C2C38] hover:text-white'
                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className={`text-xs font-bold px-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {filteredEvents.length} transactions found
      </div>

      {/* ── 3. MONTH SUMMARY BANNER ─────────────────────────────────────── */}
      <div className={`p-5 rounded-[28px] border flex items-center justify-between shadow-sm ${
        isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h4 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            August 2026
          </h4>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {filteredEvents.length} transactions
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold font-mono">
          <div className="text-right">
            <span className={`block text-[10px] uppercase font-sans font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Spend</span>
            <span className="text-rose-500 font-black text-sm">₹{(totalFilteredSpend / 1000).toFixed(1)} k</span>
          </div>
          <div className="text-right">
            <span className={`block text-[10px] uppercase font-sans font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Income</span>
            <span className={`font-black text-sm ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}>₹{(totalFilteredIncome / 1000).toFixed(1)} k</span>
          </div>
        </div>
      </div>

      {/* ── 4. TRANSACTION CARD ITEMS ────────────────────────────────────── */}
      <div className="space-y-3">
        {displayedEvents.map((ev) => {
          const isCredit = ev.direction === 'INFLOW';

          return (
            <div
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              className={`p-4.5 rounded-[24px] border cursor-pointer flex items-center justify-between transition ${
                isDark 
                  ? 'bg-[#121B22] border-[#22323D] hover:border-[#00BFA5]/40 hover:bg-[#18242D]' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <MerchantLogoView merchantName={ev.merchant} size={44} isDark={isDark} />
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    isCredit ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {isCredit ? '↓' : '↑'}
                  </span>
                </div>

                <div>
                  <div className={`text-xs sm:text-sm font-black tracking-tight truncate max-w-[170px] sm:max-w-xs ${
                    isDark ? 'text-white' : 'text-[#0F172A]'
                  }`}>
                    {ev.merchant}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {ev.category} {ev.accountHint ? `• ${ev.accountHint}` : ''}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs sm:text-sm font-black font-mono ${
                  isCredit ? 'text-[#00F2FE]' : 'text-rose-400'
                }`}>
                  {isCredit ? '+' : '-'}₹{ev.amount > 1000 ? `${(ev.amount / 1000).toFixed(1)} k` : ev.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {ev.dateFormatted}, {ev.timeFormatted}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {filteredEvents.length > page * pageSize && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className={`w-full py-3.5 rounded-2xl border text-xs font-bold transition ${
              isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Load More Transactions ({filteredEvents.length - page * pageSize} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
