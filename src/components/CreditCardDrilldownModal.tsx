import React, { useState } from 'react';
import { DetectedAccount, FinancialEvent } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface CreditCardDrilldownModalProps {
  card: DetectedAccount | null;
  periodEvents: FinancialEvent[];
  allEvents: FinancialEvent[];
  isDark: boolean;
  onClose: () => void;
  onSelectEvent: (event: FinancialEvent) => void;
}

export const CreditCardDrilldownModal: React.FC<CreditCardDrilldownModalProps> = ({
  card,
  periodEvents,
  allEvents,
  isDark,
  onClose,
  onSelectEvent,
}) => {
  if (!card) return null;

  const [viewScope, setViewScope] = useState<'PERIOD' | 'LIFETIME'>('PERIOD');

  // Filter transactions matching this credit card
  const filterCardEvents = (list: FinancialEvent[]) => {
    return list.filter(e => 
      (e.accountHint && (e.accountHint === card.accountMask || e.accountHint === '2261')) ||
      (e.paymentMode === 'CARD') ||
      (e.resolvedInstitution && e.resolvedInstitution.toLowerCase().includes('axis'))
    );
  };

  const periodCardEvents = filterCardEvents(periodEvents);
  const allCardEvents = filterCardEvents(allEvents);

  const activeEvents = viewScope === 'PERIOD' ? (periodCardEvents.length > 0 ? periodCardEvents : allCardEvents.slice(0, 20)) : allCardEvents;

  const totalLimit = card.totalLimit || card.totalDebits || 0;
  const periodSpent = periodCardEvents.reduce((s, e) => s + e.amount, 0);
  const billedAmount = card.totalDebits || 0;
  const availableLimit = card.availableLimit !== undefined ? card.availableLimit : Math.max(0, totalLimit - billedAmount);
  const spentAmount = viewScope === 'PERIOD' ? periodSpent : billedAmount;
  const utilizationPct = totalLimit > 0 ? Math.round((spentAmount / totalLimit) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className="spatial-modal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-abyss-border flex items-center justify-between bg-abyss-well">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm bg-pulse-500/15 text-pulse-500 border border-pulse-500/25">
              💳
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-abyss-textPrimary">
                {card.institution || 'Axis Bank'} Credit Card
              </h3>
              <p className="text-xs font-mono font-medium text-abyss-textMuted">
                VISA PLATINUM • Ending *{card.accountMask || '2261'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition-all duration-150"
          >
            ✕
          </button>
        </div>

        {/* Scope Switcher: Selected Period vs Lifetime */}
        <div className="px-6 pt-3 pb-2.5 flex items-center justify-between border-b border-abyss-border bg-abyss-card">
          <span className="text-[11px] font-bold text-abyss-textMuted">
            Financial Scope:
          </span>
          <div className="flex rounded-2xl p-1 border bg-abyss-well border-abyss-border">
            <button
              onClick={() => setViewScope('PERIOD')}
              className={`px-3.5 py-1 rounded-xl text-xs font-black transition-all ${
                viewScope === 'PERIOD'
                  ? 'bg-jade-500 text-abyss-canvas shadow-solid-sm'
                  : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
              }`}
            >
              📅 Selected Period ({periodCardEvents.length})
            </button>
            <button
              onClick={() => setViewScope('LIFETIME')}
              className={`px-3.5 py-1 rounded-xl text-xs font-black transition-all ${
                viewScope === 'LIFETIME'
                  ? 'bg-jade-500 text-abyss-canvas shadow-solid-sm'
                  : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
              }`}
            >
              📜 Lifetime History ({allCardEvents.length})
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
          {/* 1. PHYSICAL CARD UI PREVIEW */}
          <div className="p-6 rounded-[28px] bg-pulse-900 border border-pulse-700/40 text-white relative overflow-hidden shadow-solid-md">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest uppercase text-pulse-200">
                  {card.institution ? card.institution.toUpperCase() : 'AXIS BANK'}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  VISA PLATINUM
                </span>
              </div>
              <span className="text-sm font-bold tracking-wider">💳</span>
            </div>

            {/* Chip */}
            <div className="my-5 w-11 h-8 rounded-lg bg-ochre-400 border border-ochre-600 flex items-center justify-center shadow-sm">
              <div className="w-8 h-5 border border-ochre-800/40 rounded flex items-center justify-center">
                <div className="w-4 h-3 border border-ochre-800/40 rounded-sm" />
              </div>
            </div>

            {/* Card Number */}
            <div className="font-mono text-base sm:text-lg tracking-widest font-black my-2 text-pulse-100">
              •••• •••• •••• {card.accountMask || '2261'}
            </div>

            <div className="flex items-end justify-between pt-2 text-xs relative z-10 border-t border-white/15">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-pulse-300 font-bold">CARDHOLDER</div>
                <div className="font-bold tracking-wider">VALUED MEMBER</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-pulse-300 font-bold">VALID THRU</div>
                <div className="font-mono font-bold">12/28</div>
              </div>
            </div>
          </div>

          {/* 2. LIMIT & UTILIZATION METRICS */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border text-center bg-abyss-well border-abyss-border">
              <span className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Limit</span>
              <div className="text-base font-black font-mono mt-1 text-abyss-textPrimary">
                ₹{totalLimit.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-2xl border text-center bg-abyss-well border-abyss-border">
              <span className="text-[10px] font-bold uppercase text-abyss-textMuted">
                {viewScope === 'PERIOD' ? 'Period Spend' : 'Billed Statement'}
              </span>
              <div className="text-base font-black font-mono text-pulse-500 mt-1">
                ₹{spentAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-2xl border text-center bg-abyss-well border-abyss-border">
              <span className="text-[10px] font-bold uppercase text-abyss-textMuted">Available Limit</span>
              <div className="text-base font-black font-mono mt-1 text-jade-500">
                ₹{availableLimit.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="p-4 rounded-2xl border space-y-2 bg-abyss-well border-abyss-border">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-abyss-textSecondary">Credit Utilization</span>
              <span className="font-mono font-black text-jade-500">{utilizationPct}% (Healthy &lt; 30%)</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden bg-abyss-canvas">
              <div
                style={{ width: `${Math.max(3, utilizationPct)}%` }}
                className="h-full bg-jade-500 rounded-full"
              />
            </div>
          </div>

          {/* 3. GRACE PERIOD ADVISOR BANNER */}
          <div className="p-4 rounded-2xl border flex items-start gap-3.5 bg-jade-500/10 border-jade-500/30 text-abyss-textPrimary">
            <span className="text-2xl">🔥</span>
            <div className="space-y-1 text-xs">
              <div className="font-black uppercase tracking-wider flex items-center gap-2 text-jade-500">
                <span>46 Days Interest-Free Runway</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black border bg-jade-500/20 text-jade-500 border-jade-500/30">
                  SWIPE TODAY
                </span>
              </div>
              <p className="text-abyss-textSecondary">
                Your fresh billing cycle opened on the 15th. Swiping this card today gives you maximum 46 days of free liquidity until due date (05th of next month).
              </p>
            </div>
          </div>

          {/* 4. RECONCILED CARD TRANSACTIONS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-abyss-textMuted">
                {viewScope === 'PERIOD' ? 'Period Card Transactions' : 'All-Time Card Transactions'} ({activeEvents.length})
              </h4>
              <span className="text-[11px] font-bold text-jade-500">Live SMS Extracted</span>
            </div>

            {activeEvents.length === 0 ? (
              <div className="p-6 rounded-2xl border text-center text-xs bg-abyss-well border-abyss-border text-abyss-textMuted">
                No card debits found in selected scope.
              </div>
            ) : (
              activeEvents.map((ev: FinancialEvent) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    onClose();
                    onSelectEvent(ev);
                  }}
                  className="p-3.5 rounded-2xl cursor-pointer border transition-all duration-150 flex items-center justify-between bg-abyss-well border-abyss-border hover:border-jade-500/40 hover:bg-abyss-elevated"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MerchantLogoView merchantName={ev.merchant} size={36} isDark={isDark} shape="rounded" />
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate max-w-[220px] text-abyss-textPrimary">
                        {ev.merchant}
                      </div>
                      <div className="text-[10px] font-medium text-abyss-textMuted">
                        {ev.dateFormatted} • {ev.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-xs font-black font-mono text-pulse-500">
                      -₹{ev.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-medium text-abyss-textMuted">
                      Card Swipe
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
