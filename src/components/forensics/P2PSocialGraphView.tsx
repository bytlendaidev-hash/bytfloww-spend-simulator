import React, { useState, useMemo } from 'react';
import { CanonicalTransaction } from '../../types';
import { 
  analyzeCounterparties, 
  CounterpartyCluster, 
  CounterpartyCategory,
  extractCounterpartyAndVpa,
  classifyCounterpartyCategory
} from '../../engine/p2pIntelligence';

interface P2PSocialGraphViewProps {
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

type ViewMode = 'CLUSTERED_ENTITIES' | 'FLAT_TRANSACTIONS';
type SortField = 'LATEST_DATE' | 'GROSS_VOLUME' | 'TOTAL_SENT' | 'TOTAL_RECEIVED' | 'NET_FLOW' | 'NAME' | 'TXN_COUNT' | 'AMOUNT';
type SortOrder = 'ASC' | 'DESC';
type FilterCategory = 'ALL' | CounterpartyCategory | 'NET_CREDITOR' | 'NET_DEBTOR';

interface AmountRangePreset {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

const AMOUNT_RANGE_PRESETS: AmountRangePreset[] = [
  { id: 'ALL', label: 'All Amounts (₹0+)', min: 0, max: null },
  { id: 'MICRO', label: '< ₹1,000 (Micro)', min: 0, max: 1000 },
  { id: 'LOW', label: '₹1k – ₹5k', min: 1000, max: 5000 },
  { id: 'MID', label: '₹5k – ₹10k', min: 5000, max: 10000 },
  { id: 'HIGH', label: '₹10k – ₹25k', min: 10000, max: 25000 },
  { id: 'VERY_HIGH', label: '₹25k – ₹50k', min: 25000, max: 50000 },
  { id: 'WHALE', label: '> ₹50,000 (Major)', min: 50000, max: null },
];

export const P2PSocialGraphView: React.FC<P2PSocialGraphViewProps> = ({
  transactions,
  isDark,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('CLUSTERED_ENTITIES');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dual Amount Range Filters: Greater Than (Min) & Less Than (Max)
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [minAmountInput, setMinAmountInput] = useState<string>('');
  const [maxAmountInput, setMaxAmountInput] = useState<string>('');
  const [activeRangePreset, setActiveRangePreset] = useState<string>('ALL');

  const [sortField, setSortField] = useState<SortField>('LATEST_DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [selectedCluster, setSelectedCluster] = useState<CounterpartyCluster | null>(null);
  
  // In-modal filter state for selected peer
  const [modalMinAmount, setModalMinAmount] = useState<number>(0);
  const [modalMaxAmount, setModalMaxAmount] = useState<number | null>(null);
  const [copiedVpa, setCopiedVpa] = useState<string | null>(null);

  // Analyze all counterparties with universal clustering
  const summary = useMemo(() => {
    return analyzeCounterparties(transactions);
  }, [transactions]);

  // Handle Preset selection
  const handleSelectPreset = (preset: AmountRangePreset) => {
    setActiveRangePreset(preset.id);
    setMinAmount(preset.min);
    setMaxAmount(preset.max);
    setMinAmountInput(preset.min === 0 ? '' : preset.min.toString());
    setMaxAmountInput(preset.max === null ? '' : preset.max.toString());
  };

  // Handle Min Amount Input typing (Greater than)
  const handleMinAmountChange = (val: string) => {
    setMinAmountInput(val);
    setActiveRangePreset('CUSTOM');
    const parsed = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      setMinAmount(parsed);
    } else if (val.trim() === '') {
      setMinAmount(0);
    }
  };

  // Handle Max Amount Input typing (Less than)
  const handleMaxAmountChange = (val: string) => {
    setMaxAmountInput(val);
    setActiveRangePreset('CUSTOM');
    const parsed = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      setMaxAmount(parsed);
    } else if (val.trim() === '') {
      setMaxAmount(null);
    }
  };

  // Reset Amount Filters
  const handleResetAmountFilter = () => {
    setActiveRangePreset('ALL');
    setMinAmount(0);
    setMaxAmount(null);
    setMinAmountInput('');
    setMaxAmountInput('');
  };

  // Copy VPA to clipboard
  const handleCopyVpa = (vpa: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(vpa);
    setTimeout(() => setCopiedVpa(null), 2000);
  };

  // Check if a single transaction amount satisfies the min & max range
  const matchesAmountRange = (amount: number): boolean => {
    if (amount < minAmount) return false;
    if (maxAmount !== null && amount > maxAmount) return false;
    return true;
  };

  // Filter clusters based on category, search query, and range filters
  const filteredClusters = useMemo(() => {
    let list = summary.clusters;

    // 1. Filter by category or posture
    if (filterCategory === 'NET_CREDITOR') {
      list = list.filter((c) => c.posture === 'NET_CREDITOR');
    } else if (filterCategory === 'NET_DEBTOR') {
      list = list.filter((c) => c.posture === 'NET_DEBTOR');
    } else if (filterCategory !== 'ALL') {
      list = list.filter((c) => c.category === filterCategory);
    }

    // 2. Filter by amount range (cluster has at least one transaction in range or gross volume in range)
    if (minAmount > 0 || maxAmount !== null) {
      list = list.filter((c) => {
        return c.transactions.some((t) => {
          const amt = t.amount || (t.direction === 'CREDIT' ? t.credit || 0 : t.debit || 0);
          return matchesAmountRange(amt);
        });
      });
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const numQ = parseFloat(q);
      const isNumSearch = !isNaN(numQ);

      list = list.filter((c) => {
        const matchesText = 
          c.displayName.toLowerCase().includes(q) ||
          c.vpas.some((v) => v.toLowerCase().includes(q)) ||
          c.categoryLabel.toLowerCase().includes(q) ||
          c.transactions.some((t) => t.rawNarration.toLowerCase().includes(q));

        const matchesAmount = isNumSearch && (
          c.totalSent >= numQ || 
          c.totalReceived >= numQ || 
          c.grossVolume >= numQ ||
          c.transactions.some((t) => (t.amount || 0) >= numQ)
        );

        return matchesText || matchesAmount;
      });
    }

    // 4. Sort clusters
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
  }, [summary.clusters, filterCategory, searchQuery, minAmount, maxAmount, sortField, sortOrder]);

  // Flat individual transactions across all P2P / UPI entities
  const flatTransactions = useMemo(() => {
    let list: Array<{
      txn: CanonicalTransaction;
      counterparty: string;
      vpa: string | null;
      category: CounterpartyCategory;
      categoryLabel: string;
      icon: string;
    }> = [];

    for (const t of transactions) {
      const isCredit = t.direction === 'CREDIT' || (t.credit !== null && (t.credit ?? 0) > 0);
      const amt = t.amount || (isCredit ? t.credit || 0 : t.debit || 0);
      if (amt <= 0) continue;

      const { name, vpa } = extractCounterpartyAndVpa(t.rawNarration, t.entityName);
      const catInfo = classifyCounterpartyCategory(name, vpa, t.rawNarration, t.isSalary);

      // Filter by category
      if (filterCategory === 'NET_CREDITOR' && !isCredit) continue;
      if (filterCategory === 'NET_DEBTOR' && isCredit) continue;
      if (filterCategory !== 'ALL' && filterCategory !== 'NET_CREDITOR' && filterCategory !== 'NET_DEBTOR' && catInfo.category !== filterCategory) {
        continue;
      }

      // Filter by amount range (Greater than AND Less than)
      if (!matchesAmountRange(amt)) {
        continue;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numQ = parseFloat(q);
        const matchesText = 
          name.toLowerCase().includes(q) ||
          (vpa && vpa.toLowerCase().includes(q)) ||
          catInfo.label.toLowerCase().includes(q) ||
          t.rawNarration.toLowerCase().includes(q);
        const matchesAmt = !isNaN(numQ) && amt >= numQ;

        if (!matchesText && !matchesAmt) continue;
      }

      list.push({
        txn: t,
        counterparty: name,
        vpa,
        category: catInfo.category,
        categoryLabel: catInfo.label,
        icon: catInfo.icon,
      });
    }

    // Sort flat transactions
    return list.sort((a, b) => {
      let comp = 0;
      const amtA = a.txn.amount || (a.txn.direction === 'CREDIT' ? a.txn.credit || 0 : a.txn.debit || 0);
      const amtB = b.txn.amount || (b.txn.direction === 'CREDIT' ? b.txn.credit || 0 : b.txn.debit || 0);

      switch (sortField) {
        case 'LATEST_DATE':
          comp = a.txn.transactionDate.localeCompare(b.txn.transactionDate);
          break;
        case 'AMOUNT':
        case 'GROSS_VOLUME':
        case 'TOTAL_SENT':
        case 'TOTAL_RECEIVED':
          comp = amtA - amtB;
          break;
        case 'NAME':
          comp = a.counterparty.localeCompare(b.counterparty);
          break;
        default:
          comp = a.txn.transactionDate.localeCompare(b.txn.transactionDate);
      }
      return sortOrder === 'DESC' ? -comp : comp;
    });
  }, [transactions, filterCategory, minAmount, maxAmount, searchQuery, sortField, sortOrder]);

  // ── REAL-TIME DYNAMIC SUMMARY METRICS FOR CURRENTLY FILTERED TRANSACTIONS ───
  const filteredSummary = useMemo(() => {
    let sentSum = 0;
    let sentCount = 0;
    let receivedSum = 0;
    let receivedCount = 0;

    for (const item of flatTransactions) {
      const isCredit = item.txn.direction === 'CREDIT' || (item.txn.credit !== null && (item.txn.credit ?? 0) > 0);
      const amt = item.txn.amount || (isCredit ? item.txn.credit || 0 : item.txn.debit || 0);

      if (isCredit) {
        receivedSum += amt;
        receivedCount++;
      } else {
        sentSum += amt;
        sentCount++;
      }
    }

    const totalTxnCount = sentCount + receivedCount;
    const grossVolumeSum = sentSum + receivedSum;
    const netBalance = receivedSum - sentSum;
    const avgTxn = totalTxnCount > 0 ? Math.round(grossVolumeSum / totalTxnCount) : 0;

    return {
      matchingTxnCount: totalTxnCount,
      matchingClusterCount: filteredClusters.length,
      grossVolumeSum: Math.round(grossVolumeSum),
      sentSum: Math.round(sentSum),
      sentCount,
      receivedSum: Math.round(receivedSum),
      receivedCount,
      netBalance: Math.round(netBalance),
      avgTxn,
    };
  }, [flatTransactions, filteredClusters.length]);

  // Toggle sort direction or change sort column
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
  };

