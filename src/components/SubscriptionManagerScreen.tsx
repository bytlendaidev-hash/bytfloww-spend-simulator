import React from 'react';
import { CommitmentItem } from '../types';

interface SubscriptionManagerScreenProps {
  commitments?: CommitmentItem[];
  totalSubscriptions?: number;
  isDark?: boolean;
  snapshot?: any;
  onBack?: () => void;
}

export const SubscriptionManagerScreen: React.FC<SubscriptionManagerScreenProps> = ({
  commitments: propCommitments,
  totalSubscriptions: propTotalSubscriptions,
  snapshot,
}) => {
  const commitments = propCommitments || snapshot?.commitments || [];
  const totalSubscriptions = propTotalSubscriptions !== undefined ? propTotalSubscriptions : (snapshot?.totalSubscriptions || 0);
  const recurringSubs = commitments.filter((c: CommitmentItem) => c.type === 'SUBSCRIPTION' || c.type === 'MANDATE');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. SUBSCRIPTIONS BURN RATE SPATIAL CARD ───────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-abyss-textMuted block">
              Active Digital Subscriptions & Autopay e-Mandates
            </span>
            <div className="text-3xl sm:text-5xl font-bold font-mono mt-1 text-abyss-textPrimary">
              ₹{Math.round(totalSubscriptions).toLocaleString('en-IN')}
              <span className="text-sm font-sans font-medium ml-2 text-abyss-textMuted">/ month</span>
            </div>
          </div>
          <span className="spatial-btn px-4 py-1.5 text-xs text-abyss-textPrimary">
            {recurringSubs.length} ACTIVE SERVICES
          </span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-abyss-textSecondary">
          Estimated yearly recurring burn: <strong className="font-mono text-abyss-textPrimary">₹{Math.round(totalSubscriptions * 12).toLocaleString('en-IN')}</strong>
        </p>
      </div>

      {/* ── 2. DETECTED SUBSCRIPTIONS GRID ───────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-4">
        <h4 className="text-base font-bold tracking-tight text-abyss-textPrimary">
          Detected Services & Autopay Mandates
        </h4>

        {recurringSubs.length === 0 ? (
          <div className="p-8 text-center text-abyss-textMuted text-sm font-medium">
            No recurring subscription mandates detected in this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringSubs.map((sub: CommitmentItem) => (
              <div
                key={sub.id}
                className="p-5 rounded-[16px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition-all duration-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-base bg-abyss-card border border-abyss-border text-abyss-textPrimary shrink-0">
                      🔄
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-abyss-textPrimary tracking-tight truncate">{sub.name}</div>
                      <div className="text-xs text-abyss-textMuted font-medium truncate">
                        {sub.cadence} • Next: <span className="text-jade-500 font-semibold">{sub.nextExpectedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className="text-sm sm:text-base font-bold font-mono text-abyss-textPrimary">
                      ₹{sub.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-mono text-abyss-textMuted">Autopay Active</div>
                  </div>
                </div>

                {sub.umn && (
                  <div className="p-2.5 rounded-[10px] text-xs font-mono truncate bg-abyss-card border border-abyss-border text-abyss-textSecondary">
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
