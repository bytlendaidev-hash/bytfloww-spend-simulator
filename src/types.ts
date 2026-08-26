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

export interface StatementInflowItem {
  category: string;
  source: string;
  count: number;
  totalAmount: number;
  sharePercent: number;
}

export interface SubcategoryItem {
  name: string;
  debit: number;
  count: number;
  shareOfCategory: number;
}

export interface StatementCategoryItem {
  name: string;
  icon: string;
  count: number;
  debit: number;
  credit: number;
  sharePercent: number;
  avgTicket: number;
  subcategories?: SubcategoryItem[];
}

export interface StatementLenderItem {
  id: string;
  lenderName: string;
  productType: string;
  totalBorrowed: number;
  totalRepaid: number;
  netDelta: number;
  borrowCount: number;
  repayCount: number;
  status: 'ACTIVE_LINE' | 'SERVICED_EMI' | 'REPAID';
}

export interface StatementMonthlyVelocityItem {
  monthKey: string;
  monthName: string;
  inflows: number;
  outflows: number;
  netFlow: number;
  txnCount: number;
  closingBalance: number | null;
  trend: 'SURPLUS' | 'DEFICIT' | 'NEUTRAL';
}

export interface StatementPayeeItem {
  rank: number;
  name: string;
  totalVolume: number;
  debit: number;
  credit: number;
  txnCount: number;
  category: string;
  primaryChannel: string;
}

export interface StatementChannelItem {
  channel: string;
  icon: string;
  txnCount: number;
  debit: number;
  credit: number;
  volumeShare: number;
}

export interface CanonicalTransaction {
  id: string;
  transactionDate: string;
  valueDate: string;
  rawNarration: string;
  normalizedNarration: string;
  debit: number | null;
  credit: number | null;
  amount: number;
  direction: 'DEBIT' | 'CREDIT';
  balanceAfter: number | null;
  currency: string;
  channel: 'UPI' | 'NEFT' | 'IMPS' | 'ATM' | 'ACH' | 'POS' | 'CHQ' | 'INTERNAL' | 'OTHER';
  referenceNumber: string | null;
  entityId: string;
  entityName: string;
  entityType: 'EMPLOYER' | 'LENDER' | 'MERCHANT' | 'PERSON' | 'UTILITY' | 'GOVERNMENT' | 'BANK' | 'UNKNOWN';
  financialType: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DEBT_REPAYMENT' | 'DEBT_DISBURSEMENT' | 'CASH_WITHDRAWAL' | 'FEE_TAX';
  isEconomicExpense: boolean; // True lifestyle consumption
  isMoneyMovement: boolean;   // Transfers, borrowings, self-sweeps
  isSalary: boolean;
  isLoan: boolean;
  isRecurring: boolean;
  isAnomaly: boolean;
  category: string;
  subcategory: string;
  categoryConfidence: number;
  classificationMethod: 'RULE' | 'REGEX' | 'ENTITY' | 'FUZZY' | 'EMBEDDING' | 'USER_OVERRIDE';
}

export interface CounterpartyEntity {
  id: string;
  name: string;
  aliases: string[];
  totalSent: number;
  totalReceived: number;
  netFlow: number; // positive = received more, negative = sent more
  transactionCount: number;
  averageAmount: number;
  firstTransactionDate: string;
  lastTransactionDate: string;
  relationshipConfidence: number;
  entityType: 'PERSON' | 'MERCHANT' | 'LENDER' | 'EMPLOYER' | 'UTILITY';
  primaryChannel: string;
}

export interface EvidenceMetricItem {
  metric: string;
  currentValue: string | number;
  baselineValue?: string | number;
  deltaPercent?: number;
}

export interface EvidenceBackedInsight {
  id: string;
  type: 'RISK' | 'WARNING' | 'OBSERVATION' | 'POSITIVE' | 'OPPORTUNITY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  summary: string;
  whyItMatters: string;
  evidence: EvidenceMetricItem[];
  recommendedAction: string;
  sourceTxnIds?: string[];
  confidence: number;
}

export interface RecurringMandate {
  id: string;
  merchantName: string;
  entityName: string;
  amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  category: string;
  confidence: number;
  lastBilledDate: string;
  nextExpectedDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

export interface AnomalyAlert {
  id: string;
  transactionDate: string;
  narration: string;
  amount: number;
  category: string;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  zScore?: number;
}

export interface FinancialHealthScore {
  score: number;
  tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  debtRatioScore: number;
  savingsRateScore: number;
  incomeStabilityScore: number;
  spendDiversityScore: number;
  primaryRisk: string;
  improvementTip: string;
}

export interface SalaryMonthlyItem {
  monthKey: string;
  monthName: string;
  salaryAmount: number;
  loanCreditAmount: number;
  otherCreditAmount: number;
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
  accountHolder?: string;
  accountNo?: string;
  ifsc?: string;
  branch?: string;
  periodStart?: string;
  periodEnd?: string;
  // Deep Forensic Intelligence Arrays
  inflowDecomposition?: StatementInflowItem[];
  categoryDecomposition?: StatementCategoryItem[];
  lenderMatrix?: StatementLenderItem[];
  monthlyVelocity?: StatementMonthlyVelocityItem[];
  topPayees?: StatementPayeeItem[];
  channelSplit?: StatementChannelItem[];
  // Canonical Intelligence Entities
  canonicalTransactions?: CanonicalTransaction[];
  peopleCounterparties?: CounterpartyEntity[];
  evidenceInsights?: EvidenceBackedInsight[];
  recurringMandates?: RecurringMandate[];
  // Extended intelligence layers
  anomalies?: AnomalyAlert[];
  healthScore?: FinancialHealthScore;
  salaryTimeline?: SalaryMonthlyItem[];
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

export type ActiveModule = 'SMS_INTELLIGENCE' | 'BANK_STATEMENTS';

export type StatementSection = 
  | 'OVERVIEW' 
  | 'INCOME'
  | 'LOANS' 
  | 'PEOPLE'
  | 'LIFESTYLE'
  | 'CASH_FLOW'
  | 'RECURRING'
  | 'ANOMALIES'
  | 'FLOW_MAP'
  | 'CREDIT_CARDS'
  | 'CASH_ATM'
  | 'WALLETS'
  | 'RATIOS'
  | 'WHERE_100_WENT'
  | 'RISK_SCORE'
  | 'TRANSACTIONS'
  | 'AI_ANALYST'
  | 'UPLOAD'
  // Backwards compat aliases
  | 'SPENDING'
  | 'INSIGHTS'
  | 'INFLOW'
  | 'CATEGORIES'
  | 'VELOCITY'
  | 'MERCHANTS'
  | 'CHANNELS'
  | 'LEDGER'
  | 'COPILOT';

export interface BackendFinancialAccount {
  id: string;
  accountName: string;
  accountNumberMasked: string;
  bankName: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'CREDIT_CARD';
  currentBalance: number;
  currency: string;
  isPrimary: boolean;
  lastSyncedAt?: string;
}

export interface BackendLoanItem {
  id: string;
  lenderName: string;
  loanType: string;
  monthlyEmi: number;
  interestRate?: number;
  principalAmount?: number;
  outstandingBalance?: number;
  nextDueDate?: string;
}

export interface BackendRecurringItem {
  id: string;
  merchantName: string;
  amount: number;
  frequency: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'CUSTOM';
  category: string;
  nextBillingDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
}