  // Export filtered data to CSV
  const handleExportCsv = () => {
    if (viewMode === 'CLUSTERED_ENTITIES') {
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
      link.setAttribute('download', `bytfloww_p2p_counterparties_${minAmount}_to_${maxAmount || 'max'}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        'Date',
        'Type',
        'Amount (₹)',
        'Counterparty Name',
        'VPA Handle',
        'Category',
        'Narration',
        'Balance After'
      ];

      const rows = flatTransactions.map((item) => {
        const isCredit = item.txn.direction === 'CREDIT' || (item.txn.credit !== null && (item.txn.credit ?? 0) > 0);
        const amt = item.txn.amount || (isCredit ? item.txn.credit || 0 : item.txn.debit || 0);

        return [
          `"${item.txn.transactionDate}"`,
          `"${isCredit ? 'CREDIT' : 'DEBIT'}"`,
          amt,
          `"${item.counterparty.replace(/"/g, '""')}"`,
          `"${item.vpa || ''}"`,
          `"${item.categoryLabel}"`,
          `"${item.txn.rawNarration.replace(/"/g, '""')}"`,
          item.txn.balanceAfter !== null ? item.txn.balanceAfter : ''
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bytfloww_p2p_transactions_${minAmount}_to_${maxAmount || 'max'}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

      {/* ── 2. FILTER, SEARCH & AMOUNT RANGE COMMAND BAR ─────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        {/* Header & View Mode Switcher */}
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
            {/* View Mode Switcher */}
            <div className="p-1 rounded-xl bg-abyss-well border border-abyss-border flex gap-1">
              <button
                onClick={() => setViewMode('CLUSTERED_ENTITIES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'CLUSTERED_ENTITIES'
                    ? 'bg-synapse-500 text-white shadow-solid-sm'
                    : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
                }`}
              >
                <span>👥</span>
                <span>By Contact ({filteredClusters.length})</span>
              </button>
              <button
                onClick={() => setViewMode('FLAT_TRANSACTIONS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'FLAT_TRANSACTIONS'
                    ? 'bg-synapse-500 text-white shadow-solid-sm'
                    : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
                }`}
              >
                <span>📜</span>
                <span>All Txns ({flatTransactions.length})</span>
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="spatial-btn px-3.5 py-1.5 text-xs font-bold text-abyss-textPrimary flex items-center gap-1.5 shrink-0"
              title="Export filtered counterparty table to CSV"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ── ADVANCED AMOUNT RANGE FILTER BAR (GREATER THAN & LESS THAN) ───── */}
        <div className="p-4 rounded-2xl bg-abyss-well border border-abyss-border space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm">⚖️</span>
              <span className="text-xs font-bold text-abyss-textPrimary">Amount Range Filter:</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-jade-500">
                <span>[ &gt;= ₹{minAmount.toLocaleString('en-IN')}</span>
                <span>and</span>
                <span>&lt;= {maxAmount !== null ? `₹${maxAmount.toLocaleString('en-IN')}` : '∞'} ]</span>
              </div>
            </div>

