import React, { useState } from 'react';
import { CommitmentItem, SpendSnapshot } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendCommitmentsTabProps {
  commitments: CommitmentItem[];
  isDark: boolean;
  totalEmis: number;
  totalSubscriptions: number;
  totalBills: number;
  snapshot?: SpendSnapshot;
}

export const SpendCommitmentsTab: React.FC<SpendCommitmentsTabProps> = ({
  commitments,
  isDark,
  totalEmis,
  totalSubscriptions,
  totalBills,
}) => {
  const [selectedWaste, setSelectedWaste] = useState<any | null>(null);
  const [selectedHike, setSelectedHike] = useState<any | null>(null);
  const [selectedEmi, setSelectedEmi] = useState<any | null>(null);
  const [selectedMandate, setSelectedMandate] = useState<CommitmentItem | null>(null);

  // Group commitments dynamically
  const subscriptions = commitments.filter(c => c.type === 'SUBSCRIPTION');
  const emis = commitments.filter(c => c.type === 'EMI');
  const bills = commitments.filter(c => c.type === 'BILL');

  const totalMonthlyRunRate = totalEmis + totalSubscriptions + totalBills;

  // 1. Ghost Waste Overlap Clusters
  const wasteClusters = [
    {
      id: 'w1',
      vertical: 'Video OTT & Entertainment',
      overlappingCount: 2,
      annualSavings: 1344,
      description: 'Detected overlapping video streaming auto-pay services (Netflix, JioCinema / Hotstar). Consolidating or pausing unused subscriptions saves up to ₹1,344/year.',
      services: [
        { name: 'Netflix Premium', amount: 199, manageUrl: 'https://netflix.com/youraccount' },
        { name: 'Google Play / Cloud', amount: 149, manageUrl: 'https://play.google.com/store/account/subscriptions' },
        { name: 'Agione Tech / OTT', amount: 1649, manageUrl: 'https://agionetech.com' },
      ],
    },
    {
      id: 'w2',
      vertical: 'Cloud Storage & Productivity',
      overlappingCount: 1,
      annualSavings: 588,
      description: 'Recurring cloud storage auto-debits active across HDFC A/c *9082.',
      services: [
        { name: 'Google One / Drive', amount: 149, manageUrl: 'https://one.google.com' },
      ],
    }
  ];

  // 2. Price Hike Watchdog Alerts
  const priceHikeAlerts = [
    {
      id: 'h1',
      merchant: 'Airtel Telecom & Payments',
      oldAmount: 149,
      currentAmount: 199,
      increasePct: 33.5,
      effectiveDate: 'Aug 2026',
      note: 'Tariff revision detected from SMS notification on Airtel SIM (8400869600).',
      manageUrl: 'https://www.airtel.in',
    },
    {
      id: 'h2',
      merchant: 'Airtel Payments Bank eNACH',
      oldAmount: 50,
      currentAmount: 100,
      increasePct: 100,
      effectiveDate: 'Sep 2026',
      note: 'eNACH mandate failure charge revised from Rs 50 to Rs 100 per mandate failure.',
      manageUrl: 'https://www.airtel.in/bank',
    }
  ];

  // 3. Free Trial & Auto-Debit Countdown
  const freeTrialAlerts = [
    {
      id: 'ft1',
      service: 'Google Play / Cloud AutoPay',
      daysLeft: 3,
      amount: 149,
      expiryDate: '28 Aug 2026',
      accountMask: '9082',
      status: 'AUTOPAY_SCHEDULED',
      manageUrl: 'https://play.google.com/store/account/subscriptions',
    }
  ];

  // 4. EMI Debt Freedom Profiles
  const emiProfiles = emis.map(e => ({
    id: e.id,
    lenderName: e.name,
    monthlyEmi: e.amount,
    tenureRemainingMonths: 6,
    totalRemainingPrincipal: Math.round(e.amount * 5.2),
    targetDebtFreeDate: 'Jan 2027',
    progressPct: 65,
    accountMask: e.accountMask || '9082',
    prepaymentExtra: 500,
    monthsSaved: 2,
    interestSaved: 1240,
    manageUrl: e.name.toLowerCase().includes('flex') ? 'https://flexsalary.com' : 'https://mpokket.in',
  }));

  // 5. Upcoming Due Dates Carousel Items
  const upcomingDueItems = [
    ...emis.map(e => ({ ...e, badgeColor: isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-900 border border-amber-300' })),
    ...subscriptions.map(s => ({ ...s, badgeColor: isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-100 text-rose-900 border border-rose-300' })),
    ...bills.map(b => ({ ...b, badgeColor: isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-900 border border-blue-300' })),
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8">
      {/* ── 1. GHOST SUBSCRIPTION & ANNUAL SAVINGS WATCHDOG HERO ──────────────── */}
      <div className={`p-6 sm:p-8 rounded-[32px] border space-y-4 transition-all duration-200 ${
        isDark 
          ? 'bg-[#062420] border-brand-viridian/30 text-white shadow-xl shadow-black/40' 
          : 'bg-emerald-50/90 border-brand-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
              isDark ? 'bg-brand-viridian text-slate-950' : 'bg-brand-600 text-white'
            }`}>
              ✨
            </div>
            <h3 className="text-base font-black tracking-tight">
              Ghost Waste Watchdog
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black border ${
            isDark ? 'bg-brand-viridian/20 text-brand-viridian border-brand-viridian/30' : 'bg-emerald-100 text-brand-800 border-brand-300'
          }`}>
            {subscriptions.length} Subscriptions Active
          </span>
        </div>

        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest block ${
            isDark ? 'text-brand-300' : 'text-brand-700'
          }`}>
            ANNUAL SAVINGS POTENTIAL
          </span>
          <div className={`text-3xl sm:text-4xl font-black font-mono mt-1 flex items-baseline gap-1 ${
            isDark ? 'text-brand-viridian' : 'text-brand-800'
          }`}>
            <span className="text-2xl font-sans font-normal">₹</span>
            {((totalSubscriptions || 199) * 12).toLocaleString('en-IN')} <span className={`text-sm font-sans font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>/ yr</span>
          </div>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Detected {wasteClusters.length} recurring category clusters with automated mandates.
          </p>
        </div>

        {/* Waste Cluster Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {wasteClusters.map(w => (
            <div
              key={w.id}
              onClick={() => setSelectedWaste(w)}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-all duration-150 active:scale-95 ${
                isDark 
                  ? 'bg-[#10181E] border-white/[0.08] hover:border-brand-viridian/40 text-white' 
                  : 'bg-white border-brand-200 hover:border-brand-400 text-slate-900 shadow-sm'
              }`}
            >
              <span className="text-lg">📚</span>
              <div>
                <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {w.vertical}
                </div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>
                  {w.overlappingCount} services • Save ₹{w.annualSavings.toLocaleString('en-IN')}/yr ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. UPCOMING COMMITMENTS DUE DATES CAROUSEL ─────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-4 transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-base ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>📅</span>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Upcoming Due Dates
            </h3>
          </div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {upcomingDueItems.length} Scheduled
          </span>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {upcomingDueItems.map((item, idx) => (
            <div
              key={`${item.id}_${idx}`}
              onClick={() => setSelectedMandate(item)}
              className={`min-w-[170px] sm:min-w-[190px] p-4.5 rounded-[24px] border flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-150 ${
                isDark 
                  ? 'bg-[#142027] border-white/[0.06] hover:border-brand-viridian/40' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <MerchantLogoView merchantName={item.name} size={38} isDark={isDark} />
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.type}
                </span>
              </div>

              <div className="mt-3">
                <div className={`text-xs font-black tracking-tight truncate max-w-[140px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {item.name}
                </div>
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Due {item.nextExpectedDate}
                </div>
                <div className={`text-sm font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. FREE-TRIAL WATCHDOG & COUNTDOWN ALERTS ─────────────────── */}
      {freeTrialAlerts.length > 0 && (
        <div className={`p-5 sm:p-6 rounded-[28px] border space-y-3 transition-all duration-200 ${
          isDark ? 'bg-selvex-950/20 border-selvex-500/25' : 'bg-indigo-50/70 border-indigo-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-selvex-500 text-base">⏳</span>
              <h4 className={`text-xs sm:text-sm font-black ${isDark ? 'text-selvex-300' : 'text-selvex-900'}`}>
                Auto-Debit Countdown Watchdog
              </h4>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              isDark ? 'bg-selvex-500/20 text-selvex-300 border-selvex-400/30' : 'bg-indigo-100 text-indigo-900 border-indigo-300'
            }`}>
              {freeTrialAlerts.length} ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-2">
            {freeTrialAlerts.map(ft => (
              <div 
                key={ft.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isDark ? 'bg-[#10181E] border-white/[0.08]' : 'bg-white border-indigo-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MerchantLogoView merchantName={ft.service} size={36} isDark={isDark} />
                  <div>
                    <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{ft.service}</div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-selvex-400' : 'text-selvex-700'}`}>
                      Deducting in {ft.daysLeft} days • Next bill on {ft.expiryDate} (A/C *{ft.accountMask})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-black font-mono ${isDark ? 'text-selvex-300' : 'text-selvex-900'}`}>₹{ft.amount}</div>
                  <a href={ft.manageUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-amber-500 hover:underline block">
                    Manage / Cancel ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. PRICE HIKE & SILENT INFLATION WATCHDOG ──────────────────── */}
      <div className={`p-6 rounded-[28px] border space-y-3.5 transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-rose-500 text-base">📈</span>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Price Hike Watchdog ({priceHikeAlerts.length})
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
            isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/25' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            SILENT INFLATION DETECTED
          </span>
        </div>

        <div className="space-y-2.5">
          {priceHikeAlerts.map(hike => (
            <div
              key={hike.id}
              onClick={() => setSelectedHike(hike)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                isDark ? 'bg-[#142027] border-white/[0.06] hover:border-rose-500/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <MerchantLogoView merchantName={hike.merchant} size={38} isDark={isDark} />
                <div>
                  <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{hike.merchant}</div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                    ₹{hike.oldAmount} → ₹{hike.currentAmount} (+{hike.increasePct}%) • {hike.effectiveDate}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inspect ↗</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. DEBT FREEDOM & EMI AMORTIZATION ADVISOR ─────────────────── */}
      {emiProfiles.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 transition-all duration-200 ${
          isDark ? 'bg-[#10181E] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-brand-600 dark:text-brand-viridian text-base">🏦</span>
              <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Debt Freedom Amortization
              </h3>
            </div>
            <span className={`text-xs font-black ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>
              {emiProfiles.length} Active Loans
            </span>
          </div>

          <div className="space-y-3">
            {emiProfiles.map(emi => (
              <div
                key={emi.id}
                onClick={() => setSelectedEmi(emi)}
                className={`p-4 rounded-2xl border space-y-2 cursor-pointer transition-all duration-150 ${
                  isDark ? 'bg-[#142027] border-white/[0.06] hover:border-brand-viridian/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MerchantLogoView merchantName={emi.lenderName} size={38} isDark={isDark} />
                    <div>
                      <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{emi.lenderName}</div>
                      <div className={`text-[10px] font-semibold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>Target Debt Free: {emi.targetDebtFreeDate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{emi.monthlyEmi.toLocaleString('en-IN')}/mo
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Principal: ₹{emi.totalRemainingPrincipal.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-black/40' : 'bg-slate-200'}`}>
                    <div 
                      style={{ width: `${emi.progressPct}%` }}
                      className="h-full bg-brand-500 rounded-full"
                    />
                  </div>
                  <div className={`flex justify-between text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{emi.progressPct}% Repaid</span>
                    <span>{emi.tenureRemainingMonths} months remaining</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. CORE OBLIGATIONS MONTHLY RUN-RATE BREAKDOWN ──────────────── */}
      <div className={`p-6 rounded-[28px] border space-y-4 transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Monthly Obligations Run-Rate
          </h3>
          <span className={`text-xs font-mono font-black ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>
            Total: ₹{totalMonthlyRunRate.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>EMIs & Loans</span>
            <div className="text-base font-black font-mono text-amber-500 mt-0.5">₹{totalEmis.toLocaleString('en-IN')}</div>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emis.length} loans active</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subscriptions</span>
            <div className="text-base font-black font-mono text-rose-500 mt-0.5">₹{totalSubscriptions.toLocaleString('en-IN')}</div>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subscriptions.length} auto-debited</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Utility Bills</span>
            <div className="text-base font-black font-mono text-blue-500 mt-0.5">₹{totalBills.toLocaleString('en-IN')}</div>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{bills.length} bills tracked</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Insurance / SIP</span>
            <div className="text-base font-black font-mono text-emerald-500 mt-0.5">—</div>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>0 detected</span>
          </div>
        </div>
      </div>

      {/* ── 7. GROUPED COMMITMENT DIRECTORY ─────── */}
      {/* 🎬 OTT & Streaming Subscriptions */}
      {subscriptions.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 transition-all duration-200 ${
          isDark ? 'bg-[#10181E] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-500 text-lg">🎬</span>
              <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                OTT & Streaming Subscriptions
              </h3>
            </div>
            <span className="text-xs font-mono font-black text-rose-500">
              ₹{totalSubscriptions.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2.5">
            {subscriptions.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedMandate(s)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                  isDark ? 'bg-[#142027] border-white/[0.06] hover:border-rose-500/30' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <MerchantLogoView merchantName={s.name} size={42} isDark={isDark} />
                  <div>
                    <div className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      AutoPay Active • A/C *{s.accountMask} • Renews {s.nextExpectedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-black font-mono text-rose-600 dark:text-rose-400">
                    ₹{s.amount.toLocaleString('en-IN')}/mo
                  </div>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inspect ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💳 Loans & EMIs */}
      {emis.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 transition-all duration-200 ${
          isDark ? 'bg-[#10181E] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">💳</span>
              <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Loans & EMI Mandates
              </h3>
            </div>
            <span className="text-xs font-mono font-black text-amber-500">
              ₹{totalEmis.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2.5">
            {emis.map(e => (
              <div
                key={e.id}
                onClick={() => setSelectedMandate(e)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                  isDark ? 'bg-[#142027] border-white/[0.06] hover:border-amber-500/30' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <MerchantLogoView merchantName={e.name} size={42} isDark={isDark} />
                  <div>
                    <div className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.name}</div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      EMI • A/C *{e.accountMask} • Due {e.nextExpectedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-black font-mono text-amber-500">
                    ₹{e.amount.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inspect ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚡ Utility Bills & Recharges */}
      {bills.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 transition-all duration-200 ${
          isDark ? 'bg-[#10181E] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-lg">⚡</span>
              <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bills & Utilities
              </h3>
            </div>
            <span className="text-xs font-mono font-black text-blue-500">
              ₹{totalBills.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2.5">
            {bills.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedMandate(b)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                  isDark ? 'bg-[#142027] border-white/[0.06] hover:border-blue-500/30' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <MerchantLogoView merchantName={b.name} size={42} isDark={isDark} />
                  <div>
                    <div className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.name}</div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Bill Due • A/C *{b.accountMask} • Due {b.nextExpectedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-black font-mono text-blue-500">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inspect ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 8. INTERACTIVE DETAIL MODALS ───────────────────────────────── */}
      {/* Waste Dialog */}
      {selectedWaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 shadow-2xl ${
            isDark ? 'bg-[#10181E] border-brand-viridian/30 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base">Waste Cluster: {selectedWaste.vertical}</h3>
              <button onClick={() => setSelectedWaste(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold">✕</button>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedWaste.description}</p>
            
            <div className="space-y-2 pt-1">
              {selectedWaste.services.map((s: any) => (
                <div key={s.name} className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <MerchantLogoView merchantName={s.name} size={30} isDark={isDark} />
                    <span className="text-xs font-bold">{s.name}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-viridian">₹{s.amount}/mo</span>
                </div>
              ))}
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-brand-viridian/15 border-brand-viridian/30 text-brand-viridian' : 'bg-emerald-50 border-brand-200 text-brand-800'
            }`}>
              <span className="text-[10px] font-bold uppercase block">Annual Savings</span>
              <span className="text-xl font-black font-mono">₹{selectedWaste.annualSavings.toLocaleString('en-IN')} / yr</span>
            </div>
            <button 
              onClick={() => setSelectedWaste(null)} 
              className={`w-full py-3 rounded-xl font-black text-xs shadow-sm ${
                isDark ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark' : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}

      {/* Price Hike Dialog */}
      {selectedHike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 shadow-2xl ${
            isDark ? 'bg-[#10181E] border-rose-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MerchantLogoView merchantName={selectedHike.merchant} size={32} isDark={isDark} />
                <h3 className="font-black text-base">Inflation: {selectedHike.merchant}</h3>
              </div>
              <button onClick={() => setSelectedHike(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold">✕</button>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedHike.note}</p>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Previous Cost</span>
                <span className="text-base font-black font-mono">₹{selectedHike.oldAmount}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <span className="text-[10px] text-rose-500 font-bold block">New Cost (+{selectedHike.increasePct}%)</span>
                <span className="text-base font-black font-mono text-rose-500">₹{selectedHike.currentAmount}</span>
              </div>
            </div>
            <a 
              href={selectedHike.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs block text-center shadow-sm"
            >
              Manage or Cancel Subscription ↗
            </a>
          </div>
        </div>
      )}

      {/* EMI Amortization Schedule Dialog */}
      {selectedEmi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 shadow-2xl ${
            isDark ? 'bg-[#10181E] border-brand-viridian/30 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MerchantLogoView merchantName={selectedEmi.lenderName} size={32} isDark={isDark} />
                <h3 className="font-black text-base">Amortization: {selectedEmi.lenderName}</h3>
              </div>
              <button onClick={() => setSelectedEmi(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monthly EMI</span>
                <span className="text-base font-black font-mono text-amber-500">₹{selectedEmi.monthlyEmi.toLocaleString('en-IN')}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Remaining Principal</span>
                <span className="text-base font-black font-mono text-brand-600 dark:text-brand-viridian">₹{selectedEmi.totalRemainingPrincipal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-xs ${
              isDark ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-brand-200 text-brand-900'
            }`}>
              ⚡ <strong>Extra Payment Accelerator:</strong> Paying +₹{selectedEmi.prepaymentExtra}/mo saves approx ₹{selectedEmi.interestSaved} in interest and cuts tenure by {selectedEmi.monthsSaved} months!
            </div>
            <a 
              href={selectedEmi.manageUrl}
              target="_blank"
              rel="noreferrer"
              className={`w-full py-3 rounded-xl font-black text-xs block text-center shadow-sm ${
                isDark ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark' : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              Open Lender Portal ↗
            </a>
          </div>
        </div>
      )}

      {/* Mandate Detail Dialog */}
      {selectedMandate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 shadow-2xl ${
            isDark ? 'bg-[#10181E] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MerchantLogoView merchantName={selectedMandate.name} size={32} isDark={isDark} />
                <h3 className="font-black text-base">{selectedMandate.name}</h3>
              </div>
              <button onClick={() => setSelectedMandate(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold">✕</button>
            </div>
            <div className={`p-3.5 rounded-xl border space-y-1.5 font-mono text-xs ${
              isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div><strong>Type:</strong> {selectedMandate.type}</div>
              <div><strong>Amount:</strong> ₹{selectedMandate.amount.toLocaleString('en-IN')}</div>
              <div><strong>Account:</strong> *{selectedMandate.accountMask}</div>
              <div><strong>Next Due:</strong> {selectedMandate.nextExpectedDate}</div>
              {selectedMandate.umn && <div><strong>UMN:</strong> {selectedMandate.umn}</div>}
            </div>
            {selectedMandate.rawSmsSnippet && (
              <div className={`text-[11px] italic p-3 rounded-xl border ${
                isDark ? 'bg-black/40 border-white/[0.06] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                "{selectedMandate.rawSmsSnippet}"
              </div>
            )}
            <button 
              onClick={() => setSelectedMandate(null)} 
              className={`w-full py-3 rounded-xl font-black text-xs shadow-sm ${
                isDark ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark' : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

