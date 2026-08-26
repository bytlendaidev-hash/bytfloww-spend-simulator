/**
 * Where100WentChart — Interactive "Where Every ₹100 Went" visualization.
 * Pure SVG donut chart + bar list. 100% Solid zero-gradient design tokens.
 */

import React, { useState } from 'react';
import { LiveAnalyticsResult, Where100WentItem } from '../../engine/analyticsEngine';

interface Where100WentChartProps {
  liveResult: LiveAnalyticsResult | null;
  isDark: boolean;
  demoItems?: Array<{
    category: string;
    amount: number;
    rupees: number;
    percentage: number;
    color: string;
    isLifestyle: boolean;
    isMoneyMovement: boolean;
  }>;
}

// Build SVG donut paths from data
function buildDonutPaths(items: Where100WentItem[], cx: number, cy: number, r: number, innerR: number) {
  let startAngle = -Math.PI / 2;
  const paths: { path: string; color: string; item: Where100WentItem }[] = [];
  const total = items.reduce((s, i) => s + i.amount, 0);

  for (const item of items) {
    if (item.amount <= 0) continue;
    const angle = (item.amount / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    paths.push({ path, color: item.color, item });
    startAngle = endAngle;
  }

  return paths;
}

export const Where100WentChart: React.FC<Where100WentChartProps> = ({ liveResult, isDark, demoItems }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'ALL' | 'LIFESTYLE' | 'MONEY_MOVEMENT'>('ALL');

  const cardCls = `rounded-[24px] border transition-all duration-200 ${isDark ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary shadow-solid-card-dark' : 'bg-white border-alabaster-border text-alabaster-textPrimary shadow-solid-card-light'}`;

  // Use live data or demoItems if provided
  const rawItems: Where100WentItem[] = liveResult
    ? liveResult.where100Went
    : (demoItems?.map(d => ({ ...d, txIds: [] })) || []);

  if (!rawItems || rawItems.length === 0) {
    return (
      <div className={`p-8 text-center ${cardCls} space-y-3`}>
        <div className="text-3xl">🎯</div>
        <h3 className="text-base font-black">Where Every ₹100 Went</h3>
        <p className="text-xs max-w-md mx-auto text-abyss-textMuted">
          No statement data loaded yet. Upload your bank statements to generate an interactive decomposition of lifestyle consumption vs. money movements.
        </p>
      </div>
    );
  }

  const displayItems = rawItems.filter(i => {
    if (viewMode === 'ALL') return true;
    if (viewMode === 'LIFESTYLE') return i.isLifestyle;
    if (viewMode === 'MONEY_MOVEMENT') return i.isMoneyMovement;
    return true;
  });

  // Recompute percentages for filtered view
  const filteredTotal = displayItems.reduce((s, i) => s + i.amount, 0);
  const items: Where100WentItem[] = displayItems.map(i => ({
    ...i,
    percentage: filteredTotal > 0 ? (i.amount / filteredTotal) * 100 : 0,
    rupees: filteredTotal > 0 ? Math.round((i.amount / filteredTotal) * 10000) / 100 : 0,
  }));

  const cx = 120, cy = 120, r = 100, innerR = 62;
  const paths = buildDonutPaths(items as Where100WentItem[], cx, cy, r, innerR);

  const totalDebits = rawItems.reduce((s, i) => s + i.amount, 0);
  const lifestyleAmt = rawItems.filter(i => i.isLifestyle).reduce((s, i) => s + i.amount, 0);
  const moneyMvtAmt = rawItems.filter(i => i.isMoneyMovement).reduce((s, i) => s + i.amount, 0);
  const lifestylePct = totalDebits > 0 ? (lifestyleAmt / totalDebits) * 100 : 0;
  const moneyMvtPct = totalDebits > 0 ? (moneyMvtAmt / totalDebits) * 100 : 0;

  const hovered = hoveredCategory ? items.find(i => i.category === hoveredCategory) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`p-5 sm:p-6 ${cardCls}`}>
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="text-base font-black">🎯 Where Every ₹100 Went</h2>
            <p className="text-[11px] mt-0.5 text-abyss-textMuted">
              Total outflows: ₹{totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="p-1 rounded-2xl border flex gap-1 bg-abyss-well border-abyss-border">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'LIFESTYLE', label: 'Lifestyle' },
              { id: 'MONEY_MOVEMENT', label: 'Money Movement' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as typeof viewMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  viewMode === v.id
                    ? 'bg-jade-500 text-abyss-canvas shadow-solid-sm'
                    : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stat Pills */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-2xl border bg-jade-500/10 border-jade-500/20">
            <div className="text-[10px] font-black uppercase text-jade-500">True Lifestyle</div>
            <div className="text-lg font-black font-mono text-jade-500">₹{(lifestylePct).toFixed(1)}</div>
            <div className="text-[10px] text-abyss-textMuted">per ₹100 spent</div>
          </div>
          <div className="p-3 rounded-2xl border bg-synapse-500/10 border-synapse-500/20">
            <div className="text-[10px] font-black uppercase text-synapse-500">Money Movement</div>
            <div className="text-lg font-black font-mono text-synapse-500">₹{(moneyMvtPct).toFixed(1)}</div>
            <div className="text-[10px] text-abyss-textMuted">per ₹100 spent</div>
          </div>
          <div className="p-3 rounded-2xl border bg-abyss-well border-abyss-border">
            <div className="text-[10px] font-black uppercase text-abyss-textMuted">Categories</div>
            <div className="text-lg font-black font-mono text-abyss-textPrimary">{rawItems.length}</div>
            <div className="text-[10px] text-abyss-textMuted">distinct buckets</div>
          </div>
        </div>

        {/* Donut Chart + Legend */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* SVG Donut */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
              {paths.map(({ path, color, item }, idx) => (
                <path
                  key={idx}
                  d={path}
                  fill={color}
                  opacity={hoveredCategory && hoveredCategory !== item.category ? 0.4 : 1}
                  style={{
                    transform: hoveredCategory === item.category ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              ))}

              {/* Center label */}
              <text x={cx} y={cy - 10} textAnchor="middle" className="font-black fill-abyss-textPrimary" fontSize="11" fontWeight="900">
                {hovered ? `₹${hovered.rupees.toFixed(1)}` : '₹100'}
              </text>
              <text x={cx} y={cy + 6} textAnchor="middle" className="fill-abyss-textSecondary" fontSize="9">
                {hovered ? hovered.category.substring(0, 16) : 'per ₹100 outflow'}
              </text>
              {hovered && (
                <text x={cx} y={cy + 20} textAnchor="middle" fill={hovered.color} fontSize="8" fontWeight="700">
                  {hovered.percentage.toFixed(1)}%
                </text>
              )}
            </svg>
          </div>

          {/* Bar List */}
          <div className="flex-1 min-w-0 space-y-2 w-full">
            {items
              .sort((a, b) => b.amount - a.amount)
              .map(item => (
                <div
                  key={item.category}
                  className={`group cursor-pointer transition-all ${hoveredCategory === item.category ? 'opacity-100' : hoveredCategory ? 'opacity-50' : 'opacity-100'}`}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-semibold truncate text-abyss-textPrimary">
                        {item.category}
                      </span>
                      {item.isLifestyle && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black shrink-0 bg-jade-500/15 text-jade-500">
                          LIFESTYLE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono font-black text-abyss-textPrimary">
                        ₹{item.rupees.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-mono text-abyss-textMuted">
                        {item.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] font-mono text-abyss-textMuted">
                        ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-abyss-well">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Category Detail Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.sort((a, b) => b.amount - a.amount).map(item => (
          <div
            key={item.category}
            onClick={() => setHoveredCategory(hoveredCategory === item.category ? null : item.category)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              isDark ? 'bg-abyss-card border-abyss-border hover:border-jade-500/40' : 'bg-white border-alabaster-border shadow-solid-sm hover:border-jade-700/40'
            } ${hoveredCategory === item.category ? 'ring-1 ring-jade-500' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <div className="text-[10px] font-black truncate text-abyss-textSecondary">
                {item.category}
              </div>
            </div>
            <div className="text-lg font-black font-mono" style={{ color: item.color }}>
              ₹{item.rupees.toFixed(1)}
            </div>
            <div className="text-[10px] mt-0.5 font-mono text-abyss-textMuted">
              per ₹100 • {item.percentage.toFixed(1)}%
            </div>
            <div className="text-[10px] font-mono text-abyss-textMuted">
              ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} total
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
