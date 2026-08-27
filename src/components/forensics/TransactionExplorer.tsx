/**
 * TransactionExplorer — Streamlined Master Transaction Ledger with Fast Search,
 * Amount Range Filtering, Multi-Category Chips, Sortable Columns, and Calendar View.
 * Zero-redundancy, high-impact SaaS design.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ClassificationTaxonomy, LiveAnalyticsResult } from '../../engine/analyticsEngine';
import { CanonicalTransaction } from '../../types';
import { MasterLedgerCalendar } from './MasterLedgerCalendar';
import { BrandLogoBadge } from './BrandLogoBadge';
import { Calendar as CalendarIcon, Filter, Search, ArrowUpRight, ArrowDownRight, X, ArrowUpDown, ChevronDown } from 'lucide-react';

interface TransactionExplorerProps {
  liveResult: LiveAnalyticsResult | null;
  isDark: boolean;
  initialDate?: string | null;
  onDateChange?: (date: string | null) => void;
}

const TAXONOMY_LABELS: Partial<Record<ClassificationTaxonomy, string>> = {
  SALARY: '💼 Salary',
  LOAN_CREDIT: '🏦 Loan Received',
  EPFO_PF: '🏛️ EPFO/PF',
  REFUND: '↩️ Refund',
  REIMBURSEMENT: '🧾 Reimbursement',
  INTEREST_INCOME: '💰 Interest',
  LOAN_REPAYMENT: '🔴 Loan Repayment',
  CREDIT_CARD_PAYMENT: '💳 CC Payment',
  PERSONAL_TRANSFER: '👤 Transfer',
  SELF_TRANSFER: '🔄 Self Transfer',
  WALLET_MOVEMENT: '📱 Wallet',
  PAYMENT_BANK_MOVEMENT: '📱 Payment Bank',
  CASH_WITHDRAWAL: '🏧 ATM Cash',
  FOOD: '🍔 Food',
  GROCERY: '🛒 Grocery',
  TRANSPORT: '🚕 Transport',
  SHOPPING: '🛍️ Shopping',
  ENTERTAINMENT: '🎬 Entertainment',
  BILL_UTILITY: '⚡ Utility',
  SUBSCRIPTION: '📺 Subscription',
  INSURANCE: '🛡️ Insurance',
  BANK_CHARGE: '🏛️ Bank Charge',
  UPI_TRANSFER_UNKNOWN: '👥 UPI Transfer',
  OTHER: '📦 Other',
  UNKNOWN: '❓ Unknown',
};

type SortField = 'date' | 'amount' | 'entity' | 'category' | 'balance';
type SortOrder = 'asc' | 'desc';

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ 
  liveResult, 
  isDark,
  initialDate = null,
  onDateChange
}) => {
  const [viewMode, setViewMode] = useState<'TABLE' | 'CALENDAR'>('TABLE');
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [taxFilter, setTaxFilter] = useState<string>('ALL');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [selectedTx, setSelectedTx] = useState<CanonicalTransaction | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [visibleCount, setVisibleCount] = useState(50);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Sync initialDate prop if changed externally
  useEffect(() => {
    if (initialDate !== undefined) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const handleSelectDate = (date: string | null) => {
    setSelectedDate(date);
    if (onDateChange) onDateChange(date);
  };

  const txns = liveResult?.transactions || [];

  // Compute available category counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of txns) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [txns]);

  // Filtered & Sorted Transactions
  const filtered = useMemo(() => {
    const list = txns.filter(t => {
      const matchSearch = !search || 
        (t.rawNarration || t.narration || '').toLowerCase().includes(search.toLowerCase()) || 
        (t.entityName || '').toLowerCase().includes(search.toLowerCase()) || 
        (t.referenceNumber || '').toLowerCase().includes(search.toLowerCase()) || 
        (t.upiHandle || '').toLowerCase().includes(search.toLowerCase());
      const matchDir = dirFilter === 'ALL' || t.direction === dirFilter;
      const matchTax = taxFilter === 'ALL' || t.category === taxFilter;
      const amt = t.amount;
      const matchMin = !minAmt || amt >= parseFloat(minAmt);
      const matchMax = !maxAmt || amt <= parseFloat(maxAmt);
      const matchDate = !selectedDate || t.transactionDate === selectedDate;
      return matchSearch && matchDir && matchTax && matchMin && matchMax && matchDate;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') {
        comp = a.transactionDate.localeCompare(b.transactionDate);
      } else if (sortField === 'amount') {
        comp = a.amount - b.amount;
      } else if (sortField === 'entity') {
        comp = (a.entityName || '').localeCompare(b.entityName || '');
      } else if (sortField === 'category') {
        comp = (a.category || '').localeCompare(b.category || '');
      } else if (sortField === 'balance') {
        comp = (a.balanceAfter || 0) - (b.balanceAfter || 0);
      }
      return sortOrder === 'desc' ? -comp : comp;
    });

    return list;
  }, [txns, search, dirFilter, taxFilter, minAmt, maxAmt, selectedDate, sortField, sortOrder]);

  // Live Summary of Filtered Transactions
  const summary = useMemo(() => {
    let creditSum = 0;
    let debitSum = 0;
    let creditCount = 0;
    let debitCount = 0;

    for (const t of filtered) {
      if (t.credit && t.credit > 0) {
        creditSum += t.credit;
        creditCount++;
      }
      if (t.debit && t.debit > 0) {
        debitSum += t.debit;
        debitCount++;
      }
    }

    const netFlow = creditSum - debitSum;
    return {
      creditSum,
      debitSum,
      netFlow,
      creditCount,
      debitCount,
      totalCount: filtered.length,
    };
  }, [filtered]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const visible = filtered.slice(0, visibleCount);

  if (!liveResult) {
    return (
      <div className="spatial-card p-8 text-center">
        <div className="text-4xl mb-3">📑</div>
        <div className="text-sm font-bold text-abyss-textPrimary mb-1">Transaction Explorer</div>
        <div className="text-xs text-abyss-textMuted">
          Upload your bank statement to explore all transactions with powerful search, filter, and drill-down.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans animate-fade-in">
      {/* ── 1. UNIFIED COMMAND & VIEW CONTROLLER ────────────────────────── */}
      <div className="spatial-card p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
              <span>📑</span>
              <span>Master Transaction Ledger</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#00884E] dark:text-[#1AE893] border border-emerald-500/20">
                {filtered.length.toLocaleString('en-IN')} / {txns.length.toLocaleString('en-IN')} Txns
              </span>
            </h2>
            <p className="text-xs text-abyss-textMuted mt-0.5">
              Deterministic search, direction, and amount range filtering across all reconciled statements.
            </p>
          </div>

          {/* View Mode Toggle: Table vs Calendar */}
          <div className="flex items-center p-1 rounded-xl bg-abyss-well border border-abyss-border gap-1 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'TABLE'
                  ? 'btn-emerald-capsule text-white shadow-sm'
                  : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
              }`}
            >
              <span>📋</span>
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'CALENDAR'
                  ? 'btn-emerald-capsule text-white shadow-sm'
                  : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
              }`}
            >
              <span>📅</span>
              <span>Calendar View</span>
            </button>
          </div>
        </div>

        {/* ── 2. SEARCH & FILTER CONTROLS ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-2 border-t border-abyss-border">
          {/* Narration & Entity Search (Col 6) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-abyss-textMuted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search narration, entity, UTR, UPI handle..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted/60 outline-none focus:border-emerald-500 transition"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-abyss-textMuted hover:text-abyss-textPrimary text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Direction Toggle (Col 3) */}
          <div className="md:col-span-3 flex items-center p-0.5 rounded-xl bg-abyss-well border border-abyss-border">
            {(['ALL', 'CREDIT', 'DEBIT'] as const).map(dir => (
              <button
                key={dir}
                onClick={() => setDirFilter(dir)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  dirFilter === dir
                    ? dir === 'CREDIT' 
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : dir === 'DEBIT'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'btn-emerald-capsule text-white shadow-xs'
                    : 'text-abyss-textMuted hover:text-abyss-textPrimary'
                }`}
              >
                {dir === 'ALL' ? 'All' : dir === 'CREDIT' ? 'Credits ↓' : 'Debits ↑'}
              </button>
            ))}
          </div>

          {/* Amount Range Filter (Col 4) */}
          <div className="md:col-span-4 flex items-center gap-1.5">
            <input
              type="number"
              value={minAmt}
              onChange={(e) => setMinAmt(e.target.value)}
              placeholder="Min ₹"
              className="w-1/2 px-3 py-2 text-xs rounded-xl bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted/60 outline-none focus:border-emerald-500 font-mono transition"
            />
            <span className="text-abyss-textMuted text-xs font-bold">–</span>
            <input
              type="number"
              value={maxAmt}
              onChange={(e) => setMaxAmt(e.target.value)}
              placeholder="Max ₹"
              className="w-1/2 px-3 py-2 text-xs rounded-xl bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted/60 outline-none focus:border-emerald-500 font-mono transition"
            />
            {(minAmt || maxAmt) && (
              <button
                onClick={() => { setMinAmt(''); setMaxAmt(''); }}
                className="p-2 rounded-xl bg-abyss-well border border-abyss-border text-abyss-textMuted hover:text-rose-500 text-xs"
                title="Clear Amount Filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── 3. HORIZONTAL CATEGORY FILTER CHIPS ───────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-abyss-border/60">
          <button
            onClick={() => setTaxFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              taxFilter === 'ALL'
                ? 'btn-emerald-capsule text-white shadow-xs'
                : 'bg-abyss-well text-abyss-textSecondary hover:text-abyss-textPrimary border border-abyss-border'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] font-mono opacity-80">({txns.length})</span>
          </button>

          {Object.entries(categoryCounts).map(([catKey, count]) => {
            const label = TAXONOMY_LABELS[catKey as ClassificationTaxonomy] || catKey;
            const isSelected = taxFilter === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setTaxFilter(isSelected ? 'ALL' : catKey)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'btn-emerald-capsule text-white shadow-xs'
                    : 'bg-abyss-well text-abyss-textSecondary hover:text-abyss-textPrimary border border-abyss-border'
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px] font-mono opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── 4. FILTERED SUMMARY METRIC BAR ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-abyss-border text-center">
          <div className="p-2 rounded-xl bg-abyss-well/70 border border-abyss-border">
            <div className="text-[10px] uppercase font-bold text-abyss-textMuted">Filtered Inflow</div>
            <div className="text-sm font-bold font-mono text-[#00884E] dark:text-[#1AE893]">
              ₹{summary.creditSum.toLocaleString('en-IN')} <span className="text-[10px] text-abyss-textMuted font-normal">({summary.creditCount})</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-abyss-well/70 border border-abyss-border">
            <div className="text-[10px] uppercase font-bold text-abyss-textMuted">Filtered Outflow</div>
            <div className="text-sm font-bold font-mono text-rose-500">
              ₹{summary.debitSum.toLocaleString('en-IN')} <span className="text-[10px] text-abyss-textMuted font-normal">({summary.debitCount})</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-abyss-well/70 border border-abyss-border">
            <div className="text-[10px] uppercase font-bold text-abyss-textMuted">Net Cash Flow</div>
            <div className={`text-sm font-bold font-mono ${summary.netFlow >= 0 ? 'text-[#00884E] dark:text-[#1AE893]' : 'text-rose-500'}`}>
              {summary.netFlow >= 0 ? '+' : '-'}₹{Math.abs(summary.netFlow).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-abyss-well/70 border border-abyss-border">
            <div className="text-[10px] uppercase font-bold text-abyss-textMuted">Active Filter Span</div>
            <div className="text-xs font-bold text-abyss-textPrimary font-mono mt-0.5">
              {filtered.length} of {txns.length} ({((filtered.length / Math.max(1, txns.length)) * 100).toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. SPEND CALENDAR VIEW MODE ────────────────────────────────── */}
      {viewMode === 'CALENDAR' && (
        <MasterLedgerCalendar
          transactions={txns}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          isDark={isDark}
          onFilterLedgerToDate={(date) => {
            handleSelectDate(date);
            setViewMode('TABLE');
          }}
          onCategoryFilterChange={(cat) => {
            if (cat === 'ALL') setTaxFilter('ALL');
            else if (cat === 'LOANS') setTaxFilter('LOAN_REPAYMENT');
            else if (cat === 'TRANSFERS') setTaxFilter('PERSONAL_TRANSFER');
          }}
        />
      )}

      {/* ── 6. VIRTUALIZED / SORTABLE TRANSACTION TABLE VIEW ──────────── */}
      {viewMode === 'TABLE' && (
        <div className="spatial-card overflow-hidden">
          {/* Active Date Banner */}
          {selectedDate && (
            <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-[#00884E] dark:text-[#1AE893]">
                📅 Filtered to Date: {selectedDate} ({filtered.length} txns)
              </span>
              <button
                onClick={() => handleSelectDate(null)}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear Date Filter
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-abyss-border bg-abyss-well/80 text-[10px] font-bold uppercase tracking-wider text-abyss-textMuted select-none">
                  <th 
                    onClick={() => handleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:text-abyss-textPrimary"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('entity')}
                    className="py-3 px-4 cursor-pointer hover:text-abyss-textPrimary"
                  >
                    <div className="flex items-center gap-1">
                      <span>Narration & Counterparty</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    className="py-3 px-4 cursor-pointer hover:text-abyss-textPrimary"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-abyss-textPrimary"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Debit</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-abyss-textPrimary"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Credit</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('balance')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-abyss-textPrimary"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Running Bal</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-abyss-border">
                {visible.map((tx) => {
                  const isDebit = tx.direction === 'DEBIT';
                  const catLabel = TAXONOMY_LABELS[tx.category as ClassificationTaxonomy] || tx.category;

                  return (
                    <tr 
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-abyss-well/60 transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono whitespace-nowrap text-abyss-textSecondary text-[11px]">
                        {tx.transactionDate}
                      </td>

                      {/* Narration & Entity */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          <BrandLogoBadge 
                            entityName={tx.entityName || tx.narration || tx.rawNarration} 
                            size="sm" 
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-abyss-textPrimary truncate group-hover:text-[#00884E] dark:group-hover:text-[#1AE893] transition">
                              {tx.entityName || tx.narration}
                            </div>
                            <div className="text-[10px] text-abyss-textMuted font-mono truncate max-w-xs">
                              {tx.referenceNumber ? `Ref: ${tx.referenceNumber}` : tx.rawNarration}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-abyss-well border border-abyss-border text-abyss-textSecondary">
                          {catLabel}
                        </span>
                      </td>

                      {/* Debit */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        {isDebit ? (
                          <span className="text-rose-500">
                            -₹{tx.amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-abyss-textMuted/40">–</span>
                        )}
                      </td>

                      {/* Credit */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        {!isDebit ? (
                          <span className="text-[#00884E] dark:text-[#1AE893]">
                            +₹{tx.amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-abyss-textMuted/40">–</span>
                        )}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3 px-4 text-right font-mono text-abyss-textSecondary whitespace-nowrap">
                        {tx.balanceAfter !== null && tx.balanceAfter !== undefined ? (
                          `₹${tx.balanceAfter.toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-abyss-textMuted/40">–</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-abyss-textMuted">
                      <div className="text-2xl mb-2">🔍</div>
                      <div className="text-xs font-bold text-abyss-textPrimary">No transactions match your filter criteria</div>
                      <div className="text-[11px] mt-1">Try broadening your search term or adjusting amount filters.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Load More Pagination Footer */}
          {visibleCount < filtered.length && (
            <div className="p-4 border-t border-abyss-border flex items-center justify-between text-xs bg-abyss-well/40">
              <span className="text-abyss-textMuted">
                Showing {visibleCount} of {filtered.length.toLocaleString('en-IN')} transactions
              </span>
              <button
                onClick={() => setVisibleCount(prev => prev + 50)}
                className="btn-emerald-capsule px-4 py-1.5 rounded-xl font-bold shadow-sm"
              >
                Load Next 50 Transactions ↓
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TRANSACTION DETAIL POPUP MODAL ────────────────────────────── */}
      {selectedTx && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-emergence"
          onClick={() => setSelectedTx(null)}
        >
          <div 
            className="vision-card w-full max-w-lg p-6 space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-abyss-border pb-3">
              <div className="flex items-center gap-2.5">
                <BrandLogoBadge entityName={selectedTx.entityName || selectedTx.narration || selectedTx.rawNarration} size="md" />
                <div>
                  <h3 className="text-sm font-bold text-abyss-textPrimary">{selectedTx.entityName || selectedTx.narration}</h3>
                  <p className="text-[10px] font-mono text-abyss-textMuted">{selectedTx.transactionDate}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-abyss-well text-abyss-textMuted flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-abyss-well border border-abyss-border text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-abyss-textMuted">Transaction Amount</span>
              <div className={`text-2xl font-black font-mono ${selectedTx.direction === 'CREDIT' ? 'text-[#00884E] dark:text-[#1AE893]' : 'text-rose-500'}`}>
                {selectedTx.direction === 'CREDIT' ? '+' : '-'}₹{selectedTx.amount.toLocaleString('en-IN')}
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-abyss-card border border-abyss-border text-abyss-textSecondary">
                {TAXONOMY_LABELS[selectedTx.category as ClassificationTaxonomy] || selectedTx.category}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-abyss-border">
                <span className="text-abyss-textMuted">Reference / UTR</span>
                <span className="font-mono font-bold text-abyss-textPrimary">{selectedTx.referenceNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-abyss-border">
                <span className="text-abyss-textMuted">UPI Handle</span>
                <span className="font-mono text-abyss-textPrimary">{selectedTx.upiHandle || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-abyss-border">
                <span className="text-abyss-textMuted">Running Balance</span>
                <span className="font-mono font-bold text-abyss-textPrimary">
                  {selectedTx.balanceAfter !== null && selectedTx.balanceAfter !== undefined ? `₹${selectedTx.balanceAfter.toLocaleString('en-IN')}` : 'N/A'}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-abyss-textMuted block text-[10px] uppercase font-bold mb-1">Raw Bank Narration</span>
                <p className="p-2.5 rounded-xl bg-abyss-well border border-abyss-border font-mono text-[11px] text-abyss-textSecondary break-words">
                  {selectedTx.rawNarration}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl btn-emerald-capsule font-bold text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
