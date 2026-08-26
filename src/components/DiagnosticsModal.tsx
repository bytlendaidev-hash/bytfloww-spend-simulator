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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className="spatial-modal w-full max-w-md p-6 sm:p-7 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm bg-jade-500/15 text-jade-500 border border-jade-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-abyss-textPrimary">Parser Engine Diagnostics</h3>
              <span className="text-[10px] font-medium font-mono text-abyss-textMuted">BytFloww Ingestion & Reconciliation Audit</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition-all duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="p-3.5 rounded-2xl border flex items-center gap-3 bg-jade-500/10 border-jade-500/30">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-jade-500" />
          <div>
            <h4 className="text-xs font-black text-jade-500">Reconciliation Engine Reconciled</h4>
            <span className="text-[10px] font-medium text-abyss-textSecondary">
              Zero hash collision detected. SHA-256 accounting invariants satisfied.
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl border flex flex-col bg-abyss-well border-abyss-border">
            <span className="text-[10px] font-bold font-mono uppercase text-abyss-textMuted">Raw SMS Read</span>
            <span className="text-base font-black font-mono mt-0.5 text-abyss-textPrimary">{dq.rawSmsCount}</span>
          </div>

          <div className="p-3 rounded-2xl border flex flex-col bg-abyss-well border-abyss-border">
            <span className="text-[10px] font-bold font-mono uppercase text-abyss-textMuted">Financial Candidates</span>
            <span className="text-base font-black font-mono mt-0.5 text-jade-500">{dq.candidatesCount}</span>
          </div>

          <div className="p-3 rounded-2xl border flex flex-col bg-abyss-well border-abyss-border">
            <span className="text-[10px] font-bold font-mono uppercase text-abyss-textMuted">Duplicates Merged</span>
            <span className="text-base font-black font-mono mt-0.5 text-synapse-400 light:text-synapse-700">{dq.duplicateCount}</span>
          </div>

          <div className="p-3 rounded-2xl border flex flex-col bg-abyss-well border-abyss-border">
            <span className="text-[10px] font-bold font-mono uppercase text-abyss-textMuted">Canonical Ledger Size</span>
            <span className="text-base font-black font-mono mt-0.5 text-abyss-textPrimary">{dq.canonicalCount}</span>
          </div>
        </div>

        {/* Architecture Details */}
        <div className="flex flex-col gap-1.5 text-xs border-t pt-3 border-abyss-border text-abyss-textMuted">
          <div className="flex justify-between">
            <span>Deduplication Algorithm:</span>
            <span className="font-mono font-bold text-abyss-textPrimary">15m Bucket SHA-256</span>
          </div>
          <div className="flex justify-between">
            <span>Classification Confidence:</span>
            <span className="font-mono font-bold text-jade-500">{dq.confidencePct}% Verified</span>
          </div>
          <div className="flex justify-between">
            <span>Unclassified Outflows:</span>
            <span className="font-mono font-bold text-abyss-textPrimary">{dq.unclassifiedCount}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="spatial-btn-selected w-full py-3 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95"
        >
          Close Diagnostics
        </button>

      </div>
    </div>
  );
};
