/**
 * Universal Salary & Corporate Payroll Intelligence Engine
 *
 * Deterministically classifies salary and employer inflows from ANY company
 * across Indian & Global bank formats (NEFT, RTGS, IMPS, ACH, CMS, Internal Transfer).
 *
 * - Detects prefixes like SAL-, SAL/, SAL_, SALARY, PAYROLL, STIPEND, WAGES, CORP SAL, CMS/SALARY, ACH C-
 * - Intelligently distinguishes genuine corporate payroll from micro-lenders with "salary" in brand name (e.g. Salary Now, FlexSalary, EarlySalary)
 * - Dynamically extracts & normalizes employer names (e.g. Cyient Limited, Infosys, TCS, Newgen Software, Wipro, Google)
 * - Supports multi-employer job transitions and monthly salary timelines
 */

const MONTH_NAMES = new Set([
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
]);

// Non-salary words that begin with 'SAL'
const NON_SALARY_PREFIXES = ['SALMAN', 'SALE', 'SALES', 'SALOON', 'SALAD', 'SALAM', 'SALUTE', 'SALT'];

// Microloan apps / Digital lenders that contain "salary" in their name (MUST NOT be treated as corporate salary)
const DIGITAL_LOAN_KEYWORDS = [
  'FLEXSALARY', 'FLEX SALARY', 'SALARY NOW', 'SALARYNOW', 'EARLYSALARY', 'EARLY SALARY', 
  'SALARY ON TIME', 'SALARYONTIME', 'MPOKKET', 'KREDITBEE', 'VIVIFI', 'MONEYVIEW', 
  'CASHE', 'NAVI', 'RUPEEK', 'LENDINGPLATE', 'ZED LEAFIN', 'FIBE', 'PAYME', 'RING'
];

export interface DetectedEmployerInfo {
  employerName: string;
  transactionCount: number;
  totalSalary: number;
  averageMonthlySalary: number;
  confidence: number;
  lastCreditDate?: string;
}

export interface SalaryAnalysisResult {
  isSalary: boolean;
  employerName: string;
  confidence: number;
  category: string;
}

/**
 * Universal check whether a transaction is an employer salary credit.
 */
export function isSalaryTransaction(narration: string, isCredit: boolean = true, amount: number = 0): boolean {
  if (!isCredit || amount < 0) return FalseSalaryResult();
  const u = narration.toUpperCase().trim();

  // 1. Negative Filter: Digital lending apps using "salary" in brand name
  if (DIGITAL_LOAN_KEYWORDS.some(app => u.includes(app))) {
    return false;
  }

  // 2. Negative Filter: Non-salary words starting with SAL (e.g., Salman Khan) unless explicitly marked with SALARY
  for (const ns of NON_SALARY_PREFIXES) {
    const nsRegex = new RegExp(`\\b${ns}\\b`, 'i');
    if (nsRegex.test(u)) {
      if (!/\b(SALARY|PAYROLL|STIPEND|WAGES|REMUNERATION)\b/i.test(u)) {
        return false;
      }
    }
  }

  // 3. Positive Match Patterns

  // A. Prefix patterns like SAL-CYIENTLIMITED, SAL/AUG2026/CYIENT, SAL_TCS, SAL CYIENT
  if (/\bSAL[-/_]\s*[A-Z0-9]/i.test(u)) {
    return true;
  }
  if (/\bSAL\s+[A-Z0-9]/i.test(u) && !NON_SALARY_PREFIXES.some(ns => new RegExp(`\\b${ns}\\b`, 'i').test(u))) {
    return true;
  }

  // B. Standard keywords: SALARY, PAYROLL, STIPEND, WAGES, REMUNERATION
  if (/\b(SALARY|PAYROLL|STIPEND|WAGES|REMUNERATION)\b/i.test(u)) {
    return true;
  }

  // C. Corporate payroll markers: CORP SAL, CMS/SALARY, DIRECT DEP, DIR DEP
  if (/\b(CORP\s*SAL|CORPORATE\s*SALARY|MONTHLY\s*SAL|DIRECT\s*DEP|DIR\s*DEP|CMS\s*SALARY|CMS[/]SALARY)\b/i.test(u)) {
    return true;
  }

  // D. ACH / NACH Corporate Credits: ACH C- CYIENT LIMITED, ACH CR- INFOSYS
  if (/\bACH\s*C[-/\s]/i.test(u) && (
    /\b(LTD|LIMITED|PVT|CORP|TECHNOLOGIES|SOLUTIONS|SERVICES|SALARY|SAL)\b/i.test(u)
  )) {
    return true;
  }

  // E. NEFT / RTGS Corporate Payroll
  if (/\bNEFT\s*CR[-/]/i.test(u) && (
    /\b(SALARY|SAL FOR|PAYROLL|MONTHLY SAL)\b/i.test(u) ||
    (amount >= 15000 && /\b(LTD|LIMITED|PVT|CORP|TECHNOLOGIES|SOLUTIONS|SERVICES|INFOTECH)\b/i.test(u) && !u.includes('UPI'))
  )) {
    return true;
  }

  // F. High value bank transfer with corporate entities (> ₹15,000)
  if (amount >= 15000 && /\b(BY TRANSFER|NEFT CR|RTGS CR|ACH CR|INWARD CLG)\b/i.test(u) && !u.includes('UPI') && (
    /\b(LTD|LIMITED|PVT|CORP|TECHNOLOGIES|SOLUTIONS|SERVICES|INFOTECH|SOFTWARE)\b/i.test(u)
  )) {
    return true;
  }

  return false;
}

