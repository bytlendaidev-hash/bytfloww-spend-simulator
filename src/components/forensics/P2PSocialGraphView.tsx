import React, { useState, useMemo } from 'react';
import { CanonicalTransaction } from '../../types';
import { calculateP2PReciprocalMatrix, P2PReciprocalCounterparty } from '../../engine/forensicsAdvancedEngine';
import { BrandLogoBadge } from './BrandLogoBadge';

interface P2PSocialGraphViewProps {
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const P2PSocialGraphView: React.FC<P2PSocialGraphViewProps> = ({
  transactions,
  isDark,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'OWED_TO_YOU' | 'YOU_OWE' | 'RECIPROCATED'>('ALL');
  const [selectedPeer, setSelectedPeer] = useState<P2PReciprocalCounterparty | null>(null);

  const p2pMatrix = useMemo(() => {
    return calculateP2PReciprocalMatrix(transactions);
  }, [transactions]);

  const filteredPeers = useMemo(() => {
    if (filterMode === 'OWED_TO_YOU') {
      return p2pMatrix.filter(p => p.posture === 'OWED_TO_YOU');
    }
    if (filterMode === 'YOU_OWE') {
      return p2pMatrix.filter(p => p.posture === 'YOU_OWE');
    }
    if (filterMode === 'RECIPROCATED') {
      return p2pMatrix.filter(p => p.posture === 'RECIPROCATED_BALANCED');
    }
    return p2pMatrix;
  }, [p2pMatrix, filterMode]);

  const totalOwedToYou = useMemo(() => {
    return p2pMatrix
      .filter(p => p.netBalance < 0)
      .reduce((s, p) => s + Math.abs(p.netBalance), 0);
  }, [p2pMatrix]);

  const totalYouOwe = useMemo(() => {
    return p2pMatrix
      .filter(p => p.netBalance > 0)
      .reduce((s, p) => s + p.netBalance, 0);
  }, [p2pMatrix]);

  const totalP2PVolume = useMemo(() => {
    return p2pMatrix.reduce((s, p) => s + p.totalSent + p.totalReceived, 0);
  }, [p2pMatrix]);

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP RECIPROCAL SUMMARY HUD ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-jade-900/20 border-jade-500/30' : 'bg-jade-50 border-jade-200'}`}>
          <div className="text-[10px] font-bold uppercase text-jade-500">Potential Owed To You</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-jade-500">
            ₹{totalOwedToYou.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-jade-500/80 mt-0.5">Net capital sent to peers</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-pulse-900/20 border-pulse-500/30' : 'bg-pulse-50 border-pulse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-pulse-500">Net Surplus Received</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-pulse-500">
            ₹{totalYouOwe.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-pulse-500/80 mt-0.5">Received more than sent</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-synapse-900/20 border-synapse-500/30' : 'bg-synapse-50 border-synapse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-synapse-400 light:text-synapse-700">Total P2P Gross Volume</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-synapse-400 light:text-synapse-700">
            ₹{totalP2PVolume.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-synapse-400/80 mt-0.5">Combined sent & received</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="text-[10px] font-bold uppercase text-ochre-500">Active Counterparties</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-ochre-500">
            {p2pMatrix.length} Individuals
          </div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">Friends, family & peers</div>
        </div>
      </div>

      {/* ── RECIPROCAL BALANCE MATRIX TABLE ───────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
              <span>👥</span>
              <span>Counterparty P2P Reciprocal Matrix & "Owed Money" Radar</span>
            </h2>
            <p className="text-xs mt-0.5 text-abyss-textMuted">
              Tracking two-way monetary reciprocity across {p2pMatrix.length} individual friends, family members, and colleagues.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="p-1 rounded-2xl border flex gap-1 flex-wrap bg-abyss-well border-abyss-border">
            {[
              { id: 'ALL', label: `All (${p2pMatrix.length})` },
              { id: 'OWED_TO_YOU', label: `Owed to You (${p2pMatrix.filter(p => p.posture === 'OWED_TO_YOU').length})` },
              { id: 'YOU_OWE', label: `Surplus Recvd (${p2pMatrix.filter(p => p.posture === 'YOU_OWE').length})` },
              { id: 'RECIPROCATED', label: `Balanced (${p2pMatrix.filter(p => p.posture === 'RECIPROCATED_BALANCED').length})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterMode === f.id
                    ? 'bg-synapse-500 text-white shadow-solid-sm'
                    : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b font-black text-[10px] uppercase tracking-wider border-abyss-border text-abyss-textMuted">
                <th className="p-3">Counterparty</th>
                <th className="p-3 text-right">Total Sent (Debits)</th>
                <th className="p-3 text-right">Total Received (Credits)</th>
                <th className="p-3 text-right">Net Position</th>
                <th className="p-3 text-center">Reciprocal %</th>
                <th className="p-3 text-center">Txns</th>
                <th className="p-3 text-center">Radar Posture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-abyss-border">
              {filteredPeers.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedPeer(selectedPeer?.id === p.id ? null : p)}
                  className={`cursor-pointer transition-colors ${
                    selectedPeer?.id === p.id
                      ? 'bg-synapse-500/15'
                      : 'hover:bg-abyss-well'
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <BrandLogoBadge entityName={p.name} size="sm" />
                      <div>
                        <div className="font-bold text-abyss-textPrimary">{p.name}</div>
                        <div className="text-[10px] text-abyss-textMuted font-mono">Last: {p.lastDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-pulse-500">
                    -₹{p.totalSent.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-jade-500">
                    +₹{p.totalReceived.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-sm">
                    {p.netBalance < 0 ? (
                      <span className="text-jade-500 font-bold">
                        +₹{Math.abs(p.netBalance).toLocaleString('en-IN')} (Owed)
                      </span>
                    ) : p.netBalance > 0 ? (
                      <span className="text-pulse-500 font-bold">
                        -₹{p.netBalance.toLocaleString('en-IN')} (Received)
                      </span>
                    ) : (
                      <span className="text-abyss-textMuted font-bold">₹0 (Even)</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-abyss-canvas overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-synapse-500" 
                          style={{ width: `${Math.max(5, p.reciprocalRatio)}%` }} 
                        />
                      </div>
                      <span className="font-mono text-[10px] text-abyss-textMuted">{p.reciprocalRatio}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono text-[11px] text-abyss-textSecondary">
                    {p.totalTransactions} ({p.sentCount}↑ {p.receivedCount}↓)
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      p.posture === 'OWED_TO_YOU'
                        ? 'bg-jade-500/20 text-jade-500 border border-jade-500/30'
                        : p.posture === 'YOU_OWE'
                        ? 'bg-pulse-500/20 text-pulse-500 border border-pulse-500/30'
                        : 'bg-abyss-well text-abyss-textMuted border border-abyss-border'
                    }`}>
                      {p.posture.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── COUNTERPARTY TRANSACTION DRILLDOWN DRAWER ─────────────────────── */}
      {selectedPeer && (
        <div className={`p-5 sm:p-6 ${cardCls} space-y-4 animate-fade-in border-synapse-500/40`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <BrandLogoBadge entityName={selectedPeer.name} size="md" />
              <div>
                <h3 className="text-sm font-black font-heading text-abyss-textPrimary">{selectedPeer.name} — Transaction Timeline</h3>
                <div className="text-[10px] text-abyss-textMuted font-mono">
                  {selectedPeer.totalTransactions} recorded transfers between {selectedPeer.firstDate} and {selectedPeer.lastDate}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPeer(null)}
              className="text-xs text-abyss-textMuted hover:text-abyss-textPrimary px-2.5 py-1 rounded-lg border border-abyss-border"
            >
              Close Drawer ✕
            </button>
          </div>

          <div className="space-y-2">
            {selectedPeer.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl border flex items-center justify-between flex-wrap gap-2 bg-abyss-well border-abyss-border"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-abyss-textPrimary">{tx.transactionDate}</div>
                  <div className="text-[10px] text-abyss-textMuted max-w-md truncate">{tx.rawNarration}</div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-black text-xs ${tx.direction === 'CREDIT' ? 'text-jade-500' : 'text-pulse-500'}`}>
                    {tx.direction === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-abyss-textMuted">{tx.channel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
