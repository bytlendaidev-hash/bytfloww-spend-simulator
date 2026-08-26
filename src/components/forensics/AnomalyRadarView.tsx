import React, { useMemo } from 'react';
import { ForensicDataset } from '../../engine/statementForensicsData';
import { CanonicalTransaction } from '../../types';
import { detectForensicRedFlags, ForensicAnomalyRedFlag } from '../../engine/forensicsAdvancedEngine';

interface AnomalyRadarViewProps {
  dataset: ForensicDataset;
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const AnomalyRadarView: React.FC<AnomalyRadarViewProps> = ({
  dataset,
  transactions,
  isDark,
}) => {
  const redFlags = useMemo(() => {
    return detectForensicRedFlags(transactions, dataset);
  }, [transactions, dataset]);

  const criticalCount = redFlags.filter(f => f.severity === 'CRITICAL').length;
  const highCount = redFlags.filter(f => f.severity === 'HIGH').length;

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP RADAR HUD ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
          <div className="text-[10px] font-bold uppercase text-rose-400">Critical Red Flags</div>
          <div className="text-2xl font-black font-mono mt-1 text-rose-400">{criticalCount} Detected</div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Immediate Risk Alerts</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">High / Medium Warnings</div>
          <div className="text-2xl font-black font-mono mt-1 text-amber-400">{highCount + (redFlags.length - criticalCount - highCount)} Detected</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Friction & Leakages</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">Scanned Ledger Transactions</div>
          <div className="text-2xl font-black font-mono mt-1 text-indigo-400">{transactions.length.toLocaleString('en-IN')} Txns</div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">100% Automated Coverage</div>
        </div>
      </div>

      {/* ── RED-FLAG SCAN RESULTS ────────────────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>🚨</span>
              <span>Automated Forensic Red-Flag & Suspicious Pattern Radar</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Pattern-matching scanner detecting rapid paycheck drains, cross-lender debt rollovers, and friction micro-leakages.
            </p>
          </div>
        </div>

        {redFlags.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="text-3xl">✅</div>
            <div className="text-sm font-bold text-emerald-400">Zero Critical Anomalies Detected</div>
            <div className="text-xs text-slate-400">Your ledger patterns are within expected variance bounds.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {redFlags.map((flag) => (
              <div
                key={flag.id}
                className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
                  flag.severity === 'CRITICAL'
                    ? (isDark ? 'bg-rose-950/25 border-rose-500/30' : 'bg-rose-50 border-rose-200')
                    : flag.severity === 'HIGH'
                    ? (isDark ? 'bg-amber-950/25 border-amber-500/30' : 'bg-amber-50 border-amber-200')
                    : (isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200')
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {flag.type === 'PAYCHECK_DRAIN' ? '⚡' : flag.type === 'DEBT_DOMINO' ? '🔄' : '🔍'}
                    </span>
                    <div>
                      <h3 className="text-xs font-black">{flag.title}</h3>
                      <div className="text-[10px] opacity-70 font-mono">
                        Date / Frequency: {flag.dateOrFrequency} • Entity: {flag.counterparty}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-rose-400">
                      ₹{flag.amount.toLocaleString('en-IN')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      flag.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : flag.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {flag.severity}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed opacity-90">{flag.description}</p>

                <div className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 ${
                  isDark ? 'bg-black/30 text-emerald-300' : 'bg-white text-emerald-800 border border-emerald-200'
                }`}>
                  <span>💡</span>
                  <span><strong>Recommended Fix:</strong> {flag.recommendedFix}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
