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

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP RECIPROCAL SUMMARY HUD ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[10px] font-bold uppercase text-emerald-400">Potential Owed To You</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-emerald-400">
            ₹{totalOwedToYou.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Net capital sent to peers</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
          <div className="text-[10px] font-bold uppercase text-rose-400">Net Surplus Received</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-rose-400">
            ₹{totalYouOwe.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Received more than sent</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">Total P2P Gross Volume</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-indigo-400">
            ₹{totalP2PVolume.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">Combined sent & received</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">Active Counterparties</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-amber-400">
            {p2pMatrix.length} Individuals
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Friends, family & peers</div>
        </div>
      </div>

      {/* ── RECIPROCAL BALANCE MATRIX TABLE ───────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>👥</span>
              <span>Counterparty P2P Reciprocal Matrix & "Owed Money" Radar</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tracking two-way monetary reciprocity across {p2pMatrix.length} individual friends, family members, and colleagues.
            </p>
          </div>

          {/* Filter Pills */}
          <div className={`p-1 rounded-2xl border flex gap-1 flex-wrap ${isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
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
              <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="p-3">Counterparty</th>
                <th className="p-3 text-right">Total Sent (Debits)</th>
                <th className="p-3 text-right">Total Received (Credits)</th>
                <th className="p-3 text-right">Net Position</th>
                <th className="p-3 text-center">Reciprocal %</th>
                <th className="p-3 text-center">Txns</th>
                <th className="p-3 text-center">Radar Posture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredPeers.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedPeer(selectedPeer?.id === p.id ? null : p)}
                  className={`cursor-pointer transition-colors ${
                    selectedPeer?.id === p.id
                      ? (isDark ? 'bg-indigo-950/40' : 'bg-indigo-50/80')
                      : (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50')
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <BrandLogoBadge entityName={p.name} size="sm" />
                      <div>
                        <div className="font-bold">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Last: {p.lastDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-rose-400">
                    -₹{p.totalSent.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    +₹{p.totalReceived.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-sm">
                    {p.netBalance < 0 ? (
                      <span className="text-emerald-400 font-bold">
                        +₹{Math.abs(p.netBalance).toLocaleString('en-IN')} (Owed)
                      </span>
                    ) : p.netBalance > 0 ? (
                      <span className="text-rose-400 font-bold">
                        -₹{p.netBalance.toLocaleString('en-IN')} (Received)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold">₹0 (Even)</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-slate-800/50 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-500" 
                          style={{ width: `${Math.max(5, p.reciprocalRatio)}%` }} 
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{p.reciprocalRatio}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono text-[11px]">
                    {p.totalTransactions} ({p.sentCount}↑ {p.receivedCount}↓)
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      p.posture === 'OWED_TO_YOU'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : p.posture === 'YOU_OWE'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
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
        <div className={`p-5 sm:p-6 ${cardCls} space-y-4 animate-fade-in border-indigo-500/40`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <BrandLogoBadge entityName={selectedPeer.name} size="md" />
              <div>
                <h3 className="text-sm font-black font-heading">{selectedPeer.name} — Transaction Timeline</h3>
                <div className="text-[10px] text-slate-400 font-mono">
                  {selectedPeer.totalTransactions} recorded transfers between {selectedPeer.firstDate} and {selectedPeer.lastDate}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPeer(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg border border-white/10"
            >
              Close Drawer ✕
            </button>
          </div>

          <div className="space-y-2">
            {selectedPeer.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-3 rounded-xl border flex items-center justify-between flex-wrap gap-2 ${
                  isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="font-mono text-xs font-bold">{tx.transactionDate}</div>
                  <div className="text-[10px] text-slate-400 max-w-md truncate">{tx.rawNarration}</div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-black text-xs ${tx.direction === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.direction === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">{tx.channel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
