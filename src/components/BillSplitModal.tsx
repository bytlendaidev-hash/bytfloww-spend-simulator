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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-2xl p-0 sm:p-4 animate-emergence">
      <div className="spatial-modal w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-abyss-border">
          <div>
            <h3 className="text-base font-black tracking-tight text-abyss-textPrimary">Split Bill</h3>
            <p className="text-xs font-medium text-abyss-textMuted">{event.merchant} • ₹{event.amount.toLocaleString('en-IN')}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition"
          >
            ✕
          </button>
        </div>

        {/* Person Count Slider */}
        <div className="my-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-abyss-textMuted">Split among how many people?</span>
            <span className="text-base font-black font-mono text-jade-500">{splitCount} People</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="10" 
            value={splitCount} 
            onChange={(e) => setSplitCount(parseInt(e.target.value, 10))}
            className="w-full accent-jade-500 cursor-pointer"
          />
        </div>

        {/* Calculated Amount */}
        <div className="p-5 rounded-2xl border text-center mb-5 bg-abyss-well border-abyss-border">
          <div className="text-xs uppercase font-bold text-abyss-textMuted">Each Person Owes</div>
          <div className="text-3xl font-black font-mono mt-1 text-jade-500">
            ₹{perPersonAmount}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopy}
          className="spatial-btn-selected w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95"
        >
          {copied ? '✓ Copied Shareable Link & Message' : 'Copy Split Link & Message 📤'}
        </button>
      </div>
    </div>
  );
};
