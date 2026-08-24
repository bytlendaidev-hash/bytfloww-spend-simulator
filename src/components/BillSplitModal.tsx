import React, { useState } from 'react';
import { FinancialEvent } from '../types';

interface BillSplitModalProps {
  event: FinancialEvent | null;
  isDark: boolean;
  onClose: () => void;
}

export const BillSplitModal: React.FC<BillSplitModalProps> = ({
  event,
  isDark,
  onClose,
}) => {
  if (!event) return null;
  const [splitCount, setSplitCount] = useState(3);
  const [copied, setCopied] = useState(false);

  const perPersonAmount = (event.amount / splitCount).toFixed(2);
  const upiPayLink = `upi://pay?pn=${encodeURIComponent(event.merchant)}&am=${perPersonAmount}&cu=INR`;
  const shareText = `Hey! Your share for ${event.merchant} (Total: ₹${event.amount.toLocaleString('en-IN')}) split among ${splitCount} people is ₹${perPersonAmount}.\nPay here: ${upiPayLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Split Bill</h3>
            <p className={`text-xs ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>{event.merchant} • ₹{event.amount.toLocaleString('en-IN')}</p>
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

        {/* Person Count Slider */}
        <div className="my-5">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-semibold ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Split among how many people?</span>
            <span className={`text-base font-black font-mono ${isDark ? 'text-[#00F2FE]' : 'text-[#0284C7]'}`}>{splitCount} People</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="10" 
            value={splitCount} 
            onChange={(e) => setSplitCount(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Calculated Amount */}
        <div className={`p-5 rounded-2xl border text-center mb-5 ${
          isDark ? 'bg-[#12232B] border-cyan-500/20' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-xs uppercase font-semibold ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Each Person Owes</div>
          <div className={`text-3xl font-black font-mono mt-1 ${isDark ? 'text-[#00F2FE]' : 'text-[#0284C7]'}`}>
            ₹{perPersonAmount}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#9B51E0] text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition hover:scale-[1.01]"
        >
          {copied ? '✓ Copied Shareable Link & Message' : 'Copy Split Link & Message 📤'}
        </button>
      </div>
    </div>
  );
};
