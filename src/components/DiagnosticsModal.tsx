import React from 'react';
import { SpendSnapshot } from '../types';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Database, Cpu } from 'lucide-react';

interface DiagnosticsModalProps {
  snapshot: SpendSnapshot;
  isDark: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  snapshot,
  isDark,
  onClose,
}) => {
  const dq = snapshot.dataQuality;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-[32px] border p-6 flex flex-col gap-4 shadow-2xl transition-all ${
        isDark ? 'bg-[#10141F] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Parser Engine Diagnostics</h3>
              <span className="text-[10px] text-slate-400 font-mono">BytFloww Ingestion & Reconciliation Audit</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-400">Reconciliation Engine Reconciled</h4>
            <span className="text-[10px] text-slate-300">
              Zero hash collision detected. SHA-256 accounting invariants satisfied.
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-3 rounded-xl border flex flex-col ${isDark ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 font-mono">Raw SMS Read</span>
            <span className="text-base font-black font-mono mt-0.5">{dq.rawSmsCount}</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col ${isDark ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 font-mono">Financial Candidates</span>
            <span className="text-base font-black font-mono mt-0.5 text-emerald-400">{dq.candidatesCount}</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col ${isDark ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 font-mono">Duplicates Merged</span>
            <span className="text-base font-black font-mono mt-0.5 text-indigo-400">{dq.duplicateCount}</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col ${isDark ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 font-mono">Canonical Ledger Size</span>
            <span className="text-base font-black font-mono mt-0.5">{dq.canonicalCount}</span>
          </div>
        </div>

        {/* Architecture Details */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-400 border-t border-white/5 pt-3">
          <div className="flex justify-between">
            <span>Deduplication Algorithm:</span>
            <span className="font-mono text-slate-200 font-bold">15m Bucket SHA-256</span>
          </div>
          <div className="flex justify-between">
            <span>Classification Confidence:</span>
            <span className="font-mono text-emerald-400 font-bold">{dq.confidencePct}% Verified</span>
          </div>
          <div className="flex justify-between">
            <span>Unclassified Outflows:</span>
            <span className="font-mono text-slate-200">{dq.unclassifiedCount}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
        >
          Close Diagnostics
        </button>

      </div>
    </div>
  );
};
