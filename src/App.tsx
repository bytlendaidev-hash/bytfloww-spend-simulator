import React, { useState } from 'react';
import { parseSmsXml } from './engine/xmlParser';
import { generateWeeklyDebrief } from './engine/accounting';
import { FinancialEvent, SpendSnapshot, SpendTab, FilterState, CategoryBreakdownItem, DetectedAccount } from './types';

// Components
import { AppShell } from './components/AppShell';
import { SpendHeader } from './components/SpendHeader';
import { SpendOverviewTab } from './components/SpendOverviewTab';
import { SpendTransactionsTab } from './components/SpendTransactionsTab';
import { SpendCategoriesTab } from './components/SpendCategoriesTab';
import { SpendMerchantsTab } from './components/SpendMerchantsTab';
import { SpendCommitmentsTab } from './components/SpendCommitmentsTab';
import { SpendTrendsTab } from './components/SpendTrendsTab';
import { BudgetManagerScreen } from './components/BudgetManagerScreen';
import { SubscriptionManagerScreen } from './components/SubscriptionManagerScreen';
import { AccountManagementScreen } from './components/AccountManagementScreen';
import { AssistantScreen } from './components/AssistantScreen';
import { EmptyUploadState } from './components/EmptyUploadState';
import { LoginScreen } from './components/LoginScreen';

