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

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP VARIANCE SUMMARY HUD ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
          <div className="text-[10px] font-bold uppercase text-rose-400">Peak Outflow Month</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-rose-400 truncate">
            {matrix.peakOutflowMonth.label}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5 font-mono">
            ₹{matrix.peakOutflowMonth.amount.toLocaleString('en-IN')} total debits
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[10px] font-bold uppercase text-emerald-400">Lowest Outflow Month</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-emerald-400 truncate">
            {matrix.lowestOutflowMonth.label}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 font-mono">
            ₹{matrix.lowestOutflowMonth.amount.toLocaleString('en-IN')} total debits
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">Timeline Breadth</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-indigo-400">
            {matrix.months.length} Months
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">
            {matrix.months[0]?.label} → {matrix.months[matrix.months.length - 1]?.label}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">Tracked Outflow Categories</div>
          <div className="text-lg sm:text-2xl font-black font-mono mt-1 text-amber-400">
            {matrix.rows.length} Buckets
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Lifestyle & Debt movement</div>
        </div>
      </div>

      {/* ── COMPARATIVE VARIANCE HEATMAP TABLE ───────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>📊</span>
              <span>17-Month Category Variance Heatmap & MoM Delta Matrix</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Color-coded heat intensities indicate spending concentration. Green/Rose chips denote Month-over-Month % shifts.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="p-3 sticky left-0 z-10 bg-inherit min-w-[200px]">Category & Channel</th>
                <th className="p-3 text-right">Avg / Mo</th>
                {matrix.months.map((m) => (
                  <th key={m.key} className="p-2.5 text-center min-w-[85px] font-mono">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {matrix.rows.map((row) => (
                <tr 
                  key={row.categoryId}
                  onClick={() => setSelectedRow(selectedRow?.categoryId === row.categoryId ? null : row)}
                  className={`cursor-pointer transition-colors ${
                    selectedRow?.categoryId === row.categoryId
                      ? (isDark ? 'bg-indigo-950/40' : 'bg-indigo-50')
                      : (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50')
                  }`}
                >
                  <td className="p-3 sticky left-0 z-10 bg-inherit font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{row.icon}</span>
                      <div>
                        <div className="truncate">{row.categoryName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          ₹{row.totalPeriodSpend.toLocaleString('en-IN')} total
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-slate-300">
                    ₹{row.monthlyAverage.toLocaleString('en-IN')}
                  </td>

                  {row.monthlyCells.map((cell) => {
                    // Calculate cell heat background color
                    let heatBg = 'transparent';
                    if (row.categoryId === 'salary' || row.categoryId === 'epfo') {
                      heatBg = cell.amount > 0 ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)') : 'transparent';
                    } else if (cell.heatScore > 0.6) {
                      heatBg = isDark ? `rgba(244, 63, 94, ${cell.heatScore * 0.35})` : `rgba(244, 63, 94, ${cell.heatScore * 0.25})`;
                    } else if (cell.heatScore > 0.2) {
                      heatBg = isDark ? `rgba(245, 158, 11, ${cell.heatScore * 0.25})` : `rgba(245, 158, 11, ${cell.heatScore * 0.18})`;
                    }

                    return (
                      <td
                        key={cell.monthKey}
                        style={{ backgroundColor: heatBg }}
                        className="p-2 text-center font-mono border-l border-white/[0.04] transition-colors"
                      >
                        <div className="font-bold text-[11px]">
                          {cell.amount > 0 ? `₹${cell.amount.toLocaleString('en-IN')}` : '—'}
                        </div>
                        {cell.amount > 0 && cell.momDeltaPercent !== 0 && (
                          <div className={`text-[8px] font-black mt-0.5 ${
                            cell.momDeltaPercent > 0 
                              ? (row.categoryId === 'salary' ? 'text-emerald-400' : 'text-rose-400')
                              : (row.categoryId === 'salary' ? 'text-rose-400' : 'text-emerald-400')
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
        <div className={`p-5 sm:p-6 ${cardCls} space-y-4 animate-fade-in border-indigo-500/40`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedRow.icon}</span>
              <div>
                <h3 className="text-sm font-black font-heading">{selectedRow.categoryName} — Multi-Month Trajectory</h3>
                <div className="text-[10px] text-slate-400 font-mono">
                  Peak Month: {selectedRow.peakMonth} (₹{selectedRow.peakAmount.toLocaleString('en-IN')}) • Monthly Avg: ₹{selectedRow.monthlyAverage.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedRow(null)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10"
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
                    ? (isDark ? 'bg-rose-950/30 border-rose-500/40' : 'bg-rose-50 border-rose-300')
                    : (isDark ? 'bg-black/20 border-white/[0.06]' : 'bg-white border-slate-200')
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400">{cell.monthLabel}</div>
                <div className="text-xs font-mono font-black">
                  {cell.amount > 0 ? `₹${cell.amount.toLocaleString('en-IN')}` : '—'}
                </div>
                {cell.amount > 0 && (
                  <div className={`text-[9px] font-mono ${cell.momDeltaPercent >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
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
