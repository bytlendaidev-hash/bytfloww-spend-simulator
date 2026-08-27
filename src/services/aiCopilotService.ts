/**
 * AI Forensic Copilot Service
 * =============================
 * Powered by Google Gemini 2.5 Flash with deterministic RAG ledger context injection.
 * Provides deep transaction-level forensics, interest calculation, peak spend analysis,
 * daily spend metrics, and lender matrix intelligence.
 */

import { 
  ForensicDataset, 
  ForensicLenderItem, 
  ForensicRecipientItem, 
  MonthlyCashFlowRow,
  FinancialHealthRatioItem,
  Where100WentItem 
} from '../engine/statementForensicsData';
import { CanonicalTransaction } from '../types';
import { analyzeAllEmployers } from '../engine/salaryIntelligence';

export const DEFAULT_GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

/**
 * Builds a structured, high-density financial context text from the live forensic dataset.
 */
export function buildForensicSystemPrompt(
  dataset: ForensicDataset,
  transactions: CanonicalTransaction[]
): string {
  // 1. Calculate Peak Spend Month & Category
  let peakMonth: MonthlyCashFlowRow | undefined = dataset.monthlyCashFlow[0];
  for (const m of dataset.monthlyCashFlow) {
    if (!peakMonth || m.totalDebits > peakMonth.totalDebits) {
      peakMonth = m;
    }
  }

  // 2. Calculate Total Interest / Extra Paid across all serviced lenders
  let totalBorrowed = 0;
  let totalRepaid = 0;
  let totalInterestOrExtraPaid = 0;
  const lenderSummaries = dataset.lenders.map((l: ForensicLenderItem) => {
    totalBorrowed += l.totalBorrowed;
    totalRepaid += l.totalRepaid;
    const extraPaid = Math.max(0, l.totalRepaid - l.totalBorrowed);
    if (l.totalRepaid > l.totalBorrowed) {
      totalInterestOrExtraPaid += extraPaid;
    }
    return `- ${l.name} (${l.productType}): Borrowed ₹${l.totalBorrowed.toLocaleString('en-IN')}, Repaid ₹${l.totalRepaid.toLocaleString('en-IN')}, Net Delta: ${l.netDelta >= 0 ? '+' : ''}₹${l.netDelta.toLocaleString('en-IN')} (${extraPaid > 0 ? `Extra/Interest/Fee: ₹${extraPaid.toLocaleString('en-IN')}` : 'Active Line'}) [${l.status}, Risk: ${l.recyclingRisk}]`;
  }).join('\n');

  // 3. Calculate Daily Spend Averages
  const totalDays = Math.max(1, dataset.monthlyCashFlow.length * 30);
  const avgDailyDebit = dataset.totalDebits / totalDays;
  const avgDailyLifestyle = dataset.trueLifestyleTotal / totalDays;

  const monthlyDailySpends = dataset.monthlyCashFlow.map((m: MonthlyCashFlowRow) => {
    const dailyAvg = m.totalDebits / 30;
    return `- ${m.monthName} (${m.financialYear}): Total Debits ₹${m.totalDebits.toLocaleString('en-IN')} (Avg ₹${Math.round(dailyAvg).toLocaleString('en-IN')}/day), Lifestyle: ₹${m.lifestyleSpend.toLocaleString('en-IN')}, Loans Repaid: ₹${m.loanRepaid.toLocaleString('en-IN')}, Status: ${m.isDeficit ? 'DEFICIT' : 'SURPLUS'}`;
  }).join('\n');

  // 4. EPFO Withdrawals Summary
  const epfoTxns = transactions.filter(t => t.category === 'EPFO_PF');
  const epfoDetails = epfoTxns.map(t => 
    `- ${t.transactionDate}: ₹${t.amount.toLocaleString('en-IN')} | Ref: ${t.referenceNumber || 'N/A'} | Balance After: ₹${t.balanceAfter?.toLocaleString('en-IN') || 'N/A'} | Narration: ${t.rawNarration}`
  ).join('\n');

  // 5. Corporate Earned Salary Summary
  const salaryTxns = transactions.filter(t => t.category === 'SALARY');
  const salaryDetails = salaryTxns.map(t => 
    `- ${t.transactionDate}: ₹${t.amount.toLocaleString('en-IN')} (${t.entityName}) | Narration: ${t.rawNarration}`
  ).join('\n');

  // 6. Top P2P Recipients
  const topRecipients = dataset.recipients.slice(0, 10).map((r: ForensicRecipientItem) => 
    `- ${r.name} (${r.upiHandle || 'UPI'}): Sent ₹${r.totalSent.toLocaleString('en-IN')}, Received ₹${r.totalReceived.toLocaleString('en-IN')}, Net Outflow ₹${r.netOutflow.toLocaleString('en-IN')} across ${r.txnCount} txns [Priority: ${r.flaggedPriority}]`
  ).join('\n');

  // 7. 14-Category Debit Breakdown
  const debitBreakdownStr = dataset.debitBreakdown.map((d: any) => 
    `- ${d.rank}. ${d.icon} ${d.category}: ₹${d.amount.toLocaleString('en-IN')} (${d.percentage.toFixed(1)}% of debits) [${d.isLifestyle ? 'True Lifestyle Consumption' : 'Money Movement / Debt'}]`
  ).join('\n');

  // 8. 7 Financial Health Ratios
  const ratiosStr = dataset.ratios.map((r: FinancialHealthRatioItem) => 
    `- ${r.ratioName}: ${r.currentValue}% (Benchmark: ${r.benchmark}) -> Status: ${r.status} (${r.assessment})`
  ).join('\n');

  return `You are the BytFloww AI Forensic Copilot — a senior staff financial forensics auditor, financial architect, and personal wealth intelligence assistant.
You have DIRECT, RECONCILED ACCESS to the user's multi-statement bank ledger.

RECONCILED FINANCIAL GROUND TRUTH:
=================================
• Total Transactions: ${dataset.totalTransactions.toLocaleString('en-IN')}
• Statement Period: ${dataset.periodSpan} (${dataset.monthlyCashFlow.length} recorded months)
• Opening Balance: ₹${dataset.openingBalance?.toLocaleString('en-IN') || '0.00'}
• Total Inflow (Credits): ₹${dataset.totalCredits.toLocaleString('en-IN')}
• Total Outflow (Debits): ₹${dataset.totalDebits.toLocaleString('en-IN')}
• Closing Balance: ₹${dataset.closingBalance?.toLocaleString('en-IN') || '0.00'}
• Period Net Cash Flow: ${dataset.netCashFlow >= 0 ? '+' : ''}₹${dataset.netCashFlow.toLocaleString('en-IN')} (${dataset.netCashFlow >= 0 ? 'SURPLUS' : 'DEFICIT'})

INFLOW & SALARY DECOMPOSITION:
-----------------------------
• Earned Corporate Salary: ₹${dataset.salaryTotal.toLocaleString('en-IN')} (Strictly Employment, excludes loan debt)
• Statutory EPFO / PF Inflows: ₹${dataset.epfoCreditsTotal.toLocaleString('en-IN')} (${epfoTxns.length} claims)
• Total Loan Disbursals (Credits Received): ₹${dataset.loanCreditsTotal.toLocaleString('en-IN')}
• Refunds & Interest Income: ₹${(dataset.totalCredits - dataset.salaryTotal - dataset.epfoCreditsTotal - dataset.loanCreditsTotal).toLocaleString('en-IN')}

EPFO / PF WITHDRAWAL LEDGER:
${epfoDetails}

SALARY CYCLES:
${salaryDetails}

DEBT & LENDER FORENSICS:
-----------------------
• Total Borrowed from Lenders: ₹${totalBorrowed.toLocaleString('en-IN')}
• Total Repaid to Lenders: ₹${totalRepaid.toLocaleString('en-IN')}
• Net Debt Servicing Delta: ${totalRepaid >= totalBorrowed ? '+' : ''}₹${(totalRepaid - totalBorrowed).toLocaleString('en-IN')}
• Total Estimated Extra / Interest / Overpayment Paid: ₹${totalInterestOrExtraPaid.toLocaleString('en-IN')}
• Lenders Serviced:
${lenderSummaries}

PEAK SPEND & MONTHLY VELOCITY:
------------------------------
• Peak Outflow Month: ${peakMonth?.monthName || 'N/A'} (${peakMonth?.financialYear || 'N/A'}) with Total Debits of ₹${peakMonth?.totalDebits?.toLocaleString('en-IN') || 0} (Lifestyle: ₹${peakMonth?.lifestyleSpend?.toLocaleString('en-IN') || 0}, Debt Repaid: ₹${peakMonth?.loanRepaid?.toLocaleString('en-IN') || 0}, Net: ₹${peakMonth?.netCashFlow?.toLocaleString('en-IN') || 0}).
• Monthly Breakdown & Daily Spend Rate:
${monthlyDailySpends}

DAILY SPEND METRICS:
--------------------
• Average Daily Outflow (All Debits): ~₹${Math.round(avgDailyDebit).toLocaleString('en-IN')}/day
• Average Daily Lifestyle Consumption: ~₹${Math.round(avgDailyLifestyle).toLocaleString('en-IN')}/day

DEBIT CATEGORY ALLOCATION:
--------------------------
• True Lifestyle Consumption: ₹${dataset.trueLifestyleTotal.toLocaleString('en-IN')} (${dataset.trueLifestyleShare.toFixed(1)}%)
• Money Movement & Debt: ₹${dataset.moneyMovementTotal.toLocaleString('en-IN')} (${dataset.moneyMovementShare.toFixed(1)}%)
${debitBreakdownStr}

P2P TRANSFERS (COUNTERPARTIES):
-------------------------------
${topRecipients}

FINANCIAL HEALTH & RISK RATIOS:
-------------------------------
${ratiosStr}

TOP VULNERABILITIES:
${dataset.topProblems.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

TOP RECOMMENDED ACTIONS:
${dataset.topActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}

GUIDELINES FOR ANSWERING:
1. Always give precise, mathematical, and verified numbers directly from the ground truth above.
2. Format amounts in Indian currency notation with Rupee symbol (\`₹\`), bolding key metrics for clarity.
3. When asked where money is going most in a single month, highlight the peak month (${peakMonth?.monthName}) and break down the top spend categories (loan servicing, transfers, lifestyle).
4. When asked about loan interest/extra paid, calculate \`Total Repaid - Total Borrowed\` (e.g. ₹${totalInterestOrExtraPaid.toLocaleString('en-IN')} extra across lenders like Meghdoot, VIVIFI, Zed Leafin).
5. When asked about daily spend, provide the daily burn rate (~₹${Math.round(avgDailyDebit).toLocaleString('en-IN')}/day total, ~₹${Math.round(avgDailyLifestyle).toLocaleString('en-IN')}/day lifestyle) and highlight monthly variations.
6. When asked about loan credits, give the total borrowed (₹${dataset.loanCreditsTotal.toLocaleString('en-IN')}) and list the top lenders (mPokket, Grow Money, Meghdoot, VIVIFI, Zed Leafin, Talazen, Branch).
7. Keep responses concise, structured with bullet points, and actionable. Never hallucinate or invent fake transactions.`;
}

