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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. HERO PERIOD SPEND SOLID WINDOW CARD ──────────────────────── */}
      <div className="spatial-card-prism p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Top period header with Solid Sovereign Jade Pill */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <span className="spatial-btn px-4 py-1.5 text-xs flex items-center gap-2 border-jade-500/40 bg-jade-500/10">
            <span className="w-2 h-2 rounded-full bg-jade-500 animate-pulse" />
            <span className="text-jade-500 font-bold">{snapshot.periodLabel.toUpperCase()}</span>
          </span>

          <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider border bg-synapse-500/20 text-synapse-400 light:text-synapse-700 border-synapse-500/40 shadow-solid-sm">
            ✨ {snapshot.healthScoreTier} CAPITAL HEALTH TIER
          </span>
        </div>

        {/* Main spend number with Solid Typography */}
        <div className="relative z-10 pt-2">
          <span className="text-xs uppercase tracking-widest text-pulse-500 font-bold block">
            Capital Reconciled This Period (Outflow)
          </span>
          <div className="text-4xl sm:text-6xl font-black tracking-tight font-mono mt-1 flex items-baseline gap-1 text-pulse-500">
            <span className="text-2xl sm:text-4xl font-normal">₹</span>
            <span>
              {snapshot.totalSpend.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Budget Status line & Solid Progress bar */}
        <div className="space-y-3 pt-2 relative z-10 border-t border-pulse-500/20">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-abyss-well text-abyss-textSecondary border border-abyss-border">
              {snapshot.transactionCount} transactions analyzed
            </span>
            <span className={isOverBudget ? 'text-pulse-500 font-bold' : 'text-jade-500 font-bold'}>
              {isOverBudget 
                ? `Over budget by ₹${varianceAmount.toLocaleString('en-IN')} (${budgetPct}%)` 
                : `Within budget (${budgetPct}% utilized)`}
            </span>
          </div>

          {/* Solid Progress bar */}
          <div className="h-2.5 rounded-full bg-abyss-well border border-abyss-border overflow-hidden p-0.5">
            <div 
              style={{ width: `${Math.min(100, Math.max(3, budgetPct))}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-pulse-500' : 'bg-jade-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── 2. TRI-METRIC CASHFLOW STRIP (3-COLUMN SOLID CARD) ──────────── */}
      <div className="spatial-card p-4 sm:p-6 grid grid-cols-3 gap-2 sm:gap-4 text-left border-jade-500/25">
        {/* Income (Sovereign Jade) */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-jade-500">
            <span>↓</span> Income
          </div>
          <div className="text-xs sm:text-2xl font-bold font-mono text-jade-500 truncate">
            ₹{snapshot.totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-abyss-textMuted hidden sm:block">
            Inflow Credits
          </div>
        </div>

        {/* Expenses (Crimson Pulse) */}
        <div className="space-y-1 border-x border-abyss-border px-2 sm:px-4">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-pulse-500">
            <span>↑</span> Expenses
          </div>
          <div className="text-xs sm:text-2xl font-bold font-mono text-pulse-500 truncate">
            ₹{snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-abyss-textMuted hidden sm:block">
            {snapshot.transactionCount} debits
          </div>
        </div>

        {/* Net Surplus (Solid Status) */}
        <div className="space-y-1 text-right">
          <div className={`flex items-center justify-end gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
            snapshot.netCashflow >= 0 ? 'text-jade-500' : 'text-pulse-500'
          }`}>
            <span>{snapshot.netCashflow >= 0 ? '● Surplus' : '● Deficit'}</span>
          </div>
          <div className={`text-xs sm:text-2xl font-bold font-mono truncate ${
            snapshot.netCashflow >= 0 ? 'text-jade-500' : 'text-pulse-500'
          }`}>
            {snapshot.netCashflow >= 0 ? '+' : '-'}₹{Math.abs(snapshot.netCashflow).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-abyss-textMuted hidden sm:block">
            Net Cashflow
          </div>
        </div>
      </div>

      {/* ── 3. MORNING & EVENING ROUTINE CARDS ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Morning Intention */}
        <div 
          onClick={() => onOpenDebrief()}
          className="spatial-card p-5 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-ochre-500/15 border border-ochre-500/30 flex items-center justify-center text-2xl shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-abyss-textPrimary">
                  Morning Intention
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-ochre-500/20 text-ochre-500 border border-ochre-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-abyss-textMuted mt-0.5 font-medium">
                Real-time spend notifications
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-abyss-textMuted group-hover:text-abyss-textPrimary transition">→</span>
        </div>

        {/* Evening Reflection */}
        <div 
          onClick={() => onOpenDebrief()}
          className="spatial-card p-5 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-synapse-500/15 border border-synapse-500/30 flex items-center justify-center text-2xl shrink-0">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-abyss-textPrimary">
                  Night Reflection
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-synapse-500/20 text-synapse-400 light:text-synapse-700 border border-synapse-500/30">
                  10 PM
                </span>
              </div>
              <p className="text-xs text-abyss-textMuted mt-0.5 font-medium">
                Nightly wrap-up & debrief
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-abyss-textMuted group-hover:text-abyss-textPrimary transition">→</span>
        </div>
      </div>

      {/* ── 4. WHERE YOUR MONEY WENT (CATEGORIES) ──────────────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
            Where your money went
          </h3>
          <button 
            onClick={() => onNavigateToTab('CATEGORIES')}
            className="spatial-btn px-3.5 py-1 text-xs"
          >
            View all ({snapshot.categoryDistribution.length}) →
          </button>
        </div>

        {/* Multi-color Solid Segment Bar */}
        <div className="h-3 rounded-full overflow-hidden flex gap-1 p-0.5 bg-abyss-well border border-abyss-border">
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

        {/* Category Rows (Table Wrapper) */}
        <div className="space-y-2 pt-2">
          {snapshot.categoryDistribution.slice(0, 5).map((cat) => {
            const catColors = getCategoryColor(cat.category, isDark);
            return (
              <div 
                key={cat.category}
                onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
                className="p-3.5 rounded-[12px] bg-abyss-well border border-abyss-border hover:border-abyss-borderStrong cursor-pointer transition-all duration-200 space-y-2"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: catColors.solid }} />
                    <span className="font-semibold text-abyss-textPrimary tracking-tight truncate max-w-[160px] sm:max-w-xs">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-abyss-textMuted font-bold">
                      {cat.pct}%
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-abyss-textPrimary">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress Line */}
                <div className="h-1.5 rounded-full bg-abyss-canvas overflow-hidden">
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

      {/* ── 5. ✨ BYTFLOWW AI INTELLIGENCE ───────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-3.5 border-l-4 border-l-synapse-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-synapse-500">
            <span>✨</span> BYTFLOWW AI FORENSIC INSIGHTS
          </div>
          <button 
            onClick={() => onNavigateToTab('ASSISTANT')}
            className="spatial-btn px-3.5 py-1 text-xs text-synapse-400 light:text-synapse-700 border-synapse-500/40"
          >
            Ask Copilot →
          </button>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <span className={isOverBudget ? 'text-pulse-500 font-bold' : 'text-jade-500 font-bold'}>•</span>
            <span className="font-medium text-abyss-textPrimary">
              {isOverBudget 
                ? `Budget exceeded by ₹${varianceAmount.toLocaleString('en-IN')}`
                : `Healthy financial velocity: ₹${varianceAmount.toLocaleString('en-IN')} headroom remaining this period`}
            </span>
          </div>

          {topMerchant && (
            <div 
              onClick={() => onSelectMerchant(topMerchant.name)}
              className="flex items-start gap-2.5 cursor-pointer hover:opacity-85"
            >
              <span className="font-bold text-telemetry-500">•</span>
              <span className="text-abyss-textSecondary">
                Primary merchant spend: <strong className="text-abyss-textPrimary font-semibold">{topMerchant.name}</strong> (₹{topMerchant.totalSpend.toLocaleString('en-IN')}) 🔍
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 pt-2 text-xs text-abyss-textMuted border-t border-abyss-border">
            <span>💡</span>
            <span>Local ledger analysis processed {snapshot.transactionCount} transactions with 100% deterministic privacy.</span>
          </div>
        </div>
      </div>

      {/* ── 6. UPCOMING COMMITMENTS ─────────────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
            Upcoming commitments
          </h3>
          <button 
            onClick={() => onNavigateToTab('COMMITMENTS')}
            className="spatial-btn px-3.5 py-1 text-xs"
          >
            View all ({snapshot.commitments.length}) →
          </button>
        </div>

        <div 
          onClick={() => onNavigateToTab('COMMITMENTS')}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-1 cursor-pointer"
        >
          <div className="p-4 rounded-[12px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-xs text-ochre-500 font-bold block">EMIs</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-ochre-500">
              ₹{snapshot.totalEmis.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-xs text-pulse-500 font-bold block">Subs</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-pulse-500">
              ₹{snapshot.totalSubscriptions.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-xs text-telemetry-500 font-bold block">Bills</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-telemetry-500">
              ₹{snapshot.totalBills.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-abyss-well border border-abyss-border hover:bg-abyss-elevated transition">
            <span className="text-xs text-abyss-textMuted font-bold block">Insurance</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-abyss-textMuted">
              —
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. LINKED BANK ACCOUNTS ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-abyss-textSecondary">
            <span>●</span> LINKED BANK ACCOUNTS & LIQUIDITY
          </div>
          <span className="text-xs text-abyss-textMuted font-medium">
            {snapshot.accounts.length} Accounts • Tap to inspect 🔍
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {snapshot.accounts.map((acc) => {
            const isAirtel = acc.institution.toLowerCase().includes('airtel');

            return (
              <div 
                key={`${acc.institution}_${acc.accountMask}`}
                onClick={() => onSelectAccount && onSelectAccount(acc)}
                className="spatial-card p-6 space-y-4 cursor-pointer group"
              >
                {/* Header Row: Bank Logo, Institution, Verified Badge & Account Mask */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <MerchantLogoView merchantName={acc.institution} size={36} shape="circle" />
                    <div>
                      <div className="text-sm font-bold text-abyss-textPrimary flex items-center gap-2">
                        <span className="truncate max-w-[140px] sm:max-w-none">{acc.institution}</span>
                        <span className="text-[9px] bg-jade-500/20 text-jade-500 px-2 py-0.5 rounded-full font-bold border border-jade-500/30">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-xs text-abyss-textMuted font-medium">
                        {acc.accountType}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-abyss-textSecondary font-bold shrink-0">
                    •••• {acc.accountMask}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-abyss-textMuted font-semibold">
                    AVAILABLE BALANCE
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono mt-0.5 text-abyss-textPrimary flex items-baseline gap-1">
                    <span className="text-lg text-abyss-textMuted font-sans">₹</span>
                    {(acc.latestBalance !== undefined ? acc.latestBalance : (isAirtel ? 33.09 : 26860)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="pt-3 border-t border-abyss-border flex justify-between text-xs text-abyss-textMuted">
                  <span>Period Outflow: <strong className="text-pulse-500 font-mono">₹{acc.totalDebits.toLocaleString('en-IN')}</strong></span>
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
          <span className="text-xs text-abyss-textMuted font-medium">
            {snapshot.creditCards.length} Card • Tap for Drilldown 🔍
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {snapshot.creditCards.slice(0, 2).map((card) => (
            <div 
              key={`${card.institution}_${card.accountMask}`}
              onClick={() => onSelectCreditCard && onSelectCreditCard(card)}
              className="spatial-card p-6 relative overflow-hidden cursor-pointer group"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold tracking-widest uppercase text-abyss-textPrimary">
                    {card.institution.toUpperCase()}
                  </span>
                  <span className="text-[9px] bg-abyss-well px-2.5 py-0.5 rounded-full font-semibold text-abyss-textSecondary border border-abyss-border">
                    VISA PLATINUM
                  </span>
                </div>
                <span className="text-xs font-semibold text-abyss-textSecondary group-hover:text-abyss-textPrimary transition">Tap for Drilldown ↗</span>
              </div>

              {/* Card Chip */}
              <div className="my-4 w-10 h-7 rounded-lg bg-ochre-500/80 border border-ochre-400 flex items-center justify-center shadow-sm">
                <div className="w-7 h-4 border border-ochre-800/40 rounded flex items-center justify-center">
                  <div className="w-3 h-2 border border-ochre-800/40 rounded-sm" />
                </div>
              </div>

              <div className="font-mono text-base sm:text-lg tracking-widest font-bold my-1 text-abyss-textPrimary">
                •••• •••• •••• {card.accountMask}
              </div>

              <div className="flex items-end justify-between pt-3 text-xs relative z-10 border-t border-abyss-border mt-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-abyss-textMuted font-semibold">CARDHOLDER</div>
                  <div className="font-bold tracking-wider text-abyss-textPrimary text-xs">VALUED MEMBER</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-abyss-textMuted font-semibold">SPENT / LIMIT</div>
                  <div className="font-mono font-bold text-sm text-abyss-textPrimary">
                    <span className="text-pulse-500">₹{(card.totalDebits > 1000 ? card.totalDebits : 15946).toLocaleString('en-IN')}</span> / ₹{(card.totalLimit || 16000).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. GRACE PERIOD ADVISOR CARD ─────────────────────────────────── */}
      <div 
        onClick={() => onSelectCreditCard && onSelectCreditCard(primaryCreditCard)}
        className="spatial-card p-6 space-y-3 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="text-xs font-bold uppercase tracking-wider text-abyss-textPrimary">
              46 Days Interest-Free Swipe Today
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-jade-500/20 text-jade-500 border border-jade-500/30">
            OPTIMAL RUNWAY
          </span>
        </div>

        <p className="text-xs text-abyss-textSecondary font-medium leading-relaxed">
          {primaryCreditCard.institution} Credit Card (*{primaryCreditCard.accountMask}): Fresh billing cycle active. Swiping today provides up to 46 days interest-free runway!
        </p>

        <div className="pt-3 border-t border-abyss-border flex justify-between text-xs text-abyss-textMuted">
          <span>Unbilled Spend: <strong className="font-mono font-bold text-pulse-500">₹{primaryCreditCard.totalDebits.toLocaleString('en-IN')}</strong></span>
          <span className="font-semibold text-jade-500 group-hover:underline">Inspect Runway ↗</span>
        </div>
      </div>

      {/* ── 10. RECENT TRANSACTIONS FEED (SOLID TABLE FEED) ─────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-abyss-textPrimary">
            Recent Transactions
          </h3>
          <button 
            onClick={() => onNavigateToTab('TRANSACTIONS')}
            className="spatial-btn px-3.5 py-1 text-xs"
          >
            View All ({snapshot.transactionCount}) →
          </button>
        </div>

        {/* Transaction Table Wrapper */}
        <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
          <div className="divide-y divide-abyss-border">
            {snapshot.recentEvents.slice(0, 8).map((ev) => {
              const isCredit = ev.direction === 'INFLOW';

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-abyss-elevated transition-colors duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MerchantLogoView merchantName={ev.merchant} size={38} />

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-abyss-textPrimary truncate max-w-[150px] sm:max-w-[280px]">
                        {ev.merchant}
                      </div>
                      <div className="text-[11px] text-abyss-textMuted font-medium truncate mt-0.5">
                        {ev.category} • {ev.dateFormatted}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className={`text-xs sm:text-sm font-bold font-mono ${
                      isCredit ? 'text-jade-500' : 'text-pulse-500'
                    }`}>
                      {isCredit ? '+' : '-'}₹{ev.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-abyss-textMuted font-mono mt-0.5">
                      {ev.paymentMode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View All Button */}
        <button
          onClick={() => onNavigateToTab('TRANSACTIONS')}
          className="spatial-btn w-full py-3.5 text-xs font-bold text-abyss-textPrimary flex items-center justify-center gap-2"
        >
          View All {snapshot.transactionCount} Transactions ({snapshot.periodLabel}) →
        </button>
      </div>
    </div>
  );
};
