/**
 * BytFloww Financial Intelligence Analytics Engine v2.0
 * ======================================================
 * Central, deterministic financial analytics engine.
 * This is the SINGLE SOURCE OF TRUTH for all computations.
 *
 * ALL computations derive from the normalized CanonicalTransaction ledger.
 * NO values are hard-coded — everything is dynamically derived.
 *
 * Rules:
 *  - Loan credits NEVER count as income
 *  - Credit card repayments NEVER double-count as consumption
 *  - Cash withdrawals → UNTRACEABLE_CASH only
 *  - Wallet transfers → MONEY_MOVEMENT only
 *  - Self-transfers excluded from economic analysis
 */

import * as XLSX from 'xlsx';
import { CanonicalTransaction } from '../types';
export type { CanonicalTransaction };

import { 
  ComprehensiveForensicDataset, 
  generateForensicDataFromTransactions, 
  EMPTY_FORENSIC_DATA 
} from './statementForensicsData';
import { 
  isSalaryTransaction, 
  extractEmployerFromNarration, 
  analyzeAllEmployers 
} from './salaryIntelligence';

// ── MULTI-STATEMENT SESSION & DEDUPLICATION TYPES ─────────────────────────────
export type DuplicateStatus =
  | 'NON_DUPLICATE'
  | 'EXACT_FILE_DUPLICATE'
  | 'EXACT_TRANSACTION_DUPLICATE'
  | 'PROBABLE_TRANSACTION_DUPLICATE'
  | 'POSSIBLE_DUPLICATE_REVIEW';

export interface StatementFileSource {
  fileId: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  parseStatus: 'SUCCESS' | 'PARSED' | 'PARTIAL' | 'FAILED' | 'DUPLICATE_SKIPPED';
  duplicateStatus: DuplicateStatus;
  detectedBank: string;
  detectedAccount: string;
  maskedAccount: string;
  statementStartDate: string;
  statementEndDate: string;
  rawRowCount: number;
  transactionCount: number;
  duplicateTransactionCount: number;
  errorMessage?: string | null;
  sheetNames?: string[];
}

export interface StatementCoverageQuality {
  earliestDate: string;
  latestDate: string;
  totalDays: number;
  totalMonths: number;
  monthsPresent: string[];
  missingMonths: string[];
  financialYearsCovered: string[];
  calendarYearsCovered: number[];
  status: 'COMPLETE_CONTINUOUS' | 'PARTIAL_COVERAGE' | 'GAPS_DETECTED' | 'OVERLAPPING_STATEMENTS';
  continuityScore: number;
  overlappingPeriods: Array<{
    fileA: string;
    fileB: string;
    overlapDays: number;
    overlapStart: string;
    overlapEnd: string;
  }>;
  balanceContinuityStatus:
    | 'BALANCE_CONTINUITY_VERIFIED'
    | 'BALANCE_CONTINUITY_WARNING'
    | 'BALANCE_CONTINUITY_FAILED'
    | 'NO_BALANCE_DATA';
  balanceDiscrepancyCount: number;
}

export interface MultiStatementSession {
  sessionId: string;
  createdAt: string;
  files: StatementFileSource[];
  totalFilesCount: number;
  importedFilesCount: number;
  duplicateFilesCount: number;
  failedFilesCount: number;
  totalRawRows: number;
  totalValidTransactions: number;
  duplicateTransactionsRemoved: number;
  potentialDuplicatesCount: number;
  uniqueTransactions: CanonicalTransaction[];
  coverage: StatementCoverageQuality;
  reconciliation: ReconciliationResult;
  analytics: LiveAnalyticsResult;
  forensicDataset: ComprehensiveForensicDataset;
}



// ── CLASSIFICATION TAXONOMY ──────────────────────────────────────────────────
export type ClassificationTaxonomy =
  | 'SALARY'
  | 'LOAN_CREDIT'
  | 'EPFO_PF'
  | 'REIMBURSEMENT'
  | 'REFUND'
  | 'REVERSAL'
  | 'INTEREST_INCOME'
  | 'INVESTMENT_INCOME'
  | 'OTHER_INCOME'
  | 'LOAN_REPAYMENT'
  | 'CREDIT_CARD_PAYMENT'
  | 'PERSONAL_TRANSFER'
  | 'FAMILY_TRANSFER'
  | 'SELF_TRANSFER'
  | 'WALLET_MOVEMENT'
  | 'PAYMENT_BANK_MOVEMENT'
  | 'CASH_WITHDRAWAL'
  | 'FOOD'
  | 'GROCERY'
  | 'TRANSPORT'
  | 'SHOPPING'
  | 'ENTERTAINMENT'
  | 'BILL_UTILITY'
  | 'SUBSCRIPTION'
  | 'INSURANCE'
  | 'BANK_CHARGE'
  | 'GOVERNMENT_CHARGE'
  | 'INVESTMENT_OUTFLOW'
  | 'UPI_TRANSFER_UNKNOWN'
  | 'OTHER'
  | 'UNKNOWN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Direction = 'CREDIT' | 'DEBIT';
export type EntityType = 'EMPLOYER' | 'LENDER' | 'MERCHANT' | 'PERSON' | 'WALLET' | 'GOVERNMENT' | 'BANK' | 'SELF' | 'UNKNOWN';



// ── PARSED RAW ROW ───────────────────────────────────────────────────────────
export interface ParsedRow {
  date: string;
  narration: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  referenceNumber: string | null;
}

// ── COLUMN MAP ───────────────────────────────────────────────────────────────
export interface ColumnMap {
  dateIdx: number;
  narrIdx: number;
  refIdx: number;
  debitIdx: number;
  creditIdx: number;
  balIdx: number;
  headerRowIdx: number;
}

// ── RECONCILIATION ────────────────────────────────────────────────────────────
export interface ReconciliationResult {
  isReconciled: boolean;
  openingBalance: number | null;
  totalCredits: number;
  totalDebits: number;
  expectedClosingBalance: number | null;
  actualClosingBalance: number | null;
  discrepancy: number;
  netCashFlow: number;
  transactionCount: number;
  status: 'RECONCILED' | 'DISCREPANCY' | 'INSUFFICIENT_DATA';
}

// ── INFLOW DECOMPOSITION ──────────────────────────────────────────────────────
export interface InflowDecomposition {
  salary: number;           salaryCount: number;
  loanCredits: number;      loanCreditCount: number;
  epfoPf: number;           epfoCount: number;
  refundsReversals: number; refundCount: number;
  reimbursements: number;   reimbursementCount: number;
  interestIncome: number;
  otherIncome: number;      otherIncomeCount: number;
  p2pInflows: number;       p2pInflowCount: number;
  totalCredits: number;
  
  earnedIncomeTotal: number;  // salary + reimbursements + interest (NOT loans)
  borrowedMoneyTotal: number; // loanCredits
  
  earnedIncomePct: number;   // of total credits
  borrowedMoneyPct: number;
}

// ── LENDER ITEM ───────────────────────────────────────────────────────────────
export interface LiveLenderItem {
  id: string;
  name: string;
  normalizedName: string;
  productType: string;
  totalBorrowed: number;
  totalRepaid: number;
  netDelta: number;
  borrowCount: number;
  repayCount: number;
  firstActivityDate: string;
  lastActivityDate: string;
  status: 'ACTIVE' | 'PARTIALLY_REPAID' | 'FULLY_REPAID';
  recyclingRisk: 'HIGH' | 'MODERATE' | 'LOW';
  loanRecyclingRatio: number; // new borrowing / loan repayments
}

// ── RECIPIENT ITEM ────────────────────────────────────────────────────────────
export interface LiveRecipientItem {
  id: string;
  name: string;
  normalizedName: string;
  upiHandle: string | null;
  totalSent: number;
  totalReceived: number;
  netOutflow: number;
  txnCount: number;
  largestTxn: number;
  smallestTxn: number;
  averageTxn: number;
  monthlyAverage: number;
  firstDate: string;
  lastDate: string;
  relationshipTag: 'PERSON' | 'FAMILY' | 'SELF' | 'MERCHANT' | 'LENDER_RELATED' | 'UNKNOWN';
  flagPriority: 'HIGH' | 'NORMAL';
}

// ── MONTHLY ROW ───────────────────────────────────────────────────────────────
export interface MonthlyVelocityRow {
  monthKey: string;           // YYYY-MM
  monthName: string;          // "Apr 2025"
  financialYear: string;      // "FY 2025-26"
  salary: number;
  loansReceived: number;
  otherCredits: number;
  totalCredits: number;
  loanRepaid: number;
  creditCardPayments: number;
  personalTransfers: number;
  walletMovements: number;
  cashWithdrawals: number;
  lifestyleSpend: number;
  insurance: number;
  bankCharges: number;
  otherDebits: number;
  totalDebits: number;
  netCashFlow: number;
  closingBalance: number | null;
  isDeficit: boolean;
  obligationsExceedSalary: boolean;
}

// ── LIFESTYLE BREAKDOWN ───────────────────────────────────────────────────────
export interface LiveLifestyleBreakdown {
  food: { total: number; count: number; merchants: MerchantAgg[] };
  grocery: { total: number; count: number; merchants: MerchantAgg[] };
  transport: { total: number; count: number; merchants: MerchantAgg[] };
  shopping: { total: number; count: number; merchants: MerchantAgg[] };
  entertainment: { total: number; count: number; merchants: MerchantAgg[] };
  utilities: { total: number; count: number; merchants: MerchantAgg[] };
  subscriptions: { total: number; count: number; merchants: MerchantAgg[] };
  insurance: { total: number; count: number; merchants: MerchantAgg[] };
  other: { total: number; count: number; merchants: MerchantAgg[] };
  totalLifestyle: number;
}

export interface MerchantAgg {
  name: string;
  amount: number;
  count: number;
  sharePercent: number;
  avgTicket: number;
}

// ── ANOMALY ──────────────────────────────────────────────────────────────────
export interface LiveAnomaly {
  id: string;
  txId: string;
  date: string;
  narration: string;
  amount: number;
  direction: Direction;
  type: 'LARGE_TRANSACTION' | 'STATISTICAL_OUTLIER' | 'RAPID_CYCLING' | 'DUPLICATE_LOOKING' | 'UNUSUAL_PATTERN';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  zScore?: number;
}

// ── RECURRING MANDATE ─────────────────────────────────────────────────────────
export interface LiveRecurring {
  id: string;
  entityName: string;
  taxonomy: ClassificationTaxonomy;
  amounts: number[];
  averageAmount: number;
  medianAmount: number;
  frequency: 'MONTHLY' | 'WEEKLY' | 'BIMONTHLY' | 'QUARTERLY' | 'IRREGULAR';
  confidence: ConfidenceLevel;
  firstDate: string;
  lastDate: string;
  occurrences: number;
  monthlyEquivalent: number;
  annualizedCost: number;
  nextExpected: string | null;
}

// ── FINANCIAL RATIOS ──────────────────────────────────────────────────────────
export interface LiveFinancialRatios {
  debtToIncomeRatio: number;         // loan repayments / earned income
  lifestyleToIncomeRatio: number;    // lifestyle spend / earned income
  savingsRate: number;               // (earned income - lifestyle - obligations) / earned income
  borrowingDependency: number;       // loan credits / total inflows
  debtRepaymentBurden: number;       // loan repayments / total income (incl loans)
  cashLeakageRatio: number;          // cash withdrawals / total income
  personalTransferRatio: number;     // personal transfers / salary
  netCashFlowMargin: number;         // net cash flow / total inflow
  incomeStabilityScore: number;      // 0-100: stddev of monthly salary
  emergencyBufferMonths: number;     // closing balance / avg monthly outflow
}

// ── HEALTH SCORE ─────────────────────────────────────────────────────────────
export interface LiveHealthScore {
  overallScore: number;              // 0-100
  tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  dimensions: Array<{
    name: string;
    score: number;
    status: 'GREEN' | 'AMBER' | 'RED';
    detail: string;
    improvement: string;
  }>;
  primaryRisk: string;
  topImprovements: string[];
}

// ── WHERE ₹100 WENT ───────────────────────────────────────────────────────────
export interface Where100WentItem {
  category: string;
  amount: number;
  rupees: number;  // out of ₹100
  percentage: number;
  color: string;
  isLifestyle: boolean;
  isMoneyMovement: boolean;
  txIds: string[];
}

// ── INSIGHT ──────────────────────────────────────────────────────────────────
export interface LiveInsight {
  id: string;
  type: 'RISK' | 'WARNING' | 'OBSERVATION' | 'POSITIVE' | 'OPPORTUNITY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  summary: string;
  evidence: string;
  recommendedAction: string;
  txIds: string[];
}

// ── FULL LIVE ANALYTICS RESULT ───────────────────────────────────────────────
export interface LiveAnalyticsResult {
  // Source Info
  fileName: string;
  uploadedAt: string;
  bankDetected: string;
  accountHolder: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  periodStart: string;
  periodEnd: string;
  
  // Master Ledger
  transactions: CanonicalTransaction[];
  
  // Reconciliation
  reconciliation: ReconciliationResult;
  
  // Inflow Analysis
  inflowDecomposition: InflowDecomposition;
  
  // Debit Analysis
  totalDebtRepayments: number;
  totalCreditCardPayments: number;
  totalPersonalTransfers: number;
  totalWalletMovements: number;
  totalCashWithdrawals: number;
  totalLifestyleSpend: number;
  totalInsurance: number;
  totalBankCharges: number;
  totalOtherDebits: number;
  
  trueLifestyleTotal: number;
  trueLifestyleShare: number; // % of total debits
  moneyMovementTotal: number;
  moneyMovementShare: number;
  
  // Deep Analysis
  lenders: LiveLenderItem[];
  recipients: LiveRecipientItem[];
  lifestyle: LiveLifestyleBreakdown;
  monthlyVelocity: MonthlyVelocityRow[];
  recurring: LiveRecurring[];
  anomalies: LiveAnomaly[];
  
  // Computed Analytics
  ratios: LiveFinancialRatios;
  healthScore: LiveHealthScore;
  where100Went: Where100WentItem[];
  insights: LiveInsight[];
  
  // Debit Category Breakdown (for Where ₹100 Went)
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
    isLifestyle: boolean;
    icon: string;
    color: string;
    txIds: string[];
  }>;
}

// ── STATEMENT PARSE METADATA (for preview) ──────────────────────────────────
export interface StatementParsePreview {
  columnMap: ColumnMap;
  sampleRows: ParsedRow[];
  bankDetected: string;
  accountHolder: string;
  accountNo: string;
  periodStart: string;
  periodEnd: string;
  totalRows: number;
  ambiguousColumns: string[];
}

// ══════════════════════════════════════════════════════════════════════════════

