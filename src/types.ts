export type FinancialEventType = 
  | 'PURCHASE'
  | 'UPI_DEBIT'
  | 'UPI_CREDIT'
  | 'ATM_WITHDRAWAL'
  | 'BILL_PAYMENT'
  | 'CARD_PAYMENT'
  | 'EMI_PAYMENT'
  | 'SALARY'
  | 'REFUND'
  | 'INVESTMENT'
  | 'BANK_CHARGE'
  | 'TRANSFER_INTERNAL'
  | 'TRANSFER_EXTERNAL'
  | 'LOAN_DUE'
  | 'CARD_DUE'
  | 'MANDATE'
  | 'UNKNOWN';

export interface FinancialEvent {
  id: string;
  amount: number;
  direction: 'INFLOW' | 'OUTFLOW' | 'UNKNOWN';
  eventType: FinancialEventType;
  merchant: string;
  rawMerchant: string;
  category: string;
  economicType: 'OUTFLOW' | 'INCOME' | 'TRANSFER_OUT' | 'REFUND' | 'EXCLUDED' | 'UNKNOWN';
  financialSubtype: string;
  timestamp: number;
  dateFormatted: string;
  timeFormatted: string;
  accountHint: string;
  resolvedInstitution: string;
  referenceNumber: string;
  paymentMode: 'UPI' | 'CARD' | 'NET_BANKING' | 'ATM' | 'AUTO_DEBIT';
  transactionFingerprint: string;
  confidence: number;
  notes: string;
  rawSmsBody: string;
  sender: string;
  balanceAfter?: number;
  isRecurring?: boolean;
}

export interface DetectedAccount {
  institution: string;
  accountMask: string;
  accountType: 'SAVINGS' | 'CREDIT_CARD' | 'WALLET';
  latestBalance?: number;
  availableLimit?: number;
  totalLimit?: number;
  dueDate?: string;
  txCount: number;
  totalDebits: number;
  totalCredits: number;
  netCashflow: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  pct: number;
  eventCount: number;
  isUncategorized: boolean;
  avgTicket: number;
  color: string;
  iconName: string;
}

export interface MerchantItem {
  name: string;
  totalSpend: number;
  txCount: number;
  avgTicket: number;
  changePctVsPrevious?: number;
  mostActivePeriod: string;
  category: string;
  lastVisited: number;
  isVpa: boolean;
}

export interface CommitmentItem {
  id: string;
  name: string;
  amount: number;
  type: 'EMI' | 'SUBSCRIPTION' | 'BILL' | 'INSURANCE' | 'INVESTMENT' | 'MANDATE';
  accountMask: string;
  txCount: number;
  confidence: number;
  cadence: string;
  nextExpectedDate: string;
  rawSmsSnippet: string;
  umn?: string;
}

export interface WeeklyDebriefSummary {
  thisWeekSpend: number;
  lastWeekSpend: number;
  wowVariancePct: number;
  isSpendingDown: boolean;
  totalTransactions: number;
  topMerchant: string;
  topMerchantAmount: number;
  biggestSingleExpense?: FinancialEvent;
  topCategory: string;
  topCategoryAmount: number;
  disciplineRating: 'EXCELLENT' | 'HEALTHY' | 'WATCHFUL' | 'CRITICAL';
  actionableTip: string;
  weekDateRangeLabel: string;
}

export interface SpendSnapshot {
  periodLabel: string;
  periodKey: string; // e.g. "2026-08", "2026-07", "ALL", "30D", "90D"
  totalSpend: number;
  totalIncome: number;
  netCashflow: number;
  safeToSpend: number;
  transactionCount: number;
  dailyAvgSpend: number;
  highestSpendDay: number;
  highestSpendDayDate: string;
  spendDeltaVsPrevious: number;
  previousPeriodSpend: number;
  healthScore: number;
  healthScoreTier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  
  categoryDistribution: CategoryBreakdownItem[];
  topMerchants: MerchantItem[];
  commitments: CommitmentItem[];
  recentEvents: FinancialEvent[];
  filteredEvents: FinancialEvent[];
  accounts: DetectedAccount[];
  creditCards: DetectedAccount[];
  
  totalEmis: number;
  totalSubscriptions: number;
  totalBills: number;
  totalInsurance: number;
  totalInvestments: number;
  
  monthlyTrends: Array<{
    monthKey: string;
    label: string;
    spend: number;
    income: number;
    count: number;
  }>;
  
  dayOfWeekTrends: Array<{
    day: string;
    spend: number;
    pct: number;
  }>;
  
  dataQuality: {
    rawSmsCount: number;
    candidatesCount: number;
    duplicateCount: number;
    canonicalCount: number;
    commitmentsCount: number;
    unclassifiedCount: number;
    confidencePct: number;
  };
}

export interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  pct: number;
  isOverBudget: boolean;
}

export interface UserBudgetConfig {
  totalMonthlyBudget: number;
  categoryLimits: Record<string, number>;
}

export type SpendTab = 
  | 'OVERVIEW' 
  | 'TRANSACTIONS' 
  | 'CATEGORIES' 
  | 'MERCHANTS' 
  | 'COMMITMENTS' 
  | 'TRENDS' 
  | 'STATEMENTS'
  | 'BUDGETS' 
  | 'SUBSCRIPTIONS' 
  | 'ACCOUNTS' 
  | 'ASSISTANT';

export interface FilterState {
  searchQuery: string;
  selectedCategory: string | null;
  selectedAccount: string | null;
  directionFilter: 'ALL' | 'OUTFLOW' | 'INFLOW';
  minAmount: number | null;
  maxAmount: number | null;
  paymentMode: string | null;
  highValueOnly: boolean;
}

// ── BANK STATEMENT BACKEND API TYPES ────────────────────────────────────

export interface StatementReconciliation {
  isReconciled: boolean;
  computedClosingBalance: number;
  statedClosingBalance: number | null;
  discrepancy: number;
  totalInflow: number;
  totalOutflow: number;
  openingBalance: number | null;
}

export interface StatementFacts {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  trueEconomicExpense: number;
  internalTransfers: number;
  debtPayments: number;
  totalInflow: number;
  totalOutflow: number;
  savingsRate: number;
  transactionCount: number;
}

export interface StatementInsightItem {
  type: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface StatementTransactionItem {
  id?: string;
  date: string;
  narration: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  category?: string;
  referenceNumber?: string | null;
  isTransfer?: boolean;
  isLoan?: boolean;
}

export interface BackendStatementUploadResult {
  statement: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    financialAccountId: string;
    status: 'PARSED' | 'PROCESSING' | 'FAILED';
    uploadedAt: string;
  };
  file: {
    id: string;
    fileName: string;
  };
  transactionCount: number;
  parsedCount: number;
  insertedCount: number;
  duplicateCount: number;
  reconciliation?: StatementReconciliation;
  insights?: StatementInsightItem[];
  facts: StatementFacts;
  transactions?: StatementTransactionItem[];
  bankDetected?: string;
}

export interface BackendStatementListItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  financialAccountId: string;
  status: string;
  uploadedAt: string;
  statementPeriodStart?: string;
  statementPeriodEnd?: string;
  openingBalance?: number;
  closingBalance?: number;
  bankName?: string;
  accountMask?: string;
}

