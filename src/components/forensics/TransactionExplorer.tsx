/**
 * TransactionExplorer — Full Master Transaction Ledger with Search, Filters, and Spend Calendar Analytical Workspace.
 * Includes dynamic live summary cards computing whole credits sum, debits sum, net flow, and transaction metrics.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ClassificationTaxonomy, LiveAnalyticsResult } from '../../engine/analyticsEngine';
import { CanonicalTransaction } from '../../types';
import { MasterLedgerCalendar } from './MasterLedgerCalendar';
import { BrandLogoBadge } from './BrandLogoBadge';
import { Calendar as CalendarIcon, Filter, Search, ArrowUpRight, ArrowDownRight, X, Sparkles, AlertTriangle } from 'lucide-react';

interface TransactionExplorerProps {
  liveResult: LiveAnalyticsResult | null;
  isDark: boolean;
  initialDate?: string | null;
  initialTab?: 'ALL' | 'CALENDAR' | 'TRANSFERS' | 'LOANS' | 'RECURRING' | 'REVIEW';
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

const CONFIDENCE_COLORS = {
  HIGH: 'text-[#30D158]',
  MEDIUM: 'text-[#FF9F0A]',
  LOW: 'text-[#FF453A]',
};

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ 
  liveResult, 
  isDark,
  initialDate = null,
  initialTab = 'ALL',
  onDateChange
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CALENDAR' | 'TRANSFERS' | 'LOANS' | 'RECURRING' | 'REVIEW'>(initialTab);
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [taxFilter, setTaxFilter] = useState<string>('ALL');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [selectedTx, setSelectedTx] = useState<CanonicalTransaction | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [visibleCount, setVisibleCount] = useState(50);

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

  const filtered = useMemo(() => {
    return txns.filter(t => {
      // Tab filter
      if (activeTab === 'TRANSFERS') {
        if (t.category !== 'PERSONAL_TRANSFER' && t.category !== 'UPI_TRANSFER_UNKNOWN' && t.financialType !== 'TRANSFER' && t.category !== 'SELF_TRANSFER') return false;
      } else if (activeTab === 'LOANS') {
        if (t.category !== 'LOAN_REPAYMENT' && t.category !== 'LOAN_CREDIT' && t.financialType !== 'DEBT_REPAYMENT' && t.financialType !== 'DEBT_DISBURSEMENT') return false;
      } else if (activeTab === 'RECURRING') {
        if (t.category !== 'SUBSCRIPTION' && t.category !== 'BILL_UTILITY' && !t.isRecurring) return false;
      } else if (activeTab === 'REVIEW') {
        if (t.amount < 15000 && t.categoryConfidence >= 0.7 && !t.isAnomaly) return false;
      }

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
  }, [txns, search, dirFilter, taxFilter, minAmt, maxAmt, activeTab, selectedDate]);

  // Dynamic Live Summary Metrics of Filtered Ledger
  const summary = useMemo(() => {
    let creditSum = 0;
    let debitSum = 0;
    let creditCount = 0;
    let debitCount = 0;
    let maxAmount = 0;

    for (const t of filtered) {
      if (t.credit && t.credit > 0) {
        creditSum += t.credit;
        creditCount++;
      }
      if (t.debit && t.debit > 0) {
        debitSum += t.debit;
        debitCount++;
      }
      if (t.amount > maxAmount) {
        maxAmount = t.amount;
      }
    }

    const netFlow = creditSum - debitSum;
    const avgTxn = filtered.length > 0 ? (creditSum + debitSum) / filtered.length : 0;

    return {
      creditSum,
      debitSum,
      netFlow,
      creditCount,
      debitCount,
      totalCount: filtered.length,
      maxAmount,
      avgTxn,
    };
  }, [filtered]);

  const visible = filtered.slice(0, visibleCount);

  if (!liveResult) {
    return (
      <div className="spatial-card p-8 text-center">
        <div className="text-4xl mb-3">📑</div>
        <div className="text-sm font-bold text-white mb-1">Transaction Explorer</div>
        <div className="text-xs text-white/50">
          Upload your bank statement to explore all transactions with powerful search, filter, and drill-down.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans animate-fade-in">
      {/* Master Ledger Sub-Navigation Tabs Ornament */}
      <div className="spatial-card p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: '📋 All Transactions', count: txns.length },
          { id: 'CALENDAR', label: '📅 Spend Calendar', count: undefined, highlight: true },
          { id: 'TRANSFERS', label: '👥 Transfers', count: txns.filter(t => t.category === 'PERSONAL_TRANSFER' || t.category === 'UPI_TRANSFER_UNKNOWN' || t.financialType === 'TRANSFER').length },
          { id: 'LOANS', label: '🏦 Loans & EMIs', count: txns.filter(t => t.category === 'LOAN_REPAYMENT' || t.category === 'LOAN_CREDIT').length },
          { id: 'RECURRING', label: '🔄 Recurring & Bills', count: txns.filter(t => t.category === 'SUBSCRIPTION' || t.category === 'BILL_UTILITY' || t.isRecurring).length },
          { id: 'REVIEW', label: '🚨 Review & Anomalies', count: txns.filter(t => t.amount >= 15000 || t.categoryConfidence < 0.7 || t.isAnomaly).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'spatial-btn-selected'
                : 'spatial-btn text-white/70'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === tab.id 
                  ? 'bg-black/15 text-black' 
                  : 'bg-white/10 text-white/60'
              }`}>
                {tab.count.toLocaleString('en-IN')}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Spend Calendar Analytical Workspace Tab */}
      {activeTab === 'CALENDAR' && (
        <MasterLedgerCalendar
          transactions={txns}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          isDark={true}
          onFilterLedgerToDate={(date) => {
            handleSelectDate(date);
            setActiveTab('ALL');
          }}
          onCategoryFilterChange={(cat) => {
            if (cat === 'ALL') setTaxFilter('ALL');
            else if (cat === 'LOANS') setTaxFilter('LOAN_REPAYMENT');
            else if (cat === 'TRANSFERS') setTaxFilter('PERSONAL_TRANSFER');
          }}
        />
      )}

      {/* Main Ledger Table View */}
      {activeTab !== 'CALENDAR' && (
        <div className="space-y-4">
          {/* Active Date Filter Banner if filtered from calendar */}
          {selectedDate && (
            <div className="p-4 rounded-[16px] bg-[#30D158]/15 border border-[#30D158]/30 flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <div>
                  <span className="text-xs font-bold font-mono text-[#30D158]">Filtered to Date: {selectedDate}</span>
                  <span className="text-xs text-white/60 ml-2">({filtered.length} transactions found)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('CALENDAR')}
                  className="spatial-btn px-3 py-1 text-xs font-semibold text-white"
                >
                  View in Calendar
                </button>
                <button
                  onClick={() => handleSelectDate(null)}
                  className="spatial-btn px-3 py-1 text-xs font-semibold text-[#FF453A] flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filter</span>
                </button>
              </div>
            </div>
          )}

          {/* Header & Main Controls */}
          <div className="spatial-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 text-white">
                  <span>📑</span>
                  <span>Master Transaction Ledger</span>
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {txns.length.toLocaleString('en-IN')} total transactions • Showing {Math.min(visibleCount, filtered.length)} of {filtered.length.toLocaleString('en-IN')} filtered
                </p>
              </div>
              <div className="flex gap-2">
                {(['ALL', 'CREDIT', 'DEBIT'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDirFilter(d)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                      dirFilter === d
                        ? d === 'CREDIT' 
                          ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30 font-bold'
                          : d === 'DEBIT' 
                          ? 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30 font-bold'
                          : 'spatial-btn-selected'
                        : 'spatial-btn text-white/60'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[10px] font-bold uppercase text-[#30D158] flex items-center justify-between">
                  <span>Total Inflow</span>
                  <span className="text-[9px] font-mono text-white/50">{summary.creditCount} txns</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono mt-1 text-[#30D158]">
                  ₹{summary.creditSum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  {summary.totalCount > 0 ? `${((summary.creditCount / summary.totalCount) * 100).toFixed(1)}% of volume` : '0%'}
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[10px] font-bold uppercase text-[#FF453A] flex items-center justify-between">
                  <span>Total Outflow</span>
                  <span className="text-[9px] font-mono text-white/50">{summary.debitCount} txns</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono mt-1 text-[#FF453A]">
                  ₹{summary.debitSum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  {summary.totalCount > 0 ? `${((summary.debitCount / summary.totalCount) * 100).toFixed(1)}% of volume` : '0%'}
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[10px] font-bold uppercase text-white/50 flex items-center justify-between">
                  <span>Net Cash Flow</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${summary.netFlow >= 0 ? 'bg-[#30D158]/20 text-[#30D158]' : 'bg-[#FF453A]/20 text-[#FF453A]'}`}>
                    {summary.netFlow >= 0 ? 'SURPLUS' : 'DEFICIT'}
                  </span>
                </div>
                <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${summary.netFlow >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                  {summary.netFlow >= 0 ? '+' : ''}₹{summary.netFlow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">Inflow minus Outflow</div>
              </div>

              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[10px] font-bold uppercase text-white/50">Filtered Ledger</div>
                <div className="text-base sm:text-lg font-bold font-mono mt-1 text-[#0A84FF]">
                  {summary.totalCount.toLocaleString('en-IN')} <span className="text-xs font-normal text-white/40">/ {txns.length}</span>
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  Avg: ₹{Math.round(summary.avgTxn).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Search + Amount Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="col-span-2">
                <div className="text-[10px] font-bold uppercase text-white/50 mb-1">Search narration / entity / ref no</div>
                <input
                  className="px-4 py-2.5 rounded-full text-xs bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none w-full focus:border-white transition"
                  placeholder="Search EPFO, Swiggy, Salary, UTR, Ref No..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-white/50 mb-1">Min Amount (₹)</div>
                <input
                  className="px-4 py-2.5 rounded-full text-xs bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none w-full focus:border-white transition"
                  placeholder="0"
                  value={minAmt}
                  onChange={e => setMinAmt(e.target.value)}
                  type="number"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-white/50 mb-1">Max Amount (₹)</div>
                <input
                  className="px-4 py-2.5 rounded-full text-xs bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none w-full focus:border-white transition"
                  placeholder="Any"
                  value={maxAmt}
                  onChange={e => setMaxAmt(e.target.value)}
                  type="number"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 flex-wrap pt-1">
              <button
                onClick={() => setTaxFilter('ALL')}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold transition border ${
                  taxFilter === 'ALL'
                    ? 'spatial-btn-selected'
                    : 'spatial-btn text-white/60'
                }`}
              >
                All Categories ({txns.length})
              </button>
              {Object.entries(TAXONOMY_LABELS).map(([tax, label]) => {
                const count = txns.filter(t => t.category === tax).length;
                if (count === 0 && taxFilter !== tax) return null;
                return (
                  <button
                    key={tax}
                    onClick={() => setTaxFilter(tax === taxFilter ? 'ALL' : tax)}
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold transition border ${
                      taxFilter === tax
                        ? 'spatial-btn-selected'
                        : 'spatial-btn text-white/60'
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-white/5 border border-white/10 rounded-[16px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                <thead className="bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                  <tr className="border-b border-white/10">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Narration & Entity</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Debit</th>
                    <th className="p-3.5 text-right">Credit</th>
                    <th className="p-3.5 text-right">Balance</th>
                    <th className="p-3.5 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center">
                        <div className="text-xs text-white/40">No transactions match your filters.</div>
                      </td>
                    </tr>
                  ) : (
                    visible.map((tx) => (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTx(selectedTx?.id === tx.id ? null : tx)}
                        className={`text-xs cursor-pointer transition-colors hover:bg-white/5 ${
                          selectedTx?.id === tx.id ? 'bg-white/10' : ''
                        }`}
                      >
                        <td className="p-3.5 font-mono text-[10px] whitespace-nowrap text-white/50">
                          {tx.transactionDate}
                        </td>
                        <td className="p-3.5 max-w-[280px]">
                          <div className="flex items-center gap-2.5">
                            <BrandLogoBadge entityName={tx.entityName || tx.rawNarration} size="sm" />
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate">{tx.entityName}</div>
                              <div className="text-[10px] text-white/40 truncate">{tx.rawNarration.substring(0, 60)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-bold text-white/80">
                            {TAXONOMY_LABELS[tx.category as ClassificationTaxonomy] || tx.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          {tx.debit ? (
                            <span className="text-[#FF453A] font-bold">₹{tx.debit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          {tx.credit ? (
                            <span className="text-[#30D158] font-bold">₹{tx.credit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                        <td className="p-3.5 text-right font-mono text-[10px] text-white/60">
                          {tx.balanceAfter != null ? `₹${tx.balanceAfter.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[9px] font-bold ${CONFIDENCE_COLORS[(tx.categoryConfidence > 0.8 ? 'HIGH' : tx.categoryConfidence > 0.4 ? 'MEDIUM' : 'LOW')]}`}>
                            {(tx.categoryConfidence > 0.8 ? 'HIGH' : tx.categoryConfidence > 0.4 ? 'MEDIUM' : 'LOW')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {visible.length < filtered.length && (
              <div className="p-4 text-center border-t border-white/5">
                <button
                  onClick={() => setVisibleCount(v => v + 50)}
                  className="spatial-btn px-6 py-2 rounded-full text-xs font-semibold text-white/80 hover:text-white"
                >
                  Load 50 more ({filtered.length - visible.length} remaining)
                </button>
              </div>
            )}
          </div>

          {/* Detail Drawer */}
          {selectedTx && (
            <div className="spatial-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <BrandLogoBadge entityName={selectedTx.entityName || selectedTx.rawNarration} size="md" />
                  <div>
                    <div className="text-sm font-bold text-white">{selectedTx.entityName}</div>
                    <div className="text-[10px] mt-0.5 font-mono text-white/50">{selectedTx.transactionDate} • {selectedTx.channel}</div>
                  </div>
                </div>
                <div className={`text-xl font-bold font-mono ${selectedTx.direction === 'CREDIT' ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                  {selectedTx.direction === 'CREDIT' ? '+' : '-'}₹{selectedTx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Classification', value: TAXONOMY_LABELS[selectedTx.category as ClassificationTaxonomy] || selectedTx.category },
                  { label: 'Confidence', value: `${Math.round(selectedTx.categoryConfidence * 100)}%` },
                  { label: 'Reason', value: selectedTx.subcategory },
                  { label: 'Channel', value: selectedTx.channel },
                  { label: 'Reference', value: selectedTx.referenceNumber || 'N/A' },
                  { label: 'Balance After', value: selectedTx.balanceAfter != null ? `₹${selectedTx.balanceAfter.toLocaleString('en-IN')}` : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-[12px] bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold uppercase text-white/40">{label}</div>
                    <div className="text-xs font-semibold mt-0.5 text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase text-white/40 mb-1">Full Narration</div>
                <div className="text-[11px] font-mono p-3 rounded-[12px] bg-black/40 border border-white/10 text-white/80">
                  {selectedTx.rawNarration || selectedTx.narration}
                </div>
              </div>

              {/* Semantic Flags */}
              <div className="flex flex-wrap gap-1.5">
                {(selectedTx.financialType === 'INCOME') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30">INCOME</span>}
                {(selectedTx.category === 'EPFO_PF') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30">EPFO / PF WITHDRAWAL</span>}
                {(selectedTx.financialType === 'DEBT_DISBURSEMENT') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30">LOAN CREDIT (NOT INCOME)</span>}
                {(selectedTx.financialType === 'DEBT_REPAYMENT') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30">LOAN REPAYMENT</span>}
                {(selectedTx.category === 'CREDIT_CARD_PAYMENT') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-white/10 text-white border border-white/20">CC PAYMENT</span>}
                {(selectedTx.category === 'WALLET_MOVEMENT') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-white/10 text-white border border-white/20">WALLET MOVEMENT</span>}
                {(selectedTx.financialType === 'CASH_WITHDRAWAL') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-white/10 text-white border border-white/20">ATM CASH</span>}
                {selectedTx.isEconomicExpense && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-white/15 text-white border border-white/25">LIFESTYLE SPEND</span>}
                {(selectedTx.category === 'PERSONAL_TRANSFER') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/30">PERSONAL TRANSFER</span>}
                {(selectedTx.category === 'SELF_TRANSFER') && <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-white/10 text-white border border-white/20">SELF TRANSFER</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
