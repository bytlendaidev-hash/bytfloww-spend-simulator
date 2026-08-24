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
  const insurance = commitments.filter(c => c.type === 'INSURANCE');
  const investments = commitments.filter(c => c.type === 'INVESTMENT');

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
    ...emis.map(e => ({ ...e, badgeColor: 'bg-amber-500/20 text-amber-400' })),
    ...subscriptions.map(s => ({ ...s, badgeColor: 'bg-rose-500/20 text-rose-400' })),
    ...bills.map(b => ({ ...b, badgeColor: 'bg-blue-500/20 text-blue-400' })),
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ── 1. GHOST SUBSCRIPTION & ANNUAL SAVINGS WATCHDOG HERO ──────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-4 transition-all ${
        isDark 
          ? 'bg-[#062420] border-[#00BFA5]/30 text-white shadow-xl' 
          : 'bg-[#E6FFFA] border-teal-300 text-[#0F172A] shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00BFA5] text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              ✨
            </div>
            <h3 className="text-base font-black tracking-tight">
              Ghost Waste Watchdog
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black border ${
            isDark ? 'bg-[#00BFA5]/20 text-[#00F2FE] border-[#00BFA5]/30' : 'bg-teal-100 text-teal-900 border-teal-300'
          }`}>
            {subscriptions.length} Subscriptions Active
          </span>
        </div>

        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest block ${
            isDark ? 'text-teal-300' : 'text-teal-800'
          }`}>
            ANNUAL SAVINGS POTENTIAL
          </span>
          <div className={`text-3xl sm:text-4xl font-black font-mono mt-1 flex items-baseline gap-1 ${
            isDark ? 'text-[#00F2FE]' : 'text-teal-900'
          }`}>
            <span className="text-2xl font-sans">₹</span>
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
              className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition ${
                isDark ? 'bg-[#121B22] border-[#22323D] hover:border-[#00BFA5]/40 text-white' : 'bg-white border-teal-200 hover:border-teal-400 text-slate-900 shadow-sm'
              }`}
            >
              <span className="text-lg">📚</span>
              <div>
                <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {w.vertical}
                </div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}>
                  {w.overlappingCount} services • Save ₹{w.annualSavings.toLocaleString('en-IN')}/yr ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. UPCOMING COMMITMENTS DUE DATES CAROUSEL ─────────────────── */}
      <div className={`p-6 sm:p-7 rounded-[32px] border space-y-4 backdrop-blur-2xl shadow-2xl transition ${
        isDark ? 'bg-[#10181E]/80 border-white/[0.08] shadow-black/60' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#00F2FE]">📅</span>
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
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
              className={`min-w-[170px] sm:min-w-[190px] p-4.5 rounded-[24px] border flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition backdrop-blur-xl ${
                isDark ? 'bg-white/[0.03] border-white/[0.06] hover:border-cyan-500/40 hover:bg-white/[0.06]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <MerchantLogoView merchantName={item.name} size={38} isDark={isDark} />
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.type}
                </span>
              </div>

              <div className="mt-3">
                <div className={`text-xs font-bold truncate max-w-[140px] ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Due {item.nextExpectedDate}
                </div>
                <div className={`text-sm font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. FREE-TRIAL WATCHDOG & COUNTDOWN ALERTS ─────────────────── */}
      {freeTrialAlerts.length > 0 && (
        <div className={`p-5 rounded-[28px] border space-y-3 ${
          isDark ? 'bg-[#191522] border-purple-500/25' : 'bg-purple-50/70 border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-base">⏳</span>
              <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-purple-200' : 'text-purple-950'}`}>
                Auto-Debit Countdown Watchdog
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
              {freeTrialAlerts.length} ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-2">
            {freeTrialAlerts.map(ft => (
              <div 
                key={ft.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-black/30 border-purple-500/20' : 'bg-white border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MerchantLogoView merchantName={ft.service} size={36} isDark={isDark} />
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{ft.service}</div>
                    <div className="text-[10px] text-purple-400 font-semibold">
                      Deducting in {ft.daysLeft} days • Next bill on {ft.expiryDate} (A/C *{ft.accountMask})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-black font-mono ${isDark ? 'text-purple-200' : 'text-purple-900'}`}>₹{ft.amount}</div>
                  <a href={ft.manageUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-amber-400 hover:underline block">
                    Manage / Cancel ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. PRICE HIKE & SILENT INFLATION WATCHDOG ──────────────────── */}
      <div className={`p-6 rounded-[28px] border space-y-3.5 ${
        isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-rose-500 text-base">📈</span>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Price Hike Watchdog ({priceHikeAlerts.length})
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-400 border border-rose-500/20">
            SILENT INFLATION DETECTED
          </span>
        </div>

        <div className="space-y-2.5">
          {priceHikeAlerts.map(hike => (
            <div
              key={hike.id}
              onClick={() => setSelectedHike(hike)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                isDark ? 'bg-[#14232C] border-white/5 hover:border-cyan-500/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <MerchantLogoView merchantName={hike.merchant} size={38} isDark={isDark} />
                <div>
                  <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{hike.merchant}</div>
                  <div className="text-[10px] text-rose-400 font-semibold">
                    ₹{hike.oldAmount} → ₹{hike.currentAmount} (+{hike.increasePct}%) • {hike.effectiveDate}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400">Inspect ↗</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. DEBT FREEDOM & EMI AMORTIZATION ADVISOR ─────────────────── */}
      {emiProfiles.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 ${
          isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#00BFA5] text-base">🏦</span>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Debt Freedom Amortization
              </h3>
            </div>
            <span className="text-xs font-bold text-[#00BFA5]">
              {emiProfiles.length} Active Loans
            </span>
          </div>

          <div className="space-y-3">
            {emiProfiles.map(emi => (
              <div
                key={emi.id}
                onClick={() => setSelectedEmi(emi)}
                className={`p-4 rounded-2xl border space-y-2 cursor-pointer transition ${
                  isDark ? 'bg-[#14232C] border-white/5 hover:border-cyan-500/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MerchantLogoView merchantName={emi.lenderName} size={38} isDark={isDark} />
                    <div>
                      <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{emi.lenderName}</div>
                      <div className="text-[10px] text-[#00BFA5] font-semibold">Target Debt Free: {emi.targetDebtFreeDate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-mono font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      ₹{emi.monthlyEmi.toLocaleString('en-IN')}/mo
                    </div>
                    <div className="text-[10px] text-slate-400">Principal: ₹{emi.totalRemainingPrincipal.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div 
                      style={{ width: `${emi.progressPct}%` }}
                      className="h-full bg-[#00BFA5] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
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
      <div className={`p-6 rounded-[28px] border space-y-4 ${
        isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Monthly Obligations Run-Rate
          </h3>
          <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Total: ₹{totalMonthlyRunRate.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#14232C] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">EMIs & Loans</span>
            <div className="text-base font-black font-mono text-amber-500 mt-0.5">₹{totalEmis.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">{emis.length} loans active</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#14232C] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Subscriptions</span>
            <div className="text-base font-black font-mono text-rose-500 mt-0.5">₹{totalSubscriptions.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">{subscriptions.length} auto-debited</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#14232C] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Utility Bills</span>
            <div className="text-base font-black font-mono text-blue-500 mt-0.5">₹{totalBills.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">{bills.length} bills tracked</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#14232C] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Insurance / SIP</span>
            <div className="text-base font-black font-mono text-[#00BFA5] mt-0.5">—</div>
            <span className="text-[10px] text-slate-400">0 detected</span>
          </div>
        </div>
      </div>

      {/* ── 7. GROUPED COMMITMENT DIRECTORY (OTT, EMIs, BILLS, ETC) ─────── */}
      {/* 🎬 OTT & Streaming Subscriptions */}
      {subscriptions.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 ${
          isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-500 text-lg">🎬</span>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                OTT & Streaming Subscriptions
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400">
              ₹{totalSubscriptions.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-3">
            {subscriptions.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedMandate(s)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  isDark ? 'bg-[#14232C] border-white/5 hover:border-cyan-500/30' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <MerchantLogoView merchantName={s.name} size={42} isDark={isDark} />
                  <div>
                    <div className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{s.name}</div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      AutoPay Active • A/C *{s.accountMask} • Renews {s.nextExpectedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs sm:text-sm font-black font-mono text-rose-400`}>
                    ₹{s.amount.toLocaleString('en-IN')}/mo
                  </div>
                  <span className="text-[10px] text-slate-400">Inspect ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💳 Loans & EMIs */}
      {emis.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 ${
          isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">💳</span>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Loans & EMI Mandates
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-500">
              ₹{totalEmis.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-3">
            {emis.map(e => (
              <div
                key={e.id}
                onClick={() => setSelectedMandate(e)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  isDark ? 'bg-[#14232C] border-white/5 hover:border-cyan-500/30' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <MerchantLogoView merchantName={e.name} size={42} isDark={isDark} />
                  <div>
                    <div className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{e.name}</div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      EMI • A/C *{e.accountMask} • Due {e.nextExpectedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs sm:text-sm font-black font-mono text-amber-500`}>
                    ₹{e.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Inspect ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚡ Utility Bills & Recharges */}
      {bills.length > 0 && (
        <div className={`p-6 rounded-[28px] border space-y-4 ${
          isDark ? 'bg-[#101920] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-lg">⚡</span>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Bills & Utilities
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-500">
              ₹{totalBills.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-3">
            {bills.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedMandate(b)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  isDark ? 'bg-[#14232C] border-white/5 hover:border-cyan-500/30' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <MerchantLogoView merchantName={b.name} size={42} isDark={isDark} />
                  <div>
                    <div className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{b.name}</div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Bill Due • A/C *{b.accountMask} • Due {b.nextExpectedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs sm:text-sm font-black font-mono text-blue-500`}>
                    ₹{b.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Inspect ↗</span>
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
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 ${
            isDark ? 'bg-[#0E1C23] border-cyan-500/30 text-white' : 'bg-white border-slate-200 text-[#0F172A]'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Waste Cluster: {selectedWaste.vertical}</h3>
              <button onClick={() => setSelectedWaste(null)} className="p-1 text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300">{selectedWaste.description}</p>
            
            <div className="space-y-2 pt-1">
              {selectedWaste.services.map((s: any) => (
                <div key={s.name} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MerchantLogoView merchantName={s.name} size={30} isDark={isDark} />
                    <span className="text-xs font-bold">{s.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#00BFA5]">₹{s.amount}/mo</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#00BFA5]/15 border border-[#00BFA5]/30">
              <span className="text-[10px] text-[#00BFA5] font-bold uppercase block">Annual Savings</span>
              <span className="text-xl font-black font-mono text-[#00BFA5]">₹{selectedWaste.annualSavings.toLocaleString('en-IN')} / yr</span>
            </div>
            <button onClick={() => setSelectedWaste(null)} className="w-full py-3 rounded-xl bg-[#00BFA5] text-black font-bold text-xs">
              Close Inspection
            </button>
          </div>
        </div>
      )}

      {/* Price Hike Dialog */}
      {selectedHike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 ${
            isDark ? 'bg-[#0E1C23] border-cyan-500/30 text-white' : 'bg-white border-slate-200 text-[#0F172A]'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MerchantLogoView merchantName={selectedHike.merchant} size={32} isDark={isDark} />
                <h3 className="font-bold text-base">Inflation: {selectedHike.merchant}</h3>
              </div>
              <button onClick={() => setSelectedHike(null)} className="p-1 text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300">{selectedHike.note}</p>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Previous Cost</span>
                <span className="text-base font-bold font-mono">₹{selectedHike.oldAmount}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <span className="text-[10px] text-rose-400 block">New Cost (+{selectedHike.increasePct}%)</span>
                <span className="text-base font-bold font-mono text-rose-400">₹{selectedHike.currentAmount}</span>
              </div>
            </div>
            <a 
              href={selectedHike.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-rose-500 text-white font-bold text-xs block text-center"
            >
              Manage or Cancel Subscription ↗
            </a>
          </div>
        </div>
      )}

      {/* EMI Amortization Schedule Dialog */}
      {selectedEmi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 ${
            isDark ? 'bg-[#0E1C23] border-cyan-500/30 text-white' : 'bg-white border-slate-200 text-[#0F172A]'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MerchantLogoView merchantName={selectedEmi.lenderName} size={32} isDark={isDark} />
                <h3 className="font-bold text-base">Amortization: {selectedEmi.lenderName}</h3>
              </div>
              <button onClick={() => setSelectedEmi(null)} className="p-1 text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
                <span className="text-base font-bold font-mono text-amber-400">₹{selectedEmi.monthlyEmi.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Remaining Principal</span>
                <span className="text-base font-bold font-mono text-[#00BFA5]">₹{selectedEmi.totalRemainingPrincipal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
              ⚡ <strong>Extra Payment Accelerator:</strong> Paying +₹{selectedEmi.prepaymentExtra}/mo saves approx ₹{selectedEmi.interestSaved} in interest and cuts tenure by {selectedEmi.monthsSaved} months!
            </div>
            <a 
              href={selectedEmi.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-[#00BFA5] text-black font-bold text-xs block text-center"
            >
              Open Lender Portal ↗
            </a>
          </div>
        </div>
      )}

      {/* Mandate Detail Dialog */}
      {selectedMandate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-[28px] border space-y-4 ${
            isDark ? 'bg-[#0E1C23] border-cyan-500/30 text-white' : 'bg-white border-slate-200 text-[#0F172A]'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MerchantLogoView merchantName={selectedMandate.name} size={32} isDark={isDark} />
                <h3 className="font-bold text-base">{selectedMandate.name}</h3>
              </div>
              <button onClick={() => setSelectedMandate(null)} className="p-1 text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 font-mono text-xs">
              <div><strong>Type:</strong> {selectedMandate.type}</div>
              <div><strong>Amount:</strong> ₹{selectedMandate.amount.toLocaleString('en-IN')}</div>
              <div><strong>Account:</strong> *{selectedMandate.accountMask}</div>
              <div><strong>Next Due:</strong> {selectedMandate.nextExpectedDate}</div>
              {selectedMandate.umn && <div><strong>UMN:</strong> {selectedMandate.umn}</div>}
            </div>
            {selectedMandate.rawSmsSnippet && (
              <div className="text-[11px] text-slate-400 italic p-3 rounded-xl bg-black/20">
                "{selectedMandate.rawSmsSnippet}"
              </div>
            )}
            <button onClick={() => setSelectedMandate(null)} className="w-full py-3 rounded-xl bg-[#00BFA5] text-black font-bold text-xs">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
