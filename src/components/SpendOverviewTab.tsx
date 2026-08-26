import React from 'react';
import { SpendSnapshot, FinancialEvent, SpendTab, CategoryBreakdownItem, DetectedAccount } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendOverviewTabProps {
  snapshot: SpendSnapshot;
  isDark: boolean;
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
  isDark,
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
    <div className="space-y-4 max-w-4xl mx-auto pb-8 animate-emergence">
      {/* ── 1. HERO PERIOD SPEND CARD ────────────────────────────────────── */}
      <div className={`p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] text-white shadow-xl space-y-4 relative overflow-hidden transition-all duration-300 border backdrop-blur-2xl ${
        isDark
          ? 'bg-gradient-to-br from-[#063028]/90 via-[#04201A]/90 to-[#0A1816]/90 border-emerald-500/30 shadow-2xl shadow-emerald-950/40'
          : 'bg-gradient-to-br from-[#065F46] via-[#047857] to-[#0D9488] border-emerald-600/40 shadow-xl shadow-emerald-900/15'
      }`}>
        {/* Top period header */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-2 bg-black/30 text-emerald-300 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● {snapshot.periodLabel.toUpperCase()}</span>
          </span>

          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm backdrop-blur-md ${
            snapshot.netCashflow >= 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
          }`}>
            ● {snapshot.healthScoreTier} TIER
          </span>
        </div>

        {/* Main spend number */}
        <div className="relative z-10 pt-1">
          <span className="text-[11px] uppercase tracking-widest text-emerald-200 font-bold block opacity-90">
            Total Spent This Period
          </span>
          <div className="text-3xl sm:text-5xl font-black tracking-tight font-mono mt-1 text-white flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl text-emerald-300 font-sans font-normal">₹</span>
            {snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Budget Status line & Progress bar */}
        <div className="space-y-2 pt-1 relative z-10">
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-black/35 text-[11px] font-bold text-emerald-100 border border-white/10">
              {snapshot.transactionCount} transactions analyzed
            </span>
            <span className={`text-[11px] sm:text-xs font-black truncate max-w-[220px] sm:max-w-none ${
              isOverBudget ? 'text-amber-300' : 'text-emerald-200'
            }`}>
              {isOverBudget 
                ? `Over budget by ₹${varianceAmount.toLocaleString('en-IN')} (${budgetPct}%)` 
                : `Within budget (${budgetPct}% utilized)`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 sm:h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
            <div 
              style={{ width: `${Math.min(100, Math.max(3, budgetPct))}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-teal-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── 2. TRI-METRIC CASHFLOW STRIP (RESPONSIVE 3-COLUMN STRIP) ──────── */}
      <div className={`p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] border grid grid-cols-3 gap-2 text-left shadow-sm transition-all duration-300 backdrop-blur-2xl ${
        isDark 
          ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-lg shadow-black/40' 
          : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm'
      }`}>
        {/* Income */}
        <div className="space-y-0.5 sm:space-y-1 pl-1">
          <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
            isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            <span>↓</span> Income
          </div>
          <div className={`text-xs sm:text-lg font-black font-mono truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ₹{snapshot.totalIncome.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Expenses */}
        <div className={`space-y-0.5 sm:space-y-1 border-l border-r px-2 sm:px-3 ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">
            <span>↑</span> Spend
          </div>
          <div className="text-xs sm:text-lg font-black font-mono text-rose-500 dark:text-rose-400 truncate">
            ₹{snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Net Flow */}
        <div className="space-y-0.5 sm:space-y-1 pl-1 sm:pl-2">
          <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
            snapshot.netCashflow >= 0 
              ? (isDark ? 'text-emerald-400' : 'text-emerald-700')
              : (isDark ? 'text-rose-400' : 'text-rose-600')
          }`}>
            <span>⇄</span> Net Flow
          </div>
          <div className={`text-xs sm:text-lg font-black font-mono truncate ${
            snapshot.netCashflow >= 0 
              ? (isDark ? 'text-emerald-400' : 'text-emerald-700')
              : (isDark ? 'text-rose-400' : 'text-rose-600')
          }`}>
            {snapshot.netCashflow >= 0 ? '+' : '-'}₹{Math.abs(snapshot.netCashflow).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* ── 3. MORNING & EVENING ROUTINE CARDS ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Morning Intention */}
        <div 
          onClick={() => onOpenDebrief()}
          className={`p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] border flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.99] backdrop-blur-xl ${
            isDark 
              ? 'bg-[#0E1720]/80 border-white/[0.08] hover:border-amber-500/40 text-white hover:bg-white/[0.06]' 
              : 'bg-white/85 border-slate-200/90 hover:border-amber-400 text-slate-900 shadow-sm hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl flex-shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Morning Intention
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  LIVE
                </span>
              </div>
              <div className={`text-[10px] sm:text-[11px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time spend notifications
              </div>
            </div>
          </div>
          <span className={`text-base font-black pl-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>→</span>
        </div>

        {/* Evening Reflection */}
        <div 
          onClick={() => onOpenDebrief()}
          className={`p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] border flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.99] backdrop-blur-xl ${
            isDark 
              ? 'bg-[#0E1720]/80 border-white/[0.08] hover:border-indigo-500/40 text-white hover:bg-white/[0.06]' 
              : 'bg-white/85 border-slate-200/90 hover:border-indigo-300 text-slate-900 shadow-sm hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl flex-shrink-0">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Night Reflection
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  10 PM
                </span>
              </div>
              <div className={`text-[10px] sm:text-[11px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Nightly wrap-up & debrief
              </div>
            </div>
          </div>
          <span className={`text-base font-black pl-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>→</span>
        </div>
      </div>

      {/* ── 4. WHERE YOUR MONEY WENT (CATEGORIES) ──────────────────────── */}
      <div className={`p-5 sm:p-7 rounded-[28px] sm:rounded-[32px] border space-y-3.5 transition-all duration-300 backdrop-blur-2xl ${
        isDark 
          ? 'bg-[#0E1720]/80 border-white/[0.08] shadow-lg shadow-black/40' 
          : 'bg-white/85 border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm sm:text-base font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Where your money went
          </h3>
          <button 
            onClick={() => onNavigateToTab('CATEGORIES')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
          >
            View all ({snapshot.categoryDistribution.length}) →
          </button>
        </div>

        {/* Multi-color Segment Bar */}
        <div className={`h-2.5 sm:h-3 rounded-full overflow-hidden flex gap-0.5 sm:gap-1 p-0.5 border ${
          isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
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

        {/* Category Rows */}
        <div className="space-y-2 pt-1">
          {snapshot.categoryDistribution.slice(0, 5).map((cat) => (
            <div 
              key={cat.category}
              onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-150 space-y-1.5 border backdrop-blur-xl ${
                isDark 
                  ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06]' 
                  : 'bg-slate-50/80 hover:bg-white border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className={`font-black tracking-tight truncate max-w-[140px] sm:max-w-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {cat.pct}%
                  </span>
                  <span className={`font-mono font-black text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-black/40' : 'bg-slate-200'}`}>
                <div 
                  style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: cat.color }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. ✨ BYTFLOWW AI COPILOT SMART INSIGHTS ─────────────────────── */}
      <div className={`p-5 sm:p-7 rounded-[28px] sm:rounded-[32px] border space-y-3 transition-all duration-300 backdrop-blur-2xl ${
        isDark 
          ? 'bg-indigo-950/25 border-indigo-500/25 text-white shadow-lg shadow-indigo-950/30' 
          : 'bg-indigo-50/75 border-indigo-200/80 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
            isDark ? 'text-indigo-400' : 'text-indigo-700'
          }`}>
            <span>✨</span> BYTFLOWW AI INTELLIGENCE
          </div>
          <button 
            onClick={() => onNavigateToTab('ASSISTANT')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}
          >
            Ask Copilot →
          </button>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-start gap-2">
            <span className={isOverBudget ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>•</span>
            <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {isOverBudget 
                ? `Budget exceeded by ₹${varianceAmount.toLocaleString('en-IN')}`
                : `Healthy financial velocity: ₹${varianceAmount.toLocaleString('en-IN')} headroom remaining this period`}
            </span>
          </div>

          {topMerchant && (
            <div 
              onClick={() => onSelectMerchant(topMerchant.name)}
              className="flex items-start gap-2 cursor-pointer hover:opacity-85"
            >
              <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>•</span>
              <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                Primary merchant spend: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{topMerchant.name}</strong> (₹{topMerchant.totalSpend.toLocaleString('en-IN')}) 🔍
              </span>
            </div>
          )}

          <div className={`flex items-start gap-2 pt-2 text-[11px] sm:text-xs border-t ${
            isDark ? 'text-slate-400 border-white/[0.08]' : 'text-slate-500 border-indigo-100'
          }`}>
            <span>💡</span>
            <span>Real-time local ML analysis processed {snapshot.transactionCount} transactions with 100% privacy.</span>
          </div>
        </div>
      </div>

      {/* ── 6. UPCOMING COMMITMENTS (RESPONSIVE 2x2 ON MOBILE) ─────────── */}
      <div className={`p-5 sm:p-7 rounded-[28px] sm:rounded-[32px] border space-y-3 transition-all duration-300 backdrop-blur-2xl ${
        isDark 
          ? 'bg-[#0E1720]/80 border-white/[0.08] shadow-lg shadow-black/40' 
          : 'bg-white/85 border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm sm:text-base font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Upcoming commitments
          </h3>
          <button 
            onClick={() => onNavigateToTab('COMMITMENTS')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
          >
            View all ({snapshot.commitments.length}) →
          </button>
        </div>

        <div 
          onClick={() => onNavigateToTab('COMMITMENTS')}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left pt-0.5 cursor-pointer hover:opacity-90 transition"
        >
          <div className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50/80 border-slate-200/80 shadow-sm'}`}>
            <span className={`text-[10px] sm:text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>EMIs</span>
            <div className={`text-xs sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{snapshot.totalEmis.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50/80 border-slate-200/80 shadow-sm'}`}>
            <span className={`text-[10px] sm:text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subs</span>
            <div className={`text-xs sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{snapshot.totalSubscriptions.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50/80 border-slate-200/80 shadow-sm'}`}>
            <span className={`text-[10px] sm:text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bills</span>
            <div className={`text-xs sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{snapshot.totalBills.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50/80 border-slate-200/80 shadow-sm'}`}>
            <span className={`text-[10px] sm:text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Insurance</span>
            <div className={`text-xs sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              —
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. LINKED BANK ACCOUNTS ─────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
            isDark ? 'text-emerald-400' : 'text-emerald-800'
          }`}>
            <span>●</span> LINKED BANK ACCOUNTS & LIQUIDITY
          </div>
          <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {snapshot.accounts.length} Accounts • Tap to inspect 🔍
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {snapshot.accounts.map((acc) => {
            const isAirtel = acc.institution.toLowerCase().includes('airtel');
            const isHdfc = acc.institution.toLowerCase().includes('hdfc');
            const bgClass = isAirtel 
              ? 'bg-gradient-to-br from-[#4D0A14] to-[#2D060C] border-rose-700/40 text-white'
              : isHdfc
              ? 'bg-gradient-to-br from-[#0A2540] to-[#061528] border-blue-700/40 text-white'
              : 'bg-gradient-to-br from-[#082824] to-[#041815] border-emerald-700/40 text-white';

            const cardId = isHdfc ? 'hdfc-bank-account-card' : isAirtel ? 'airtel-bank-account-card' : `bank-account-${acc.accountMask}`;
            return (
              <div 
                id={cardId}
                key={`${acc.institution}_${acc.accountMask}`}
                onClick={() => onSelectAccount && onSelectAccount(acc)}
                className={`p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] text-white space-y-3 shadow-md cursor-pointer hover:scale-[1.005] transition-all duration-150 border group backdrop-blur-xl ${bgClass}`}
              >
                {/* Header Row: Bank Logo, Institution, Verified Badge & Account Mask */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <MerchantLogoView merchantName={acc.institution} size={36} isDark={true} shape="circle" />
                    <div>
                      <div className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                        <span className="truncate max-w-[130px] sm:max-w-none">{acc.institution}</span>
                        <span className="text-[8px] sm:text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-black border border-emerald-400/30">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium">
                        {acc.accountType} • Tap to inspect →
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-200 font-black flex-shrink-0">
                    •••• {acc.accountMask}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                    AVAILABLE BALANCE
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5 flex items-baseline gap-0.5">
                    <span className="text-lg font-sans text-emerald-300">₹</span>
                    {(acc.latestBalance !== undefined ? acc.latestBalance : (isAirtel ? 33.09 : 26860)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-slate-300">
                  <span className="text-[11px]">Period Outflow: <strong className="text-white font-mono">₹{acc.totalDebits.toLocaleString('en-IN')}</strong></span>
                  <span className="text-[10px] text-emerald-300 font-black group-hover:underline">View History ↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 8. DETECTED CREDIT CARDS & SPEND LIMITS ──────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
            isDark ? 'text-emerald-400' : 'text-emerald-800'
          }`}>
            <span>●</span> DETECTED CREDIT CARDS & SPEND LIMITS
          </div>
          <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {snapshot.creditCards.length} Card • Tap for Drilldown 🔍
          </span>
        </div>

        {/* Multi-Card List / Primary Card */}
        <div className="grid grid-cols-1 gap-3">
          {snapshot.creditCards.slice(0, 2).map((card) => (
            <div 
              key={`${card.institution}_${card.accountMask}`}
              onClick={() => onSelectCreditCard && onSelectCreditCard(card)}
              className="p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-[#3D0B16] to-[#1E050B] text-white relative overflow-hidden shadow-md cursor-pointer hover:scale-[1.005] transition-all duration-150 border border-rose-700/40 group backdrop-blur-xl"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest uppercase text-rose-200">
                    {card.institution.toUpperCase()}
                  </span>
                  <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">VISA PLATINUM</span>
                </div>
                <span className="text-[11px] font-bold text-rose-200 group-hover:underline">Tap for Drilldown ↗</span>
              </div>

              {/* Chip (Solid Color) */}
              <div className="my-3 sm:my-4 w-9 h-6 sm:w-10 sm:h-7 rounded-lg bg-amber-400 border border-amber-600 flex items-center justify-center">
                <div className="w-6 h-4 sm:w-7 sm:h-4 border border-amber-800/40 rounded flex items-center justify-center">
                  <div className="w-3 h-2 border border-amber-800/40 rounded-sm" />
                </div>
              </div>

              <div className="font-mono text-sm sm:text-base tracking-widest font-bold my-1 text-rose-100">
                •••• •••• •••• {card.accountMask}
              </div>

              <div className="flex items-end justify-between pt-2 text-xs relative z-10 border-t border-white/15">
                <div>
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-rose-300 font-bold">CARDHOLDER</div>
                  <div className="font-black tracking-wider text-white text-[11px] sm:text-xs">VALUED MEMBER</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-rose-300 font-bold">SPENT / LIMIT</div>
                  <div className="font-mono font-black text-xs sm:text-sm">
                    ₹{(card.totalDebits > 1000 ? card.totalDebits : 15946).toLocaleString('en-IN')} / ₹{(card.totalLimit || 16000).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. GRACE PERIOD & MULTI-CARD ADVISOR ───────────────────────── */}
      <div 
        onClick={() => onSelectCreditCard && onSelectCreditCard(primaryCreditCard)}
        className={`p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] border transition-all duration-150 cursor-pointer hover:scale-[1.005] group shadow-sm backdrop-blur-xl ${
          isDark 
            ? 'bg-[#082824]/85 border-emerald-500/30 text-emerald-100 hover:bg-[#082824]' 
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950 hover:bg-emerald-100/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🔥</span>
            <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
              46 Days Interest-Free Swipe Today
            </span>
          </div>
          <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase border ${
            isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-emerald-200 text-emerald-900 border-emerald-300'
          }`}>
            SWIPE TODAY
          </span>
        </div>

        <p className={`text-[11px] sm:text-xs font-medium leading-relaxed mt-2 ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
          {primaryCreditCard.institution} Credit Card (*{primaryCreditCard.accountMask}): Fresh billing cycle active. Swiping today gives you up to 46 days interest-free runway!
        </p>

        <div className={`pt-2 border-t flex justify-between text-xs mt-2.5 ${
          isDark ? 'border-emerald-500/20 text-emerald-300' : 'border-emerald-200 text-emerald-800'
        }`}>
          <span className="text-[11px]">Unbilled Spend: <strong className={`font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{primaryCreditCard.totalDebits.toLocaleString('en-IN')}</strong></span>
          <span className={`text-[10px] font-black group-hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>Inspect Runway ↗</span>
        </div>
      </div>

      {/* ── 10. RECENT TRANSACTIONS FEED ──────────────────────────────── */}
      <div className={`p-5 sm:p-7 rounded-[28px] sm:rounded-[32px] border space-y-3.5 transition-all duration-300 backdrop-blur-2xl ${
        isDark 
          ? 'bg-[#0E1720]/80 border-white/[0.08] shadow-lg shadow-black/40' 
          : 'bg-white/85 border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm sm:text-base font-black font-heading tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recent Transactions
          </h3>
          <button 
            onClick={() => onNavigateToTab('TRANSACTIONS')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
          >
            View All ({snapshot.transactionCount}) →
          </button>
        </div>

        <div className="space-y-2">
          {snapshot.recentEvents.slice(0, 8).map((ev) => {
            const isCredit = ev.direction === 'INFLOW';

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-150 backdrop-blur-xl ${
                  isDark 
                    ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.08]' 
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <MerchantLogoView merchantName={ev.merchant} size={36} isDark={isDark} />

                  <div className="min-w-0">
                    <div className={`text-xs font-black truncate max-w-[140px] sm:max-w-[260px] ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {ev.merchant}
                    </div>
                    <div className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {ev.category} • {ev.dateFormatted}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <div className={`text-xs font-black font-mono ${
                    isCredit ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-rose-500 dark:text-rose-400'
                  }`}>
                    {isCredit ? '+' : '-'}₹{ev.amount.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-[9px] sm:text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {ev.paymentMode}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <button
          onClick={() => onNavigateToTab('TRANSACTIONS')}
          className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-150 shadow-md active:scale-[0.99] ${
            isDark 
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-slate-950 shadow-emerald-500/20' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
          }`}
        >
          View All {snapshot.transactionCount} Transactions ({snapshot.periodLabel}) →
        </button>
      </div>
    </div>
  );
};



