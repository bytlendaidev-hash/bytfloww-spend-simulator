import React, { useState, useEffect } from 'react';
import { parseSmsXml } from './engine/xmlParser';
import { generateWeeklyDebrief } from './engine/accounting';
import { FinancialEvent, SpendSnapshot, SpendTab, FilterState, CategoryBreakdownItem, DetectedAccount, ActiveModule, StatementSection } from './types';
import { applyThemeVariables } from './theme/themes';

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
    const savedTheme = localStorage.getItem('bytfloww_theme_mode') || localStorage.getItem('bytfloww_theme');
    return savedTheme !== 'light';
  });
  const [activeModule, setActiveModule] = useState<ActiveModule>('BANK_STATEMENTS');
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
      name: 'Authorized User',
      email: 'user@bytlend.local',
      phone: '+91 ••••• •••••',
    };
  });

  const [activeTab, setActiveTab] = useState<SpendTab>('OVERVIEW');
  const [activeStatementSection, setActiveStatementSection] = useState<StatementSection>('OVERVIEW');
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

  // Sync isDark with document.documentElement & body classes and storage
  useEffect(() => {
    const mode = isDark ? 'dark' : 'light';
    localStorage.setItem('bytfloww_theme_mode', mode);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    applyThemeVariables(isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Period filtered events
  const periodEvents = snapshot ? snapshot.filteredEvents : events;

  const selectedMerchantData = selectedMerchantName && snapshot
    ? snapshot.topMerchants.find((m) => m.name.toLowerCase() === selectedMerchantName.toLowerCase()) || undefined
    : undefined;

  return (
    <AppShell
      rawCount={rawCount}
      onOpenUpload={() => setShowXmlUpload(true)}
      onOpenDiagnostics={() => setShowDiagnostics(true)}
      activeModule={activeModule}
      onSwitchModule={(mod) => setActiveModule(mod)}
      currentUser={currentUser}
      onLogout={handleLogout}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      activeTab={activeModule === 'BANK_STATEMENTS' ? activeStatementSection : activeTab}
      onSelectTab={(tab) => {
        if (activeModule === 'BANK_STATEMENTS') {
          setActiveStatementSection(tab);
        } else {
          setActiveTab(tab);
        }
      }}
      counts={{
        transactions: periodEvents.length,
        categories: snapshot?.categoryDistribution?.length || 0,
        merchants: snapshot?.topMerchants?.length || 0,
        commitments: snapshot?.commitments?.length || 0,
      }}
    >
      {/* ── 1. AUTH SCREEN (IF NOT LOGGED IN) ─────────────────────────── */}
      {!currentUser ? (
        <LoginScreen
          isDark={isDark}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : activeModule === 'BANK_STATEMENTS' ? (
        /* ── 2. BANK STATEMENT FORENSICS HUB ───────────────────────────── */
        <div className="space-y-4">
          <BankStatementModule
            isDark={isDark}
            activeSection={activeStatementSection}
            onSelectSection={setActiveStatementSection}
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
            <span className="font-semibold text-abyss-textMuted">
              Logged in as: <strong className="text-abyss-textPrimary">{currentUser.name}</strong> ({currentUser.phone})
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModule('BANK_STATEMENTS')}
                className="text-xs font-semibold text-telemetry-500 hover:underline"
              >
                🏛️ Open Statement Hub
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-pulse-500 hover:underline"
              >
                Sign Out 🚪
              </button>
            </div>
          </div>
          <EmptyUploadState
            isDark={isDark}
            onXmlLoaded={handleXmlParsed}
            isProcessing={isProcessing}
          />
        </div>
      ) : (
        /* ── 4. IF SMS XML LOADED: SHOW SPEND INTELLIGENCE DASHBOARD ─── */
        <>
          <div className="hidden sm:flex items-center justify-between mb-3 px-1 text-xs">
            <span className="font-semibold text-abyss-textMuted">
              Session: <strong className="text-abyss-textPrimary">{currentUser.name}</strong> ({currentUser.phone})
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModule('BANK_STATEMENTS')}
                className="text-xs font-semibold text-telemetry-500 hover:underline"
              >
                🏛️ Statement Hub
              </button>
              <button
                onClick={handleResetDataset}
                className="text-xs font-semibold text-abyss-textMuted hover:text-abyss-textPrimary hover:underline"
              >
                🔄 Reset XML
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-pulse-500 hover:underline"
              >
                Sign Out 🚪
              </button>
            </div>
          </div>

          <SpendHeader
            snapshot={snapshot}
            activeTab={activeTab}
            activeModule={activeModule}
            isDark={isDark}
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
                onSelectCategory={(cat) => setSelectedDrilldownCategory(cat)}
                onSelectAccount={(acc) => setSelectedDrilldownAccount(acc)}
                onSelectCreditCard={(card) => setSelectedCreditCard(card)}
              />
            )}

            {activeTab === 'TRANSACTIONS' && (
              <SpendTransactionsTab
                events={periodEvents}
                snapshot={snapshot}
                isDark={isDark}
                filterState={filterState}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onSplitBill={(ev) => setSplitEvent(ev)}
              />
            )}

            {activeTab === 'CATEGORIES' && (
              <SpendCategoriesTab
                snapshot={snapshot}
                isDark={isDark}
                onSelectCategory={(cat) => setSelectedDrilldownCategory(cat)}
              />
            )}

            {activeTab === 'MERCHANTS' && (
              <SpendMerchantsTab
                snapshot={snapshot}
                isDark={isDark}
                onSelectMerchant={(mName) => setSelectedMerchantName(mName)}
              />
            )}

            {activeTab === 'COMMITMENTS' && (
              <SpendCommitmentsTab
                snapshot={snapshot}
                isDark={isDark}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
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
                snapshot={snapshot}
                isDark={isDark}
                onBack={() => setActiveTab('OVERVIEW')}
              />
            )}

            {activeTab === 'SUBSCRIPTIONS' && (
              <SubscriptionManagerScreen
                snapshot={snapshot}
                isDark={isDark}
                onBack={() => setActiveTab('OVERVIEW')}
              />
            )}

            {activeTab === 'ACCOUNTS' && (
              <AccountManagementScreen
                snapshot={snapshot}
                isDark={isDark}
                onBack={() => setActiveTab('OVERVIEW')}
              />
            )}

            {activeTab === 'ASSISTANT' && (
              <AssistantScreen
                snapshot={snapshot}
                events={periodEvents}
                isDark={isDark}
              />
            )}
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

      <XmlUploadModal
        isDark={isDark}
        onClose={() => setShowXmlUpload(false)}
        onXmlParsed={handleXmlParsed}
      />

      {showDiagnostics && snapshot && (
        <DiagnosticsModal
          snapshot={snapshot}
          isDark={isDark}
          onClose={() => setShowDiagnostics(false)}
        />
      )}

      {showMonthSelector && snapshot && (
        <SpendMonthSelector
          isOpen={showMonthSelector}
          onClose={() => setShowMonthSelector(false)}
          selectedPeriodKey={selectedPeriodKey}
          onSelectPeriod={handleSelectPeriod}
          availableMonths={snapshot.monthlyTrends}
          isDark={isDark}
        />
      )}

      {showFilterModal && snapshot && (
        <SpendFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filterState={filterState}
          onUpdateFilter={(update) => setFilterState((prev) => ({ ...prev, ...update }))}
          categories={snapshot.categoryDistribution}
          accounts={snapshot.accounts}
          isDark={isDark}
        />
      )}

      {selectedDrilldownCategory && (
        <CategoryDrilldownModal
          category={selectedDrilldownCategory}
          events={periodEvents}
          isDark={isDark}
          onClose={() => setSelectedDrilldownCategory(null)}
          onSelectEvent={(ev) => setSelectedEvent(ev)}
        />
      )}

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
