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

  const colors = ['#E91E63', '#3F51B5', '#00BCD4', '#009688', '#FF5722', '#FF9800', '#9E9E9E'];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── 1. SEARCH & FILTER BAR ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchants..."
            className={`w-full px-5 py-3.5 pl-11 rounded-2xl text-xs sm:text-sm outline-none border transition backdrop-blur-xl ${
              isDark 
                ? 'bg-[#10181E]/85 border-white/[0.08] text-white placeholder-slate-500 focus:border-cyan-500/50 shadow-xl shadow-black/40' 
                : 'bg-white border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-[#00BFA5] shadow-sm'
            }`}
          />
          <span className="absolute left-4 top-3.5 text-xs text-slate-400">🔍</span>
        </div>

        <button className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-sm backdrop-blur-xl ${
          isDark ? 'bg-[#10181E]/85 border-white/[0.08] text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          ⚡
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'FREQUENT', label: 'Frequent' },
          { key: 'RECURRING', label: 'Recurring' },
          { key: 'TOP_AVG', label: 'Top Avg' },
        ].map((chip) => {
          const isSelected = filterType === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => setFilterType(chip.key as any)}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition border ${
                isSelected
                  ? isDark
                    ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5] shadow-md shadow-teal-500/20'
                    : 'bg-[#0D9488] text-white border-[#0D9488] shadow-md'
                  : isDark
                  ? 'border-[#273B49] text-slate-300 bg-[#152028] hover:bg-[#1C2C38] hover:text-white'
                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm'
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
          <span className={`text-base ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}>🏪</span>
          <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Merchant Directory
          </h3>
        </div>
        <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {filteredMerchants.length} entities
        </span>
      </div>

      {/* ── 3. MERCHANT CARDS LIST ─────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredMerchants.map((m, idx) => {
          const accentColor = colors[idx % colors.length];
          const pct = totalMerchantSpend > 0 ? ((m.totalSpend / totalMerchantSpend) * 100).toFixed(1) : '0';

          return (
            <div
              key={m.name}
              onClick={() => onSelectMerchant(m.name)}
              style={{ borderLeftColor: accentColor, borderLeftWidth: '4px' }}
              className={`p-4.5 rounded-[24px] border transition cursor-pointer flex items-center justify-between hover:scale-[1.01] ${
                isDark 
                  ? 'bg-[#121B22] border-[#22323D] hover:border-[#00BFA5]/40 hover:bg-[#18242D]' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <MerchantLogoView merchantName={m.name} size={44} isDark={isDark} />
                <div>
                  <div className={`text-xs sm:text-sm font-black tracking-tight truncate max-w-[180px] sm:max-w-xs ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {m.name}
                  </div>
                  <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {m.txCount} transaction{m.txCount > 1 ? 's' : ''} • Avg ₹{m.avgTicket.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className={`text-xs sm:text-sm font-black font-mono ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    ₹{m.totalSpend.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-bold" style={{ color: accentColor }}>
                    {pct}% of total
                  </div>
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>›</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