// Modals & Overlays
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { WeeklyDebriefModal } from './components/WeeklyDebriefModal';
import { XmlUploadModal } from './components/XmlUploadModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { SpendMonthSelector } from './components/SpendMonthSelector';
import { MerchantSpendDnaModal } from './components/MerchantSpendDnaModal';
import { BillSplitModal } from './components/BillSplitModal';
import { SpendFilterModal } from './components/SpendFilterModal';
import { CategoryDrilldownModal } from './components/CategoryDrilldownModal';
import { AccountDrilldownModal } from './components/AccountDrilldownModal';
import { CreditCardDrilldownModal } from './components/CreditCardDrilldownModal';

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; phone: string } | null>(() => {
    const saved = localStorage.getItem('bytfloww_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<SpendTab>('OVERVIEW');
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [snapshot, setSnapshot] = useState<SpendSnapshot | null>(null);
  const [rawCount, setRawCount] = useState(0);
  const [currentXml, setCurrentXml] = useState<string | null>(null);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>('2026-08');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: null,
    selectedAccount: null,
    directionFilter: 'ALL',
    minAmount: null,
    maxAmount: null,
    paymentMode: null,
    highValueOnly: false,
  });

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<FinancialEvent | null>(null);
  const [splitEvent, setSplitEvent] = useState<FinancialEvent | null>(null);
  const [selectedMerchantName, setSelectedMerchantName] = useState<string | null>(null);
  const [selectedDrilldownCategory, setSelectedDrilldownCategory] = useState<CategoryBreakdownItem | null>(null);
  const [selectedDrilldownAccount, setSelectedDrilldownAccount] = useState<DetectedAccount | null>(null);
  const [selectedCreditCard, setSelectedCreditCard] = useState<DetectedAccount | null>(null);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showXmlUpload, setShowXmlUpload] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleLoginSuccess = (user: { name: string; email: string; phone: string }) => {
    setCurrentUser(user);
    localStorage.setItem('bytfloww_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bytfloww_user');
    setEvents([]);
    setSnapshot(null);
    setCurrentXml(null);
  };

  const handleXmlParsed = (xml: string, periodKey: string = selectedPeriodKey) => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        setCurrentXml(xml);
        const result = parseSmsXml(xml, periodKey);
        setEvents(result.events);
        setSnapshot(result.snapshot);
        setRawCount(result.rawCount);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const handleSelectPeriod = (periodKey: string) => {
    setSelectedPeriodKey(periodKey);
    if (currentXml) {
      handleXmlParsed(currentXml, periodKey);
    }
  };

  const handleResetDataset = () => {
    setEvents([]);
    setSnapshot(null);
    setCurrentXml(null);
    setRawCount(0);
  };

  const selectedMerchantData = snapshot?.topMerchants.find(m => m.name.toLowerCase() === selectedMerchantName?.toLowerCase());

  const periodEvents = React.useMemo(() => {
    if (!selectedPeriodKey || selectedPeriodKey === 'ALL') return events;
    return events.filter(e => {
      const d = new Date(e.timestamp);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return k === selectedPeriodKey;
    });
  }, [events, selectedPeriodKey]);

  return (
    <AppShell
      isDark={isDark}
      onToggleTheme={() => setIsDark(!isDark)}
      rawCount={rawCount}
      onOpenUpload={() => setShowXmlUpload(true)}
      onOpenDiagnostics={() => setShowDiagnostics(true)}
    >
      {/* ── 1. IF NOT LOGGED IN: SHOW LOGIN SCREEN ───────────────────── */}
      {!currentUser ? (
        <LoginScreen
          isDark={isDark}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : !snapshot || events.length === 0 ? (
        /* ── 2. IF LOGGED IN BUT NO XML: SHOW CLEAN UPLOAD SCREEN ────── */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-bold text-slate-500">
              Logged in as: <strong className="text-slate-800 dark:text-white">{currentUser.name}</strong> ({currentUser.phone})
            </span>
            <button
              onClick={handleLogout}
              className="text-rose-500 font-bold hover:underline"
            >
              Sign Out 🚪
            </button>
          </div>
          <EmptyUploadState
            isDark={isDark}
            onXmlLoaded={handleXmlParsed}
            isProcessing={isProcessing}
          />
        </div>
      ) : (
        /* ── 3. IF XML LOADED: SHOW SPEND INTELLIGENCE DASHBOARD ──────── */
        <>
          <div className="flex items-center justify-between mb-2 px-2 text-xs">
            <span className="font-semibold text-slate-500">
              User: <strong className="text-slate-800 dark:text-white">{currentUser.name}</strong> ({currentUser.phone})
            </span>
            <button
              onClick={handleLogout}
              className="text-rose-500 font-semibold hover:underline"
            >
              Sign Out 🚪
            </button>
          </div>

          <SpendHeader
            snapshot={snapshot}
            isDark={isDark}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onSelectPeriod={handleSelectPeriod}
            onOpenFilter={() => setShowFilterModal(true)}
            onOpenCopilot={() => setActiveTab('ASSISTANT')}
            onOpenUpload={() => setShowXmlUpload(true)}
            onOpenDiagnostics={() => setShowDiagnostics(true)}
            onToggleTheme={() => setIsDark(!isDark)}
            totalParsedCount={rawCount}
          />

          <div className="flex justify-end mb-3">
            <button
              onClick={handleResetDataset}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition ${
                isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
              }`}
            >
              🔄 Clear & Upload Another XML
            </button>
          </div>

          <div className="pb-24">
            {activeTab === 'OVERVIEW' && (
              <SpendOverviewTab
                snapshot={snapshot}
                isDark={isDark}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenDebrief={() => setShowDebrief(true)}
                onSelectMerchant={(mName) => setSelectedMerchantName(mName)}
                onSelectAccount={(acc) => setSelectedDrilldownAccount(acc)}
                onSelectCreditCard={(card) => setSelectedCreditCard(card)}
                onSelectCategory={(cat) => setSelectedDrilldownCategory(cat)}
              />
            )}

            {activeTab === 'TRANSACTIONS' && (
              <SpendTransactionsTab
                events={events}
                isDark={isDark}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onSplitBill={(ev) => setSplitEvent(ev)}
              />
            )}

            {activeTab === 'CATEGORIES' && (
              <SpendCategoriesTab
                categories={snapshot.categoryDistribution}
                events={events}
                isDark={isDark}
                totalSpend={snapshot.totalSpend}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
              />
            )}

            {activeTab === 'MERCHANTS' && (
              <SpendMerchantsTab
                merchants={snapshot.topMerchants}
                isDark={isDark}
                onSelectMerchant={(mName) => setSelectedMerchantName(mName)}
              />
            )}

            {activeTab === 'COMMITMENTS' && (
              <SpendCommitmentsTab
                commitments={snapshot.commitments}
                isDark={isDark}
                totalEmis={snapshot.totalEmis}
                totalSubscriptions={snapshot.totalSubscriptions}
                totalBills={snapshot.totalBills}
              />
            )}

            {activeTab === 'TRENDS' && (
              <SpendTrendsTab
                snapshot={snapshot}
                isDark={isDark}
                onSelectPeriod={handleSelectPeriod}
              />
            )}

            {activeTab === 'BUDGETS' && (
              <BudgetManagerScreen
                categories={snapshot.categoryDistribution}
                totalSpend={snapshot.totalSpend}
                isDark={isDark}
              />
            )}

            {activeTab === 'SUBSCRIPTIONS' && (
              <SubscriptionManagerScreen
                commitments={snapshot.commitments}
                totalSubscriptions={snapshot.totalSubscriptions}
                isDark={isDark}
              />
            )}

            {activeTab === 'ACCOUNTS' && (
              <AccountManagementScreen
                accounts={snapshot.accounts}
                creditCards={snapshot.creditCards}
                events={events}
                isDark={isDark}
                onSelectAccount={(acc) => setSelectedDrilldownAccount(acc)}
              />
            )}

            {activeTab === 'ASSISTANT' && (
              <AssistantScreen
                snapshot={snapshot}
                events={events}
                isDark={isDark}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
              />
            )}
          </div>

          {/* ── 4. BOTTOM ANDROID NAVIGATION BAR (CLEAN SOLID COLORS) ────────── */}
          <div className={`fixed bottom-0 left-0 right-0 z-40 border-t py-2 px-4 transition ${
            isDark 
              ? 'bg-[#10181E] border-[#22323D] shadow-2xl shadow-black/80' 
              : 'bg-white border-slate-200 shadow-lg'
          }`}>
            <div className="max-w-md mx-auto flex items-center justify-around relative">
              <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className={`flex flex-col items-center gap-1 text-[10px] font-black transition ${
                  activeTab === 'OVERVIEW'
                    ? (isDark ? 'text-[#00F2FE]' : 'text-teal-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span className="text-lg">🏠</span>
                <span>Home</span>
                {activeTab === 'OVERVIEW' && (
                  <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#00F2FE]' : 'bg-teal-700'}`} />
                )}
              </button>

              <button 
                onClick={() => setActiveTab('TRANSACTIONS')}
                className={`flex flex-col items-center gap-1 text-[10px] font-black transition ${
                  activeTab === 'TRANSACTIONS'
                    ? (isDark ? 'text-[#00F2FE]' : 'text-teal-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span className="text-lg">📊</span>
                <span>Spend</span>
                {activeTab === 'TRANSACTIONS' && (
                  <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#00F2FE]' : 'bg-teal-700'}`} />
                )}
              </button>

              {/* Central Floating AI Button (Solid Color, No Gradients) */}
              <div className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => setActiveTab('ASSISTANT')}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-black transition-all duration-150 hover:scale-105 active:scale-95 shadow-lg ${
                    isDark 
                      ? 'bg-[#00BFA5] text-slate-950 ring-4 ring-[#0A1014]' 
                      : 'bg-[#0D9488] text-white ring-4 ring-white shadow-teal-900/20'
                  }`}
                  title="Open AI Spend Copilot"
                >
                  <span className="text-2xl">✨</span>
                </button>
                <span className={`block text-center text-[9px] font-black mt-1 tracking-wider uppercase ${
                  isDark ? 'text-[#00F2FE]' : 'text-teal-800'
                }`}>
                  AI Copilot
                </span>
              </div>

              <button 
                onClick={() => setActiveTab('COMMITMENTS')}
                className={`flex flex-col items-center gap-1 text-[10px] font-black transition ${
                  activeTab === 'COMMITMENTS'
                    ? (isDark ? 'text-[#00F2FE]' : 'text-teal-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span className="text-lg">💡</span>
                <span>Lenders</span>
                {activeTab === 'COMMITMENTS' && (
                  <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#00F2FE]' : 'bg-teal-700'}`} />
                )}
              </button>

              <button 
                onClick={() => setShowDiagnostics(true)}
                className={`flex flex-col items-center gap-1 text-[10px] font-black transition ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-lg">👤</span>
                <span>Profile</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── MODALS & FORENSICS OVERLAYS ───────────────────────────────── */}
      <TransactionDetailModal
        event={selectedEvent}
        isDark={isDark}
        onClose={() => setSelectedEvent(null)}
      />

      <BillSplitModal
        event={splitEvent}
        isDark={isDark}
        onClose={() => setSplitEvent(null)}
      />

      <MerchantSpendDnaModal
        merchantName={selectedMerchantName}
        merchantData={selectedMerchantData}
        events={events}
        isDark={isDark}
        onClose={() => setSelectedMerchantName(null)}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
      />

      {showDebrief && snapshot && (
        <WeeklyDebriefModal
          summary={generateWeeklyDebrief(snapshot)}
          isDark={isDark}
          onClose={() => setShowDebrief(false)}
        />
      )}

      {snapshot && (
        <SpendFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filterState={filterState}
          onUpdateFilter={(upd) => setFilterState(prev => ({ ...prev, ...upd }))}
          categories={snapshot.categoryDistribution}
          accounts={snapshot.accounts}
          isDark={isDark}
        />
      )}

      {snapshot && (
        <SpendMonthSelector
          isOpen={showMonthSelector}
          onClose={() => setShowMonthSelector(false)}
          selectedPeriodKey={snapshot.periodKey}
          onSelectPeriod={handleSelectPeriod}
          availableMonths={snapshot.monthlyTrends}
          isDark={isDark}
        />
      )}

      {showXmlUpload && (
        <XmlUploadModal
          isDark={isDark}
          onClose={() => setShowXmlUpload(false)}
          onXmlParsed={(xml: string) => {
            setShowXmlUpload(false);
            handleXmlParsed(xml, selectedPeriodKey);
          }}
        />
      )}

      {showDiagnostics && snapshot && (
        <DiagnosticsModal
          snapshot={snapshot}
          isDark={isDark}
          onClose={() => setShowDiagnostics(false)}
        />
      )}

      <CategoryDrilldownModal
        category={selectedDrilldownCategory}
        events={events}
        isDark={isDark}
        onClose={() => setSelectedDrilldownCategory(null)}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
      />

      <AccountDrilldownModal
        account={selectedDrilldownAccount}
        periodEvents={periodEvents}
        allEvents={events}
        isDark={isDark}
        onClose={() => setSelectedDrilldownAccount(null)}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
      />

      <CreditCardDrilldownModal
        card={selectedCreditCard}
        periodEvents={periodEvents}
        allEvents={events}
        isDark={isDark}
        onClose={() => setSelectedCreditCard(null)}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
      />
    </AppShell>
  );
};