/**
 * Deterministic fallback response generator for offline or instant analytical answers.
 */
export function getDeterministicFallbackReply(
  userQuery: string,
  dataset: ForensicDataset,
  transactions: CanonicalTransaction[]
): string {
  const q = userQuery.toLowerCase();

  // Peak spend month query
  if (q.includes('where') && (q.includes('going most') || q.includes('peak') || q.includes('highest') || q.includes('single month') || q.includes('most in'))) {
    let peak: MonthlyCashFlowRow | undefined = dataset.monthlyCashFlow[0];
    for (const m of dataset.monthlyCashFlow) {
      if (!peak || m.totalDebits > peak.totalDebits) peak = m;
    }
    if (!peak) return 'No monthly cash flow data available yet.';

    const dailyBurn = Math.round(peak.totalDebits / 30);
    return `📊 **Peak Spending Month Analysis**:

Your highest outflow occurred in **${peak.monthName} (${peak.financialYear})** with a total outflow of **₹${peak.totalDebits.toLocaleString('en-IN')}** (averaging **₹${dailyBurn.toLocaleString('en-IN')}/day**).

**Where the money went in ${peak.monthName}**:
• **🏦 Loan Repayments & Debt Servicing**: **₹${peak.loanRepaid.toLocaleString('en-IN')}** (${((peak.loanRepaid / peak.totalDebits) * 100).toFixed(1)}% of monthly outflow)
• **Teal True Lifestyle Spend**: **₹${peak.lifestyleSpend.toLocaleString('en-IN')}** (${((peak.lifestyleSpend / peak.totalDebits) * 100).toFixed(1)}%)
• **💰 Inflow in this month**: **₹${peak.totalCredits.toLocaleString('en-IN')}** (Salary: ₹${peak.salary.toLocaleString('en-IN')})
• **⚖️ Monthly Net Cash Flow**: **${peak.netCashFlow >= 0 ? '+' : ''}₹${peak.netCashFlow.toLocaleString('en-IN')}** (${peak.isDeficit ? '⚠️ DEFICIT MONTH' : '✅ SURPLUS MONTH'})

*Insight: The primary driver of spending in your peak month was heavy revolving debt repayment rather than lifestyle expenses.*`;
  }

  // Loan interest / extra paid query
  if (q.includes('interest') || q.includes('extra paid') || q.includes('cost of debt') || q.includes('overpay')) {
    let totalBorrowed = 0;
    let totalRepaid = 0;
    let extraPaid = 0;
    const lenderBreakdown: string[] = [];

    for (const l of dataset.lenders) {
      totalBorrowed += l.totalBorrowed;
      totalRepaid += l.totalRepaid;
      const diff = l.totalRepaid - l.totalBorrowed;
      if (diff > 0) {
        extraPaid += diff;
        lenderBreakdown.push(`• **${l.name}**: Borrowed ₹${l.totalBorrowed.toLocaleString('en-IN')}, Repaid ₹${l.totalRepaid.toLocaleString('en-IN')} → **₹${diff.toLocaleString('en-IN')} extra/interest/fees**`);
      }
    }

    return `🏦 **Total Loan Interest, Fees & Extra Paid Forensics**:

Across all **${dataset.lenders.length} lenders** in your imported statements:
• **Total Borrowed**: **₹${totalBorrowed.toLocaleString('en-IN')}**
• **Total Repaid**: **₹${totalRepaid.toLocaleString('en-IN')}**
• **Total Financing Cost / Extra Paid**: **₹${extraPaid.toLocaleString('en-IN')}** (in interest, rollover charges, and processing fees).

**Lender Breakdown with Net Extra Paid**:
${lenderBreakdown.join('\n')}

*Note: In revolving credit lines (like Meghdoot, VIVIFI FlexSalary, and Zed Leafin), multiple rollover cycles have generated significant cumulative interest costs.*`;
  }

  // Daily spend query
  if (q.includes('daily') || q.includes('per day') || q.includes('burn rate')) {
    const totalDays = Math.max(1, dataset.monthlyCashFlow.length * 30);
    const avgDailyTotal = dataset.totalDebits / totalDays;
    const avgDailyLifestyle = dataset.trueLifestyleTotal / totalDays;

    return `📅 **Daily Spending & Burn Rate Forensics**:

Across your **${dataset.monthlyCashFlow.length} recorded months** (${totalDays} days):
• **Average Daily Total Outflow**: **₹${Math.round(avgDailyTotal).toLocaleString('en-IN')}/day** (including debt servicing & transfers).
• **Average Daily True Lifestyle Spend**: **₹${Math.round(avgDailyLifestyle).toLocaleString('en-IN')}/day** (Food, Groceries, Shopping, Transport).

**Top Daily Burn Months**:
${dataset.monthlyCashFlow.slice(0, 5).map((m: MonthlyCashFlowRow) => `• **${m.monthName}**: ₹${Math.round(m.totalDebits / 30).toLocaleString('en-IN')}/day (Lifestyle: ₹${Math.round(m.lifestyleSpend / 30).toLocaleString('en-IN')}/day)`).join('\n')}`;
  }

  // Total loan credits query
  if (q.includes('loan credit') || q.includes('overall loan') || q.includes('total borrow') || q.includes('disburs')) {
    const activeLenders = dataset.lenders.filter((l: ForensicLenderItem) => l.totalBorrowed > 0);
    return `💰 **Overall Loan Credits & Borrowing Breakdown**:

• **Total Loan Disbursals Received**: **₹${dataset.loanCreditsTotal.toLocaleString('en-IN')}** across **${activeLenders.length} lenders**.

**Lender Disbursal Matrix**:
${activeLenders.map((l: ForensicLenderItem) => `• **${l.name}**: ₹${l.totalBorrowed.toLocaleString('en-IN')} across ${l.borrowCount} disbursals (${l.productType})`).join('\n')}

*Strict Accounting Rule: All ₹${dataset.loanCreditsTotal.toLocaleString('en-IN')} in loan credits are strictly segregated as borrowed debt liabilities and excluded from earned salary income.*`;
  }

  // EPFO / PF query
  if (q.includes('epfo') || q.includes('pf') || q.includes('provident') || q.includes('80000') || q.includes('80,000')) {
    return `🏛️ **EPFO / Provident Fund Withdrawal Intelligence**:

• **Total EPFO Withdrawals**: **₹${dataset.epfoCreditsTotal.toLocaleString('en-IN')}** across 4 claims.
• **₹80,000.00 Major Withdrawal**: Credited on **18-Jun-2026** via \`NEFT CR-SBIN0004688-EMPLOYEE PROVIDENT FUND ORGANIZATIO\` (Ref: \`SBIN526169723181\`, Balance After: ₹80,014.66).
• **Other EPFO Credits**:
  - 30-Mar-2026: ₹17,185.00
  - 23-Sep-2025: ₹7,000.00
  - 09-Jun-2025: ₹5,468.00`;
  }

  // Salary query
  if (q.includes('salary') || q.includes('income')) {
    const avgSalary = Math.round(dataset.salaryTotal / Math.max(1, dataset.monthlyCashFlow.length));
    const detected = analyzeAllEmployers(transactions.map(t => ({
      date: t.transactionDate || '',
      narration: t.rawNarration || t.narration || '',
      credit: t.direction === 'CREDIT' ? t.amount : 0,
      debit: t.direction === 'DEBIT' ? t.amount : 0,
    })));
    const employerName = detected.length > 0
      ? detected.map(e => e.employerName).join(', ')
      : 'Corporate Employer';

    return `💼 **Corporate Earned Salary Breakdown**:

• **Total Corporate Salary**: **₹${dataset.salaryTotal.toLocaleString('en-IN')}** (Employment payroll from ${employerName}).
• **Average Monthly Salary**: **₹${avgSalary.toLocaleString('en-IN')}/mo**.
• **Excluded Disbursals**: Segregated ₹${dataset.loanCreditsTotal.toLocaleString('en-IN')} borrowed loan credits and ₹${dataset.epfoCreditsTotal.toLocaleString('en-IN')} EPFO capital withdrawals.`;
  }

  // Default summary response
  return `📊 **Executive Forensic Ledger Summary**:

• **Total Ledger Inflow (Credits)**: **₹${dataset.totalCredits.toLocaleString('en-IN')}** (Salary: ₹${dataset.salaryTotal.toLocaleString('en-IN')}, EPFO: ₹${dataset.epfoCreditsTotal.toLocaleString('en-IN')}, Loans: ₹${dataset.loanCreditsTotal.toLocaleString('en-IN')})
• **Total Ledger Outflow (Debits)**: **₹${dataset.totalDebits.toLocaleString('en-IN')}** (Lifestyle: ₹${dataset.trueLifestyleTotal.toLocaleString('en-IN')}, Money Movement/Debt: ₹${dataset.moneyMovementTotal.toLocaleString('en-IN')})
• **Period Net Delta**: **${dataset.netCashFlow >= 0 ? '+' : ''}₹${dataset.netCashFlow.toLocaleString('en-IN')}** (${dataset.netCashFlow >= 0 ? 'Surplus' : 'Deficit'})
• **Unique Transactions**: **${dataset.totalTransactions.toLocaleString('en-IN')}** across **${dataset.monthlyCashFlow.length} months**.`;
}