            {/* Min Amount & Max Amount Input Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Greater than (Min) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-abyss-textMuted font-medium whitespace-nowrap">Min ₹ (&gt;=):</span>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1.5 text-xs font-mono font-bold text-jade-500">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minAmountInput}
                    onChange={(e) => handleMinAmountChange(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-2 py-1.5 pl-5 rounded-lg bg-abyss-card border border-abyss-border text-abyss-textPrimary outline-none focus:border-jade-500 transition placeholder:text-abyss-textMuted"
                  />
                </div>
              </div>

              {/* Less than (Max) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-abyss-textMuted font-medium whitespace-nowrap">Max ₹ (&lt;=):</span>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1.5 text-xs font-mono font-bold text-pulse-500">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxAmountInput}
                    onChange={(e) => handleMaxAmountChange(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-2 py-1.5 pl-5 rounded-lg bg-abyss-card border border-abyss-border text-abyss-textPrimary outline-none focus:border-pulse-500 transition placeholder:text-abyss-textMuted"
                  />
                </div>
              </div>

              {/* Clear Range Button */}
              {(minAmount > 0 || maxAmount !== null || minAmountInput || maxAmountInput) && (
                <button
                  onClick={handleResetAmountFilter}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-abyss-card border border-abyss-border hover:border-pulse-500 text-pulse-500 transition"
                  title="Reset Amount Filter"
                >
                  Reset Range
                </button>
              )}
            </div>
          </div>

