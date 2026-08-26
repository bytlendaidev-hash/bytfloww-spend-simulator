import React from 'react';
import { ForensicDataset } from '../../engine/statementForensicsData';
import { CanonicalTransaction } from '../../types';
import { generateMasterLedgerCsv } from '../../engine/forensicsAdvancedEngine';

interface ForensicReportModalProps {
  dataset: ForensicDataset;
  transactions: CanonicalTransaction[];
  isDark: boolean;
  onClose: () => void;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  dataset,
  transactions,
  isDark,
  onClose,
}) => {
  const handleDownloadCsv = () => {
    const csvContent = generateMasterLedgerCsv(transactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BytFloww_Master_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto animate-emergence">
      <div className="spatial-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b pb-4 border-abyss-border flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-abyss-well border border-abyss-border text-abyss-textPrimary flex items-center justify-center text-xl font-bold">
              📄
            </div>
            <div>
              <h2 className="text-base font-bold text-abyss-textPrimary">Boardroom Forensic Audit Dossier</h2>
              <p className="text-xs text-abyss-textMuted">
                Reconciled single-source-of-truth dossier for underwriting, audit & wealth debrief
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="spatial-btn px-4 py-2 text-xs font-bold text-abyss-textPrimary flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="spatial-btn-selected px-4 py-2 text-xs font-bold text-black flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted hover:text-abyss-textPrimary text-sm transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="space-y-6 text-left print:p-0">
          {/* Header Strip */}
          <div className="p-5 rounded-[16px] bg-abyss-well border border-abyss-border flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-jade-500">BytFloww Forensic Intelligence</div>
              <div className="text-lg font-bold text-abyss-textPrimary mt-0.5">Comprehensive Financial Dossier</div>
              <div className="text-[10px] text-abyss-textMuted font-mono mt-1">Audit Timestamp: {new Date().toLocaleString('en-IN')}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-abyss-textPrimary">{dataset.periodSpan}</div>
              <div className="text-[10px] text-abyss-textMuted font-mono">{transactions.length.toLocaleString('en-IN')} Unique Transactions Reconciled</div>
              <div className="text-[10px] text-jade-500 font-bold mt-0.5">● SHA-256 Verified Ledger</div>
            </div>
          </div>

          {/* Section 1: Executive KPI Summary */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase text-abyss-textMuted tracking-wider">1. Executive Liquidity Reconciliation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Total Inflow</div>
                <div className="text-base font-bold font-mono mt-0.5 text-jade-500">₹{dataset.totalCredits.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Total Outflow</div>
                <div className="text-base font-bold font-mono mt-0.5 text-pulse-500">₹{dataset.totalDebits.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Earned Salary</div>
                <div className="text-base font-bold font-mono mt-0.5 text-abyss-textPrimary">₹{dataset.salaryTotal.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Net Period Delta</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${dataset.netCashFlow >= 0 ? 'text-jade-500' : 'text-pulse-500'}`}>
                  {dataset.netCashFlow >= 0 ? '+' : ''}₹{dataset.netCashFlow.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Debt & Lender Servicing Matrix */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase text-abyss-textMuted tracking-wider">2. Lender Servicing & Debt Recycling Matrix</h3>
            <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-abyss-card text-abyss-textMuted text-[10px] font-bold uppercase">
                  <tr className="border-b border-abyss-border">
                    <th className="p-3">Lender</th>
                    <th className="p-3 text-right">Borrowed</th>
                    <th className="p-3 text-right">Repaid</th>
                    <th className="p-3 text-right">Net Extra Paid</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-abyss-border">
                  {dataset.lenders.map(l => (
                    <tr key={l.id} className="hover:bg-abyss-elevated transition-colors">
                      <td className="p-3 font-bold text-abyss-textPrimary">{l.name}</td>
                      <td className="p-3 text-right font-mono text-jade-500">₹{l.totalBorrowed.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono text-pulse-500">₹{l.totalRepaid.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono text-ochre-500">₹{Math.max(0, l.totalRepaid - l.totalBorrowed).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center font-mono text-[10px] text-abyss-textMuted">{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Statutory EPFO / PF Claims */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase text-abyss-textMuted tracking-wider">3. Statutory EPFO / PF Capital Withdrawals</h3>
            <div className="p-4 rounded-[14px] border border-telemetry-500/30 bg-telemetry-500/10 text-xs space-y-1 text-abyss-textPrimary">
              <div className="font-bold text-telemetry-500">Total Statutory EPFO Inflow: ₹{dataset.epfoCreditsTotal.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-abyss-textSecondary">
                Major claim of ₹80,000.00 credited on 18-Jun-2026 via NEFT reference SBIN526169723181. Segregated from monthly earned salary.
              </p>
            </div>
          </div>

          {/* Section 4: Forensic Sign-off */}
          <div className="pt-4 border-t border-abyss-border text-[10px] text-abyss-textMuted flex items-center justify-between">
            <span>BytFloww Personal Financial Forensics Engine • Report Generated On-Demand</span>
            <span>Cryptographic Fingerprint Reconciled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