function FalseSalaryResult(): boolean {
  return false;
}

/**
 * Dynamically extract and format the Employer Name from any salary transaction narration.
 */
export function extractEmployerFromNarration(narration: string): string {
  const u = narration.toUpperCase().trim();

  // 1. Check NEFT CR-IFSC-COMPANY_NAME-BENEFICIARY-UTR format
  const neftMatch = u.match(/NEFT\s*CR-[A-Z0-9]+-([A-Z0-9\s&.,]+?)-[A-Z0-9\s]+-[A-Z0-9]+/i);
  if (neftMatch && neftMatch[1]) {
    const candidate = cleanEmployerRawString(neftMatch[1]);
    if (candidate.length >= 3) {
      return formatCompanyName(candidate);
    }
  }

  // 2. Check CMS/SALARY/COMPANY or ACH C- COMPANY
  const cmsMatch = u.match(/(?:CMS[/]SALARY[/]|ACH\s*C[-/\s]+|CMS[-/\s]+)([A-Z0-9\s&.,]+?)(?:[-/_]|\s+SALARY|\s+FOR|$)/i);
  if (cmsMatch && cmsMatch[1]) {
    const candidate = cleanEmployerRawString(cmsMatch[1]);
    if (candidate.length >= 3) {
      return formatCompanyName(candidate);
    }
  }

  // 3. Check slash/dash/underscore separated tokens (e.g. SAL-CYIENTLIMITED, SAL/AUG2026/CYIENT, SAL_TCS_LTD)
  const tokens = u.split(/[-/_\s]+/);
  const validTokens = tokens.map(t => cleanEmployerToken(t)).filter(Boolean);

  if (validTokens.length > 0) {
    const combined = validTokens.join(' ');
    return formatCompanyName(combined);
  }

  // 4. Fallback cleanup
  let clean = u
    .replace(/\b(NEFT|RTGS|IMPS|ACH|UPI|CMS|CR|DR)\b/g, ' ')
    .replace(/\b(SALARY|PAYROLL|STIPEND|WAGES|REMUNERATION|MONTHLY|FOR|BY|TRANSFER|CREDIT|INWARD|CLEARING)\b/g, ' ')
    .replace(/\bSAL[-/_]?\b/g, ' ')
    .replace(/[A-Z]{4}0[A-Z0-9]{6}/g, ' ') // IFSC codes
    .replace(/\bSCBL[A-Z0-9]+\b/g, ' ')
    .replace(/[0-9]{5,}/g, ' ') // long account numbers / UTRs
    .replace(/[^A-Za-z0-9\s&.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length >= 3) {
    return formatCompanyName(clean);
  }

  return 'Corporate Employer';
}

function cleanEmployerToken(token: string): string {
  const t = token.trim().toUpperCase();
  if (!t || t.length < 2) return '';
  if (MONTH_NAMES.has(t)) return '';
  if (/^(?:20\d\d|\d{2,4})$/.test(t)) return '';
  if (/^[A-Z]{3,4}\d{2,4}$/.test(t) && Array.from(MONTH_NAMES).some(m => t.startsWith(m))) return '';
  if (['SAL', 'SALARY', 'PAYROLL', 'STIPEND', 'WAGES', 'CREDIT', 'FOR', 'MONTH', 'CR', 'DR', 'NEFT', 'RTGS', 'IMPS', 'ACH', 'CMS', 'BY', 'TRANSFER', 'DIR', 'DEP', 'INWARD', 'CLG', 'REF'].includes(t)) {
    return '';
  }
  return token.trim();
}

function cleanEmployerRawString(str: string): string {
  return str
    .replace(/\b(SALARY|PAYROLL|FOOD BILL|REIMBURSEMENT|FOR|FROM|MONTHLY|CR|DR)\b/gi, ' ')
    .replace(/[0-9]{6,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format raw company names into clean Title Case (e.g. CYIENTLIMITED -> Cyient Limited).
 */
export function formatCompanyName(name: string): string {
  let formatted = name.trim();

  // Normalize common corporate abbreviations
  formatted = formatted.replace(/\bLIMITE\b/gi, 'Limited');
  formatted = formatted.replace(/\bPVT\s*LTD\b/gi, 'Private Limited');
  formatted = formatted.replace(/\bPVTLTD\b/gi, 'Private Limited');
  formatted = formatted.replace(/\bLTD\b/gi, 'Limited');
  formatted = formatted.replace(/\bLIMITED\b/gi, 'Limited');
  formatted = formatted.replace(/\bTECHNOLOGIES\b/gi, 'Technologies');
  formatted = formatted.replace(/\bSOLUTIONS\b/gi, 'Solutions');
  formatted = formatted.replace(/\bSOFTWARE\b/gi, 'Software');
  formatted = formatted.replace(/\bSERVICES\b/gi, 'Services');
  formatted = formatted.replace(/\bINFOTECH\b/gi, 'Infotech');

  // Handle concatenated corporate suffix like CYIENTLIMITED -> Cyient Limited
  const concatMatch = formatted.match(/^([A-Za-z0-9]{3,})(Limited|Technologies|Private Limited|Solutions|Services|Infotech|Software)$/i);
  if (concatMatch) {
    const prefix = concatMatch[1];
    const suffix = concatMatch[2];
    const prefixClean = prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
    return `${prefixClean} ${suffix}`;
  }

  // Proper Title Casing with exceptions for acronyms
  const KNOWN_ACRONYMS = new Set(['TCS', 'HCL', 'IBM', 'L&T', 'EPFO', 'LIC', 'R&D', 'IIT', 'IIM', 'GE', 'HP', 'EY', 'PWC', 'KPMG', 'SAP', 'AMD', 'ARM']);
  
  const words = formatted.split(/\s+/);
  return words
    .map(w => {
      const upper = w.toUpperCase();
      if (KNOWN_ACRONYMS.has(upper)) return upper;
      if (w.length <= 2 && /^[A-Z]+$/.test(w)) return upper;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Analyze all credit transactions and detect distinct employer profiles.
 */
export function analyzeAllEmployers(transactions: Array<{ date: string; narration: string; credit?: number | null; debit?: number | null }>): DetectedEmployerInfo[] {
  const employerMap: Record<string, { count: number; total: number; dates: string[] }> = {};

  transactions.forEach(t => {
    const isCredit = !!t.credit && t.credit > 0;
    const amount = t.credit || 0;
    if (isSalaryTransaction(t.narration, isCredit, amount)) {
      const emp = extractEmployerFromNarration(t.narration);
      if (!employerMap[emp]) {
        employerMap[emp] = { count: 0, total: 0, dates: [] };
      }
      employerMap[emp].count++;
      employerMap[emp].total += amount;
      if (t.date) employerMap[emp].dates.push(t.date);
    }
  });

  return Object.entries(employerMap).map(([employerName, data]) => ({
    employerName,
    transactionCount: data.count,
    totalSalary: data.total,
    averageMonthlySalary: data.count > 0 ? Math.round(data.total / data.count) : 0,
    confidence: data.count >= 2 ? 0.98 : 0.92,
    lastCreditDate: data.dates.length > 0 ? data.dates[data.dates.length - 1] : undefined,
  })).sort((a, b) => b.totalSalary - a.totalSalary);
}
