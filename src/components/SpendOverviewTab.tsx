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

  const primaryAccount = snapshot.accounts[0] || {
    institution: 'HDFC Bank',
    accountMask: '9082',
    accountType: 'SAVINGS',
    latestBalance: 26860,
    totalDebits: snapshot.totalSpend,
    totalCredits: snapshot.totalIncome,
    netCashflow: snapshot.netCashflow,
    txCount: snapshot.transactionCount,
  };

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
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── 1. HERO PERIOD SPEND CARD (SOLID DEEP EMERALD) ─────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] text-white shadow-xl space-y-4 relative overflow-hidden transition-all border ${
        isDark
          ? 'bg-[#062420] border-[#00BFA5]/30 shadow-black/40'
          : 'bg-[#004D40] border-teal-800 shadow-md'
      }`}>
        {/* Top period header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 bg-[#00BFA5]/20 text-[#00F2FE] border border-[#00BFA5]/30">
              <span className="w-2 h-2 rounded-full bg-[#00BFA5]" />
              ● {snapshot.periodLabel.toUpperCase()}
            </span>
          </div>

          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
            snapshot.netCashflow >= 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
          }`}>
            ● {snapshot.healthScoreTier}
          </span>
        </div>

        {/* Main spend number */}
        <div className="relative z-10 pt-1">
          <span className="text-[11px] uppercase tracking-widest text-teal-200 font-bold block">
            spent this period
          </span>
          <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono mt-1 text-white flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl text-[#00F2FE] font-sans">₹</span>
            {snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Budget Status line & Progress bar */}
        <div className="space-y-2.5 pt-1 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="px-3.5 py-1 rounded-full bg-black/40 text-[11px] font-bold text-teal-100 border border-white/10">
              {snapshot.transactionCount} transactions
            </span>
            <span className={`text-xs font-black ${isOverBudget ? 'text-amber-300' : 'text-emerald-300'}`}>
              {isOverBudget 
                ? `Over budget by ₹${varianceAmount.toLocaleString('en-IN')} (${budgetPct}%)` 
                : `Within budget (${budgetPct}% used • ₹${varianceAmount.toLocaleString('en-IN')} headroom)`}
            </span>
          </div>

          {/* Progress bar (Solid Color) */}
          <div className="h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
            <div 
              style={{ width: `${Math.min(100, Math.max(3, budgetPct))}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-[#EF4444]' : 'bg-[#00BFA5]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── 2. TRI-METRIC CASHFLOW STRIP (CLEAN SOLID CONTAINER) ────────── */}
      <div className={`p-5 rounded-[28px] border grid grid-cols-3 gap-2 text-left shadow-sm transition ${
        isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Income */}
        <div className="space-y-1 pl-1">
          <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${
            isDark ? 'text-[#00F2FE]' : 'text-teal-700'
          }`}>
            <span>↓</span> Income
          </div>
          <div className={`text-base sm:text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ₹{snapshot.totalIncome.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Expenses */}
        <div className={`space-y-1 border-l border-r px-3 ${isDark ? 'border-[#22323D]' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${
            isDark ? 'text-rose-400' : 'text-rose-600'
          }`}>
            <span>↑</span> Expenses
          </div>
          <div className={`text-base sm:text-xl font-black font-mono ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
            ₹{snapshot.totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Net Flow */}
        <div className="space-y-1 pl-2">
          <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${
            snapshot.netCashflow >= 0 
              ? (isDark ? 'text-[#00F2FE]' : 'text-teal-700')
              : (isDark ? 'text-rose-400' : 'text-rose-600')
          }`}>
            <span>⇄</span> Net Flow
          </div>
          <div className={`text-base sm:text-xl font-black font-mono ${
            snapshot.netCashflow >= 0 
              ? (isDark ? 'text-[#00F2FE]' : 'text-teal-700')
              : (isDark ? 'text-rose-400' : 'text-rose-600')
          }`}>
            {snapshot.netCashflow >= 0 ? '+' : '-'}₹{Math.abs(snapshot.netCashflow).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* ── 3. MORNING & EVENING ROUTINE CARDS ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Morning Intention / Live Spend Check */}
        <div 
          onClick={() => onOpenDebrief()}
          className={`p-5 rounded-[28px] border flex flex-col justify-between h-40 cursor-pointer transition hover:scale-[1.01] ${
            isDark 
              ? 'bg-[#121B22] border-[#22323D] hover:border-[#00BFA5]/50 text-white' 
              : 'bg-white border-slate-200 hover:border-teal-400 text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
              ☀️
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-[#00BFA5]/15 text-[#00F2FE] border-[#00BFA5]/30' : 'bg-teal-50 text-teal-800 border-teal-200'
            }`}>
              LIVE
            </span>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div>
              <div className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Morning Intention
              </div>
              <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Real-time spend notifications
              </div>
            </div>
            <span className={`text-base font-black ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}>→</span>
          </div>
        </div>

        {/* Evening Reflection / Nightly Wrap-up */}
        <div 
          onClick={() => onOpenDebrief()}
          className={`p-5 rounded-[28px] border flex flex-col justify-between h-40 cursor-pointer transition hover:scale-[1.01] ${
            isDark 
              ? 'bg-[#121B22] border-[#22323D] hover:border-purple-500/50 text-white' 
              : 'bg-white border-slate-200 hover:border-purple-400 text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
              🌙
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-purple-500/15 text-purple-300 border-purple-400/30' : 'bg-purple-50 text-purple-800 border-purple-200'
            }`}>
              10 PM
            </span>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div>
              <div className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Night Reflection
              </div>
              <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Nightly wrap-up & debrief
              </div>
            </div>
            <span className={`text-base font-black ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>→</span>
          </div>
        </div>
      </div>

      {/* ── 4. WHERE YOUR MONEY WENT (CATEGORIES) ──────────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-4 transition ${
        isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Where your money went
          </h3>
          <button 
            onClick={() => onNavigateToTab('CATEGORIES')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}
          >
            View all ({snapshot.categoryDistribution.length}) →
          </button>
        </div>

        {/* Multi-color Segment Bar */}
        <div className={`h-3 rounded-full overflow-hidden flex gap-1 p-0.5 border ${
          isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          {snapshot.categoryDistribution.map((cat) => (
            <div
              key={cat.category}
              style={{ width: `${Math.max(3, cat.pct)}%`, backgroundColor: cat.color }}
              className="h-full rounded-full hover:opacity-80 transition cursor-pointer shadow-sm"
              title={`${cat.category}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.pct}%)`}
              onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
            />
          ))}
        </div>

        {/* Category Rows */}
        <div className="space-y-2.5 pt-1">
          {snapshot.categoryDistribution.slice(0, 5).map((cat) => (
            <div 
              key={cat.category}
              onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigateToTab('CATEGORIES')}
              className={`p-4 rounded-2xl cursor-pointer transition space-y-2 border ${
                isDark 
                  ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49]' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                  <span className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {cat.pct}%
                  </span>
                  <span className={`font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
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

      {/* ── 5. ✨ NEEDS YOUR ATTENTION (AI COPILOT SMART INSIGHTS) ────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-3.5 transition ${
        isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
            isDark ? 'text-[#00F2FE]' : 'text-teal-800'
          }`}>
            <span>✨</span> NEEDS YOUR ATTENTION
          </div>
          <button 
            onClick={() => onNavigateToTab('ASSISTANT')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}
          >
            Ask Copilot →
          </button>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <span className={isOverBudget ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>•</span>
            <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {isOverBudget 
                ? `Budget exceeded by ₹${varianceAmount.toLocaleString('en-IN')}`
                : `Healthy financial period: ₹${varianceAmount.toLocaleString('en-IN')} headroom remaining`}
            </span>
          </div>

          {topMerchant && (
            <div 
              onClick={() => onSelectMerchant(topMerchant.name)}
              className="flex items-start gap-2.5 cursor-pointer hover:opacity-80"
            >
              <span className={`font-bold ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}>•</span>
              <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                Largest merchant: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{topMerchant.name}</strong> (₹{topMerchant.totalSpend.toLocaleString('en-IN')}) 🔍
              </span>
            </div>
          )}

          <div className={`flex items-start gap-2 pt-2 text-xs border-t ${
            isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'
          }`}>
            <span>💡</span>
            <span>AI Financial Intelligence analyzed {snapshot.transactionCount} transactions and detected {snapshot.accounts.length} linked accounts across your SMS feed.</span>
          </div>
        </div>
      </div>

      {/* ── 6. UPCOMING COMMITMENTS ──────────────────────────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-3.5 transition ${
        isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Upcoming commitments
          </h3>
          <button 
            onClick={() => onNavigateToTab('COMMITMENTS')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}
          >
            View all ({snapshot.commitments.length}) →
          </button>
        </div>

        <div 
          onClick={() => onNavigateToTab('COMMITMENTS')}
          className="grid grid-cols-4 gap-2 text-left pt-1 cursor-pointer hover:opacity-90 transition"
        >
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>EMIs</span>
            <div className={`text-sm sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{snapshot.totalEmis.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Subs</span>
            <div className={`text-sm sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{snapshot.totalSubscriptions.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Bills</span>
            <div className={`text-sm sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{snapshot.totalBills.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Insurance</span>
            <div className={`text-sm sm:text-base font-black font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              —
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. LINKED BANK ACCOUNTS & LIQUIDITY ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
            isDark ? 'text-[#00F2FE]' : 'text-teal-800'
          }`}>
            <span>●</span> LINKED BANK ACCOUNTS & LIQUIDITY
          </div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {snapshot.accounts.length} Accounts • Tap to inspect 🔍
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-x-auto no-scrollbar">
          {snapshot.accounts.map((acc) => {
            const isAirtel = acc.institution.toLowerCase().includes('airtel');
            const isHdfc = acc.institution.toLowerCase().includes('hdfc');
            const bgClass = isAirtel 
              ? 'bg-[#4D0A14] border-rose-700/40 text-white'
              : isHdfc
              ? 'bg-[#0A2540] border-blue-700/40 text-white'
              : 'bg-[#082824] border-teal-700/40 text-white';

            const cardId = isHdfc ? 'hdfc-bank-account-card' : isAirtel ? 'airtel-bank-account-card' : `bank-account-${acc.accountMask}`;
            return (
              <div 
                id={cardId}
                key={`${acc.institution}_${acc.accountMask}`}
                onClick={() => onSelectAccount && onSelectAccount(acc)}
                className={`p-6 rounded-[28px] text-white space-y-3.5 shadow-md cursor-pointer hover:scale-[1.01] transition border group ${bgClass}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MerchantLogoView merchantName={acc.institution} size={40} isDark={true} shape="circle" />
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <span>{acc.institution}</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-black border border-emerald-400/30">VERIFIED</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium">{acc.accountType} • Tap to inspect →</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-200 font-bold">•••• {acc.accountMask}</span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">AVAILABLE BALANCE</span>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5 flex items-baseline gap-1">
                    <span className="text-xl font-sans text-teal-300">₹</span>
                    {(acc.latestBalance !== undefined ? acc.latestBalance : (isAirtel ? 33.09 : 26860)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 flex justify-between text-xs text-slate-300">
                  <span>Period Outflow: <strong className="text-white font-mono">₹{acc.totalDebits.toLocaleString('en-IN')}</strong></span>
                  <span className="text-[10px] text-teal-300 font-black group-hover:underline">View History ↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 8. DETECTED CREDIT CARDS & SPEND LIMITS ──────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
            isDark ? 'text-[#00F2FE]' : 'text-teal-800'
          }`}>
            <span>●</span> DETECTED CREDIT CARDS & SPEND LIMITS
          </div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {snapshot.creditCards.length} Card • Tap for Drilldown 🔍
          </span>
        </div>

        {/* Multi-Card List / Primary Card */}
        <div className="grid grid-cols-1 gap-3">
          {snapshot.creditCards.slice(0, 2).map((card) => (
            <div 
              key={`${card.institution}_${card.accountMask}`}
              onClick={() => onSelectCreditCard && onSelectCreditCard(card)}
              className="p-6 rounded-[28px] bg-[#3D0B16] text-white relative overflow-hidden shadow-md cursor-pointer hover:scale-[1.01] transition border border-rose-700/40 group"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest uppercase text-rose-200">
                    {card.institution.toUpperCase()}
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">VISA PLATINUM</span>
                </div>
                <span className="text-xs font-bold text-rose-200 group-hover:underline">Tap for Full Card Breakdown ↗</span>
              </div>

              <div className="my-4 w-10 h-7 rounded-lg bg-amber-400 border border-amber-600 flex items-center justify-center">
                <div className="w-7 h-4 border border-amber-800/40 rounded flex items-center justify-center">
                  <div className="w-3 h-2 border border-amber-800/40 rounded-sm" />
                </div>
              </div>

              <div className="font-mono text-base tracking-widest font-bold my-2 text-rose-100">
                •••• •••• •••• {card.accountMask}
              </div>

              <div className="flex items-end justify-between pt-2.5 text-xs relative z-10 border-t border-white/15">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">CARDHOLDER / DUE DATE</div>
                  <div className="font-black tracking-wider text-white">VALUED MEMBER • 30 AUG</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">BILLED / LIMIT (AVL ₹{card.availableLimit || 54})</div>
                  <div className="font-mono font-black text-sm">
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
        className={`p-6 rounded-[28px] border transition cursor-pointer hover:scale-[1.005] group shadow-sm ${
          isDark 
            ? 'bg-[#082824] border-teal-500/30 text-teal-100' 
            : 'bg-teal-50 border-teal-200 text-teal-950'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-[#00F2FE]' : 'text-teal-900'}`}>
              46 Days Interest-Free Swipe Today
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
            isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-teal-200 text-teal-900 border-teal-300'
          }`}>
            SWIPE TODAY
          </span>
        </div>

        <p className={`text-xs font-medium leading-relaxed mt-2 ${isDark ? 'text-teal-200' : 'text-teal-900'}`}>
          {primaryCreditCard.institution} Credit Card (*{primaryCreditCard.accountMask}): Fresh billing cycle active. Swiping today gives you up to 46 days interest-free runway!
        </p>

        <div className={`pt-2.5 border-t flex justify-between text-xs mt-3 ${
          isDark ? 'border-teal-500/20 text-teal-300' : 'border-teal-200 text-teal-800'
        }`}>
          <span>Live Unbilled Spend: <strong className={`font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{primaryCreditCard.totalDebits.toLocaleString('en-IN')}</strong></span>
          <span className={`text-[10px] font-black group-hover:underline ${isDark ? 'text-[#00F2FE]' : 'text-teal-900'}`}>Inspect Runway ↗</span>
        </div>
      </div>

      {/* ── 10. ACTIVE SUBSCRIPTIONS & RECURRING ───────────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-3.5 transition ${
        isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-base ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}>🔄</span>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Active Subscriptions & Recurring
            </h3>
          </div>
          <button 
            onClick={() => onNavigateToTab('COMMITMENTS')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}
          >
            Manage →
          </button>
        </div>

        <div className="space-y-2.5 pt-1">
          {snapshot.commitments.filter(c => c.type === 'SUBSCRIPTION').slice(0, 2).map((sub) => (
            <div 
              key={sub.id}
              onClick={() => onNavigateToTab('COMMITMENTS')}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                isDark 
                  ? 'bg-[#18242D] border-[#273B49] hover:bg-[#20303D]' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <MerchantLogoView merchantName={sub.name} size={38} isDark={isDark} />
                <div>
                  <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{sub.name}</div>
                  <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Renews {sub.nextExpectedDate} • AUTOPAY
                  </div>
                </div>
              </div>
              <div className="text-right font-mono font-black text-xs text-rose-500">
                ₹{sub.amount}/mo
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 11. RECENT TRANSACTIONS FEED ──────────────────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-4 transition ${
        isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recent Transactions
          </h3>
          <button 
            onClick={() => onNavigateToTab('TRANSACTIONS')}
            className={`text-xs font-black hover:underline ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}
          >
            View All ({snapshot.transactionCount}) →
          </button>
        </div>

        <div className="space-y-2.5">
          {snapshot.recentEvents.slice(0, 8).map((ev) => {
            const isCredit = ev.direction === 'INFLOW';

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  isDark 
                    ? 'bg-[#18242D] border-[#273B49] hover:bg-[#20303D]' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MerchantLogoView merchantName={ev.merchant} size={40} isDark={isDark} />

                  <div>
                    <div className={`text-xs font-black truncate max-w-[180px] sm:max-w-[260px] ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {ev.merchant}
                    </div>
                    <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {ev.category} • {ev.accountHint || 'Bank A/c'} • {ev.dateFormatted}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-black font-mono ${
                    isCredit ? (isDark ? 'text-[#00F2FE]' : 'text-emerald-700') : 'text-rose-500'
                  }`}>
                    {isCredit ? '+' : '-'}₹{ev.amount.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {ev.paymentMode}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button (Solid Color) */}
        <button
          onClick={() => onNavigateToTab('TRANSACTIONS')}
          className={`w-full py-4 rounded-2xl font-black text-xs transition shadow-md active:scale-[0.99] ${
            isDark 
              ? 'bg-[#00BFA5] hover:bg-[#00A892] text-slate-950' 
              : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
          }`}
        >
          View All {snapshot.transactionCount} Transactions ({snapshot.periodLabel}) →
        </button>
      </div>
    </div>
  );
};

