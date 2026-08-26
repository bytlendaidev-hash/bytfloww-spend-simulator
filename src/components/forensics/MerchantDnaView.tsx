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

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP SUMMARY HUD ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-purple-950/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
          <div className="text-[10px] font-bold uppercase text-purple-400">Total Tracked Platform Spend</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-purple-400">
            ₹{totalLifestyleSpend.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-purple-400/80 mt-0.5">{totalOrders} lifetime transactions</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">Estimated Convenience Markup</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-amber-400">
            ₹{totalConvenienceMarkup.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Delivery & platform markups</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="text-[10px] font-bold uppercase text-indigo-400">Top Platform</div>
          <div className="text-xl sm:text-2xl font-black mt-1 text-indigo-400 truncate">
            {profiles[0]?.name || 'Lifestyle'}
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">₹{profiles[0]?.totalSpend.toLocaleString('en-IN') || 0} total</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[10px] font-bold uppercase text-emerald-400">Average Ticket Size</div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-emerald-400">
            ₹{totalOrders > 0 ? Math.round(totalLifestyleSpend / totalOrders).toLocaleString('en-IN') : 0}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Overall average order value</div>
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
                  <h3 className="text-sm font-black font-heading">{p.name}</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-black/20 text-slate-300">
                    {p.category.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black font-mono text-purple-400">
                  ₹{p.totalSpend.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">{p.orderCount} orders</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Avg Order Value (AOV)</div>
                <div className="font-mono font-black mt-0.5">₹{p.averageOrderValue.toLocaleString('en-IN')}</div>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Order Cadence</div>
                <div className="font-mono font-black mt-0.5">{p.monthlyOrderFrequency} orders/mo</div>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Convenience Premium</div>
                <div className="font-mono font-black text-amber-400 mt-0.5">₹{p.estimatedConvenienceMarkup.toLocaleString('en-IN')}</div>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[9px] uppercase font-bold text-slate-400">Active Span</div>
                <div className="text-[10px] font-mono text-slate-300 mt-0.5 truncate">{p.firstOrderDate.substring(5)} → {p.lastOrderDate.substring(5)}</div>
              </div>
            </div>

            {/* Share of Lifestyle Outflow Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Share of Lifestyle</span>
                <span className="font-bold text-purple-400">{((p.totalSpend / Math.max(1, totalLifestyleSpend)) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800/40 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
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
