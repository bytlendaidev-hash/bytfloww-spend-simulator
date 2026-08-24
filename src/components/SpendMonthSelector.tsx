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
        className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border transition-all animate-fade-in ${
          isDark 
            ? 'bg-[#0E1C23] border-cyan-500/20 text-[#E2ECEF]' 
            : 'bg-white border-slate-200 text-[#0F172A]'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-white/10' : 'border-slate-100'
        }`}>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Select Spend Period</h3>
            <p className={`text-xs ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Filter by historical month or all time</p>
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
            <span className={`font-semibold block mb-2 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Quick Horizons</span>
            <div className="space-y-1.5">
              {quickRanges.map(r => (
                <div
                  key={r.key}
                  onClick={() => {
                    onSelectPeriod(r.key);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition border ${
                    selectedPeriodKey === r.key
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/40 text-[#00F2FE] font-bold'
                      : isDark
                      ? 'bg-[#12232B] hover:bg-[#152a35] text-slate-200 border-white/5'
                      : 'bg-[#F8FAFC] hover:bg-slate-100 text-slate-800 border-slate-200/80'
                  }`}
                >
                  <span>{r.label}</span>
                  {selectedPeriodKey === r.key && <span>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Historical Months */}
          <div>
            <span className={`font-semibold block mb-2 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Historical Months Detected ({availableMonths.length})</span>
            <div className="space-y-1.5">
              {availableMonths.map(m => (
                <div
                  key={m.monthKey}
                  onClick={() => {
                    onSelectPeriod(m.monthKey);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition border ${
                    selectedPeriodKey === m.monthKey
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/40 text-[#00F2FE] font-bold'
                      : isDark
                      ? 'bg-[#12232B] hover:bg-[#152a35] text-slate-200 border-white/5'
                      : 'bg-[#F8FAFC] hover:bg-slate-100 text-slate-800 border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="font-bold">{m.label} ({m.monthKey})</div>
                    <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>{m.count} transactions</div>
                  </div>
                  <div className="text-right font-mono">
                    <div>₹{m.spend.toLocaleString('en-IN')}</div>
                    {selectedPeriodKey === m.monthKey && <span className="text-[#00F2FE] text-xs">✓ Active</span>}
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
