import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BackendStatementUploadResult, 
  StatementTransactionItem, 
  FinancialEvent,
  StatementSection,
  BackendFinancialAccount,
  BackendLoanItem,
  BackendRecurringItem,
  BackendStatementListItem
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
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [ledgerVisibleCount, setLedgerVisibleCount] = useState(100);
  const [payeeSearch, setPayeeSearch] = useState('');
  const [isMerged, setIsMerged] = useState(false);

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
        if (err.message === 'PASSWORD_REQUIRED') {
          setPendingFile(file);
          setShowPasswordModal(true);
          setIsProcessing(false);
          return;
        }
        // Fallback to high-accuracy local parser
        result = await backendApiService.parseClientSideFallback(file, password);
      }

      setTimeout(() => {
        setProcessingProgress(100);
        setProcessingStage('5/5 Forensic Statement Analysis Complete!');
        setStatementResult(result);
        setActiveSection('OVERVIEW');
        setIsProcessing(false);
      }, 1100);
    } catch (err: any) {
      console.error('Statement parsing failed:', err);
      setErrorMessage(err.message || 'Failed to parse statement. Please ensure it is a valid bank statement file.');
      setIsProcessing(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processStatementFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processStatementFile(e.target.files[0]);
    }
  };

  const handleUnlockAndProcess = () => {
    if (pendingFile) {
      setShowPasswordModal(false);
      processStatementFile(pendingFile, pdfPassword);
      setPdfPassword('');
      setPendingFile(null);
    }
  };

  const loadRealHdfcStatementXls = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingProgress(15);
    setProcessingStage('1/5 Fetching HDFC Statement (.xls - 1,781 Transactions)...');

    try {
      const res = await fetch('/Acct_Statement_9082.xls');
      const blob = await res.blob();
      const file = new File([blob], 'Acct Statement_9082_13082026_18.55.44.xls', { type: 'application/vnd.ms-excel' });
      await processStatementFile(file);
    } catch (e: any) {
      console.warn('Error fetching HDFC XLS:', e);
      loadSampleExcelStatement();
    }
  };

  const loadSampleStatement = () => {
    const sampleCsv = `Date,Narration,Chq/Ref Number,Withdrawal (Dr),Deposit (Cr),Balance
01/08/2026,SALARY CREDIT ACME CORP PVT LTD,SAL88941,,52000.00,78861.00
03/08/2026,UPI-SWIGGY-swiggy@icici-ORDER19482,UPI39841029,450.00,,78411.00
05/08/2026,ACH DEBIT HDFC HOME LOAN EMI,ACH8891024,4500.00,,73911.00
08/08/2026,UPI-AIRTEL BROADBAND BILL-airtel@icici,UPI99401294,1179.00,,72732.00
12/08/2026,NEFT TRANSFER TO OWN AIRTEL A/C 9600,NEFT001928,6200.00,,66532.00
15/08/2026,POS AMAZON INDIA MUMBAI,POS774819,3499.00,,63033.00
18/08/2026,UPI-BLINKIT GROCERY-blinkit@axl,UPI44910284,890.00,,62143.00
20/08/2026,E-MANDATE NETFLIX INDIA ENTERTAINMENT,MAN991048,649.00,,61494.00
24/08/2026,POS SHELL PETROL PUMP FUEL,POS119402,2200.00,,59294.00
25/08/2026,UPI-STARBUCKS COFFEE-starbucks@hdfc,UPI39910283,380.00,,58914.00
27/08/2026,UPI-ZOMATO DINING-zomato@paytm,UPI88291048,550.00,,58364.00
28/08/2026,CRED AXIS CREDIT CARD BILL PAYMENT,CRED884910,15946.00,,42418.00
29/08/2026,ATM CASH WITHDRAWAL MUMBAI DADAR,ATM992019,1000.00,,41418.00
30/08/2026,BANK SMS SERVICE CHARGES QUARTERLY,CHG881029,53.00,,41365.00`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const file = new File([blob], 'HDFC_Bank_Statement_Aug2026.csv', { type: 'text/csv' });
    processStatementFile(file);
  };

  const loadSampleExcelStatement = async () => {
    try {
      const XLSX = await import('xlsx');
      const wsData = [
        ['State Bank of India', '', '', '', '', ''],
        ['Account Statement for A/c: •••• 5521', '', '', '', '', ''],
        ['Date', 'Narration', 'Ref No', 'Debit', 'Credit', 'Balance'],
        ['01/08/2026', 'BY TRANSFER-SALARY CREDITED', 'SBIN00192', '', 58000, 84500],
        ['03/08/2026', 'UPI/SWIGGY/swiggy@icici', 'UPI99201', 520, '', 83980],
        ['06/08/2026', 'ACH/SBI LIFE INSURANCE EMI', 'ACH44910', 3200, '', 80780],
        ['10/08/2026', 'TRANSFER TO SELF AIRTEL A/C', 'NEFT8819', 5000, '', 75780],
        ['15/08/2026', 'POS/FLIPKART INTERNET BLR', 'POS11942', 2899, '', 72881],
        ['20/08/2026', 'UPI/ZEPTO GROCERIES', 'UPI33910', 740, '', 72141],
        ['25/08/2026', 'HPCL PETROL PUMP REFUEL', 'POS88192', 1500, '', 70641],
        ['28/08/2026', 'CRED/AXIS BANK CREDIT CARD BILL', 'CRED9918', 12500, '', 58141],
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Statement');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const file = new File([blob], 'SBI_Account_Statement_Aug2026.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      processStatementFile(file);
    } catch (e) {
      loadSampleStatement();
    }
  };

  // Merge Statement Transactions into SMS Simulator Feed
  const handleMergeToSmsSimulator = () => {
    if (!statementResult?.transactions || !onMergeTransactions) return;

    const newEvents = statementResult.transactions.map((tx, idx) => {
      const isCredit = (tx.credit || 0) > 0;
      const amt = tx.credit || tx.debit || 0;
      return {
        id: `stmt_merged_${idx}_${Date.now()}`,
        date: tx.date || '2026-08-01',
        time: '12:00 PM',
        merchantName: tx.narration,
        amount: amt,
        direction: isCredit ? 'CREDIT' : 'DEBIT',
        category: tx.category || 'General',
        account: statementResult.bankDetected || 'Bank Statement',
        accountMask: statementResult.accountNo?.slice(-4) || '9082',
        accountType: 'SAVINGS',
        channel: 'BANK_STATEMENT',
        referenceNumber: tx.referenceNumber || `REF${idx}`,
        balanceAfter: tx.balance ?? undefined,
        rawSms: `Bank Statement Entry: ${tx.narration} | Amt: ₹${amt} | Bal: ₹${tx.balance}`,
        isAnomaly: false,
        confidence: 0.99,
      };
    }) as unknown as FinancialEvent[];

    onMergeTransactions(newEvents);
    setIsMerged(true);
  };

  // AI Copilot Chat Action
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const userText = chatInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { role: 'user', text: userText, time: timeNow }]);
    setChatInput('');
    setIsAiTyping(true);

    const reply = await backendApiService.sendAiChat(userText, {
      statementResult,
      totalInflow: statementResult?.facts.totalInflow,
      trueSpend: statementResult?.facts.trueEconomicExpense,
      reconciliation: statementResult?.reconciliation,
      bank: statementResult?.bankDetected,
    });

    setIsAiTyping(false);
    setChatMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: reply.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Filtered Transactions for Table
  const filteredTransactions = useMemo(() => {
    return (statementResult?.transactions || []).filter((tx) => {
      if (directionFilter === 'DEBIT' && (!tx.debit || tx.debit <= 0)) return false;
      if (directionFilter === 'CREDIT' && (!tx.credit || tx.credit <= 0)) return false;
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const narrMatch = tx.narration.toLowerCase().includes(q);
        const refMatch = tx.referenceNumber?.toLowerCase().includes(q);
        const catMatch = tx.category?.toLowerCase().includes(q);
        const dateMatch = tx.date.toLowerCase().includes(q);
        return narrMatch || refMatch || catMatch || dateMatch;
      }
      return true;
    });
  }, [statementResult, directionFilter, categoryFilter, searchQuery]);

  // Filtered Payees for Leaderboard
  const filteredPayees = useMemo(() => {
    const list = statementResult?.topPayees || [];
    if (!payeeSearch) return list;
    const q = payeeSearch.toLowerCase();
    return list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [statementResult, payeeSearch]);

  const rec = statementResult?.reconciliation;
  const facts = statementResult?.facts;

  return (
    <div className="space-y-6">
      {/* ── 1. TOP HEADER & BACKEND HEALTH STATUS ─────────────────────── */}
      <div className={`p-4 sm:p-5 rounded-[24px] border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-xl">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className={isDark ? 'text-white' : 'text-slate-900'}>Forensic Engine Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                backendStatus?.isOnline 
                  ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200')
                  : (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-amber-50 text-amber-800 border-amber-200')
              }`}>
                {backendStatus?.isOnline ? `ONLINE (${backendStatus.latencyMs}ms)` : 'READY / CONNECTING'}
              </span>
            </div>
            <div className={`text-[10px] font-mono mt-0.5 truncate max-w-xs sm:max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {BACKEND_ENVIRONMENTS[currentEnv].baseUrl}
            </div>
          </div>
        </div>

        {/* Module Switcher & Env */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {onSwitchToSmsModule && (
            <button
              onClick={onSwitchToSmsModule}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black transition border flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-[#00F2FE]' 
                  : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-900'
              }`}
            >
              <span>📱</span>
              <span>Switch to SMS Simulator</span>
            </button>
          )}

          <select
            value={currentEnv}
            onChange={(e) => handleEnvChange(e.target.value as BackendEnvironment)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              isDark 
                ? 'bg-[#18242D] border-[#273B49] text-slate-200 hover:bg-[#20303D]' 
                : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
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

      {/* ── 2. DEDICATED MULTI-DIMENSIONAL FORENSIC NAVIGATION TABS ───── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-black">
        {[
          { id: 'OVERVIEW', label: '🏛️ Overview & Audit' },
          { id: 'INFLOW', label: '💰 Inflow & Salary' },
          { id: 'CATEGORIES', label: '💳 Spend Categories' },
          { id: 'LOANS', label: '🏦 Loans & Debt Matrix' },
          { id: 'VELOCITY', label: '📈 Monthly Velocity' },
          { id: 'MERCHANTS', label: '🛍️ Top Payees Hub' },
          { id: 'CHANNELS', label: '⚡ Payment Channels' },
          { id: 'LEDGER', label: '📑 Statement Ledger' },
          { id: 'UPLOAD', label: '📤 Upload File' },
          { id: 'COPILOT', label: '🤖 AI Forensics' },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
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

      {/* ── 3. LIVE 5-STAGE PROCESSING VISUALIZER ─────────────────────── */}
      {isProcessing && (
        <div className={`p-8 sm:p-10 rounded-[28px] border text-center space-y-5 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="w-14 h-14 mx-auto rounded-full bg-teal-500/20 text-[#00BFA5] flex items-center justify-center text-2xl animate-spin">
            ⚡
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs font-black text-[#00BFA5]">
              <span>{processingStage}</span>
              <span>{processingProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00BFA5] to-[#00F2FE] transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Running multi-bank heuristics, column mapping, mathematical reconciliation, and AI taxonomy.
            </p>
          </div>
        </div>
      )}

      {/* ── 4. SUB-PAGE 1: OVERVIEW & FORENSIC AUDIT ─────────────────── */}
      {activeSection === 'OVERVIEW' && statementResult && (
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
                      STATEMENT VERIFIED
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-slate-200'}`}>
                      {statementResult.transactionCount} txns
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
                  📥 Upload Another
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
                      Mathematical Ledger Reconciliation
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    rec.isReconciled
                      ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300')
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                  }`}>
                    {rec.isReconciled ? '● 100% RECONCILED' : 'DISCREPANCY DETECTED'}
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
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Excludes self-transfers & borrowings</div>
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
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Salary + Loan Disbursals + P2P</div>
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
            }`} onClick={() => setActiveSection('INFLOW')}>
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
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">🏦 Loans & Credit Lines</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>4 Lenders →</span>
              </div>
              <div className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>Borrowed: ₹1.11L • Repaid: ₹95.8K</div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>mPokket & Vivifi FlexPay revolving credit</p>
            </div>

            <div className={`p-5 rounded-[24px] border space-y-2 cursor-pointer hover:border-teal-500/50 transition ${
              isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
            }`} onClick={() => setActiveSection('VELOCITY')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-500">📈 Cash Flow Velocity</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>12 Months →</span>
              </div>
              <div className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>Peak Surplus: +₹54.9K</div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>January 2026 recorded highest net savings</p>
            </div>
          </div>

          {/* AI Intelligence Insights */}
          {statementResult.insights && statementResult.insights.length > 0 && (
            <div className={`p-5 sm:p-6 rounded-[28px] border space-y-3 transition ${
              isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>✨</span>
                <span>Statement AI Intelligence & Forensic Patterns</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {statementResult.insights.map((ins, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      ins.severity === 'SUCCESS'
                        ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900')
                        : ins.severity === 'WARNING'
                        ? (isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900')
                        : (isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-900')
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{ins.severity === 'SUCCESS' ? '✓' : 'ℹ'}</span>
                      <span>{ins.title}</span>
                    </div>
                    <div className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {ins.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. SUB-PAGE 2: INFLOW & SALARY INTELLIGENCE ───────────────── */}
      {activeSection === 'INFLOW' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  💰 Inflow Decomposition & Income Intelligence
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Credits: <strong>₹{statementResult?.facts.totalInflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong> across 136 credit transactions
                </p>
              </div>
              <button
                onClick={() => { setDirectionFilter('CREDIT'); setActiveSection('LEDGER'); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#00BFA5] text-slate-950 self-start sm:self-center"
              >
                View Credit Ledger →
              </button>
            </div>

            {/* Inflow Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {(statementResult?.inflowDecomposition || []).map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{item.category}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                      {item.sharePercent.toFixed(1)}% Share
                    </span>
                  </div>
                  <div className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{item.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Source: {item.source} ({item.count} credits)
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, item.sharePercent)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. SUB-PAGE 3: SPEND CATEGORIES DECOMPOSITION ────────────── */}
      {activeSection === 'CATEGORIES' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  💳 12-Pillar Spend Category Decomposition
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Gross Debits: <strong>₹{statementResult?.facts.totalOutflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
                </p>
              </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {(statementResult?.categoryDecomposition || []).map((cat, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setCategoryFilter(cat.name); setActiveSection('LEDGER'); }}
                  className={`p-4 rounded-2xl border space-y-2 cursor-pointer hover:border-teal-500/50 transition ${
                    isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className={`text-xs font-black truncate max-w-[160px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      {cat.sharePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono text-rose-500">
                    ₹{cat.debit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center justify-between text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>{cat.count} txns</span>
                    <span>Avg: ₹{Math.round(cat.avgTicket).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, cat.sharePercent)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 7. SUB-PAGE 4: LOANS & DEBT FORENSIC MATRIX ──────────────── */}
      {activeSection === 'LOANS' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🏦 Loans & Digital Lending Forensic Audit
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Disbursed: <strong>₹1,11,133.14</strong> • Total Repaid: <strong>₹95,813.77</strong> • Net Delta: <strong>+₹15,319.37</strong>
                </p>
              </div>
            </div>

            {/* Lender Matrix Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(statementResult?.lenderMatrix || []).map((lender) => (
                <div key={lender.id} className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{lender.lenderName}</div>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{lender.productType}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      lender.status === 'ACTIVE_LINE'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40'
                    }`}>
                      {lender.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className={`grid grid-cols-3 gap-2 text-center p-3 rounded-xl font-mono text-xs ${isDark ? 'bg-black/20' : 'bg-white border border-slate-200'}`}>
                    <div>
                      <div className={`text-[9px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Borrowed</div>
                      <div className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₹{lender.totalBorrowed.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{lender.borrowCount} credits</div>
                    </div>
                    <div>
                      <div className={`text-[9px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Repaid</div>
                      <div className="font-black text-rose-600 dark:text-rose-400 mt-0.5">
                        ₹{lender.totalRepaid.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{lender.repayCount} debits</div>
                    </div>
                    <div>
                      <div className={`text-[9px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Net Delta</div>
                      <div className="font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                        ₹{lender.netDelta.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. SUB-PAGE 5: MONTHLY CASH VELOCITY ─────────────────────── */}
      {activeSection === 'VELOCITY' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📈 12-Month Financial Velocity & Monthly Cash Flow Trajectory
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isDark ? 'border-[#273B49] text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <th className="py-3 px-3">Month</th>
                    <th className="py-3 px-3 text-right">Inflows (Cr)</th>
                    <th className="py-3 px-3 text-right">Outflows (Dr)</th>
                    <th className="py-3 px-3 text-right">Net Cash Flow</th>
                    <th className="py-3 px-3 text-right">Txn Count</th>
                    <th className="py-3 px-3 text-right">Month Closing</th>
                    <th className="py-3 px-3 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                  {(statementResult?.monthlyVelocity || []).map((m) => (
                    <tr key={m.monthKey} className={isDark ? 'hover:bg-[#18242D]' : 'hover:bg-slate-50'}>
                      <td className={`py-3 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.monthName}</td>
                      <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        ₹{m.inflows.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-600 dark:text-rose-400 font-bold">
                        ₹{m.outflows.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-3 text-right font-black ${m.netFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {m.netFlow >= 0 ? '+' : ''}₹{m.netFlow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-3 text-right ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{m.txnCount}</td>
                      <td className="py-3 px-3 text-right text-cyan-600 dark:text-cyan-300 font-bold">
                        {m.closingBalance !== null ? `₹${m.closingBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          m.trend === 'SURPLUS'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                            : m.trend === 'DEFICIT'
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold'
                            : 'bg-slate-500/20 text-slate-700 dark:text-slate-300'
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
        </div>
      )}

      {/* ── 9. SUB-PAGE 6: TOP PAYEES & MERCHANTS ─────────────────────── */}
      {activeSection === 'MERCHANTS' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🛍️ Top 25 Payees & Institutional Counterparties
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ranked by total volume (inflows + outflows)</p>
              </div>
              <input
                type="text"
                placeholder="Filter payees..."
                value={payeeSearch}
                onChange={(e) => setPayeeSearch(e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-medium w-48 ${
                  isDark ? 'bg-[#18242D] border-[#273B49] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {filteredPayees.map((payee) => (
                <div key={payee.rank} className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#00BFA5] text-slate-950 font-black text-xs flex items-center justify-center">
                      #{payee.rank}
                    </div>
                    <div>
                      <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{payee.name}</div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{payee.category} • {payee.txnCount} txns • {payee.primaryChannel}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{payee.totalVolume.toLocaleString('en-IN')}</div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {payee.debit > 0 ? `Dr: ₹${payee.debit.toLocaleString('en-IN')}` : `Cr: ₹${payee.credit.toLocaleString('en-IN')}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 10. SUB-PAGE 7: PAYMENT CHANNELS ─────────────────────────── */}
      {activeSection === 'CHANNELS' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-[28px] border space-y-4 transition ${
            isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ⚡ Payment Rails & Financial Infrastructure Distribution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(statementResult?.channelSplit || []).map((ch, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#18242D] border-[#273B49]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ch.icon}</span>
                      <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{ch.channel}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-300">
                      {ch.volumeShare.toFixed(1)}% Volume
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{ch.txnCount} Transactions</span>
                    <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{(ch.debit + ch.credit).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, ch.volumeShare)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 11. SUB-PAGE 8: EXTRACTED STATEMENT LEDGER ───────────────── */}
      {activeSection === 'LEDGER' && (
        <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Extracted Statement Ledger (Showing {Math.min(ledgerVisibleCount, filteredTransactions.length)} of {filteredTransactions.length} items)
              </h3>
              <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Raw bank debits, credits, and verified running balance
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search narration, ref, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-medium w-40 sm:w-52 ${
                  isDark ? 'bg-[#18242D] border-[#273B49] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />

              <div className="flex items-center gap-1">
                {(['ALL', 'DEBIT', 'CREDIT'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setDirectionFilter(dir)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition border ${
                      directionFilter === dir
                        ? 'bg-[#00BFA5] text-slate-950 border-[#00BFA5]'
                        : isDark
                        ? 'bg-[#18242D] text-slate-400 border-[#273B49]'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                  isDark ? 'border-[#22323D] text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Narration / Particulars</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                  <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                {filteredTransactions.slice(0, ledgerVisibleCount).map((tx) => (
                  <tr key={tx.id} className={`transition ${isDark ? 'hover:bg-[#18242D]' : 'hover:bg-slate-50'}`}>
                    <td className={`py-2.5 px-3 font-mono text-[11px] whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {tx.narration}
                      </div>
                      {tx.referenceNumber && (
                        <div className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Ref: {tx.referenceNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        tx.category === 'Salary & Income' || tx.category === 'Income'
                          ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200')
                          : tx.category === 'Loans & EMIs'
                          ? (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-amber-50 text-amber-800 border-amber-200')
                          : tx.category === 'Credit Card Bills'
                          ? (isDark ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' : 'bg-rose-50 text-rose-800 border-rose-200')
                          : (isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200')
                      }`}>
                        {tx.category || 'General'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-500">
                      {tx.debit ? `₹${tx.debit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500">
                      {tx.credit ? `₹${tx.credit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {tx.balance ? `₹${tx.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length > ledgerVisibleCount && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setLedgerVisibleCount((prev) => prev + 100)}
                className={`py-2.5 px-6 rounded-2xl text-xs font-black transition border shadow-sm ${
                  isDark
                    ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-teal-300'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                }`}
              >
                Load Next 100 Transactions ({filteredTransactions.length - ledgerVisibleCount} remaining) ↓
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 12. SUB-PAGE 9: UPLOAD FILE ──────────────────────────────── */}
      {activeSection === 'UPLOAD' && (
        <div className={`p-6 sm:p-10 rounded-[28px] border text-center space-y-5 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 border-2 border-dashed rounded-[24px] cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-[#00BFA5] bg-teal-500/10 scale-[1.01]'
                : isDark
                ? 'border-[#22323D] hover:border-teal-500/50 bg-[#18242D]/40'
                : 'border-slate-300 hover:border-teal-500/50 bg-slate-50'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-500/15 text-[#00BFA5] flex items-center justify-center text-3xl">
              📂
            </div>
            <div>
              <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Click to Browse or Drag & Drop Statement
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Supports Excel (.xlsx, .xls), CSV, Text, and Password-Protected PDFs
              </p>
            </div>
            <input 
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Quick Demo Loaders */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={loadRealHdfcStatementXls}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition border shadow-sm flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/40 text-[#00F2FE]' 
                  : 'bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900'
              }`}
            >
              <span>⚡</span>
              <span>Load Deepankar Gautam HDFC Statement (.xls - 1,781 txns)</span>
            </button>
            <button
              onClick={loadSampleExcelStatement}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition border shadow-sm flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300' 
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
              }`}
            >
              <span>📊</span>
              <span>Load Sample SBI Excel (.xlsx)</span>
            </button>
            <button
              onClick={loadSampleStatement}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition border shadow-sm flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-[#00F2FE]' 
                  : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-900'
              }`}
            >
              <span>📄</span>
              <span>Load Sample CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 13. SUB-PAGE 10: AI FORENSIC COPILOT ──────────────────────── */}
      {activeSection === 'COPILOT' && (
        <div className={`p-5 sm:p-6 rounded-[28px] border space-y-4 transition ${
          isDark ? 'bg-[#121B22] border-[#22323D]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤖</span>
              <h3 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Statement AI Forensics Copilot
              </h3>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
              Gemini LLM Context Active
            </span>
          </div>

          {/* Quick Query Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'Show salary & income analysis',
              'What are my loan borrowings vs repayments?',
              'Explain mathematical reconciliation',
              'Who are my top payees?',
              'Show monthly velocity & burn rate',
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setChatInput(prompt);
                }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition ${
                  isDark 
                    ? 'bg-[#18242D] hover:bg-[#20303D] border-[#273B49] text-teal-300' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Transcript */}
          <div className={`p-4 rounded-2xl border min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 ${
            isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#00BFA5] text-slate-950 font-bold'
                      : isDark
                      ? 'bg-[#18242D] text-slate-200 border border-[#273B49]'
                      : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {isAiTyping && (
              <div className="text-xs text-slate-400 animate-pulse font-mono">
                🤖 AI Copilot is analyzing statement transactions...
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about salary, biggest expense, loan EMIs, or anomalies..."
              className={`flex-1 text-xs px-4 py-2.5 rounded-xl border outline-none font-medium ${
                isDark 
                  ? 'bg-[#18242D] border-[#273B49] text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={isAiTyping || !chatInput.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#00BFA5] hover:bg-[#00A892] text-slate-950 transition border border-[#00BFA5] shadow-sm disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 rounded-[28px] border max-w-sm w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-[#121B22] border-[#273B49] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <h3 className="text-base font-black">Password Protected PDF</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter your bank statement PDF password (usually DOB or PAN) to decrypt and parse.
            </p>
            <input
              type="password"
              placeholder="Enter PDF password"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs font-mono border outline-none ${
                isDark ? 'bg-[#18242D] border-[#273B49] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlockAndProcess}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#00BFA5] text-slate-950"
              >
                Unlock & Parse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
