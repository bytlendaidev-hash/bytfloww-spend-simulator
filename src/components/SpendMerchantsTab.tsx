import React, { useState } from 'react';
import { MerchantItem } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendMerchantsTabProps {
  merchants: MerchantItem[];
  isDark?: boolean;
  onSelectMerchant: (merchantName: string) => void;
}

export const SpendMerchantsTab: React.FC<SpendMerchantsTabProps> = ({
  merchants,
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. SEARCH & GAZE FILTER PILLS ────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search merchants, brands, platforms..."
          className="w-full px-6 py-4 pl-12 rounded-full text-sm bg-white/10 backdrop-blur-[30px] border border-white/20 text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]"
        />
        <span className="absolute left-4.5 top-4 text-sm text-white/50">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4.5 top-4 text-xs text-white/50 hover:text-white px-2 py-0.5 rounded-full bg-white/10"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Chips (Gaze Interactive) */}
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
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSelected
                  ? 'spatial-btn-selected rounded-full'
                  : 'spatial-btn'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ── 2. SUMMARY STRIP ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-base text-[#0A84FF]">🏪</span>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
            Merchant Directory & Spend DNA
          </h3>
        </div>
        <span className="text-xs text-white/50 font-medium">
          {filteredMerchants.length} detected entities
        </span>
      </div>

      {/* ── 3. VISIONOS SPATIAL TABLE WRAPPER ────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.30)]">
        <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-white/50 uppercase tracking-wider">
          <span>Merchant & Transaction Velocity</span>
          <span>Cumulative Spend</span>
        </div>

        <div className="divide-y divide-white/10">
          {filteredMerchants.map((m) => {
            const pct = totalMerchantSpend > 0 ? ((m.totalSpend / totalMerchantSpend) * 100).toFixed(1) : '0';

            return (
              <div
                key={m.name}
                onClick={() => onSelectMerchant(m.name)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <MerchantLogoView merchantName={m.name} size={42} />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-md">
                      {m.name}
                    </div>
                    <div className="text-xs text-white/50 font-medium truncate mt-0.5">
                      {m.txCount} transaction{m.txCount > 1 ? 's' : ''} • Avg ₹{m.avgTicket.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0 pl-3">
                  <div>
                    <div className="text-sm sm:text-base font-bold font-mono text-white">
                      ₹{m.totalSpend.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] font-semibold text-white/50">
                      {pct}% of spend
                    </div>
                  </div>
                  <span className="text-white/40 text-base font-bold group-hover:text-white group-hover:translate-x-0.5 transition">›</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
