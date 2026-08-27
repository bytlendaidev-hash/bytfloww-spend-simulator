import React, { useState, useMemo } from 'react';
import { CanonicalTransaction } from '../../types';
import { 
  analyzeCounterparties, 
  CounterpartyCluster, 
  CounterpartyCategory 
} from '../../engine/p2pIntelligence';

interface P2PSocialGraphViewProps {
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

type SortField = 'LATEST_DATE' | 'GROSS_VOLUME' | 'TOTAL_SENT' | 'TOTAL_RECEIVED' | 'NET_FLOW' | 'NAME' | 'TXN_COUNT';
type SortOrder = 'ASC' | 'DESC';
type FilterCategory = 'ALL' | CounterpartyCategory | 'NET_CREDITOR' | 'NET_DEBTOR';

export const P2PSocialGraphView: React.FC<P2PSocialGraphViewProps> = ({
  transactions,
  isDark,
}) => {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('LATEST_DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [selectedCluster, setSelectedCluster] = useState<CounterpartyCluster | null>(null);
  const [copiedVpa, setCopiedVpa] = useState<string | null>(null);

  // Analyze all counterparties with universal clustering
  const summary = useMemo(() => {
    return analyzeCounterparties(transactions);
  }, [transactions]);

  // Copy VPA to clipboard
  const handleCopyVpa = (vpa: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(vpa);
    setTimeout(() => setCopiedVpa(null), 2000);
  };

  // Filter clusters based on category and search query
  const filteredClusters = useMemo(() => {
    let list = summary.clusters;

    // Filter by category or posture
    if (filterCategory === 'NET_CREDITOR') {
      list = list.filter((c) => c.posture === 'NET_CREDITOR');
    } else if (filterCategory === 'NET_DEBTOR') {
      list = list.filter((c) => c.posture === 'NET_DEBTOR');
    } else if (filterCategory !== 'ALL') {
      list = list.filter((c) => c.category === filterCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.vpas.some((v) => v.toLowerCase().includes(q)) ||
          c.categoryLabel.toLowerCase().includes(q) ||
          c.transactions.some((t) => t.rawNarration.toLowerCase().includes(q))
      );
    }

    // Sort clusters
    return [...list].sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'LATEST_DATE':
          comp = a.latestDate.localeCompare(b.latestDate);
          break;
        case 'GROSS_VOLUME':
          comp = a.grossVolume - b.grossVolume;
          break;
        case 'TOTAL_SENT':
          comp = a.totalSent - b.totalSent;
          break;
        case 'TOTAL_RECEIVED':
          comp = a.totalReceived - b.totalReceived;
          break;
        case 'NET_FLOW':
          comp = a.netFlow - b.netFlow;
          break;
        case 'NAME':
          comp = a.displayName.localeCompare(b.displayName);
          break;
        case 'TXN_COUNT':
          comp = a.txnCount - b.txnCount;
          break;
        default:
          comp = 0;
      }
      return sortOrder === 'DESC' ? -comp : comp;
    });
  }, [summary.clusters, filterCategory, searchQuery, sortField, sortOrder]);

  // Toggle sort direction or change sort column
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
  };

  // Export filtered counterparties to CSV
  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Category',
      'Primary VPA',
      'All VPAs',
      'Total Sent (₹)',
      'Total Received (₹)',
      'Net Flow (₹)',
      'Gross Volume (₹)',
      'Txn Count',
      'First Date',
      'Latest Date',
      'Posture'
    ];

    const rows = filteredClusters.map((c) => [
      `"${c.displayName.replace(/"/g, '""')}"`,
      `"${c.categoryLabel}"`,
      `"${c.primaryVpa || ''}"`,
      `"${c.vpas.join('; ')}"`,
      c.totalSent,
      c.totalReceived,
      c.netFlow,
      c.grossVolume,
      c.txnCount,
      `"${c.firstDate}"`,
      `"${c.latestDate}"`,
      `"${c.posture}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bytfloww_p2p_counterparties_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── 1. EXECUTIVE METRICS HUD ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total P2P Volume */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-synapse-900/20 border-synapse-500/30' : 'bg-synapse-50 border-synapse-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-synapse-400 light:text-synapse-700 tracking-wider">Total P2P Volume</span>
            <span className="text-xs">👥</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-synapse-400 light:text-synapse-700 tracking-tight">
            ₹{(summary.totalSentToPeers + summary.totalReceivedFromPeers).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-synapse-400/80 mt-0.5">Across {summary.uniquePeerCount} personal contacts</div>
        </div>

        {/* Net Capital Sent (Debtor / Owed to you) */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-pulse-900/20 border-pulse-500/30' : 'bg-pulse-50 border-pulse-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-pulse-500 tracking-wider">Capital Sent to Peers</span>
            <span className="text-xs">↗️</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-pulse-500 tracking-tight">
            ₹{summary.totalSentToPeers.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-pulse-500/80 mt-0.5">Total outflows to personal friends</div>
        </div>

        {/* Surplus Received (Creditor) */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-jade-900/20 border-jade-500/30' : 'bg-jade-50 border-jade-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-jade-500 tracking-wider">Received from Peers</span>
            <span className="text-xs">↙️</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-jade-500 tracking-tight">
            ₹{summary.totalReceivedFromPeers.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-jade-500/80 mt-0.5">Total inflows from personal friends</div>
        </div>

        {/* Self Sweeps & Internal Transfers */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-telemetry-900/20 border-telemetry-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-telemetry-500 tracking-wider">Self Account Sweeps</span>
            <span className="text-xs">🔄</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-telemetry-500 tracking-tight">
            ₹{summary.totalSelfTransferVolume.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-telemetry-500/80 mt-0.5">{summary.selfTransferCount} internal transfers (Excluded)</div>
        </div>

        {/* Total Counterparty Entities */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-ochre-500 tracking-wider">Total Counterparties</span>
            <span className="text-xs">🌐</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-ochre-500 tracking-tight">
            {summary.clusters.length} Entities
          </div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">Clustered & unified across VPAs</div>
        </div>
      </div>

      {/* ── 2. FILTER, SEARCH & SORT COMMAND BAR ──────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-abyss-textPrimary">
              <span>👥</span>
              <span>Universal P2P & UPI Counterparty Intelligence</span>
            </h2>
            <p className="text-xs text-abyss-textMuted mt-0.5">
              Deterministic clustering across {summary.clusters.length} unique entities and {transactions.length.toLocaleString('en-IN')} transactions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search name, UPI VPA, remark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3.5 py-2 pl-9 rounded-xl bg-abyss-well border border-abyss-border text-abyss-textPrimary outline-none focus:border-synapse-500 transition-all placeholder:text-abyss-textMuted"
              />
              <span className="absolute left-3 top-2.5 text-xs text-abyss-textMuted">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-abyss-textMuted hover:text-abyss-textPrimary"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="spatial-btn px-3.5 py-2 text-xs font-bold text-abyss-textPrimary flex items-center gap-1.5 shrink-0"
              title="Export filtered counterparty table to CSV"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: `All (${summary.clusters.length})` },
            { id: 'P2P_CONTACT', label: `👥 P2P Contacts (${summary.uniquePeerCount})` },
            { id: 'SELF_TRANSFER', label: `🔄 Self Sweeps (${summary.clusters.filter(c => c.category === 'SELF_TRANSFER').length})` },
            { id: 'MERCHANT_COMMERCE', label: `🛍️ Merchants (${summary.clusters.filter(c => c.category === 'MERCHANT_COMMERCE').length})` },
            { id: 'CRYPTO_INVESTMENT', label: `🪙 Crypto & Trading (${summary.clusters.filter(c => c.category === 'CRYPTO_INVESTMENT').length})` },
            { id: 'LENDER_NBFC', label: `🏦 Lenders & Debt (${summary.clusters.filter(c => c.category === 'LENDER_NBFC').length})` },
            { id: 'UTILITY_BILL', label: `⚡ Utilities (${summary.clusters.filter(c => c.category === 'UTILITY_BILL').length})` },
            { id: 'NET_CREDITOR', label: `🟢 Net Creditors (+Inflow)` },
            { id: 'NET_DEBTOR', label: `🔴 Net Debtors (-Outflow)` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id as FilterCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                filterCategory === tab.id
                  ? 'bg-synapse-500 text-white shadow-solid-sm'
                  : 'bg-abyss-well border border-abyss-border text-abyss-textSecondary hover:text-abyss-textPrimary'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── 3. INTERACTIVE COUNTERPARTY TABLE ───────────────────────────── */}
        <div className="bg-abyss-well border border-abyss-border rounded-[18px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider select-none">
                <tr className="border-b border-abyss-border">
                  {/* Name */}
                  <th
                    onClick={() => handleSort('NAME')}
                    className="p-3.5 cursor-pointer hover:text-abyss-textPrimary transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Counterparty / Identity</span>
                      {sortField === 'NAME' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                    </div>
                  </th>

                  {/* Category */}
                  <th className="p-3.5">Category</th>

                  {/* Total Sent */}
                  <th
                    onClick={() => handleSort('TOTAL_SENT')}
                    className="p-3.5 text-right cursor-pointer hover:text-abyss-textPrimary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Sent (Debits)</span>
                      {sortField === 'TOTAL_SENT' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                    </div>
                  </th>

                  {/* Total Received */}
                  <th
                    onClick={() => handleSort('TOTAL_RECEIVED')}
                    className="p-3.5 text-right cursor-pointer hover:text-abyss-textPrimary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Received (Credits)</span>
                      {sortField === 'TOTAL_RECEIVED' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                    </div>
                  </th>

                  {/* Net Flow */}
                  <th
                    onClick={() => handleSort('NET_FLOW')}
                    className="p-3.5 text-right cursor-pointer hover:text-abyss-textPrimary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Net Position</span>
                      {sortField === 'NET_FLOW' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                    </div>
                  </th>

                  {/* Reciprocal Ratio */}
                  <th className="p-3.5 text-center">Reciprocal %</th>

                  {/* Txn Count */}
                  <th
                    onClick={() => handleSort('TXN_COUNT')}
                    className="p-3.5 text-center cursor-pointer hover:text-abyss-textPrimary transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Txns</span>
                      {sortField === 'TXN_COUNT' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                    </div>
                  </th>

                  {/* Latest Activity Date */}
                  <th
                    onClick={() => handleSort('LATEST_DATE')}
                    className="p-3.5 text-right cursor-pointer hover:text-abyss-textPrimary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Latest Date</span>
                      {sortField === 'LATEST_DATE' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                    </div>
                  </th>

                  {/* Action */}
                  <th className="p-3.5 text-center">Ledger</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-abyss-border">
                {filteredClusters.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-abyss-textMuted">
                      No counterparties match your current filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClusters.map((cluster) => (
                    <tr
                      key={cluster.id}
                      onClick={() => setSelectedCluster(cluster)}
                      className={`cursor-pointer transition-colors hover:bg-abyss-elevated ${
                        selectedCluster?.id === cluster.id ? 'bg-synapse-500/15' : ''
                      }`}
                    >
                      {/* Name & VPAs */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-abyss-card border border-abyss-border flex items-center justify-center text-sm shrink-0 shadow-solid-sm">
                            {cluster.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-abyss-textPrimary truncate max-w-[200px] sm:max-w-[260px]">
                              {cluster.displayName}
                            </div>
                            {cluster.vpas.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="font-mono text-[10px] text-abyss-textMuted truncate max-w-[180px]">
                                  {cluster.primaryVpa}
                                </span>
                                {cluster.vpas.length > 1 && (
                                  <span className="px-1.5 py-0.2 rounded-md text-[8px] font-bold bg-abyss-card border border-abyss-border text-abyss-textMuted">
                                    +{cluster.vpas.length - 1} VPAs
                                  </span>
                                )}
                                {cluster.primaryVpa && (
                                  <button
                                    onClick={(e) => handleCopyVpa(cluster.primaryVpa!, e)}
                                    className="text-[10px] text-abyss-textMuted hover:text-synapse-400 transition"
                                    title="Copy VPA"
                                  >
                                    {copiedVpa === cluster.primaryVpa ? '✓' : '📋'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          cluster.category === 'P2P_CONTACT'
                            ? 'bg-synapse-500/20 text-synapse-400 border border-synapse-500/30'
                            : cluster.category === 'SELF_TRANSFER'
                            ? 'bg-telemetry-500/20 text-telemetry-500 border border-telemetry-500/30'
                            : cluster.category === 'MERCHANT_COMMERCE'
                            ? 'bg-pulse-500/20 text-pulse-500 border border-pulse-500/30'
                            : cluster.category === 'CRYPTO_INVESTMENT'
                            ? 'bg-ochre-500/20 text-ochre-500 border border-ochre-500/30'
                            : cluster.category === 'LENDER_NBFC'
                            ? 'bg-ochre-500/20 text-ochre-500 border border-ochre-500/30'
                            : cluster.category === 'EMPLOYER_PAYROLL'
                            ? 'bg-jade-500/20 text-jade-500 border border-jade-500/30'
                            : 'bg-abyss-card text-abyss-textMuted border border-abyss-border'
                        }`}>
                          {cluster.categoryLabel}
                        </span>
                      </td>

                      {/* Total Sent */}
                      <td className="p-3.5 text-right font-mono text-pulse-500 font-semibold whitespace-nowrap">
                        {cluster.totalSent > 0 ? `₹${cluster.totalSent.toLocaleString('en-IN')}` : '—'}
                      </td>

                      {/* Total Received */}
                      <td className="p-3.5 text-right font-mono text-jade-500 font-semibold whitespace-nowrap">
                        {cluster.totalReceived > 0 ? `₹${cluster.totalReceived.toLocaleString('en-IN')}` : '—'}
                      </td>

                      {/* Net Flow */}
                      <td className="p-3.5 text-right font-mono font-bold whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-lg text-xs ${
                          cluster.netFlow > 500
                            ? 'text-jade-500 bg-jade-500/10'
                            : cluster.netFlow < -500
                            ? 'text-pulse-500 bg-pulse-500/10'
                            : 'text-abyss-textMuted bg-abyss-card'
                        }`}>
                          {cluster.netFlow > 0 ? '+' : ''}₹{cluster.netFlow.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Reciprocal % */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-abyss-border overflow-hidden">
                            <div
                              className="h-full bg-synapse-500 rounded-full"
                              style={{ width: `${cluster.reciprocalRatio}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-abyss-textMuted">
                            {cluster.reciprocalRatio}%
                          </span>
                        </div>
                      </td>

                      {/* Txn Count */}
                      <td className="p-3.5 text-center font-mono font-bold text-abyss-textPrimary whitespace-nowrap">
                        {cluster.txnCount}
                      </td>

                      {/* Latest Activity Date */}
                      <td className="p-3.5 text-right font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">
                        {cluster.latestDate}
                      </td>

                      {/* Action Button */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCluster(cluster);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-abyss-card border border-abyss-border hover:border-synapse-500 text-abyss-textSecondary hover:text-abyss-textPrimary transition"
                        >
                          Ledger →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 4. DRILLDOWN MODAL: COMPLETE COUNTERPARTY LEDGER ──────────────── */}
      {selectedCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-emergence">
          <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col ${cardCls} overflow-hidden shadow-solid-lg border-synapse-500/40`}>
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-abyss-border flex items-start justify-between gap-4 bg-abyss-well shrink-0">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-abyss-card border border-abyss-border flex items-center justify-center text-2xl shadow-solid-sm shrink-0">
                  {selectedCluster.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-abyss-textPrimary">
                      {selectedCluster.displayName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-synapse-500/20 text-synapse-400 border border-synapse-500/30">
                      {selectedCluster.categoryLabel}
                    </span>
                  </div>
                  {selectedCluster.vpas.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap font-mono text-xs text-abyss-textMuted">
                      <span>VPAs:</span>
                      {selectedCluster.vpas.map((v) => (
                        <span key={v} className="px-2 py-0.5 rounded-md bg-abyss-card border border-abyss-border text-[10px]">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedCluster(null)}
                className="w-8 h-8 rounded-full bg-abyss-card border border-abyss-border flex items-center justify-center text-sm text-abyss-textMuted hover:text-abyss-textPrimary transition"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-abyss-card border-b border-abyss-border shrink-0">
              <div className="p-3 rounded-xl bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-pulse-500">Total Sent (Debits)</div>
                <div className="text-lg font-black font-mono mt-0.5 text-pulse-500">
                  ₹{selectedCluster.totalSent.toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] text-abyss-textMuted">{selectedCluster.sentCount} debit transactions</div>
              </div>

              <div className="p-3 rounded-xl bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-jade-500">Total Received (Credits)</div>
                <div className="text-lg font-black font-mono mt-0.5 text-jade-500">
                  ₹{selectedCluster.totalReceived.toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] text-abyss-textMuted">{selectedCluster.receivedCount} credit deposits</div>
              </div>

              <div className="p-3 rounded-xl bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Net Position</div>
                <div className={`text-lg font-black font-mono mt-0.5 ${
                  selectedCluster.netFlow > 0 ? 'text-jade-500' : selectedCluster.netFlow < 0 ? 'text-pulse-500' : 'text-abyss-textPrimary'
                }`}>
                  {selectedCluster.netFlow > 0 ? '+' : ''}₹{selectedCluster.netFlow.toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] text-abyss-textMuted">
                  {selectedCluster.posture === 'NET_CREDITOR' ? 'They paid you surplus' : selectedCluster.posture === 'NET_DEBTOR' ? 'You paid them surplus' : 'Balanced Reciprocity'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Interaction Span</div>
                <div className="text-xs font-bold font-mono mt-1 text-abyss-textPrimary truncate">
                  {selectedCluster.firstDate} → {selectedCluster.latestDate}
                </div>
                <div className="text-[9px] text-abyss-textMuted">Avg: ₹{selectedCluster.averageTxn.toLocaleString('en-IN')}/txn</div>
              </div>
            </div>

            {/* Individual Transaction Timeline Ledger */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-abyss-textMuted tracking-wider">
                  Transaction History ({selectedCluster.transactions.length} Records)
                </h4>
              </div>

              <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider">
                    <tr className="border-b border-abyss-border">
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Narration / Remark</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-abyss-border">
                    {selectedCluster.transactions.map((t, idx) => {
                      const isCredit = t.direction === 'CREDIT' || (t.credit !== null && (t.credit ?? 0) > 0);
                      const amt = t.amount || (isCredit ? t.credit || 0 : t.debit || 0);

                      return (
                        <tr key={idx} className="hover:bg-abyss-elevated transition-colors">
                          <td className="p-3 font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">
                            {t.transactionDate}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              isCredit
                                ? 'bg-jade-500/20 text-jade-500 border border-jade-500/30'
                                : 'bg-pulse-500/20 text-pulse-500 border border-pulse-500/30'
                            }`}>
                              {isCredit ? 'CREDIT' : 'DEBIT'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-abyss-textSecondary max-w-[320px] break-words">
                            {t.rawNarration}
                          </td>
                          <td className={`p-3 text-right font-mono font-bold whitespace-nowrap ${
                            isCredit ? 'text-jade-500' : 'text-pulse-500'
                          }`}>
                            {isCredit ? '+' : '-'}₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">
                            {t.balanceAfter !== null ? `₹${t.balanceAfter.toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-abyss-border bg-abyss-well flex items-center justify-between shrink-0">
              <span className="text-xs text-abyss-textMuted font-mono">
                {selectedCluster.displayName} • {selectedCluster.transactions.length} Records
              </span>
              <button
                onClick={() => setSelectedCluster(null)}
                className="spatial-btn px-4 py-1.5 text-xs font-bold text-abyss-textPrimary"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
