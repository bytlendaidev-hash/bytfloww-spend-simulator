import React from 'react';
import { CommitmentItem } from '../types';

interface SubscriptionManagerScreenProps {
  commitments: CommitmentItem[];
  totalSubscriptions: number;
  isDark: boolean;
}

export const SubscriptionManagerScreen: React.FC<SubscriptionManagerScreenProps> = ({
  commitments,
  totalSubscriptions,
  isDark,
}) => {
  const recurringSubs = commitments.filter(c => c.type === 'SUBSCRIPTION' || c.type === 'MANDATE');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* 1. Subscriptions Burn Rate Card */}
      <div className={`p-6 sm:p-8 rounded-[32px] border transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Digital Subscriptions & Autopay e-Mandates
            </span>
            <div className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              ₹{Math.round(totalSubscriptions).toLocaleString('en-IN')}
              <span className={`text-xs sm:text-sm font-medium ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/ month</span>
            </div>
          </div>
          <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${
            isDark 
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' 
              : 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm'
          }`}>
            {recurringSubs.length} ACTIVE SERVICES
          </span>
        </div>
        <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Estimated yearly recurring burn: <span className={`font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{Math.round(totalSubscriptions * 12).toLocaleString('en-IN')}</span>
        </p>
      </div>

      {/* 2. Detected Subscriptions Grid */}
      <div className={`p-6 sm:p-8 rounded-[32px] border transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <h4 className={`text-sm font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Detected Services & Autopay Mandates
        </h4>

        {recurringSubs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm font-medium">
            No recurring subscription mandates detected in this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recurringSubs.map((sub) => (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border transition-all duration-150 ${
                  isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0 ${
                      isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                    }`}>
                      🔄
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-black tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{sub.name}</div>
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {sub.cadence} • Next: <span className={`font-bold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>{sub.nextExpectedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-2">
                    <div className={`text-sm sm:text-base font-black font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      ₹{sub.amount.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Autopay Active</div>
                  </div>
                </div>

                {sub.umn && (
                  <div className={`p-2.5 rounded-xl text-[11px] font-mono truncate border ${
                    isDark ? 'bg-black/40 border-white/[0.06] text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
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

