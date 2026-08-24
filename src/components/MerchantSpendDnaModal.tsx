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
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
              isDark ? 'bg-cyan-500/20 text-[#00F2FE]' : 'bg-cyan-100 text-[#0284C7]'
            }`}>
              {merchantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={`text-sm font-bold truncate max-w-[200px] ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{merchantName}</h3>
              <p className={`text-xs ${isDark ? 'text-[#00F2FE]' : 'text-[#0284C7]'}`}>Merchant Spend DNA</p>
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
          <div className={`p-3 rounded-2xl text-center ${
            isDark ? 'bg-[#12232B] border border-white/5' : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Total Spent</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${isDark ? 'text-[#00F2FE]' : 'text-[#0284C7]'}`}>₹{Math.round(totalSpent).toLocaleString('en-IN')}</div>
          </div>
          <div className={`p-3 rounded-2xl text-center ${
            isDark ? 'bg-[#12232B] border border-white/5' : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Transactions</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{merchantEvents.length} txns</div>
          </div>
          <div className={`p-3 rounded-2xl text-center ${
            isDark ? 'bg-[#12232B] border border-white/5' : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Avg Ticket</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>₹{avgTicket.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
            Transaction History
          </div>
          {merchantEvents.map(e => (
            <div 
              key={e.id}
              onClick={() => {
                onClose();
                onSelectEvent(e);
              }}
              className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition border ${
                isDark ? 'bg-[#12232B] hover:bg-[#152a35] border-white/5' : 'bg-[#F8FAFC] hover:bg-slate-100 border-slate-200/80'
              }`}
            >
              <div>
                <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{e.dateFormatted}</div>
                <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>{e.paymentMode} {e.accountHint && `(*${e.accountHint})`}</div>
              </div>
              <div className={`text-xs font-mono font-black ${isDark ? 'text-[#00F2FE]' : 'text-[#0F172A]'}`}>
                ₹{e.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
