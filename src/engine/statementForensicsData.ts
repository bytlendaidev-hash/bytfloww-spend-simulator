/**
 * BytFloww Bank Statement Forensic Intelligence Engine
 * ======================================================
 * Dynamic, 100% real-data forensic dataset generator.
 * ALL metrics are computed dynamically from the CanonicalTransaction master ledger.
 * NO static dummy or simulated data.
 */

import { CanonicalTransaction } from '../types';
import { LENDER_PATTERNS, isLenderEntity } from './analyticsEngine';

export type StatementPeriodFilter = 'ALL_TIME' | 'CURRENT_FY' | string;

export interface ForensicLenderItem {
  id: string;
  name: string;
  productType: string;
  totalBorrowed: number;
  totalRepaid: number;
  netDelta: number; // positive = net repaid more than borrowed
  borrowCount: number;
  repayCount: number;
  status: 'ACTIVE_LINE' | 'SERVICED_EMI' | 'REPAID' | 'CLOSED';
  lastDisbursedDate?: string;
  lastRepaymentDate?: string;
  recyclingRisk: 'HIGH' | 'MODERATE' | 'LOW';
  loanRecyclingRatio: number;
}

export interface ForensicRecipientItem {
  id: string;
  name: string;
  upiHandle: string;
  totalSent: number;
  totalReceived: number;
  netOutflow: number;
  txnCount: number;
  largestTxn: number;
  smallestTxn: number;
  monthlyAverage: number;
  firstDate: string;
  lastDate: string;
  relationshipTag: 'Family' | 'Friend' | 'Loan Repayment' | 'Personal Transfer' | 'Self-Transfer' | 'Merchant' | 'Unknown';
  flaggedPriority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  notes: string;
}

export interface ForensicLifestyleItem {
  category: string;
  icon: string;
  totalAmount: number;
  shareOfDebits: number;
  monthlyAverage: number;
  merchants: Array<{
    name: string;
    amount: number;
    sharePercent: number;
    count: number;
    notes?: string;
  }>;
}

export interface MonthlyCashFlowRow {
  monthKey: string;
  monthName: string;
  financialYear: string;
  salary: number;
  loansReceived: number;
  otherIncome: number;
  totalCredits: number;
  loanRepaid: number;
  personalTransfers: number;
  lifestyleSpend: number;
  cashWithdrawals: number;
  walletMovements: number;
  creditCardPayments: number;
  totalDebits: number;
  netCashFlow: number;
  closingBalance: number | null;
  isDeficit: boolean;
  obligationsExceedSalary: boolean;
}

export interface ForensicAnomalyItem {
  id: string;
  date: string;
  narration: string;
  amount: number;
  type: 'LARGE_TXN' | 'SPIKE_ANOMALY' | 'DUPLICATE_LOOKING' | 'RAPID_MONEY_CYCLING';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  counterparty: string;
}

export interface FinancialHealthRatioItem {
  ratioName: string;
  formula: string;
  currentValue: number;
  unit: '%';
  benchmark: string;
  status: 'HEALTHY' | 'MODERATE' | 'CRITICAL';
  assessment: string;
}

export interface Where100WentItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  isLifestyle: boolean;
  isMoneyMovement: boolean;
}

export type ForensicDataset = ComprehensiveForensicDataset;
export interface ComprehensiveForensicDataset {
  periodLabel: string;
  periodSpan: string;
  accountHolder: string;
  accountNo: string;
  ifsc: string;
  bankName: string;
  branch: string;
  
  // Executive Summary Reconciled Metrics
  totalTransactions: number;
  openingBalance: number | null;
  closingBalance: number | null;
  totalCredits: number;
  totalDebits: number;
  netCashFlow: number;
  
  // Inflow Decomposition
  salaryTotal: number;
  salaryReimbursements: number;
  loanCreditsTotal: number;
  epfoCreditsTotal: number;
  refundsReversalsTotal: number;
  interestCreditsTotal: number;
  bankChargesTotal: number;
  bankChargesCount: number;
  bankInterestCredits: Array<{ date: string; amount: number; narration: string; quarterLabel: string }>;
  bankChargesList: Array<{ date: string; amount: number; narration: string; chargeType: string }>;
  
  // Debit Separation: Lifestyle vs Money Movement
  trueLifestyleTotal: number;
  trueLifestyleShare: number;
  moneyMovementTotal: number;
  moneyMovementShare: number;
  
  // Debit Category Breakdown
  debitBreakdown: Array<{
    rank: number;
    category: string;
    amount: number;
    percentage: number;
    isLifestyle: boolean;
    icon: string;
  }>;
  
  // Forensic Tables & Matrices
  lenders: ForensicLenderItem[];
  recipients: ForensicRecipientItem[];
  lifestyleDetails: {
    food: ForensicLifestyleItem;
    grocery: ForensicLifestyleItem;
    transport: ForensicLifestyleItem;
    shopping: ForensicLifestyleItem;
    utilities: ForensicLifestyleItem;
    subscriptions: ForensicLifestyleItem;
  };
  monthlyCashFlow: MonthlyCashFlowRow[];
  anomalies: ForensicAnomalyItem[];
  ratios: FinancialHealthRatioItem[];
  where100Went: Where100WentItem[];
  
