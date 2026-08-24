import React from 'react';
import { DetectedAccount, FinancialEvent } from '../types';

interface CreditCardAdvisorCardProps {
  creditCards: DetectedAccount[];
  events: FinancialEvent[];
  isDark: boolean;
}

export const CreditCardAdvisorCard: React.FC<CreditCardAdvisorCardProps> = ({
  creditCards,
  events,
  isDark,
}) => {
  if (creditCards.length === 0) return null;

  const card = creditCards[0];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const estimatedBillDay = 15;
  const estimatedDueDay = (estimatedBillDay + 20) % daysInMonth || 5;

  let daysRemaining = estimatedDueDay - currentDay;
  if (daysRemaining < 0) daysRemaining += daysInMonth;

  return (
    <div className={`p-6 sm:p-7 rounded-[30px] border transition relative overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-[#181C26] via-[#101A24] to-[#0A1218] border-amber-500/25 shadow-xl shadow-amber-950/20' 
        : 'bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-200 shadow-sm'
    }`}>
      {/* Ambient gold glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-500/15">
            💳
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white">
              Grace Period & Multi-Card Advisor
            </h4>
            <p className="text-xs text-amber-400/90 font-medium">
              Maximize 0% interest-free window up to 45–50 days
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-400 border border-amber-400/30 font-mono">
          RECOMMENDED SWIPE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 relative z-10">
        <div className="p-4 rounded-2xl bg-[#12232B]/80 border border-white/5">
          <span className="text-[10px] text-[#8A9EA8] uppercase font-semibold">Active Card</span>
          <div className="text-sm font-bold text-white mt-0.5">{card.institution}</div>
          <span className="text-[10px] text-[#8A9EA8] font-mono">Card ending *{card.accountMask}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#12232B]/80 border border-white/5">
          <span className="text-[10px] text-[#8A9EA8] uppercase font-semibold">Grace Window</span>
          <div className="text-sm font-bold text-[#00F2FE] font-mono mt-0.5">
            {daysRemaining + 20} Days Remaining
          </div>
          <span className="text-[10px] text-[#8A9EA8]">Next Due: {estimatedDueDay}th of month</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#12232B]/80 border border-white/5">
          <span className="text-[10px] text-[#8A9EA8] uppercase font-semibold">Estimated Cycle Outflow</span>
          <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
            ₹{Math.round(card.totalDebits || 572).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#8A9EA8]">Statement cycle active</span>
        </div>
      </div>
    </div>
  );
};
