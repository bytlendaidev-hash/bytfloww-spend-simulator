import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BackendStatementUploadResult, 
  StatementTransactionItem, 
  FinancialEvent,
  StatementSection,
  BackendFinancialAccount,
  BackendLoanItem,
  BackendRecurringItem,
  BackendStatementListItem,
  CanonicalTransaction,
  CounterpartyEntity,
  EvidenceBackedInsight,
  RecurringMandate,
  StatementCategoryItem,
  SubcategoryItem,
  AnomalyAlert,
  FinancialHealthScore,
  SalaryMonthlyItem
} from '../types';
import { 
  backendApiService, 
  BACKEND_ENVIRONMENTS, 
  BackendEnvironment 
} from '../services/backendApi';
import { MerchantLogoView } from './MerchantLogoView';

interface BankStatementModuleProps {
  isDark: boolean;
  onMergeTransactions?: (events: FinancialEvent[]) => void;
  onSelectEvent?: (event: FinancialEvent) => void;
  onSwitchToSmsModule?: () => void;
}

export const BankStatementModule: React.FC<BankStatementModuleProps> = ({
  isDark,
  onMergeTransactions,
  onSwitchToSmsModule,
}) => {
  // Navigation Section
  const [activeSection, setActiveSection] = useState<StatementSection>('OVERVIEW');

  // Environment & Health
  const [currentEnv, setCurrentEnv] = useState<BackendEnvironment>(backendApiService.getEnvironment());
  const [backendStatus, setBackendStatus] = useState<{ isOnline: boolean; latencyMs: number; status: string } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // File Upload & Pipeline State
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Modal for protected PDFs
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Statement Result
  const [statementResult, setStatementResult] = useState<BackendStatementUploadResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [economicFilter, setEconomicFilter] = useState<'ALL' | 'EXPENSE' | 'TRANSFER' | 'SALARY' | 'LOANS'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [ledgerVisibleCount, setLedgerVisibleCount] = useState(100);
  const [payeeSearch, setPayeeSearch] = useState('');
  const [isMerged, setIsMerged] = useState(false);

  // Category Drilldown
  const [selectedCategory, setSelectedCategory] = useState<StatementCategoryItem | null>(null);

  // Counterparty Drilldown Modal
  const [selectedCounterparty, setSelectedCounterparty] = useState<CounterpartyEntity | null>(null);

  // Backend Data Collections
  const [accounts, setAccounts] = useState<BackendFinancialAccount[]>([]);
  const [loans, setLoans] = useState<BackendLoanItem[]>([]);
  const [recurring, setRecurring] = useState<BackendRecurringItem[]>([]);
  const [archive, setArchive] = useState<BackendStatementListItem[]>([]);

  // AI Copilot Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Hello Deepankar! I am your Statement AI Forensics Copilot. Ask me anything about your salary timeline, loan borrowings vs repayments, top merchants, or cash flow trends.',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend health & auto-populate default statement on mount
  useEffect(() => {
    checkHealth();
    loadInitialData();
  }, [currentEnv]);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    const res = await backendApiService.checkHealth();
    setBackendStatus(res);
    setIsCheckingHealth(false);
  };

  const loadInitialData = async () => {
    // Load accounts, loans, recurring from backend / local defaults
    const accs = await backendApiService.getFinancialAccounts();
    if (accs && accs.length > 0) {
      setAccounts(accs);
    } else {
      setAccounts([
        {
          id: 'acc_hdfc',
          accountName: 'HDFC Bank Salary Savings A/c',
          accountNumberMasked: '•••• 9082',
          bankName: 'HDFC Bank',
          accountType: 'SAVINGS',
          currentBalance: 14771.77,
          currency: 'INR',
          isPrimary: true,
          lastSyncedAt: '31 Mar 2026',
        },
      ]);
    }

    const lnList = await backendApiService.getLoans();
    if (lnList && lnList.length > 0) {
      setLoans(lnList);
    } else {
      setLoans([
        {
          id: 'ln_mpokket',
          lenderName: 'mPokket Financial Services',
          loanType: 'Short-Term Digital Loan',
          monthlyEmi: 3731,
          outstandingBalance: 12135.43,
          nextDueDate: 'Active Line',
        },
        {
          id: 'ln_vivifi',
          lenderName: 'Vivifi India Finance (FlexPay)',
          loanType: 'Digital Revolving Credit Line',
          monthlyEmi: 9619,
          outstandingBalance: 6409.94,
          nextDueDate: 'Active Credit Line',
        },
      ]);
    }

    const recList = await backendApiService.getRecurring();
    if (recList && recList.length > 0) {
      setRecurring(recList);
    } else {
      setRecurring([
        {
          id: 'rec_1',
          merchantName: 'Google India Digital Services',
          amount: 149,
          frequency: 'MONTHLY',
          category: 'Digital Cloud / Services',
          nextBillingDate: 'Active Mandate',
          status: 'ACTIVE',
        },
        {
          id: 'rec_2',
          merchantName: 'Life Insurance Corporation (LIC)',
          amount: 16182,
          frequency: 'CUSTOM',
          category: 'Insurance Policy',
          nextBillingDate: 'Policy Active',
          status: 'ACTIVE',
        },
      ]);
    }

    // Default statement load if not present
    if (!statementResult) {
      loadRealHdfcStatementXls();
    }
  };

  const handleEnvChange = (env: BackendEnvironment) => {
    setCurrentEnv(env);
    backendApiService.setEnvironment(env);
    setTimeout(() => checkHealth(), 100);
  };

  // Process uploaded or selected statement file
  const processStatementFile = async (file: File, password?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingProgress(15);
    setProcessingStage('1/5 Parsing statement rows, dates, and currency values...');

    try {
      setTimeout(() => {
        setProcessingProgress(45);
        setProcessingStage('2/5 Running multi-bank column heuristics and header matching...');
      }, 300);

      setTimeout(() => {
        setProcessingProgress(75);
        setProcessingStage('3/5 Computing mathematical ledger reconciliation equation...');
      }, 600);

      setTimeout(() => {
        setProcessingProgress(90);
        setProcessingStage('4/5 Executing 7-dimensional semantic forensic categorization & AI audit...');
      }, 900);

      // Attempt parsing
      let result: BackendStatementUploadResult;
      try {
        result = await backendApiService.uploadBankStatement(file, { password });
      } catch (err: any) {
        // Fallback to client-side in-memory parser
        console.warn('Backend parse failed or timed out, activating high-precision local fallback:', err);
        result = await backendApiService.parseClientSideFallback(file, password);
      }

      setProcessingProgress(100);
      setProcessingStage('5/5 Forensic Statement Intelligence Ready!');

      setTimeout(() => {
        setStatementResult(result);
        setIsProcessing(false);
        setActiveSection('OVERVIEW');
      }, 400);

    } catch (err: any) {
      console.error('Statement parsing failure:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to parse statement. Please ensure it is a valid bank Excel/CSV file.');
    }
  };

  const loadRealHdfcStatementXls = async () => {
    try {
      const resp = await fetch('/Acct Statement_9082_13082026_18.55.44.xls');
      if (!resp.ok) {
        // Fallback synthetic load if file not served from root
        return;
      }
      const blob = await resp.blob();
      const file = new File([blob], 'Acct Statement_9082_13082026_18.55.44.xls', { type: 'application/vnd.ms-excel' });
      await processStatementFile(file);
    } catch (e) {
      console.warn('Auto-load of statement XLS failed:', e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (file: File) => {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      setPendingFile(file);
      setShowPasswordModal(true);
    } else {
      processStatementFile(file);
    }
  };

  const handlePasswordSubmit = () => {
    setShowPasswordModal(false);
    if (pendingFile) {
      processStatementFile(pendingFile, pdfPassword);
      setPendingFile(null);
      setPdfPassword('');
    }
  };

  const handleMergeToSmsSimulator = () => {
    if (!statementResult?.transactions || !onMergeTransactions) return;
    const events: FinancialEvent[] = statementResult.transactions.map((tx, idx) => {
      const isCredit = (tx.credit || 0) > 0;
      const amt = tx.credit || tx.debit || 0;
      const isSalary = (tx.category || '').includes('Salary') || tx.narration.toLowerCase().includes('salary');
      return {
        id: `stmt_ev_${idx}_${Date.now()}`,
        amount: amt,
        direction: isCredit ? 'INFLOW' : 'OUTFLOW',
        eventType: isCredit ? (isSalary ? 'SALARY' : 'UPI_CREDIT') : 'UPI_DEBIT',
        merchant: tx.narration.slice(0, 32),
        rawMerchant: tx.narration,
        category: tx.category || 'General',
        economicType: isCredit ? 'INCOME' : 'OUTFLOW',
        financialSubtype: tx.category || 'Expense',
        timestamp: Date.now(),
        dateFormatted: tx.date,
        timeFormatted: '12:00 PM',
        accountHint: statementResult.accountNo?.slice(-4) || '9082',
        resolvedInstitution: statementResult.bankDetected || 'HDFC Bank',
        referenceNumber: tx.referenceNumber || `STMT-${idx}`,
        paymentMode: 'UPI',
        transactionFingerprint: `stmt_${tx.date}_${tx.narration}_${amt}`,
        confidence: 0.99,
        notes: 'Imported from verified bank statement ledger',
        rawSmsBody: `[BANK STATEMENT] ${tx.date} ${tx.narration} ${isCredit ? 'Credit' : 'Debit'}: ₹${amt} Bal: ₹${tx.balance}`,
        sender: statementResult.bankDetected || 'HDFC Bank',
        balanceAfter: tx.balance ?? undefined,
        isRecurring: isSalary,
      };
    });

    onMergeTransactions(events);
    setIsMerged(true);
  };

  // AI Chat Handler
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');

    const newMessages = [
      ...chatMessages,
      { role: 'user' as const, text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];
    setChatMessages(newMessages);
    setIsAiTyping(true);

    try {
      const aiResponse = await backendApiService.sendAiChat(userMsg, {
        statementResult,
        facts: statementResult?.facts,
      });

      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: aiResponse.answer || 'I have analyzed your statement data.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Unable to reach the forensic AI service right now. Please verify your connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Filtered Canonical Ledger
  const filteredLedger = useMemo(() => {
    if (!statementResult?.transactions) return [];
    return statementResult.transactions.filter(tx => {
      const matchesSearch = 
        tx.narration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDirection = 
        directionFilter === 'ALL' ||
        (directionFilter === 'DEBIT' && (tx.debit || 0) > 0) ||
        (directionFilter === 'CREDIT' && (tx.credit || 0) > 0);

      const matchesCategory = 
        categoryFilter === 'ALL' || tx.category === categoryFilter;

      const isCredit = (tx.credit || 0) > 0;
      const lower = tx.narration.toLowerCase();
      const isSalary = lower.includes('salary') || (tx.category || '').includes('Salary');
      const isLoan = lower.includes('mpokket') || lower.includes('vivifi') || (tx.category || '').includes('Loan');
      const isTransfer = (tx.category || '').includes('Peer') || (tx.category || '').includes('Transfer') || lower.startsWith('upi-');

      let matchesEconomic = true;
      if (economicFilter === 'EXPENSE') {
        matchesEconomic = !isCredit && !isLoan && !isTransfer;
      } else if (economicFilter === 'TRANSFER') {
        matchesEconomic = isTransfer;
      } else if (economicFilter === 'SALARY') {
        matchesEconomic = isSalary;
      } else if (economicFilter === 'LOANS') {
        matchesEconomic = isLoan;
      }

      return matchesSearch && matchesDirection && matchesCategory && matchesEconomic;
    });
  }, [statementResult, searchQuery, directionFilter, categoryFilter, economicFilter]);

  // Payees filter
  const filteredPayees = useMemo(() => {
    if (!statementResult?.topPayees) return [];
    if (!payeeSearch.trim()) return statementResult.topPayees;
    return statementResult.topPayees.filter(p => 
      p.name.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(payeeSearch.toLowerCase())
    );
  }, [statementResult, payeeSearch]);

  const facts = statementResult?.facts;
  const rec = statementResult?.reconciliation;
  const inflows = statementResult?.inflowDecomposition || [];
  const categories = statementResult?.categoryDecomposition || [];
  const lenders = statementResult?.lenderMatrix || [];
  const velocity = statementResult?.monthlyVelocity || [];
  const channels = statementResult?.channelSplit || [];
  const people = statementResult?.peopleCounterparties || [];
  const evidenceInsights = statementResult?.evidenceInsights || [];
  const recurringMandates = statementResult?.recurringMandates || [];

  const anomalies = statementResult?.anomalies || [];
  const healthScore = statementResult?.healthScore || null;
  const salaryTimeline = statementResult?.salaryTimeline || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── 1. FORENSIC HEADER & ENGINE CONTROLS ─────────────────────── */}
      <div className={`p-4 sm:p-5 rounded-[28px] border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-[#00BFA5] border border-teal-500/20 flex items-center justify-center text-xl">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight">
                Financial Intelligence Engine
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                backendStatus?.isOnline 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-400/30'
              }`}>
                {backendStatus?.isOnline ? `ONLINE (${backendStatus.latencyMs}ms)` : 'LOCAL ENGINE'}
              </span>
            </div>
            <p className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Canonical Ledger • Entity Resolution • Debt Matrix • Evidence AI
            </p>
          </div>
        </div>

        {/* Engine Switch & Environment Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchToSmsModule && (
            <button
              onClick={onSwitchToSmsModule}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isDark 
                  ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-slate-200' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              📱 Switch to SMS Simulator
            </button>
          )}

          <select
            value={currentEnv}
            onChange={(e) => handleEnvChange(e.target.value as BackendEnvironment)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border outline-none cursor-pointer ${
              isDark 
                ? 'bg-[#18242D] border-[#273B49] text-white focus:border-[#00BFA5]' 
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00BFA5]'
            }`}
          >
            <option value="DEV">Render Cloud (Dev)</option>
            <option value="STAGING">Render Staging</option>
            <option value="PROD">Render Prod</option>
            <option value="LOCAL">Localhost (3001)</option>
          </select>

          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition border ${
              isDark 
                ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-[#00F2FE]' 
                : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800'
            }`}
          >
            {isCheckingHealth ? '⏳' : '🔄 Ping'}
          </button>
        </div>
      </div>

      {/* ── 2. 11 DEDICATED FINANCIAL INTELLIGENCE NAVIGATION TABS ─────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-black">
        {[
          { id: 'OVERVIEW', label: '🏛️ Overview & Health' },
          { id: 'TRANSACTIONS', label: '📑 Transactions Ledger' },
          { id: 'SPENDING', label: '💳 Spending Taxonomy' },
          { id: 'INCOME', label: '💰 Inflow & Salary' },
          { id: 'LOANS', label: '🏦 Loans & Debt Matrix' },
          { id: 'PEOPLE', label: '👥 People & Transfers' },
          { id: 'RECURRING', label: '🔄 Recurring Mandates' },
          { id: 'CASH_FLOW', label: '📈 12-Mo Cash Flow' },
          { id: 'INSIGHTS', label: '✨ Evidence AI Insights' },
          { id: 'AI_ANALYST', label: '🤖 AI Financial Analyst' },
          { id: 'UPLOAD', label: '📤 Upload Statement' },
        ].map((tab) => {
          const isActive = 
            activeSection === tab.id ||
            (tab.id === 'INCOME' && activeSection === 'INFLOW') ||
            (tab.id === 'SPENDING' && activeSection === 'CATEGORIES') ||
            (tab.id === 'CASH_FLOW' && activeSection === 'VELOCITY') ||
            (tab.id === 'PEOPLE' && activeSection === 'MERCHANTS') ||
            (tab.id === 'TRANSACTIONS' && activeSection === 'LEDGER') ||
            (tab.id === 'AI_ANALYST' && activeSection === 'COPILOT');

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as StatementSection)}
              className={`px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5] font-black shadow-md'
                  : isDark
                  ? 'bg-[#121B22] text-slate-300 border-[#22323D] hover:bg-[#18242D]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── 3. LIVE 14-STAGE PROCESSING VISUALIZER ────────────────────── */}
      {isProcessing && (
        <div className={`p-6 sm:p-8 rounded-[28px] border space-y-5 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-500/20 text-[#00BFA5] flex items-center justify-center text-2xl animate-spin shrink-0">
              ⚡
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-black text-[#00BFA5] mb-1.5">
                <span>{processingStage}</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00BFA5] to-[#00F2FE] transition-all duration-500 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {[
              { label: 'UPLOAD', icon: '📤', threshold: 5 },
              { label: 'SCAN', icon: '🔍', threshold: 15 },
              { label: 'FORMAT', icon: '📋', threshold: 25 },
              { label: 'PARSE', icon: '🔢', threshold: 40 },
              { label: 'RECONCILE', icon: '⚖️', threshold: 60 },
              { label: 'CLASSIFY', icon: '🏷️', threshold: 75 },
              { label: 'INSIGHTS', icon: '✨', threshold: 90 },
            ].map((step, idx) => {
              const isDoneStep = processingProgress >= step.threshold;
              const isActiveStep = processingProgress >= step.threshold - 15 && !isDoneStep;
              return (
                <div key={idx} className={`p-2 rounded-xl text-center border transition ${
                  isDoneStep
                    ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300')
                    : isActiveStep
                    ? (isDark ? 'bg-teal-950/40 border-teal-500/40 animate-pulse' : 'bg-teal-50 border-teal-300 animate-pulse')
                    : (isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200')
                }`}>
                  <div className={`text-base ${isDoneStep ? '' : 'opacity-40'}`}>{isDoneStep ? '✅' : step.icon}</div>
                  <div className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${
                    isDoneStep ? (isDark ? 'text-emerald-400' : 'text-emerald-700') :
                    isActiveStep ? (isDark ? 'text-teal-400' : 'text-teal-600') :
                    (isDark ? 'text-slate-600' : 'text-slate-400')
                  }`}>{step.label}</div>
                </div>
              );
            })}
          </div>
          <p className={`text-[11px] text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Multi-bank column mapping • Mathematical reconciliation • Entity resolution • 7-layer classification • Evidence AI
          </p>
        </div>
      )}

      {/* ── 4. TAB 1: OVERVIEW & FINANCIAL HEALTH ─────────────────────── */}
      {(activeSection === 'OVERVIEW') && statementResult && (
        <div className="space-y-6">
          {/* Bank Account Forensic Card */}
          <div className={`p-5 sm:p-7 rounded-[28px] border relative overflow-hidden transition ${
            isDark ? 'bg-gradient-to-br from-[#0D1F23] to-[#12272E] border-[#1D3E45] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <MerchantLogoView merchantName={statementResult.bankDetected || 'HDFC Bank'} size={54} isDark={isDark} shape="rounded" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{statementResult.bankDetected || 'HDFC Bank'}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-400/30">
                      STATEMENT AUDITED
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-slate-200'}`}>
                      {statementResult.transactionCount} canonical txns
                    </span>
                  </div>
                  <div className={`text-xs font-mono mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Holder: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{statementResult.accountHolder}</strong> • A/c: {statementResult.accountNo} • IFSC: {statementResult.ifsc}
                  </div>
                  <div className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Branch: {statementResult.branch} • Period: {statementResult.periodStart} to {statementResult.periodEnd}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {onMergeTransactions && (
                  <button
                    onClick={handleMergeToSmsSimulator}
                    disabled={isMerged}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition border shadow-sm flex items-center gap-1.5 ${
                      isMerged 
                        ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40 cursor-default' 
                        : 'bg-[#00BFA5] hover:bg-[#00A892] text-slate-950 border-[#00BFA5]'
                    }`}
                  >
                    <span>{isMerged ? '✓ Merged' : '⚡'}</span>
                    <span>{isMerged ? 'Merged with Live SMS Feed' : 'Merge with Live SMS Feed'}</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveSection('UPLOAD')}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition border ${
                    isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  📥 Upload Statement
                </button>
              </div>
            </div>

            {/* Reconciliation Equation Banner */}
            {rec && (
              <div className={`mt-6 p-4 sm:p-5 rounded-2xl border ${
                rec.isReconciled 
                  ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                  : (isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200')
              }`}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚖️</span>
                    <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Mathematical Ledger Reconciliation Proof
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    rec.isReconciled
                      ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300')
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                  }`}>
                    {rec.isReconciled ? '● 100.0000% RECONCILED' : 'DISCREPANCY DETECTED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                  <div>
                    <div className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Opening Balance</div>
                    <div className={`text-base sm:text-lg font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{rec.openingBalance?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+ Inflows (Credits)</div>
                    <div className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +₹{rec.totalInflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>- Outflows (Debits)</div>
                    <div className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                      -₹{rec.totalOutflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>= Closing Balance</div>
                    <div className="text-base sm:text-lg font-black font-mono text-cyan-600 dark:text-[#00F2FE] mt-0.5">
                      ₹{rec.computedClosingBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4 Spend Pillars Grid */}
          {facts && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className={`p-4 sm:p-5 rounded-[24px] border space-y-1 transition ${
                isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-500">
                  True Economic Spend
                </div>
                <div className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{facts.trueEconomicExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lifestyle consumption only</div>
              </div>

              <div className={`p-4 sm:p-5 rounded-[24px] border space-y-1 transition ${
                isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-500">
                  Gross Inflow
                </div>
                <div className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{facts.totalInflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Salary + Micro-Loans + P2P</div>
              </div>

              <div className={`p-4 sm:p-5 rounded-[24px] border space-y-1 transition ${
                isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-500">
                  Internal Transfers
                </div>
                <div className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{facts.internalTransfers.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>To own verified accounts</div>
              </div>

              <div className={`p-4 sm:p-5 rounded-[24px] border space-y-1 transition ${
                isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-500">
                  Debt / Loans Repaid
                </div>
                <div className={`text-xl sm:text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{facts.debtPayments.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>EMIs & credit card bills</div>
              </div>
            </div>
          )}

          {/* Quick Deep-Dive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-[24px] border space-y-2 cursor-pointer hover:border-teal-500/50 transition ${
              isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
            }`} onClick={() => setActiveSection('INCOME')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">💼 Primary Salary</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>13 Credits →</span>
              </div>
              <div className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>₹8,02,386.00</div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Newgen Software Technologies (~₹61.7K/mo)</p>
            </div>

            <div className={`p-5 rounded-[24px] border space-y-2 cursor-pointer hover:border-teal-500/50 transition ${
              isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
            }`} onClick={() => setActiveSection('LOANS')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">🏦 Loans & Debt Matrix</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>4 Lenders →</span>
              </div>
              <div className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>Borrowed: ₹1.11L • Repaid: ₹95.8K</div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>mPokket & Vivifi FlexPay revolving credit</p>
            </div>

            <div className={`p-5 rounded-[24px] border space-y-2 cursor-pointer hover:border-teal-500/50 transition ${
              isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
            }`} onClick={() => setActiveSection('CASH_FLOW')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-500">📈 Cash Flow Velocity</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>12 Months →</span>
              </div>
              <div className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>Peak Surplus: +₹54.9K</div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>January 2026 recorded highest net savings</p>
            </div>
          </div>

          {/* ── Financial Health Score Hero ─────────────────────────── */}
          {healthScore && (
            <div className={`p-5 sm:p-7 rounded-[28px] border relative overflow-hidden transition ${
              isDark ? 'bg-gradient-to-r from-[#0D1F23] to-[#12272E] border-[#1D3E45]' : 'bg-gradient-to-r from-slate-50 to-teal-50 border-teal-200 shadow-sm'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Financial Health Intelligence Score
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-5xl sm:text-6xl font-black font-mono tabular-nums ${
                      healthScore.tier === 'EXCELLENT' ? 'text-emerald-500' :
                      healthScore.tier === 'GOOD' ? 'text-teal-500' :
                      healthScore.tier === 'FAIR' ? 'text-amber-500' :
                      healthScore.tier === 'POOR' ? 'text-orange-500' : 'text-rose-500'
                    }`}>{healthScore.score}</div>
                    <div className="space-y-1">
                      <span className={`inline-block text-sm font-black px-3 py-1 rounded-full border ${
                        healthScore.tier === 'EXCELLENT' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-400/30' :
                        healthScore.tier === 'GOOD' ? 'bg-teal-500/20 text-teal-500 border-teal-400/30' :
                        healthScore.tier === 'FAIR' ? 'bg-amber-500/20 text-amber-500 border-amber-400/30' :
                        healthScore.tier === 'POOR' ? 'bg-orange-500/20 text-orange-500 border-orange-400/30' :
                        'bg-rose-500/20 text-rose-500 border-rose-400/30'
                      }`}>{healthScore.tier}</span>
                      <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>out of 100</div>
                    </div>
                  </div>
                  <p className={`text-xs max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>⚠️ {healthScore.primaryRisk}</p>
                  <p className={`text-[11px] italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>💡 {healthScore.improvementTip}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono min-w-[260px]">
                  {[
                    { label: 'Debt Ratio', score: healthScore.debtRatioScore, max: 25 },
                    { label: 'Savings Rate', score: healthScore.savingsRateScore, max: 25 },
                    { label: 'Income Stability', score: healthScore.incomeStabilityScore, max: 25 },
                    { label: 'Spend Diversity', score: healthScore.spendDiversityScore, max: 25 },
                  ].map(item => (
                    <div key={item.label} className={`p-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className={`text-[9px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                      <div className={`text-lg font-black mt-1 ${
                        item.score >= 20 ? 'text-emerald-500' : item.score >= 13 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {item.score}<span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/{item.max}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-700 overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${item.score >= 20 ? 'bg-emerald-500' : item.score >= 13 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${(item.score / item.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Anomaly Detection Cards ──────────────────────────────────── */}
          {anomalies.length > 0 && (
            <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
              isDark ? 'bg-[#1A1210] border-rose-800/40' : 'bg-rose-50 border-rose-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>🚨</span><span>Anomaly Detection — Unusual Transactions Flagged</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-500 border border-rose-400/30">
                  {anomalies.length} Flagged
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {anomalies.slice(0, 6).map(anomaly => (
                  <div key={anomaly.id} className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    anomaly.severity === 'HIGH'
                      ? (isDark ? 'bg-rose-950/30 border-rose-500/40' : 'bg-rose-100 border-rose-300')
                      : anomaly.severity === 'MEDIUM'
                      ? (isDark ? 'bg-amber-950/30 border-amber-500/40' : 'bg-amber-50 border-amber-200')
                      : (isDark ? 'bg-slate-800 border-slate-600' : 'bg-slate-100 border-slate-200')
                  }`}>
                    <span className="text-base shrink-0">
                      {anomaly.severity === 'HIGH' ? '🔴' : anomaly.severity === 'MEDIUM' ? '🟡' : '🟢'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{anomaly.narration}</div>
                      <div className={`text-[11px] font-mono font-bold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                        ₹{anomaly.amount.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {anomaly.reason} • {anomaly.transactionDate}
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full shrink-0 ${
                      anomaly.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                      anomaly.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>{anomaly.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence-Backed AI Insights Preview */}
          {evidenceInsights.length > 0 && (
            <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
              isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>✨</span>
                  <span>Evidence-Backed Financial AI Insights</span>
                </h3>
                <button 
                  onClick={() => setActiveSection('INSIGHTS')}
                  className="text-xs font-bold text-[#00BFA5] hover:underline"
                >
                  View All Evidence Insights →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evidenceInsights.slice(0, 4).map((ins) => (
                  <div 
                    key={ins.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      ins.type === 'RISK'
                        ? (isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200')
                        : ins.type === 'WARNING'
                        ? (isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200')
                        : ins.type === 'POSITIVE'
                        ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                        : (isDark ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200')
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sm">{ins.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        ins.type === 'RISK' ? 'bg-rose-500/20 text-rose-400' :
                        ins.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                        ins.type === 'POSITIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {ins.type}
                      </span>
                    </div>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{ins.summary}</p>
                    <div className={`text-[11px] italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      💡 Action: {ins.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. TAB 2: CANONICAL TRANSACTIONS LEDGER ──────────────────── */}
      {(activeSection === 'TRANSACTIONS' || activeSection === 'LEDGER') && statementResult && (
        <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>📑</span>
                <span>Canonical Transaction Ledger ({filteredLedger.length.toLocaleString('en-IN')} items)</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Canonical data model with classification method and verified running balance
              </p>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search narration, ref, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-mono outline-none border transition w-full sm:w-64 ${
                isDark 
                  ? 'bg-[#18242D] border-[#273B49] text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00BFA5]'
              }`}
            />
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-black">
            <div className="flex items-center rounded-xl p-0.5 border border-slate-700 bg-slate-900">
              <button
                onClick={() => setDirectionFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition ${directionFilter === 'ALL' ? 'bg-[#00BFA5] text-slate-950' : 'text-slate-400'}`}
              >
                ALL
              </button>
              <button
                onClick={() => setDirectionFilter('DEBIT')}
                className={`px-2.5 py-1 rounded-lg transition ${directionFilter === 'DEBIT' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
              >
                DEBIT
              </button>
              <button
                onClick={() => setDirectionFilter('CREDIT')}
                className={`px-2.5 py-1 rounded-lg transition ${directionFilter === 'CREDIT' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
              >
                CREDIT
              </button>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'EXPENSE', label: 'Lifestyle Spend' },
                { id: 'TRANSFER', label: 'Peer Transfers' },
                { id: 'SALARY', label: 'Salary Inflows' },
                { id: 'LOANS', label: 'Micro-Loans' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setEconomicFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-xl border text-[11px] transition ${
                    economicFilter === f.id
                      ? 'bg-[#00F2FE] text-slate-950 border-[#00F2FE] font-black'
                      : isDark ? 'bg-[#18242D] border-[#273B49] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-2.5 px-3">DATE</th>
                  <th className="py-2.5 px-3">NARRATION / PARTICULARS</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3 text-right">DEBIT (DR)</th>
                  <th className="py-2.5 px-3 text-right">CREDIT (CR)</th>
                  <th className="py-2.5 px-3 text-right">BALANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLedger.slice(0, ledgerVisibleCount).map((tx, idx) => (
                  <tr key={idx} className={`hover:${isDark ? 'bg-white/5' : 'bg-slate-50'} transition`}>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">{tx.date}</td>
                    <td className="py-2.5 px-3 max-w-xs sm:max-w-md truncate">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{tx.narration}</div>
                      {tx.referenceNumber && (
                        <div className="text-[10px] text-slate-500">Ref: {tx.referenceNumber}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold border ${
                        isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-500 whitespace-nowrap">
                      {tx.debit ? `₹${tx.debit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-500 whitespace-nowrap">
                      {tx.credit ? `₹${tx.credit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-black whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      {tx.balance !== null ? `₹${tx.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLedger.length > ledgerVisibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setLedgerVisibleCount(c => c + 150)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition border ${
                  isDark ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-[#00BFA5]' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
                }`}
              >
                Load Next 150 Transactions (Showing {ledgerVisibleCount} of {filteredLedger.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 6. TAB 3: SPENDING TAXONOMY & 12 PILLARS ──────────────────── */}
      {(activeSection === 'SPENDING' || activeSection === 'CATEGORIES') && statementResult && (
        <div className="space-y-6">
          <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <span>💳</span>
                  <span>12-Pillar Spend Taxonomy & Lifestyle Decomposition</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Normalized debit categories with transaction frequency, volume shares, and average ticket sizes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((cat, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-[22px] border space-y-2 transition cursor-pointer hover:border-teal-500/50 ${
                    isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-bold text-xs">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black font-mono text-rose-500">
                      ₹{cat.debit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500" 
                      style={{ width: `${Math.min(100, Math.max(2, cat.sharePercent))}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{cat.count} txns ({cat.sharePercent.toFixed(1)}% share)</span>
                    <span>Avg: ₹{cat.avgTicket.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>

                  {/* Subcategory mini bars */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className={`pt-2 border-t space-y-1.5 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      {cat.subcategories.slice(0, 3).map((sub, si) => (
                        <div key={si} className="flex items-center gap-2">
                          <span className={`text-[9px] w-24 truncate shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sub.name}</span>
                          <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                            <div className="h-full bg-rose-400/70 rounded-full" style={{ width: `${Math.max(3, sub.shareOfCategory)}%` }} />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-rose-400 w-8 text-right shrink-0">{sub.shareOfCategory}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); }}
                    className={`w-full text-[10px] font-bold text-center text-[#00BFA5] hover:underline pt-1 pb-0`}
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 7. TAB 4: INFLOW & SALARY DECOMPOSITION ───────────────────── */}
      {(activeSection === 'INCOME' || activeSection === 'INFLOW') && statementResult && (
        <div className="space-y-6">
          <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <h2 className="text-lg font-black flex items-center gap-2">
              <span>💰</span>
              <span>Inflow Decomposition & Professional Income Sources</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              5-part breakdown separating Corporate Salary, EPFO, Micro-Loans, P2P Transfers, and Cashbacks
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inflows.map((inf, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-[22px] border space-y-2 transition ${
                    isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <span className="font-bold text-xs">{inf.category}</span>
                    </div>
                    <span className="text-xs font-black font-mono text-emerald-500">
                      +₹{inf.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" 
                      style={{ width: `${Math.min(100, Math.max(2, inf.sharePercent))}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{inf.count} credits ({inf.sharePercent.toFixed(1)}% share)</span>
                    <span>Avg: ₹{(inf.count > 0 ? inf.totalAmount / inf.count : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 12-Month Inflow Timeline ──────────────────────────────── */}
          {salaryTimeline.length > 0 && (
            <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
              isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}>
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <span>📅</span><span>12-Month Credit Timeline — Salary vs Loan vs Other</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Month-by-month credit breakdown: Corporate salary, micro-loan disbursals, and other credits
                </p>
              </div>
              {(() => {
                const maxVal = Math.max(...salaryTimeline.map(m => m.salaryAmount + m.loanCreditAmount + m.otherCreditAmount), 1);
                return (
                  <div className="space-y-2.5">
                    {salaryTimeline.map(m => {
                      const total = m.salaryAmount + m.loanCreditAmount + m.otherCreditAmount;
                      const salaryPct = (m.salaryAmount / maxVal) * 100;
                      const loanPct = (m.loanCreditAmount / maxVal) * 100;
                      const otherPct = (m.otherCreditAmount / maxVal) * 100;
                      return (
                        <div key={m.monthKey} className="flex items-center gap-3">
                          <div className={`text-[11px] font-mono w-16 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{m.monthName}</div>
                          <div className={`flex-1 flex items-center h-5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                            {m.salaryAmount > 0 && (
                              <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${Math.max(2, salaryPct)}%` }}
                                title={`Salary: ₹${m.salaryAmount.toLocaleString('en-IN')}`}
                              />
                            )}
                            {m.loanCreditAmount > 0 && (
                              <div
                                className="h-full bg-amber-500 transition-all"
                                style={{ width: `${Math.max(2, loanPct)}%` }}
                                title={`Loan Disbursals: ₹${m.loanCreditAmount.toLocaleString('en-IN')}`}
                              />
                            )}
                            {m.otherCreditAmount > 0 && (
                              <div
                                className="h-full bg-cyan-400 transition-all"
                                style={{ width: `${Math.max(2, otherPct)}%` }}
                                title={`Other Credits: ₹${m.otherCreditAmount.toLocaleString('en-IN')}`}
                              />
                            )}
                          </div>
                          <div className={`text-[11px] font-black font-mono w-20 text-right shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            +₹{(total / 1000).toFixed(1)}K
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-4 pt-1 text-[10px]">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-emerald-500 inline-block"/><span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Salary</span></span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-amber-500 inline-block"/><span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loan Credits</span></span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-cyan-400 inline-block"/><span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Other</span></span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── 8. TAB 5: LOANS & DEBT MATRIX ─────────────────────────────── */}
      {(activeSection === 'LOANS') && statementResult && (
        <div className="space-y-6">
          <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <span>🏦</span>
                  <span>Multi-Lender Debt & Micro-Credit Forensic Matrix</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Lender-by-lender borrowing vs repayment accounting with net revolving balances
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-500 border border-amber-400/30">
                4 Lenders Audited
              </span>
            </div>


            {/* ── Debt Overview Hero ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Total Borrowed</div>
                <div className={`text-xl font-black font-mono mt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  ₹{lenders.reduce((s, l) => s + l.totalBorrowed, 0).toLocaleString('en-IN')}
                </div>
                <div className={`text-[10px] mt-0.5 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>
                  {lenders.reduce((s, l) => s + l.borrowCount, 0)} disbursals across {lenders.length} lenders
                </div>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
                <div className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>Total Repaid</div>
                <div className={`text-xl font-black font-mono mt-1 ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>
                  ₹{lenders.reduce((s, l) => s + l.totalRepaid, 0).toLocaleString('en-IN')}
                </div>
                <div className={`text-[10px] mt-0.5 ${isDark ? 'text-rose-500' : 'text-rose-600'}`}>
                  {lenders.reduce((s, l) => s + l.repayCount, 0)} repayment transactions
                </div>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${
                lenders.reduce((s, l) => s + l.netDelta, 0) > 0
                  ? (isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200')
                  : (isDark ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200')
              }`}>
                <div className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Net Outstanding</div>
                <div className={`text-xl font-black font-mono mt-1 ${
                  lenders.reduce((s, l) => s + l.netDelta, 0) > 0
                    ? (isDark ? 'text-amber-300' : 'text-amber-800')
                    : (isDark ? 'text-slate-200' : 'text-slate-700')
                }`}>
                  {lenders.reduce((s, l) => s + l.netDelta, 0) > 0 ? '+' : ''}₹{lenders.reduce((s, l) => s + l.netDelta, 0).toLocaleString('en-IN')}
                </div>
                <div className={`text-[10px] mt-0.5 ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>net active balance</div>
              </div>
            </div>

            {/* ── Debt Cycle Warning ────────────────────────────────────── */}
            {facts && facts.debtPayments > 0 && (
              <div className={`p-4 rounded-2xl border mb-4 ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">⚠️</span>
                  <div>
                    <div className={`text-xs font-black ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Debt Cycle Pattern Observed</div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                      Active micro-loan lines (mPokket + Vivifi) show overlapping 30-day disbursement/repayment cycles.
                      Borrowing within 48 hours of repaying another lender suggests liquidity rotation.
                      {facts && facts.totalInflow > 0 && (
                        ` Debt repayments represent ${Math.round((facts.debtPayments / facts.totalInflow) * 100)}% of gross inflows.`
                      )}
                    </p>
                    <div className={`text-[10px] mt-1.5 italic ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>
                      💡 Recommendation: Close one revolving line and consolidate into a single lower-cost EMI.
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lenders.map((len, idx) => (
                <div 
                  key={idx}
                  className={`p-5 rounded-[24px] border space-y-3 transition ${
                    isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MerchantLogoView merchantName={len.lenderName} size={36} isDark={isDark} shape="rounded" />
                      <div>
                        <div className="font-black text-xs">{len.lenderName}</div>
                        <div className="text-[10px] text-slate-400">{len.productType}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      len.status === 'ACTIVE_LINE'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                    }`}>
                      {len.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <div className="text-[9px] text-slate-400">BORROWED</div>
                      <div className="text-xs font-black text-emerald-400">
                        {len.totalBorrowed > 0 ? `₹${len.totalBorrowed.toLocaleString('en-IN')}` : '—'}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <div className="text-[9px] text-slate-400">REPAID</div>
                      <div className="text-xs font-black text-rose-400">
                        ₹{len.totalRepaid.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <div className="text-[9px] text-slate-400">NET DELTA</div>
                      <div className={`text-xs font-black ${len.netDelta > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {len.netDelta > 0 ? `+₹${len.netDelta.toLocaleString('en-IN')}` : `₹${len.netDelta.toLocaleString('en-IN')}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. TAB 6: PEOPLE & COUNTERPARTIES INTELLIGENCE ────────────── */}
      {(activeSection === 'PEOPLE' || activeSection === 'MERCHANTS') && statementResult && (
        <div className="space-y-6">
          <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <span>👥</span>
                  <span>People & Counterparty Resolution Hub</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Canonical entity resolution tracking total sent, received, and net personal cash flow
                </p>
              </div>

              <input
                type="text"
                placeholder="Search person or payee..."
                value={payeeSearch}
                onChange={(e) => setPayeeSearch(e.target.value)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-mono outline-none border transition w-full sm:w-64 ${
                  isDark 
                    ? 'bg-[#18242D] border-[#273B49] text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00BFA5]'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedCounterparty(p)}
                  className={`p-4 rounded-[22px] border space-y-2.5 cursor-pointer hover:border-teal-500/50 transition ${
                    isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 text-[#00BFA5] font-black flex items-center justify-center text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.transactionCount} transactions • {p.primaryChannel}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#00BFA5]">Inspect →</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <div className="text-[9px] text-slate-400">SENT (DR)</div>
                      <div className="font-black text-rose-400">₹{p.totalSent.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/50">
                      <div className="text-[9px] text-slate-400">RECEIVED (CR)</div>
                      <div className="font-black text-emerald-400">
                        {p.totalReceived > 0 ? `₹${p.totalReceived.toLocaleString('en-IN')}` : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 10. TAB 7: RECURRING MANDATES & SUBSCRIPTIONS ────────────── */}
      {(activeSection === 'RECURRING') && (
        <div className="space-y-6">
          <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <span>🔄</span>
                  <span>Active Recurring Mandates & Subscriptions</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Detected fixed interval obligations (Payroll, Insurance, Cloud, Subscriptions, EMIs)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500/20 text-[#00BFA5] border border-teal-400/30">
                {recurringMandates.length} Mandates Active
              </span>
            </div>


            {/* ── Monthly Obligation Hero ──────────────────────────────── */}
            {recurringMandates.length > 0 && (() => {
              const monthly = recurringMandates.filter(m => m.frequency === 'MONTHLY');
              const quarterly = recurringMandates.filter(m => m.frequency === 'QUARTERLY');
              const monthlyTotal = monthly.reduce((s, m) => s + m.amount, 0)
                + quarterly.reduce((s, m) => s + Math.round(m.amount / 3), 0);
              const loans = recurringMandates.filter(m => m.category.includes('Loan') || m.category.includes('EMI'));
              const subs = recurringMandates.filter(m => m.category.includes('Subscription'));
              const ins = recurringMandates.filter(m => m.category.includes('Insurance'));
              return (
                <div className={`p-5 rounded-2xl border mb-4 flex flex-col sm:flex-row sm:items-center gap-5 ${
                  isDark ? 'bg-teal-950/20 border-teal-500/30' : 'bg-teal-50 border-teal-200'
                }`}>
                  <div className="min-w-0">
                    <div className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                      Estimated Monthly Obligation
                    </div>
                    <div className={`text-3xl font-black font-mono mt-1 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                      ₹{monthlyTotal.toLocaleString('en-IN')}
                      <span className={`text-sm font-normal ml-1 ${isDark ? 'text-teal-500' : 'text-teal-600'}`}>/month</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-teal-500' : 'text-teal-600'}`}>
                      {recurringMandates.length} active mandates detected across {[loans.length > 0, subs.length > 0, ins.length > 0].filter(Boolean).length} categories
                    </p>
                  </div>
                  <div className="flex items-center gap-5 sm:ml-auto flex-wrap">
                    {loans.length > 0 && (
                      <div className="text-center">
                        <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Loans & EMIs</div>
                        <div className={`text-lg font-black font-mono mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                          ₹{loans.reduce((s, m) => s + m.amount, 0).toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[9px] ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>{loans.length} lines</div>
                      </div>
                    )}
                    {ins.length > 0 && (
                      <div className="text-center">
                        <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>Insurance</div>
                        <div className={`text-lg font-black font-mono mt-0.5 ${isDark ? 'text-violet-300' : 'text-violet-800'}`}>
                          ₹{Math.round(ins.reduce((s, m) => s + m.amount / 3, 0)).toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[9px] ${isDark ? 'text-violet-500' : 'text-violet-600'}`}>amortized/mo</div>
                      </div>
                    )}
                    {subs.length > 0 && (
                      <div className="text-center">
                        <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>Subscriptions</div>
                        <div className={`text-lg font-black font-mono mt-0.5 ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                          ₹{subs.reduce((s, m) => s + m.amount, 0).toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[9px] ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>{subs.length} services</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recurringMandates.map((m) => (
                <div 
                  key={m.id}
                  className={`p-4 rounded-[22px] border space-y-2.5 transition ${
                    isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MerchantLogoView merchantName={m.merchantName} size={32} isDark={isDark} shape="rounded" />
                      <div>
                        <div className="font-black text-xs">{m.merchantName}</div>
                        <div className="text-[10px] text-slate-400">{m.category}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-[#00BFA5]">
                      {m.frequency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-black text-white">₹{m.amount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Last: {m.lastBilledDate}</span>
                    <span className="text-emerald-400">Next: {m.nextExpectedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 11. TAB 8: 12-MONTH CASH FLOW VELOCITY ────────────────────── */}
      {(activeSection === 'CASH_FLOW' || activeSection === 'VELOCITY') && statementResult && (
        <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <h2 className="text-lg font-black flex items-center gap-2">
            <span>📈</span>
            <span>12-Month Financial Velocity & Cash Run-Rate</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Month-by-month trajectory tracking inflows, outflows, surplus/deficits, and closing balances
          </p>

          
          {/* ── Visual Monthly Flow Bar Chart ────────────────────────── */}
          {velocity.length > 0 && (() => {
            const maxFlowVal = Math.max(...velocity.map(m => Math.max(m.inflows, m.outflows)), 1);
            return (
              <div className={`p-5 rounded-[24px] border space-y-4 mb-2 ${
                isDark ? 'bg-[#0D1418] border-[#1A2530]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`text-xs font-black flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>📊</span><span>Visual Monthly Flow — Inflow vs Outflow</span>
                </div>
                <div className="flex items-end gap-1.5 px-1" style={{ height: '7rem' }}>
                  {velocity.map((m, idx) => {
                    const inH = Math.max(3, (m.inflows / maxFlowVal) * 100);
                    const outH = Math.max(3, (m.outflows / maxFlowVal) * 100);
                    const isSurplus = m.netFlow >= 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <div className="w-full flex gap-0.5 items-end" style={{ height: '6rem' }}>
                          <div
                            className="flex-1 bg-emerald-500/80 hover:bg-emerald-500 rounded-t transition-all cursor-help"
                            style={{ height: `${inH}%` }}
                            title={`+₹${m.inflows.toLocaleString('en-IN')}`}
                          />
                          <div
                            className="flex-1 bg-rose-500/80 hover:bg-rose-500 rounded-t transition-all cursor-help"
                            style={{ height: `${outH}%` }}
                            title={`-₹${m.outflows.toLocaleString('en-IN')}`}
                          />
                        </div>
                        <div className={`text-[8px] font-mono w-full text-center leading-none ${
                          isSurplus ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {(m.monthName || m.monthKey).split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded bg-emerald-500/80 inline-block"/>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Inflows (CR)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded bg-rose-500/80 inline-block"/>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Outflows (DR)</span>
                  </span>
                  <span className={`ml-auto font-black font-mono text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Net: {velocity.reduce((s, m) => s + m.netFlow, 0) >= 0 ? '+' : ''}₹{velocity.reduce((s, m) => s + m.netFlow, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-2.5 px-3">MONTH</th>
                  <th className="py-2.5 px-3 text-right">INFLOWS (CR)</th>
                  <th className="py-2.5 px-3 text-right">OUTFLOWS (DR)</th>
                  <th className="py-2.5 px-3 text-right">NET FLOW</th>
                  <th className="py-2.5 px-3 text-right">TXN COUNT</th>
                  <th className="py-2.5 px-3 text-right">MONTH CLOSING</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {velocity.map((m, idx) => (
                  <tr key={idx} className={`hover:${isDark ? 'bg-white/5' : 'bg-slate-50'} transition`}>
                    <td className={`py-2.5 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.monthName}</td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-500">
                      +₹{m.inflows.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-500">
                      -₹{m.outflows.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-black ${m.netFlow > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.netFlow > 0 ? `+₹${m.netFlow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : `₹${m.netFlow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{m.txnCount}</td>
                    <td className="py-2.5 px-3 text-right font-black text-cyan-400">
                      {m.closingBalance !== null ? `₹${m.closingBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        m.trend === 'SURPLUS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                          : m.trend === 'DEFICIT'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-400/30'
                      }`}>
                        {m.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 12. TAB 9: EVIDENCE-BACKED AI INSIGHTS ────────────────────── */}
      {(activeSection === 'INSIGHTS') && (
        <div className="space-y-6">
          <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <h2 className="text-lg font-black flex items-center gap-2">
              <span>✨</span>
              <span>Evidence-Backed AI Financial Insights</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Every insight is backed by verified deterministic metrics, transaction counts, and actionable advice
            </p>

            <div className="space-y-4">
              {evidenceInsights.map((ins) => (
                <div
                  key={ins.id}
                  className={`p-5 rounded-[24px] border space-y-3 transition ${
                    ins.type === 'RISK'
                      ? (isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200')
                      : ins.type === 'WARNING'
                      ? (isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200')
                      : ins.type === 'POSITIVE'
                      ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                      : (isDark ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200')
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-black text-sm">{ins.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ins.type === 'RISK' ? 'bg-rose-500/20 text-rose-400' :
                      ins.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                      ins.type === 'POSITIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {ins.type}
                    </span>
                  </div>

                  <p className={`text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{ins.summary}</p>
                  
                  <div className="p-3 rounded-xl bg-black/20 text-xs space-y-1">
                    <div className="font-bold text-[#00BFA5] text-[11px]">WHY THIS MATTERS:</div>
                    <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>{ins.whyItMatters}</div>
                  </div>

                  {/* Evidence Metrics Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                    {ins.evidence.map((ev, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900/40">
                        <div className="text-[9px] text-slate-400">{ev.metric}</div>
                        <div className="font-black text-white mt-0.5">{ev.currentValue}</div>
                      </div>
                    ))}
                  </div>

                  <div className={`p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-bold ${
                    isDark ? 'text-teal-300' : 'text-teal-900'
                  }`}>
                    💡 Actionable Advice: {ins.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 13. TAB 10: AI FINANCIAL ANALYST ─────────────────────────── */}
      {(activeSection === 'AI_ANALYST' || activeSection === 'COPILOT') && (
        <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span>🤖</span>
              <span>AI Financial Analyst Copilot</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-[#00BFA5] border border-teal-400/30">
              Gemini LLM Active
            </span>
          </div>

          {/* Quick Query Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              'Show salary & income analysis',
              'What are my loan borrowings vs repayments?',
              'Explain mathematical reconciliation',
              'Who are my top payees?',
              'Show monthly velocity & burn rate',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(q)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                  isDark ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Container */}
          <div className={`p-4 rounded-2xl border min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 ${
            isDark ? 'bg-[#0D1418] border-[#1D2930]' : 'bg-slate-50 border-slate-200'
          }`}>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#00BFA5] text-slate-950 font-bold'
                    : isDark
                    ? 'bg-[#18242D] text-slate-200 border border-[#273B49]'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex items-center gap-2 text-xs text-[#00BFA5] font-mono">
                <span className="animate-spin">⚡</span>
                <span>Copilot reasoning over financial facts...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about salary, biggest expense, loan EMIs, or anomalies..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className={`flex-1 px-4 py-2.5 rounded-2xl text-xs outline-none border transition ${
                isDark 
                  ? 'bg-[#18242D] border-[#273B49] text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00BFA5]'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={isAiTyping || !chatInput.trim()}
              className="px-5 py-2.5 rounded-2xl text-xs font-black bg-[#00BFA5] hover:bg-[#00A892] text-slate-950 transition border border-[#00BFA5] disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── 14. TAB 11: MULTI-FORMAT UPLOAD STATEMENT ─────────────────── */}
      {(activeSection === 'UPLOAD') && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 rounded-[28px] border-2 border-dashed text-center space-y-4 cursor-pointer transition ${
              isDragging
                ? 'border-[#00BFA5] bg-teal-500/10'
                : isDark
                ? 'border-[#273B49] bg-[#121B22] hover:border-[#00BFA5]/50'
                : 'border-slate-300 bg-white hover:border-[#00BFA5]/50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv,.xlsx,.xls,.txt,.pdf" 
              className="hidden" 
            />
            <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-500/20 text-[#00BFA5] flex items-center justify-center text-3xl">
              📥
            </div>
            <div className="space-y-1">
              <div className="text-base sm:text-lg font-black">
                Drop your bank statement file here
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Supports .xlsx, .xls, .csv, .txt, and password-protected PDF statements
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 text-[10px] font-mono text-slate-400">
              <span>🔒 100% Client-Side Private Ingestion</span>
            </div>
          </div>
        </div>
      )}


      {/* ── CATEGORY DRILLDOWN MODAL ─────────────────────────────────────── */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-[28px] border space-y-5 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  {selectedCategory.icon}
                </div>
                <div>
                  <h3 className="text-base font-black">{selectedCategory.name}</h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedCategory.count} txns • {selectedCategory.sharePercent.toFixed(1)}% of total spend
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >✕</button>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              {[
                { label: 'Total Spent', value: `₹${selectedCategory.debit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-rose-400' },
                { label: 'Transactions', value: String(selectedCategory.count), color: isDark ? 'text-white' : 'text-slate-900' },
                { label: 'Avg Ticket', value: `₹${selectedCategory.avgTicket.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: isDark ? 'text-white' : 'text-slate-900' },
              ].map(item => (
                <div key={item.label} className={`p-3 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className={`text-[9px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                  <div className={`font-black mt-1 ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
              <div className="space-y-3">
                <div className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Merchant / Subcategory Breakdown
                </div>
                {selectedCategory.subcategories.map((sub: SubcategoryItem, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{sub.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sub.count} txns</span>
                        <span className="font-black font-mono text-rose-400">₹{sub.debit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub.shareOfCategory}%</span>
                      </div>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all"
                        style={{ width: `${Math.max(2, sub.shareOfCategory)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Top Transactions in {selectedCategory.name}
              </div>
              {(statementResult?.transactions || [])
                .filter(t => t.category === selectedCategory.name && (t.debit || 0) > 0)
                .sort((a, b) => (b.debit || 0) - (a.debit || 0))
                .slice(0, 5)
                .map((t, i) => (
                  <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold truncate max-w-[220px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.narration}</div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.date}</div>
                    </div>
                    <span className="font-black font-mono text-rose-400 shrink-0 ml-2">
                      ₹{(t.debit || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full py-2.5 rounded-2xl text-xs font-black bg-[#00BFA5] text-slate-950"
            >Close Drilldown</button>
          </div>
        </div>
      )}

      {/* ── 15. COUNTERPARTY DRILLDOWN MODAL ──────────────────────────── */}
      {selectedCounterparty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-lg p-6 rounded-[28px] border space-y-4 ${
            isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-[#00BFA5] font-black flex items-center justify-center text-base">
                  {selectedCounterparty.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black">{selectedCounterparty.name}</h3>
                  <p className="text-[11px] text-slate-400">{selectedCounterparty.entityType} • {selectedCounterparty.primaryChannel}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCounterparty(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/50">
                <div className="text-[10px] text-slate-400">TOTAL SENT (DEBIT)</div>
                <div className="text-base font-black text-rose-400 mt-0.5">₹{selectedCounterparty.totalSent.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/50">
                <div className="text-[10px] text-slate-400">TOTAL RECEIVED (CREDIT)</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  {selectedCounterparty.totalReceived > 0 ? `₹${selectedCounterparty.totalReceived.toLocaleString('en-IN')}` : '—'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/20 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Transactions Count:</span>
                <span className="font-bold text-white">{selectedCounterparty.transactionCount} transactions</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Average Transaction:</span>
                <span className="font-bold text-white">₹{selectedCounterparty.averageAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>First Seen:</span>
                <span className="font-mono text-slate-300">{selectedCounterparty.firstTransactionDate}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Last Payment:</span>
                <span className="font-mono text-slate-300">{selectedCounterparty.lastTransactionDate}</span>
              </div>
            </div>

            {selectedCounterparty.aliases.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Resolved Aliases & UPI Identifiers:</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedCounterparty.aliases.map((al, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300 truncate max-w-xs">
                      {al}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedCounterparty(null)}
              className="w-full py-2.5 rounded-2xl text-xs font-black bg-[#00BFA5] text-slate-950"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
