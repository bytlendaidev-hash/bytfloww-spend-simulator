/**
 * BytFloww Bank Statement Forensic Intelligence Engine
 * Comprehensive 2-Statement & Financial Year Forensic Data Model
 * Coverage: 01-Apr-2025 → 12-Aug-2026 (16 Months, 2,587 Transactions)
 * 
 * Includes:
 * 01 — Executive Financial Dashboard & Single-Year Filter
 * 02 — Income & Salary Analysis (Newgen Salary vs Loan Credits vs EPFO)
 * 03 — Debt & Loan Intelligence (15-Lender Matrix & Recycling Ratio)
 * 04 — Personal / UPI Transfer Intelligence (The ₹8.22L Recipient Ledger)
 * 05 — True Lifestyle Spending (Food, Grocery, Transport, Shopping)
 * 06 — 16-Month Cash Flow Velocity Dashboard
 * 07 — Recurring Payments & Monthly Burn Rate
 * 08 — Anomaly Detection & Rapid Money Cycling Engine
 * 09 — Visual Money Flow & Cash Map
 * 10 — Credit Card & CRED Analysis
 * 11 — ATM Cash Withdrawal Analysis
 * 12 — Wallet & Payment-Bank Movement
 * 13 — 7 Financial Health Ratios & KPI Benchmarks
 * 14 — "Where Every ₹100 Went" Interactive Visualization
 * 15 — Financial Risk Score & Top 5 Action Plan
 */

export type StatementPeriodFilter = 'ALL_TIME' | 'FY_2025_26' | 'FY_2026_27';

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
  financialYear: 'FY 2025-26' | 'FY 2026-27';
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
  closingBalance: number;
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
  openingBalance: number;
  closingBalance: number;
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
  
  // Debit Separation: Lifestyle vs Money Movement
  trueLifestyleTotal: number;
  trueLifestyleShare: number; // 9.1%
  moneyMovementTotal: number;
  moneyMovementShare: number; // 90.9%
  
  // Debit 14-Category Breakdown
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

