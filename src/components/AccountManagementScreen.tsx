import React from 'react';
import { DetectedAccount, FinancialEvent } from '../types';
import { CreditCardAdvisorCard } from './CreditCardAdvisorCard';

interface AccountManagementScreenProps {
  accounts: DetectedAccount[];
  creditCards: DetectedAccount[];
  events: FinancialEvent[];
  isDark?: boolean;
  onSelectAccount: (account: DetectedAccount) => void;
}

export const AccountManagementScreen: React.FC<AccountManagementScreenProps> = ({
  accounts,
  creditCards,
  events,
  onSelectAccount,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. ACCOUNTS HEADER SPATIAL CARD ──────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-3">
        <span className="text-xs uppercase font-semibold tracking-wider text-white/60 block">
          Synchronized Bank Accounts & Cards
        </span>
        <div className="text-2xl sm:text-5xl font-bold font-mono text-white">
          {accounts.length + creditCards.length} Accounts Reconciled
        </div>
        <p className="text-xs sm:text-sm font-medium text-white/70">
          Reconciled across live SMS transaction feeds, UPI mandates, and balance notifications
        </p>
      </div>

      {/* ── 2. CREDIT CARD GRACE PERIOD ADVISOR ───────────────────────────── */}
      {creditCards.length > 0 && (
        <CreditCardAdvisorCard
          creditCards={creditCards}
          events={events}
        />
      )}

      {/* ── 3. BANK ACCOUNTS GRID ────────────────────────────────────────── */}
      <div className="space-y-4">
        <h4 className="text-base font-bold tracking-tight text-white px-1">
          Savings & Current Accounts
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={`${acc.institution}_${acc.accountMask}`}
              onClick={() => onSelectAccount(acc)}
              className="spatial-card p-6 space-y-4 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-lg bg-white/10 text-white border border-white/15 shrink-0">
                    🏦
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-white tracking-tight truncate">{acc.institution}</div>
                    <div className="text-xs font-mono text-white/50 font-medium truncate">Account ending *{acc.accountMask}</div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div className="text-base sm:text-lg font-bold font-mono text-white">
                    {acc.latestBalance ? `₹${acc.latestBalance.toLocaleString('en-IN')}` : `₹${Math.round(acc.totalDebits).toLocaleString('en-IN')}`}
                  </div>
                  <div className="text-[10px] font-mono text-white/40">
                    {acc.latestBalance ? 'Available Balance' : 'Tracked Volume'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10 text-xs text-center">
                <div className="p-3 rounded-[12px] bg-white/5 border border-white/10">
                  <span className="block text-[10px] uppercase font-semibold text-white/50">Debits</span>
                  <span className="font-bold text-white font-mono mt-0.5 block">₹{Math.round(acc.totalDebits).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-[12px] bg-white/5 border border-white/10">
                  <span className="block text-[10px] uppercase font-semibold text-white/50">Credits</span>
                  <span className="font-bold font-mono text-[#30D158] mt-0.5 block">₹{Math.round(acc.totalCredits).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-[12px] bg-white/5 border border-white/10">
                  <span className="block text-[10px] uppercase font-semibold text-white/50">Volume</span>
                  <span className="font-bold font-mono text-white mt-0.5 block">{acc.txCount} txns</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
