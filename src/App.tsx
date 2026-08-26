import React, { useState, useEffect } from 'react';
import { parseSmsXml } from './engine/xmlParser';
import { generateWeeklyDebrief } from './engine/accounting';
import { SAMPLE_SMS_XML } from './engine/sampleData';
import { FinancialEvent, SpendSnapshot, SpendTab, FilterState, CategoryBreakdownItem, DetectedAccount, ActiveModule } from './types';

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
import { BankStatementModule } from './components/BankStatementModule';

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
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('bytfloww_theme');
    return savedTheme !== 'light';
  });
  const [activeModule, setActiveModule] = useState<ActiveModule>('SMS_INTELLIGENCE');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; phone: string } | null>(() => {
    const saved = localStorage.getItem('bytfloww_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      name: 'Deepankar Gautam',
      email: 'deepankar.gautam@bytlend.local',
      phone: '+91 84008 69600',
    };
  });

  const [activeTab, setActiveTab] = useState<SpendTab>('OVERVIEW');
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [snapshot, setSnapshot] = useState<SpendSnapshot | null>(null);
  const [rawCount, setRawCount] = useState(0);
  const [currentXml, setCurrentXml] = useState<string | null>(null);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>('2026-08');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-load the real SMS dataset on initial launch
  useEffect(() => {
    if (!currentXml && SAMPLE_SMS_XML) {
      try {
        setCurrentXml(SAMPLE_SMS_XML);
        const result = parseSmsXml(SAMPLE_SMS_XML, selectedPeriodKey);
        setEvents(result.events);
        setSnapshot(result.snapshot);
        setRawCount(result.rawCount);
      } catch (err) {
        console.error('Failed to auto-load sample SMS dataset:', err);
      }
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('bytfloww_theme', next ? 'dark' : 'light');
      return next;
    });
  };


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

  const handleLoginSuccess = (
    user: { name: string; email: string; phone: string },
    preferredModule?: ActiveModule
  ) => {
    setCurrentUser(user);
    if (preferredModule) {
      setActiveModule(preferredModule);
    }
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
    if (!events.length) return [];
    return events;
  }, [events]);

  return (
    <AppShell
      rawCount={rawCount}
      onOpenUpload={() => setShowXmlUpload(true)}
      onOpenDiagnostics={() => setShowDiagnostics(true)}
      activeModule={activeModule}
      onSwitchModule={setActiveModule}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {/* ── 1. IF NOT LOGGED IN: SHOW LOGIN SCREEN ──────────────────────── */}
      {!currentUser ? (
        <LoginScreen
          isDark={true}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : activeModule === 'BANK_STATEMENTS' ? (
        /* ── 2. SEPARATE MODULE: BANK STATEMENT FORENSICS HUB ──────────── */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-semibold text-white/60">
              Session: <strong className="text-white">{currentUser.name}</strong> ({currentUser.phone})
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModule('SMS_INTELLIGENCE')}
                className="text-xs font-semibold text-[#0A84FF] hover:underline"
              >
                📱 Open SMS Simulator
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-[#FF453A] hover:underline"
              >
                Sign Out 🚪
              </button>
            </div>
          </div>

          <BankStatementModule
            isDark={true}
            onMergeTransactions={(newTxs) => {
              setEvents((prev) => [...newTxs, ...prev]);
            }}
            onSwitchToSmsModule={() => setActiveModule('SMS_INTELLIGENCE')}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
          />
        </div>
      ) : !snapshot || events.length === 0 ? (
        /* ── 3. IF SMS MODULE & NO XML: SHOW CLEAN UPLOAD SCREEN ─────── */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-semibold text-white/60">
              Logged in as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.phone})
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModule('BANK_STATEMENTS')}
                className="text-xs font-semibold text-[#0A84FF] hover:underline"
              >
                🏛️ Open Statement Hub
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-[#FF453A] hover:underline"
              >
                Sign Out 🚪
              </button>
            </div>
          </div>
          <EmptyUploadState
            isDark={true}
            onXmlLoaded={handleXmlParsed}
            isProcessing={isProcessing}
          />
        </div>
      ) : (
        /* ── 4. IF SMS XML LOADED: SHOW SPEND INTELLIGENCE DASHBOARD ─── */
        <>
          <div className="flex items-center justify-between mb-3 px-1 text-xs">
            <span className="font-semibold text-white/60">
              Session: <strong className="text-white">{currentUser.name}</strong> ({currentUser.phone})
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModule('BANK_STATEMENTS')}
                className="text-xs font-semibold text-[#0A84FF] hover:underline"
              >
                🏛️ Statement Hub
              </button>
              <button
                onClick={handleResetDataset}
                className="text-xs font-semibold text-white/60 hover:text-white hover:underline"
              >
                🔄 Reset XML
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-[#FF453A] hover:underline"
              >
                Sign Out 🚪
              </button>
            </div>
          </div>

          <SpendHeader
            snapshot={snapshot}
            activeTab={activeTab}
            activeModule={activeModule}
            onSelectTab={setActiveTab}
            onSelectModule={setActiveModule}
            onSelectPeriod={handleSelectPeriod}
            onOpenFilter={() => setShowFilterModal(true)}
            onOpenCopilot={() => setActiveTab('ASSISTANT')}
            onOpenUpload={() => setShowXmlUpload(true)}
            onOpenDiagnostics={() => setShowDiagnostics(true)}
            totalParsedCount={rawCount}
          />



          <div className="pb-28">
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

            {activeTab === 'STATEMENTS' && (
              <BankStatementModule
                isDark={isDark}
                onMergeTransactions={(newEvents) => {
                  setEvents(prev => [...newEvents, ...prev]);
                  if (currentXml) {
                    handleXmlParsed(currentXml, selectedPeriodKey);
                  }
                }}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
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

          {/* ── 4. BOTTOM ANDROID NAVIGATION BAR ────────── */}
          <div className={`fixed bottom-0 left-0 right-0 z-40 border-t py-2 px-4 transition-all duration-200 ${
            isDark 
              ? 'bg-[#10181E]/95 backdrop-blur-xl border-white/[0.08] shadow-2xl shadow-black/90' 
              : 'bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-lg'
          }`}>
            <div className="max-w-md mx-auto flex items-center justify-around relative">
              <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black transition-all duration-150 active:scale-95 ${
                  activeTab === 'OVERVIEW'
                    ? (isDark ? 'text-brand-viridian' : 'text-brand-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span className="text-xl">🏠</span>
                <span>Home</span>
                {activeTab === 'OVERVIEW' && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isDark ? 'bg-brand-viridian' : 'bg-brand-600'}`} />
                )}
              </button>

              <button 
                onClick={() => setActiveTab('TRANSACTIONS')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black transition-all duration-150 active:scale-95 ${
                  activeTab === 'TRANSACTIONS'
                    ? (isDark ? 'text-brand-viridian' : 'text-brand-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span className="text-xl">📊</span>
                <span>Spend</span>
                {activeTab === 'TRANSACTIONS' && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isDark ? 'bg-brand-viridian' : 'bg-brand-600'}`} />
                )}
              </button>

              {/* Central Floating AI Button */}
              <div className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => setActiveTab('ASSISTANT')}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-black transition-all duration-150 hover:scale-105 active:scale-95 shadow-xl ${
                    isDark 
                      ? 'bg-brand-viridian text-slate-950 ring-4 ring-[#080D11] shadow-brand-viridian/30' 
                      : 'bg-brand-600 text-white ring-4 ring-white shadow-brand-600/30'
                  }`}
                  title="Open AI Spend Copilot"
                >
                  <span className="text-2xl">✨</span>
                </button>
                <span className={`block text-center text-[9px] font-black mt-1 tracking-wider uppercase ${
                  isDark ? 'text-brand-viridian' : 'text-brand-700'
                }`}>
                  AI Copilot
                </span>
              </div>

              <button 
                onClick={() => setActiveTab('COMMITMENTS')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black transition-all duration-150 active:scale-95 ${
                  activeTab === 'COMMITMENTS'
                    ? (isDark ? 'text-brand-viridian' : 'text-brand-700')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span className="text-xl">💡</span>
                <span>Lenders</span>
                {activeTab === 'COMMITMENTS' && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isDark ? 'bg-brand-viridian' : 'bg-brand-600'}`} />
                )}
              </button>

              <button 
                onClick={() => setShowDiagnostics(true)}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black transition-all duration-150 active:scale-95 ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-xl">👤</span>
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
