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

const TAXONOMY_COLORS: Partial<Record<ClassificationTaxonomy, string>> = {
  SALARY: 'text-emerald-500',
  LOAN_CREDIT: 'text-amber-500',
  EPFO_PF: 'text-sky-400 font-black',
  REFUND: 'text-sky-400',
  LOAN_REPAYMENT: 'text-rose-500',
  CREDIT_CARD_PAYMENT: 'text-pink-500',
  PERSONAL_TRANSFER: 'text-violet-400',
  UPI_TRANSFER_UNKNOWN: 'text-violet-400',
  CASH_WITHDRAWAL: 'text-orange-400',
  WALLET_MOVEMENT: 'text-orange-300',
  FOOD: 'text-yellow-400',
  GROCERY: 'text-green-400',
  TRANSPORT: 'text-cyan-400',
  SHOPPING: 'text-purple-400',
  SUBSCRIPTION: 'text-indigo-400',
  BILL_UTILITY: 'text-blue-400',
  INSURANCE: 'text-sky-600',
  BANK_CHARGE: 'text-slate-400',
};

const CONFIDENCE_COLORS = {
  HIGH: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  LOW: 'text-rose-400',
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

  const cardCls = `rounded-[28px] border transition-all duration-300 ${isDark ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'}`;
  const inputCls = `px-3 py-2 rounded-xl text-xs border outline-none w-full backdrop-blur-md transition-all duration-200 ${isDark ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20'}`;
  const labelCls = `text-[10px] font-black uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  if (!liveResult) {
    return (
      <div className={`p-8 ${cardCls} text-center`}>
        <div className="text-4xl mb-3">📑</div>
        <div className="text-sm font-black mb-1 font-heading">Transaction Explorer</div>
        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Upload your bank statement to explore all transactions with powerful search, filter, and drill-down.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans animate-fade-in">
      {/* Master Ledger Sub-Navigation Tabs */}
      <div className={`p-2 rounded-2xl border flex items-center gap-1.5 overflow-x-auto scrollbar-none ${
        isDark ? 'bg-[#0B131B] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
      }`}>
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? isDark 
                  ? 'bg-white text-slate-950 shadow-md font-bold' 
                  : 'bg-slate-900 text-white shadow-md font-bold'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id 
                  ? isDark ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-black/20 text-white font-bold' 
                  : 'bg-white/10 text-slate-400'
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
          isDark={isDark}
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

      {/* Main Ledger Table View (Rendered when in ALL, TRANSFERS, LOANS, RECURRING, REVIEW tabs) */}
      {activeTab !== 'CALENDAR' && (
        <div className="space-y-4">
          {/* Active Date Filter Banner if filtered from calendar */}
          {selectedDate && (
            <div className={`p-3 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <div>
                  <span className="text-xs font-bold font-mono">Filtered to Date: {selectedDate}</span>
                  <span className="text-[11px] opacity-80 ml-2">({filtered.length} transactions found)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('CALENDAR')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 transition"
                >
                  View in Calendar
                </button>
                <button
                  onClick={() => handleSelectDate(null)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filter</span>
                </button>
              </div>
            </div>
          )}

          {/* Header & Main Controls */}
          <div className={`p-5 ${cardCls} space-y-4`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-base font-black flex items-center gap-2 font-heading">
                  <span>📑</span>
                  <span>Master Transaction Ledger</span>
                </h2>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {txns.length.toLocaleString('en-IN')} total transactions • Showing {Math.min(visibleCount, filtered.length)} of {filtered.length.toLocaleString('en-IN')} filtered
                </p>
              </div>
              <div className="flex gap-2">
                {(['ALL', 'CREDIT', 'DEBIT'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDirFilter(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      dirFilter === d
                        ? d === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                          : d === 'DEBIT' ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
                          : (isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-800 text-white border border-slate-700')
                        : (isDark ? 'text-slate-400 border border-transparent hover:border-white/10' : 'text-slate-500 border border-transparent hover:border-slate-200')
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="text-[10px] font-bold uppercase text-emerald-400 flex items-center justify-between">
                  <span>Total Inflow (Credits)</span>
                  <span className="text-[9px] font-mono">{summary.creditCount} txns</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono mt-1 text-emerald-400">
                  ₹{summary.creditSum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">
                  {summary.totalCount > 0 ? `${((summary.creditCount / summary.totalCount) * 100).toFixed(1)}% of volume` : '0%'}
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                <div className="text-[10px] font-bold uppercase text-rose-400 flex items-center justify-between">
                  <span>Total Outflow (Debits)</span>
                  <span className="text-[9px] font-mono">{summary.debitCount} txns</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono mt-1 text-rose-400">
                  ₹{summary.debitSum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">
                  {summary.totalCount > 0 ? `${((summary.debitCount / summary.totalCount) * 100).toFixed(1)}% of volume` : '0%'}
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#142027] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Net Cash Flow</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${summary.netFlow >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {summary.netFlow >= 0 ? 'SURPLUS' : 'DEFICIT'}
                  </span>
                </div>
                <div className={`text-base sm:text-lg font-black font-mono mt-1 ${summary.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {summary.netFlow >= 0 ? '+' : ''}₹{summary.netFlow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Inflow minus Outflow</div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#142027] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] font-bold uppercase text-slate-400">Filtered Ledger</div>
                <div className="text-base sm:text-lg font-black font-mono mt-1 text-indigo-400">
                  {summary.totalCount.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ {txns.length}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Avg: ₹{Math.round(summary.avgTxn).toLocaleString('en-IN')} • Max: ₹{Math.round(summary.maxAmount).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Search + Amount Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="col-span-2">
                <div className={labelCls + ' mb-1'}>Search narration / entity / ref no</div>
                <input
                  className={inputCls}
                  placeholder="Search EPFO, Swiggy, Salary, UTR, Ref No..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div>
                <div className={labelCls + ' mb-1'}>Min Amount (₹)</div>
                <input
                  className={inputCls}
                  placeholder="0"
                  value={minAmt}
                  onChange={e => setMinAmt(e.target.value)}
                  type="number"
                />
              </div>
              <div>
                <div className={labelCls + ' mb-1'}>Max Amount (₹)</div>
                <input
                  className={inputCls}
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
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                  taxFilter === 'ALL'
                    ? (isDark ? 'bg-white/10 border-white/20 text-white font-bold' : 'bg-slate-800 border-slate-700 text-white font-bold')
                    : (isDark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500')
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
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                      taxFilter === tax
                        ? (isDark ? 'bg-white/15 border-white/20 text-white font-bold' : 'bg-slate-700 border-slate-600 text-white font-bold')
                        : (isDark ? 'border-white/[0.06] text-slate-500 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:text-slate-700')
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transaction Table */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className={`text-[10px] font-black uppercase tracking-wide border-b ${isDark ? 'border-white/[0.07] text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Narration & Entity</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-right">Debit</th>
                    <th className="p-3 text-right">Credit</th>
                    <th className="p-3 text-right">Balance</th>
                    <th className="p-3 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center">
                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No transactions match your filters.</div>
                      </td>
                    </tr>
                  ) : (
                    visible.map((tx) => (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTx(selectedTx?.id === tx.id ? null : tx)}
                        className={`text-xs border-b cursor-pointer transition-colors ${
                          isDark 
                            ? `border-white/[0.04] hover:bg-white/[0.03] ${selectedTx?.id === tx.id ? 'bg-white/[0.05]' : ''}` 
                            : `border-slate-50 hover:bg-slate-50 ${selectedTx?.id === tx.id ? 'bg-slate-100' : ''}`
                        }`}
                      >
                        <td className={`p-3 font-mono text-[10px] whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {tx.transactionDate}
                        </td>
                        <td className="p-3 max-w-[280px]">
                          <div className="flex items-center gap-2">
                            <BrandLogoBadge entityName={tx.entityName || tx.rawNarration} size="sm" />
                            <div className="min-w-0">
                              <div className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{tx.entityName}</div>
                              <div className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{tx.rawNarration.substring(0, 60)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold ${TAXONOMY_COLORS[tx.category as ClassificationTaxonomy] || (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                            {TAXONOMY_LABELS[tx.category as ClassificationTaxonomy] || tx.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {tx.debit ? (
                            <span className="text-rose-500 font-black">₹{tx.debit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          ) : <span className={isDark ? 'text-slate-700' : 'text-slate-200'}>—</span>}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {tx.credit ? (
                            <span className="text-emerald-500 font-black">₹{tx.credit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          ) : <span className={isDark ? 'text-slate-700' : 'text-slate-200'}>—</span>}
                        </td>
                        <td className={`p-3 text-right font-mono text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {tx.balanceAfter != null ? `₹${tx.balanceAfter.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[9px] font-black ${CONFIDENCE_COLORS[(tx.categoryConfidence > 0.8 ? 'HIGH' : tx.categoryConfidence > 0.4 ? 'MEDIUM' : 'LOW')]}`}>
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
              <div className="p-4 text-center">
                <button
                  onClick={() => setVisibleCount(v => v + 50)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Load 50 more ({filtered.length - visible.length} remaining)
                </button>
              </div>
            )}
          </div>

          {/* Detail Drawer */}
          {selectedTx && (
            <div className={`p-5 ${cardCls} space-y-4 border-l-4 ${selectedTx.direction === 'CREDIT' ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <BrandLogoBadge entityName={selectedTx.entityName || selectedTx.rawNarration} size="md" />
                  <div>
                    <div className="text-sm font-black font-heading">{selectedTx.entityName}</div>
                    <div className={`text-[10px] mt-0.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedTx.transactionDate} • {selectedTx.channel}</div>
                  </div>
                </div>
                <div className={`text-xl font-black font-mono ${selectedTx.direction === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                  <div key={label}>
                    <div className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                    <div className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className={`text-[10px] font-black uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Full Narration</div>
                <div className={`text-[11px] font-mono p-3 rounded-xl ${isDark ? 'bg-black/30 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                  {selectedTx.rawNarration || selectedTx.narration}
                </div>
              </div>

              {/* Semantic Flags */}
              <div className="flex flex-wrap gap-1.5">
                {(selectedTx.financialType === 'INCOME') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-400/20">INCOME</span>}
                {(selectedTx.category === 'EPFO_PF') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-sky-500/15 text-sky-400 border border-sky-400/20">EPFO / PF WITHDRAWAL</span>}
                {(selectedTx.financialType === 'DEBT_DISBURSEMENT') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500/15 text-amber-400 border border-amber-400/20">LOAN CREDIT (NOT INCOME)</span>}
                {(selectedTx.financialType === 'DEBT_REPAYMENT') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500/15 text-rose-400 border border-rose-400/20">LOAN REPAYMENT</span>}
                {(selectedTx.category === 'CREDIT_CARD_PAYMENT') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-pink-500/15 text-pink-400 border border-pink-400/20">CC PAYMENT</span>}
                {(selectedTx.category === 'WALLET_MOVEMENT') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-orange-500/15 text-orange-400 border border-orange-400/20">WALLET MOVEMENT</span>}
                {(selectedTx.financialType === 'CASH_WITHDRAWAL') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-orange-800/20 text-orange-400 border border-orange-400/20">ATM CASH</span>}
                {selectedTx.isEconomicExpense && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-teal-500/15 text-teal-400 border border-teal-400/20">LIFESTYLE SPEND</span>}
                {(selectedTx.category === 'PERSONAL_TRANSFER') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-violet-500/15 text-violet-400 border border-violet-400/20">PERSONAL TRANSFER</span>}
                {(selectedTx.category === 'SELF_TRANSFER') && <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-slate-500/15 text-slate-400 border border-slate-400/20">SELF TRANSFER</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
