import React from 'react';
import { DetectedAccount, FinancialEvent } from '../types';
import { CreditCardAdvisorCard } from './CreditCardAdvisorCard';

interface AccountManagementScreenProps {
  accounts: DetectedAccount[];
  creditCards: DetectedAccount[];
  events: FinancialEvent[];
  isDark: boolean;
  onSelectAccount: (account: DetectedAccount) => void;
}

export const AccountManagementScreen: React.FC<AccountManagementScreenProps> = ({
  accounts,
  creditCards,
  events,
  isDark,
  onSelectAccount,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-emergence">
      {/* 1. Accounts Header Card */}
      <div className={`p-6 sm:p-8 rounded-[32px] border transition-all duration-300 backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/80 border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white/85 border-slate-200/90 shadow-sm'
      }`}>
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Synchronized Bank Accounts & Cards
        </div>
        <div className={`text-2xl sm:text-4xl font-black font-mono mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {accounts.length + creditCards.length} Accounts Reconciled
        </div>
        <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Reconciled across live SMS transaction feeds, UPI mandates, and balance notifications
        </p>
      </div>

      {/* 2. Credit Card Grace Period Advisor */}
      {creditCards.length > 0 && (
        <CreditCardAdvisorCard
          creditCards={creditCards}
          events={events}
          isDark={isDark}
        />
      )}

      {/* 3. Bank Accounts Grid */}
      <div className="space-y-4">
        <h4 className={`text-sm font-black font-heading uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Savings & Current Accounts
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={`${acc.institution}_${acc.accountMask}`}
              onClick={() => onSelectAccount(acc)}
              className={`p-6 rounded-[28px] border transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] group backdrop-blur-xl ${
                isDark 
                  ? 'bg-white/[0.03] border-white/[0.06] hover:border-emerald-400/40 hover:bg-white/[0.06] shadow-xl shadow-black/40' 
                  : 'bg-white/85 border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0 ${
                    isDark ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    🏦
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm sm:text-base font-black font-heading tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{acc.institution}</div>
                    <div className={`text-xs font-mono font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Account ending *{acc.accountMask}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <div className={`text-base sm:text-lg font-black font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {acc.latestBalance ? `₹${acc.latestBalance.toLocaleString('en-IN')}` : `₹${Math.round(acc.totalDebits).toLocaleString('en-IN')}`}
                  </div>
                  <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {acc.latestBalance ? 'Available Balance' : 'Tracked Volume'}
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-3 gap-2 pt-3 border-t text-xs text-center ${
                isDark ? 'border-white/[0.06]' : 'border-slate-100'
              }`}>
                <div className={`p-2.5 rounded-xl backdrop-blur-md ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                  <span className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Debits</span>
                  <span className="font-black text-rose-500 dark:text-rose-400 font-mono">₹{Math.round(acc.totalDebits).toLocaleString('en-IN')}</span>
                </div>
                <div className={`p-2.5 rounded-xl backdrop-blur-md ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                  <span className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Credits</span>
                  <span className={`font-black font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>₹{Math.round(acc.totalCredits).toLocaleString('en-IN')}</span>
                </div>
                <div className={`p-2.5 rounded-xl backdrop-blur-md ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                  <span className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Volume</span>
                  <span className={`font-black font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{acc.txCount} txns</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


