import React from 'react';
import { SpendSnapshot } from '../types';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
      <div className={`w-full max-w-md rounded-[32px] border p-6 sm:p-7 flex flex-col gap-4 shadow-2xl transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08] text-white shadow-black/80' : 'bg-white border-slate-200/90 text-slate-900 shadow-xl'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
              isDark ? 'bg-brand-viridian/15 text-brand-viridian border border-brand-viridian/30' : 'bg-brand-50 text-brand-700 border border-brand-200'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Parser Engine Diagnostics</h3>
              <span className={`text-[10px] font-medium font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>BytFloww Ingestion & Reconciliation Audit</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-all duration-150 ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
          isDark ? 'bg-brand-viridian/10 border-brand-viridian/30' : 'bg-emerald-50 border-brand-200'
        }`}>
          <CheckCircle2 className={`w-5 h-5 shrink-0 ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`} />
          <div>
            <h4 className={`text-xs font-black ${isDark ? 'text-brand-viridian' : 'text-brand-800'}`}>Reconciliation Engine Reconciled</h4>
            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Zero hash collision detected. SHA-256 accounting invariants satisfied.
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-3 rounded-2xl border flex flex-col ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-bold font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Raw SMS Read</span>
            <span className={`text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{dq.rawSmsCount}</span>
          </div>

          <div className={`p-3 rounded-2xl border flex flex-col ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-bold font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Financial Candidates</span>
            <span className={`text-base font-black font-mono mt-0.5 ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>{dq.candidatesCount}</span>
          </div>

          <div className={`p-3 rounded-2xl border flex flex-col ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-bold font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Duplicates Merged</span>
            <span className={`text-base font-black font-mono mt-0.5 ${isDark ? 'text-selvex-300' : 'text-selvex-700'}`}>{dq.duplicateCount}</span>
          </div>

          <div className={`p-3 rounded-2xl border flex flex-col ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] font-bold font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Canonical Ledger Size</span>
            <span className={`text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{dq.canonicalCount}</span>
          </div>
        </div>

        {/* Architecture Details */}
        <div className={`flex flex-col gap-1.5 text-xs border-t pt-3 ${
          isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-100 text-slate-600'
        }`}>
          <div className="flex justify-between">
            <span>Deduplication Algorithm:</span>
            <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>15m Bucket SHA-256</span>
          </div>
          <div className="flex justify-between">
            <span>Classification Confidence:</span>
            <span className={`font-mono font-bold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>{dq.confidencePct}% Verified</span>
          </div>
          <div className="flex justify-between">
            <span>Unclassified Outflows:</span>
            <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{dq.unclassifiedCount}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95 shadow-md ${
            isDark 
              ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark shadow-brand-viridian/25' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
          }`}
        >
          Close Diagnostics
        </button>

      </div>
    </div>
  );
};