// ── FILE HASHING (SHA-256) ───────────────────────────────────────────────────
export async function computeFileHash(file: File | ArrayBuffer | Uint8Array): Promise<string> {
  try {
    let buffer: ArrayBuffer;
    if (file instanceof File) {
      buffer = await file.arrayBuffer();
    } else if (file instanceof Uint8Array) {
      buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
    } else {
      buffer = file as ArrayBuffer;
    }

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Crypto subtle not available, fallback hashing:', err);
  }

  // Fast fallback hash
  let str = '';
  if (file instanceof File) {
    str = `${file.name}_${file.size}_${file.lastModified}`;
  } else {
    str = `buf_${(file as ArrayBuffer).byteLength}`;
  }
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return `hash_${Math.abs(h).toString(16).padStart(16, '0')}`;
}

// ── TRANSACTION FINGERPRINT V2 ───────────────────────────────────────────────
export function generateTransactionFingerprint(tx: {
  accountId?: string;
  date: string;
  valueDate?: string;
  debit?: number | null;
  credit?: number | null;
  amount?: number;
  narration: string;
  referenceNumber?: string | null;
  balance?: number | null;
}): string {
  const normDate = normalizeDate(tx.date || '');
  const normValDate = tx.valueDate ? normalizeDate(tx.valueDate) : normDate;
  const dVal = (tx.debit || 0).toFixed(2);
  const cVal = (tx.credit || 0).toFixed(2);
  const normNarr = (tx.narration || '')
    .toLowerCase()
    .replace(/[\s,;:\-_/]+/g, ' ')
    .trim();
  const ref = (tx.referenceNumber || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '')
    .trim();
  const acct = (tx.accountId || '').toLowerCase().replace(/[^a-z0-9*]/g, '');

  return `${acct}|${normDate}|${normValDate}|${dVal}|${cVal}|${normNarr}|${ref}`;
}

// SECTION 1: FILE PARSING
// ══════════════════════════════════════════════════════════════════════════════

