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
      <div className="spatial-modal w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-abyss-border flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm"
              style={{ backgroundColor: `${category.color}25`, color: category.color }}
            >
              ●
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-abyss-textPrimary">{category.category}</h3>
              <p className="text-xs font-medium text-abyss-textMuted">
                {category.eventCount} transactions • {category.pct}% of period spend
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition-all duration-150"
          >
            ✕
          </button>
        </div>

        {/* Summary Metric Banner */}
        <div className="p-6 flex items-center justify-between border-b border-abyss-border bg-abyss-well">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-abyss-textMuted">Total Category Outflow</span>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5 text-jade-500">
              ₹{category.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase font-bold tracking-wider text-abyss-textMuted">Average Ticket</span>
            <div className="text-lg font-black font-mono mt-0.5 text-abyss-textPrimary">
              ₹{category.avgTicket.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 no-scrollbar">
          <div className="text-xs font-black uppercase tracking-wider mb-2 text-abyss-textMuted">
            Transactions ({categoryEvents.length})
          </div>

          {categoryEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                onClose();
                onSelectEvent(ev);
              }}
              className="p-3.5 rounded-2xl cursor-pointer border transition-all duration-150 flex items-center justify-between bg-abyss-well border-abyss-border hover:border-jade-500/40 hover:bg-abyss-elevated"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm bg-pulse-500/15 text-pulse-500">
                  ↑
                </div>
                <div>
                  <div className="text-xs font-black truncate max-w-[200px] text-abyss-textPrimary">{ev.merchant}</div>
                  <div className="text-[10px] font-medium text-abyss-textMuted">{ev.dateFormatted} • {ev.paymentMode} {ev.accountHint && `(*${ev.accountHint})`}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black font-mono text-pulse-500">
                  -₹{ev.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-bold text-jade-500">Inspect Forensics →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
