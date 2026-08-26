import React from 'react';
import { CommitmentItem } from '../types';

interface SubscriptionManagerScreenProps {
  commitments: CommitmentItem[];
  totalSubscriptions: number;
  isDark?: boolean;
}

export const SubscriptionManagerScreen: React.FC<SubscriptionManagerScreenProps> = ({
  commitments,
  totalSubscriptions,
}) => {
  const recurringSubs = commitments.filter(c => c.type === 'SUBSCRIPTION' || c.type === 'MANDATE');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. SUBSCRIPTIONS BURN RATE SPATIAL CARD ───────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-white/60 block">
              Active Digital Subscriptions & Autopay e-Mandates
            </span>
            <div className="text-3xl sm:text-5xl font-bold font-mono mt-1 text-white">
              ₹{Math.round(totalSubscriptions).toLocaleString('en-IN')}
              <span className="text-sm font-sans font-medium ml-2 text-white/50">/ month</span>
            </div>
          </div>
          <span className="spatial-btn px-4 py-1.5 text-xs text-white">
            {recurringSubs.length} ACTIVE SERVICES
          </span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-white/70">
          Estimated yearly recurring burn: <strong className="font-mono text-white">₹{Math.round(totalSubscriptions * 12).toLocaleString('en-IN')}</strong>
        </p>
      </div>

      {/* ── 2. DETECTED SUBSCRIPTIONS GRID ───────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <h4 className="text-base font-bold tracking-tight text-white">
          Detected Services & Autopay Mandates
        </h4>

        {recurringSubs.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm font-medium">
            No recurring subscription mandates detected in this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-[16px] bg-white/5 border border-white/10 hover:bg-white/15 transition-all duration-300 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-base bg-white/10 text-white shrink-0">
                      🔄
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white tracking-tight truncate">{sub.name}</div>
                      <div className="text-xs text-white/50 font-medium truncate">
                        {sub.cadence} • Next: <span className="text-[#30D158] font-semibold">{sub.nextExpectedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className="text-sm sm:text-base font-bold font-mono text-white">
                      ₹{sub.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-white/40">Autopay Active</div>
                  </div>
                </div>

                {sub.umn && (
                  <div className="p-2.5 rounded-[10px] text-xs font-mono truncate bg-black/40 border border-white/10 text-white/70">
                    Mandate UMN: {sub.umn}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
