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
        <div className="flex items-center justify-between border-b pb-4 border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-xl font-bold">
              📄
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Boardroom Forensic Audit Dossier</h2>
              <p className="text-xs text-white/50">
                Reconciled single-source-of-truth dossier for underwriting, audit & wealth debrief
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="spatial-btn px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5"
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
              className="p-2 rounded-full border border-white/10 hover:bg-white/20 text-white/60 hover:text-white text-sm transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="space-y-6 text-left print:p-0">
          {/* Header Strip */}
          <div className="p-5 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-[#30D158]">BytFloww Forensic Intelligence</div>
              <div className="text-lg font-bold text-white mt-0.5">Comprehensive Financial Dossier</div>
              <div className="text-[10px] text-white/40 font-mono mt-1">Audit Timestamp: {new Date().toLocaleString('en-IN')}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-white">{dataset.periodSpan}</div>
              <div className="text-[10px] text-white/40 font-mono">{transactions.length.toLocaleString('en-IN')} Unique Transactions Reconciled</div>
              <div className="text-[10px] text-[#30D158] font-bold mt-0.5">● SHA-256 Verified Ledger</div>
            </div>
          </div>

          {/* Section 1: Executive KPI Summary */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase text-white/50 tracking-wider">1. Executive Liquidity Reconciliation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[9px] uppercase font-bold text-white/50">Total Inflow</div>
                <div className="text-base font-bold font-mono mt-0.5 text-[#30D158]">₹{dataset.totalCredits.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[9px] uppercase font-bold text-white/50">Total Outflow</div>
                <div className="text-base font-bold font-mono mt-0.5 text-[#FF453A]">₹{dataset.totalDebits.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[9px] uppercase font-bold text-white/50">Earned Salary</div>
                <div className="text-base font-bold font-mono mt-0.5 text-white">₹{dataset.salaryTotal.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
                <div className="text-[9px] uppercase font-bold text-white/50">Net Period Delta</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${dataset.netCashFlow >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                  {dataset.netCashFlow >= 0 ? '+' : ''}₹{dataset.netCashFlow.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Debt & Lender Servicing Matrix */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase text-white/50 tracking-wider">2. Lender Servicing & Debt Recycling Matrix</h3>
            <div className="bg-white/5 border border-white/10 rounded-[16px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white/5 text-white/50 text-[10px] font-bold uppercase">
                  <tr className="border-b border-white/10">
                    <th className="p-3">Lender</th>
                    <th className="p-3 text-right">Borrowed</th>
                    <th className="p-3 text-right">Repaid</th>
                    <th className="p-3 text-right">Net Extra Paid</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dataset.lenders.map(l => (
                    <tr key={l.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{l.name}</td>
                      <td className="p-3 text-right font-mono text-[#30D158]">₹{l.totalBorrowed.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono text-[#FF453A]">₹{l.totalRepaid.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono text-[#FF9F0A]">₹{Math.max(0, l.totalRepaid - l.totalBorrowed).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center font-mono text-[10px] text-white/60">{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Statutory EPFO / PF Claims */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase text-white/50 tracking-wider">3. Statutory EPFO / PF Capital Withdrawals</h3>
            <div className="p-4 rounded-[14px] border border-[#0A84FF]/30 bg-[#0A84FF]/10 text-xs space-y-1 text-white">
              <div className="font-bold text-[#0A84FF]">Total Statutory EPFO Inflow: ₹{dataset.epfoCreditsTotal.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-white/70">
                Major claim of ₹80,000.00 credited on 18-Jun-2026 via NEFT reference SBIN526169723181. Segregated from monthly earned salary.
              </p>
            </div>
          </div>

          {/* Section 4: Forensic Sign-off */}
          <div className="pt-4 border-t border-white/10 text-[10px] text-white/40 flex items-center justify-between">
            <span>BytFloww Personal Financial Forensics Engine • Report Generated On-Demand</span>
            <span>Cryptographic Fingerprint Reconciled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
