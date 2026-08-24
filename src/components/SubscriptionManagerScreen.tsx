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
    <div className="space-y-6">
      {/* 1. Subscriptions Burn Rate Card */}
      <div className={`p-6 sm:p-8 rounded-[30px] border transition ${
        isDark ? 'bg-[#0E1C23]/90 border-cyan-500/15 shadow-xl shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
              Active Digital Subscriptions & Autopay e-Mandates
            </span>
            <div className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              ₹{Math.round(totalSubscriptions).toLocaleString('en-IN')}
              <span className="text-xs sm:text-sm text-slate-500 font-normal ml-2">/ month</span>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            isDark 
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {recurringSubs.length} ACTIVE SERVICES
          </span>
        </div>
        <p className={`text-xs sm:text-sm ${isDark ? 'text-[#8A9EA8]' : 'text-slate-600'}`}>
          Estimated yearly recurring burn: <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>₹{Math.round(totalSubscriptions * 12).toLocaleString('en-IN')}</span>
        </p>
      </div>

      {/* 2. Detected Subscriptions Grid */}
      <div className={`p-6 sm:p-8 rounded-[30px] border ${
        isDark ? 'bg-[#0E1C23]/90 border-cyan-500/15 shadow-xl shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
          Detected Services & Autopay Mandates
        </h4>

        {recurringSubs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No recurring subscription mandates detected in this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringSubs.map((sub) => (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border transition ${
                  isDark ? 'bg-[#12232B] border-white/5' : 'bg-[#F8FAFC] border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                      isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                    }`}>
                      🔄
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{sub.name}</div>
                      <div className={`text-xs ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
                        {sub.cadence} • Next: <span className={`font-semibold ${isDark ? 'text-[#00F2FE]' : 'text-[#0284C7]'}`}>{sub.nextExpectedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm sm:text-base font-black font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      ₹{sub.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">Autopay Active</div>
                  </div>
                </div>

                {sub.umn && (
                  <div className={`p-2.5 rounded-xl text-[11px] font-mono truncate ${
                    isDark ? 'bg-black/40 text-[#8A9EA8]' : 'bg-white border border-slate-200 text-slate-600'
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
