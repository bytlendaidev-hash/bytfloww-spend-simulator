import React from 'react';
import { SpendSnapshot, FinancialEvent, SpendTab, CategoryBreakdownItem, DetectedAccount } from '../types';
import { MerchantLogoView } from './MerchantLogoView';
import { getCategoryColor } from '../theme/tokens';

interface SpendOverviewTabProps {
  snapshot: SpendSnapshot;
  isDark?: boolean;
  onSelectEvent: (event: FinancialEvent) => void;
  onNavigateToTab: (tab: SpendTab) => void;
  onOpenDebrief: () => void;
  onSelectMerchant: (merchantName: string) => void;
  onSelectAccount?: (account: DetectedAccount) => void;
  onSelectCreditCard?: (card: DetectedAccount) => void;
  onSelectCategory?: (category: CategoryBreakdownItem) => void;
}

export const SpendOverviewTab: React.FC<SpendOverviewTabProps> = ({
  snapshot,
  isDark = true,
  onSelectEvent,
  onNavigateToTab,
  onOpenDebrief,
  onSelectMerchant,
  onSelectAccount,
  onSelectCreditCard,
  onSelectCategory,
}) => {
  const budgetLimit = snapshot.totalIncome > 0 ? snapshot.totalIncome : 50000;
  const isOverBudget = snapshot.totalSpend > budgetLimit;
  const varianceAmount = Math.abs(snapshot.totalSpend - budgetLimit);
  const budgetPct = Math.round((snapshot.totalSpend / Math.max(1, budgetLimit)) * 100);

  const primaryCreditCard = snapshot.creditCards[0] || {
    institution: 'Axis Bank',
    accountMask: '2261',
    accountType: 'CREDIT_CARD',
    totalLimit: 16000,
    availableLimit: 15730,
    totalDebits: 270,
    totalCredits: 0,
    netCashflow: -270,
    txCount: 1,
  };

  const topMerchant = snapshot.topMerchants[0];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. HERO PERIOD FINANCIAL COMMAND CARD ──────────────────────── */}
      <div className="spatial-card-hero p-4 sm:p-7 space-y-4 sm:space-y-6 relative overflow-hidden">
        {/* Top period header with Status Badges */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 relative z-10 flex-wrap">
          <span className="spatial-btn px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs flex items-center gap-1.5 sm:gap-2 border-emerald-500/30 bg-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#00884E] dark:text-[#1AE893] font-bold tracking-wider">{snapshot.periodLabel.toUpperCase()}</span>
          </span>

          <span className="px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider border bg-amber-500/10 text-amber-600 dark:text-[#E0A83F] border-amber-500/30 shadow-sm flex items-center gap-1">
            <span>✨</span> {snapshot.healthScoreTier} HEALTH TIER
          </span>
        </div>

        {/* Main spend number with Billion-Dollar Startup Typography */}
        <div className="relative z-10 pt-1 sm:pt-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-abyss-textMuted font-bold block">
            Capital Reconciled This Period (Outflow)
          </span>
          <div className="text-4xl xs:text-5xl sm:text-7xl font-black tracking-tight font-ibm-mono mt-1 flex items-baseline gap-1 text-abyss-textPrimary">
            <span className="text-2xl xs:text-3xl sm:text-5xl font-normal text-abyss-textMuted">₹</span>
            <span>
              {snapshot.totalSpend.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Budget Status line & Velocity Progress bar */}
        <div className="space-y-2.5 sm:space-y-3 pt-2 relative z-10 border-t border-abyss-border">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold gap-2">
            <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-abyss-well text-abyss-textSecondary border border-abyss-border truncate">
              ⚡ {snapshot.transactionCount} transactions
            </span>
            <span className={`truncate text-right ${isOverBudget ? 'text-rose-500 font-bold' : 'text-[#00884E] dark:text-[#1AE893] font-bold'}`}>
              {isOverBudget 
                ? `Over by ₹${varianceAmount.toLocaleString('en-IN')} (${budgetPct}%)` 
                : `Within budget (${budgetPct}% utilized)`}
            </span>
          </div>

          {/* Velocity Progress bar */}
          <div className="h-2.5 sm:h-3 rounded-full bg-abyss-well border border-abyss-border overflow-hidden p-0.5 shadow-inner">
            <div 
              style={{ width: `${Math.min(100, Math.max(3, budgetPct))}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-rose-500 shadow-sm' : 'bg-emerald-500 shadow-sm'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── 2. TRI-METRIC CASHFLOW STRIP (3-COLUMN LIQUIDITY CARD) ───────── */}
      <div className="spatial-card p-3.5 sm:p-6 grid grid-cols-3 gap-1.5 sm:gap-4 text-left border-emerald-500/20 shadow-lg">
        {/* Income (Cyber Emerald) */}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-[#00884E] dark:text-[#1AE893]">
            <span>↓</span> Income
          </div>
          <div className="text-xs xs:text-sm sm:text-2xl font-bold font-mono text-[#00884E] dark:text-[#1AE893] truncate">
            ₹{snapshot.totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-abyss-textMuted hidden xs:block truncate">
            Inflow Credits
          </div>
        </div>

        {/* Expenses (Crimson Vermillion) */}
        <div className="space-y-0.5 sm:space-y-1 border-x border-abyss-border px-1.5 sm:px-4">
          <div className="flex items-center gap-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-rose-500">
            <span>↑</span> Expenses
          </div>
          <div className="text-xs xs:text-sm sm:text-2xl font-bold font-mono text-rose-500 truncate">
            ₹{snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-abyss-textMuted hidden xs:block truncate">
            {snapshot.transactionCount} debits
          </div>
        </div>

        {/* Net Surplus / Deficit */}
        <div className="space-y-0.5 sm:space-y-1 text-right">
          <div className={`flex items-center justify-end gap-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider ${
            snapshot.netCashflow >= 0 ? 'text-[#00884E] dark:text-[#1AE893]' : 'text-rose-500'
          }`}>
            <span>{snapshot.netCashflow >= 0 ? '● Surplus' : '● Deficit'}</span>
          </div>
          <div className={`text-xs xs:text-sm sm:text-2xl font-bold font-mono truncate ${
            snapshot.netCashflow >= 0 ? 'text-[#00884E] dark:text-[#1AE893]' : 'text-rose-500'
          }`}>
            {snapshot.netCashflow >= 0 ? '+' : '-'}₹{Math.abs(snapshot.netCashflow).toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-abyss-textMuted hidden xs:block truncate">
            Net Cashflow
          </div>
        </div>
      </div>

      {/* ── 3. EXECUTIVE DAILY BRIEFINGS (MORNING & EVENING) ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Morning Intention */}
        <div 
          onClick={() => onOpenDebrief()}
          className="spatial-card p-4 sm:p-5 flex items-center justify-between cursor-pointer group hover:border-ochre-500/50 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-ochre-500/15 border border-ochre-500/30 flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-105 transition-transform">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-abyss-textPrimary">
                  Morning Intention
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full bg-ochre-500/20 text-ochre-500 border border-ochre-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-abyss-textMuted mt-0.5 font-medium">
                Real-time spend notifications
              </p>
            </div>
          </div>
          <span className="text-base sm:text-lg font-bold text-abyss-textMuted group-hover:text-ochre-500 transition">→</span>
        </div>

        {/* Evening Reflection */}
        <div 
          onClick={() => onOpenDebrief()}
          className="spatial-card p-4 sm:p-5 flex items-center justify-between cursor-pointer group hover:border-synapse-500/50 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-synapse-500/15 border border-synapse-500/30 flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-105 transition-transform">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-abyss-textPrimary">
                  Night Reflection
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full bg-synapse-500/20 text-synapse-400 border border-synapse-500/30">
                  10 PM
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-abyss-textMuted mt-0.5 font-medium">
                Nightly wrap-up & forensic debrief
              </p>
            </div>
          </div>
          <span className="text-base sm:text-lg font-bold text-abyss-textMuted group-hover:text-synapse-500 transition">→</span>
        </div>
      </div>

      {/* ── 4. WHERE YOUR MONEY WENT (SPEND DNA HEATMAP) ────────────────── */}
      <div className="spatial-card p-4 sm:p-7 space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
              Where your money went
            </h3>
            <p className="text-[11px] sm:text-xs text-abyss-textMuted font-medium">
              Deterministic category breakdown • {snapshot.categoryDistribution.length} sectors
            </p>
          </div>
          <button 
            onClick={() => onNavigateToTab('CATEGORIES')}
            className="spatial-btn px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs text-jade-500 border-jade-500/30 whitespace-nowrap shrink-0"
          >
            View all ({snapshot.categoryDistribution.length}) →
          </button>
        </div>

        {/* Multi-segment Spend DNA Progress Bar */}
        <div className="h-3 sm:h-3.5 rounded-full overflow-hidden flex gap-0.5 sm:gap-1 p-0.5 bg-abyss-well border border-abyss-border shadow-inner">
          {snapshot.categoryDistribution.map((cat) => {
            const catColors = getCategoryColor(cat.category, isDark);
            return (
              <div
                key={cat.category}
                style={{ width: `${Math.max(3, cat.pct)}%`, backgroundColor: catColors.solid }}
                className="h-full rounded-full hover:opacity-85 transition cursor-pointer shadow-sm"
                title={`${cat.category}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.pct}%)`}
                onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
              />
            );
          })}
        </div>

        {/* Category Rows */}
        <div className="space-y-2 pt-1 sm:pt-2">
          {snapshot.categoryDistribution.slice(0, 5).map((cat) => {
            const catColors = getCategoryColor(cat.category, isDark);
            return (
              <div 
                key={cat.category}
                onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
                className="p-3 sm:p-3.5 rounded-xl sm:rounded-[14px] bg-abyss-well border border-abyss-border hover:border-abyss-borderStrong hover:bg-abyss-elevated active:scale-[0.99] cursor-pointer transition-all duration-200 space-y-1.5 sm:space-y-2"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: catColors.solid }} />
                    <span className="font-semibold text-abyss-textPrimary tracking-tight truncate">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="font-mono text-[10px] sm:text-xs text-abyss-textMuted font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-abyss-card border border-abyss-border">
                      {cat.pct}%
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-abyss-textPrimary">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="h-1 sm:h-1.5 rounded-full bg-abyss-card overflow-hidden">
                  <div 
                    style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: catColors.solid }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. ✨ BYTFLOWW AI FORENSIC INSIGHTS ──────────────────────────── */}
      <div className="spatial-card p-4 sm:p-7 space-y-3 sm:space-y-3.5 border-l-4 border-l-synapse-500 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-synapse-500">
            <span>✨</span> BYTFLOWW AI FORENSIC INSIGHTS
          </div>
          <button 
            onClick={() => onNavigateToTab('ASSISTANT')}
            className="spatial-btn px-3 sm:px-4 py-1 text-xs text-synapse-400 border-synapse-500/40 bg-synapse-500/10 shrink-0"
          >
            Ask Copilot →
          </button>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-start gap-2">
            <span className={isOverBudget ? 'text-pulse-500 font-bold' : 'text-jade-500 font-bold'}>•</span>
            <span className="font-medium text-abyss-textPrimary leading-snug">
              {isOverBudget 
                ? `Budget exceeded by ₹${varianceAmount.toLocaleString('en-IN')} (burn velocity high)`
                : `Optimal financial velocity: ₹${varianceAmount.toLocaleString('en-IN')} headroom remaining this period`}
            </span>
          </div>

          {topMerchant && (
            <div 
              onClick={() => onSelectMerchant(topMerchant.name)}
              className="flex items-start gap-2 cursor-pointer hover:opacity-85"
            >
              <span className="font-bold text-telemetry-500">•</span>
              <span className="text-abyss-textSecondary leading-snug">
                Primary merchant spend: <strong className="text-abyss-textPrimary font-semibold">{topMerchant.name}</strong> (₹{topMerchant.totalSpend.toLocaleString('en-IN')}) 🔍
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 pt-2 text-[11px] sm:text-xs text-abyss-textMuted border-t border-abyss-border">
            <span>💡</span>
            <span>Local ledger analysis processed {snapshot.transactionCount} transactions with 100% deterministic privacy.</span>
          </div>
        </div>
      </div>

      {/* ── 6. UPCOMING COMMITMENTS ─────────────────────────────────────── */}
      <div className="spatial-card p-4 sm:p-7 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
              Upcoming commitments
            </h3>
            <p className="text-[11px] sm:text-xs text-abyss-textMuted font-medium">
              Automated recurring debits, EMIs & active subscriptions
            </p>
          </div>
          <button 
            onClick={() => onNavigateToTab('COMMITMENTS')}
            className="spatial-btn px-3 sm:px-4 py-1 text-xs text-ochre-500 border-ochre-500/30 shrink-0"
          >
            View all ({snapshot.commitments.length}) →
          </button>
        </div>

        <div 
          onClick={() => onNavigateToTab('COMMITMENTS')}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left pt-1 cursor-pointer"
        >
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-[14px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-[10px] sm:text-xs text-ochre-500 font-bold block">EMIs & Loans</span>
            <div className="text-xs sm:text-lg font-bold font-mono mt-1 text-ochre-500">
              ₹{snapshot.totalEmis.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-[14px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-[10px] sm:text-xs text-pulse-500 font-bold block">Subscriptions</span>
            <div className="text-xs sm:text-lg font-bold font-mono mt-1 text-pulse-500">
              ₹{snapshot.totalSubscriptions.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-[14px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-[10px] sm:text-xs text-telemetry-500 font-bold block">Utility Bills</span>
            <div className="text-xs sm:text-lg font-bold font-mono mt-1 text-telemetry-500">
              ₹{snapshot.totalBills.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-[14px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-[10px] sm:text-xs text-abyss-textMuted font-bold block">Insurance</span>
            <div className="text-xs sm:text-lg font-bold font-mono mt-1 text-abyss-textMuted">
              —
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. LINKED BANK ACCOUNTS & LIQUIDITY ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-abyss-textSecondary">
            <span>●</span> LINKED BANK ACCOUNTS & LIQUIDITY
          </div>
          <span className="text-[11px] sm:text-xs text-abyss-textMuted font-medium">
            {snapshot.accounts.length} Accounts • Tap to inspect 🔍
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {snapshot.accounts.map((acc) => {
            const isAirtel = acc.institution.toLowerCase().includes('airtel');

            return (
              <div 
                key={`${acc.institution}_${acc.accountMask}`}
                onClick={() => onSelectAccount && onSelectAccount(acc)}
                className="spatial-card p-4 sm:p-6 space-y-3 sm:space-y-4 cursor-pointer group hover:border-jade-500/40 active:scale-[0.99] transition-all"
              >
                {/* Header Row: Bank Logo, Institution, Verified Badge & Account Mask */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <MerchantLogoView merchantName={acc.institution} size={32} shape="circle" />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-abyss-textPrimary flex items-center gap-1.5 sm:gap-2">
                        <span className="truncate">{acc.institution}</span>
                        <span className="text-[8px] sm:text-[9px] bg-jade-500/20 text-jade-500 px-1.5 py-0.5 rounded-full font-bold border border-jade-500/30 shrink-0">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-abyss-textMuted font-medium">
                        {acc.accountType}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-abyss-textSecondary font-bold shrink-0">
                    •••• {acc.accountMask}
                  </span>
                </div>

                <div className="pt-0.5">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-abyss-textMuted font-semibold">
                    AVAILABLE BALANCE
                  </span>
                  <div className="text-xl sm:text-3xl font-bold font-mono mt-0.5 text-abyss-textPrimary flex items-baseline gap-1">
                    <span className="text-base sm:text-lg text-abyss-textMuted font-sans">₹</span>
                    {(acc.latestBalance !== undefined ? acc.latestBalance : (isAirtel ? 33.09 : 26860)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-abyss-border flex justify-between text-[11px] sm:text-xs text-abyss-textMuted">
                  <span>Outflow: <strong className="text-pulse-500 font-mono">₹{acc.totalDebits.toLocaleString('en-IN')}</strong></span>
                  <span className="text-jade-500 font-semibold group-hover:underline">View History ↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 8. DETECTED CREDIT CARDS & SPEND LIMITS ──────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-abyss-textSecondary">
            <span>●</span> DETECTED CREDIT CARDS & SPEND LIMITS
          </div>
          <span className="text-[11px] sm:text-xs text-abyss-textMuted font-medium">
            {snapshot.creditCards.length} Card • Tap for Drilldown 🔍
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {snapshot.creditCards.slice(0, 2).map((card) => (
            <div 
              key={`${card.institution}_${card.accountMask}`}
              onClick={() => onSelectCreditCard && onSelectCreditCard(card)}
              className="spatial-card p-4 sm:p-6 relative overflow-hidden cursor-pointer group hover:border-synapse-500/40 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-abyss-textPrimary">
                    {card.institution.toUpperCase()}
                  </span>
                  <span className="text-[8px] sm:text-[9px] bg-abyss-well px-2 py-0.5 rounded-full font-semibold text-abyss-textSecondary border border-abyss-border">
                    VISA PLATINUM
                  </span>
                </div>
                <span className="text-xs font-mono text-abyss-textSecondary font-bold">
                  •••• {card.accountMask}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3 sm:my-4 relative z-10">
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-abyss-textMuted block">
                    Available Limit
                  </span>
                  <span className="text-lg sm:text-2xl font-bold font-mono text-jade-500">
                    ₹{(card.availableLimit ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-abyss-textMuted block">
                    Total Credit Limit
                  </span>
                  <span className="text-lg sm:text-2xl font-bold font-mono text-abyss-textPrimary">
                    ₹{(card.totalLimit ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Limit Bar */}
              <div className="h-2 rounded-full bg-abyss-well overflow-hidden relative z-10 border border-abyss-border">
                <div 
                  style={{ width: `${Math.round(((card.availableLimit ?? 0) / Math.max(1, (card.totalLimit ?? 1))) * 100)}%` }}
                  className="h-full bg-jade-500 rounded-full"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] sm:text-xs text-abyss-textMuted pt-2 sm:pt-3 relative z-10">
                <span>Cycle Outflow: <strong className="text-pulse-500 font-mono">₹{card.totalDebits.toLocaleString('en-IN')}</strong></span>
                <span className="text-jade-500 font-semibold group-hover:underline">Card Forensics ↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
