import React, { useState, useMemo } from 'react';
import { FinancialEvent } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendTransactionsTabProps {
  events: FinancialEvent[];
  isDark?: boolean;
  filterState?: any;
  onSelectEvent: (event: FinancialEvent) => void;
  onSplitBill: (event: FinancialEvent) => void;
  snapshot?: any;
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
      {/* ── 1. SEARCH INPUT PILL ─────────────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="Search merchant, amount, UPI ID, reference number..."
          className="w-full px-6 py-4 pl-12 rounded-full text-sm bg-abyss-card border border-abyss-border text-abyss-textPrimary placeholder-abyss-textMuted outline-none focus:border-jade-500 shadow-md transition-colors duration-200"
        />
        <span className="absolute left-4.5 top-4 text-sm text-jade-500">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4.5 top-4 text-xs text-abyss-textMuted hover:text-abyss-textPrimary px-2 py-0.5 rounded-full bg-abyss-well"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── 2. QUICK FILTER CHIPS ────────────────────────────────────────── */}
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
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-all duration-200 ${
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

      {/* ── 3. SUMMARY BANNER CARD ───────────────────────────────────────── */}
      <div className="spatial-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
            Verified Forensic Ledger
          </h4>
          <span className="text-xs text-jade-500 font-medium">
            {filteredEvents.length} events • Showing {displayedEvents.length} items
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-bold font-mono">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-sans text-abyss-textMuted">Total Spend</span>
            <span className="text-pulse-500 font-bold text-sm sm:text-base">
              ₹{Math.round(totalFilteredSpend).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-sans text-abyss-textMuted">Total Income</span>
            <span className="text-jade-500 font-bold text-sm sm:text-base">
              ₹{Math.round(totalFilteredIncome).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. TRANSACTION ROWS WRAPPER ──────────────────────────────────── */}
      <div className="bg-abyss-card border border-abyss-border rounded-[20px] overflow-hidden shadow-lg">
        {/* Table Header Bar */}
        <div className="bg-abyss-elevated px-5 py-3.5 border-b border-abyss-border flex items-center justify-between text-xs font-semibold text-abyss-textMuted uppercase tracking-wider">
          <span>Transaction Details</span>
          <span>Amount & Timestamp</span>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-abyss-border">
          {displayedEvents.length === 0 ? (
            <div className="p-12 text-center text-abyss-textMuted">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-sm font-semibold">No transactions match your search criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('ALL'); }}
                className="mt-3 text-xs text-jade-500 hover:underline font-bold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            displayedEvents.map((ev) => {
              const isOutflow = ev.direction === 'OUTFLOW';

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="p-4 sm:p-5 hover:bg-abyss-well/60 cursor-pointer transition-colors duration-150 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <MerchantLogoView merchantName={ev.merchant} size={42} shape="rounded" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-abyss-textPrimary truncate group-hover:text-jade-500 transition-colors">
                          {ev.merchant}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-abyss-well text-abyss-textSecondary border border-abyss-border font-medium">
                          {ev.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-abyss-textMuted truncate mt-0.5 flex items-center gap-2">
                        <span>{ev.accountHint}</span>
                        {ev.referenceNumber && (
                          <span className="hidden sm:inline font-mono opacity-75">Ref: {ev.referenceNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-mono font-bold text-sm sm:text-base ${
                      isOutflow ? 'text-pulse-500' : 'text-jade-500'
                    }`}>
                      {isOutflow ? '-' : '+'}₹{ev.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-abyss-textMuted font-mono mt-0.5">
                      {ev.dateFormatted || ev.timeFormatted || new Date(ev.timestamp).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {displayedEvents.length < filteredEvents.length && (
          <div className="p-4 border-t border-abyss-border text-center bg-abyss-elevated">
            <button
              onClick={() => setPage(p => p + 1)}
              className="spatial-btn px-6 py-2 text-xs font-bold text-jade-500 border-jade-500/30"
            >
              Load More Transactions ({filteredEvents.length - displayedEvents.length} remaining) ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
