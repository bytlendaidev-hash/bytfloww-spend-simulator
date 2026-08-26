import React, { useState, useMemo } from 'react';
import { CanonicalTransaction } from '../../types';
import { buildMonthlyCategoryVarianceHeatmap, MonthlyCategoryVarianceRow } from '../../engine/forensicsAdvancedEngine';

interface VarianceHeatmapViewProps {
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const VarianceHeatmapView: React.FC<VarianceHeatmapViewProps> = ({
  transactions,
  isDark,
}) => {
  const [selectedRow, setSelectedRow] = useState<MonthlyCategoryVarianceRow | null>(null);

  const matrix = useMemo(() => {
    return buildMonthlyCategoryVarianceHeatmap(transactions);
  }, [transactions]);

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP VARIANCE SUMMARY HUD ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-pulse-900/20 border-pulse-500/30' : 'bg-pulse-50 border-pulse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-pulse-500">Peak Outflow Month</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-pulse-500 truncate">
            {matrix.peakOutflowMonth.label}
          </div>
          <div className="text-[10px] text-pulse-500/80 mt-0.5 font-mono">
            ₹{matrix.peakOutflowMonth.amount.toLocaleString('en-IN')} total debits
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-jade-900/20 border-jade-500/30' : 'bg-jade-50 border-jade-200'}`}>
          <div className="text-[10px] font-bold uppercase text-jade-500">Lowest Outflow Month</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-jade-500 truncate">
            {matrix.lowestOutflowMonth.label}
          </div>
          <div className="text-[10px] text-jade-500/80 mt-0.5 font-mono">
            ₹{matrix.lowestOutflowMonth.amount.toLocaleString('en-IN')} total debits
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-synapse-900/20 border-synapse-500/30' : 'bg-synapse-50 border-synapse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-synapse-400 light:text-synapse-700">Timeline Breadth</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-synapse-400 light:text-synapse-700">
            {matrix.months.length} Months
          </div>
          <div className="text-[10px] text-synapse-400/80 mt-0.5">
            {matrix.months[0]?.label} → {matrix.months[matrix.months.length - 1]?.label}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="text-[10px] font-bold uppercase text-ochre-500">Tracked Outflow Categories</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-ochre-500">
            {matrix.rows.length} Buckets
          </div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">Lifestyle & Debt movement</div>
        </div>
      </div>

      {/* ── COMPARATIVE VARIANCE HEATMAP TABLE ───────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
              <span>📊</span>
              <span>17-Month Category Variance Heatmap & MoM Delta Matrix</span>
            </h2>
            <p className="text-xs mt-0.5 text-abyss-textMuted">
              Color-coded heat intensities indicate spending concentration. Green/Rose chips denote Month-over-Month % shifts.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b font-black text-[10px] uppercase tracking-wider border-abyss-border text-abyss-textMuted">
                <th className="p-3 sticky left-0 z-10 bg-inherit min-w-[200px]">Category & Channel</th>
                <th className="p-3 text-right">Avg / Mo</th>
                {matrix.months.map((m) => (
                  <th key={m.key} className="p-2.5 text-center min-w-[85px] font-mono">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-abyss-border">
              {matrix.rows.map((row) => (
                <tr 
                  key={row.categoryId}
                  onClick={() => setSelectedRow(selectedRow?.categoryId === row.categoryId ? null : row)}
                  className={`cursor-pointer transition-colors ${
                    selectedRow?.categoryId === row.categoryId
                      ? 'bg-synapse-500/15'
                      : 'hover:bg-abyss-well'
                  }`}
                >
                  <td className="p-3 sticky left-0 z-10 bg-inherit font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{row.icon}</span>
                      <div>
                        <div className="truncate text-abyss-textPrimary">{row.categoryName}</div>
                        <div className="text-[10px] text-abyss-textMuted font-normal">
                          ₹{row.totalPeriodSpend.toLocaleString('en-IN')} total
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-abyss-textSecondary">
                    ₹{row.monthlyAverage.toLocaleString('en-IN')}
                  </td>

                  {row.monthlyCells.map((cell) => {
                    // Calculate cell heat background color
                    let heatBg = 'transparent';
                    if (row.categoryId === 'salary' || row.categoryId === 'epfo') {
                      heatBg = cell.amount > 0 ? (isDark ? 'rgba(0, 208, 132, 0.15)' : 'rgba(0, 135, 90, 0.12)') : 'transparent';
                    } else if (cell.heatScore > 0.6) {
                      heatBg = isDark ? `rgba(255, 51, 102, ${cell.heatScore * 0.35})` : `rgba(217, 30, 78, ${cell.heatScore * 0.25})`;
                    } else if (cell.heatScore > 0.2) {
                      heatBg = isDark ? `rgba(245, 166, 35, ${cell.heatScore * 0.25})` : `rgba(198, 125, 10, ${cell.heatScore * 0.18})`;
                    }

                    return (
                      <td
                        key={cell.monthKey}
                        style={{ backgroundColor: heatBg }}
                        className="p-2 text-center font-mono border-l border-abyss-border transition-colors"
                      >
                        <div className="font-bold text-[11px] text-abyss-textPrimary">
                          {cell.amount > 0 ? `₹${cell.amount.toLocaleString('en-IN')}` : '—'}
                        </div>
                        {cell.amount > 0 && cell.momDeltaPercent !== 0 && (
                          <div className={`text-[8px] font-black mt-0.5 ${
                            cell.momDeltaPercent > 0 
                              ? (row.categoryId === 'salary' ? 'text-jade-500' : 'text-pulse-500')
                              : (row.categoryId === 'salary' ? 'text-pulse-500' : 'text-jade-500')
                          }`}>
                            {cell.momDeltaPercent > 0 ? `+${cell.momDeltaPercent}%` : `${cell.momDeltaPercent}%`}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ROW TREND DRILLDOWN DRAWER ───────────────────────────────────── */}
      {selectedRow && (
        <div className={`p-5 sm:p-6 ${cardCls} space-y-4 animate-fade-in border-synapse-500/40`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedRow.icon}</span>
              <div>
                <h3 className="text-sm font-black font-heading text-abyss-textPrimary">{selectedRow.categoryName} — Multi-Month Trajectory</h3>
                <div className="text-[10px] text-abyss-textMuted font-mono">
                  Peak Month: {selectedRow.peakMonth} (₹{selectedRow.peakAmount.toLocaleString('en-IN')}) • Monthly Avg: ₹{selectedRow.monthlyAverage.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedRow(null)}
              className="text-xs text-abyss-textMuted hover:text-abyss-textPrimary px-2.5 py-1 rounded-lg border border-abyss-border"
            >
              Close Drawer ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {selectedRow.monthlyCells.map((cell) => (
              <div
                key={cell.monthKey}
                className={`p-3 rounded-2xl border text-center space-y-1 ${
                  cell.amount === selectedRow.peakAmount && cell.amount > 0
                    ? 'bg-pulse-500/20 border-pulse-500/40'
                    : 'bg-abyss-well border-abyss-border'
                }`}
              >
                <div className="text-[10px] font-bold text-abyss-textMuted">{cell.monthLabel}</div>
                <div className="text-xs font-mono font-black text-abyss-textPrimary">
                  {cell.amount > 0 ? `₹${cell.amount.toLocaleString('en-IN')}` : '—'}
                </div>
                {cell.amount > 0 && (
                  <div className={`text-[9px] font-mono ${cell.momDeltaPercent >= 0 ? 'text-ochre-500' : 'text-jade-500'}`}>
                    MoM: {cell.momDeltaPercent >= 0 ? '+' : ''}{cell.momDeltaPercent}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
