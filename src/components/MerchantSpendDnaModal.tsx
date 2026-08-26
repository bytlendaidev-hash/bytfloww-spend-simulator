import React from 'react';
import { FinancialEvent, MerchantItem } from '../types';

interface MerchantSpendDnaModalProps {
  merchantName: string | null;
  merchantData: MerchantItem | undefined;
  events: FinancialEvent[];
  isDark: boolean;
  onClose: () => void;
  onSelectEvent: (event: FinancialEvent) => void;
}

export const MerchantSpendDnaModal: React.FC<MerchantSpendDnaModalProps> = ({
  merchantName,
  merchantData,
  events,
  isDark,
  onClose,
  onSelectEvent,
}) => {
  if (!merchantName) return null;

  const merchantEvents = events.filter(e => e.merchant.toLowerCase() === merchantName.toLowerCase());
  const totalSpent = merchantEvents.reduce((s, e) => s + (e.direction === 'OUTFLOW' ? e.amount : 0), 0);
  const avgTicket = merchantEvents.length > 0 ? Math.round(totalSpent / merchantEvents.length) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-2xl p-0 sm:p-4 animate-emergence">
      <div className="spatial-modal w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-abyss-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm bg-jade-500/15 text-jade-500 border border-jade-500/30">
              {merchantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight truncate max-w-[200px] text-abyss-textPrimary">{merchantName}</h3>
              <p className="text-xs font-bold text-jade-500">Merchant Spend DNA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition"
          >
            ✕
          </button>
        </div>

        {/* DNA Metrics */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="p-3 rounded-2xl text-center border bg-abyss-well border-abyss-border">
            <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Spent</div>
            <div className="text-xs font-black font-mono mt-0.5 text-jade-500">₹{Math.round(totalSpent).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded-2xl text-center border bg-abyss-well border-abyss-border">
            <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Transactions</div>
            <div className="text-xs font-black font-mono mt-0.5 text-abyss-textPrimary">{merchantEvents.length} txns</div>
          </div>
          <div className="p-3 rounded-2xl text-center border bg-abyss-well border-abyss-border">
            <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Avg Ticket</div>
            <div className="text-xs font-black font-mono mt-0.5 text-abyss-textPrimary">₹{avgTicket.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
          <div className="text-[11px] font-black uppercase tracking-wider mb-1 text-abyss-textMuted">
            Transaction History
          </div>
          {merchantEvents.map(e => (
            <div 
              key={e.id}
              onClick={() => {
                onClose();
                onSelectEvent(e);
              }}
              className="p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-150 border bg-abyss-well hover:bg-abyss-elevated border-abyss-border"
            >
              <div>
                <div className="text-xs font-black text-abyss-textPrimary">{e.dateFormatted}</div>
                <div className="text-[10px] text-abyss-textMuted">{e.paymentMode} {e.accountHint && `(*${e.accountHint})`}</div>
              </div>
              <div className="text-xs font-mono font-black text-pulse-500">
                -₹{e.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
