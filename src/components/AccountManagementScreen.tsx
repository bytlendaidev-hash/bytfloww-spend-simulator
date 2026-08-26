import React from 'react';
import { DetectedAccount, FinancialEvent } from '../types';
import { CreditCardAdvisorCard } from './CreditCardAdvisorCard';

interface AccountManagementScreenProps {
  accounts?: DetectedAccount[];
  creditCards?: DetectedAccount[];
  events?: FinancialEvent[];
  isDark?: boolean;
  snapshot?: any;
  onBack?: () => void;
  onSelectAccount?: (account: DetectedAccount) => void;
}

export const AccountManagementScreen: React.FC<AccountManagementScreenProps> = ({
  accounts: propAccounts,
  creditCards: propCreditCards,
  events: propEvents,
  snapshot,
  onSelectAccount,
}) => {
  const accounts = propAccounts || snapshot?.accounts || [];
  const creditCards = propCreditCards || snapshot?.creditCards || [];
  const events = propEvents || snapshot?.recentEvents || [];
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. ACCOUNTS HEADER SPATIAL CARD ──────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-3">
        <span className="text-xs uppercase font-semibold tracking-wider text-abyss-textMuted block">
          Synchronized Bank Accounts & Cards
        </span>
        <div className="text-2xl sm:text-5xl font-bold font-mono text-abyss-textPrimary">
          {accounts.length + creditCards.length} Accounts Reconciled
        </div>
        <p className="text-xs sm:text-sm font-medium text-abyss-textSecondary">
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
        <h4 className="text-base font-bold tracking-tight text-abyss-textPrimary px-1">
          Savings & Current Accounts
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc: DetectedAccount) => (
            <div
              key={`${acc.institution}_${acc.accountMask}`}
              onClick={() => onSelectAccount?.(acc)}
              className="spatial-card p-6 space-y-4 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-lg bg-abyss-well text-abyss-textPrimary border border-abyss-border shrink-0">
                    🏦
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-abyss-textPrimary tracking-tight truncate">{acc.institution}</div>
                    <div className="text-xs font-mono text-abyss-textMuted font-medium truncate">Account ending *{acc.accountMask}</div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div className="text-base sm:text-lg font-bold font-mono text-abyss-textPrimary">
                    {acc.latestBalance ? `₹${acc.latestBalance.toLocaleString('en-IN')}` : `₹${Math.round(acc.totalDebits).toLocaleString('en-IN')}`}
                  </div>
                  <div className="text-[10px] font-mono text-abyss-textMuted">
                    {acc.latestBalance ? 'Available Balance' : 'Tracked Volume'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-abyss-border text-xs text-center">
                <div className="p-3 rounded-[12px] bg-abyss-well border border-abyss-border">
                  <span className="block text-[10px] uppercase font-semibold text-abyss-textMuted">Debits</span>
                  <span className="font-bold text-pulse-500 font-mono mt-0.5 block">₹{Math.round(acc.totalDebits).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-[12px] bg-abyss-well border border-abyss-border">
                  <span className="block text-[10px] uppercase font-semibold text-abyss-textMuted">Credits</span>
                  <span className="font-bold font-mono text-jade-500 mt-0.5 block">₹{Math.round(acc.totalCredits).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-[12px] bg-abyss-well border border-abyss-border">
                  <span className="block text-[10px] uppercase font-semibold text-abyss-textMuted">Volume</span>
                  <span className="font-bold font-mono text-abyss-textPrimary mt-0.5 block">{acc.txCount} txns</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
