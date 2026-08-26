import React, { useState } from 'react';
import { CommitmentItem, SpendSnapshot } from '../types';
import { MerchantLogoView } from './MerchantLogoView';

interface SpendCommitmentsTabProps {
  commitments: CommitmentItem[];
  isDark?: boolean;
  totalEmis: number;
  totalSubscriptions: number;
  totalBills: number;
  snapshot?: SpendSnapshot;
}

export const SpendCommitmentsTab: React.FC<SpendCommitmentsTabProps> = ({
  commitments,
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
    ...emis.map(e => ({ ...e, badgeColor: 'bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30' })),
    ...subscriptions.map(s => ({ ...s, badgeColor: 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30' })),
    ...bills.map(b => ({ ...b, badgeColor: 'bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30' })),
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-emergence">
      {/* ── 1. GHOST SUBSCRIPTION & ANNUAL SAVINGS HERO CARD ─────────────── */}
      <div className="spatial-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-base bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30">
              ✨
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Ghost Waste Watchdog
            </h3>
          </div>
          <span className="spatial-btn px-3.5 py-1 text-xs text-white">
            {subscriptions.length} Subscriptions Active
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold block">
            ANNUAL SAVINGS POTENTIAL
          </span>
          <div className="text-3xl sm:text-5xl font-bold font-mono mt-1 flex items-baseline gap-1 text-white">
            <span className="text-2xl font-sans font-normal text-white/50">₹</span>
            {((totalSubscriptions || 199) * 12).toLocaleString('en-IN')} <span className="text-sm font-sans font-medium text-white/50">/ yr</span>
          </div>
          <p className="text-xs mt-1 text-white/70 font-medium">
            Detected {wasteClusters.length} recurring category clusters with automated mandates.
          </p>
        </div>

        {/* Waste Cluster Chips */}
        <div className="flex flex-wrap gap-3 pt-2">
          {wasteClusters.map(w => (
            <div
              key={w.id}
              onClick={() => setSelectedWaste(w)}
              className="p-4 rounded-[14px] bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/25 flex items-center gap-3.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-white"
            >
              <span className="text-xl">📚</span>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {w.vertical}
                </div>
                <div className="text-[11px] font-semibold text-[#30D158]">
                  {w.overlappingCount} services • Save ₹{w.annualSavings.toLocaleString('en-IN')}/yr ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. UPCOMING COMMITMENTS DUE DATES CAROUSEL ─────────────────── */}
      <div className="spatial-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#0A84FF]">📅</span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Upcoming Due Dates
            </h3>
          </div>
          <span className="text-xs text-white/50 font-medium">
            {upcomingDueItems.length} Scheduled
          </span>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {upcomingDueItems.map((item, idx) => (
            <div
              key={`${item.id}_${idx}`}
              onClick={() => setSelectedMandate(item)}
              className="min-w-[180px] sm:min-w-[200px] p-5 rounded-[16px] bg-white/5 border border-white/10 hover:bg-white/15 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <MerchantLogoView merchantName={item.name} size={38} />
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.type}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-sm font-bold text-white truncate max-w-[150px]">
                  {item.name}
                </div>
                <div className="text-xs text-white/50 font-medium mt-0.5">
                  Due {item.nextExpectedDate}
                </div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  ₹{item.amount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. FREE-TRIAL WATCHDOG & COUNTDOWN ALERTS ─────────────────── */}
      {freeTrialAlerts.length > 0 && (
        <div className="spatial-card p-6 space-y-4 border-l-4 border-l-[#AF52DE]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <h4 className="text-sm font-bold text-white">
                Auto-Debit Countdown Watchdog
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#AF52DE]/20 text-[#AF52DE] border border-[#AF52DE]/30">
              {freeTrialAlerts.length} ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-2.5">
            {freeTrialAlerts.map(ft => (
              <div 
                key={ft.id}
                className="p-4 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <MerchantLogoView merchantName={ft.service} size={36} />
                  <div>
                    <div className="text-sm font-bold text-white">{ft.service}</div>
                    <div className="text-xs text-white/60 font-medium">
                      Deducting in {ft.daysLeft} days • Next bill on {ft.expiryDate} (A/C *{ft.accountMask})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-white">₹{ft.amount}</div>
                  <a href={ft.manageUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#FF9F0A] hover:underline block mt-0.5">
                    Manage / Cancel ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. PRICE HIKE & SILENT INFLATION WATCHDOG ──────────────────── */}
      <div className="spatial-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#FF453A]">📈</span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Price Hike Watchdog ({priceHikeAlerts.length})
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30">
            SILENT INFLATION DETECTED
          </span>
        </div>

        <div className="space-y-2.5">
          {priceHikeAlerts.map(hike => (
            <div
              key={hike.id}
              onClick={() => setSelectedHike(hike)}
              className="p-4 rounded-[14px] bg-white/5 border border-white/10 hover:bg-white/15 flex items-center justify-between cursor-pointer transition-all duration-300"
            >
              <div className="flex items-center gap-3.5">
                <MerchantLogoView merchantName={hike.merchant} size={38} />
                <div>
                  <div className="text-sm font-bold text-white">{hike.merchant}</div>
                  <div className="text-xs text-[#FF453A] font-semibold">
                    ₹{hike.oldAmount} → ₹{hike.currentAmount} (+{hike.increasePct}%) • {hike.effectiveDate}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-white/50">Inspect ↗</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. DEBT FREEDOM & EMI AMORTIZATION ADVISOR ─────────────────── */}
      {emiProfiles.length > 0 && (
        <div className="spatial-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base text-[#30D158]">🏦</span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Debt Freedom Amortization
              </h3>
            </div>
            <span className="text-xs font-bold text-[#30D158]">
              {emiProfiles.length} Active Loans
            </span>
          </div>

          <div className="space-y-3">
            {emiProfiles.map(emi => (
              <div
                key={emi.id}
                onClick={() => setSelectedEmi(emi)}
                className="p-4 sm:p-5 rounded-[16px] bg-white/5 border border-white/10 hover:bg-white/15 space-y-3 cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MerchantLogoView merchantName={emi.lenderName} size={38} />
                    <div>
                      <div className="text-sm font-bold text-white">{emi.lenderName}</div>
                      <div className="text-xs font-medium text-[#30D158]">Target Debt Free: {emi.targetDebtFreeDate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-mono font-bold text-white">
                      ₹{emi.monthlyEmi.toLocaleString('en-IN')}/mo
                    </div>
                    <div className="text-xs text-white/50 font-mono">Principal: ₹{emi.totalRemainingPrincipal.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                    <div 
                      style={{ width: `${emi.progressPct}%` }}
                      className="h-full bg-gradient-to-r from-[#0A84FF] to-[#30D158] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-white/50">
                    <span>{emi.progressPct}% Repaid</span>
                    <span>{emi.tenureRemainingMonths} months remaining</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. CORE OBLIGATIONS RUN-RATE BREAKDOWN ───────────────────────── */}
      <div className="spatial-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
            Monthly Obligations Run-Rate
          </h3>
          <span className="text-sm font-mono font-bold text-white">
            Total: ₹{totalMonthlyRunRate.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
            <span className="text-xs uppercase font-semibold text-white/50">EMIs & Loans</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">₹{totalEmis.toLocaleString('en-IN')}</div>
            <span className="text-xs text-white/50 mt-0.5 block">{emis.length} loans active</span>
          </div>

          <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
            <span className="text-xs uppercase font-semibold text-white/50">Subscriptions</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">₹{totalSubscriptions.toLocaleString('en-IN')}</div>
            <span className="text-xs text-white/50 mt-0.5 block">{subscriptions.length} auto-debited</span>
          </div>

          <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
            <span className="text-xs uppercase font-semibold text-white/50">Utility Bills</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">₹{totalBills.toLocaleString('en-IN')}</div>
            <span className="text-xs text-white/50 mt-0.5 block">{bills.length} bills tracked</span>
          </div>

          <div className="p-4 rounded-[14px] bg-white/5 border border-white/10">
            <span className="text-xs uppercase font-semibold text-white/50">Insurance / SIP</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white/40 mt-1">—</div>
            <span className="text-xs text-white/40 mt-0.5 block">0 detected</span>
          </div>
        </div>
      </div>

      {/* ── 7. DETAIL MODALS (VISIONOS SPATIAL GLASS) ────────────────────── */}
      {/* Waste Dialog */}
      {selectedWaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[20px] p-4 animate-emergence">
          <div className="spatial-modal w-full max-w-md p-6 sm:p-7 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">Waste Cluster: {selectedWaste.vertical}</h3>
              <button onClick={() => setSelectedWaste(null)} className="p-1 text-white/50 hover:text-white font-bold">✕</button>
            </div>
            <p className="text-xs text-white/70">{selectedWaste.description}</p>
            
            <div className="space-y-2 pt-1">
              {selectedWaste.services.map((s: any) => (
                <div key={s.name} className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MerchantLogoView merchantName={s.name} size={30} />
                    <span className="text-xs font-semibold text-white">{s.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#30D158]">₹{s.amount}/mo</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-[14px] bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158]">
              <span className="text-[10px] font-bold uppercase block">Annual Savings</span>
              <span className="text-xl font-bold font-mono">₹{selectedWaste.annualSavings.toLocaleString('en-IN')} / yr</span>
            </div>
            <button 
              onClick={() => setSelectedWaste(null)} 
              className="spatial-btn w-full py-3 text-xs font-bold text-white"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}

      {/* Price Hike Dialog */}
      {selectedHike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[20px] p-4 animate-emergence">
          <div className="spatial-modal w-full max-w-md p-6 sm:p-7 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MerchantLogoView merchantName={selectedHike.merchant} size={32} />
                <h3 className="font-bold text-base text-white">Inflation: {selectedHike.merchant}</h3>
              </div>
              <button onClick={() => setSelectedHike(null)} className="p-1 text-white/50 hover:text-white font-bold">✕</button>
            </div>
            <p className="text-xs text-white/70">{selectedHike.note}</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10">
                <span className="text-xs text-white/50 block">Previous Cost</span>
                <span className="text-base font-bold font-mono text-white">₹{selectedHike.oldAmount}</span>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#FF453A]/15 border border-[#FF453A]/30">
                <span className="text-xs text-[#FF453A] font-bold block">New Cost (+{selectedHike.increasePct}%)</span>
                <span className="text-base font-bold font-mono text-[#FF453A]">₹{selectedHike.currentAmount}</span>
              </div>
            </div>
            <a 
              href={selectedHike.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="spatial-btn w-full py-3 text-xs font-bold text-white block text-center"
            >
              Manage or Cancel Subscription ↗
            </a>
          </div>
        </div>
      )}

      {/* EMI Schedule Dialog */}
      {selectedEmi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[20px] p-4 animate-emergence">
          <div className="spatial-modal w-full max-w-md p-6 sm:p-7 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MerchantLogoView merchantName={selectedEmi.lenderName} size={32} />
                <h3 className="font-bold text-base text-white">Amortization: {selectedEmi.lenderName}</h3>
              </div>
              <button onClick={() => setSelectedEmi(null)} className="p-1 text-white/50 hover:text-white font-bold">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10">
                <span className="text-xs text-white/50 block">Monthly EMI</span>
                <span className="text-base font-bold font-mono text-white">₹{selectedEmi.monthlyEmi.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10">
                <span className="text-xs text-white/50 block">Remaining Principal</span>
                <span className="text-base font-bold font-mono text-[#30D158]">₹{selectedEmi.totalRemainingPrincipal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="p-4 rounded-[14px] bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158] text-xs">
              ⚡ <strong>Extra Payment Accelerator:</strong> Paying +₹{selectedEmi.prepaymentExtra}/mo saves approx ₹{selectedEmi.interestSaved} in interest and cuts tenure by {selectedEmi.monthsSaved} months!
            </div>
            <a 
              href={selectedEmi.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="spatial-btn w-full py-3 text-xs font-bold text-white block text-center"
            >
              Open Lender Portal ↗
            </a>
          </div>
        </div>
      )}

      {/* Mandate Detail Dialog */}
      {selectedMandate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[20px] p-4 animate-emergence">
          <div className="spatial-modal w-full max-w-md p-6 sm:p-7 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MerchantLogoView merchantName={selectedMandate.name} size={32} />
                <h3 className="font-bold text-base text-white">{selectedMandate.name}</h3>
              </div>
              <button onClick={() => setSelectedMandate(null)} className="p-1 text-white/50 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 rounded-[12px] bg-white/5 border border-white/10 space-y-2 font-mono text-xs text-white/80">
              <div><strong>Type:</strong> {selectedMandate.type}</div>
              <div><strong>Amount:</strong> ₹{selectedMandate.amount.toLocaleString('en-IN')}</div>
              <div><strong>Account:</strong> *{selectedMandate.accountMask}</div>
              <div><strong>Next Due:</strong> {selectedMandate.nextExpectedDate}</div>
              {selectedMandate.umn && <div><strong>UMN:</strong> {selectedMandate.umn}</div>}
            </div>
            {selectedMandate.rawSmsSnippet && (
              <div className="text-xs italic p-3 rounded-[12px] bg-black/40 border border-white/10 text-white/60">
                "{selectedMandate.rawSmsSnippet}"
              </div>
            )}
            <button 
              onClick={() => setSelectedMandate(null)} 
              className="spatial-btn w-full py-3 text-xs font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
