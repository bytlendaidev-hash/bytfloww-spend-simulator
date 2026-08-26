import React from 'react';

interface MonthTrendItem {
  monthKey: string;
  label: string;
  spend: number;
  income: number;
  count: number;
}

interface SpendMonthSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriodKey: string;
  onSelectPeriod: (key: string) => void;
  availableMonths: MonthTrendItem[];
  isDark: boolean;
}

export const SpendMonthSelector: React.FC<SpendMonthSelectorProps> = ({
  isOpen,
  onClose,
  selectedPeriodKey,
  onSelectPeriod,
  availableMonths,
  isDark,
}) => {
  if (!isOpen) return null;

  const quickRanges = [
    { key: 'ALL', label: 'All Time (Full 3,979 SMS Dataset)' },
    { key: '30D', label: 'Last 30 Days' },
    { key: '90D', label: 'Last 90 Days' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-2xl p-0 sm:p-4 animate-emergence">
      <div className="spatial-modal w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-abyss-border">
          <div>
            <h3 className="text-base font-black tracking-tight text-abyss-textPrimary">Select Spend Period</h3>
            <p className="text-xs font-medium text-abyss-textMuted">Filter by historical month or all time</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition"
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar text-xs">
          {/* Quick Ranges */}
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] block mb-2 text-abyss-textMuted">Quick Horizons</span>
            <div className="space-y-1.5">
              {quickRanges.map(r => (
                <div
                  key={r.key}
                  onClick={() => {
                    onSelectPeriod(r.key);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-150 border ${
                    selectedPeriodKey === r.key
                      ? 'bg-jade-500/15 border-jade-500/40 text-jade-500 font-black'
                      : 'bg-abyss-well hover:bg-abyss-elevated text-abyss-textSecondary border-abyss-border'
                  }`}
                >
                  <span className="font-bold">{r.label}</span>
                  {selectedPeriodKey === r.key && <span className="font-black text-jade-500">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Historical Months */}
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] block mb-2 text-abyss-textMuted">
              Historical Months Detected ({availableMonths.length})
            </span>
            <div className="space-y-1.5">
              {availableMonths.map(m => (
                <div
                  key={m.monthKey}
                  onClick={() => {
                    onSelectPeriod(m.monthKey);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-150 border ${
                    selectedPeriodKey === m.monthKey
                      ? 'bg-jade-500/15 border-jade-500/40 text-jade-500 font-black'
                      : 'bg-abyss-well hover:bg-abyss-elevated text-abyss-textSecondary border-abyss-border'
                  }`}
                >
                  <div>
                    <div className="font-black text-abyss-textPrimary">{m.label} ({m.monthKey})</div>
                    <div className="text-[10px] font-medium text-abyss-textMuted">{m.count} transactions</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-black text-abyss-textPrimary">₹{m.spend.toLocaleString('en-IN')}</div>
                    {selectedPeriodKey === m.monthKey && <span className="text-[10px] font-black text-jade-500">✓ Active</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
