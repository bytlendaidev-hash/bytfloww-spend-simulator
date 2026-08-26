import React, { useState } from 'react';
import { MerchantItem } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendMerchantsTabProps {
  merchants: MerchantItem[];
  isDark: boolean;
  onSelectMerchant: (merchantName: string) => void;
}

export const SpendMerchantsTab: React.FC<SpendMerchantsTabProps> = ({
  merchants,
  isDark,
  onSelectMerchant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'FREQUENT' | 'RECURRING' | 'TOP_AVG'>('ALL');

  const filteredMerchants = merchants.filter(m => {
    if (searchQuery.trim()) {
      const match = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (filterType === 'FREQUENT' && m.txCount < 3) return false;
    if (filterType === 'TOP_AVG' && m.avgTicket < 1000) return false;
    return true;
  });

  const totalMerchantSpend = merchants.reduce((s, m) => s + m.totalSpend, 0);

  const colors = ['#059669', '#4F46E5', '#D97706', '#E11D48', '#2563EB', '#0284C7', '#7C3AED'];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8 animate-emergence">
      {/* ── 1. SEARCH & FILTER BAR ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchants, brands, platforms..."
            className={`w-full px-5 py-3.5 pl-11 rounded-2xl text-xs sm:text-sm outline-none border transition-all duration-200 backdrop-blur-xl ${
              isDark 
                ? 'bg-[#0E1720]/80 border-white/[0.1] text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 shadow-inner' 
                : 'bg-white/90 border-slate-200/90 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm'
            }`}
          />
          <span className="absolute left-4 top-3.5 text-xs text-slate-400">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded-full"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        {[
          { key: 'ALL', label: 'All Merchants' },
          { key: 'FREQUENT', label: 'Frequent (≥3 txns)' },
          { key: 'RECURRING', label: 'Recurring Subscriptions' },
          { key: 'TOP_AVG', label: 'High Ticket (≥₹1k avg)' },
        ].map((chip) => {
          const isSelected = filterType === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => setFilterType(chip.key as any)}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition-all duration-150 border flex-shrink-0 active:scale-95 backdrop-blur-xl ${
                isSelected
                  ? isDark
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 border-emerald-400/50 shadow-md shadow-emerald-500/25'
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : isDark
                  ? 'border-white/[0.08] text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white'
                  : 'border-slate-200/90 text-slate-700 bg-white/80 hover:bg-white hover:text-slate-900 shadow-sm'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ── 2. MERCHANT DIRECTORY HEADER ───────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-base text-emerald-400">🏪</span>
          <h3 className={`text-base font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Merchant Directory & Spend DNA
          </h3>
        </div>
        <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {filteredMerchants.length} detected entities
        </span>
      </div>

      {/* ── 3. MERCHANT CARDS LIST ─────────────────────────────────────── */}
      <div className="space-y-2.5">
        {filteredMerchants.map((m, idx) => {
          const accentColor = colors[idx % colors.length];
          const pct = totalMerchantSpend > 0 ? ((m.totalSpend / totalMerchantSpend) * 100).toFixed(1) : '0';

          return (
            <div
              key={m.name}
              onClick={() => onSelectMerchant(m.name)}
              style={{ borderLeftColor: accentColor, borderLeftWidth: '4px' }}
              className={`p-4 rounded-[24px] border transition-all duration-200 cursor-pointer flex items-center justify-between hover:scale-[1.005] active:scale-[0.99] group backdrop-blur-xl ${
                isDark 
                  ? 'bg-white/[0.03] border-white/[0.06] hover:border-emerald-400/40 hover:bg-white/[0.06] shadow-sm' 
                  : 'bg-white/85 border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <MerchantLogoView merchantName={m.name} size={42} isDark={isDark} />
                <div className="min-w-0">
                  <div className={`text-xs sm:text-sm font-black font-heading tracking-tight truncate max-w-[180px] sm:max-w-xs ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {m.name}
                  </div>
                  <div className={`text-[11px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {m.txCount} transaction{m.txCount > 1 ? 's' : ''} • Avg ₹{m.avgTicket.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right flex-shrink-0 pl-2">
                <div>
                  <div className={`text-xs sm:text-sm font-black font-mono ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    ₹{m.totalSpend.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-black" style={{ color: accentColor }}>
                    {pct}% of spend
                  </div>
                </div>
                <span className={`text-sm font-black ${isDark ? 'text-slate-400' : 'text-slate-400'} group-hover:translate-x-0.5 transition-transform`}>›</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