export async function parseStatementFile(file: File): Promise<{ preview: StatementParsePreview; allRows: any[][] }> {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  let rows: any[][] = [];

  if (isExcel) {
    const arrayBuf = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuf, { type: 'array', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false, defval: '' }) || [];
  } else {
    const text = await file.text();
    rows = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => line.split(/[,;\t]/).map(c => c.replace(/^["']|["']$/g, '').trim()));
  }

  // Extract metadata from header rows
  let bankDetected = '';
  let accountHolder = '';
  let accountNo = '';
  let periodStart = '';
  let periodEnd = '';

  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const rowStr = (rows[i] || []).join(' ');
    const lower = rowStr.toLowerCase();

    if (!bankDetected) {
      if (lower.includes('hdfc bank') || lower.includes('hdfc')) bankDetected = 'HDFC Bank';
      else if (lower.includes('state bank of india') || lower.includes(' sbi ')) bankDetected = 'State Bank of India';
      else if (lower.includes('icici bank')) bankDetected = 'ICICI Bank';
      else if (lower.includes('axis bank')) bankDetected = 'Axis Bank';
      else if (lower.includes('kotak mahindra')) bankDetected = 'Kotak Mahindra Bank';
      else if (lower.includes('punjab national') || lower.includes('pnb')) bankDetected = 'Punjab National Bank';
      else if (lower.includes('airtel payments bank')) bankDetected = 'Airtel Payments Bank';
      else if (lower.includes('paytm payments bank')) bankDetected = 'Paytm Payments Bank';
      else if (lower.includes('bank of baroda') || lower.includes(' bob ')) bankDetected = 'Bank of Baroda';
      else if (lower.includes('canara bank')) bankDetected = 'Canara Bank';
      else if (lower.includes('union bank')) bankDetected = 'Union Bank of India';
      else if (lower.includes('idfc first')) bankDetected = 'IDFC FIRST Bank';
      else if (lower.includes('yes bank')) bankDetected = 'Yes Bank';
    }

    const acctMatch = rowStr.match(/Account\s*(?:No|Number|#)\s*[:\s]*([0-9Xx*]{6,20})/i);
    if (acctMatch && !accountNo) accountNo = acctMatch[1].replace(/[Xx*]/g, '*');

    const periodMatch = rowStr.match(/(?:Statement\s*From|Period|From)\s*[:\s]*([0-9/.\-]+)\s*(?:To|to|-)\s*([0-9/.\-]+)/i);
    if (periodMatch && !periodStart) {
      periodStart = periodMatch[1];
      periodEnd = periodMatch[2];
    }

    const nameMatch = rowStr.match(/(Mr\.|Ms\.|Mrs\.|DR\.)\s*([A-Z\s]{3,40})/i);
    if (nameMatch && !accountHolder) {
      accountHolder = (nameMatch[1] + ' ' + nameMatch[2]).replace(/Address.*/i, '').trim();
    }
  }

  if (!bankDetected) bankDetected = 'Bank';

  // Locate header row
  const columnMap = detectColumnMap(rows);

  // Sample rows for preview
  const sampleRows: ParsedRow[] = [];
  const startRow = columnMap.headerRowIdx >= 0 ? columnMap.headerRowIdx + 1 : 0;
  for (let i = startRow; i < Math.min(rows.length, startRow + 20); i++) {
    const parsed = parseRow(rows[i], columnMap);
    if (parsed) sampleRows.push(parsed);
    if (sampleRows.length >= 10) break;
  }

  const ambiguousColumns: string[] = [];
  if (columnMap.debitIdx === -1 && columnMap.creditIdx === -1) {
    ambiguousColumns.push('Could not detect debit/credit columns');
  }
  if (columnMap.dateIdx === -1) {
    ambiguousColumns.push('Could not detect date column');
  }

  return {
    preview: {
      columnMap,
      sampleRows,
      bankDetected,
      accountHolder,
      accountNo,
      periodStart,
      periodEnd,
      totalRows: rows.length - startRow,
      ambiguousColumns,
    },
    allRows: rows,
  };
}

function detectColumnMap(rows: any[][]): ColumnMap {
  let headerRowIdx = -1;
  let dateIdx = -1, narrIdx = -1, refIdx = -1, debitIdx = -1, creditIdx = -1, balIdx = -1;

  for (let r = 0; r < Math.min(rows.length, 60); r++) {
    const row = (rows[r] || []).map(c => String(c || '').toLowerCase().trim());
    const hasDate = row.some(c => c === 'date' || c === 'dt' || c === 'txn date' || c === 'transaction date' || c === 'value date');
    const hasNarr = row.some(c => c.includes('narration') || c.includes('particulars') || c.includes('description') || c.includes('details') || c.includes('remarks') || c.includes('transaction remarks'));
    const hasAmount = row.some(c => c.includes('withdrawal') || c.includes('deposit') || c.includes('debit') || c.includes('credit') || c === 'dr' || c === 'cr' || c.includes('amount'));

    if (hasDate && (hasNarr || hasAmount)) {
      headerRowIdx = r;
      row.forEach((col, idx) => {
        if ((col === 'date' || col === 'dt' || col.includes('date') || col === 'txn date') && !col.includes('value') && dateIdx === -1) dateIdx = idx;
        else if ((col.includes('narration') || col.includes('particulars') || col.includes('description') || col.includes('details') || col.includes('remarks')) && narrIdx === -1) narrIdx = idx;
        else if ((col.includes('ref') || col.includes('chq') || col.includes('cheque') || col.includes('utr') || col.includes('transaction id')) && refIdx === -1) refIdx = idx;
        else if ((col.includes('withdrawal') || col.includes('debit') || col === 'dr') && debitIdx === -1) debitIdx = idx;
        else if ((col.includes('deposit') || col.includes('credit') || col === 'cr') && creditIdx === -1) creditIdx = idx;
        else if ((col.includes('balance') || col === 'bal') && balIdx === -1) balIdx = idx;
      });
      break;
    }
  }

  // Fallback: if no header found but has numeric data, try to auto-detect
  if (headerRowIdx === -1) {
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r] || [];
      if (row.length >= 4) {
        headerRowIdx = r;
        dateIdx = 0; narrIdx = 1; debitIdx = 2; creditIdx = 3; balIdx = 4;
        break;
      }
    }
  }

  return { dateIdx, narrIdx, refIdx, debitIdx, creditIdx, balIdx, headerRowIdx };
}

function parseRow(cols: any[], map: ColumnMap): ParsedRow | null {
  if (!cols || cols.length < 2) return null;

  let date = map.dateIdx >= 0 && cols[map.dateIdx] !== undefined ? String(cols[map.dateIdx]).trim() : '';
  let narration = map.narrIdx >= 0 && cols[map.narrIdx] !== undefined ? String(cols[map.narrIdx]).trim() : '';
  let refNo = map.refIdx >= 0 && cols[map.refIdx] !== undefined ? String(cols[map.refIdx]).trim() : null;

  if (!date || !narration) return null;
  // Filter out rows that are clearly not transactions
  if (narration.startsWith('***') || narration.toLowerCase().includes('end of statement')) return null;

  let debit: number | null = null;
  let credit: number | null = null;
  let balance: number | null = null;

  if (map.debitIdx >= 0 && cols[map.debitIdx] !== '' && cols[map.debitIdx] != null) {
    const v = parseFloat(String(cols[map.debitIdx]).replace(/[,\s₹]/g, ''));
    if (!isNaN(v) && v > 0) debit = v;
  }

  if (map.creditIdx >= 0 && cols[map.creditIdx] !== '' && cols[map.creditIdx] != null) {
    const v = parseFloat(String(cols[map.creditIdx]).replace(/[,\s₹]/g, ''));
    if (!isNaN(v) && v > 0) credit = v;
  }

  if (map.balIdx >= 0 && cols[map.balIdx] !== '' && cols[map.balIdx] != null) {
    const v = parseFloat(String(cols[map.balIdx]).replace(/[,\s₹]/g, ''));
    if (!isNaN(v)) balance = v;
  }

  if (debit === null && credit === null) return null;

  return { date, narration, debit, credit, balance, referenceNumber: refNo || null };
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2: DATE NORMALIZATION
// ══════════════════════════════════════════════════════════════════════════════

export function normalizeDate(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return '';

  // Excel serial number (e.g. 45748 -> 2025-04-01)
  if (/^\d{5}$/.test(s)) {
    const serial = parseInt(s, 10);
    if (serial >= 30000 && serial <= 60000) {
      const utcDays = serial - 25569;
      const date = new Date(utcDays * 86400 * 1000);
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    return `${y}-${mo}-${d}`;
  }
  // YYYY-MM-DD
  m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }
  // Already ISO-ish
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s; // Return as-is if can't parse
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3: ENTITY EXTRACTION
// ══════════════════════════════════════════════════════════════════════════════

function extractEntity(narration: string): { name: string; upiHandle: string | null } {
  const n = narration.trim();

  // Salary / Corporate Employer detection first
  if (isSalaryTransaction(n, true)) {
    return { name: extractEmployerFromNarration(n), upiHandle: null };
  }

  // UPI: "UPI-NAME-upi@bank-..."
  const upiMatch = n.match(/UPI[\/\-]([A-Za-z0-9\s.\-'&]+?)[\/\-]([A-Za-z0-9._\-]+@[A-Za-z0-9]+)/i);
  if (upiMatch) {
    return { name: cleanEntity(upiMatch[1]), upiHandle: upiMatch[2].toLowerCase() };
  }

  // VPA only: "name@bank"
  const vpaMatch = n.match(/\b([A-Za-z0-9._\-]+@[A-Za-z0-9]{2,20})\b/);
  if (vpaMatch) {
    const handle = vpaMatch[1].toLowerCase();
    const namePart = handle.split('@')[0].replace(/[0-9._]/g, ' ').trim();
    return { name: cleanEntity(namePart) || handle, upiHandle: handle };
  }

  // NEFT CR: "NEFT CR-XXXXXXX-EMPLOYER NAME-..."
  const neftCrMatch = n.match(/NEFT\s*CR[\/\-][^\-]+[\/\-]([A-Za-z\s.&']+)[\/\-]/i);
  if (neftCrMatch) return { name: cleanEntity(neftCrMatch[1]), upiHandle: null };

  // IMPS: "IMPS-XXXXXXX-NAME"
  const impsMatch = n.match(/IMPS[\/\-]\d+[\/\-]([A-Za-z\s.&']+?)(?:[\/\-]|$)/i);
  if (impsMatch) return { name: cleanEntity(impsMatch[1]), upiHandle: null };

  // "BY TRANSFER-NAME" or "BY CLEARING-NAME"
  const byMatch = n.match(/BY\s+(?:TRANSFER|CLEARING|ORDER|NEFT)[\/\-\s]+([A-Za-z\s.&']+?)(?:[\/\-]|$)/i);
  if (byMatch) return { name: cleanEntity(byMatch[1]), upiHandle: null };

  // POS / ATM location
  if (/ATW|NWD|ATM\s*WDL/i.test(n)) {
    const atmMatch = n.match(/(?:ATW|NWD)[\/\-][\d]+[\/\-]([A-Z\s]+)/i);
    return { name: atmMatch ? cleanEntity(atmMatch[1]) : 'ATM Withdrawal', upiHandle: null };
  }

  // Known entities & NBFC Lenders
  const knownMap: Record<string, string> = {
    'zed leafin': 'Zed Leafin (Prefr)',
    leafin: 'Zed Leafin (Prefr)',
    'grow money': 'Grow Money Capital',
    growmoney: 'Grow Money Capital',
    meghdoot: 'Meghdoot Mercantile',
    mpokket: 'mPokket Financial Services',
    vivifi: 'VIVIFI India (FlexSalary)',
    flexsalary: 'VIVIFI India (FlexSalary)',
    talazen: 'Talazen Finance (Tala)',
    'branch international': 'Branch International',
    kreditbee: 'KreditBee',
    krazybee: 'KreditBee',
    moneyview: 'MoneyView',
    salaryontime: 'SalaryOnTime',
    fibe: 'Fibe (EarlySalary)',
    cashe: 'CASHe',
    navi: 'Navi Finserv',
    rupeek: 'Rupeek',
    lendingplate: 'Lendingplate',
    smartcoin: 'SmartCoin',
    prefr: 'Prefr',
    finzoom: 'Finzoom',
    snapmint: 'Snapmint',
    lazypay: 'LazyPay',
    simpl: 'Simpl',
    swiggy: 'Swiggy', zomato: 'Zomato', blinkit: 'Blinkit', zepto: 'Zepto',
    instamart: 'Swiggy Instamart', bigbasket: 'BigBasket', dmart: 'D-Mart',
    amazon: 'Amazon', flipkart: 'Flipkart', myntra: 'Myntra', ajio: 'AJIO',
    uber: 'Uber', rapido: 'Rapido', ola: 'Ola', irctc: 'IRCTC',
    netflix: 'Netflix', spotify: 'Spotify', hotstar: 'Disney+ Hotstar',
    cred: 'CRED', paytm: 'Paytm',
    airtel: 'Airtel', jio: 'Jio',
    lic: 'LIC India', 'life insurance': 'LIC India',
    uppcl: 'UPPCL', bescom: 'BESCOM', hpcl: 'HPCL', bpcl: 'BPCL',
  };

  const lower = n.toLowerCase();
  for (const [key, value] of Object.entries(knownMap)) {
    if (lower.includes(key)) return { name: value, upiHandle: null };
  }

  // Extract from "TO NAME" or "FOR NAME"
  const toMatch = n.match(/\bTO\s+([A-Za-z\s.&']{3,30}?)(?:\s+ON|\s+REF|\s+UPI|$)/i);
  if (toMatch) return { name: cleanEntity(toMatch[1]), upiHandle: null };

  return { name: cleanEntity(n.substring(0, 30)) || 'Bank Transaction', upiHandle: null };
}

function cleanEntity(raw: string): string {
  return raw
    .replace(/[^A-Za-z0-9\s.&'\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .substring(0, 40);
}

export const LENDER_KEYWORDS_REGEX: RegExp[] = [
  /\b(leafin|zed\s*leafin)\b/i,
  /\bsalary\s*now\b/i,
  /\b(salaryontime|salary\s*on\s*time)\b/i,
  /\b(earlysalary|fibe)\b/i,
  /\b(flexsalary|flexpay)\b/i,
  /\b(grow\s*money|growmoney)\b/i,
  /\bmeghdoot\b/i,
  /\bmpokket\b/i,
  /\bvivifi\b/i,
  /\b(kreditbee|krazybee)\b/i,
  /\b(moneyview|whizdm)\b/i,
  /\b(cashe|bhanix)\b/i,
  /\b(navi\s*loan|navi\s*finserv|navifinance)\b/i,
  /\b(ring\s*by\s*dmi|kissht|si\s*creva)\b/i,
  /\brupeek\b/i,
  /\b(lendingplate|unifinz)\b/i,
  /\bsmartcoin\b/i,
  /\b(prefr|fincfriends)\b/i,
  /\bincred\b/i,
  /\bpayme\s*india\b/i,
  /\bfinzoom\b/i,
  /\binstacred\b/i,
  /\bflexmoney\b/i,
  /\bloantap\b/i,
  /\bzype\b/i,
  /\bpaysense\b/i,
  /\bsnapmint\b/i,
  /\blazypay\b/i,
  /\b(talazen|tala\s*loan)\b/i,
  /\bbranch\s*(international|loan)\b/i,
  /\bbajaj\s*(finance|finserv)\b/i,
  /\btata\s*capital\b/i,
  /\bhdb\s*financial\b/i,
  /\baditya\s*birla\s*finance\b/i,
  /\bpiramal\s*capital\b/i,
  /\bpoonawalla\b/i,
  /\bmahindra\s*finance\b/i,
  /\b(cholamandalam|chola\s*fin)\b/i,
  /\bl&t\s*finance\b/i,
  /\b(muthoot|manappuram)\b/i,
  /\biifl\b/i,
  /\bfullerton\b/i,
  /\bsmfg\s*india\b/i,
  /\bavanse\b/i,
  /\bhome\s*credit\b/i,
  /\bdmi\s*finance\b/i,
  /\b(loan\s*disburs|loan\s*credit|loan\s*disb|loan\s*repay|loan\s*repmt|loan\s*emi)\b/i,
  /\bdisblppl\b/i,
  /\bmaybright\b/i,
];

export function isLenderEntity(narration: string, entity: string = ''): boolean {
  const text = `${narration || ''} ${entity || ''}`;
  return LENDER_KEYWORDS_REGEX.some(rx => rx.test(text));
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4: TRANSACTION CLASSIFICATION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

interface ClassificationResult {
  taxonomy: ClassificationTaxonomy;
  confidence: ConfidenceLevel;
  reason: string;
  entityType: EntityType;
  isIncome: boolean;
  isLoanCredit: boolean;
  isDebtRepayment: boolean;
  isCreditCardPayment: boolean;
  isSelfTransfer: boolean;
  isWalletMovement: boolean;
  isCashWithdrawal: boolean;
  isLifestyleSpend: boolean;
  isPersonalTransfer: boolean;
  isRecurring: boolean;
}

function classifyTransaction(row: ParsedRow, entityName: string): ClassificationResult {
  const n = row.narration.toLowerCase();
  const isCredit = (row.credit ?? 0) > 0;
  const isDebit = (row.debit ?? 0) > 0;
  const amount = row.debit || row.credit || 0;

  // ── CREDITS ──────────────────────────────────────────────────────────────

  if (isCredit) {
    // 1. EPFO / PF credits (Statutory Provident Fund claims)
    if (
      n.includes('epfo') || n.includes('provident') || n.includes('employee provident fund') ||
      n.includes('pf credit') || n.includes('pf withdrawal') || n.includes('pf-') || n.includes('epf')
    ) {
      return cls('EPFO_PF', 'HIGH', 'EPFO/PF withdrawal credit', 'GOVERNMENT', true, false, false, false, false, false, false, false, false, false);
    }

    // 2. Loan Disbursals / Borrowings (MUST be evaluated before salary checks — NEVER income)
    // Checks known NBFCs/Lenders, loan product names (e.g. "Salary Now", "FlexSalary", "SalaryOnTime"), and disbursal indicators
    if (isLenderEntity(n, entityName) || (n.includes('loan') && amount >= 500 && !n.includes('reimburs'))) {
      return cls('LOAN_CREDIT', 'HIGH', 'Loan/credit disbursement — NOT income', 'LENDER', false, true, false, false, false, false, false, false, false, false);
    }

    // 3. Reimbursements & Claims (Segregated from base salary)
    if (
      n.includes('reimburs') || n.includes('reimb') || n.includes('expense claim') || 
      n.includes('food bill') || n.includes('medical claim') || n.includes('travel claim')
    ) {
      return cls('REIMBURSEMENT', 'HIGH', 'Employer reimbursement credit', 'EMPLOYER', true, false, false, false, false, false, false, false, false, false);
    }

    // 4. Refunds / reversals
    if (n.includes('refund') || n.includes('reversal') || n.includes('reversed') || n.includes('cashback') || n.includes('chargeback')) {
      return cls('REFUND', 'HIGH', 'Refund or reversal credit', 'MERCHANT', false, false, false, false, false, false, false, false, false, false);
    }

    // 5. Bank Savings Interest Income (Quarterly / Periodic bank interest credited by bank)
    if (
      n.includes('interest paid till') || n.includes('interest credit') || n.includes('int cr') ||
      n.includes('savings interest') || n.includes('bank interest') || n.includes('sb int') ||
      n.includes('int.pd') || n.includes('cr int') || n.includes('quarterly interest')
    ) {
      return cls('INTEREST_INCOME', 'HIGH', 'Bank savings account interest credited', 'BANK', true, false, false, false, false, false, false, false, false, false);
    }

    // 6. Corporate Salary / Payroll (Universal deterministic salary intelligence engine)
    if (isSalaryTransaction(row.narration, isCredit, amount)) {
      return cls('SALARY', 'HIGH', 'Corporate payroll salary credit', 'EMPLOYER', true, false, false, false, false, false, false, false, false, false);
    }

    // Refunds / reversals
    if (n.includes('refund') || n.includes('reversal') || n.includes('reversed') || n.includes('cashback') || n.includes('chargeback')) {
      return cls('REFUND', 'HIGH', 'Refund or reversal credit', 'MERCHANT', false, false, false, false, false, false, false, false, false, false);
    }

    // Interest income
    if (n.includes('interest credit') || n.includes('int cr') || n.includes('savings interest')) {
      return cls('INTEREST_INCOME', 'HIGH', 'Bank interest income', 'BANK', true, false, false, false, false, false, false, false, false, false);
    }

    // Reimbursements
    if (n.includes('reimburs') || n.includes('reimb') || n.includes('expense claim')) {
      return cls('REIMBURSEMENT', 'HIGH', 'Reimbursement credit', 'EMPLOYER', true, false, false, false, false, false, false, false, false, false);
    }

    // UPI inflow from person
    if (n.includes('upi') || n.includes('@')) {
      return cls('PERSONAL_TRANSFER', 'MEDIUM', 'UPI inflow from person', 'PERSON', false, false, false, false, false, false, false, false, true, false);
    }

    return cls('OTHER_INCOME', 'LOW', 'Unclassified credit', 'UNKNOWN', false, false, false, false, false, false, false, false, false, false);
  }

  // ── DEBITS ───────────────────────────────────────────────────────────────

  // Cash withdrawals
  if (n.includes('atw-') || n.includes('nwd-') || n.includes('atm wdl') || n.includes('atm withdrawal') || n.includes('atm cash') || n.includes('cash withdrawal')) {
    return cls('CASH_WITHDRAWAL', 'HIGH', 'ATM cash withdrawal', 'BANK', false, false, false, false, false, false, true, false, false, false);
  }

  // Loan repayments / EMIs (Strict word-boundary matching to prevent false positives like 'chemist', 'premium', 'premier')
  const hasEmiWord = /\bemi\b|\bemis\b|nach[\s_-]+emi|loan[\s_-]+emi/i.test(n);
  if (
    isLenderEntity(n, entityName) ||
    n.includes('loan repay') || n.includes('loan repmt') ||
    (n.includes('nach') && hasEmiWord) ||
    (hasEmiWord && !n.includes('chemist') && !n.includes('premium') && !n.includes('premier') && amount < 100000)
  ) {
    return cls('LOAN_REPAYMENT', 'HIGH', 'Loan/EMI repayment — NOT lifestyle', 'LENDER', false, false, true, false, false, false, false, false, false, true);
  }

  // Credit card bill payments
  if (
    n.includes('cred') || n.includes('credit card') || n.includes('cc payment') || n.includes('cc bill') ||
    n.includes('sbi card') || n.includes('axis card') || n.includes('hdfc card') || n.includes('icici card') ||
    n.includes('snapmint') || n.includes('lazypay') || n.includes('simpl') ||
    n.includes('card bill') || n.includes('cardpayment')
  ) {
    return cls('CREDIT_CARD_PAYMENT', 'HIGH', 'Credit card bill payment — NOT double-counted', 'BANK', false, false, false, true, false, false, false, false, false, true);
  }

  // Wallet / Payment Bank movements
  if (
    n.includes('airtel money') || n.includes('airtel payments bank') || n.includes('airtel wallet') ||
    n.includes('paytm wallet') || n.includes('amazon pay') || n.includes('phonepe wallet') ||
    n.includes('jio money') || n.includes('ola money') || n.includes('mobikwik') ||
    n.includes('wallet topup') || n.includes('wallet load') || n.includes('to wallet') ||
    (n.includes('airtel') && (n.includes('transfer') || n.includes('trf')))
  ) {
    return cls('WALLET_MOVEMENT', 'HIGH', 'Wallet/payment bank transfer — money movement, not confirmed spend', 'WALLET', false, false, false, false, false, true, false, false, false, false);
  }

  // Insurance
  if (
    n.includes('lic') || n.includes('life insurance') || n.includes('insurance premium') ||
    n.includes('hdfc life') || n.includes('max life') || n.includes('sbi life') ||
    n.includes('bajaj allianz') || n.includes('icici pru') || n.includes('star health') ||
    n.includes('care health') || n.includes('national insurance')
  ) {
    return cls('INSURANCE', 'HIGH', 'Insurance premium payment', 'MERCHANT', false, false, false, false, false, false, false, true, false, true);
  }

  // Food & Dining (NOT grocery delivery)
  if (
    (n.includes('swiggy') && !n.includes('instamart')) ||
    n.includes('zomato') || n.includes('starbucks') || n.includes('mcdonald') ||
    n.includes('dominos') || n.includes('pizza hut') || n.includes('kfc') ||
    n.includes('burger king') || n.includes('chaayos') || n.includes('cafe coffee') ||
    n.includes('restaurant') || n.includes('food delivery') || n.includes('biryani') ||
    (n.includes('cafe') && !n.includes('airtel')) || n.includes('bakery') ||
    n.includes('haldirams') || n.includes('barbeque nation') || n.includes('the bar')
  ) {
    return cls('FOOD', 'HIGH', 'Food & dining spend', 'MERCHANT', false, false, false, false, false, false, false, true, false, false);
  }

  // Groceries
  if (
    n.includes('instamart') || n.includes('blinkit') || n.includes('zepto') ||
    n.includes('bigbasket') || n.includes('dmart') || n.includes('smart bazaar') ||
    n.includes('nature basket') || n.includes('amazon fresh') || n.includes('jiomart') ||
    n.includes('grofers') || n.includes('grocery') || n.includes('supermarket')
  ) {
    return cls('GROCERY', 'HIGH', 'Grocery/quick-commerce spend', 'MERCHANT', false, false, false, false, false, false, false, true, false, false);
  }

  // Transport
  if (
    n.includes('uber') || n.includes('ola cab') || n.includes('rapido') ||
    n.includes('irctc') || n.includes('railway') || n.includes('indian rail') ||
    n.includes('dmrc') || n.includes('metro') || n.includes('hpcl') || n.includes('bpcl') ||
    n.includes('iocl') || n.includes('petrol') || n.includes('fuel') || n.includes('shell') ||
    n.includes('makemytrip') || n.includes('cleartrip') || n.includes('redbus') ||
    n.includes('goibibo') || n.includes('ixigo') || n.includes('indigo') || n.includes('air india')
  ) {
    return cls('TRANSPORT', 'HIGH', 'Transport/travel spend', 'MERCHANT', false, false, false, false, false, false, false, true, false, false);
  }

  // Shopping
  if (
    n.includes('amazon') || n.includes('flipkart') || n.includes('myntra') || n.includes('ajio') ||
    n.includes('nykaa') || n.includes('meesho') || n.includes('zudio') || n.includes('puma') ||
    n.includes('nike') || n.includes('adidas') || n.includes('decathlon') || n.includes('h&m') ||
    n.includes('zara') || n.includes('westside') || n.includes('reliance retail') ||
    n.includes('croma') || n.includes('vijay sales') || n.includes('shopclues') ||
    n.includes('aristobrat') || n.includes('sakeena') || n.includes('pankaj textile')
  ) {
    return cls('SHOPPING', 'HIGH', 'Shopping/e-commerce spend', 'MERCHANT', false, false, false, false, false, false, false, true, false, false);
  }

  // Subscriptions
  if (
    n.includes('netflix') || n.includes('spotify') || n.includes('youtube premium') ||
    n.includes('hotstar') || n.includes('amazon prime') || n.includes('zee5') ||
    n.includes('sonyliv') || n.includes('apple.com/bill') || n.includes('google storage') ||
    n.includes('microsoft') || n.includes('dropbox') || n.includes('notion') ||
    n.includes('chatgpt') || n.includes('openai') || n.includes('claude')
  ) {
    return cls('SUBSCRIPTION', 'HIGH', 'Digital subscription', 'MERCHANT', false, false, false, false, false, false, false, true, false, true);
  }

  // Bills & Utilities
  if (
    n.includes('uppcl') || n.includes('bescom') || n.includes('tata power') || n.includes('electricity') ||
    n.includes('airtel broadband') || n.includes('jio fiber') || n.includes('hathway') ||
    n.includes('billdesk') || n.includes('bill payment') || n.includes('utility') ||
    n.includes('water board') || n.includes('gas supply') || n.includes('piped gas') ||
    n.includes('google india digital') || n.includes('google workspace') ||
    n.includes('recharge') || n.includes('mobile bill') || n.includes('dth')
  ) {
    return cls('BILL_UTILITY', 'HIGH', 'Utility/telecom/bill payment', 'MERCHANT', false, false, false, false, false, false, false, true, false, true);
  }

  // Bank charges, debit card fees, return penalties & taxes
  if (
    n.includes('bank charges') || n.includes('amc') || n.includes('annual maintenance') ||
    n.includes('sms charges') || n.includes('service charge') || n.includes('bank fee') ||
    n.includes('gst on charges') || n.includes('stamp duty') || n.includes('dd charges') ||
    n.includes('chq return') || n.includes('ecs return') || n.includes('ach debit return') ||
    n.includes('debit return charges') || n.includes('decchg') || n.includes('dec chg') ||
    n.includes('card chg') || n.includes('pos txn markup') || n.includes('pos txn dcc') ||
    n.includes('min bal') || n.includes('amb chg') || n.includes('int.coll') ||
    n.includes('penal') || n.includes('consolidated chg') || n.includes('mandate chg')
  ) {
    return cls('BANK_CHARGE', 'HIGH', 'Bank fee, card markup, return penalty or tax', 'BANK', false, false, false, false, false, false, false, false, false, false);
  }

  // Self transfers
  if (
    n.includes('self transfer') || n.includes('own account') || n.includes('transfer to own') ||
    n.includes('trf to self') || n.includes('to self')
  ) {
    return cls('SELF_TRANSFER', 'HIGH', 'Self transfer between own accounts', 'SELF', false, false, false, false, true, false, false, false, false, false);
  }

  // UPI outflows to persons (unresolved)
  if (n.includes('upi-') || n.includes('/upi/') || (n.includes('upi') && n.includes('@'))) {
    return cls('UPI_TRANSFER_UNKNOWN', 'MEDIUM', 'UPI transfer to person — classification pending review', 'PERSON', false, false, false, false, false, false, false, false, true, false);
  }

  return cls('UNKNOWN', 'LOW', 'Unable to classify — requires manual review', 'UNKNOWN', false, false, false, false, false, false, false, false, false, false);
}

function cls(
  taxonomy: ClassificationTaxonomy,
  confidence: ConfidenceLevel,
  reason: string,
  entityType: EntityType,
  isIncome: boolean,
  isLoanCredit: boolean,
  isDebtRepayment: boolean,
  isCreditCardPayment: boolean,
  isSelfTransfer: boolean,
  isWalletMovement: boolean,
  isCashWithdrawal: boolean,
  isLifestyleSpend: boolean,
  isPersonalTransfer: boolean,
  isRecurring: boolean,
): ClassificationResult {
  return {
    taxonomy, confidence, reason, entityType,
    isIncome, isLoanCredit, isDebtRepayment, isCreditCardPayment,
    isSelfTransfer, isWalletMovement, isCashWithdrawal, isLifestyleSpend,
    isPersonalTransfer, isRecurring,
  };
}

function detectChannel(narration: string): CanonicalTransaction['channel'] {
  const n = narration.toLowerCase();
  if (n.includes('upi-') || n.includes('/upi/') || n.includes('@')) return 'UPI';
  if (n.includes('neft')) return 'NEFT';
  if (n.includes('imps')) return 'IMPS';
  if (n.includes('atw-') || n.includes('nwd-') || n.includes('atm')) return 'ATM';
  if (n.includes('nach') || n.includes('ach') || n.includes('mandate') || n.includes('si exec')) return 'ACH';
  if (n.startsWith('pos ') || n.includes('pos/')) return 'POS';
  if (n.includes('chq') || n.includes('cheque') || n.includes('clearing')) return 'CHQ';
  return 'OTHER';
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5: NORMALIZE TRANSACTIONS (Main pipeline)
// ══════════════════════════════════════════════════════════════════════════════

export function normalizeTransactions(rows: ParsedRow[]): CanonicalTransaction[] {
  const txns: CanonicalTransaction[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.date || (!row.debit && !row.credit)) continue;

    const isDebit = (row.debit ?? 0) > 0;
    const direction: Direction = isDebit ? 'DEBIT' : 'CREDIT';
    const amount = row.debit || row.credit || 0;

    const { name: entityName, upiHandle } = extractEntity(row.narration);
    const classification = classifyTransaction(row, entityName);
    const channel = detectChannel(row.narration);
    const dateNorm = normalizeDate(row.date);

            txns.push({
      id: `tx_${i + 1}_${dateNorm.replace(/-/g, '')}`,
      transactionDate: dateNorm,
      valueDate: dateNorm,
      rawNarration: row.narration,
      normalizedNarration: row.narration.trim(),
      narration: row.narration,
      type: classification.taxonomy,
      debit: row.debit,
      credit: row.credit,
      amount,
      direction,
      balanceAfter: row.balance,
      currency: 'INR',
      channel,
      referenceNumber: row.referenceNumber,
      entityId: `ent_${entityName.replace(/[^A-Za-z0-9]/g, '_')}`,
      entityName,
      entityNormalized: entityName.toUpperCase().trim(),
      entityType: classification.entityType,
      upiHandle,
      financialType: classification.taxonomy === 'EPFO_PF' ? 'INCOME' : classification.isIncome ? 'INCOME' : classification.isLoanCredit ? 'DEBT_DISBURSEMENT' : classification.isDebtRepayment ? 'DEBT_REPAYMENT' : classification.isCashWithdrawal ? 'CASH_WITHDRAWAL' : classification.isLifestyleSpend ? 'EXPENSE' : 'TRANSFER',
      isEconomicExpense: classification.isLifestyleSpend,
      isMoneyMovement: !classification.isLifestyleSpend && !classification.isIncome,
      isSalary: classification.taxonomy === 'SALARY',
      isLoan: classification.isLoanCredit || classification.isDebtRepayment,
      isRecurring: classification.isRecurring,
      isAnomaly: false,
      category: classification.taxonomy,
      subcategory: classification.reason,
      categoryConfidence: classification.confidence === 'HIGH' ? 1.0 : classification.confidence === 'MEDIUM' ? 0.6 : 0.3,
      classificationMethod: 'RULE',
    });
  }

  return txns;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 6: RECONCILIATION
// ══════════════════════════════════════════════════════════════════════════════

export function reconcileStatement(txns: CanonicalTransaction[]): ReconciliationResult {
  let totalCredits = 0;
  let totalDebits = 0;
  let openingBalance: number | null = null;
  let closingBalance: number | null = null;

  for (const t of txns) {
    if (t.credit) totalCredits += t.credit;
    if (t.debit) totalDebits += t.debit;
    if (t.balanceAfter !== null) {
      // First transaction's balance before = balanceAfter + debit - credit
      if (openingBalance === null) {
        openingBalance = t.balanceAfter + (t.debit || 0) - (t.credit || 0);
      }
      closingBalance = t.balanceAfter;
    }
  }

  const expectedClosing = openingBalance !== null ? openingBalance + totalCredits - totalDebits : null;
  const discrepancy = (expectedClosing !== null && closingBalance !== null)
    ? Math.abs(expectedClosing - closingBalance)
    : 0;

  const isReconciled = discrepancy < 1.0;

  return {
    isReconciled,
    openingBalance,
    totalCredits,
    totalDebits,
    expectedClosingBalance: expectedClosing,
    actualClosingBalance: closingBalance,
    discrepancy,
    netCashFlow: totalCredits - totalDebits,
    transactionCount: txns.length,
    status: openingBalance === null ? 'INSUFFICIENT_DATA' : isReconciled ? 'RECONCILED' : 'DISCREPANCY',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 7: INFLOW DECOMPOSITION
// ══════════════════════════════════════════════════════════════════════════════

export function computeInflowDecomposition(txns: CanonicalTransaction[]): InflowDecomposition {
  let salary = 0, salaryCount = 0;
  let loanCredits = 0, loanCreditCount = 0;
  let epfoPf = 0, epfoCount = 0;
  let refundsReversals = 0, refundCount = 0;
  let reimbursements = 0, reimbursementCount = 0;
  let interestIncome = 0;
  let otherIncome = 0, otherIncomeCount = 0;
  let p2pInflows = 0, p2pInflowCount = 0;

  for (const t of txns) {
    if (t.direction !== 'CREDIT' || !t.credit) continue;
    switch (t.category) {
      case 'SALARY': salary += t.credit; salaryCount++; break;
      case 'LOAN_CREDIT': loanCredits += t.credit; loanCreditCount++; break;
      case 'EPFO_PF': epfoPf += t.credit; epfoCount++; break;
      case 'REFUND': case 'REVERSAL': refundsReversals += t.credit; refundCount++; break;
      case 'REIMBURSEMENT': reimbursements += t.credit; reimbursementCount++; break;
      case 'INTEREST_INCOME': interestIncome += t.credit; break;
      case 'PERSONAL_TRANSFER': p2pInflows += t.credit; p2pInflowCount++; break;
      default: otherIncome += t.credit; otherIncomeCount++; break;
    }
  }

  const totalCredits = salary + loanCredits + epfoPf + refundsReversals + reimbursements + interestIncome + otherIncome + p2pInflows;
  const earnedIncomeTotal = salary + reimbursements + epfoPf + interestIncome;
  const borrowedMoneyTotal = loanCredits;

  return {
    salary, salaryCount, loanCredits, loanCreditCount, epfoPf, epfoCount,
    refundsReversals, refundCount, reimbursements, reimbursementCount,
    interestIncome, otherIncome, otherIncomeCount, p2pInflows, p2pInflowCount,
    totalCredits,
    earnedIncomeTotal,
    borrowedMoneyTotal,
    earnedIncomePct: totalCredits > 0 ? (earnedIncomeTotal / totalCredits) * 100 : 0,
    borrowedMoneyPct: totalCredits > 0 ? (borrowedMoneyTotal / totalCredits) * 100 : 0,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 8: LENDER MATRIX
// ══════════════════════════════════════════════════════════════════════════════

export const LENDER_PATTERNS: Array<{ pattern: RegExp; name: string; product: string }> = [
  { pattern: /leafin|zed\s*leafin|salary\s*now/i, name: 'Zed Leafin (Prefr)', product: 'Short-Term Salary Advance Credit' },
  { pattern: /mpokket/i, name: 'mPokket Financial Services', product: 'Short-Term Revolving Credit' },
  { pattern: /vivifi|flexsalary|flexpay/i, name: 'VIVIFI India Finance (FlexSalary)', product: 'Digital Revolving Credit Line' },
  { pattern: /meghdoot/i, name: 'Meghdoot Mercantile Pvt Ltd', product: 'Digital Personal Loan' },
  { pattern: /grow\s*money|growmoney/i, name: 'Grow Money Capital', product: 'Short-Term Credit Line' },
  { pattern: /talazen|tala\s*loan/i, name: 'Talazen Finance (Tala)', product: 'Instant Mobile Credit' },
  { pattern: /branch\s*international|branch\s*loan/i, name: 'Branch International', product: 'Digital Micro Loan' },
  { pattern: /unifinz|lendingplate/i, name: 'Lendingplate (Unifinz Capital)', product: 'Personal Loan' },
  { pattern: /salaryontime|salary\s*on\s*time/i, name: 'SalaryOnTime', product: 'Advance Salary Loan' },
  { pattern: /kreditbee|kredit\s*bee|krazybee/i, name: 'KreditBee', product: 'Digital Personal Loan' },
  { pattern: /moneyview|whizdm/i, name: 'MoneyView', product: 'Personal Loan' },
  { pattern: /fibe|earlysalary/i, name: 'Fibe (EarlySalary)', product: 'Instant Loan' },
  { pattern: /cashe|bhanix/i, name: 'CASHe', product: 'Short-Term Loan' },
  { pattern: /navi\s*loan|navi\s*finserv|navifinance/i, name: 'Navi Loans', product: 'Personal Loan' },
  { pattern: /ring\s*by\s*dmi|si\s*creva|kissht/i, name: 'Ring by DMI Finance / Kissht', product: 'Credit Line' },
  { pattern: /smartcoin/i, name: 'SmartCoin', product: 'Micro Loan' },
  { pattern: /prefr/i, name: 'Prefr (Fincfriends)', product: 'Personal Loan' },
  { pattern: /paysense/i, name: 'PaySense', product: 'Personal Loan' },
  { pattern: /loantap/i, name: 'LoanTap', product: 'Personal Loan' },
  { pattern: /zype/i, name: 'Zype (Thirumeni Finance)', product: 'Instant Credit Line' },
  { pattern: /snapmint/i, name: 'Snapmint Financial Services', product: 'EMI Credit / BNPL' },
  { pattern: /lazypay/i, name: 'LazyPay (PayU Finance)', product: 'Revolving Credit Line' },
  { pattern: /simpl/i, name: 'Simpl', product: 'Pay Later Credit' },
  { pattern: /bajaj\s*fin/i, name: 'Bajaj Finance / Finserv', product: 'Consumer EMI / Personal Loan' },
];

export function detectLenders(txns: CanonicalTransaction[]): LiveLenderItem[] {
  const lenderMap = new Map<string, {
    name: string; product: string;
    borrowed: number; repaid: number;
    borrowCount: number; repayCount: number;
    dates: string[];
  }>();

  for (const t of txns) {
    const n = t.rawNarration;
    for (const lp of LENDER_PATTERNS) {
      if (lp.pattern.test(n)) {
        const existing = lenderMap.get(lp.name) || {
          name: lp.name, product: lp.product,
          borrowed: 0, repaid: 0, borrowCount: 0, repayCount: 0, dates: [],
        };
        if (t.direction === 'CREDIT' && t.credit) {
          existing.borrowed += t.credit;
          existing.borrowCount++;
        } else if (t.direction === 'DEBIT' && t.debit) {
          existing.repaid += t.debit;
          existing.repayCount++;
        }
        existing.dates.push(t.transactionDate);
        lenderMap.set(lp.name, existing);
        break;
      }
    }
  }

  return Array.from(lenderMap.values())
    .filter(l => l.borrowed > 0 || l.repaid > 0)
    .sort((a, b) => (b.borrowed + b.repaid) - (a.borrowed + a.repaid))
    .map((l, idx) => {
      const sortedDates = l.dates.sort();
      const netDelta = l.repaid - l.borrowed;
      const recyclingRatio = l.repaid > 0 ? l.borrowed / l.repaid : 0;
      return {
        id: `lender_${idx + 1}`,
        name: l.name,
        normalizedName: l.name.toUpperCase(),
        productType: l.product,
        totalBorrowed: l.borrowed,
        totalRepaid: l.repaid,
        netDelta,
        borrowCount: l.borrowCount,
        repayCount: l.repayCount,
        firstActivityDate: sortedDates[0] || '',
        lastActivityDate: sortedDates[sortedDates.length - 1] || '',
        status: netDelta > 0 ? 'PARTIALLY_REPAID' : 'ACTIVE',
        recyclingRisk: recyclingRatio > 0.8 ? 'HIGH' : recyclingRatio > 0.5 ? 'MODERATE' : 'LOW',
        loanRecyclingRatio: recyclingRatio,
      } as LiveLenderItem;
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 9: RECIPIENT FORENSICS
// ══════════════════════════════════════════════════════════════════════════════

export function detectRecipients(txns: CanonicalTransaction[]): LiveRecipientItem[] {
  const recipMap = new Map<string, {
    name: string; handle: string | null;
    sent: number; received: number;
    amounts: number[]; dates: string[];
    count: number;
  }>();

  for (const t of txns) {
    if (t.category !== 'UPI_TRANSFER_UNKNOWN' && t.category !== 'PERSONAL_TRANSFER' && t.category !== 'FAMILY_TRANSFER') continue;
    const key = t.upiHandle || t.entityNormalized;
    if (!key || key.length < 2) continue;

    const existing = recipMap.get(key) || { name: t.entityName, handle: t.upiHandle, sent: 0, received: 0, amounts: [], dates: [], count: 0 };
    if (t.direction === 'DEBIT' && t.debit) { existing.sent += t.debit; existing.amounts.push(t.debit); }
    if (t.direction === 'CREDIT' && t.credit) { existing.received += t.credit; }
    existing.dates.push(t.transactionDate);
    existing.count++;
    recipMap.set(key, existing);
  }

  return Array.from(recipMap.values())
    .filter(r => r.sent > 0 || r.received > 0)
    .sort((a, b) => b.sent - a.sent)
    .slice(0, 50)
    .map((r, idx) => {
      const sortedDates = r.dates.sort();
      const avgTxn = r.amounts.length > 0 ? r.amounts.reduce((a, b) => a + b, 0) / r.amounts.length : 0;
      const monthSpan = Math.max(1, sortedDates.length > 0 ?
        (new Date(sortedDates[sortedDates.length - 1]).getTime() - new Date(sortedDates[0]).getTime()) / (30 * 24 * 3600 * 1000) : 1);

      return {
        id: `recip_${idx + 1}`,
        name: r.name || r.handle || 'Unknown',
        normalizedName: (r.name || '').toUpperCase(),
        upiHandle: r.handle,
        totalSent: r.sent,
        totalReceived: r.received,
        netOutflow: r.sent - r.received,
        txnCount: r.count,
        largestTxn: Math.max(...r.amounts, 0),
        smallestTxn: Math.min(...r.amounts.filter(a => a > 0), 0),
        averageTxn: avgTxn,
        monthlyAverage: r.sent / monthSpan,
        firstDate: sortedDates[0] || '',
        lastDate: sortedDates[sortedDates.length - 1] || '',
        relationshipTag: 'PERSON',
        flagPriority: r.sent > 50000 ? 'HIGH' : 'NORMAL',
      } as LiveRecipientItem;
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 10: LIFESTYLE BREAKDOWN
// ══════════════════════════════════════════════════════════════════════════════

export function computeLifestyleBreakdown(txns: CanonicalTransaction[]): LiveLifestyleBreakdown {
  const cats: Record<string, { total: number; count: number; merchants: Map<string, { amount: number; count: number }> }> = {
    food: { total: 0, count: 0, merchants: new Map() },
    grocery: { total: 0, count: 0, merchants: new Map() },
    transport: { total: 0, count: 0, merchants: new Map() },
    shopping: { total: 0, count: 0, merchants: new Map() },
    entertainment: { total: 0, count: 0, merchants: new Map() },
    utilities: { total: 0, count: 0, merchants: new Map() },
    subscriptions: { total: 0, count: 0, merchants: new Map() },
    insurance: { total: 0, count: 0, merchants: new Map() },
    other: { total: 0, count: 0, merchants: new Map() },
  };

  const taxMap: Record<string, keyof typeof cats> = {
    FOOD: 'food', GROCERY: 'grocery', TRANSPORT: 'transport',
    SHOPPING: 'shopping', ENTERTAINMENT: 'entertainment',
    BILL_UTILITY: 'utilities', SUBSCRIPTION: 'subscriptions',
    INSURANCE: 'insurance',
  };

  for (const t of txns) {
    if (t.direction !== 'DEBIT' || !t.debit) continue;
    const catKey = taxMap[t.category];
    if (!catKey) continue;

    cats[catKey].total += t.debit;
    cats[catKey].count++;
    const merch = cats[catKey].merchants.get(t.entityName) || { amount: 0, count: 0 };
    merch.amount += t.debit;
    merch.count++;
    cats[catKey].merchants.set(t.entityName, merch);
  }

  const buildMerchants = (m: Map<string, { amount: number; count: number }>, total: number): MerchantAgg[] =>
    Array.from(m.entries())
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 10)
      .map(([name, d]) => ({
        name,
        amount: d.amount,
        count: d.count,
        sharePercent: total > 0 ? (d.amount / total) * 100 : 0,
        avgTicket: d.count > 0 ? d.amount / d.count : 0,
      }));

  const totalLifestyle = Object.values(cats).reduce((s, c) => s + c.total, 0);

  return {
    food: { total: cats.food.total, count: cats.food.count, merchants: buildMerchants(cats.food.merchants, cats.food.total) },
    grocery: { total: cats.grocery.total, count: cats.grocery.count, merchants: buildMerchants(cats.grocery.merchants, cats.grocery.total) },
    transport: { total: cats.transport.total, count: cats.transport.count, merchants: buildMerchants(cats.transport.merchants, cats.transport.total) },
    shopping: { total: cats.shopping.total, count: cats.shopping.count, merchants: buildMerchants(cats.shopping.merchants, cats.shopping.total) },
    entertainment: { total: cats.entertainment.total, count: cats.entertainment.count, merchants: buildMerchants(cats.entertainment.merchants, cats.entertainment.total) },
    utilities: { total: cats.utilities.total, count: cats.utilities.count, merchants: buildMerchants(cats.utilities.merchants, cats.utilities.total) },
    subscriptions: { total: cats.subscriptions.total, count: cats.subscriptions.count, merchants: buildMerchants(cats.subscriptions.merchants, cats.subscriptions.total) },
    insurance: { total: cats.insurance.total, count: cats.insurance.count, merchants: buildMerchants(cats.insurance.merchants, cats.insurance.total) },
    other: { total: cats.other.total, count: cats.other.count, merchants: buildMerchants(cats.other.merchants, cats.other.total) },
    totalLifestyle,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 11: MONTHLY VELOCITY
// ══════════════════════════════════════════════════════════════════════════════

export function computeMonthlyVelocity(txns: CanonicalTransaction[]): MonthlyVelocityRow[] {
  const monthMap = new Map<string, {
    salary: number; loansReceived: number; otherCredits: number;
    loanRepaid: number; ccPayments: number; personalTransfers: number;
    walletMovements: number; cashWithdrawals: number; lifestyleSpend: number;
    insurance: number; bankCharges: number; otherDebits: number;
    totalCredits: number; totalDebits: number; closing: number | null;
  }>();

  for (const t of txns) {
    const [year, month] = t.transactionDate.split('-');
    if (!year || !month) continue;
    const key = `${year}-${month}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        salary: 0, loansReceived: 0, otherCredits: 0,
        loanRepaid: 0, ccPayments: 0, personalTransfers: 0,
        walletMovements: 0, cashWithdrawals: 0, lifestyleSpend: 0,
        insurance: 0, bankCharges: 0, otherDebits: 0,
        totalCredits: 0, totalDebits: 0, closing: null,
      });
    }
    const m = monthMap.get(key)!;

    if (t.direction === 'CREDIT' && t.credit) {
      m.totalCredits += t.credit;
      if (t.category === 'SALARY') m.salary += t.credit;
      else if (t.category === 'LOAN_CREDIT') m.loansReceived += t.credit;
      else m.otherCredits += t.credit;
    } else if (t.direction === 'DEBIT' && t.debit) {
      m.totalDebits += t.debit;
      if (t.category === 'LOAN_REPAYMENT') m.loanRepaid += t.debit;
      else if (t.category === 'CREDIT_CARD_PAYMENT') m.ccPayments += t.debit;
      else if (t.category === 'UPI_TRANSFER_UNKNOWN' || t.category === 'PERSONAL_TRANSFER') m.personalTransfers += t.debit;
      else if (t.category === 'WALLET_MOVEMENT' || t.category === 'PAYMENT_BANK_MOVEMENT') m.walletMovements += t.debit;
      else if (t.category === 'CASH_WITHDRAWAL') m.cashWithdrawals += t.debit;
      else if (t.isEconomicExpense) m.lifestyleSpend += t.debit;
      else if (t.category === 'INSURANCE') m.insurance += t.debit;
      else if (t.category === 'BANK_CHARGE') m.bankCharges += t.debit;
      else m.otherDebits += t.debit;
    }

    if (t.balanceAfter !== null) m.closing = t.balanceAfter;
  }

  const sortedKeys = Array.from(monthMap.keys()).sort();

  return sortedKeys.map(key => {
    const m = monthMap.get(key)!;
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const fyYear = parseInt(month) >= 4 ? parseInt(year) : parseInt(year) - 1;
    const netCashFlow = m.totalCredits - m.totalDebits;
    const obligationsExceedSalary = m.salary > 0 && (m.loanRepaid + m.ccPayments) > m.salary;

    return {
      monthKey: key,
      monthName,
      financialYear: `FY ${fyYear}-${(fyYear + 1).toString().slice(2)}`,
      salary: m.salary,
      loansReceived: m.loansReceived,
      otherCredits: m.otherCredits,
      totalCredits: m.totalCredits,
      loanRepaid: m.loanRepaid,
      creditCardPayments: m.ccPayments,
      personalTransfers: m.personalTransfers,
      walletMovements: m.walletMovements,
      cashWithdrawals: m.cashWithdrawals,
      lifestyleSpend: m.lifestyleSpend,
      insurance: m.insurance,
      bankCharges: m.bankCharges,
      otherDebits: m.otherDebits,
      totalDebits: m.totalDebits,
      netCashFlow,
      closingBalance: m.closing,
      isDeficit: netCashFlow < 0,
      obligationsExceedSalary,
    };
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 12: RECURRING DETECTION
// ══════════════════════════════════════════════════════════════════════════════

export function detectRecurring(txns: CanonicalTransaction[]): LiveRecurring[] {
  const groups = new Map<string, CanonicalTransaction[]>();

  for (const t of txns) {
    if (t.direction !== 'DEBIT') continue;
    const key = t.entityNormalized.substring(0, 20) + '|' + t.category;
    const g = groups.get(key) || [];
    g.push(t);
    groups.set(key, g);
  }

  const recurring: LiveRecurring[] = [];

  for (const [key, group] of groups) {
    if (group.length < 2) continue;

    const amounts = group.map(t => t.amount).sort((a, b) => a - b);
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const median = amounts[Math.floor(amounts.length / 2)];

    // Check if amounts are similar (within 20% variance)
    const maxAmt = Math.max(...amounts);
    const minAmt = Math.min(...amounts);
    const variance = maxAmt > 0 ? (maxAmt - minAmt) / maxAmt : 1;
    if (variance > 0.5 && amounts.length < 4) continue; // Too variable and too few

    const dates = group.map(t => t.transactionDate).sort();
    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / (24 * 3600 * 1000);
      gaps.push(diff);
    }

    const avgGap = gaps.length > 0 ? gaps.reduce((s, g) => s + g, 0) / gaps.length : 0;
    let frequency: LiveRecurring['frequency'] = 'IRREGULAR';
    if (avgGap >= 25 && avgGap <= 35) frequency = 'MONTHLY';
    else if (avgGap >= 6 && avgGap <= 10) frequency = 'WEEKLY';
    else if (avgGap >= 55 && avgGap <= 70) frequency = 'BIMONTHLY';
    else if (avgGap >= 85 && avgGap <= 100) frequency = 'QUARTERLY';

    const confidence: ConfidenceLevel = (variance < 0.05 && frequency !== 'IRREGULAR') ? 'HIGH'
      : (variance < 0.2 && frequency !== 'IRREGULAR') ? 'MEDIUM' : 'LOW';

    if (group.length < 3 && confidence === 'LOW') continue;

    const monthlyEquivalent = frequency === 'MONTHLY' ? median
      : frequency === 'WEEKLY' ? median * 4.33
      : frequency === 'QUARTERLY' ? median / 3
      : frequency === 'BIMONTHLY' ? median / 2
      : avg;

    // Predict next date
    let nextExpected: string | null = null;
    if (frequency !== 'IRREGULAR' && dates.length > 0) {
      const lastDate = new Date(dates[dates.length - 1]);
      const nextDate = new Date(lastDate.getTime() + avgGap * 24 * 3600 * 1000);
      nextExpected = nextDate.toISOString().split('T')[0];
    }

    recurring.push({
      id: `rec_${recurring.length + 1}`,
      entityName: group[0].entityName,
      taxonomy: group[0].category as ClassificationTaxonomy,
      amounts,
      averageAmount: avg,
      medianAmount: median,
      frequency,
      confidence,
      firstDate: dates[0],
      lastDate: dates[dates.length - 1],
      occurrences: group.length,
      monthlyEquivalent,
      annualizedCost: monthlyEquivalent * 12,
      nextExpected,
    });
  }

  return recurring.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 13: ANOMALY DETECTION
// ══════════════════════════════════════════════════════════════════════════════

export function detectAnomalies(txns: CanonicalTransaction[]): LiveAnomaly[] {
  const anomalies: LiveAnomaly[] = [];
  const debitTxns = txns.filter(t => t.direction === 'DEBIT' && t.debit);

  if (debitTxns.length < 5) return anomalies;

  const amounts = debitTxns.map(t => t.debit!).sort((a, b) => a - b);
  const q1 = amounts[Math.floor(amounts.length * 0.25)];
  const q3 = amounts[Math.floor(amounts.length * 0.75)];
  const iqr = q3 - q1;
  const upperFence = q3 + 2.5 * iqr;
  const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length);

  for (const t of debitTxns) {
    if (!t.debit) continue;
    const zScore = stdDev > 0 ? (t.debit - mean) / stdDev : 0;

    if (t.debit > upperFence && zScore > 2.0) {
      const severity: LiveAnomaly['severity'] = t.debit > 50000 ? 'HIGH' : t.debit > 20000 ? 'MEDIUM' : 'LOW';
      anomalies.push({
        id: `anml_${anomalies.length + 1}`,
        txId: t.id,
        date: t.transactionDate,
        narration: t.rawNarration,
        amount: t.debit,
        direction: 'DEBIT',
        type: zScore > 3.5 ? 'STATISTICAL_OUTLIER' : 'LARGE_TRANSACTION',
        severity,
        reason: `₹${t.debit.toLocaleString('en-IN')} is ${zScore.toFixed(1)} standard deviations above average (avg: ₹${Math.round(mean).toLocaleString('en-IN')})`,
        zScore,
      });
    }
  }

  // Large fixed thresholds
  for (const t of txns) {
    const amt = t.debit || t.credit || 0;
    if (amt >= 50000 && !anomalies.find(a => a.txId === t.id)) {
      anomalies.push({
        id: `anml_${anomalies.length + 1}`,
        txId: t.id,
        date: t.transactionDate,
        narration: t.rawNarration,
        amount: amt,
        direction: t.direction,
        type: 'LARGE_TRANSACTION',
        severity: amt >= 100000 ? 'HIGH' : 'MEDIUM',
        reason: `High-value transaction of ₹${amt.toLocaleString('en-IN')}`,
      });
    }
  }

  return anomalies.sort((a, b) => b.amount - a.amount).slice(0, 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 14: FINANCIAL RATIOS
// ══════════════════════════════════════════════════════════════════════════════

export function computeFinancialRatios(
  txns: CanonicalTransaction[],
  inflow: InflowDecomposition,
  reconciliation: ReconciliationResult,
  monthly: MonthlyVelocityRow[],
): LiveFinancialRatios {
  let totalLoanRepayments = 0, totalCCPayments = 0, totalPersonalTransfers = 0;
  let totalWalletMovements = 0, totalCashWithdrawals = 0, totalLifestyle = 0;

  for (const t of txns) {
    if (t.direction !== 'DEBIT' || !t.debit) continue;
    if (t.category === 'LOAN_REPAYMENT') totalLoanRepayments += t.debit;
    else if (t.category === 'CREDIT_CARD_PAYMENT') totalCCPayments += t.debit;
    else if (t.category === 'UPI_TRANSFER_UNKNOWN' || t.category === 'PERSONAL_TRANSFER') totalPersonalTransfers += t.debit;
    else if (t.category === 'WALLET_MOVEMENT') totalWalletMovements += t.debit;
    else if (t.category === 'CASH_WITHDRAWAL') totalCashWithdrawals += t.debit;
    else if (t.isEconomicExpense) totalLifestyle += t.debit;
  }

  const earnedIncome = inflow.earnedIncomeTotal;
  const totalIncome = inflow.totalCredits;
  const closingBal = reconciliation.actualClosingBalance || 0;

  // Monthly salary variance for stability score
  const salaryMonths = monthly.filter(m => m.salary > 0).map(m => m.salary);
  const salaryMean = salaryMonths.length > 0 ? salaryMonths.reduce((s, a) => s + a, 0) / salaryMonths.length : 0;
  const salaryStdDev = salaryMonths.length > 1
    ? Math.sqrt(salaryMonths.reduce((s, a) => s + Math.pow(a - salaryMean, 2), 0) / salaryMonths.length)
    : 0;
  const cv = salaryMean > 0 ? salaryStdDev / salaryMean : 1;
  const incomeStabilityScore = Math.max(0, Math.min(100, (1 - cv) * 100));

  const avgMonthlyOutflow = monthly.length > 0
    ? monthly.reduce((s, m) => s + m.totalDebits, 0) / monthly.length
    : 0;

  return {
    debtToIncomeRatio: earnedIncome > 0 ? (totalLoanRepayments / earnedIncome) * 100 : 0,
    lifestyleToIncomeRatio: earnedIncome > 0 ? (totalLifestyle / earnedIncome) * 100 : 0,
    savingsRate: earnedIncome > 0 ? Math.max(0, (earnedIncome - totalLifestyle - totalLoanRepayments) / earnedIncome) * 100 : 0,
    borrowingDependency: totalIncome > 0 ? (inflow.loanCredits / totalIncome) * 100 : 0,
    debtRepaymentBurden: totalIncome > 0 ? (totalLoanRepayments / totalIncome) * 100 : 0,
    cashLeakageRatio: totalIncome > 0 ? (totalCashWithdrawals / totalIncome) * 100 : 0,
    personalTransferRatio: inflow.salary > 0 ? (totalPersonalTransfers / inflow.salary) * 100 : 0,
    netCashFlowMargin: totalIncome > 0 ? (reconciliation.netCashFlow / totalIncome) * 100 : 0,
    incomeStabilityScore,
    emergencyBufferMonths: avgMonthlyOutflow > 0 ? closingBal / avgMonthlyOutflow : 0,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 15: HEALTH SCORE
// ══════════════════════════════════════════════════════════════════════════════

export function computeHealthScore(ratios: LiveFinancialRatios): LiveHealthScore {
  const dims: LiveHealthScore['dimensions'] = [
    {
      name: 'Income Stability',
      score: ratios.incomeStabilityScore,
      status: ratios.incomeStabilityScore > 80 ? 'GREEN' : ratios.incomeStabilityScore > 50 ? 'AMBER' : 'RED',
      detail: `Income CV score: ${ratios.incomeStabilityScore.toFixed(0)}/100`,
      improvement: 'Diversify income sources or ensure consistent salary.',
    },
    {
      name: 'Debt Burden',
      score: Math.max(0, 100 - ratios.debtToIncomeRatio),
      status: ratios.debtToIncomeRatio < 30 ? 'GREEN' : ratios.debtToIncomeRatio < 50 ? 'AMBER' : 'RED',
      detail: `Loan repayments = ${ratios.debtToIncomeRatio.toFixed(1)}% of earned income`,
      improvement: 'Focus on reducing high-interest debt. Avoid new borrowing.',
    },
    {
      name: 'Lifestyle Ratio',
      score: Math.max(0, 100 - ratios.lifestyleToIncomeRatio),
      status: ratios.lifestyleToIncomeRatio < 50 ? 'GREEN' : ratios.lifestyleToIncomeRatio < 75 ? 'AMBER' : 'RED',
      detail: `Lifestyle spending = ${ratios.lifestyleToIncomeRatio.toFixed(1)}% of earned income`,
      improvement: 'Review discretionary spending on food, shopping, entertainment.',
    },
    {
      name: 'Savings Rate',
      score: Math.min(100, ratios.savingsRate),
      status: ratios.savingsRate > 20 ? 'GREEN' : ratios.savingsRate > 5 ? 'AMBER' : 'RED',
      detail: `Net savings rate: ${ratios.savingsRate.toFixed(1)}%`,
      improvement: 'Target 20%+ savings rate. Automate savings via SIP/RD.',
    },
    {
      name: 'Loan Dependency',
      score: Math.max(0, 100 - ratios.borrowingDependency),
      status: ratios.borrowingDependency < 10 ? 'GREEN' : ratios.borrowingDependency < 25 ? 'AMBER' : 'RED',
      detail: `Borrowed money = ${ratios.borrowingDependency.toFixed(1)}% of all inflows`,
      improvement: 'Reduce reliance on digital loans. Build an emergency fund.',
    },
    {
      name: 'Cash Leakage',
      score: Math.max(0, 100 - ratios.cashLeakageRatio * 2),
      status: ratios.cashLeakageRatio < 5 ? 'GREEN' : ratios.cashLeakageRatio < 15 ? 'AMBER' : 'RED',
      detail: `Cash withdrawals = ${ratios.cashLeakageRatio.toFixed(1)}% of income`,
      improvement: 'Use digital payments to maintain spending traceability.',
    },
    {
      name: 'Emergency Buffer',
      score: Math.min(100, ratios.emergencyBufferMonths * 16.67),
      status: ratios.emergencyBufferMonths >= 3 ? 'GREEN' : ratios.emergencyBufferMonths >= 1 ? 'AMBER' : 'RED',
      detail: `Closing balance covers ${ratios.emergencyBufferMonths.toFixed(1)} months of expenses`,
      improvement: 'Build 3-6 months emergency fund in liquid savings.',
    },
  ];

  const overallScore = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length);
  const tier: LiveHealthScore['tier'] = overallScore > 80 ? 'EXCELLENT'
    : overallScore > 65 ? 'GOOD'
    : overallScore > 50 ? 'FAIR'
    : overallScore > 35 ? 'POOR'
    : 'CRITICAL';

  const redDims = dims.filter(d => d.status === 'RED');
  const primaryRisk = redDims.length > 0 ? redDims[0].name : dims.filter(d => d.status === 'AMBER')[0]?.name || 'None identified';

  return {
    overallScore,
    tier,
    dimensions: dims,
    primaryRisk,
    topImprovements: dims.filter(d => d.status !== 'GREEN').map(d => d.improvement).slice(0, 3),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 16: WHERE ₹100 WENT
// ══════════════════════════════════════════════════════════════════════════════

const WHERE100_COLORS: Record<string, string> = {
  'UPI / Personal Transfers': '#7C3AED',
  'Loan Repayments': '#DC2626',
  'Wallet / Payment Bank': '#EA580C',
  'Cash Withdrawals': '#92400E',
  'Credit Card Payments': '#BE185D',
  'Insurance': '#1D4ED8',
  'Shopping': '#7C3AED',
  'Utilities & Telecom': '#0369A1',
  'Transport': '#0891B2',
  'Food & Dining': '#D97706',
  'Groceries': '#16A34A',
  'Entertainment': '#DB2777',
  'Subscriptions': '#6D28D9',
  'Bank Charges': '#6B7280',
  'Other': '#9CA3AF',
};

export function computeWhere100Went(txns: CanonicalTransaction[]): Where100WentItem[] {
  const buckets = new Map<string, { amount: number; isLifestyle: boolean; isMoneyMovement: boolean; txIds: string[] }>();

  const addTo = (label: string, amount: number, isLifestyle: boolean, isMoneyMovement: boolean, txId: string) => {
    const b = buckets.get(label) || { amount: 0, isLifestyle, isMoneyMovement, txIds: [] };
    b.amount += amount;
    b.txIds.push(txId);
    buckets.set(label, b);
  };

  for (const t of txns) {
    if (t.direction !== 'DEBIT' || !t.debit) continue;
    switch (t.category) {
      case 'LOAN_REPAYMENT': addTo('Loan Repayments', t.debit, false, true, t.id); break;
      case 'CREDIT_CARD_PAYMENT': addTo('Credit Card Payments', t.debit, false, true, t.id); break;
      case 'WALLET_MOVEMENT': addTo('Wallet / Payment Bank', t.debit, false, true, t.id); break;
      case 'CASH_WITHDRAWAL': addTo('Cash Withdrawals', t.debit, false, true, t.id); break;
      case 'UPI_TRANSFER_UNKNOWN': case 'PERSONAL_TRANSFER': addTo('UPI / Personal Transfers', t.debit, false, true, t.id); break;
      case 'INSURANCE': addTo('Insurance', t.debit, false, false, t.id); break;
      case 'FOOD': addTo('Food & Dining', t.debit, true, false, t.id); break;
      case 'GROCERY': addTo('Groceries', t.debit, true, false, t.id); break;
      case 'TRANSPORT': addTo('Transport', t.debit, true, false, t.id); break;
      case 'SHOPPING': addTo('Shopping', t.debit, true, false, t.id); break;
      case 'ENTERTAINMENT': addTo('Entertainment', t.debit, true, false, t.id); break;
      case 'BILL_UTILITY': addTo('Utilities & Telecom', t.debit, true, false, t.id); break;
      case 'SUBSCRIPTION': addTo('Subscriptions', t.debit, true, false, t.id); break;
      case 'BANK_CHARGE': addTo('Bank Charges', t.debit, false, false, t.id); break;
      default: addTo('Other', t.debit, false, false, t.id); break;
    }
  }

  const totalDebits = Array.from(buckets.values()).reduce((s, b) => s + b.amount, 0);

  return Array.from(buckets.entries())
    .filter(([, b]) => b.amount > 0)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .map(([label, b]) => ({
      category: label,
      amount: b.amount,
      rupees: totalDebits > 0 ? Math.round((b.amount / totalDebits) * 10000) / 100 : 0,
      percentage: totalDebits > 0 ? (b.amount / totalDebits) * 100 : 0,
      color: WHERE100_COLORS[label] || '#9CA3AF',
      isLifestyle: b.isLifestyle,
      isMoneyMovement: b.isMoneyMovement,
      txIds: b.txIds,
    }));
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 17: INSIGHTS GENERATOR
// ══════════════════════════════════════════════════════════════════════════════

export function generateInsights(
  txns: CanonicalTransaction[],
  inflow: InflowDecomposition,
  ratios: LiveFinancialRatios,
  lenders: LiveLenderItem[],
  monthly: MonthlyVelocityRow[],
): LiveInsight[] {
  const insights: LiveInsight[] = [];

  // Insight 1: Debt burden
  if (ratios.debtToIncomeRatio > 30) {
    insights.push({
      id: 'ins_debt_burden',
      type: 'RISK',
      severity: ratios.debtToIncomeRatio > 50 ? 'HIGH' : 'MEDIUM',
      title: 'High Debt Repayment Burden',
      summary: `Loan repayments consumed ${ratios.debtToIncomeRatio.toFixed(1)}% of your earned income.`,
      evidence: `₹${txns.filter(t => (t.financialType === 'DEBT_REPAYMENT')).reduce((s, t) => s + (t.debit || 0), 0).toLocaleString('en-IN')} repaid across ${lenders.length} lenders.`,
      recommendedAction: 'Prioritize paying off high-interest loans. Avoid new borrowing until existing debt is reduced.',
      txIds: txns.filter(t => (t.financialType === 'DEBT_REPAYMENT')).map(t => t.id),
    });
  }

  // Insight 2: Loan dependency
  if (ratios.borrowingDependency > 15) {
    insights.push({
      id: 'ins_loan_dep',
      type: 'WARNING',
      severity: 'HIGH',
      title: 'Significant Reliance on Borrowed Money',
      summary: `${ratios.borrowingDependency.toFixed(1)}% of total inflows came from loans, not earned income.`,
      evidence: `Borrowed: ₹${inflow.loanCredits.toLocaleString('en-IN')} vs Earned: ₹${inflow.earnedIncomeTotal.toLocaleString('en-IN')}`,
      recommendedAction: 'Build an emergency fund (₹30,000–₹60,000) to break the borrowing cycle.',
      txIds: txns.filter(t => (t.financialType === 'DEBT_DISBURSEMENT')).map(t => t.id),
    });
  }

  // Insight 3: Negative cash flow months
  const deficitMonths = monthly.filter(m => m.isDeficit);
  if (deficitMonths.length > 0) {
    insights.push({
      id: 'ins_deficit_months',
      type: 'WARNING',
      severity: deficitMonths.length > 3 ? 'HIGH' : 'MEDIUM',
      title: `${deficitMonths.length} Month(s) with Negative Cash Flow`,
      summary: `Money leaving exceeded money coming in for ${deficitMonths.length} months.`,
      evidence: deficitMonths.slice(0, 3).map(m => `${m.monthName}: ${m.netCashFlow < 0 ? '-' : '+'}₹${Math.abs(m.netCashFlow).toLocaleString('en-IN')}`).join(', '),
      recommendedAction: 'Investigate high-outflow months and identify discretionary spending that can be reduced.',
      txIds: [],
    });
  }

  // Insight 4: Lifestyle spending visibility
  const lifestyleAmt = txns.filter(t => t.isEconomicExpense).reduce((s, t) => s + (t.debit || 0), 0);
  const totalDebits = txns.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + (t.debit || 0), 0);
  if (totalDebits > 0) {
    const lifestylePct = (lifestyleAmt / totalDebits) * 100;
    insights.push({
      id: 'ins_lifestyle_pct',
      type: 'OBSERVATION',
      severity: 'INFO',
      title: 'True Lifestyle Spend is Lower Than Total Debits',
      summary: `Only ${lifestylePct.toFixed(1)}% of total debits was identifiable lifestyle spending.`,
      evidence: `₹${lifestyleAmt.toLocaleString('en-IN')} lifestyle out of ₹${totalDebits.toLocaleString('en-IN')} total debits.`,
      recommendedAction: 'Review the remaining UPI transfers, wallet movements, and cash withdrawals for actual spending.',
      txIds: txns.filter(t => t.isEconomicExpense).map(t => t.id),
    });
  }

  // Insight 5: Cash leakage
  if (ratios.cashLeakageRatio > 10) {
    insights.push({
      id: 'ins_cash_leak',
      type: 'WARNING',
      severity: 'MEDIUM',
      title: 'Significant Cash Withdrawals Reduce Traceability',
      summary: `${ratios.cashLeakageRatio.toFixed(1)}% of income was withdrawn as cash.`,
      evidence: `₹${txns.filter(t => (t.category === 'CASH_WITHDRAWAL')).reduce((s, t) => s + (t.debit || 0), 0).toLocaleString('en-IN')} in ATM withdrawals.`,
      recommendedAction: 'Switch to digital payments to maintain complete spending visibility.',
      txIds: txns.filter(t => (t.category === 'CASH_WITHDRAWAL')).map(t => t.id),
    });
  }

  return insights;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 18: MASTER RUN FUNCTION
// ══════════════════════════════════════════════════════════════════════════════

export async function runFullAnalysis(
  file: File,
  onProgress?: (stage: string, pct: number) => void,
): Promise<LiveAnalyticsResult> {
  const p = onProgress || (() => {});

  p('Parsing statement file...', 10);
  const { preview, allRows } = await parseStatementFile(file);

  p('Extracting transactions...', 25);
  const startRow = preview.columnMap.headerRowIdx >= 0 ? preview.columnMap.headerRowIdx + 1 : 0;
  const rawRows: ParsedRow[] = [];
  for (let i = startRow; i < allRows.length; i++) {
    const parsed = parseRow(allRows[i], preview.columnMap);
    if (parsed) rawRows.push(parsed);
  }

  p('Normalizing and classifying transactions...', 45);
  const txns = normalizeTransactions(rawRows);

  p('Running reconciliation...', 55);
  const reconciliation = reconcileStatement(txns);

  p('Computing income decomposition...', 60);
  const inflow = computeInflowDecomposition(txns);

  p('Detecting lenders...', 65);
  const lenders = detectLenders(txns);

  p('Analyzing recipients...', 70);
  const recipients = detectRecipients(txns);

  p('Computing lifestyle breakdown...', 73);
  const lifestyle = computeLifestyleBreakdown(txns);

  p('Building monthly velocity table...', 76);
  const monthlyVelocity = computeMonthlyVelocity(txns);

  p('Detecting recurring mandates...', 80);
  const recurring = detectRecurring(txns);

  p('Running anomaly detection...', 83);
  const anomalies = detectAnomalies(txns);

  p('Computing financial ratios...', 87);
  const ratios = computeFinancialRatios(txns, inflow, reconciliation, monthlyVelocity);

  p('Computing health score...', 90);
  const healthScore = computeHealthScore(ratios);

  p('Computing Where ₹100 Went...', 93);
  const where100Went = computeWhere100Went(txns);

  p('Generating insights...', 96);
  const insights = generateInsights(txns, inflow, ratios, lenders, monthlyVelocity);

  p('Building category breakdown...', 98);

  // Outflow totals
  let totalDebtRepayments = 0, totalCreditCardPayments = 0, totalPersonalTransfers = 0;
  let totalWalletMovements = 0, totalCashWithdrawals = 0, totalLifestyleSpend = 0;
  let totalInsurance = 0, totalBankCharges = 0, totalOtherDebits = 0;
  let totalDebitsAll = 0;

  const catAgg = new Map<string, { amount: number; count: number; isLifestyle: boolean; icon: string; color: string; txIds: string[] }>();
  const addCat = (cat: string, amount: number, count: number, isLifestyle: boolean, icon: string, color: string, txId: string) => {
    const e = catAgg.get(cat) || { amount: 0, count: 0, isLifestyle, icon, color, txIds: [] };
    e.amount += amount;
    e.count += count;
    e.txIds.push(txId);
    catAgg.set(cat, e);
  };

  for (const t of txns) {
    if (t.direction !== 'DEBIT' || !t.debit) continue;
    totalDebitsAll += t.debit;
    if (t.category === 'LOAN_REPAYMENT') { totalDebtRepayments += t.debit; addCat('Loan Repayments', t.debit, 1, false, '🏦', '#DC2626', t.id); }
    else if (t.category === 'CREDIT_CARD_PAYMENT') { totalCreditCardPayments += t.debit; addCat('Credit Card Payments', t.debit, 1, false, '💳', '#BE185D', t.id); }
    else if (t.category === 'UPI_TRANSFER_UNKNOWN' || t.category === 'PERSONAL_TRANSFER') { totalPersonalTransfers += t.debit; addCat('UPI / Personal Transfers', t.debit, 1, false, '👥', '#7C3AED', t.id); }
    else if (t.category === 'WALLET_MOVEMENT') { totalWalletMovements += t.debit; addCat('Wallet / Payment Bank', t.debit, 1, false, '📱', '#EA580C', t.id); }
    else if (t.category === 'CASH_WITHDRAWAL') { totalCashWithdrawals += t.debit; addCat('Cash Withdrawals', t.debit, 1, false, '🏧', '#92400E', t.id); }
    else if (t.category === 'INSURANCE') { totalInsurance += t.debit; addCat('Insurance', t.debit, 1, false, '🛡️', '#1D4ED8', t.id); }
    else if (t.category === 'BANK_CHARGE') { totalBankCharges += t.debit; addCat('Bank Charges', t.debit, 1, false, '🏛️', '#6B7280', t.id); }
    else if (t.isEconomicExpense) { totalLifestyleSpend += t.debit; addCat(t.category, t.debit, 1, true, '🛍️', '#16A34A', t.id); }
    else { totalOtherDebits += t.debit; addCat('Other', t.debit, 1, false, '📦', '#9CA3AF', t.id); }
  }

  const moneyMovementTotal = totalDebtRepayments + totalCreditCardPayments + totalPersonalTransfers + totalWalletMovements + totalCashWithdrawals;
  const trueLifestyleTotal = lifestyle.totalLifestyle;

  const categoryBreakdown = Array.from(catAgg.entries())
    .map(([cat, data]) => ({
      category: cat,
      amount: data.amount,
      percentage: totalDebitsAll > 0 ? (data.amount / totalDebitsAll) * 100 : 0,
      count: data.count,
      isLifestyle: data.isLifestyle,
      icon: data.icon,
      color: data.color,
      txIds: data.txIds,
    }))
    .sort((a, b) => b.amount - a.amount);

  p('Analysis complete!', 100);

  return {
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    bankDetected: preview.bankDetected,
    accountHolder: preview.accountHolder,
    accountNo: preview.accountNo,
    ifsc: '',
    branch: '',
    periodStart: preview.periodStart || (txns[0]?.transactionDate || ''),
    periodEnd: preview.periodEnd || (txns[txns.length - 1]?.transactionDate || ''),
    transactions: txns,
    reconciliation,
    inflowDecomposition: inflow,
    totalDebtRepayments,
    totalCreditCardPayments,
    totalPersonalTransfers,
    totalWalletMovements,
    totalCashWithdrawals,
    totalLifestyleSpend,
    totalInsurance,
    totalBankCharges,
    totalOtherDebits,
    trueLifestyleTotal,
    trueLifestyleShare: totalDebitsAll > 0 ? (trueLifestyleTotal / totalDebitsAll) * 100 : 0,
    moneyMovementTotal,
    moneyMovementShare: totalDebitsAll > 0 ? (moneyMovementTotal / totalDebitsAll) * 100 : 0,
    lenders,
    recipients,
    lifestyle,
    monthlyVelocity,
    recurring,
    anomalies,
    ratios,
    healthScore,
    where100Went,
    insights,
    categoryBreakdown,
  };
}


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 19: MULTI-STATEMENT PROCESSING & COVERAGE ENGINE
// ══════════════════════════════════════════════════════════════════════════════

export function analyzeStatementCoverage(
  txns: CanonicalTransaction[],
  files: StatementFileSource[]
): StatementCoverageQuality {
  if (txns.length === 0) {
    return {
      earliestDate: '',
      latestDate: '',
      totalDays: 0,
      totalMonths: 0,
      monthsPresent: [],
      missingMonths: [],
      financialYearsCovered: [],
      calendarYearsCovered: [],
      status: 'PARTIAL_COVERAGE',
      continuityScore: 0,
      overlappingPeriods: [],
      balanceContinuityStatus: 'NO_BALANCE_DATA',
      balanceDiscrepancyCount: 0,
    };
  }

  const sorted = [...txns].sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));
  const earliestDate = sorted[0].transactionDate;
  const latestDate = sorted[sorted.length - 1].transactionDate;

  // Month detection
  const monthMap = new Map<string, number>();
  const fySet = new Set<string>();
  const calYearSet = new Set<number>();

  sorted.forEach(t => {
    if (t.transactionDate && t.transactionDate.length >= 7) {
      const mKey = t.transactionDate.substring(0, 7);
      monthMap.set(mKey, (monthMap.get(mKey) || 0) + 1);

      const y = parseInt(t.transactionDate.substring(0, 4), 10);
      const m = parseInt(t.transactionDate.substring(5, 7), 10);
      if (!isNaN(y)) {
        calYearSet.add(y);
        if (!isNaN(m)) {
          const fyStart = m >= 4 ? y : y - 1;
          fySet.add(`FY ${fyStart}-${String(fyStart + 1).slice(2)}`);
        }
      }
    }
  });

  const monthsPresent = Array.from(monthMap.keys()).sort();

  // Gap detection: check all months between earliest and latest
  const missingMonths: string[] = [];
  if (monthsPresent.length > 1) {
    const [startYear, startMo] = monthsPresent[0].split('-').map(Number);
    const [endYear, endMo] = monthsPresent[monthsPresent.length - 1].split('-').map(Number);

    let curY = startYear;
    let curM = startMo;
    while (curY < endYear || (curY === endYear && curM <= endMo)) {
      const key = `${curY}-${String(curM).padStart(2, '0')}`;
      if (!monthMap.has(key)) {
        missingMonths.push(key);
      }
      curM++;
      if (curM > 12) {
        curM = 1;
        curY++;
      }
    }
  }

  // Overlap detection between files
  const overlappingPeriods: StatementCoverageQuality['overlappingPeriods'] = [];
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const f1 = files[i];
      const f2 = files[j];
      if (f1.statementStartDate && f1.statementEndDate && f2.statementStartDate && f2.statementEndDate) {
        const start1 = normalizeDate(f1.statementStartDate);
        const end1 = normalizeDate(f1.statementEndDate);
        const start2 = normalizeDate(f2.statementStartDate);
        const end2 = normalizeDate(f2.statementEndDate);

        const overlapStart = start1 > start2 ? start1 : start2;
        const overlapEnd = end1 < end2 ? end1 : end2;

        if (overlapStart <= overlapEnd) {
          const d1 = new Date(overlapStart).getTime();
          const d2 = new Date(overlapEnd).getTime();
          const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
          overlappingPeriods.push({
            fileA: f1.fileName,
            fileB: f2.fileName,
            overlapDays: diffDays,
            overlapStart,
            overlapEnd,
          });
        }
      }
    }
  }

  // Balance continuity verification
  let balanceDiscrepancies = 0;
  let hasBalanceData = false;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.balanceAfter !== null && curr.balanceAfter !== null) {
      hasBalanceData = true;
      const expectedBalance = prev.balanceAfter + (curr.credit || 0) - (curr.debit || 0);
      const diff = Math.abs(expectedBalance - curr.balanceAfter);
      if (diff > 1.0) {
        balanceDiscrepancies++;
      }
    }
  }

  const balanceContinuityStatus: StatementCoverageQuality['balanceContinuityStatus'] = !hasBalanceData
    ? 'NO_BALANCE_DATA'
    : balanceDiscrepancies === 0
    ? 'BALANCE_CONTINUITY_VERIFIED'
    : balanceDiscrepancies <= 2
    ? 'BALANCE_CONTINUITY_WARNING'
    : 'BALANCE_CONTINUITY_FAILED';

  let status: StatementCoverageQuality['status'] = 'COMPLETE_CONTINUOUS';
  if (missingMonths.length > 0) status = 'GAPS_DETECTED';
  else if (overlappingPeriods.length > 0) status = 'OVERLAPPING_STATEMENTS';
  else if (monthsPresent.length < 12) status = 'PARTIAL_COVERAGE';

  const totalDays = Math.max(1, Math.round((new Date(latestDate).getTime() - new Date(earliestDate).getTime()) / (1000 * 60 * 60 * 24)));
  const continuityScore = Math.max(0, 100 - (missingMonths.length * 15) - (balanceDiscrepancies * 5));

  return {
    earliestDate,
    latestDate,
    totalDays,
    totalMonths: monthsPresent.length,
    monthsPresent,
    missingMonths,
    financialYearsCovered: Array.from(fySet).sort(),
    calendarYearsCovered: Array.from(calYearSet).sort(),
    status,
    continuityScore,
    overlappingPeriods,
    balanceContinuityStatus,
    balanceDiscrepancyCount: balanceDiscrepancies,
  };
}

/**
 * Master multi-file statement processor:
 * - Computes cryptographic file hashes (SHA-256)
 * - Detects duplicate files
 * - Parses all statement files with multi-sheet support
 * - Generates transaction fingerprints
 * - Performs cross-file deduplication with lineage tracking
 * - Sorts chronologically
 * - Computes dynamic coverage, financial years, reconciliation, and forensic intelligence
 */
export async function processMultipleStatementFiles(
  files: File[],
  onProgress?: (stage: string, pct: number) => void
): Promise<MultiStatementSession> {
  const p = onProgress || (() => {});
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();

  p('Hashing and inspecting uploaded statements...', 10);

  const fileSources: StatementFileSource[] = [];
  const seenFileHashes = new Set<string>();
  const allParsedRows: Array<{
    row: ParsedRow;
    fileId: string;
    fileName: string;
    rowIndex: number;
    sheetName: string;
  }> = [];

  let totalRawRows = 0;
  let duplicateFilesCount = 0;
  let failedFilesCount = 0;

  for (let fIdx = 0; fIdx < files.length; fIdx++) {
    const file = files[fIdx];
    const fileId = `file_${fIdx + 1}_${Date.now()}`;
    const filePct = Math.round(10 + (fIdx / files.length) * 35);
    p(`Processing [${fIdx + 1}/${files.length}]: ${file.name}...`, filePct);

    let fileHash = '';
    try {
      fileHash = await computeFileHash(file);
    } catch {
      fileHash = `hash_${file.name}_${file.size}`;
    }

    // Check exact duplicate file
    if (seenFileHashes.has(fileHash)) {
      duplicateFilesCount++;
      fileSources.push({
        fileId,
        fileName: file.name,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        parseStatus: 'DUPLICATE_SKIPPED',
        duplicateStatus: 'EXACT_FILE_DUPLICATE',
        detectedBank: 'Duplicate File',
        detectedAccount: 'N/A',
        maskedAccount: 'N/A',
        statementStartDate: '',
        statementEndDate: '',
        rawRowCount: 0,
        transactionCount: 0,
        duplicateTransactionCount: 0,
        errorMessage: 'Exact duplicate file already processed in this session.',
      });
      continue;
    }
    seenFileHashes.add(fileHash);

    try {
      const isExcel = /\.(xlsx|xls)$/i.test(file.name);
      let sheetNames: string[] = ['Default'];
      let sheetsData: Array<{ sheetName: string; rows: any[][] }> = [];

      if (isExcel) {
        const arrayBuf = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuf, { type: 'array', cellDates: true });
        sheetNames = workbook.SheetNames || [];
        
        // Filter out non-statement sheets
        const validSheets = sheetNames.filter(name => {
          const lower = name.toLowerCase();
          return !lower.includes('summary') && !lower.includes('instruction') && !lower.includes('term') && !lower.includes('chart') && !lower.includes('note');
        });

        const targetSheets = validSheets.length > 0 ? validSheets : [sheetNames[0]];
        sheetsData = targetSheets.map(sName => {
          const s = workbook.Sheets[sName];
          const r = XLSX.utils.sheet_to_json<any[]>(s, { header: 1, raw: false, defval: '' }) || [];
          return { sheetName: sName, rows: r };
        });
      } else {
        const text = await file.text();
        const r = text
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean)
          .map(line => line.split(/[,;\t]/).map(c => c.replace(/^["']|["']$/g, '').trim()));
        sheetsData = [{ sheetName: 'Sheet1', rows: r }];
      }

      let fileTxnCount = 0;
      let detectedBank = '';
      let detectedAccount = '';
      let startDate = '';
      let endDate = '';

      for (const sheetObj of sheetsData) {
        const rows = sheetObj.rows;
        if (!rows || rows.length === 0) continue;
        totalRawRows += rows.length;

        // Detect metadata
        for (let r = 0; r < Math.min(rows.length, 25); r++) {
          const rStr = (rows[r] || []).join(' ');
          const lower = rStr.toLowerCase();
          if (!detectedBank) {
            if (lower.includes('hdfc')) detectedBank = 'HDFC Bank';
            else if (lower.includes('sbi') || lower.includes('state bank')) detectedBank = 'State Bank of India';
            else if (lower.includes('icici')) detectedBank = 'ICICI Bank';
            else if (lower.includes('axis')) detectedBank = 'Axis Bank';
            else if (lower.includes('kotak')) detectedBank = 'Kotak Mahindra Bank';
            else if (lower.includes('punjab national') || lower.includes('pnb')) detectedBank = 'Punjab National Bank';
            else if (lower.includes('airtel payments')) detectedBank = 'Airtel Payments Bank';
          }
          const acctMatch = rStr.match(/Account\s*(?:No|Number|#)?[:\s]*([0-9Xx*]{6,20})/i);
          if (acctMatch && !detectedAccount) detectedAccount = acctMatch[1];
        }

        const colMap = detectColumnMap(rows);
        const startRow = colMap.headerRowIdx >= 0 ? colMap.headerRowIdx + 1 : 0;

        for (let r = startRow; r < rows.length; r++) {
          const parsed = parseRow(rows[r], colMap);
          if (parsed) {
            allParsedRows.push({
              row: parsed,
              fileId,
              fileName: file.name,
              rowIndex: r + 1,
              sheetName: sheetObj.sheetName,
            });
            fileTxnCount++;
            const normD = normalizeDate(parsed.date);
            if (!startDate || normD < startDate) startDate = normD;
            if (!endDate || normD > endDate) endDate = normD;
          }
        }
      }

      fileSources.push({
        fileId,
        fileName: file.name,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || (isExcel ? 'application/vnd.ms-excel' : 'text/csv'),
        uploadedAt: new Date().toISOString(),
        parseStatus: fileTxnCount > 0 ? 'PARSED' : 'PARTIAL',
        duplicateStatus: 'NON_DUPLICATE',
        detectedBank: detectedBank || 'Bank Statement',
        detectedAccount: detectedAccount || 'Account ****',
        maskedAccount: detectedAccount ? detectedAccount.replace(/.(?=.{4})/g, '*') : 'Account ****',
        statementStartDate: startDate,
        statementEndDate: endDate,
        rawRowCount: totalRawRows,
        transactionCount: fileTxnCount,
        duplicateTransactionCount: 0,
        sheetNames,
      });
    } catch (err: any) {
      failedFilesCount++;
      fileSources.push({
        fileId,
        fileName: file.name,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        parseStatus: 'FAILED',
        duplicateStatus: 'NON_DUPLICATE',
        detectedBank: 'Unknown',
        detectedAccount: 'N/A',
        maskedAccount: 'N/A',
        statementStartDate: '',
        statementEndDate: '',
        rawRowCount: 0,
        transactionCount: 0,
        duplicateTransactionCount: 0,
        errorMessage: err.message || 'Failed to parse statement',
      });
    }
  }

  p('Normalizing and fingerprinting transactions...', 50);

  // Cross-file deduplication
  const fingerprintMap = new Map<string, CanonicalTransaction>();
  let duplicateTransactionsRemoved = 0;
  let potentialDuplicatesCount = 0;

  const rawTxns = normalizeTransactions(allParsedRows.map(item => item.row));

  for (let i = 0; i < rawTxns.length; i++) {
    const tx = rawTxns[i];
    const meta = allParsedRows[i];
    const fp = generateTransactionFingerprint({
      date: tx.transactionDate,
      valueDate: tx.valueDate,
      debit: tx.debit,
      credit: tx.credit,
      amount: tx.amount,
      narration: tx.rawNarration,
      referenceNumber: tx.referenceNumber,
      balance: tx.balanceAfter,
    });

    if (fingerprintMap.has(fp)) {
      duplicateTransactionsRemoved++;
      const existing = fingerprintMap.get(fp)!;
      if (!existing.sourceFiles) existing.sourceFiles = [];
      if (!existing.sourceFiles.includes(meta.fileName)) {
        existing.sourceFiles.push(meta.fileName);
      }
      const fSource = fileSources.find(f => f.fileId === meta.fileId);
      if (fSource) fSource.duplicateTransactionCount++;
    } else {
      tx.sourceFiles = [meta.fileName];
      fingerprintMap.set(fp, tx);
    }
  }

  const uniqueTransactions = Array.from(fingerprintMap.values())
    .sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));

  p('Calculating statement coverage & balance continuity...', 65);
  const coverage = analyzeStatementCoverage(uniqueTransactions, fileSources);

  p('Computing reconciliation and forensic analytics...', 80);
  const reconciliation = reconcileStatement(uniqueTransactions);
  const inflow = computeInflowDecomposition(uniqueTransactions);
  const lenders = detectLenders(uniqueTransactions);
  const recipients = detectRecipients(uniqueTransactions);
  const lifestyle = computeLifestyleBreakdown(uniqueTransactions);
  const monthlyVelocity = computeMonthlyVelocity(uniqueTransactions);
  const recurring = detectRecurring(uniqueTransactions);
  const anomalies = detectAnomalies(uniqueTransactions);
  const ratios = computeFinancialRatios(uniqueTransactions, inflow, reconciliation, monthlyVelocity);
  const healthScore = computeHealthScore(ratios);
  const where100Went = computeWhere100Went(uniqueTransactions);
  const insights = generateInsights(uniqueTransactions, inflow, ratios, lenders, monthlyVelocity);

  // Outflows
  let totalDebtRepayments = 0, totalCreditCardPayments = 0, totalPersonalTransfers = 0;
  let totalWalletMovements = 0, totalCashWithdrawals = 0, totalLifestyleSpend = 0;
  let totalInsurance = 0, totalBankCharges = 0, totalOtherDebits = 0;
  let totalDebitsAll = 0;

  const catAgg = new Map<string, { amount: number; count: number; isLifestyle: boolean; icon: string; color: string; txIds: string[] }>();
  const addCat = (cat: string, amount: number, count: number, isLifestyle: boolean, icon: string, color: string, txId: string) => {
    const e = catAgg.get(cat) || { amount: 0, count: 0, isLifestyle, icon, color, txIds: [] };
    e.amount += amount;
    e.count += count;
    e.txIds.push(txId);
    catAgg.set(cat, e);
  };

  for (const t of uniqueTransactions) {
    if (t.direction !== 'DEBIT' || !t.debit) continue;
    totalDebitsAll += t.debit;
    if (t.category === 'LOAN_REPAYMENT') { totalDebtRepayments += t.debit; addCat('Loan Repayments', t.debit, 1, false, '🏦', '#DC2626', t.id); }
    else if (t.category === 'CREDIT_CARD_PAYMENT') { totalCreditCardPayments += t.debit; addCat('Credit Card Payments', t.debit, 1, false, '💳', '#BE185D', t.id); }
    else if (t.category === 'UPI_TRANSFER_UNKNOWN' || t.category === 'PERSONAL_TRANSFER') { totalPersonalTransfers += t.debit; addCat('UPI / Personal Transfers', t.debit, 1, false, '👥', '#7C3AED', t.id); }
    else if (t.category === 'WALLET_MOVEMENT') { totalWalletMovements += t.debit; addCat('Wallet / Payment Bank', t.debit, 1, false, '📱', '#EA580C', t.id); }
    else if (t.category === 'CASH_WITHDRAWAL') { totalCashWithdrawals += t.debit; addCat('Cash Withdrawals', t.debit, 1, false, '🏧', '#92400E', t.id); }
    else if (t.category === 'INSURANCE') { totalInsurance += t.debit; addCat('Insurance', t.debit, 1, false, '🛡️', '#1D4ED8', t.id); }
    else if (t.category === 'BANK_CHARGE') { totalBankCharges += t.debit; addCat('Bank Charges', t.debit, 1, false, '🏛️', '#6B7280', t.id); }
    else if (t.isEconomicExpense) { totalLifestyleSpend += t.debit; addCat(t.category, t.debit, 1, true, '🛍️', '#16A34A', t.id); }
    else { totalOtherDebits += t.debit; addCat('Other', t.debit, 1, false, '📦', '#9CA3AF', t.id); }
  }

  const moneyMovementTotal = totalDebtRepayments + totalCreditCardPayments + totalPersonalTransfers + totalWalletMovements + totalCashWithdrawals;
  const trueLifestyleTotal = lifestyle.totalLifestyle;

  const categoryBreakdown = Array.from(catAgg.entries())
    .map(([cat, data]) => ({
      category: cat,
      amount: data.amount,
      percentage: totalDebitsAll > 0 ? (data.amount / totalDebitsAll) * 100 : 0,
      count: data.count,
      isLifestyle: data.isLifestyle,
      icon: data.icon,
      color: data.color,
      txIds: data.txIds,
    }))
    .sort((a, b) => b.amount - a.amount);

  const primaryFile = fileSources.find(f => f.parseStatus === 'PARSED') || fileSources[0];

  const liveAnalytics: LiveAnalyticsResult = {
    fileName: files.map(f => f.name).join(', '),
    uploadedAt: createdAt,
    bankDetected: primaryFile?.detectedBank || 'Bank Statement',
    accountHolder: 'Account Holder',
    accountNo: primaryFile?.maskedAccount || 'Account ****',
    ifsc: '',
    branch: '',
    periodStart: coverage.earliestDate,
    periodEnd: coverage.latestDate,
    transactions: uniqueTransactions,
    reconciliation,
    inflowDecomposition: inflow,
    totalDebtRepayments,
    totalCreditCardPayments,
    totalPersonalTransfers,
    totalWalletMovements,
    totalCashWithdrawals,
    totalLifestyleSpend,
    totalInsurance,
    totalBankCharges,
    totalOtherDebits,
    trueLifestyleTotal,
    trueLifestyleShare: totalDebitsAll > 0 ? (trueLifestyleTotal / totalDebitsAll) * 100 : 0,
    moneyMovementTotal,
    moneyMovementShare: totalDebitsAll > 0 ? (moneyMovementTotal / totalDebitsAll) * 100 : 0,
    lenders,
    recipients,
    lifestyle,
    monthlyVelocity,
    recurring,
    anomalies,
    ratios,
    healthScore,
    where100Went,
    insights,
    categoryBreakdown,
  };

  p('Generating dynamic comprehensive forensic dataset...', 95);
  const forensicDataset = generateForensicDataFromTransactions(uniqueTransactions, 'ALL_TIME', {
    accountHolder: 'Account Holder',
    accountNo: primaryFile?.maskedAccount || 'Account ****',
    bankName: primaryFile?.detectedBank || 'Bank Statement',
  });

  p('Multi-statement processing complete!', 100);

  return {
    sessionId,
    createdAt,
    files: fileSources,
    totalFilesCount: files.length,
    importedFilesCount: fileSources.filter(f => f.parseStatus === 'PARSED').length,
    duplicateFilesCount,
    failedFilesCount,
    totalRawRows,
    totalValidTransactions: allParsedRows.length,
    duplicateTransactionsRemoved,
    potentialDuplicatesCount,
    uniqueTransactions,
    coverage,
    reconciliation,
    analytics: liveAnalytics,
    forensicDataset,
  };
}
