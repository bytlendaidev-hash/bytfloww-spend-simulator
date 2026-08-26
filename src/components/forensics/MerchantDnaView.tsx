import React, { useMemo } from 'react';
import { CanonicalTransaction } from '../../types';
import { calculateMerchantDnaProfiles } from '../../engine/forensicsAdvancedEngine';
import { BrandLogoBadge } from './BrandLogoBadge';

interface MerchantDnaViewProps {
  transactions: CanonicalTransaction[];
  isDark: boolean;
}

export const MerchantDnaView: React.FC<MerchantDnaViewProps> = ({
  transactions,
  isDark,
}) => {
  const profiles = useMemo(() => {
    return calculateMerchantDnaProfiles(transactions);
  }, [transactions]);

  const totalLifestyleSpend = profiles.reduce((s, p) => s + p.totalSpend, 0);
  const totalConvenienceMarkup = profiles.reduce((s, p) => s + p.estimatedConvenienceMarkup, 0);
  const totalOrders = profiles.reduce((s, p) => s + p.orderCount, 0);

  const cardCls = `rounded-[24px] border transition-all duration-200 ${
    isDark 
      ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' 
      : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP SUMMARY HUD ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-synapse-900/20 border-synapse-500/30' : 'bg-synapse-50 border-synapse-200'}`}>
          <div className="text-[10px] font-bold uppercase text-synapse-400 light:text-synapse-700">Total Tracked Platform Spend</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-synapse-400 light:text-synapse-700">
            ₹{totalLifestyleSpend.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-synapse-400/80 mt-0.5">{totalOrders} lifetime transactions</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-ochre-900/20 border-ochre-500/30' : 'bg-ochre-50 border-ochre-200'}`}>
          <div className="text-[10px] font-bold uppercase text-ochre-500">Estimated Convenience Markup</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-ochre-500">
            ₹{totalConvenienceMarkup.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-ochre-500/80 mt-0.5">Delivery & platform markups</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-telemetry-900/20 border-telemetry-500/30' : 'bg-telemetry-50 border-telemetry-200'}`}>
          <div className="text-[10px] font-bold uppercase text-telemetry-500">Top Platform</div>
          <div className="text-xl sm:text-2xl font-black mt-1 text-telemetry-500 truncate">
            {profiles[0]?.name || 'Lifestyle'}
          </div>
          <div className="text-[10px] text-telemetry-500/80 mt-0.5">₹{profiles[0]?.totalSpend.toLocaleString('en-IN') || 0} total</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-jade-900/20 border-jade-500/30' : 'bg-jade-50 border-jade-200'}`}>
          <div className="text-[10px] font-bold uppercase text-jade-500">Average Ticket Size</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-jade-500">
            ₹{totalOrders > 0 ? Math.round(totalLifestyleSpend / totalOrders).toLocaleString('en-IN') : 0}
          </div>
          <div className="text-[10px] text-jade-500/80 mt-0.5">Overall average order value</div>
        </div>
      </div>

      {/* ── MERCHANT DNA PROFILES GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p) => (
          <div key={p.id} className={`p-5 ${cardCls} space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <BrandLogoBadge entityName={p.name} size="md" />
                <div>
                  <h3 className="text-sm font-black font-heading text-abyss-textPrimary">{p.name}</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-abyss-well text-abyss-textSecondary border border-abyss-border">
                    {p.category.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black font-mono text-synapse-400 light:text-synapse-700">
                  ₹{p.totalSpend.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-abyss-textMuted">{p.orderCount} orders</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl border bg-abyss-well border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Avg Order Value (AOV)</div>
                <div className="font-mono font-black mt-0.5 text-abyss-textPrimary">₹{p.averageOrderValue.toLocaleString('en-IN')}</div>
              </div>

              <div className="p-2.5 rounded-xl border bg-abyss-well border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Order Cadence</div>
                <div className="font-mono font-black mt-0.5 text-abyss-textPrimary">{p.monthlyOrderFrequency} orders/mo</div>
              </div>

              <div className="p-2.5 rounded-xl border bg-abyss-well border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Convenience Premium</div>
                <div className="font-mono font-black text-ochre-500 mt-0.5">₹{p.estimatedConvenienceMarkup.toLocaleString('en-IN')}</div>
              </div>

              <div className="p-2.5 rounded-xl border bg-abyss-well border-abyss-border">
                <div className="text-[9px] uppercase font-bold text-abyss-textMuted">Active Span</div>
                <div className="text-[10px] font-mono text-abyss-textSecondary mt-0.5 truncate">{p.firstOrderDate.substring(5)} → {p.lastOrderDate.substring(5)}</div>
              </div>
            </div>

            {/* Share of Lifestyle Outflow Progress Bar (Solid Synapse Iris) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-abyss-textMuted">
                <span>Share of Lifestyle</span>
                <span className="font-bold text-synapse-400 light:text-synapse-700">{((p.totalSpend / Math.max(1, totalLifestyleSpend)) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-abyss-canvas overflow-hidden">
                <div 
                  className="h-full rounded-full bg-synapse-500"
                  style={{ width: `${Math.max(5, (p.totalSpend / Math.max(1, totalLifestyleSpend)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