  // Risk Score & Actions
  riskScores: Array<{
    dimension: string;
    rating: 'GREEN' | 'AMBER' | 'RED';
    scoreText: string;
    details: string;
  }>;
  topProblems: string[];
  topUnnecessaryExpenses: string[];
  topRecipients: string[];
  topLenders: string[];
  topActions: string[];
}

/**
 * Empty forensic dataset used when no transactions are available
 */
export const EMPTY_FORENSIC_DATA: ComprehensiveForensicDataset = {
  periodLabel: 'No Statement Loaded',
  periodSpan: 'Upload bank statements to view forensic intelligence',
  accountHolder: 'No Account Detected',
  accountNo: 'N/A',
  ifsc: 'N/A',
  bankName: 'N/A',
  branch: 'N/A',
  
  totalTransactions: 0,
  openingBalance: null,
  closingBalance: null,
  totalCredits: 0,
  totalDebits: 0,
  netCashFlow: 0,
  
  salaryTotal: 0,
  salaryReimbursements: 0,
  loanCreditsTotal: 0,
  epfoCreditsTotal: 0,
  refundsReversalsTotal: 0,
  interestCreditsTotal: 0,
  bankChargesTotal: 0,
  bankChargesCount: 0,
  bankInterestCredits: [],
  bankChargesList: [],
  
  trueLifestyleTotal: 0,
  trueLifestyleShare: 0,
  moneyMovementTotal: 0,
  moneyMovementShare: 0,
  
  debitBreakdown: [],
  lenders: [],
  recipients: [],
  lifestyleDetails: {
    food: { category: 'Food & Dining', icon: '🍔', totalAmount: 0, shareOfDebits: 0, monthlyAverage: 0, merchants: [] },
    grocery: { category: 'Groceries & Quick Commerce', icon: '🛒', totalAmount: 0, shareOfDebits: 0, monthlyAverage: 0, merchants: [] },
    transport: { category: 'Transport & Travel', icon: '🚕', totalAmount: 0, shareOfDebits: 0, monthlyAverage: 0, merchants: [] },
    shopping: { category: 'Shopping & E-Commerce', icon: '🛍️', totalAmount: 0, shareOfDebits: 0, monthlyAverage: 0, merchants: [] },
    utilities: { category: 'Utilities, Telecom & Cloud', icon: '⚡', totalAmount: 0, shareOfDebits: 0, monthlyAverage: 0, merchants: [] },
    subscriptions: { category: 'Digital Subscriptions', icon: '🎬', totalAmount: 0, shareOfDebits: 0, monthlyAverage: 0, merchants: [] },
  },
  monthlyCashFlow: [],
  anomalies: [],
  ratios: [],
  where100Went: [],
  riskScores: [],
  topProblems: [],
  topUnnecessaryExpenses: [],
  topRecipients: [],
  topLenders: [],
  topActions: [],
};

// Aliased for backward-compatibility during transition — contains ZERO dummy values
export const MASTER_FORENSIC_DATA = EMPTY_FORENSIC_DATA;

/**
 * Dynamically computes a ComprehensiveForensicDataset from a master ledger of CanonicalTransactions.
 * 100% real calculations, zero dummy data.
 */
