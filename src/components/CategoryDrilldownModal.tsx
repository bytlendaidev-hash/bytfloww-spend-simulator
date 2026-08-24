import React from 'react';
import { CategoryBreakdownItem, FinancialEvent } from '../types';

interface CategoryDrilldownModalProps {
  category: CategoryBreakdownItem | null;
  events: FinancialEvent[];
  isDark: boolean;
  onClose: () => void;
  onSelectEvent: (event: FinancialEvent) => void;
}

export const CategoryDrilldownModal: React.FC<CategoryDrilldownModalProps> = ({
  category,
  events,
  isDark,
  onClose,
  onSelectEvent,
}) => {
  if (!category) return null;

  const categoryEvents = events.filter(e => e.category === category.category && e.direction === 'OUTFLOW');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl max-h-[85vh] rounded-[32px] border shadow-2xl flex flex-col overflow-hidden transition ${
        isDark ? 'bg-[#0E1C23] border-cyan-500/20 text-[#E2ECEF]' : 'bg-white border-slate-200 text-[#0F172A]'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-white/5' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg"
              style={{ backgroundColor: `${category.color}25`, color: category.color }}
            >
              ●
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{category.category}</h3>
              <p className={`text-xs ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
                {category.eventCount} transactions • {category.pct}% of period spend
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Summary Metric Banner */}
        <div className={`p-6 flex items-center justify-between border-b ${
          isDark ? 'bg-[#12232B]/80 border-white/5' : 'bg-slate-50 border-slate-100'
        }`}>
          <div>
            <span className={`text-xs uppercase font-semibold ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Total Category Outflow</span>
            <div className={`text-2xl sm:text-3xl font-black font-mono mt-0.5 ${isDark ? 'text-[#00F2FE]' : 'text-[#0284C7]'}`}>
              ₹{category.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs uppercase font-semibold ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Average Ticket</span>
            <div className={`text-lg font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              ₹{category.avgTicket.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
            Transactions ({categoryEvents.length})
          </div>

          {categoryEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                onClose();
                onSelectEvent(ev);
              }}
              className={`p-3.5 rounded-2xl cursor-pointer border transition flex items-center justify-between ${
                isDark 
                  ? 'bg-[#12232B] border-white/5 hover:border-cyan-500/30' 
                  : 'bg-[#F8FAFC] border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isDark ? 'bg-cyan-500/20 text-[#00F2FE]' : 'bg-cyan-100 text-[#0284C7]'
                }`}>
                  ↑
                </div>
                <div>
                  <div className={`text-xs font-bold truncate max-w-[200px] ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{ev.merchant}</div>
                  <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>{ev.dateFormatted} • {ev.paymentMode} {ev.accountHint && `(*${ev.accountHint})`}</div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  -₹{ev.amount.toLocaleString('en-IN')}
                </div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-[#00F2FE]' : 'text-[#0284C7]'}`}>Inspect Forensics →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
