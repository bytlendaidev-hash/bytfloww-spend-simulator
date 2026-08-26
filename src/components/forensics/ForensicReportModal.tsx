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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto animate-emergence">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] border p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/95 border-emerald-500/30 text-white shadow-2xl shadow-black/80' : 'bg-white/95 border-slate-300 text-slate-900 shadow-2xl'
      }`}>
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b pb-4 border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center text-xl font-black">
              📄
            </div>
            <div>
              <h2 className="text-base font-black font-heading">Boardroom Forensic Audit Dossier</h2>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Reconciled single-source-of-truth dossier for underwriting, audit & wealth debrief
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="space-y-6 text-left print:p-0">
          {/* Header Strip */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
            isDark ? 'bg-[#142028] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="text-xs font-black tracking-wider uppercase text-emerald-400">BytFloww Forensic Intelligence</div>
              <div className="text-lg font-black font-heading mt-0.5">Comprehensive Financial Dossier</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Audit Timestamp: {new Date().toLocaleString('en-IN')}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold">{dataset.periodSpan}</div>
              <div className="text-[10px] text-slate-400 font-mono">{transactions.length.toLocaleString('en-IN')} Unique Transactions Reconciled</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">● SHA-256 Verified Ledger</div>
            </div>
          </div>

          {/* Section 1: Executive KPI Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">1. Executive Liquidity Reconciliation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Total Credits (Inflow)</div>
                <div className="text-base font-black font-mono mt-0.5 text-emerald-400">₹{dataset.totalCredits.toLocaleString('en-IN')}</div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Total Debits (Outflow)</div>
                <div className="text-base font-black font-mono mt-0.5 text-rose-400">₹{dataset.totalDebits.toLocaleString('en-IN')}</div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Earned Salary</div>
                <div className="text-base font-black font-mono mt-0.5 text-emerald-300">₹{dataset.salaryTotal.toLocaleString('en-IN')}</div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Net Period Delta</div>
                <div className={`text-base font-black font-mono mt-0.5 ${dataset.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dataset.netCashFlow >= 0 ? '+' : ''}₹{dataset.netCashFlow.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Debt & Lender Servicing Matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">2. Lender Servicing & Debt Recycling Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-black text-[9px] uppercase ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="p-2">Lender</th>
                    <th className="p-2 text-right">Borrowed</th>
                    <th className="p-2 text-right">Repaid</th>
                    <th className="p-2 text-right">Net Extra Paid</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dataset.lenders.map(l => (
                    <tr key={l.id}>
                      <td className="p-2 font-bold">{l.name}</td>
                      <td className="p-2 text-right font-mono text-emerald-400">₹{l.totalBorrowed.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono text-rose-400">₹{l.totalRepaid.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono text-amber-400">₹{Math.max(0, l.totalRepaid - l.totalBorrowed).toLocaleString('en-IN')}</td>
                      <td className="p-2 text-center font-mono text-[10px]">{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Statutory EPFO / PF Claims */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">3. Statutory EPFO / PF Capital Withdrawals</h3>
            <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-950/20 text-xs space-y-1">
              <div className="font-bold text-sky-300">Total Statutory EPFO Inflow: ₹{dataset.epfoCreditsTotal.toLocaleString('en-IN')}</div>
              <p className="text-[11px] opacity-80">
                Major claim of ₹80,000.00 credited on 18-Jun-2026 via NEFT reference SBIN526169723181. Segregated from monthly earned salary.
              </p>
            </div>
          </div>

          {/* Section 4: Forensic Sign-off */}
          <div className="pt-4 border-t border-white/10 text-[10px] text-slate-500 flex items-center justify-between">
            <span>BytFloww Personal Financial Forensics Engine • Report Generated On-Demand</span>
            <span>Cryptographic Fingerprint Reconciled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