export function generateForensicDataFromTransactions(
  allTxns: CanonicalTransaction[],
  periodFilter?: StatementPeriodFilter,
  metadata?: {
    accountHolder?: string;
    accountNo?: string;
    bankName?: string;
    ifsc?: string;
    branch?: string;
  }
): ComprehensiveForensicDataset {
  if (!allTxns || allTxns.length === 0) {
    return EMPTY_FORENSIC_DATA;
  }

  // 1. Filter by period if requested
  let txns = [...allTxns];
  if (periodFilter && periodFilter !== 'ALL_TIME') {
    if (periodFilter === 'CURRENT_FY') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const fyStartYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
      const startIso = `${fyStartYear}-04-01`;
      const endIso = `${fyStartYear + 1}-03-31`;
      txns = txns.filter(t => t.transactionDate >= startIso && t.transactionDate <= endIso);
    } else if (periodFilter.startsWith('FY_')) {
      // e.g. FY_2025_26 -> 2025-04-01 to 2026-03-31
      const parts = periodFilter.replace('FY_', '').split('_');
      if (parts.length === 2) {
        const startYear = parseInt(parts[0], 10);
        const endYear = parts[1].length === 2 ? Math.floor(startYear / 100) * 100 + parseInt(parts[1], 10) : parseInt(parts[1], 10);
        const startIso = `${startYear}-04-01`;
        const endIso = `${endYear}-03-31`;
        txns = txns.filter(t => t.transactionDate >= startIso && t.transactionDate <= endIso);
      }
    } else if (/^\d{4}-\d{2}$/.test(periodFilter)) {
      txns = txns.filter(t => t.transactionDate.startsWith(periodFilter));
    }
  }

  if (txns.length === 0) {
    return {
      ...EMPTY_FORENSIC_DATA,
      periodLabel: periodFilter || 'Selected Period',
      periodSpan: 'No transactions in selected period filter',
    };
  }

  // Sort chronologically
  txns.sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));

  // Date range detection
  const earliestDate = txns[0].transactionDate;
  const latestDate = txns[txns.length - 1].transactionDate;

  // Month detection
  const monthSet = new Set<string>();
  txns.forEach(t => {
    if (t.transactionDate.length >= 7) {
      monthSet.add(t.transactionDate.substring(0, 7));
    }
  });
  const monthCount = Math.max(1, monthSet.size);

  // Core totals
  let totalCredits = 0;
  let totalDebits = 0;
  let openingBalance: number | null = null;
  let closingBalance: number | null = null;

  // Inflow decomposition
  let salaryTotal = 0;
  let salaryReimbursements = 0;
  let loanCreditsTotal = 0;
  let epfoCreditsTotal = 0;
  let refundsReversalsTotal = 0;
  let interestCreditsTotal = 0;
  let bankChargesTotal = 0;
  let bankChargesCount = 0;
  const bankInterestCredits: Array<{ date: string; amount: number; narration: string; quarterLabel: string }> = [];
  const bankChargesList: Array<{ date: string; amount: number; narration: string; chargeType: string }> = [];

  // Debit category totals
  const categoryDebits: Record<string, { amount: number; count: number; isLifestyle: boolean; icon: string }> = {};

  // Lenders & Recipients
  const lenderMap = new Map<string, {
    name: string;
    borrowed: number;
    repaid: number;
    borrowCount: number;
    repayCount: number;
    lastDisbursed?: string;
    lastRepaid?: string;
  }>();

  const recipientMap = new Map<string, {
    name: string;
    upiHandle: string;
    sent: number;
    received: number;
    txnCount: number;
    largest: number;
    smallest: number;
    firstDate: string;
    lastDate: string;
    notes: string;
  }>();

  // Lifestyle details
  const merchantMap: Record<string, Map<string, { amount: number; count: number }>> = {
    food: new Map(),
    grocery: new Map(),
    transport: new Map(),
    shopping: new Map(),
    utilities: new Map(),
    subscriptions: new Map(),
  };

  // Monthly cash flow velocity map
  const monthlyFlowMap = new Map<string, {
    monthKey: string;
    monthName: string;
    financialYear: string;
    salary: number;
    loansReceived: number;
    otherIncome: number;
    totalCredits: number;
    loanRepaid: number;
    personalTransfers: number;
    lifestyleSpend: number;
    cashWithdrawals: number;
    walletMovements: number;
    creditCardPayments: number;
    totalDebits: number;
    closingBalance: number | null;
  }>();

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < txns.length; i++) {
    const t = txns[i];
    const credit = t.credit || 0;
    const debit = t.debit || 0;
    totalCredits += credit;
    totalDebits += debit;

    if (t.balanceAfter !== null) {
      if (openingBalance === null) {
        openingBalance = t.balanceAfter + debit - credit;
      }
      closingBalance = t.balanceAfter;
    }

    const cat = t.category || 'OTHER';
    const isCredit = t.direction === 'CREDIT' || credit > 0;
    const amt = credit || debit || t.amount;

    // Month & FY key
    const monthKey = t.transactionDate.length >= 7 ? t.transactionDate.substring(0, 7) : 'Unknown';
    const yearInt = parseInt(t.transactionDate.substring(0, 4), 10) || 2025;
    const monthInt = parseInt(t.transactionDate.substring(5, 7), 10) || 1;
    const fyStart = monthInt >= 4 ? yearInt : yearInt - 1;
    const fyLabel = `FY ${fyStart}-${String(fyStart + 1).slice(2)}`;
    const monthName = `${MONTH_NAMES[monthInt - 1] || 'Month'} ${yearInt}`;

    if (!monthlyFlowMap.has(monthKey)) {
      monthlyFlowMap.set(monthKey, {
        monthKey,
        monthName,
        financialYear: fyLabel,
        salary: 0,
        loansReceived: 0,
        otherIncome: 0,
        totalCredits: 0,
        loanRepaid: 0,
        personalTransfers: 0,
        lifestyleSpend: 0,
        cashWithdrawals: 0,
        walletMovements: 0,
        creditCardPayments: 0,
        totalDebits: 0,
        closingBalance: t.balanceAfter,
      });
    }
    const mRow = monthlyFlowMap.get(monthKey)!;
    if (t.balanceAfter !== null) mRow.closingBalance = t.balanceAfter;

    if (isCredit) {
      mRow.totalCredits += credit;
      if (t.isSalary || cat === 'SALARY') {
        salaryTotal += credit;
        mRow.salary += credit;
      } else if (t.financialType === 'DEBT_DISBURSEMENT' || cat === 'LOAN_CREDIT') {
        loanCreditsTotal += credit;
        mRow.loansReceived += credit;
        
        // Track lender using standardized pattern matching
        let isKnownLender = false;
        let lenderName = t.entityName || 'Lender';
        for (const lp of LENDER_PATTERNS) {
          if (lp.pattern.test(t.rawNarration) || lp.pattern.test(t.entityName)) {
            lenderName = lp.name;
            isKnownLender = true;
            break;
          }
        }
        if (isKnownLender || isLenderEntity(t.rawNarration, t.entityName)) {
          const lenderKey = lenderName;
          if (!lenderMap.has(lenderKey)) {
            lenderMap.set(lenderKey, { name: lenderName, borrowed: 0, repaid: 0, borrowCount: 0, repayCount: 0 });
          }
          const len = lenderMap.get(lenderKey)!;
          len.borrowed += credit;
          len.borrowCount++;
          len.lastDisbursed = t.transactionDate;
        }
      } else if (cat === 'EPFO_PF') {
        epfoCreditsTotal += credit;
        mRow.otherIncome += credit;
      } else if (cat === 'REIMBURSEMENT') {
        salaryReimbursements += credit;
        mRow.salary += credit;
      } else if (cat === 'REFUND' || cat === 'REVERSAL') {
        refundsReversalsTotal += credit;
        mRow.otherIncome += credit;
      } else if (cat === 'INTEREST_INCOME' || t.rawNarration.toLowerCase().includes('interest paid till')) {
        interestCreditsTotal += credit;
        mRow.otherIncome += credit;
        bankInterestCredits.push({
          date: t.transactionDate,
          amount: credit,
          narration: t.rawNarration,
          quarterLabel: t.rawNarration.replace(/INTEREST PAID TILL /i, 'Quarter ending ').trim(),
        });
      } else {
        mRow.otherIncome += credit;
      }
    } else {
      // Outflow / Debit
      mRow.totalDebits += debit;
      const isLifestyle = t.isEconomicExpense;

      // Group debit category
      let displayCat = 'Other Expenses';
      let icon = '📦';

      if (t.financialType === 'DEBT_REPAYMENT' || cat === 'LOAN_REPAYMENT') {
        displayCat = 'Loan / Finance Repayments';
        icon = '🏦';
        mRow.loanRepaid += debit;

        // Track lender using standardized pattern matching
        let lenderName = t.entityName || 'Lender';
        let isKnownLender = false;
        for (const lp of LENDER_PATTERNS) {
          if (lp.pattern.test(t.rawNarration) || lp.pattern.test(t.entityName)) {
            lenderName = lp.name;
            isKnownLender = true;
            break;
          }
        }
        // Only track in lender matrix if it is a confirmed lender or debt entity
        if (isKnownLender || isLenderEntity(t.rawNarration, t.entityName)) {
          const lenderKey = lenderName;
          if (!lenderMap.has(lenderKey)) {
            lenderMap.set(lenderKey, { name: lenderName, borrowed: 0, repaid: 0, borrowCount: 0, repayCount: 0 });
          }
          const len = lenderMap.get(lenderKey)!;
          len.repaid += debit;
          len.repayCount++;
          len.lastRepaid = t.transactionDate;
        }
      } else if (cat === 'CREDIT_CARD_PAYMENT') {
        displayCat = 'Credit Card / CRED Payments';
        icon = '💳';
        mRow.creditCardPayments += debit;
      } else if (cat === 'PERSONAL_TRANSFER' || t.financialType === 'TRANSFER') {
        displayCat = 'UPI / Other Transfers';
        icon = '👥';
        mRow.personalTransfers += debit;

        // Track recipient
        const pKey = t.entityNormalized || t.entityName || 'UNKNOWN_PERSON';
        if (!recipientMap.has(pKey)) {
          recipientMap.set(pKey, {
            name: t.entityName || 'Person',
            upiHandle: t.upiHandle || '',
            sent: 0,
            received: 0,
            txnCount: 0,
            largest: 0,
            smallest: Infinity,
            firstDate: t.transactionDate,
            lastDate: t.transactionDate,
            notes: 'Peer-to-peer UPI transfer',
          });
        }
        const rec = recipientMap.get(pKey)!;
        rec.sent += debit;
        rec.txnCount++;
        rec.largest = Math.max(rec.largest, debit);
        rec.smallest = Math.min(rec.smallest, debit);
        rec.lastDate = t.transactionDate;
      } else if (cat === 'WALLET_MOVEMENT') {
        displayCat = 'Wallet / Payment-Bank Movement';
        icon = '📱';
        mRow.walletMovements += debit;
      } else if (t.financialType === 'CASH_WITHDRAWAL' || cat === 'CASH_WITHDRAWAL') {
        displayCat = 'Cash Withdrawals (ATM)';
        icon = '🏧';
        mRow.cashWithdrawals += debit;
      } else if (cat === 'FOOD') {
        displayCat = 'Food & Dining (Swiggy/Zomato)';
        icon = '🍔';
        mRow.lifestyleSpend += debit;
        const mSub = merchantMap.food;
        const mName = t.entityName || 'Food Merchant';
        mSub.set(mName, { amount: (mSub.get(mName)?.amount || 0) + debit, count: (mSub.get(mName)?.count || 0) + 1 });
      } else if (cat === 'GROCERY') {
        displayCat = 'Groceries & Quick Commerce';
        icon = '🛒';
        mRow.lifestyleSpend += debit;
        const mSub = merchantMap.grocery;
        const mName = t.entityName || 'Grocery Merchant';
        mSub.set(mName, { amount: (mSub.get(mName)?.amount || 0) + debit, count: (mSub.get(mName)?.count || 0) + 1 });
      } else if (cat === 'TRANSPORT') {
        displayCat = 'Transport & Travel';
        icon = '🚕';
        mRow.lifestyleSpend += debit;
        const mSub = merchantMap.transport;
        const mName = t.entityName || 'Travel Merchant';
        mSub.set(mName, { amount: (mSub.get(mName)?.amount || 0) + debit, count: (mSub.get(mName)?.count || 0) + 1 });
      } else if (cat === 'SHOPPING') {
        displayCat = 'Shopping & E-Commerce';
        icon = '🛍️';
        mRow.lifestyleSpend += debit;
        const mSub = merchantMap.shopping;
        const mName = t.entityName || 'Shopping Merchant';
        mSub.set(mName, { amount: (mSub.get(mName)?.amount || 0) + debit, count: (mSub.get(mName)?.count || 0) + 1 });
      } else if (cat === 'BILL_UTILITY') {
        displayCat = 'Utilities, Telecom & Cloud';
        icon = '⚡';
        mRow.lifestyleSpend += debit;
        const mSub = merchantMap.utilities;
        const mName = t.entityName || 'Utility Provider';
        mSub.set(mName, { amount: (mSub.get(mName)?.amount || 0) + debit, count: (mSub.get(mName)?.count || 0) + 1 });
      } else if (cat === 'SUBSCRIPTION') {
        displayCat = 'Digital Subscriptions';
        icon = '🎬';
        mRow.lifestyleSpend += debit;
        const mSub = merchantMap.subscriptions;
        const mName = t.entityName || 'Subscription Service';
        mSub.set(mName, { amount: (mSub.get(mName)?.amount || 0) + debit, count: (mSub.get(mName)?.count || 0) + 1 });
      } else if (cat === 'INSURANCE') {
        displayCat = 'Insurance Policies';
        icon = '🛡️';
      } else if (cat === 'BANK_CHARGE' || cat === 'GOVERNMENT_CHARGE' || t.rawNarration.toLowerCase().includes('ach debit return') || t.rawNarration.toLowerCase().includes('decchg') || t.rawNarration.toLowerCase().includes('pos txn markup')) {
        displayCat = 'Bank & Govt Charges';
        icon = '🏛️';
        bankChargesTotal += debit;
        bankChargesCount++;
        let cType = 'Bank Service Charge / GST';
        if (t.rawNarration.toLowerCase().includes('ach debit return')) cType = 'ACH Return / Bounce Penalty';
        else if (t.rawNarration.toLowerCase().includes('decchg')) cType = 'Debit Card / ATM Charge';
        else if (t.rawNarration.toLowerCase().includes('markup') || t.rawNarration.toLowerCase().includes('dcc')) cType = 'International POS Markup & Tax';
        bankChargesList.push({
          date: t.transactionDate,
          amount: debit,
          narration: t.rawNarration,
          chargeType: cType,
        });
      } else {
        displayCat = 'Other Expenses';
        icon = '📦';
        if (isLifestyle) mRow.lifestyleSpend += debit;
      }

      if (!categoryDebits[displayCat]) {
        categoryDebits[displayCat] = { amount: 0, count: 0, isLifestyle, icon };
      }
      categoryDebits[displayCat].amount += debit;
      categoryDebits[displayCat].count++;
    }
  }

  // Compute Lifestyle vs Money Movement totals
  let trueLifestyleTotal = 0;
  let moneyMovementTotal = 0;
  Object.values(categoryDebits).forEach(c => {
    if (c.isLifestyle) trueLifestyleTotal += c.amount;
    else moneyMovementTotal += c.amount;
  });

  const trueLifestyleShare = totalDebits > 0 ? (trueLifestyleTotal / totalDebits) * 100 : 0;
  const moneyMovementShare = totalDebits > 0 ? (moneyMovementTotal / totalDebits) * 100 : 0;

  // Build debit breakdown array
  const debitBreakdown = Object.entries(categoryDebits)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .map(([catName, data], idx) => ({
      rank: idx + 1,
      category: catName,
      amount: data.amount,
      percentage: totalDebits > 0 ? (data.amount / totalDebits) * 100 : 0,
      isLifestyle: data.isLifestyle,
      icon: data.icon,
    }));

  // Build Where 100 Went Items
  const CATEGORY_COLORS: Record<string, string> = {
    'UPI / Other Transfers': '#6366F1',
    'Loan / Finance Repayments': '#EF4444',
    'Wallet / Payment-Bank Movement': '#8B5CF6',
    'Cash Withdrawals (ATM)': '#64748B',
    'Credit Card / CRED Payments': '#F97316',
    'Insurance Policies': '#06B6D4',
    'Shopping & E-Commerce': '#EC4899',
    'Utilities, Telecom & Cloud': '#F59E0B',
    'Transport & Travel': '#10B981',
    'Food & Dining (Swiggy/Zomato)': '#F43F5E',
    'Groceries & Quick Commerce': '#84CC16',
    'Digital Subscriptions': '#A855F7',
    'Bank & Govt Charges': '#94A3B8',
    'Other Expenses': '#475569',
  };

  const where100Went: Where100WentItem[] = debitBreakdown.map(d => ({
    category: d.category,
    amount: d.amount,
    percentage: d.percentage,
    color: CATEGORY_COLORS[d.category] || '#64748B',
    isLifestyle: d.isLifestyle,
    isMoneyMovement: !d.isLifestyle,
  }));

  // Build Lenders list
  const lenders: ForensicLenderItem[] = Array.from(lenderMap.values())
    .map((len, idx) => {
      const recyclingRatio = len.repaid > 0 ? len.borrowed / len.repaid : len.borrowed > 0 ? 99 : 0;
      const recyclingRisk: ForensicLenderItem['recyclingRisk'] =
        recyclingRatio > 0.8 && len.borrowCount > 3 ? 'HIGH' : recyclingRatio > 0.4 ? 'MODERATE' : 'LOW';
      const status: ForensicLenderItem['status'] =
        len.borrowed > len.repaid ? 'ACTIVE_LINE' : len.repaid > 0 ? 'SERVICED_EMI' : 'CLOSED';
      return {
        id: `lender_${idx + 1}`,
        name: len.name,
        productType: len.borrowCount > 1 ? 'Digital Revolving Credit Line' : 'Short-Term Loan',
        totalBorrowed: len.borrowed,
        totalRepaid: len.repaid,
        netDelta: len.repaid - len.borrowed,
        borrowCount: len.borrowCount,
        repayCount: len.repayCount,
        status,
        lastDisbursedDate: len.lastDisbursed,
        lastRepaymentDate: len.lastRepaid,
        recyclingRisk,
        loanRecyclingRatio: recyclingRatio,
      };
    })
    .sort((a, b) => (b.totalBorrowed + b.totalRepaid) - (a.totalBorrowed + a.totalRepaid));

  // Build Recipients list
  const recipients: ForensicRecipientItem[] = Array.from(recipientMap.values())
    .map((rec, idx) => {
      const monthlyAvg = monthCount > 0 ? rec.sent / monthCount : rec.sent;
      const flaggedPriority: ForensicRecipientItem['flaggedPriority'] =
        rec.sent > 50000 || rec.txnCount > 15 ? 'CRITICAL' : rec.sent > 15000 ? 'HIGH' : 'NORMAL';
      return {
        id: `rec_${idx + 1}`,
        name: rec.name,
        upiHandle: rec.upiHandle,
        totalSent: rec.sent,
        totalReceived: rec.received,
        netOutflow: rec.sent - rec.received,
        txnCount: rec.txnCount,
        largestTxn: rec.largest,
        smallestTxn: rec.smallest === Infinity ? 0 : rec.smallest,
        monthlyAverage: monthlyAvg,
        firstDate: rec.firstDate,
        lastDate: rec.lastDate,
        relationshipTag: 'Personal Transfer' as const,
        flaggedPriority,
        notes: `P2P transfer across ${rec.txnCount} transactions`,
      };
    })
    .sort((a, b) => b.totalSent - a.totalSent);

  // Helper for lifestyle item
  const makeLifestyleItem = (category: string, icon: string, key: 'food' | 'grocery' | 'transport' | 'shopping' | 'utilities' | 'subscriptions'): ForensicLifestyleItem => {
    const map = merchantMap[key];
    const totalAmount = Array.from(map.values()).reduce((s, m) => s + m.amount, 0);
    const merchants = Array.from(map.entries())
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 10)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        sharePercent: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }));

    return {
      category,
      icon,
      totalAmount,
      shareOfDebits: totalDebits > 0 ? (totalAmount / totalDebits) * 100 : 0,
      monthlyAverage: monthCount > 0 ? totalAmount / monthCount : totalAmount,
      merchants,
    };
  };

  const lifestyleDetails = {
    food: makeLifestyleItem('Food & Dining', '🍔', 'food'),
    grocery: makeLifestyleItem('Groceries & Quick Commerce', '🛒', 'grocery'),
    transport: makeLifestyleItem('Transport & Travel', '🚕', 'transport'),
    shopping: makeLifestyleItem('Shopping & E-Commerce', '🛍️', 'shopping'),
    utilities: makeLifestyleItem('Utilities, Telecom & Cloud', '⚡', 'utilities'),
    subscriptions: makeLifestyleItem('Digital Subscriptions', '🎬', 'subscriptions'),
  };

  // Build Monthly Cash Flow rows
  const monthlyCashFlow: MonthlyCashFlowRow[] = Array.from(monthlyFlowMap.values())
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map(m => {
      const net = m.totalCredits - m.totalDebits;
      return {
        monthKey: m.monthKey,
        monthName: m.monthName,
        financialYear: m.financialYear,
        salary: m.salary,
        loansReceived: m.loansReceived,
        otherIncome: m.otherIncome,
        totalCredits: m.totalCredits,
        loanRepaid: m.loanRepaid,
        personalTransfers: m.personalTransfers,
        lifestyleSpend: m.lifestyleSpend,
        cashWithdrawals: m.cashWithdrawals,
        walletMovements: m.walletMovements,
        creditCardPayments: m.creditCardPayments,
        totalDebits: m.totalDebits,
        netCashFlow: net,
        closingBalance: m.closingBalance,
        isDeficit: net < 0,
        obligationsExceedSalary: m.salary > 0 && (m.loanRepaid + m.creditCardPayments) > m.salary,
      };
    });

  // Dynamic Anomalies (statistical outliers)
  const anomalies: ForensicAnomalyItem[] = [];
  const debitAmounts = txns.filter(t => (t.debit || 0) > 0).map(t => t.debit || 0);
  if (debitAmounts.length > 5) {
    const mean = debitAmounts.reduce((s, a) => s + a, 0) / debitAmounts.length;
    const variance = debitAmounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / debitAmounts.length;
    const stdDev = Math.sqrt(variance);
    
    txns.forEach((t, idx) => {
      const amt = t.debit || 0;
      if (amt > mean + 2.5 * stdDev && amt > 10000 && !t.isSalary) {
        anomalies.push({
          id: `anom_${idx + 1}`,
          date: t.transactionDate,
          narration: t.rawNarration,
          amount: amt,
          type: amt > 50000 ? 'LARGE_TXN' : 'SPIKE_ANOMALY',
          severity: amt > 50000 ? 'HIGH' : 'MEDIUM',
          explanation: `Transaction of ₹${amt.toLocaleString('en-IN')} exceeds standard statistical variance (Mean: ₹${Math.round(mean).toLocaleString('en-IN')})`,
          counterparty: t.entityName || 'Unknown Counterparty',
        });
      }
    });
  }

  // Dynamic Financial Health Ratios
  const earnedIncome = salaryTotal + salaryReimbursements + interestCreditsTotal;
  const debtRepayments = categoryDebits['Loan / Finance Repayments']?.amount || 0;
  const debtToSalary = earnedIncome > 0 ? (debtRepayments / earnedIncome) * 100 : 0;
  const savingsRate = earnedIncome > 0 ? Math.max(0, ((earnedIncome - trueLifestyleTotal) / earnedIncome) * 100) : 0;
  const lifestyleToDebits = totalDebits > 0 ? (trueLifestyleTotal / totalDebits) * 100 : 0;
  const peerTransfers = categoryDebits['UPI / Other Transfers']?.amount || 0;
  const peerTransferShare = totalDebits > 0 ? (peerTransfers / totalDebits) * 100 : 0;
  const cashWithdrawals = categoryDebits['Cash Withdrawals (ATM)']?.amount || 0;
  const cashShare = totalDebits > 0 ? (cashWithdrawals / totalDebits) * 100 : 0;
  const loanRecycling = debtRepayments > 0 ? (loanCreditsTotal / debtRepayments) * 100 : 0;

  const ratios: FinancialHealthRatioItem[] = [
    {
      ratioName: 'Debt-to-Salary Burden',
      formula: 'Debt Repayments / Earned Salary Income',
      currentValue: Math.round(debtToSalary * 10) / 10,
      unit: '%',
      benchmark: '< 30.0%',
      status: debtToSalary > 40 ? 'CRITICAL' : debtToSalary > 25 ? 'MODERATE' : 'HEALTHY',
      assessment: debtToSalary > 40
        ? `Debt servicing consumes ${debtToSalary.toFixed(1)}% of earned income, exceeding safe underwriting threshold.`
        : `Debt servicing is within manageable operating limits.`,
    },
    {
      ratioName: 'True Savings Rate',
      formula: '(Earned Income - Lifestyle Spending) / Earned Income',
      currentValue: Math.round(savingsRate * 10) / 10,
      unit: '%',
      benchmark: '> 20.0%',
      status: savingsRate < 10 ? 'CRITICAL' : savingsRate < 20 ? 'MODERATE' : 'HEALTHY',
      assessment: savingsRate >= 20
        ? `Strong discretionary margin above baseline lifestyle spend.`
        : `Savings capacity is constrained by obligations and transfers.`,
    },
    {
      ratioName: 'True Lifestyle Consumption Share',
      formula: 'Real Living Expenses / Total Debits',
      currentValue: Math.round(lifestyleToDebits * 10) / 10,
      unit: '%',
      benchmark: '15.0% - 35.0%',
      status: 'HEALTHY',
      assessment: `Real consumption constitutes ${lifestyleToDebits.toFixed(1)}% of total debit volume.`,
    },
    {
      ratioName: 'P2P / Peer Transfer Exposure',
      formula: 'Peer Transfers / Total Debits',
      currentValue: Math.round(peerTransferShare * 10) / 10,
      unit: '%',
      benchmark: '< 25.0%',
      status: peerTransferShare > 40 ? 'CRITICAL' : peerTransferShare > 25 ? 'MODERATE' : 'HEALTHY',
      assessment: peerTransferShare > 40
        ? `Peer transfer volume (${peerTransferShare.toFixed(1)}%) dominates outflow channels.`
        : `Peer transfers are balanced.`,
    },
    {
      ratioName: 'Untraceable Cash Leakage',
      formula: 'ATM Cash Withdrawals / Total Debits',
      currentValue: Math.round(cashShare * 10) / 10,
      unit: '%',
      benchmark: '< 5.0%',
      status: cashShare > 10 ? 'CRITICAL' : cashShare > 5 ? 'MODERATE' : 'HEALTHY',
      assessment: `Physical cash withdrawals account for ${cashShare.toFixed(1)}% of debits.`,
    },
    {
      ratioName: 'Loan Recycling Intensity',
      formula: 'New Borrowing Credits / Loan Repayments',
      currentValue: Math.round(loanRecycling * 10) / 10,
      unit: '%',
      benchmark: '< 20.0%',
      status: loanRecycling > 60 ? 'CRITICAL' : loanRecycling > 20 ? 'MODERATE' : 'HEALTHY',
      assessment: loanRecycling > 60
        ? `High recycling intensity (${loanRecycling.toFixed(1)}%): new credit lines replace serviced debt.`
        : `Borrowing activity is amortizing normally.`,
    },
  ];

  // Dynamic Risk Scores & Action Plan
  const riskScores: Array<{
    dimension: string;
    rating: 'GREEN' | 'AMBER' | 'RED';
    scoreText: string;
    details: string;
  }> = [
    {
      dimension: 'Debt Servicing Load',
      rating: debtToSalary > 40 ? 'RED' : debtToSalary > 25 ? 'AMBER' : 'GREEN',
      scoreText: `${debtToSalary.toFixed(1)}% Burden`,
      details: `Repaying ₹${Math.round(debtRepayments).toLocaleString('en-IN')} against ₹${Math.round(earnedIncome).toLocaleString('en-IN')} earned salary.`,
    },
    {
      dimension: 'P2P Liquidity Drain',
      rating: peerTransferShare > 40 ? 'RED' : peerTransferShare > 25 ? 'AMBER' : 'GREEN',
      scoreText: `${peerTransferShare.toFixed(1)}% Outflows`,
      details: `₹${Math.round(peerTransfers).toLocaleString('en-IN')} sent via personal UPI transfers.`,
    },
    {
      dimension: 'Revolving Credit Recycling',
      rating: loanRecycling > 60 ? 'RED' : loanRecycling > 20 ? 'AMBER' : 'GREEN',
      scoreText: `${loanRecycling.toFixed(1)}% Ratio`,
      details: `₹${Math.round(loanCreditsTotal).toLocaleString('en-IN')} borrowed vs ₹${Math.round(debtRepayments).toLocaleString('en-IN')} repaid.`,
    },
    {
      dimension: 'Untraceable Cash Ratio',
      rating: cashShare > 10 ? 'RED' : cashShare > 5 ? 'AMBER' : 'GREEN',
      scoreText: `${cashShare.toFixed(1)}% Cash`,
      details: `₹${Math.round(cashWithdrawals).toLocaleString('en-IN')} withdrawn via ATM.`,
    },
  ];

  const topProblems: string[] = [];
  if (debtToSalary > 30) topProblems.push(`Debt repayments consume ${debtToSalary.toFixed(1)}% of earned salary income`);
  if (peerTransferShare > 35) topProblems.push(`Peer transfers (P2P) represent ${peerTransferShare.toFixed(1)}% of total debit volume`);
  if (loanRecycling > 50) topProblems.push(`Revolving loan recycling: New loans replace serviced repayments at ${loanRecycling.toFixed(1)}%`);
  if (cashShare > 5) topProblems.push(`Cash withdrawals account for ₹${Math.round(cashWithdrawals).toLocaleString('en-IN')} without itemization`);
  if (topProblems.length === 0) topProblems.push('No severe structural financial vulnerabilities detected');

  const topUnnecessaryExpenses: string[] = [];
  const foodTotal = lifestyleDetails.food.totalAmount;
  const shoppingTotal = lifestyleDetails.shopping.totalAmount;
  if (foodTotal > 10000) topUnnecessaryExpenses.push(`Online Food Delivery: ₹${Math.round(foodTotal).toLocaleString('en-IN')} across ${monthCount} months`);
  if (shoppingTotal > 10000) topUnnecessaryExpenses.push(`E-Commerce Purchases: ₹${Math.round(shoppingTotal).toLocaleString('en-IN')}`);
  if (cashWithdrawals > 10000) topUnnecessaryExpenses.push(`Unitemized ATM Cash: ₹${Math.round(cashWithdrawals).toLocaleString('en-IN')}`);

  const topRecipients = recipients.slice(0, 5).map(r => `${r.name}: ₹${Math.round(r.totalSent).toLocaleString('en-IN')} (${r.txnCount} txns)`);
  const topLenders = lenders.slice(0, 5).map(l => `${l.name}: Repaid ₹${Math.round(l.totalRepaid).toLocaleString('en-IN')} (Borrowed ₹${Math.round(l.totalBorrowed).toLocaleString('en-IN')})`);

  const topActions = [
    debtToSalary > 30 ? 'Consolidate short-term revolving credit lines into a single lower-cost amortizing loan' : 'Maintain timely debt payments to protect credit score',
    peerTransferShare > 30 ? 'Establish a fixed monthly cap on discretionary peer-to-peer transfers' : 'Track peer transfer reimbursements regularly',
    cashShare > 5 ? 'Transition cash payments to UPI QR scans for automated expense itemization' : 'Maintain minimal physical cash holding',
    'Automate monthly savings allocation immediately following salary credit date',
  ];

  return {
    periodLabel: periodFilter === 'CURRENT_FY' ? 'Current Financial Year' : periodFilter ? `Filtered Period (${periodFilter})` : `Full Statement Period (${monthCount} Months)`,
    periodSpan: `${earliestDate} → ${latestDate}`,
    accountHolder: metadata?.accountHolder || 'Account Holder',
    accountNo: metadata?.accountNo || 'Bank Account',
    ifsc: metadata?.ifsc || 'N/A',
    bankName: metadata?.bankName || 'Bank Statement',
    branch: metadata?.branch || 'N/A',
    
    totalTransactions: txns.length,
    openingBalance,
    closingBalance,
    totalCredits,
    totalDebits,
    netCashFlow: totalCredits - totalDebits,
    
    salaryTotal,
    salaryReimbursements,
    loanCreditsTotal,
    epfoCreditsTotal,
    refundsReversalsTotal,
    interestCreditsTotal,
    bankChargesTotal: Math.round(bankChargesTotal * 100) / 100,
    bankChargesCount,
    bankInterestCredits,
    bankChargesList,
    
    trueLifestyleTotal,
    trueLifestyleShare,
    moneyMovementTotal,
    moneyMovementShare,
    
    debitBreakdown,
    lenders,
    recipients,
    lifestyleDetails,
    monthlyCashFlow,
    anomalies,
    ratios,
    where100Went,
    
    riskScores,
    topProblems,
    topUnnecessaryExpenses,
    topRecipients,
    topLenders,
    topActions,
  };
}

/**
 * Backward-compatible helper for period filtering — operates dynamically on CanonicalTransactions.
 */
export function getForensicDataForPeriod(
  filter: StatementPeriodFilter,
  txns?: CanonicalTransaction[]
): ComprehensiveForensicDataset {
  if (!txns || txns.length === 0) {
    return EMPTY_FORENSIC_DATA;
  }
  return generateForensicDataFromTransactions(txns, filter);
}
