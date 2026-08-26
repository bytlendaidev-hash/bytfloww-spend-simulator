import React from 'react';
import { DetectedAccount, FinancialEvent } from '../types';

interface CreditCardAdvisorCardProps {
  creditCards: DetectedAccount[];
  events: FinancialEvent[];
  isDark?: boolean;
}

export const CreditCardAdvisorCard: React.FC<CreditCardAdvisorCardProps> = ({
  creditCards,
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
    <div className="spatial-card p-6 sm:p-7 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-xl shadow-md">
            💳
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">
              Grace Period & Multi-Card Advisor
            </h4>
            <p className="text-xs text-white/60 font-medium">
              Maximize 0% interest-free window up to 45–50 days
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30">
          RECOMMENDED SWIPE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
          <span className="text-[10px] text-white/50 uppercase font-semibold block">Active Card</span>
          <div className="text-sm font-bold text-white mt-0.5">{card.institution}</div>
          <span className="text-xs text-white/40 font-mono">Card ending *{card.accountMask}</span>
        </div>

        <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
          <span className="text-[10px] text-white/50 uppercase font-semibold block">Grace Window</span>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {daysRemaining + 20} Days Remaining
          </div>
          <span className="text-xs text-white/40">Next Due: {estimatedDueDay}th of month</span>
        </div>

        <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
          <span className="text-[10px] text-white/50 uppercase font-semibold block">Estimated Cycle Outflow</span>
          <div className="text-sm font-bold text-[#FF453A] font-mono mt-0.5">
            ₹{Math.round(card.totalDebits || 572).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-white/40">Statement cycle active</span>
        </div>
      </div>
    </div>
  );
};
