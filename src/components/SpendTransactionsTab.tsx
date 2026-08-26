import React, { useState, useMemo } from 'react';
import { FinancialEvent } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendTransactionsTabProps {
  events: FinancialEvent[];
  isDark?: boolean;
  onSelectEvent: (event: FinancialEvent) => void;
  onSplitBill: (event: FinancialEvent) => void;
}

export const SpendTransactionsTab: React.FC<SpendTransactionsTabProps> = ({
  events,
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. SEARCH INPUT PILL (GAZE FOCUS) ────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="Search merchant, amount, UPI ID, reference..."
          className="w-full px-6 py-4 pl-12 rounded-full text-sm bg-white/10 backdrop-blur-[30px] border border-white/20 text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]"
        />
        <span className="absolute left-4.5 top-4 text-sm text-white/50">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4.5 top-4 text-xs text-white/50 hover:text-white px-2 py-0.5 rounded-full bg-white/10"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── 2. QUICK FILTER CHIPS (GAZE INTERACTIVE PILLS) ───────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        {[
          { key: 'ALL', label: 'All Transactions' },
          { key: 'EXPENSES', label: 'Expenses' },
          { key: 'INCOME', label: 'Income' },
          { key: 'TRANSFERS', label: 'Transfers' },
          { key: 'EMIS', label: 'EMIs & Loans' },
          { key: 'HIGH_VAL', label: 'High Value (≥₹1k)' },
        ].map((chip) => {
          const isSelected = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => { setActiveFilter(chip.key as any); setPage(1); }}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSelected
                  ? 'spatial-btn-selected rounded-full'
                  : 'spatial-btn'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ── 3. SUMMARY BANNER SPATIAL CARD ───────────────────────────────── */}
      <div className="spatial-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight text-white">
            Verified Forensic Ledger
          </h4>
          <span className="text-xs text-white/60 font-medium">
            {filteredEvents.length} events • Showing {displayedEvents.length} items
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-bold font-mono">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-sans text-white/40">Total Spend</span>
            <span className="text-white font-bold text-sm sm:text-base">
              ₹{Math.round(totalFilteredSpend).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-sans text-white/40">Total Income</span>
            <span className="text-[#30D158] font-bold text-sm sm:text-base">
              ₹{Math.round(totalFilteredIncome).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. VISIONOS SPATIAL TABLE WRAPPER ────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.30)]">
        {/* Table Header Bar */}
        <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-white/50 uppercase tracking-wider">
          <span>Transaction Details</span>
          <span>Amount & Time</span>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-white/10">
          {displayedEvents.map((ev) => {
            const isCredit = ev.direction === 'INFLOW';

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <MerchantLogoView merchantName={ev.merchant} size={42} />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${
                      isCredit ? 'bg-[#30D158] text-white' : 'bg-white/20 text-white'
                    }`}>
                      {isCredit ? '↓' : '↑'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-md">
                      {ev.merchant}
                    </div>
                    <div className="text-xs text-white/50 font-medium truncate mt-0.5">
                      {ev.category} {ev.accountHint ? `• ${ev.accountHint}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSplitBill(ev);
                    }}
                    className="spatial-btn hidden sm:flex items-center gap-1.5 px-3 py-1 text-[11px]"
                    title="Split bill with friends"
                  >
                    <span>➗</span>
                    <span>Split</span>
                  </button>

                  <div className="text-right">
                    <div className={`text-sm sm:text-base font-bold font-mono ${
                      isCredit ? 'text-[#30D158]' : 'text-white'
                    }`}>
                      {isCredit ? '+' : '-'}₹{ev.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">
                      {ev.dateFormatted}, {ev.timeFormatted}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. LOAD MORE GAZE BUTTON ─────────────────────────────────────── */}
      {filteredEvents.length > page * pageSize && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="spatial-btn w-full py-4 text-xs font-bold text-white"
          >
            Load More Transactions ({filteredEvents.length - page * pageSize} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
