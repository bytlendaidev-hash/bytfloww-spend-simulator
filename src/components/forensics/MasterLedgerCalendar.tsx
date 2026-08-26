/**
 * MasterLedgerCalendar — Flagship Financial Activity Map & Intelligence Workspace
 * 
 * Rebuilt to the highest product-design standards (Apple/Linear/Stripe fintech aesthetic).
 * Directly connected to the Master Transaction Ledger — 100% mathematical reconciliation.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CanonicalTransaction } from '../../types';
import { BrandLogoBadge } from './BrandLogoBadge';
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Clock, 
  List, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Maximize2,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface MasterLedgerCalendarProps {
  transactions: CanonicalTransaction[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  isDark: boolean;
  onFilterLedgerToDate?: (date: string) => void;
  onCategoryFilterChange?: (category: string) => void;
}

export interface DayAggregate {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  isCurrentMonth: boolean;
  hasStatementCoverage: boolean;
  totalCredits: number;
  totalDebits: number;
  netDelta: number;
  txnCount: number;
  creditCount: number;
  debitCount: number;
  largestDebit: number;
  largestCredit: number;
  largestTxn: CanonicalTransaction | null;
  dominantCategory: string;
  endingBalance: number | null;
  hasSalary: boolean;
  hasEpfo: boolean;
  hasLoanRepayment: boolean;
  hasLoanCredit: boolean;
  hasCashWdl: boolean;
  hasBankCharge: boolean;
  hasInterest: boolean;
  hasRefund: boolean;
  isUnusual: boolean;
  anomalyCount: number;
  reviewCount: number;
  activityScore: number; // 0 to 1 (percentile scaled)
  transactions: CanonicalTransaction[];
}

export const CATEGORY_TAXONOMY_MAP: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  SALARY: { label: 'Corporate Salary', icon: '💼', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  LOAN_CREDIT: { label: 'Loan Disbursal', icon: '🏦', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  EPFO_PF: { label: 'EPFO / PF Claim', icon: '🏛️', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  REFUND: { label: 'Refund / Reversal', icon: '↩️', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  REIMBURSEMENT: { label: 'Reimbursement', icon: '🧾', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  INTEREST_INCOME: { label: 'Savings Interest', icon: '💰', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  OTHER_INCOME: { label: 'Other Inflow', icon: '📥', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  
  LOAN_REPAYMENT: { label: 'Loan EMI Repayment', icon: '🔴', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  CREDIT_CARD_PAYMENT: { label: 'Card Bill / CRED', icon: '💳', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  PERSONAL_TRANSFER: { label: 'Peer Transfer', icon: '👤', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  UPI_TRANSFER_UNKNOWN: { label: 'UPI Transfer', icon: '👥', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  SELF_TRANSFER: { label: 'Self Transfer', icon: '🔄', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  WALLET_MOVEMENT: { label: 'Wallet Movement', icon: '📱', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  PAYMENT_BANK_MOVEMENT: { label: 'Payment Bank', icon: '📱', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  CASH_WITHDRAWAL: { label: 'ATM Cash Withdrawal', icon: '🏧', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  FOOD: { label: 'Food & Dining', icon: '🍔', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  GROCERY: { label: 'Groceries & Quick Comm', icon: '🛒', bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/20' },
  TRANSPORT: { label: 'Travel & Commute', icon: '🚕', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  SHOPPING: { label: 'Shopping & E-Comm', icon: '🛍️', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20' },
  BILL_UTILITY: { label: 'Bills & Utilities', icon: '⚡', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  SUBSCRIPTION: { label: 'Digital Subscription', icon: '🎬', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  INSURANCE: { label: 'Insurance Policy', icon: '🛡️', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  BANK_CHARGE: { label: 'Bank Fee / Tax', icon: '🏛️', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  OTHER: { label: 'Other Expense', icon: '📦', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  UNKNOWN: { label: 'Miscellaneous', icon: '📄', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export function formatCategoryMeta(cat: string) {
  return CATEGORY_TAXONOMY_MAP[cat] || {
    label: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: '💳',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  };
}

/** Format currency compactly for calendar tiles */
export function formatCompactRupee(val: number): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '−' : '+';
  if (abs >= 100000) {
    const lakh = abs / 100000;
    return `${sign}₹${lakh >= 10 ? lakh.toFixed(1) : lakh.toFixed(2)}L`;
  }
  if (abs >= 1000) {
    const k = abs / 1000;
    return `${sign}₹${k >= 10 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${sign}₹${Math.round(abs)}`;
}

