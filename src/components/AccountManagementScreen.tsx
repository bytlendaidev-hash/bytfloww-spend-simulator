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
    <div className="space-y-6">
      {/* 1. Accounts Header Card */}
      <div className={`p-6 sm:p-8 rounded-[30px] border transition ${
        isDark ? 'bg-[#0E1C23]/90 border-cyan-500/15 shadow-xl shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
          Synchronized Bank Accounts & Cards
        </div>
        <div className={`text-2xl sm:text-4xl font-black font-mono mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          {accounts.length + creditCards.length} Accounts Reconciled
        </div>
        <p className={`text-xs sm:text-sm ${isDark ? 'text-[#8A9EA8]' : 'text-slate-600'}`}>
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
        <h4 className={`text-sm font-bold uppercase tracking-wider px-1 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
          Savings & Current Accounts
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={`${acc.institution}_${acc.accountMask}`}
              onClick={() => onSelectAccount(acc)}
              className={`p-6 rounded-[28px] border transition cursor-pointer hover:scale-[1.01] ${
                isDark ? 'bg-[#0E1C23]/90 border-cyan-500/15 hover:border-cyan-500/35 shadow-lg shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    isDark ? 'bg-cyan-500/20 text-[#00F2FE]' : 'bg-cyan-100 text-[#0284C7]'
                  }`}>
                    🏦
                  </div>
                  <div>
                    <div className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{acc.institution}</div>
                    <div className={`text-xs font-mono ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>Account ending *{acc.accountMask}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-base sm:text-lg font-black font-mono ${isDark ? 'text-[#00F2FE]' : 'text-[#0D9488]'}`}>
                    {acc.latestBalance ? `₹${acc.latestBalance.toLocaleString('en-IN')}` : `₹${Math.round(acc.totalDebits).toLocaleString('en-IN')}`}
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
                    {acc.latestBalance ? 'Available Balance' : 'Tracked Volume'}
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-3 gap-2 pt-3 border-t text-xs text-center ${
                isDark ? 'border-white/5' : 'border-slate-100'
              }`}>
                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className={`block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Debits</span>
                  <span className="font-bold text-rose-500 font-mono">₹{Math.round(acc.totalDebits).toLocaleString('en-IN')}</span>
                </div>
                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className={`block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Credits</span>
                  <span className={`font-bold font-mono ${isDark ? 'text-[#00F2FE]' : 'text-teal-600'}`}>₹{Math.round(acc.totalCredits).toLocaleString('en-IN')}</span>
                </div>
                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className={`block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Volume</span>
                  <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{acc.txCount} txns</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
