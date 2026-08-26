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

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP RADAR HUD ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-pulse-900/20 border-pulse-500/30' : 'bg-pulse-50 border-pulse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-pulse-500">Critical Red Flags</div>
          <div className="text-2xl font-black font-mono mt-1 text-pulse-500">{criticalCount} Detected</div>
          <div className="text-[10px] text-pulse-500/80 mt-0.5">Immediate Risk Alerts</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="text-[10px] font-bold uppercase text-ochre-500">High / Medium Warnings</div>
          <div className="text-2xl font-black font-mono mt-1 text-ochre-500">{highCount + (redFlags.length - criticalCount - highCount)} Detected</div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">Friction & Leakages</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-synapse-900/20 border-synapse-500/30' : 'bg-synapse-50 border-synapse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-synapse-400 light:text-synapse-700">Scanned Ledger Transactions</div>
          <div className="text-2xl font-black font-mono mt-1 text-synapse-400 light:text-synapse-700">{transactions.length.toLocaleString('en-IN')} Txns</div>
          <div className="text-[10px] text-synapse-400/80 mt-0.5">100% Automated Coverage</div>
        </div>
      </div>

      {/* ── RED-FLAG SCAN RESULTS ────────────────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
              <span>🚨</span>
              <span>Automated Forensic Red-Flag & Suspicious Pattern Radar</span>
            </h2>
            <p className="text-xs mt-0.5 text-abyss-textMuted">
              Pattern-matching scanner detecting rapid paycheck drains, cross-lender debt rollovers, and friction micro-leakages.
            </p>
          </div>
        </div>

        {redFlags.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="text-3xl">✅</div>
            <div className="text-sm font-bold text-jade-500">Zero Critical Anomalies Detected</div>
            <div className="text-xs text-abyss-textMuted">Your ledger patterns are within expected variance bounds.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {redFlags.map((flag) => (
              <div
                key={flag.id}
                className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
                  flag.severity === 'CRITICAL'
                    ? 'bg-pulse-500/10 border-pulse-500/30'
                    : flag.severity === 'HIGH'
                    ? 'bg-ochre-500/10 border-ochre-500/30'
                    : 'bg-abyss-well border-abyss-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {flag.type === 'PAYCHECK_DRAIN' ? '⚡' : flag.type === 'DEBT_DOMINO' ? '🔄' : '🔍'}
                    </span>
                    <div>
                      <h3 className="text-xs font-black text-abyss-textPrimary">{flag.title}</h3>
                      <div className="text-[10px] text-abyss-textMuted font-mono">
                        Date / Frequency: {flag.dateOrFrequency} • Entity: {flag.counterparty}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-pulse-500">
                      ₹{flag.amount.toLocaleString('en-IN')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      flag.severity === 'CRITICAL'
                        ? 'bg-pulse-500/20 text-pulse-500 border border-pulse-500/30'
                        : flag.severity === 'HIGH'
                        ? 'bg-ochre-500/20 text-ochre-500 border border-ochre-500/30'
                        : 'bg-synapse-500/20 text-synapse-400 light:text-synapse-700 border border-synapse-500/30'
                    }`}>
                      {flag.severity}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-abyss-textSecondary">{flag.description}</p>

                <div className="p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 bg-jade-500/10 border border-jade-500/20 text-jade-500">
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
