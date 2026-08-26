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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className={`w-full max-w-2xl max-h-[85vh] rounded-[32px] border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/95 border-emerald-500/30 text-white shadow-2xl shadow-black/80' : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl'
      }`}>
        {/* Header */}
        <div className={`p-6 sm:p-7 border-b flex items-center justify-between ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm"
              style={{ backgroundColor: `${category.color}25`, color: category.color }}
            >
              ●
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.category}</h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {category.eventCount} transactions • {category.pct}% of period spend
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Summary Metric Banner */}
        <div className={`p-6 flex items-center justify-between border-b ${
          isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
        }`}>
          <div>
            <span className={`text-[11px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Category Outflow</span>
            <div className={`text-2xl sm:text-3xl font-black font-mono mt-0.5 ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>
              ₹{category.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[11px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Average Ticket</span>
            <div className={`text-lg font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{category.avgTicket.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 no-scrollbar">
          <div className={`text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Transactions ({categoryEvents.length})
          </div>

          {categoryEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                onClose();
                onSelectEvent(ev);
              }}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all duration-150 flex items-center justify-between ${
                isDark 
                  ? 'bg-[#142027] border-white/[0.06] hover:border-brand-viridian/40' 
                  : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                  isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-50 text-rose-600'
                }`}>
                  ↑
                </div>
                <div>
                  <div className={`text-xs font-black truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{ev.merchant}</div>
                  <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ev.dateFormatted} • {ev.paymentMode} {ev.accountHint && `(*${ev.accountHint})`}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                  -₹{ev.amount.toLocaleString('en-IN')}
                </div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>Inspect Forensics →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

