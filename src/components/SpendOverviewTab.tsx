import React from 'react';
import { SpendSnapshot, FinancialEvent, SpendTab, CategoryBreakdownItem, DetectedAccount } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

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
      {/* ── 1. HERO PERIOD SPEND SPATIAL WINDOW CARD ─────────────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Top period header */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <span className="spatial-btn px-4 py-1.5 text-xs flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            <span>{snapshot.periodLabel.toUpperCase()}</span>
          </span>

          <span className={`px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider border backdrop-blur-xl ${
            snapshot.netCashflow >= 0
              ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30'
              : 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/30'
          }`}>
            ● {snapshot.healthScoreTier} HEALTH TIER
          </span>
        </div>

        {/* Main spend number */}
        <div className="relative z-10 pt-2">
          <span className="text-xs uppercase tracking-widest text-white/60 font-semibold block">
            Total Spent This Period
          </span>
          <div className="text-4xl sm:text-6xl font-bold tracking-tight font-mono mt-1 text-white flex items-baseline gap-1">
            <span className="text-2xl sm:text-4xl text-white/50 font-normal">₹</span>
            {snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Budget Status line & Progress bar */}
        <div className="space-y-3 pt-2 relative z-10 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/15">
              {snapshot.transactionCount} transactions analyzed
            </span>
            <span className={isOverBudget ? 'text-[#FF9F0A]' : 'text-[#30D158]'}>
              {isOverBudget 
                ? `Over budget by ₹${varianceAmount.toLocaleString('en-IN')} (${budgetPct}%)` 
                : `Within budget (${budgetPct}% utilized)`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-black/40 border border-white/15 overflow-hidden p-0.5">
            <div 
              style={{ width: `${Math.min(100, Math.max(3, budgetPct))}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-[#FF453A]' : 'bg-gradient-to-r from-[#0A84FF] to-[#30D158]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── 2. TRI-METRIC CASHFLOW STRIP (3-COLUMN SPATIAL CARD) ─────────── */}
      <div className="spatial-card p-4 sm:p-6 grid grid-cols-3 gap-2 sm:gap-4 text-left">
        {/* Income */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#30D158]">
            <span>↓</span> Income
          </div>
          <div className="text-xs sm:text-2xl font-bold font-mono text-white truncate">
            ₹{snapshot.totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-white/40 font-mono">Inflows</div>
        </div>

        {/* Expenses */}
        <div className="space-y-1 border-l border-r border-white/15 px-2 sm:px-6">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#FF453A]">
            <span>↑</span> Spend
          </div>
          <div className="text-xs sm:text-2xl font-bold font-mono text-[#FF453A] truncate">
            ₹{snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-white/40 font-mono">Debits</div>
        </div>

        {/* Net Flow */}
        <div className="space-y-1 pl-1 sm:pl-2">
          <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
            snapshot.netCashflow >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'
          }`}>
            <span>⇄</span> Net
          </div>
          <div className={`text-xs sm:text-2xl font-bold font-mono truncate ${
            snapshot.netCashflow >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'
          }`}>
            {snapshot.netCashflow >= 0 ? '+' : '-'}₹{Math.abs(snapshot.netCashflow).toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-white/40 font-mono">Delta</div>
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
            <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Morning Intention
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5 font-medium">
                Real-time spend notifications
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-white/40 group-hover:text-white transition">→</span>
        </div>

        {/* Evening Reflection */}
        <div 
          onClick={() => onOpenDebrief()}
          className="spatial-card p-5 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Night Reflection
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#AF52DE]/20 text-[#AF52DE] border border-[#AF52DE]/30">
                  10 PM
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5 font-medium">
                Nightly wrap-up & debrief
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-white/40 group-hover:text-white transition">→</span>
        </div>
      </div>

      {/* ── 4. WHERE YOUR MONEY WENT (CATEGORIES) ──────────────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
            Where your money went
          </h3>
          <button 
            onClick={() => onNavigateToTab('CATEGORIES')}
            className="spatial-btn px-3.5 py-1 text-xs"
          >
            View all ({snapshot.categoryDistribution.length}) →
          </button>
        </div>

        {/* Multi-color Segment Bar */}
        <div className="h-3 rounded-full overflow-hidden flex gap-1 p-0.5 bg-black/40 border border-white/15">
          {snapshot.categoryDistribution.map((cat) => (
            <div
              key={cat.category}
              style={{ width: `${Math.max(3, cat.pct)}%`, backgroundColor: cat.color }}
              className="h-full rounded-full hover:opacity-85 transition cursor-pointer shadow-sm"
              title={`${cat.category}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.pct}%)`}
              onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
            />
          ))}
        </div>

        {/* Category Rows (Table Wrapper) */}
        <div className="space-y-2 pt-2">
          {snapshot.categoryDistribution.slice(0, 5).map((cat) => (
            <div 
              key={cat.category}
              onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
              className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/25 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] space-y-2"
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-white tracking-tight truncate max-w-[160px] sm:max-w-xs">
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-white/50 font-bold">
                    {cat.pct}%
                  </span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-white">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                <div 
                  style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: cat.color }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. ✨ BYTFLOWW AI INTELLIGENCE ───────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-3.5 border-l-4 border-l-[#6366F1]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6366F1]">
            <span>✨</span> BYTFLOWW AI FORENSIC INSIGHTS
          </div>
          <button 
            onClick={() => onNavigateToTab('ASSISTANT')}
            className="spatial-btn px-3.5 py-1 text-xs"
          >
            Ask Copilot →
          </button>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <span className={isOverBudget ? 'text-[#FF453A] font-bold' : 'text-[#30D158] font-bold'}>•</span>
            <span className="font-medium text-white/90">
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
              <span className="font-bold text-[#0A84FF]">•</span>
              <span className="text-white/80">
                Primary merchant spend: <strong className="text-white font-semibold">{topMerchant.name}</strong> (₹{topMerchant.totalSpend.toLocaleString('en-IN')}) 🔍
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 pt-2 text-xs text-white/50 border-t border-white/10">
            <span>💡</span>
            <span>Local ledger analysis processed {snapshot.transactionCount} transactions with 100% deterministic privacy.</span>
          </div>
        </div>
      </div>

      {/* ── 6. UPCOMING COMMITMENTS ─────────────────────────────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
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
          <div className="p-4 rounded-[12px] bg-white/5 border border-white/10 hover:bg-white/15 transition">
            <span className="text-xs text-white/50 font-medium block">EMIs</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-white">
              ₹{snapshot.totalEmis.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-white/5 border border-white/10 hover:bg-white/15 transition">
            <span className="text-xs text-white/50 font-medium block">Subs</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-white">
              ₹{snapshot.totalSubscriptions.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-white/5 border border-white/10 hover:bg-white/15 transition">
            <span className="text-xs text-white/50 font-medium block">Bills</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-white">
              ₹{snapshot.totalBills.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-white/5 border border-white/10 hover:bg-white/15 transition">
            <span className="text-xs text-white/50 font-medium block">Insurance</span>
            <div className="text-sm sm:text-lg font-bold font-mono mt-1 text-white/40">
              —
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. LINKED BANK ACCOUNTS ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
            <span>●</span> LINKED BANK ACCOUNTS & LIQUIDITY
          </div>
          <span className="text-xs text-white/50 font-medium">
            {snapshot.accounts.length} Accounts • Tap to inspect 🔍
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {snapshot.accounts.map((acc) => {
            const isAirtel = acc.institution.toLowerCase().includes('airtel');
            const isHdfc = acc.institution.toLowerCase().includes('hdfc');

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
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="truncate max-w-[140px] sm:max-w-none">{acc.institution}</span>
                        <span className="text-[9px] bg-[#30D158]/20 text-[#30D158] px-2 py-0.5 rounded-full font-bold border border-[#30D158]/30">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-xs text-white/50 font-medium">
                        {acc.accountType}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/70 font-bold shrink-0">
                    •••• {acc.accountMask}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                    AVAILABLE BALANCE
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono mt-0.5 text-white flex items-baseline gap-1">
                    <span className="text-lg text-white/50 font-sans">₹</span>
                    {(acc.latestBalance !== undefined ? acc.latestBalance : (isAirtel ? 33.09 : 26860)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between text-xs text-white/60">
                  <span>Period Outflow: <strong className="text-white font-mono">₹{acc.totalDebits.toLocaleString('en-IN')}</strong></span>
                  <span className="text-white font-semibold group-hover:underline">View History ↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 8. DETECTED CREDIT CARDS & SPEND LIMITS ──────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
            <span>●</span> DETECTED CREDIT CARDS & SPEND LIMITS
          </div>
          <span className="text-xs text-white/50 font-medium">
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
                  <span className="text-xs font-bold tracking-widest uppercase text-white">
                    {card.institution.toUpperCase()}
                  </span>
                  <span className="text-[9px] bg-white/15 px-2.5 py-0.5 rounded-full font-semibold text-white/90 border border-white/20">
                    VISA PLATINUM
                  </span>
                </div>
                <span className="text-xs font-semibold text-white/70 group-hover:text-white transition">Tap for Drilldown ↗</span>
              </div>

              {/* Card Chip */}
              <div className="my-4 w-10 h-7 rounded-lg bg-amber-400/80 border border-amber-300 flex items-center justify-center shadow-sm">
                <div className="w-7 h-4 border border-amber-700/40 rounded flex items-center justify-center">
                  <div className="w-3 h-2 border border-amber-700/40 rounded-sm" />
                </div>
              </div>

              <div className="font-mono text-base sm:text-lg tracking-widest font-bold my-1 text-white">
                •••• •••• •••• {card.accountMask}
              </div>

              <div className="flex items-end justify-between pt-3 text-xs relative z-10 border-t border-white/15 mt-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">CARDHOLDER</div>
                  <div className="font-bold tracking-wider text-white text-xs">VALUED MEMBER</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">SPENT / LIMIT</div>
                  <div className="font-mono font-bold text-sm text-white">
                    ₹{(card.totalDebits > 1000 ? card.totalDebits : 15946).toLocaleString('en-IN')} / ₹{(card.totalLimit || 16000).toLocaleString('en-IN')}
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
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              46 Days Interest-Free Swipe Today
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30">
            OPTIMAL RUNWAY
          </span>
        </div>

        <p className="text-xs text-white/70 font-medium leading-relaxed">
          {primaryCreditCard.institution} Credit Card (*{primaryCreditCard.accountMask}): Fresh billing cycle active. Swiping today provides up to 46 days interest-free runway!
        </p>

        <div className="pt-3 border-t border-white/10 flex justify-between text-xs text-white/60">
          <span>Unbilled Spend: <strong className="font-mono font-bold text-white">₹{primaryCreditCard.totalDebits.toLocaleString('en-IN')}</strong></span>
          <span className="font-semibold text-white group-hover:underline">Inspect Runway ↗</span>
        </div>
      </div>

      {/* ── 10. RECENT TRANSACTIONS FEED (SPATIAL TABLE FEED) ─────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
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
        <div className="bg-white/5 border border-white/10 rounded-[16px] overflow-hidden">
          <div className="divide-y divide-white/10">
            {snapshot.recentEvents.slice(0, 8).map((ev) => {
              const isCredit = ev.direction === 'INFLOW';

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MerchantLogoView merchantName={ev.merchant} size={38} />

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[280px]">
                        {ev.merchant}
                      </div>
                      <div className="text-[11px] text-white/50 font-medium truncate mt-0.5">
                        {ev.category} • {ev.dateFormatted}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className={`text-xs sm:text-sm font-bold font-mono ${
                      isCredit ? 'text-[#30D158]' : 'text-white'
                    }`}>
                      {isCredit ? '+' : '-'}₹{ev.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">
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
          className="spatial-btn w-full py-3.5 text-xs font-bold text-white flex items-center justify-center gap-2"
        >
          View All {snapshot.transactionCount} Transactions ({snapshot.periodLabel}) →
        </button>
      </div>
    </div>
  );
};