/** Standard Indian Rupee full precision formatter */
export function formatFullRupee(val: number, showSign = false): string {
  const abs = Math.abs(val);
  const sign = showSign ? (val < 0 ? '−' : val > 0 ? '+' : '') : (val < 0 ? '−' : '');
  return `${sign}₹${abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const MasterLedgerCalendar: React.FC<MasterLedgerCalendarProps> = ({
  transactions,
  selectedDate,
  onSelectDate,
  isDark,
  onFilterLedgerToDate,
  onCategoryFilterChange,
}) => {
  // Statement coverage boundaries & deduplicated date index
  const { earliestDate, latestDate, availableMonths, txnsByDate, totalDeduplicatedTxns } = useMemo(() => {
    let earliest = '9999-99-99';
    let latest = '0000-00-00';
    const monthSet = new Set<string>();
    const byDate = new Map<string, CanonicalTransaction[]>();

    for (const t of transactions) {
      const d = t.transactionDate;
      if (!d) continue;
      if (d < earliest) earliest = d;
      if (d > latest) latest = d;
      if (d.length >= 7) monthSet.add(d.substring(0, 7));

      const list = byDate.get(d) || [];
      list.push(t);
      byDate.set(d, list);
    }

    const months = Array.from(monthSet).sort();
    return {
      earliestDate: earliest === '9999-99-99' ? '2025-04-01' : earliest,
      latestDate: latest === '0000-00-00' ? '2026-08-25' : latest,
      availableMonths: months.length > 0 ? months : ['2026-08'],
      txnsByDate: byDate,
      totalDeduplicatedTxns: transactions.length,
    };
  }, [transactions]);

  // Current active month key (YYYY-MM)
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    if (selectedDate && selectedDate.length >= 7) {
      return selectedDate.substring(0, 7);
    }
    return availableMonths[availableMonths.length - 1] || '2026-08';
  });

  // Keep month in sync when selectedDate changes from external ledger
  useEffect(() => {
    if (selectedDate && selectedDate.length >= 7) {
      const targetMonth = selectedDate.substring(0, 7);
      if (targetMonth !== currentMonthKey) {
        setCurrentMonthKey(targetMonth);
      }
    }
  }, [selectedDate]);

  // UI Control states
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SPEND' | 'INCOME' | 'LOANS' | 'TRANSFERS' | 'UNUSUAL'>('ALL');
  const [density, setDensity] = useState<'COMFORTABLE' | 'COMPACT'>('COMFORTABLE');
  const [inspectorViewMode, setInspectorViewMode] = useState<'LIST' | 'TIMELINE'>('LIST');
  const [inspectModalTx, setInspectModalTx] = useState<CanonicalTransaction | null>(null);
  const [isCopiedRef, setIsCopiedRef] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Parse active year and month index
  const [currentYear, currentMonthIndex] = useMemo(() => {
    const parts = currentMonthKey.split('-');
    return [parseInt(parts[0], 10) || 2026, (parseInt(parts[1], 10) || 8) - 1];
  }, [currentMonthKey]);

  // Month navigation handlers
  const handlePrevMonth = useCallback(() => {
    const curIdx = availableMonths.indexOf(currentMonthKey);
    if (curIdx > 0) {
      setCurrentMonthKey(availableMonths[curIdx - 1]);
    } else {
      const d = new Date(currentYear, currentMonthIndex - 1, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      setCurrentMonthKey(k);
    }
    onSelectDate(null);
  }, [availableMonths, currentMonthKey, currentYear, currentMonthIndex, onSelectDate]);

  const handleNextMonth = useCallback(() => {
    const curIdx = availableMonths.indexOf(currentMonthKey);
    if (curIdx >= 0 && curIdx < availableMonths.length - 1) {
      setCurrentMonthKey(availableMonths[curIdx + 1]);
    } else {
      const d = new Date(currentYear, currentMonthIndex + 1, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      setCurrentMonthKey(k);
    }
    onSelectDate(null);
  }, [availableMonths, currentMonthKey, currentYear, currentMonthIndex, onSelectDate]);

  // Filter transactions dynamically based on selected category / type filter
  const filteredTransactions = useMemo(() => {
    if (categoryFilter === 'ALL') return transactions;
    return transactions.filter(t => {
      if (categoryFilter === 'INCOME') return t.direction === 'CREDIT';
      if (categoryFilter === 'SPEND') return t.direction === 'DEBIT' && t.financialType !== 'DEBT_REPAYMENT' && t.category !== 'LOAN_REPAYMENT';
      if (categoryFilter === 'LOANS') return t.financialType === 'DEBT_REPAYMENT' || t.financialType === 'DEBT_DISBURSEMENT' || t.category === 'LOAN_REPAYMENT' || t.category === 'LOAN_CREDIT';
      if (categoryFilter === 'TRANSFERS') return t.category === 'PERSONAL_TRANSFER' || t.category === 'UPI_TRANSFER_UNKNOWN' || t.financialType === 'TRANSFER' || t.category === 'SELF_TRANSFER';
      if (categoryFilter === 'UNUSUAL') return t.amount >= 15000 || t.isAnomaly;
      return true;
    });
  }, [transactions, categoryFilter]);

  // Group filtered transactions by date
  const filteredTxnsByDate = useMemo(() => {
    const map = new Map<string, CanonicalTransaction[]>();
    for (const t of filteredTransactions) {
      const d = t.transactionDate;
      if (!d) continue;
      const list = map.get(d) || [];
      list.push(t);
      map.set(d, list);
    }
    return map;
  }, [filteredTransactions]);

  // Robust percentile-based scaling for heatmap intensity
  const dailySpendStats = useMemo(() => {
    const allDebits: number[] = [];
    for (const [_, txList] of filteredTxnsByDate.entries()) {
      let dSum = 0;
      for (const t of txList) {
        if (t.direction === 'DEBIT') dSum += t.amount;
      }
      if (dSum > 0) allDebits.push(dSum);
    }
    allDebits.sort((a, b) => a - b);
    
    const p90 = allDebits.length > 0 ? allDebits[Math.floor(allDebits.length * 0.9)] || 10000 : 10000;
    const median = allDebits.length > 0 ? allDebits[Math.floor(allDebits.length * 0.5)] || 1000 : 1000;
    const mean = allDebits.length > 0 ? allDebits.reduce((s, v) => s + v, 0) / allDebits.length : 1000;

    return { p90, median, mean };
  }, [filteredTxnsByDate]);

  // Build the 42-day calendar matrix (6 weeks x 7 days)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    const cells: DayAggregate[] = [];

    const createDay = (dayNum: number, year: number, month: number, isCurr: boolean): DayAggregate => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayDate = new Date(year, month, dayNum);
      const dayOfWeek = dayDate.getDay();
      const hasCoverage = dateStr >= earliestDate && dateStr <= latestDate;
      const dayTxns = filteredTxnsByDate.get(dateStr) || [];

      let credits = 0;
      let debits = 0;
      let cCount = 0;
      let dCount = 0;
      let maxD = 0;
      let maxC = 0;
      let largestTx: CanonicalTransaction | null = null;
      let endBal: number | null = null;

      let hasSal = false;
      let hasEpf = false;
      let hasLoanRepay = false;
      let hasLoanCred = false;
      let hasCash = false;
      let hasBank = false;
      let hasInt = false;
      let hasRef = false;
      let anomCount = 0;
      let revCount = 0;
      const catCountMap: Record<string, number> = {};

      for (const t of dayTxns) {
        if (t.direction === 'CREDIT') {
          credits += t.amount;
          cCount++;
          if (t.amount > maxC) maxC = t.amount;
        } else {
          debits += t.amount;
          dCount++;
          if (t.amount > maxD) maxD = t.amount;
        }

        if (!largestTx || t.amount > largestTx.amount) {
          largestTx = t;
        }

        if (t.balanceAfter != null) {
          endBal = t.balanceAfter;
        }

        if (t.category === 'SALARY' || t.isSalary) hasSal = true;
        if (t.category === 'EPFO_PF') hasEpf = true;
        if (t.category === 'LOAN_REPAYMENT' || t.financialType === 'DEBT_REPAYMENT') hasLoanRepay = true;
        if (t.category === 'LOAN_CREDIT' || t.financialType === 'DEBT_DISBURSEMENT') hasLoanCred = true;
        if (t.category === 'CASH_WITHDRAWAL' || t.financialType === 'CASH_WITHDRAWAL') hasCash = true;
        if (t.category === 'BANK_CHARGE') hasBank = true;
        if (t.category === 'INTEREST_INCOME') hasInt = true;
        if (t.category === 'REFUND') hasRef = true;
        if (t.isAnomaly || t.amount >= 20000) anomCount++;
        if (t.categoryConfidence < 0.6) revCount++;

        catCountMap[t.category] = (catCountMap[t.category] || 0) + 1;
      }

      // Compute dominant category
      let dominant = 'GENERAL';
      let maxOccur = 0;
      for (const [c, cnt] of Object.entries(catCountMap)) {
        if (cnt > maxOccur) {
          maxOccur = cnt;
          dominant = c;
        }
      }

      const isUnusual = debits >= Math.max(15000, dailySpendStats.mean * 2.5) || credits >= 25000 || anomCount > 0;
      
      // Percentile scaled activity score [0..1]
      const activityScore = dailySpendStats.p90 > 0 ? Math.min(1, debits / dailySpendStats.p90) : 0;

      return {
        dateStr,
        dayNumber: dayNum,
        dayOfWeek,
        isCurrentMonth: isCurr,
        hasStatementCoverage: hasCoverage,
        totalCredits: credits,
        totalDebits: debits,
        netDelta: credits - debits,
        txnCount: dayTxns.length,
        creditCount: cCount,
        debitCount: dCount,
        largestDebit: maxD,
        largestCredit: maxC,
        largestTxn: largestTx,
        dominantCategory: dominant,
        endingBalance: endBal,
        hasSalary: hasSal,
        hasEpfo: hasEpf,
        hasLoanRepayment: hasLoanRepay,
        hasLoanCredit: hasLoanCred,
        hasCashWdl: hasCash,
        hasBankCharge: hasBank,
        hasInterest: hasInt,
        hasRefund: hasRef,
        isUnusual,
        anomalyCount: anomCount,
        reviewCount: revCount,
        activityScore,
        transactions: dayTxns,
      };
    };

    // 1. Previous month trailing days
    const prevMonthDays = new Date(currentYear, currentMonthIndex, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      const prevDate = new Date(currentYear, currentMonthIndex - 1, dNum);
      cells.push(createDay(dNum, prevDate.getFullYear(), prevDate.getMonth(), false));
    }

    // 2. Current active month days
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(createDay(day, currentYear, currentMonthIndex, true));
    }

    // 3. Next month leading days (fill to 35 or 42 grid cells)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(currentYear, currentMonthIndex + 1, day);
      cells.push(createDay(day, nextDate.getFullYear(), nextDate.getMonth(), false));
    }

    return cells;
  }, [currentYear, currentMonthIndex, earliestDate, latestDate, filteredTxnsByDate, dailySpendStats]);

  // Current Month Summary Metrics (Directly reconciled from Daily Aggregates)
  const monthSummary = useMemo(() => {
    let credits = 0;
    let debits = 0;
    let count = 0;
    let activeDays = 0;
    let coveredDays = 0;
    let peakOutflowDay = '';
    let peakOutflowAmt = 0;
    let peakInflowDay = '';
    let peakInflowAmt = 0;
    const catFreqMap: Record<string, number> = {};

    for (const cell of calendarCells) {
      if (cell.isCurrentMonth) {
        if (cell.hasStatementCoverage) coveredDays++;
        credits += cell.totalCredits;
        debits += cell.totalDebits;
        count += cell.txnCount;
        if (cell.txnCount > 0) activeDays++;

        if (cell.totalDebits > peakOutflowAmt) {
          peakOutflowAmt = cell.totalDebits;
          peakOutflowDay = cell.dateStr;
        }
        if (cell.totalCredits > peakInflowAmt) {
          peakInflowAmt = cell.totalCredits;
          peakInflowDay = cell.dateStr;
        }

        if (cell.dominantCategory && cell.dominantCategory !== 'GENERAL') {
          catFreqMap[cell.dominantCategory] = (catFreqMap[cell.dominantCategory] || 0) + cell.totalDebits;
        }
      }
    }

    let topCat = 'General Outflow';
    let topCatAmt = 0;
    for (const [c, amt] of Object.entries(catFreqMap)) {
      if (amt > topCatAmt) {
        topCatAmt = amt;
        topCat = c;
      }
    }

    return {
      totalCredits: Math.round(credits),
      totalDebits: Math.round(debits),
      netDelta: Math.round(credits - debits),
      txnCount: count,
      activeDays,
      coveredDays,
      peakOutflowDay,
      peakOutflowAmt: Math.round(peakOutflowAmt),
      peakInflowDay,
      peakInflowAmt: Math.round(peakInflowAmt),
      topCategory: topCat,
    };
  }, [calendarCells]);

  // Check if current active month has any statement coverage at all
  const hasMonthCoverage = useMemo(() => {
    return monthSummary.coveredDays > 0;
  }, [monthSummary.coveredDays]);

  // Selected date detailed analytics & transactions
  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const rawTxns = txnsByDate.get(selectedDate) || [];
    let credits = 0;
    let debits = 0;
    const catMap: Record<string, number> = {};

    for (const t of rawTxns) {
      if (t.direction === 'CREDIT') {
        credits += t.amount;
      } else {
        debits += t.amount;
      }
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    }

    const catList = Object.entries(catMap)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: (debits + credits) > 0 ? (amt / (debits + credits)) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      date: selectedDate,
      totalCredits: credits,
      totalDebits: debits,
      netDelta: credits - debits,
      transactions: rawTxns,
      categories: catList,
    };
  }, [selectedDate, txnsByDate]);

  // Keyboard navigation across dates
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        if (inspectModalTx) {
          setInspectModalTx(null);
        } else if (selectedDate) {
          onSelectDate(null);
        }
        return;
      }

      if (!selectedDate) return;

      const [y, m, d] = selectedDate.split('-').map(Number);
      const curDate = new Date(y, m - 1, d);

      if (e.key === 'ArrowLeft') {
        curDate.setDate(curDate.getDate() - 1);
      } else if (e.key === 'ArrowRight') {
        curDate.setDate(curDate.getDate() + 1);
      } else if (e.key === 'ArrowUp') {
        curDate.setDate(curDate.getDate() - 7);
      } else if (e.key === 'ArrowDown') {
        curDate.setDate(curDate.getDate() + 7);
      } else {
        return;
      }

      const nextDateStr = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;
      if (nextDateStr >= earliestDate && nextDateStr <= latestDate) {
        onSelectDate(nextDateStr);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, earliestDate, latestDate, onSelectDate, inspectModalTx]);

  // Copy helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedRef(true);
    setTimeout(() => setIsCopiedRef(false), 1800);
  };

  const monthFormattedTitle = new Date(currentYear, currentMonthIndex, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const activeFY = useMemo(() => {
    // Determine Indian FY for current month (Apr - Mar)
    const fyStart = currentMonthIndex >= 3 ? currentYear : currentYear - 1;
    return `FY ${fyStart}–${String(fyStart + 1).slice(2)}`;
  }, [currentYear, currentMonthIndex]);

  // Empty state if no transactions uploaded
  if (!transactions || transactions.length === 0) {
    return (
      <div className={`p-8 sm:p-12 rounded-[28px] border text-center space-y-4 ${
        isDark ? 'bg-[#0E171E] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          📅
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-base font-bold font-heading">Spend Calendar</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Your financial activity calendar will appear here once bank statements are imported.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans animate-emergence select-none">
      {/* ── 1. HEADER & CONTROL TOOLBAR (LINEAR / APPLE FINTECH AESTHETIC) ──────── */}
      <div className={`p-4 sm:p-5 rounded-[24px] border transition-all duration-300 backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40' : 'bg-white/85 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left: Spend Calendar Title & Coverage Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-heading tracking-tight">Spend Calendar</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeFY}
                </span>
              </div>
              <p className={`text-[11px] font-medium flex items-center gap-1.5 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Daily financial activity</span>
                <span className="opacity-40">•</span>
                <span className="font-mono text-[10px] opacity-90">{earliestDate} → {latestDate}</span>
                <span className="opacity-40">•</span>
                <span className="font-mono text-[10px] opacity-90">{totalDeduplicatedTxns.toLocaleString('en-IN')} txns</span>
              </p>
            </div>
          </div>

          {/* Center: Month/Year Stepper & Dropdown Selector */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                isDark ? 'bg-white/5 border-white/[0.08] hover:bg-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Previous Month (‹)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-heading transition border flex items-center gap-2 ${
                  isDark ? 'bg-[#121E27] border-white/[0.1] text-white hover:border-emerald-400/40' : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-emerald-500/40'
                }`}
              >
                <span>{monthFormattedTitle}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Month Picker Dropdown */}
              {isMonthPickerOpen && (
                <div className={`absolute top-full left-0 mt-2 z-50 p-3 rounded-2xl border shadow-2xl min-w-[220px] max-h-[300px] overflow-y-auto scrollbar-thin ${
                  isDark ? 'bg-[#0E1720] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Statement Months</div>
                  <div className="space-y-1">
                    {availableMonths.map((mKey) => {
                      const [y, m] = mKey.split('-');
                      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
                      const lbl = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                      const isSelected = mKey === currentMonthKey;

                      return (
                        <button
                          key={mKey}
                          onClick={() => {
                            setCurrentMonthKey(mKey);
                            setIsMonthPickerOpen(false);
                            onSelectDate(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                            isSelected 
                              ? 'bg-emerald-500 text-slate-950 font-bold' 
                              : isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span>{lbl}</span>
                          {isSelected && <span className="text-[10px] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                isDark ? 'bg-white/5 border-white/[0.08] hover:bg-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Next Month (›)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Quick Range & Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Mode Pills */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 text-[11px] font-semibold ${
              isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-slate-100 border-slate-200'
            }`}>
              {(['ALL', 'SPEND', 'INCOME', 'LOANS', 'TRANSFERS', 'UNUSUAL'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setCategoryFilter(f);
                    if (onCategoryFilterChange) onCategoryFilterChange(f);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition text-[10px] font-bold ${
                    categoryFilter === f
                      ? isDark 
                        ? 'bg-white text-slate-950 shadow-sm font-bold' 
                        : 'bg-slate-900 text-white shadow-sm font-bold'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'SPEND' ? 'Spending' : f === 'INCOME' ? 'Inflow' : f === 'LOANS' ? 'Loans' : f === 'TRANSFERS' ? 'Transfers' : '⚡ Unusual'}
                </button>
              ))}
            </div>

            {/* Density Toggle */}
            <button
              onClick={() => setDensity(d => d === 'COMFORTABLE' ? 'COMPACT' : 'COMFORTABLE')}
              className={`p-2 rounded-xl text-xs border transition ${
                isDark ? 'bg-white/5 border-white/[0.08] text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={`Toggle Density (Currently ${density})`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 12-Month Mini Segmented Timeline Strip */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {availableMonths.map((mKey) => {
              const isSelected = mKey === currentMonthKey;
              const [y, m] = mKey.split('-');
              const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
              const mName = d.toLocaleDateString('en-IN', { month: 'short' });

              return (
                <button
                  key={mKey}
                  onClick={() => {
                    setCurrentMonthKey(mKey);
                    onSelectDate(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold font-mono transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm font-black'
                      : isDark
                      ? 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{mName}</span>
                  <span className={`text-[9px] ${isSelected ? 'opacity-90 font-black' : 'opacity-50'}`}>'{y.slice(2)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. UNIFIED MONTH INTELLIGENCE BAR ───────────────────────────────── */}
      <div className={`p-3.5 sm:p-4 rounded-[20px] border transition-all ${
        isDark ? 'bg-[#0E1620] border-white/[0.08] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3 text-xs font-mono">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IN:</span>
              <span className="font-black text-emerald-400">+{formatFullRupee(monthSummary.totalCredits)}</span>
            </div>
            <span className="text-slate-600 opacity-40">/</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OUT:</span>
              <span className="font-black text-rose-400">−{formatFullRupee(monthSummary.totalDebits)}</span>
            </div>
            <span className="text-slate-600 opacity-40">/</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NET:</span>
              <span className={`font-black ${monthSummary.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {monthSummary.netDelta >= 0 ? '+' : '−'}₹{Math.abs(monthSummary.netDelta).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-slate-600 opacity-40">/</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TXNS:</span>
              <span className="font-bold text-slate-300">{monthSummary.txnCount}</span>
            </div>
            <span className="text-slate-600 opacity-40">/</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTIVE:</span>
              <span className="font-bold text-slate-300">{monthSummary.activeDays} days</span>
            </div>
          </div>

          {/* Clickable Peak Burn Shortcuts */}
          <div className="flex items-center gap-3 flex-wrap">
            {monthSummary.peakOutflowAmt > 0 && (
              <button
                onClick={() => onSelectDate(monthSummary.peakOutflowDay)}
                className="text-[11px] font-medium text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 cursor-pointer bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
                title="Jump to Peak Outflow Day"
              >
                <span>🔥 Peak Outflow:</span>
                <span className="font-bold font-mono underline">{monthSummary.peakOutflowDay} (₹{monthSummary.peakOutflowAmt.toLocaleString('en-IN')})</span>
              </button>
            )}

            {monthSummary.peakInflowAmt > 0 && (
              <button
                onClick={() => onSelectDate(monthSummary.peakInflowDay)}
                className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                title="Jump to Peak Inflow Day"
              >
                <span>💰 Peak Inflow:</span>
                <span className="font-bold font-mono underline">{monthSummary.peakInflowDay} (₹{monthSummary.peakInflowAmt.toLocaleString('en-IN')})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3 & 4. CONNECTED WORKSPACE: FINANCIAL GRID (LEFT) + INSPECTOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: INTERACTIVE FINANCIAL CALENDAR GRID */}
        <div className={`lg:col-span-8 p-4 sm:p-5 rounded-[24px] border transition-all ${
          isDark ? 'bg-[#0B131B] border-white/[0.08] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          {!hasMonthCoverage ? (
            /* Month Outside Statement Coverage State */
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-heading">No Statement Coverage</h3>
                <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No uploaded bank statement covers {monthFormattedTitle}.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentMonthKey(availableMonths[availableMonths.length - 1]);
                  onSelectDate(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:brightness-110 transition"
              >
                Jump to Latest Statement ({availableMonths[availableMonths.length - 1]})
              </button>
            </div>
          ) : (
            <div>
              {/* Weekday Header */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <div className="text-rose-400">Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div className="text-slate-400">Sat</div>
              </div>

              {/* 42-Cell Daily Financial Activity Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarCells.map((cell, idx) => {
                  const isSelected = selectedDate === cell.dateStr;
                  const hasActivity = cell.txnCount > 0;
                  const isPadding = !cell.isCurrentMonth;
                  const isNoCoverage = !cell.hasStatementCoverage && cell.isCurrentMonth;

                  // Percentile-based subtle heatmap background
                  let heatBg = isDark ? 'bg-[#0E1620]' : 'bg-slate-50/70';
                  let borderCls = isDark ? 'border-white/[0.04]' : 'border-slate-100';

                  if (cell.isCurrentMonth && cell.hasStatementCoverage && hasActivity) {
                    if (cell.netDelta > 0) {
                      // Net Positive Inflow Day
                      heatBg = isDark ? 'bg-emerald-950/25' : 'bg-emerald-50/80';
                      borderCls = isDark ? 'border-emerald-500/20' : 'border-emerald-200';
                    } else if (cell.activityScore > 0.6 || cell.isUnusual) {
                      // Heavy Outflow / Anomaly Day
                      heatBg = isDark ? 'bg-rose-950/30' : 'bg-rose-50';
                      borderCls = isDark ? 'border-rose-500/30' : 'border-rose-200';
                    } else if (cell.totalDebits > 0) {
                      // Normal Outflow Day
                      heatBg = isDark ? 'bg-rose-950/15' : 'bg-slate-50';
                      borderCls = isDark ? 'border-white/[0.06]' : 'border-slate-200';
                    }
                  }

                  const cellMinHeight = density === 'COMPACT' ? 'min-h-[64px] sm:min-h-[72px]' : 'min-h-[78px] sm:min-h-[86px]';

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (hasActivity) {
                          onSelectDate(isSelected ? null : cell.dateStr);
                        }
                      }}
                      onMouseEnter={() => setHoveredDate(cell.dateStr)}
                      onMouseLeave={() => setHoveredDate(null)}
                      aria-label={`${cell.dateStr}. ${cell.txnCount} transactions. Credits: ₹${cell.totalCredits}. Debits: ₹${cell.totalDebits}.`}
                      className={`${cellMinHeight} p-2 rounded-xl border flex flex-col justify-between transition-all duration-150 relative cursor-pointer ${
                        isPadding
                          ? (isDark ? 'opacity-20 border-white/[0.02] bg-transparent pointer-events-none' : 'opacity-20 border-slate-100 bg-transparent pointer-events-none')
                          : isNoCoverage
                          ? (isDark ? 'opacity-35 bg-black/40 border-dashed border-white/10' : 'opacity-40 bg-slate-100 border-dashed border-slate-300')
                          : isSelected
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-[1.02] z-10 bg-emerald-950/40'
                          : hasActivity
                          ? `${heatBg} ${borderCls} hover:border-emerald-400/60 hover:shadow-md`
                          : (isDark ? 'bg-[#0E151E] border-white/[0.04]' : 'bg-slate-50/40 border-slate-100')
                      }`}
                    >
                      {/* Top Row: Day Number & Semantic Milestone Dots */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold font-mono ${
                          isSelected
                            ? 'text-emerald-400 font-black'
                            : cell.isCurrentMonth
                            ? (isDark ? 'text-slate-300' : 'text-slate-800')
                            : 'text-slate-500'
                        }`}>
                          {cell.dayNumber}
                        </span>

                        {/* Semantic Milestone Badges */}
                        <div className="flex items-center gap-0.5">
                          {cell.hasSalary && <span className="text-[10px]" title="Corporate Salary Credited">💼</span>}
                          {cell.hasEpfo && <span className="text-[10px]" title="EPFO Claim Credited">🏛️</span>}
                          {cell.hasLoanRepayment && <span className="text-[10px]" title="Loan EMI Serviced">🔴</span>}
                          {cell.hasCashWdl && <span className="text-[10px]" title="Cash ATM Withdrawal">🏧</span>}
                          {cell.hasInterest && <span className="text-[10px]" title="Bank Interest Credited">💰</span>}
                          {cell.isUnusual && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Statistical Spending Spike" />}
                        </div>
                      </div>

                      {/* Middle: Net Amount Flow */}
                      <div className="text-right font-mono my-0.5">
                        {hasActivity ? (
                          <div className={`text-[10px] sm:text-[11px] font-black truncate ${
                            cell.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {formatCompactRupee(cell.netDelta)}
                          </div>
                        ) : isNoCoverage ? (
                          <div className="text-[8px] text-slate-500 italic">No data</div>
                        ) : cell.isCurrentMonth ? (
                          <div className="text-[8px] text-slate-500 opacity-40">No activity</div>
                        ) : null}
                      </div>

                      {/* Bottom Row: Transaction Count & Mixed Indicator */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                        {hasActivity ? (
                          <span className="text-[8px] opacity-70">
                            {cell.txnCount} txn{cell.txnCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span />
                        )}

                        {hasActivity && cell.totalCredits > 0 && cell.totalDebits > 0 && (
                          <span className="text-[8px] text-amber-400 font-bold" title="Mixed Inflow & Outflow">
                            MIXED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Refined Calendar Legend */}
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-400 font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Net Inflow</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Net Outflow</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Mixed Activity</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500 opacity-40" /> Zero Activity</span>
                </div>
                <span>Click any day tile to inspect transactions</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTEGRATED CONTEXTUAL TRANSACTION INSPECTOR */}
        <div className={`lg:col-span-4 p-4 sm:p-5 rounded-[24px] border transition-all sticky top-20 ${
          isDark ? 'bg-[#0B131B] border-white/[0.08] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          {selectedDayData ? (
            <div className="space-y-4">
              {/* Selected Day Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Inspector</div>
                  <h3 className="text-sm font-black font-heading tracking-tight mt-0.5">
                    {selectedDayData.date}
                  </h3>
                </div>

                <button
                  onClick={() => onSelectDate(null)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition"
                  title="Close Inspector"
                >
                  ✕ Close
                </button>
              </div>

              {/* Day Flow Metric Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="text-[9px] font-bold uppercase text-emerald-400">Credits In</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">
                    +{formatFullRupee(selectedDayData.totalCredits)}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="text-[9px] font-bold uppercase text-rose-400">Debits Out</div>
                  <div className="text-sm font-black text-rose-400 mt-0.5">
                    −{formatFullRupee(selectedDayData.totalDebits)}
                  </div>
                </div>
              </div>

              {/* Action: Filter Master Ledger to Date */}
              {onFilterLedgerToDate && (
                <button
                  onClick={() => onFilterLedgerToDate(selectedDayData.date)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <span>🔍 Filter Full Ledger to {selectedDayData.date}</span>
                </button>
              )}

              {/* Daily Category Distribution Mini-Bars */}
              {selectedDayData.categories.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Breakdown</div>
                  {selectedDayData.categories.slice(0, 4).map((catItem) => {
                    const cInfo = formatCategoryMeta(catItem.category);
                    return (
                      <div key={catItem.category} className="space-y-0.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className="truncate max-w-[180px]">{cInfo.icon} {cInfo.label}</span>
                          <span className="font-mono font-bold">₹{catItem.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cInfo.bg.replace('/10', '') || 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(100, Math.max(5, catItem.percentage))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View Mode Toggle: List vs Timeline */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedDayData.transactions.length} Transactions
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <button
                    onClick={() => setInspectorViewMode('LIST')}
                    className={`px-2 py-0.5 rounded transition ${
                      inspectorViewMode === 'LIST' ? 'bg-white/10 text-white' : 'text-slate-500'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setInspectorViewMode('TIMELINE')}
                    className={`px-2 py-0.5 rounded transition ${
                      inspectorViewMode === 'TIMELINE' ? 'bg-white/10 text-white' : 'text-slate-500'
                    }`}
                  >
                    Timeline
                  </button>
                </div>
              </div>

              {/* Transaction Rows Feed */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {selectedDayData.transactions.map((tx, tIdx) => {
                  const catInfo = formatCategoryMeta(tx.category);
                  const isCredit = tx.direction === 'CREDIT';

                  return (
                    <div
                      key={tx.id || tIdx}
                      onClick={() => setInspectModalTx(tx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-[#121C26] border-white/[0.06] hover:border-white/20 hover:bg-[#16222E]' 
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <BrandLogoBadge entityName={tx.entityName || tx.rawNarration} size="sm" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">
                              {tx.entityName || 'Bank Transaction'}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {tx.rawNarration}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono shrink-0">
                          <div className={`text-xs font-black ${
                            isCredit ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isCredit ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase">
                            {tx.channel || 'BANK'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.04] text-[9px] font-mono">
                        <span className={`px-1.5 py-0.2 rounded border ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}>
                          {catInfo.label}
                        </span>
                        {tx.balanceAfter != null && (
                          <span className="text-slate-400">Bal: ₹{tx.balanceAfter.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty state when no date is clicked */
            <div className="p-6 text-center space-y-3">
              <div className="text-3xl opacity-60">👆</div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Inspector</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Click any day tile on the calendar to inspect its full transaction ledger, category distribution, and audit trail.
              </p>
              <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-left space-y-1.5 text-slate-400">
                <div className="font-bold text-slate-300">Month Highlights ({monthFormattedTitle}):</div>
                <div>• Total Month Inflow: +{formatFullRupee(monthSummary.totalCredits)}</div>
                <div>• Total Month Outflow: −{formatFullRupee(monthSummary.totalDebits)}</div>
                <div>• Reconciled Activity: {monthSummary.txnCount} Transactions</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. DEEP FORENSIC TRANSACTION AUDIT MODAL ────────────────────────── */}
      {inspectModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg p-6 rounded-[28px] border space-y-4 shadow-2xl ${
            isDark ? 'bg-[#0E1720] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <BrandLogoBadge entityName={inspectModalTx.entityName || inspectModalTx.rawNarration} size="md" />
                <div>
                  <h3 className="text-sm font-bold">{inspectModalTx.entityName || 'Bank Transaction'}</h3>
                  <div className="text-[10px] text-slate-400 font-mono">{inspectModalTx.transactionDate}</div>
                </div>
              </div>

              <button
                onClick={() => setInspectModalTx(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Hero Amount & Direction */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Amount & Direction</span>
                <span className={`text-base font-black ${
                  inspectModalTx.direction === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {inspectModalTx.direction === 'CREDIT' ? '+' : '−'}₹{inspectModalTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Raw Bank Narration & 1-Click Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>Raw Bank Narration</span>
                  <button
                    onClick={() => handleCopyText(inspectModalTx.rawNarration)}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {isCopiedRef ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedRef ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-black/20 text-[11px] break-all">
                  {inspectModalTx.rawNarration}
                </div>
              </div>

              {/* Key Forensic Attributes */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-black/20">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Classification</div>
                  <div className="font-bold mt-0.5">{inspectModalTx.category}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/20">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Payment Rail</div>
                  <div className="font-bold mt-0.5">{inspectModalTx.channel || 'BANK'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/20">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Reference / UTR</div>
                  <div className="font-bold mt-0.5 truncate">{inspectModalTx.referenceNumber || 'N/A'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/20">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Balance After</div>
                  <div className="font-bold mt-0.5">
                    {inspectModalTx.balanceAfter != null ? `₹${inspectModalTx.balanceAfter.toLocaleString('en-IN')}` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Classification Confidence & Provenance */}
              <div className="p-3 rounded-xl bg-black/20 flex items-center justify-between text-[11px]">
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Classification Method</div>
                  <div className="font-bold">{inspectModalTx.classificationMethod || 'RULE_ENGINE'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Confidence Score</div>
                  <div className="font-bold text-emerald-400">{Math.round((inspectModalTx.categoryConfidence || 1) * 100)}%</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setInspectModalTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition"
              >
                Close Audit Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