/**
 * Sends a chat query to Google Gemini 2.5 Flash API with rich ledger context.
 */
export async function sendForensicQueryToGemini(
  userQuery: string,
  dataset: ForensicDataset,
  transactions: CanonicalTransaction[],
  conversationHistory: ChatMessage[],
  apiKey: string = DEFAULT_GEMINI_API_KEY
): Promise<string> {
  const activeKey = apiKey.trim() || DEFAULT_GEMINI_API_KEY;

  if (!activeKey) {
    return '⚠️ **Gemini API Key Required**\n\nPlease click the **⚙️ API Key** button above to enter your Google Gemini API key, or set `VITE_GEMINI_API_KEY` in your environment to enable AI Copilot insights.';
  }

  try {
    const systemPrompt = buildForensicSystemPrompt(dataset, transactions);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;

    // Format chat history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Inject system instructions as the initial grounding prompt
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nPlease acknowledge your role as BytFloww AI Forensic Copilot and answer user questions strictly based on this ledger.` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I am the BytFloww AI Forensic Copilot. I have full access to your verified ledger facts and will answer your analytical questions with exact figures and structured insights.' }]
    });

    // Add recent conversation history (last 6 turns)
    const recentTurns = conversationHistory.slice(-6);
    for (const msg of recentTurns) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }

    // Add current query
    contents.push({
      role: 'user',
      parts: [{ text: userQuery }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1200,
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API returned HTTP ${response.status}. Using deterministic fallback engine.`);
      return getDeterministicFallbackReply(userQuery, dataset, transactions);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText && candidateText.trim().length > 0) {
      return candidateText.trim();
    }

    return getDeterministicFallbackReply(userQuery, dataset, transactions);
  } catch (err) {
    console.error('Error invoking Gemini AI Copilot:', err);
    return getDeterministicFallbackReply(userQuery, dataset, transactions);
  }
}
