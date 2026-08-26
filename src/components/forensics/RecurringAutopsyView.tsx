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

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP SUMMARY HUD ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-pulse-900/20 border-pulse-500/30' : 'bg-pulse-50 border-pulse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-pulse-500">Total Annualized Drain</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-pulse-500">
            ₹{totalAnnualized.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-pulse-500/80 mt-0.5">Recurring commitments / year</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-synapse-900/20 border-synapse-500/30' : 'bg-synapse-50 border-synapse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-synapse-400 light:text-synapse-700">Active Mandates</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-synapse-400 light:text-synapse-700">
            {activeCount} Subscriptions
          </div>
          <div className="text-[10px] text-synapse-400/80 mt-0.5">Automated standing instructions</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="text-[10px] font-bold uppercase text-ochre-500">Total Mandates Scanned</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-ochre-500">
            {mandates.length} Entities
          </div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">Recurring debit patterns</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-jade-900/20 border-jade-500/30' : 'bg-jade-50 border-jade-200'}`}>
          <div className="text-[10px] font-bold uppercase text-jade-500">Monthly Run Rate</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-jade-500">
            ₹{Math.round(totalAnnualized / 12).toLocaleString('en-IN')}/mo
          </div>
          <div className="text-[10px] text-jade-500/80 mt-0.5">Expected monthly burn</div>
        </div>
      </div>

      {/* ── RECURRING MANDATES AUTOPSY TABLE ─────────────────────────────── */}
      <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
              <span>🔄</span>
              <span>Recurring Standing Instructions & E-Mandate Autopsy</span>
            </h2>
            <p className="text-xs mt-0.5 text-abyss-textMuted">
              Detected fixed recurring debits, software, utility mandates, and debt repayments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b font-black text-[10px] uppercase tracking-wider border-abyss-border text-abyss-textMuted">
                <th className="p-3">Merchant / Mandate</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Avg Debit</th>
                <th className="p-3 text-right">Annualized Cost</th>
                <th className="p-3 text-center">Billing Day</th>
                <th className="p-3 text-center">Next Projected Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-abyss-border">
              {mandates.map((m) => (
                <tr key={m.id} className="hover:bg-abyss-well transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <BrandLogoBadge entityName={m.name} size="sm" />
                      <div>
                        <div className="font-bold text-abyss-textPrimary">{m.name}</div>
                        <div className="text-[10px] text-abyss-textMuted">{m.occurrences} historical debits</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-abyss-well text-abyss-textSecondary border border-abyss-border">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-abyss-textPrimary">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-pulse-500">
                    ₹{m.annualizedCost.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-center font-mono text-[11px] text-abyss-textPrimary">
                    Day {m.dayOfMonth}
                  </td>
                  <td className="p-3 text-center font-mono text-[10px] text-abyss-textMuted">
                    {m.nextProjectedDate}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      m.status === 'ACTIVE_MANDATE'
                        ? 'bg-jade-500/20 text-jade-500 border border-jade-500/30'
                        : 'bg-abyss-well text-abyss-textMuted border border-abyss-border'
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
        <h2 className="text-base font-black flex items-center gap-2 font-heading text-abyss-textPrimary">
          <span>📅</span>
          <span>Upcoming 30-Day Renewal & Autopay Schedule</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {mandates.slice(0, 6).map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl border text-center space-y-1.5 bg-abyss-well border-abyss-border"
            >
              <BrandLogoBadge entityName={m.name} size="sm" className="mx-auto" />
              <div className="font-bold text-xs truncate text-abyss-textPrimary">{m.name}</div>
              <div className="font-mono font-black text-xs text-pulse-500">₹{m.amount.toLocaleString('en-IN')}</div>
              <div className="text-[10px] font-mono text-abyss-textMuted">Due: {m.nextProjectedDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