          {/* Quick Preset Range Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar flex-wrap">
            {AMOUNT_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                  activeRangePreset === preset.id
                    ? 'bg-jade-500 text-black shadow-solid-sm font-black'
                    : 'bg-abyss-card border border-abyss-border text-abyss-textSecondary hover:text-abyss-textPrimary hover:border-jade-500/50'
                }`}
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. DYNAMIC REAL-TIME FILTERED TRANSACTIONS SUMMARY RIBBON ─────── */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-synapse-950/40 via-abyss-well to-jade-950/30 border border-synapse-500/30 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <h3 className="text-xs font-black uppercase text-synapse-400 tracking-wider">
                Filtered Transactions Financial Summary (Real-time Sum)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-synapse-500/20 text-synapse-400 border border-synapse-500/30">
              {filteredSummary.matchingTxnCount.toLocaleString('en-IN')} Transactions across {filteredSummary.matchingClusterCount} Entities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {/* Filtered Gross Sum */}
            <div className="p-2.5 rounded-xl bg-abyss-card border border-abyss-border">
              <div className="text-[9px] font-bold uppercase text-synapse-400">Total Filtered Sum</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5 text-synapse-400">
                ₹{filteredSummary.grossVolumeSum.toLocaleString('en-IN')}
              </div>
              <div className="text-[8px] text-abyss-textMuted">Debits + Credits</div>
            </div>

            {/* Filtered Sent Sum (Debits) */}
            <div className="p-2.5 rounded-xl bg-abyss-card border border-abyss-border">
              <div className="text-[9px] font-bold uppercase text-pulse-500">Filtered Outflow (Sent)</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5 text-pulse-500">
                ₹{filteredSummary.sentSum.toLocaleString('en-IN')}
              </div>
              <div className="text-[8px] text-abyss-textMuted">{filteredSummary.sentCount} debit transactions</div>
            </div>

            {/* Filtered Received Sum (Credits) */}
            <div className="p-2.5 rounded-xl bg-abyss-card border border-abyss-border">
              <div className="text-[9px] font-bold uppercase text-jade-500">Filtered Inflow (Received)</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5 text-jade-500">
                ₹{filteredSummary.receivedSum.toLocaleString('en-IN')}
              </div>
              <div className="text-[8px] text-abyss-textMuted">{filteredSummary.receivedCount} credit deposits</div>
            </div>

            {/* Filtered Net Balance */}
            <div className="p-2.5 rounded-xl bg-abyss-card border border-abyss-border">
              <div className="text-[9px] font-bold uppercase text-abyss-textMuted">Filtered Net Delta</div>
              <div className={`text-sm sm:text-base font-black font-mono mt-0.5 ${
                filteredSummary.netBalance > 0 ? 'text-jade-500' : filteredSummary.netBalance < 0 ? 'text-pulse-500' : 'text-abyss-textPrimary'
              }`}>
                {filteredSummary.netBalance > 0 ? '+' : ''}₹{filteredSummary.netBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-[8px] text-abyss-textMuted">{filteredSummary.netBalance >= 0 ? 'Net Inflow Surplus' : 'Net Outflow Deficit'}</div>
            </div>

            {/* Filtered Avg Txn */}
            <div className="p-2.5 rounded-xl bg-abyss-card border border-abyss-border">
              <div className="text-[9px] font-bold uppercase text-abyss-textMuted">Average Txn Size</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5 text-abyss-textPrimary">
                ₹{filteredSummary.avgTxn.toLocaleString('en-IN')}
              </div>
              <div className="text-[8px] text-abyss-textMuted">Per matching transaction</div>
            </div>

            {/* Active Range */}
            <div className="p-2.5 rounded-xl bg-abyss-card border border-abyss-border">
              <div className="text-[9px] font-bold uppercase text-abyss-textMuted">Applied Threshold</div>
              <div className="text-xs font-black font-mono mt-1 text-jade-500 truncate">
                ≥ ₹{minAmount.toLocaleString('en-IN')} {maxAmount !== null ? `to ≤ ₹${maxAmount.toLocaleString('en-IN')}` : ''}
              </div>
              <div className="text-[8px] text-abyss-textMuted">Active amount filter</div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'ALL', label: `All (${summary.clusters.length})` },
              { id: 'P2P_CONTACT', label: `👥 P2P Contacts (${summary.uniquePeerCount})` },
              { id: 'SELF_TRANSFER', label: `🔄 Self Sweeps (${summary.clusters.filter(c => c.category === 'SELF_TRANSFER').length})` },
              { id: 'MERCHANT_COMMERCE', label: `🛍️ Merchants (${summary.clusters.filter(c => c.category === 'MERCHANT_COMMERCE').length})` },
              { id: 'CRYPTO_INVESTMENT', label: `🪙 Crypto (${summary.clusters.filter(c => c.category === 'CRYPTO_INVESTMENT').length})` },
              { id: 'LENDER_NBFC', label: `🏦 Lenders (${summary.clusters.filter(c => c.category === 'LENDER_NBFC').length})` },
              { id: 'UTILITY_BILL', label: `⚡ Utilities (${summary.clusters.filter(c => c.category === 'UTILITY_BILL').length})` },
              { id: 'NET_CREDITOR', label: `🟢 Net Creditors` },
              { id: 'NET_DEBTOR', label: `🔴 Net Debtors` },
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

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search name, UPI, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3.5 py-1.5 pl-8 rounded-xl bg-abyss-well border border-abyss-border text-abyss-textPrimary outline-none focus:border-synapse-500 transition-all placeholder:text-abyss-textMuted"
            />
            <span className="absolute left-2.5 top-2 text-xs text-abyss-textMuted">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-xs text-abyss-textMuted hover:text-abyss-textPrimary"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── 4A. VIEW MODE 1: CLUSTERED COUNTERPARTIES TABLE ──────────────── */}
        {viewMode === 'CLUSTERED_ENTITIES' && (
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
                        No counterparties match your current filter, amount range (≥ ₹{minAmount.toLocaleString('en-IN')} {maxAmount !== null ? `to ≤ ₹${maxAmount.toLocaleString('en-IN')}` : ''}), or search criteria.
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
        )}

        {/* ── 4B. VIEW MODE 2: FLAT INDIVIDUAL TRANSACTIONS LEDGER ─────────── */}
        {viewMode === 'FLAT_TRANSACTIONS' && (
          <div className="bg-abyss-well border border-abyss-border rounded-[18px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider select-none">
                  <tr className="border-b border-abyss-border">
                    {/* Date */}
                    <th
                      onClick={() => handleSort('LATEST_DATE')}
                      className="p-3.5 cursor-pointer hover:text-abyss-textPrimary transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortField === 'LATEST_DATE' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                      </div>
                    </th>

                    {/* Counterparty Name */}
                    <th
                      onClick={() => handleSort('NAME')}
                      className="p-3.5 cursor-pointer hover:text-abyss-textPrimary transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Counterparty & VPA</span>
                        {sortField === 'NAME' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                      </div>
                    </th>

                    {/* Category */}
                    <th className="p-3.5">Category</th>

                    {/* Type */}
                    <th className="p-3.5 text-center">Type</th>

                    {/* Narration */}
                    <th className="p-3.5">Bank Narration / Remark</th>

                    {/* Amount */}
                    <th
                      onClick={() => handleSort('AMOUNT')}
                      className="p-3.5 text-right cursor-pointer hover:text-abyss-textPrimary transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Amount (₹)</span>
                        {sortField === 'AMOUNT' && <span>{sortOrder === 'DESC' ? '▼' : '▲'}</span>}
                      </div>
                    </th>

                    {/* Balance */}
                    <th className="p-3.5 text-right">Balance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-abyss-border">
                  {flatTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-abyss-textMuted">
                        No transactions found matching amount range [≥ ₹{minAmount.toLocaleString('en-IN')} {maxAmount !== null ? `to ≤ ₹${maxAmount.toLocaleString('en-IN')}` : ''}] or search criteria.
                      </td>
                    </tr>
                  ) : (
                    flatTransactions.slice(0, 250).map((item, idx) => {
                      const isCredit = item.txn.direction === 'CREDIT' || (item.txn.credit !== null && (item.txn.credit ?? 0) > 0);
                      const amt = item.txn.amount || (isCredit ? item.txn.credit || 0 : item.txn.debit || 0);

                      return (
                        <tr key={idx} className="hover:bg-abyss-elevated transition-colors">
                          <td className="p-3.5 font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">
                            {item.txn.transactionDate}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-start gap-2">
                              <span className="text-sm shrink-0">{item.icon}</span>
                              <div className="min-w-0">
                                <div className="font-bold text-abyss-textPrimary truncate max-w-[180px]">
                                  {item.counterparty}
                                </div>
                                {item.vpa && (
                                  <div className="font-mono text-[10px] text-abyss-textMuted truncate max-w-[160px]">
                                    {item.vpa}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-abyss-card border border-abyss-border text-abyss-textSecondary">
                              {item.categoryLabel}
                            </span>
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              isCredit
                                ? 'bg-jade-500/20 text-jade-500 border border-jade-500/30'
                                : 'bg-pulse-500/20 text-pulse-500 border border-pulse-500/30'
                            }`}>
                              {isCredit ? 'CREDIT' : 'DEBIT'}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[10px] text-abyss-textSecondary max-w-[280px] break-words">
                            {item.txn.rawNarration}
                          </td>
                          <td className={`p-3.5 text-right font-mono font-bold text-sm whitespace-nowrap ${
                            isCredit ? 'text-jade-500' : 'text-pulse-500'
                          }`}>
                            {isCredit ? '+' : '-'}₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-right font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">
                            {item.txn.balanceAfter !== null ? `₹${item.txn.balanceAfter.toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {flatTransactions.length > 250 && (
              <div className="p-3 bg-abyss-card border-t border-abyss-border text-center text-xs text-abyss-textMuted">
                Showing top 250 of {flatTransactions.length.toLocaleString('en-IN')} matching transactions. Export CSV to inspect all.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 5. DRILLDOWN MODAL: COMPLETE COUNTERPARTY LEDGER ──────────────── */}
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

            {/* In-Modal Range Filter Bar */}
            <div className="p-3 px-5 bg-abyss-well border-b border-abyss-border flex items-center justify-between flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-abyss-textMuted">Filter this contact by Amount:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { label: 'All', min: 0, max: null },
                    { label: '≥ ₹1k', min: 1000, max: null },
                    { label: '≥ ₹2k', min: 2000, max: null },
                    { label: '≥ ₹3k', min: 3000, max: null },
                    { label: '≥ ₹5k', min: 5000, max: null },
                    { label: '≥ ₹10k', min: 10000, max: null },
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        setModalMinAmount(preset.min);
                        setModalMaxAmount(preset.max);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition ${
                        modalMinAmount === preset.min && modalMaxAmount === preset.max
                          ? 'bg-jade-500 text-black font-black'
                          : 'bg-abyss-card border border-abyss-border text-abyss-textSecondary hover:text-abyss-textPrimary'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Modal Filtered Sum Metric */}
              {(() => {
                const modalMatching = selectedCluster.transactions.filter((t) => {
                  const amt = t.amount || (t.direction === 'CREDIT' ? t.credit || 0 : t.debit || 0);
                  if (amt < modalMinAmount) return false;
                  if (modalMaxAmount !== null && amt > modalMaxAmount) return false;
                  return true;
                });
                const modalSum = modalMatching.reduce((acc, t) => acc + (t.amount || (t.direction === 'CREDIT' ? t.credit || 0 : t.debit || 0)), 0);

                return (
                  <span className="text-xs font-mono font-bold text-jade-500">
                    Filtered Sum: ₹{modalSum.toLocaleString('en-IN')} ({modalMatching.length} of {selectedCluster.transactions.length} txns)
                  </span>
                );
              })()}
            </div>

            {/* Individual Transaction Timeline Ledger */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
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
                    {selectedCluster.transactions
                      .filter((t) => {
                        const amt = t.amount || (t.direction === 'CREDIT' ? t.credit || 0 : t.debit || 0);
                        if (amt < modalMinAmount) return false;
                        if (modalMaxAmount !== null && amt > modalMaxAmount) return false;
                        return true;
                      })
                      .map((t, idx) => {
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
                {selectedCluster.displayName} • {selectedCluster.transactions.length} Total Records
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