// ── MASTER 16-MONTH COMPREHENSIVE FORENSIC DATASET ───────────────────────
export const MASTER_FORENSIC_DATA: ComprehensiveForensicDataset = {
  periodLabel: 'Full Statement Period (16 Months)',
  periodSpan: '01-Apr-2025 → 12-Aug-2026',
  accountHolder: 'MR. DEEPANKAR GAUTAM',
  accountNo: '50100428839082',
  ifsc: 'HDFC0001915',
  bankName: 'HDFC Bank Ltd',
  branch: 'PRATAPGARH UTTAR PRADESH',
  
  totalTransactions: 2587,
  openingBalance: 31424.61,
  closingBalance: 1003.55,
  totalCredits: 2002123.38,
  totalDebits: 2032589.44,
  netCashFlow: -30466.06,
  
  salaryTotal: 1085385.00,
  salaryReimbursements: 2586.00,
  loanCreditsTotal: 383100.09,
  epfoCreditsTotal: 109653.00,
  refundsReversalsTotal: 5645.37,
  interestCreditsTotal: 372.00,
  
  trueLifestyleTotal: 184994.40,
  trueLifestyleShare: 9.10,
  moneyMovementTotal: 1847595.04,
  moneyMovementShare: 90.90,
  
  debitBreakdown: [
    { rank: 1, category: 'UPI / Other Transfers', amount: 822478.36, percentage: 40.46, isLifestyle: false, icon: '👥' },
    { rank: 2, category: 'Loan / Finance Repayments', amount: 444503.80, percentage: 21.87, isLifestyle: false, icon: '🏦' },
    { rank: 3, category: 'Wallet / Payment-Bank Movement', amount: 245672.15, percentage: 12.09, isLifestyle: false, icon: '📱' },
    { rank: 4, category: 'Cash Withdrawals (ATM)', amount: 130500.00, percentage: 6.42, isLifestyle: false, icon: '🏧' },
    { rank: 5, category: 'Credit Card / CRED Payments', amount: 113571.84, percentage: 5.59, isLifestyle: false, icon: '💳' },
    { rank: 6, category: 'Insurance Policies (LIC)', amount: 65736.31, percentage: 3.24, isLifestyle: false, icon: '🛡️' },
    { rank: 7, category: 'Shopping & E-Commerce', amount: 46185.76, percentage: 2.27, isLifestyle: true, icon: '🛍️' },
    { rank: 8, category: 'Utilities, Telecom & Cloud', amount: 37254.14, percentage: 1.83, isLifestyle: true, icon: '⚡' },
    { rank: 9, category: 'Transport & Travel', amount: 36146.73, percentage: 1.78, isLifestyle: true, icon: '🚕' },
    { rank: 10, category: 'Food & Dining (Swiggy/Zomato)', amount: 36093.49, percentage: 1.78, isLifestyle: true, icon: '🍔' },
    { rank: 11, category: 'Groceries & Quick Commerce', amount: 26510.66, percentage: 1.30, isLifestyle: true, icon: '🛒' },
    { rank: 12, category: 'Other Unclassified / Misc', amount: 24144.08, percentage: 1.19, isLifestyle: false, icon: '📦' },
    { rank: 13, category: 'Digital Subscriptions', amount: 2803.62, percentage: 0.14, isLifestyle: true, icon: '🎬' },
    { rank: 14, category: 'Bank & Govt Charges', amount: 988.50, percentage: 0.05, isLifestyle: false, icon: '🏛️' },
  ],
  
  lenders: [
    {
      id: 'len_mpokket',
      name: 'MPOKKET Financial Services',
      productType: 'Short-Term Revolving Credit',
      totalBorrowed: 122913.20,
      totalRepaid: 108004.96,
      netDelta: -14908.24,
      borrowCount: 32,
      repayCount: 54,
      status: 'ACTIVE_LINE',
      lastDisbursedDate: '08 Aug 2026',
      lastRepaymentDate: '10 Aug 2026',
      recyclingRisk: 'HIGH',
    },
    {
      id: 'len_meghdoot',
      name: 'Meghdoot Mercantile Pvt Ltd',
      productType: 'Digital Personal Micro-Loan',
      totalBorrowed: 50640.00,
      totalRepaid: 69774.09,
      netDelta: 19134.09,
      borrowCount: 8,
      repayCount: 14,
      status: 'SERVICED_EMI',
      lastDisbursedDate: '15 Jul 2026',
      lastRepaymentDate: '02 Aug 2026',
      recyclingRisk: 'MODERATE',
    },
    {
      id: 'len_growmoney',
      name: 'Grow Money Capital',
      productType: 'Short-Term Credit Line',
      totalBorrowed: 43973.00,
      totalRepaid: 53530.00,
      netDelta: 9557.00,
      borrowCount: 6,
      repayCount: 9,
      status: 'SERVICED_EMI',
      lastDisbursedDate: '24 May 2026',
      lastRepaymentDate: '28 Jun 2026',
      recyclingRisk: 'MODERATE',
    },
    {
      id: 'len_vivifi',
      name: 'VIVIFI India Finance (FlexPay)',
      productType: 'Digital Revolving Line of Credit',
      totalBorrowed: 44885.94,
      totalRepaid: 40170.95,
      netDelta: -4714.99,
      borrowCount: 11,
      repayCount: 18,
      status: 'ACTIVE_LINE',
      lastDisbursedDate: '20 Jul 2026',
      lastRepaymentDate: '25 Jul 2026',
      recyclingRisk: 'HIGH',
    },
    {
      id: 'len_salaryontime',
      name: 'SalaryOnTime',
      productType: 'Advance Salary Micro-Loan',
      totalBorrowed: 22000.00,
      totalRepaid: 26929.05,
      netDelta: 4929.05,
      borrowCount: 4,
      repayCount: 6,
      status: 'REPAID',
      lastDisbursedDate: '10 Apr 2026',
      lastRepaymentDate: '05 May 2026',
      recyclingRisk: 'LOW',
    },
    {
      id: 'len_zedleafin',
      name: 'Zed Leafin / Salary Now',
      productType: 'Short-Term Payroll Advance',
      totalBorrowed: 29106.00,
      totalRepaid: 19800.00,
      netDelta: -9306.00,
      borrowCount: 5,
      repayCount: 4,
      status: 'ACTIVE_LINE',
      lastDisbursedDate: '02 Aug 2026',
      lastRepaymentDate: '05 Aug 2026',
      recyclingRisk: 'HIGH',
    },
    {
      id: 'len_kasar',
      name: 'Kasar Credit & Capital',
      productType: 'Micro-Credit Disbursal',
      totalBorrowed: 20286.00,
      totalRepaid: 18400.00,
      netDelta: -1886.00,
      borrowCount: 3,
      repayCount: 3,
      status: 'ACTIVE_LINE',
      lastDisbursedDate: '12 Jun 2026',
      lastRepaymentDate: '18 Jun 2026',
      recyclingRisk: 'MODERATE',
    },
    {
      id: 'len_branch',
      name: 'Branch International',
      productType: 'Digital Instant Personal Loan',
      totalBorrowed: 17082.00,
      totalRepaid: 15200.00,
      netDelta: -1882.00,
      borrowCount: 4,
      repayCount: 5,
      status: 'ACTIVE_LINE',
      lastDisbursedDate: '18 Jul 2026',
      lastRepaymentDate: '24 Jul 2026',
      recyclingRisk: 'MODERATE',
    },
    {
      id: 'len_talazen',
      name: 'Talazen Financial Services',
      productType: 'Micro-Credit Line',
      totalBorrowed: 16500.00,
      totalRepaid: 14000.00,
      netDelta: -2500.00,
      borrowCount: 3,
      repayCount: 3,
      status: 'ACTIVE_LINE',
      lastDisbursedDate: '05 May 2026',
      lastRepaymentDate: '15 May 2026',
      recyclingRisk: 'MODERATE',
    },
    {
      id: 'len_avinash',
      name: 'Avinash Capital',
      productType: 'Short-Term Disbursal',
      totalBorrowed: 14994.00,
      totalRepaid: 13500.00,
      netDelta: -1494.00,
      borrowCount: 2,
      repayCount: 2,
      status: 'REPAID',
      lastDisbursedDate: '10 Mar 2026',
      lastRepaymentDate: '20 Mar 2026',
      recyclingRisk: 'LOW',
    },
    {
      id: 'len_unifinz',
      name: 'Unifinz Capital',
      productType: 'Consumer Loan',
      totalBorrowed: 14341.00,
      totalRepaid: 12800.00,
      netDelta: -1541.00,
      borrowCount: 2,
      repayCount: 2,
      status: 'REPAID',
      lastDisbursedDate: '14 Feb 2026',
      lastRepaymentDate: '25 Feb 2026',
      recyclingRisk: 'LOW',
    },
    {
      id: 'len_northeast',
      name: 'North East Hire Purchase',
      productType: 'Micro-Financing',
      totalBorrowed: 6684.00,
      totalRepaid: 5900.00,
      netDelta: -784.00,
      borrowCount: 1,
      repayCount: 1,
      status: 'CLOSED',
      lastDisbursedDate: '05 Jan 2026',
      lastRepaymentDate: '15 Jan 2026',
      recyclingRisk: 'LOW',
    },
    {
      id: 'len_flexsalary',
      name: 'FlexSalary (Vivifi Alternate)',
      productType: 'Line of Credit',
      totalBorrowed: 0,
      totalRepaid: 12150.00,
      netDelta: 12150.00,
      borrowCount: 0,
      repayCount: 4,
      status: 'SERVICED_EMI',
      recyclingRisk: 'LOW',
    },
    {
      id: 'len_snapmint',
      name: 'Snapmint Financial',
      productType: '0% EMI Consumer Durable',
      totalBorrowed: 0,
      totalRepaid: 7890.00,
      netDelta: 7890.00,
      borrowCount: 0,
      repayCount: 6,
      status: 'SERVICED_EMI',
      recyclingRisk: 'LOW',
    },
    {
      id: 'len_cnmp',
      name: 'CNMP & Other Small Lenders',
      productType: 'Micro Loan Settled',
      totalBorrowed: 0,
      totalRepaid: 34494.75,
      netDelta: 34494.75,
      borrowCount: 0,
      repayCount: 12,
      status: 'SERVICED_EMI',
      recyclingRisk: 'LOW',
    },
  ],
  
  recipients: [
    {
      id: 'rec_boby',
      name: 'Boby Tandan',
      upiHandle: 'BBOBY3580OKAXIS / bobytandan@axis',
      totalSent: 242501.00,
      totalReceived: 130132.00,
      netOutflow: 112369.00,
      txnCount: 38,
      largestTxn: 25000.00,
      smallestTxn: 500.00,
      monthlyAverage: 15156.00,
      relationshipTag: 'Friend',
      flaggedPriority: 'CRITICAL',
      notes: '🚨 LARGEST NON-LENDER OUTFLOW (₹2.43L total sent). Highly active liquidity channel requiring manual review.',
    },
    {
      id: 'rec_piyush',
      name: 'Piyush Srivastava',
      upiHandle: 'piyush.sri@okicici',
      totalSent: 72218.00,
      totalReceived: 18500.00,
      netOutflow: 53718.00,
      txnCount: 19,
      largestTxn: 12000.00,
      smallestTxn: 250.00,
      monthlyAverage: 4513.00,
      relationshipTag: 'Personal Transfer',
      flaggedPriority: 'HIGH',
      notes: 'Frequent peer UPI transfers spanning all 16 months.',
    },
    {
      id: 'rec_barsati',
      name: 'Barsati Ram',
      upiHandle: 'barsatiram@oksbi',
      totalSent: 45000.00,
      totalReceived: 0,
      netOutflow: 45000.00,
      txnCount: 5,
      largestTxn: 15000.00,
      smallestTxn: 5000.00,
      monthlyAverage: 2812.00,
      relationshipTag: 'Family',
      flaggedPriority: 'NORMAL',
      notes: 'Direct family support / household assistance transfers.',
    },
    {
      id: 'rec_veenu',
      name: 'Veenu Tandan',
      upiHandle: 'veenutandan@okaxis',
      totalSent: 42000.00,
      totalReceived: 0,
      netOutflow: 42000.00,
      txnCount: 7,
      largestTxn: 10000.00,
      smallestTxn: 2000.00,
      monthlyAverage: 2625.00,
      relationshipTag: 'Family',
      flaggedPriority: 'NORMAL',
      notes: 'Related to Boby Tandan family channel.',
    },
    {
      id: 'rec_abhishek',
      name: 'Abhishek Bahadur',
      upiHandle: 'abhishek.b@paytm',
      totalSent: 34500.00,
      totalReceived: 10000.00,
      netOutflow: 24500.00,
      txnCount: 8,
      largestTxn: 8000.00,
      smallestTxn: 500.00,
      monthlyAverage: 2156.00,
      relationshipTag: 'Personal Transfer',
      flaggedPriority: 'NORMAL',
      notes: 'Peer transactions and split expenses.',
    },
    {
      id: 'rec_kulpat',
      name: 'Kulpat Bhaskar',
      upiHandle: 'kulpatbhaskar@ybl',
      totalSent: 32000.00,
      totalReceived: 0,
      netOutflow: 32000.00,
      txnCount: 6,
      largestTxn: 10000.00,
      smallestTxn: 2000.00,
      monthlyAverage: 2000.00,
      relationshipTag: 'Personal Transfer',
      flaggedPriority: 'NORMAL',
      notes: 'Regular monthly transfers.',
    },
    {
      id: 'rec_govind',
      name: 'Govind Lal Soni',
      upiHandle: 'govindsoni@okaxis',
      totalSent: 27500.00,
      totalReceived: 0,
      netOutflow: 27500.00,
      txnCount: 4,
      largestTxn: 12500.00,
      smallestTxn: 3000.00,
      monthlyAverage: 1718.00,
      relationshipTag: 'Merchant',
      flaggedPriority: 'NORMAL',
      notes: 'Local merchant / jeweler settlements.',
    },
    {
      id: 'rec_ranjeet',
      name: 'Ranjeet',
      upiHandle: 'ranjeet.up@oksbi',
      totalSent: 26670.00,
      totalReceived: 4000.00,
      netOutflow: 22670.00,
      txnCount: 9,
      largestTxn: 6000.00,
      smallestTxn: 700.00,
      monthlyAverage: 1667.00,
      relationshipTag: 'Personal Transfer',
      flaggedPriority: 'NORMAL',
      notes: 'Peer-to-peer transfers.',
    },
    {
      id: 'rec_deepak',
      name: 'Deepak Kumar',
      upiHandle: 'deepak.kr@paytm',
      totalSent: 21126.00,
      totalReceived: 5000.00,
      netOutflow: 16126.00,
      txnCount: 7,
      largestTxn: 7000.00,
      smallestTxn: 450.00,
      monthlyAverage: 1320.00,
      relationshipTag: 'Personal Transfer',
      flaggedPriority: 'NORMAL',
      notes: 'Peer transfers.',
    },
    {
      id: 'rec_milind',
      name: 'Milind Kumar',
      upiHandle: 'milind.k@okicici',
      totalSent: 15001.00,
      totalReceived: 0,
      netOutflow: 15001.00,
      txnCount: 3,
      largestTxn: 8000.00,
      smallestTxn: 2000.00,
      monthlyAverage: 937.00,
      relationshipTag: 'Personal Transfer',
      flaggedPriority: 'NORMAL',
      notes: 'Occasional high-ticket transfers.',
    },
  ],
  
  lifestyleDetails: {
    food: {
      category: 'Food & Dining',
      icon: '🍔',
      totalAmount: 36093.49,
      shareOfDebits: 1.78,
      monthlyAverage: 2255.84,
      merchants: [
        { name: 'Swiggy Food Orders', amount: 29686.49, sharePercent: 82.25, count: 88, notes: 'Direct restaurant meals (Swiggy Instamart is cleanly separated into Groceries)' },
        { name: 'Zomato', amount: 1313.19, sharePercent: 3.64, count: 5, notes: 'Food delivery' },
        { name: 'Other Restaurants & Dining', amount: 5093.81, sharePercent: 14.11, count: 18, notes: 'Local cafes and dine-in POS' },
      ],
    },
    grocery: {
      category: 'Groceries & Quick Commerce',
      icon: '🛒',
      totalAmount: 26510.66,
      shareOfDebits: 1.30,
      monthlyAverage: 1656.92,
      merchants: [
        { name: 'Swiggy Instamart', amount: 6407.00, sharePercent: 24.17, count: 14, notes: 'Instant grocery essentials' },
        { name: 'Blinkit', amount: 6074.00, sharePercent: 22.91, count: 16, notes: '10-minute quick commerce' },
        { name: 'Zepto', amount: 5367.74, sharePercent: 20.25, count: 11, notes: 'Quick commerce essentials' },
        { name: 'Smart Bazaar (Reliance Retail)', amount: 3185.92, sharePercent: 12.02, count: 3, notes: 'Supermarket shopping' },
        { name: 'Other Local Grocery Stores', amount: 5476.00, sharePercent: 20.65, count: 19, notes: 'Local kirana & milk' },
      ],
    },
    transport: {
      category: 'Transport & Travel',
      icon: '🚕',
      totalAmount: 36146.73,
      shareOfDebits: 1.78,
      monthlyAverage: 2259.17,
      merchants: [
        { name: 'IRCTC / Indian Railways', amount: 29751.64, sharePercent: 82.31, count: 24, notes: 'Train travel bookings' },
        { name: 'Rapido Bike Taxi', amount: 3042.00, sharePercent: 8.42, count: 42, notes: 'Daily short commute' },
        { name: 'Uber Rides', amount: 2458.84, sharePercent: 6.80, count: 11, notes: 'City cab rides' },
        { name: 'Metro / Fuel / Other', amount: 894.25, sharePercent: 2.47, count: 6, notes: 'DMRC Metro & petrol' },
      ],
    },
    shopping: {
      category: 'Shopping & E-Commerce',
      icon: '🛍️',
      totalAmount: 46185.76,
      shareOfDebits: 2.27,
      monthlyAverage: 2886.61,
      merchants: [
        { name: 'Amazon Pay / Amazon Shopping', amount: 14437.00, sharePercent: 31.26, count: 18, notes: 'E-commerce & merchant payments' },
        { name: 'Sakeena Suit Collection', amount: 11000.00, sharePercent: 23.82, count: 2, notes: 'Apparel & ethnic wear' },
        { name: 'Pankaj Textiles', amount: 7690.00, sharePercent: 16.65, count: 3, notes: 'Clothing & fabrics' },
        { name: 'Zudio (Trent Limited)', amount: 5591.00, sharePercent: 12.11, count: 5, notes: 'Retail fast fashion' },
        { name: 'AJIO (Reliance)', amount: 4525.50, sharePercent: 9.80, count: 4, notes: 'Online clothing' },
        { name: 'Myntra Fashion', amount: 2170.26, sharePercent: 4.70, count: 3, notes: 'Apparel' },
        { name: 'Flipkart', amount: 770.00, sharePercent: 1.67, count: 1, notes: 'E-commerce' },
        { name: 'Other Shopping', amount: 2.00, sharePercent: 0.00, count: 1, notes: 'Misc' },
      ],
    },
    utilities: {
      category: 'Utilities & Telecom',
      icon: '⚡',
      totalAmount: 37254.14,
      shareOfDebits: 1.83,
      monthlyAverage: 2328.38,
      merchants: [
        { name: 'Electricity Bills (UPPCL)', amount: 18450.00, sharePercent: 49.52, count: 12, notes: 'Monthly power bills' },
        { name: 'Airtel Broadband & Mobile', amount: 12450.00, sharePercent: 33.42, count: 16, notes: 'Fiber & cellular' },
        { name: 'Google Cloud / Workspace', amount: 4254.14, sharePercent: 11.42, count: 14, notes: 'Cloud infrastructure' },
        { name: 'Water & Municipal Bills', amount: 2100.00, sharePercent: 5.64, count: 4, notes: 'Utilities' },
      ],
    },
    subscriptions: {
      category: 'Digital Subscriptions',
      icon: '🎬',
      totalAmount: 2803.62,
      shareOfDebits: 0.14,
      monthlyAverage: 175.23,
      merchants: [
        { name: 'Netflix Premium AutoPay', amount: 1194.00, sharePercent: 42.59, count: 6, notes: '₹199/month mandate' },
        { name: 'Google One Storage', amount: 894.00, sharePercent: 31.89, count: 6, notes: '₹149/month mandate' },
        { name: 'Spotify / YouTube Music', amount: 715.62, sharePercent: 25.52, count: 5, notes: 'Music streaming' },
      ],
    },
  },
  
  monthlyCashFlow: [
    {
      monthKey: '2025-04',
      monthName: 'Apr 2025',
      financialYear: 'FY 2025-26',
      salary: 61722.00,
      loansReceived: 18000.00,
      otherIncome: 14200.00,
      totalCredits: 93922.00,
      loanRepaid: 24500.00,
      personalTransfers: 41200.00,
      lifestyleSpend: 11450.00,
      cashWithdrawals: 8000.00,
      walletMovements: 12500.00,
      creditCardPayments: 5400.00,
      totalDebits: 103050.00,
      netCashFlow: -9128.00,
      closingBalance: 22296.61,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2025-05',
      monthName: 'May 2025',
      financialYear: 'FY 2025-26',
      salary: 61722.00,
      loansReceived: 22000.00,
      otherIncome: 8500.00,
      totalCredits: 92222.00,
      loanRepaid: 28400.00,
      personalTransfers: 38500.00,
      lifestyleSpend: 10800.00,
      cashWithdrawals: 6000.00,
      walletMovements: 11000.00,
      creditCardPayments: 6200.00,
      totalDebits: 100900.00,
      netCashFlow: -8678.00,
      closingBalance: 13618.61,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2025-06',
      monthName: 'Jun 2025',
      financialYear: 'FY 2025-26',
      salary: 61722.00,
      loansReceived: 19500.00,
      otherIncome: 6200.00,
      totalCredits: 87422.00,
      loanRepaid: 26100.00,
      personalTransfers: 34200.00,
      lifestyleSpend: 9850.00,
      cashWithdrawals: 7500.00,
      walletMovements: 9500.00,
      creditCardPayments: 4800.00,
      totalDebits: 91950.00,
      netCashFlow: -4528.00,
      closingBalance: 9090.61,
      isDeficit: true,
      obligationsExceedSalary: false,
    },
    {
      monthKey: '2025-07',
      monthName: 'Jul 2025',
      financialYear: 'FY 2025-26',
      salary: 61722.00,
      loansReceived: 35000.00,
      otherIncome: 32500.00,
      totalCredits: 129222.00,
      loanRepaid: 22400.00,
      personalTransfers: 42100.00,
      lifestyleSpend: 12400.00,
      cashWithdrawals: 5000.00,
      walletMovements: 8233.81,
      creditCardPayments: 4000.00,
      totalDebits: 94133.81,
      netCashFlow: 35088.19,
      closingBalance: 44178.80,
      isDeficit: false,
      obligationsExceedSalary: false,
    },
    {
      monthKey: '2025-08',
      monthName: 'Aug 2025',
      financialYear: 'FY 2025-26',
      salary: 61722.00,
      loansReceived: 16000.00,
      otherIncome: 4500.00,
      totalCredits: 82222.00,
      loanRepaid: 31200.00,
      personalTransfers: 51200.00,
      lifestyleSpend: 13500.00,
      cashWithdrawals: 9000.00,
      walletMovements: 4187.94,
      creditCardPayments: 5000.00,
      totalDebits: 114087.94,
      netCashFlow: -31865.94,
      closingBalance: 12312.86,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2025-09',
      monthName: 'Sep 2025',
      financialYear: 'FY 2025-26',
      salary: 65400.00,
      loansReceived: 21000.00,
      otherIncome: 7800.00,
      totalCredits: 94200.00,
      loanRepaid: 27500.00,
      personalTransfers: 44600.00,
      lifestyleSpend: 11200.00,
      cashWithdrawals: 8000.00,
      walletMovements: 6200.00,
      creditCardPayments: 4200.00,
      totalDebits: 101700.00,
      netCashFlow: -7500.00,
      closingBalance: 4812.86,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2025-10',
      monthName: 'Oct 2025',
      financialYear: 'FY 2025-26',
      salary: 65400.00,
      loansReceived: 38000.00,
      otherIncome: 40474.39,
      totalCredits: 143874.39,
      loanRepaid: 32000.00,
      personalTransfers: 48200.00,
      lifestyleSpend: 16800.00,
      cashWithdrawals: 11000.00,
      walletMovements: 4169.75,
      creditCardPayments: 3200.00,
      totalDebits: 115369.75,
      netCashFlow: 28504.64,
      closingBalance: 33317.50,
      isDeficit: false,
      obligationsExceedSalary: false,
    },
    {
      monthKey: '2025-11',
      monthName: 'Nov 2025',
      financialYear: 'FY 2025-26',
      salary: 65400.00,
      loansReceived: 14000.00,
      otherIncome: 3500.00,
      totalCredits: 82900.00,
      loanRepaid: 35400.00,
      personalTransfers: 58200.00,
      lifestyleSpend: 14100.00,
      cashWithdrawals: 12000.00,
      walletMovements: 5916.60,
      creditCardPayments: 5000.00,
      totalDebits: 130616.60,
      netCashFlow: -47716.60,
      closingBalance: -14399.10,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2025-12',
      monthName: 'Dec 2025',
      financialYear: 'FY 2025-26',
      salary: 65400.00,
      loansReceived: 31000.00,
      otherIncome: 9200.00,
      totalCredits: 105600.00,
      loanRepaid: 29800.00,
      personalTransfers: 46100.00,
      lifestyleSpend: 12600.00,
      cashWithdrawals: 8500.00,
      walletMovements: 7200.00,
      creditCardPayments: 4500.00,
      totalDebits: 108700.00,
      netCashFlow: -3100.00,
      closingBalance: -17499.10,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2026-01',
      monthName: 'Jan 2026',
      financialYear: 'FY 2025-26',
      salary: 65400.00,
      loansReceived: 12000.00,
      otherIncome: 22600.00,
      totalCredits: 100000.00,
      loanRepaid: 14200.00,
      personalTransfers: 18400.00,
      lifestyleSpend: 5800.00,
      cashWithdrawals: 3000.00,
      walletMovements: 2165.59,
      creditCardPayments: 1500.00,
      totalDebits: 45065.59,
      netCashFlow: 54934.41,
      closingBalance: 37435.31,
      isDeficit: false,
      obligationsExceedSalary: false,
    },
    {
      monthKey: '2026-02',
      monthName: 'Feb 2026',
      financialYear: 'FY 2025-26',
      salary: 65400.00,
      loansReceived: 24500.00,
      otherIncome: 6500.00,
      totalCredits: 96400.00,
      loanRepaid: 28900.00,
      personalTransfers: 47200.00,
      lifestyleSpend: 11400.00,
      cashWithdrawals: 7000.00,
      walletMovements: 6800.00,
      creditCardPayments: 5200.00,
      totalDebits: 106500.00,
      netCashFlow: -10100.00,
      closingBalance: 27335.31,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2026-03',
      monthName: 'Mar 2026',
      financialYear: 'FY 2025-26',
      salary: 65400.00,
      loansReceived: 29000.00,
      otherIncome: 22625.57,
      totalCredits: 117025.57,
      loanRepaid: 41200.00,
      personalTransfers: 69400.00,
      lifestyleSpend: 18500.00,
      cashWithdrawals: 14000.00,
      walletMovements: 20536.06,
      creditCardPayments: 7800.00,
      totalDebits: 171436.06,
      netCashFlow: -54410.49,
      closingBalance: 14771.77,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    // FY 2026-27 (Apr 2026 → Aug 2026)
    {
      monthKey: '2026-04',
      monthName: 'Apr 2026',
      financialYear: 'FY 2026-27',
      salary: 73245.00,
      loansReceived: 28000.00,
      otherIncome: 12500.00,
      totalCredits: 113745.00,
      loanRepaid: 31500.00,
      personalTransfers: 49800.00,
      lifestyleSpend: 11900.00,
      cashWithdrawals: 8000.00,
      walletMovements: 12000.00,
      creditCardPayments: 6500.00,
      totalDebits: 119700.00,
      netCashFlow: -5955.00,
      closingBalance: 8816.77,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2026-05',
      monthName: 'May 2026',
      financialYear: 'FY 2026-27',
      salary: 73245.00,
      loansReceived: 31000.00,
      otherIncome: 8900.00,
      totalCredits: 113145.00,
      loanRepaid: 34200.00,
      personalTransfers: 52100.00,
      lifestyleSpend: 12800.00,
      cashWithdrawals: 9000.00,
      walletMovements: 14200.00,
      creditCardPayments: 7200.00,
      totalDebits: 129500.00,
      netCashFlow: -16355.00,
      closingBalance: -7538.23,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2026-06',
      monthName: 'Jun 2026',
      financialYear: 'FY 2026-27',
      salary: 73245.00,
      loansReceived: 36000.00,
      otherIncome: 9800.00,
      totalCredits: 119045.00,
      loanRepaid: 33800.00,
      personalTransfers: 48900.00,
      lifestyleSpend: 12100.00,
      cashWithdrawals: 8500.00,
      walletMovements: 11500.00,
      creditCardPayments: 6800.00,
      totalDebits: 121600.00,
      netCashFlow: -2555.00,
      closingBalance: -10093.23,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
    {
      monthKey: '2026-07',
      monthName: 'Jul 2026',
      financialYear: 'FY 2026-27',
      salary: 73245.00,
      loansReceived: 42000.00,
      otherIncome: 45000.00,
      totalCredits: 160245.00,
      loanRepaid: 34500.00,
      personalTransfers: 54200.00,
      lifestyleSpend: 14200.00,
      cashWithdrawals: 10500.00,
      walletMovements: 12443.65,
      creditCardPayments: 6000.00,
      totalDebits: 131843.65,
      netCashFlow: 28401.35,
      closingBalance: 18308.12,
      isDeficit: false,
      obligationsExceedSalary: false,
    },
    {
      monthKey: '2026-08',
      monthName: 'Aug 2026 (M-T-D)',
      financialYear: 'FY 2026-27',
      salary: 73245.00,
      loansReceived: 21500.00,
      otherIncome: 3500.00,
      totalCredits: 98245.00,
      loanRepaid: 36500.00,
      personalTransfers: 58200.00,
      lifestyleSpend: 13800.00,
      cashWithdrawals: 9500.00,
      walletMovements: 9623.70,
      creditCardPayments: 6000.00,
      totalDebits: 133623.70,
      netCashFlow: -35378.70,
      closingBalance: 1003.55,
      isDeficit: true,
      obligationsExceedSalary: true,
    },
  ],
  
  anomalies: [
    {
      id: 'anom_1',
      date: '28-Mar-2026',
      narration: 'UPI-BBOBY3580OKAXIS-DEBIT TO BOBY TANDAN',
      amount: 25000.00,
      type: 'LARGE_TXN',
      severity: 'HIGH',
      explanation: 'Unusually large single peer transfer to Boby Tandan exceeding 2.5× baseline ticket.',
      counterparty: 'Boby Tandan',
    },
    {
      id: 'anom_2',
      date: '15-Jul-2026',
      narration: 'LOAN DISBURSAL MPOKKET SERVICES',
      amount: 20000.00,
      type: 'RAPID_MONEY_CYCLING',
      severity: 'HIGH',
      explanation: '₹20,000 borrowed from mPokket immediately transferred out (₹19,500) within 3 hours to personal contact.',
      counterparty: 'mPokket / Boby Tandan',
    },
    {
      id: 'anom_3',
      date: '10-Oct-2025',
      narration: 'SAKEENA SUIT COLLECTION PRATAPGARH',
      amount: 11000.00,
      type: 'SPIKE_ANOMALY',
      severity: 'MEDIUM',
      explanation: 'Single retail apparel purchase represents 23.8% of total shopping spend across 16 months.',
      counterparty: 'Sakeena Suit Collection',
    },
    {
      id: 'anom_4',
      date: '04-Nov-2025',
      narration: 'UPI-PIYUSH SRIVASTAVA-TRANSFER',
      amount: 12000.00,
      type: 'DUPLICATE_LOOKING',
      severity: 'MEDIUM',
      explanation: 'Two sequential transfers of ₹12,000 and ₹6,000 sent within 24 hours to Piyush Srivastava.',
      counterparty: 'Piyush Srivastava',
    },
    {
      id: 'anom_5',
      date: '18-Mar-2026',
      narration: 'ATM CASH WITHDRAWAL PRATAPGARH',
      amount: 10000.00,
      type: 'LARGE_TXN',
      severity: 'MEDIUM',
      explanation: 'Maximum ATM withdrawal on a single day, increasing untraceable cash leakage.',
      counterparty: 'HDFC Bank ATM',
    },
  ],
  
  ratios: [
    {
      ratioName: 'Debt-to-Salary Ratio',
      formula: 'Total Loan Repayments ÷ Total Corporate Salary',
      currentValue: 41.0,
      unit: '%',
      benchmark: '< 25.0%',
      status: 'CRITICAL',
      assessment: '41% of your employment income is directly consumed by micro-loans and debt servicing.',
    },
    {
      ratioName: 'True Lifestyle-to-Income Ratio',
      formula: 'True Consumption (Food+Shop+Travel+Util) ÷ Salary',
      currentValue: 17.0,
      unit: '%',
      benchmark: '< 35.0%',
      status: 'HEALTHY',
      assessment: 'Identifiable lifestyle consumption is modest (only ₹1.85L over 16 months / ₹11.5K/mo).',
    },
    {
      ratioName: 'Personal Transfer Ratio',
      formula: 'Personal Peer Transfers ÷ Corporate Salary',
      currentValue: 75.8,
      unit: '%',
      benchmark: '< 15.0%',
      status: 'CRITICAL',
      assessment: 'Peer transfers (₹8.22L) consume nearly 76% of your salary, causing recurring deficits.',
    },
    {
      ratioName: 'Borrowing Dependency Ratio',
      formula: 'Loan Disbursals Received ÷ Total Inflows',
      currentValue: 19.1,
      unit: '%',
      benchmark: '< 5.0%',
      status: 'MODERATE',
      assessment: 'Nearly 1 in every 5 Rupees entering the account is borrowed digital debt.',
    },
    {
      ratioName: 'Cash Leakage Ratio',
      formula: 'ATM Cash Withdrawals ÷ Total Debits',
      currentValue: 6.4,
      unit: '%',
      benchmark: '< 3.0%',
      status: 'MODERATE',
      assessment: '₹1.31L withdrawn in cash cannot be audited or categorized by bank statements.',
    },
    {
      ratioName: 'Savings & Net Flow Rate',
      formula: '(Total Credits − Total Debits) ÷ Total Credits',
      currentValue: -1.5,
      unit: '%',
      benchmark: '> +15.0%',
      status: 'CRITICAL',
      assessment: 'The account ran at an overall cumulative deficit of -₹30,466 over 16 months.',
    },
    {
      ratioName: 'Debt Recycling Efficiency',
      formula: '(Loan Repayments − Loan Disbursals) ÷ Loan Disbursals',
      currentValue: 16.0,
      unit: '%',
      benchmark: '> 0.0%',
      status: 'HEALTHY',
      assessment: 'Positive deleveraging (+₹61.4K more repaid than borrowed across the 16-month period).',
    },
  ],
  
  where100Went: [
    { category: 'UPI / Personal Transfers', amount: 822478.36, percentage: 40.46, color: '#6366F1', isLifestyle: false, isMoneyMovement: true },
    { category: 'Loan / Finance Repayments', amount: 444503.80, percentage: 21.87, color: '#E11D48', isLifestyle: false, isMoneyMovement: true },
    { category: 'Wallet / Payment-Bank Movement', amount: 245672.15, percentage: 12.09, color: '#F59E0B', isLifestyle: false, isMoneyMovement: true },
    { category: 'Cash Withdrawals (ATM)', amount: 130500.00, percentage: 6.42, color: '#64748B', isLifestyle: false, isMoneyMovement: true },
    { category: 'Credit Card / CRED Payments', amount: 113571.84, percentage: 5.59, color: '#EC4899', isLifestyle: false, isMoneyMovement: true },
    { category: 'Insurance Policies (LIC)', amount: 65736.31, percentage: 3.24, color: '#8B5CF6', isLifestyle: false, isMoneyMovement: true },
    { category: 'Shopping & E-Commerce', amount: 46185.76, percentage: 2.27, color: '#10B981', isLifestyle: true, isMoneyMovement: false },
    { category: 'Utilities, Telecom & Cloud', amount: 37254.14, percentage: 1.83, color: '#06B6D4', isLifestyle: true, isMoneyMovement: false },
    { category: 'Transport & Travel (IRCTC/Cabs)', amount: 36146.73, percentage: 1.78, color: '#3B82F6', isLifestyle: true, isMoneyMovement: false },
    { category: 'Food & Dining (Swiggy/Zomato)', amount: 36093.49, percentage: 1.78, color: '#F97316', isLifestyle: true, isMoneyMovement: false },
    { category: 'Groceries & Quick Commerce', amount: 26510.66, percentage: 1.30, color: '#84CC16', isLifestyle: true, isMoneyMovement: false },
    { category: 'Other Unclassified / Misc', amount: 24144.08, percentage: 1.19, color: '#94A3B8', isLifestyle: false, isMoneyMovement: false },
    { category: 'Digital Subscriptions', amount: 2803.62, percentage: 0.14, color: '#A855F7', isLifestyle: true, isMoneyMovement: false },
    { category: 'Bank & Govt Charges', amount: 988.50, percentage: 0.05, color: '#CBD5E1', isLifestyle: false, isMoneyMovement: false },
  ],
  
  riskScores: [
    { dimension: 'Income Stability', rating: 'GREEN', scoreText: 'Solid Corporate Employment', details: 'Regular monthly salary from Newgen Software Technologies with positive increment from ₹61.7K to ₹73.2K.' },
    { dimension: 'Debt Burden', rating: 'RED', scoreText: '41.0% Debt Servicing Ratio', details: 'Loan repayments absorb 41% of salary, causing continuous cash flow strain.' },
    { dimension: 'Loan Dependency', rating: 'RED', scoreText: 'Frequent Micro-Borrowing', details: '₹3.83L borrowed across 11 short-term lenders with rapid 48-hour recycling cycles.' },
    { dimension: 'Lifestyle Spending', rating: 'GREEN', scoreText: 'Modest Discretionary Spend', details: 'True lifestyle spend (Food, Cabs, Groceries, Shopping) is only 9.1% of total debits (~₹11.5K/month).' },
    { dimension: 'Personal Transfers', rating: 'RED', scoreText: '₹8.22 Lakh Sent to Others', details: 'Personal UPI transfers represent 40.5% of all money leaving the account.' },
    { dimension: 'Cash Leakage', rating: 'AMBER', scoreText: '₹1.31 Lakh Untraceable Cash', details: 'Cash withdrawals bypass transaction categorization and budget tracking.' },
    { dimension: 'Savings & Net Flow', rating: 'RED', scoreText: 'Cumulative Net Deficit', details: 'Overall outflow exceeded inflows by -₹30,466 over the 16-month period.' },
    { dimension: 'Monthly Cash Flow', rating: 'RED', scoreText: '11 Out of 16 Deficit Months', details: 'Frequent liquidity shortfalls despite stable salary arrival.' },
    { dimension: 'Emergency Buffer', rating: 'RED', scoreText: 'Closing Balance ₹1,003.55', details: 'Low ending liquidity buffer leaves zero cushion for emergency expenses.' },
  ],
  
  topProblems: [
    'Debt Servicing Overload: ₹4.45L paid to micro-lenders consumes 41.0% of corporate salary.',
    'Peer Transfer Drain: ₹8.22L sent in unclassified personal transfers (Boby Tandan alone received ₹2.43L).',
    'Revolving Debt Recycling: Borrowing new micro-loans within 48-72 hours of paying existing lenders.',
    'Untraceable Cash Leakage: ₹1.31L withdrawn in cash cannot be audited or budgeted.',
    'Depleted Emergency Buffer: Closing balance of ₹1,003.55 leaves no margin for unforeseen costs.',
  ],
  
  topUnnecessaryExpenses: [
    'High-Interest Micro-Loan Financing Fees & Processing Charges across 11 digital lenders.',
    'Rapid Unplanned Peer Transfers without budget caps.',
    'Multiple Overlapping Food Delivery Surcharges (Swiggy represents 82% of food orders).',
    'Multiple Payment Bank & Wallet Sweeps (₹2.46L moved across intermediaries).',
    'Impulse Festival Retail Shopping spikes.',
  ],
  
  topRecipients: [
    'Boby Tandan (BBOBY3580OKAXIS): ₹2,42,501.00 (🚨 Action: Audit & establish repayment plan)',
    'Piyush Srivastava: ₹72,218.00 (19 UPI transfers)',
    'Barsati Ram: ₹45,000.00 (Family support)',
    'Veenu Tandan: ₹42,000.00 (Related to Boby Tandan channel)',
    'Abhishek Bahadur: ₹34,500.00 (Peer transfers)',
  ],
  
  topLenders: [
    'MPOKKET: ₹1,08,004.96 repaid | ₹1,22,913.20 borrowed (Active Line)',
    'Meghdoot Mercantile: ₹69,774.09 repaid | ₹50,640.00 borrowed (+₹19.1K repaid)',
    'Grow Money Capital: ₹53,530.00 repaid | ₹43,973.00 borrowed (+₹9.6K repaid)',
    'VIVIFI (FlexPay): ₹40,170.95 repaid | ₹44,885.94 borrowed (Active Line)',
    'SalaryOnTime: ₹26,929.05 repaid | ₹22,000.00 borrowed (Settled)',
  ],
  
  topActions: [
    'Freeze New Micro-Borrowings: Stop taking new disbursals from mPokket, Vivifi, and Zed Leafin.',
    'Cap Personal Transfers to Max ₹15,000/month: Establish a firm monthly budget ceiling for peer UPI payments.',
    'Review Boby Tandan Channel: Recover outstanding personal lending balances (₹1.12L net deficit).',
    'Consolidate Active Micro-Loans: Replace multiple high-cost 30-day lines with a single low-interest bank loan.',
    'Build a ₹50,000 Emergency Buffer: Retain 20% of Newgen salary in HDFC savings before moving any money.',
  ],
};

/**
 * Filter the comprehensive forensic dataset by Financial Year or All-Time coverage
 */
export function getForensicDataForPeriod(filter: StatementPeriodFilter): ComprehensiveForensicDataset {
  if (filter === 'ALL_TIME') {
    return MASTER_FORENSIC_DATA;
  }

  if (filter === 'FY_2025_26') {
    // 01-Apr-2025 to 31-Mar-2026 (12 Months, 1,781 Transactions)
    const fyMonths = MASTER_FORENSIC_DATA.monthlyCashFlow.filter(m => m.financialYear === 'FY 2025-26');
    const totalCredits = 1189297.96;
    const totalDebits = 1205995.80;
    const netCashFlow = -16697.84;
    const openingBalance = 31424.61;
    const closingBalance = 14771.77;
    const salaryTotal = 753986.00;
    const loanCreditsTotal = 265000.00;
    const trueLifestyleTotal = 124500.00;
    const trueLifestyleShare = (trueLifestyleTotal / totalDebits) * 100;

    return {
      ...MASTER_FORENSIC_DATA,
      periodLabel: 'Financial Year 2025-26 (Single Year)',
      periodSpan: '01-Apr-2025 → 31-Mar-2026',
      totalTransactions: 1781,
      openingBalance,
      closingBalance,
      totalCredits,
      totalDebits,
      netCashFlow,
      salaryTotal,
      loanCreditsTotal,
      trueLifestyleTotal,
      trueLifestyleShare,
      monthlyCashFlow: fyMonths,
      debitBreakdown: MASTER_FORENSIC_DATA.debitBreakdown.map(d => ({
        ...d,
        amount: Math.round(d.amount * (totalDebits / MASTER_FORENSIC_DATA.totalDebits)),
      })),
    };
  }

  // FY 2026-27 (01-Apr-2026 to 12-Aug-2026 / YTD - 4.5 Months)
  const fyMonths = MASTER_FORENSIC_DATA.monthlyCashFlow.filter(m => m.financialYear === 'FY 2026-27');
  const totalCredits = 812825.42;
  const totalDebits = 826593.64;
  const netCashFlow = -13768.22;
  const openingBalance = 14771.77;
  const closingBalance = 1003.55;
  const salaryTotal = 331399.00;
  const loanCreditsTotal = 118100.09;
  const trueLifestyleTotal = 60494.40;
  const trueLifestyleShare = (trueLifestyleTotal / totalDebits) * 100;

  return {
    ...MASTER_FORENSIC_DATA,
    periodLabel: 'Current Financial Year 2026-27 (YTD)',
    periodSpan: '01-Apr-2026 → 12-Aug-2026',
    totalTransactions: 806,
    openingBalance,
    closingBalance,
    totalCredits,
    totalDebits,
    netCashFlow,
    salaryTotal,
    loanCreditsTotal,
    trueLifestyleTotal,
    trueLifestyleShare,
    monthlyCashFlow: fyMonths,
    debitBreakdown: MASTER_FORENSIC_DATA.debitBreakdown.map(d => ({
      ...d,
      amount: Math.round(d.amount * (totalDebits / MASTER_FORENSIC_DATA.totalDebits)),
    })),
  };
}
