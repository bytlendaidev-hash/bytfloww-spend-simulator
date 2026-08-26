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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div 
        className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl border transition-all duration-200 animate-fade-in ${
          isDark 
            ? 'bg-[#10181E] border-white/[0.08] text-white shadow-black/80' 
            : 'bg-white border-slate-200/90 text-slate-900 shadow-xl'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}>
          <div>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Select Spend Period</h3>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filter by historical month or all time</p>
          </div>
          <button 
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar text-xs">
          {/* Quick Ranges */}
          <div>
            <span className={`font-black uppercase tracking-wider text-[10px] block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Horizons</span>
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
                      ? isDark
                        ? 'bg-brand-viridian/15 border-brand-viridian/40 text-brand-viridian font-black'
                        : 'bg-emerald-50 border-brand-300 text-brand-800 font-black shadow-sm'
                      : isDark
                      ? 'bg-[#142027] hover:bg-[#1a2832] text-slate-300 border-white/[0.06]'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-sm'
                  }`}
                >
                  <span className="font-bold">{r.label}</span>
                  {selectedPeriodKey === r.key && <span className="font-black text-brand-viridian dark:text-brand-viridian">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Historical Months */}
          <div>
            <span className={`font-black uppercase tracking-wider text-[10px] block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                      ? isDark
                        ? 'bg-brand-viridian/15 border-brand-viridian/40 text-brand-viridian font-black'
                        : 'bg-emerald-50 border-brand-300 text-brand-800 font-black shadow-sm'
                      : isDark
                      ? 'bg-[#142027] hover:bg-[#1a2832] text-slate-300 border-white/[0.06]'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="font-black">{m.label} ({m.monthKey})</div>
                    <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{m.count} transactions</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-black">₹{m.spend.toLocaleString('en-IN')}</div>
                    {selectedPeriodKey === m.monthKey && <span className={`text-[10px] font-black ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>✓ Active</span>}
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

