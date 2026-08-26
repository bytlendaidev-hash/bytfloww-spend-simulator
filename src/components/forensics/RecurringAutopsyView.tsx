import React, { useMemo } from 'react';
import { CanonicalTransaction } from '../../types';
import { detectRecurringMandates } from '../../engine/forensicsAdvancedEngine';
import { BrandLogoBadge } from './BrandLogoBadge';

interface RecurringAutopsyViewProps {
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const RecurringAutopsyView: React.FC<RecurringAutopsyViewProps> = ({
  transactions,
  isDark,
}) => {
  const mandates = useMemo(() => {
    return detectRecurringMandates(transactions);
  }, [transactions]);

  const totalAnnualized = mandates.reduce((s, m) => s + m.annualizedCost, 0);
  const activeCount = mandates.filter(m => m.status === 'ACTIVE_MANDATE').length;

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP SUMMARY HUD ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Annualized Drain</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-rose-400">
            ₹{totalAnnualized.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Recurring commitments / year</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">Active Mandates</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-indigo-400">
            {activeCount} Subscriptions
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">Automated standing instructions</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">Total Mandates Scanned</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-amber-400">
            {mandates.length} Entities
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Recurring debit patterns</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[10px] font-bold uppercase text-emerald-400">Monthly Run Rate</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-emerald-400">
            ₹{Math.round(totalAnnualized / 12).toLocaleString('en-IN')}/mo
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Expected monthly burn</div>
        </div>
      </div>

      {/* ── RECURRING MANDATES AUTOPSY TABLE ─────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>🔄</span>
              <span>Recurring Standing Instructions & E-Mandate Autopsy</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Detected fixed recurring debits, software, utility mandates, and debt repayments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="p-3">Merchant / Mandate</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Avg Debit</th>
                <th className="p-3 text-right">Annualized Cost</th>
                <th className="p-3 text-center">Billing Day</th>
                <th className="p-3 text-center">Next Projected Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {mandates.map((m) => (
                <tr key={m.id} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <BrandLogoBadge entityName={m.name} size="sm" />
                      <div>
                        <div className="font-bold">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.occurrences} historical debits</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-slate-300">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-200">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-rose-400">
                    ₹{m.annualizedCost.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-center font-mono text-[11px]">
                    Day {m.dayOfMonth}
                  </td>
                  <td className="p-3 text-center font-mono text-[10px] text-slate-400">
                    {m.nextProjectedDate}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      m.status === 'ACTIVE_MANDATE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 30-DAY UPCOMING RENEWAL CALENDAR ──────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <h2 className="text-base font-black flex items-center gap-2 font-heading">
          <span>📅</span>
          <span>Upcoming 30-Day Renewal & Autopay Schedule</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {mandates.slice(0, 6).map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border text-center space-y-1.5 ${
                isDark ? 'bg-black/20 border-white/[0.08]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <BrandLogoBadge entityName={m.name} size="sm" className="mx-auto" />
              <div className="font-bold text-xs truncate">{m.name}</div>
              <div className="font-mono font-black text-xs text-rose-400">₹{m.amount.toLocaleString('en-IN')}</div>
              <div className="text-[10px] font-mono text-slate-400">Due: {m.nextProjectedDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
