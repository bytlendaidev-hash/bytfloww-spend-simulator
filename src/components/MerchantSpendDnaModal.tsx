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
      <div 
        className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl border transition-all duration-300 backdrop-blur-2xl ${
          isDark 
            ? 'bg-[#0E1720]/95 border-emerald-500/30 text-white shadow-2xl shadow-black/80' 
            : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
              isDark ? 'bg-brand-viridian/15 text-brand-viridian border border-brand-viridian/30' : 'bg-brand-50 text-brand-700 border border-brand-200'
            }`}>
              {merchantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={`text-base font-black tracking-tight truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{merchantName}</h3>
              <p className={`text-xs font-bold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>Merchant Spend DNA</p>
            </div>
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

        {/* DNA Metrics */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className={`p-3 rounded-2xl text-center border ${
            isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Spent</div>
            <div className={`text-xs font-black font-mono mt-0.5 ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>₹{Math.round(totalSpent).toLocaleString('en-IN')}</div>
          </div>
          <div className={`p-3 rounded-2xl text-center border ${
            isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Transactions</div>
            <div className={`text-xs font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{merchantEvents.length} txns</div>
          </div>
          <div className={`p-3 rounded-2xl text-center border ${
            isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Avg Ticket</div>
            <div className={`text-xs font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{avgTicket.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
          <div className={`text-[11px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Transaction History
          </div>
          {merchantEvents.map(e => (
            <div 
              key={e.id}
              onClick={() => {
                onClose();
                onSelectEvent(e);
              }}
              className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-150 border ${
                isDark ? 'bg-[#142027] hover:bg-[#1a2832] border-white/[0.06]' : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm'
              }`}
            >
              <div>
                <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.dateFormatted}</div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{e.paymentMode} {e.accountHint && `(*${e.accountHint})`}</div>
              </div>
              <div className="text-xs font-mono font-black text-rose-600 dark:text-rose-400">
                -₹{e.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

