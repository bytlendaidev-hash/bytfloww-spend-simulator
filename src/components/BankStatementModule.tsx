import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  StatementPeriodFilter,
  ForensicLenderItem,
  ForensicRecipientItem,
  ComprehensiveForensicDataset,
  EMPTY_FORENSIC_DATA,
  generateForensicDataFromTransactions,
} from '../engine/statementForensicsData';
import { 
  FinancialEvent,
  StatementSection,
} from '../types';
import { 
  backendApiService, 
  BACKEND_ENVIRONMENTS,
  BackendEnvironment,
} from '../services/backendApi';
import { 
  processMultipleStatementFiles, 
  MultiStatementSession, 
  StatementFileSource,
  LiveAnalyticsResult,
  LiveLenderItem,
  LiveRecipientItem
} from '../engine/analyticsEngine';
import { MerchantLogoView } from './MerchantLogoView';
import { Where100WentChart } from './forensics/Where100WentChart';
import { TransactionExplorer } from './forensics/TransactionExplorer';
import { DebtFreedomSimulator } from './forensics/DebtFreedomSimulator';
import { MoneyFlowGraph } from './forensics/MoneyFlowGraph';
import { AnomalyRadarView } from './forensics/AnomalyRadarView';
import { PredictiveRunwayChart } from './forensics/PredictiveRunwayChart';
import { ForensicReportModal } from './forensics/ForensicReportModal';
import { RecurringAutopsyView } from './forensics/RecurringAutopsyView';
import { MerchantDnaView } from './forensics/MerchantDnaView';
import { FireRunwayTracker } from './forensics/FireRunwayTracker';
import { BrandLogoBadge } from './forensics/BrandLogoBadge';
import { VarianceHeatmapView } from './forensics/VarianceHeatmapView';
import { MasterLedgerCalendar } from './forensics/MasterLedgerCalendar';
import { P2PSocialGraphView } from './forensics/P2PSocialGraphView';
import { 
  sendForensicQueryToGemini, 
  DEFAULT_GEMINI_API_KEY, 
  ChatMessage 
} from '../services/aiCopilotService';

interface BankStatementModuleProps {
  isDark: boolean;
  onMergeTransactions?: (events: FinancialEvent[]) => void;
  onSelectEvent?: (event: FinancialEvent) => void;
  onSwitchToSmsModule?: () => void;
  activeSection?: StatementSection;
  onSelectSection?: (section: StatementSection) => void;
}


// Micro-sparkline SVG paths for hero cards
const EmeraldSparkline: React.FC<{ isDark: boolean }> = () => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 20 Q 20 5, 40 18 T 80 8 T 100 3"
      fill="none"
      className="stroke-jade-500"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 20 Q 20 5, 40 18 T 80 8 T 100 3 L 100 25 L 0 25 Z"
      className="fill-jade-500 opacity-10"
    />
  </svg>
);

const RoseSparkline: React.FC<{ isDark: boolean }> = () => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 8 Q 25 22, 50 10 T 80 20 T 100 15"
      fill="none"
      className="stroke-pulse-500"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 8 Q 25 22, 50 10 T 80 20 T 100 15 L 100 25 L 0 25 Z"
      className="fill-pulse-500 opacity-10"
    />
  </svg>
);

const PurpleSparkline: React.FC<{ isDark: boolean }> = () => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 18 Q 30 22, 60 8 T 100 4"
      fill="none"
      className="stroke-synapse-500"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 18 Q 30 22, 60 8 T 100 4 L 100 25 L 0 25 Z"
      className="fill-synapse-500 opacity-10"
    />
  </svg>
);

const CyanSparkline: React.FC<{ isDark: boolean }> = () => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 16 Q 30 18, 60 7 T 100 2"
      fill="none"
      className="stroke-telemetry-500"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 16 Q 30 18, 60 7 T 100 2 L 100 25 L 0 25 Z"
      className="fill-telemetry-500 opacity-10"
    />
  </svg>
);

export const BankStatementModule: React.FC<BankStatementModuleProps> = ({
  isDark,
  onMergeTransactions,
  onSwitchToSmsModule,
  activeSection: propActiveSection,
  onSelectSection: propOnSelectSection,
}) => {
  // Navigation Section (Controlled or Uncontrolled)
  const [internalSection, setInternalSection] = useState<StatementSection>('OVERVIEW');
  const activeSection = propActiveSection || internalSection;
  const setActiveSection = propOnSelectSection || setInternalSection;
  const [activeTabCategory, setActiveTabCategory] = useState<string>('ALL');

  // Multi-Statement Session & File State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [session, setSession] = useState<MultiStatementSession | null>(null);

  // Period Filter ('ALL_TIME' | 'CURRENT_FY' | 'FY_2025_26' | etc.)
  const [periodFilter, setPeriodFilter] = useState<StatementPeriodFilter>('ALL_TIME');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');

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

  // Drilldown Modals & Export Dossier
  const [selectedLender, setSelectedLender] = useState<ForensicLenderItem | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<ForensicRecipientItem | null>(null);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);

  // AI Copilot Chat State (Powered by Gemini 2.5 Flash)
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('bytfloww_gemini_api_key') || DEFAULT_GEMINI_API_KEY || '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      text: `👋 **Welcome to your BytFloww AI Forensic Copilot!**

I have direct, mathematical access to your multi-statement master ledger (reconciled across all imported accounts).

**Here are some analytical questions you can ask me right now:**
• *"Where is my money going most in a single month?"*
• *"How much interest/extra have I paid till now for loans?"*
• *"How much do I spend in daily spend across each month?"*
• *"What is my overall loan credits received till now?"*
• *"Explain the ₹80,000 EPFO withdrawal details"*
• *"Show corporate salary vs loan borrowings breakdown"*

You can also ask about specific dates, merchants, UTRs, or counterparties.`,
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Health check on env change
  useEffect(() => {
    checkHealth();
  }, [currentEnv]);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    const res = await backendApiService.checkHealth();
    setBackendStatus(res);
    setIsCheckingHealth(false);
  };

  const handleEnvChange = (env: BackendEnvironment) => {
    setCurrentEnv(env);
    backendApiService.setEnvironment(env);
    setTimeout(() => checkHealth(), 100);
  };

  // Master multi-file processor
  const handleProcessFiles = async (filesToAdd: File[]) => {
    if (!filesToAdd || filesToAdd.length === 0) return;

    // Combine with already uploaded files (filtering by name+size for initial uniqueness)
    const existingKeys = new Set(uploadedFiles.map(f => `${f.name}_${f.size}`));
    const newDistinct = filesToAdd.filter(f => !existingKeys.has(`${f.name}_${f.size}`));
    const allFiles = [...uploadedFiles, ...newDistinct];

    if (allFiles.length === 0) return;

    setUploadedFiles(allFiles);
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingProgress(10);
    setProcessingStage(`Ingesting ${allFiles.length} bank statement files...`);

    try {
      const resultSession = await processMultipleStatementFiles(allFiles, (stage, pct) => {
        setProcessingStage(stage);
        setProcessingProgress(pct);
      });

      setSession(resultSession);
      setIsProcessing(false);

      // Add AI welcome message with actual metrics
      if (resultSession.uniqueTransactions.length > 0) {
        const earliest = resultSession.coverage.earliestDate;
        const latest = resultSession.coverage.latestDate;
        const totalTxns = resultSession.uniqueTransactions.length;
        const credits = (resultSession.reconciliation.totalCredits / 100000).toFixed(2);
        const debits = (resultSession.reconciliation.totalDebits / 100000).toFixed(2);
        const salary = (resultSession.forensicDataset.salaryTotal / 100000).toFixed(2);

        setChatMessages(prev => [
          ...prev,
          {
            id: `msg_welcome_${Date.now()}`,
            role: 'assistant',
            text: `Processed ${allFiles.length} statement files: **${totalTxns} unique transactions** (${earliest} → ${latest}).\n• **Total Credits**: ₹${credits} Lakh (Salary: ₹${salary}L)\n• **Total Debits**: ₹${debits} Lakh\n• **Duplicates Filtered**: ${resultSession.duplicateTransactionsRemoved}\n\nAsk me anything about your salary, lenders, peer transfers, interest costs, or daily spend velocity!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    } catch (err: any) {
      console.error('Multi-statement processing failed:', err);
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Error processing bank statement files.');
    }
  };

  const handleRemoveFile = async (fileIndex: number) => {
    const remainingFiles = uploadedFiles.filter((_, idx) => idx !== fileIndex);
    setUploadedFiles(remainingFiles);

    if (remainingFiles.length === 0) {
      setSession(null);
      return;
    }

    setIsProcessing(true);
    try {
      const resultSession = await processMultipleStatementFiles(remainingFiles);
      setSession(resultSession);
    } catch (err: any) {
      setErrorMessage('Error reprocessing remaining statements.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setSession(null);
    setPeriodFilter('ALL_TIME');
    setAccountFilter('ALL');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(Array.from(e.target.files));
    }
  };

  const hasData = session && session.uniqueTransactions.length > 0;

  // Filtered forensic dataset
  const forensicData = useMemo(() => {
    if (!session || session.uniqueTransactions.length === 0) {
      return EMPTY_FORENSIC_DATA;
    }
    let txns = session.uniqueTransactions;
    if (accountFilter !== 'ALL') {
      txns = txns.filter(t => (t.entityNormalized || '').includes(accountFilter) || (t.referenceNumber || '').includes(accountFilter));
    }
    return generateForensicDataFromTransactions(txns, periodFilter);
  }, [session, periodFilter, accountFilter]);

  // AI Copilot query handler powered by Google Gemini 2.5 Flash
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = (presetText || chatInput).trim();
    if (!textToSend) return;
    setChatInput('');

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      if (!session || session.uniqueTransactions.length === 0) {
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg_a_${Date.now()}`,
            role: 'assistant',
            text: 'Please upload your bank statement files first so I can compute real analytical answers from your financial ledger.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsAiTyping(false);
        return;
      }

      const replyText = await sendForensicQueryToGemini(
        textToSend,
        forensicData,
        session.uniqueTransactions,
        chatMessages,
        geminiApiKey
      );

      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_a_${Date.now()}`,
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Error generating copilot reply:', err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_a_${Date.now()}`,
          role: 'assistant',
          text: 'An error occurred while analyzing your ledger. Please verify your connection or Gemini API key.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const cardCls = 'spatial-card';

  const availableFYs = useMemo(() => {
    return session?.coverage?.financialYearsCovered || [];
  }, [session]);

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP MULTI-FILE UPLOAD WORKSPACE & DROPZONE ──── */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`p-6 sm:p-8 rounded-[24px] border-2 border-dashed transition-all relative overflow-hidden text-center ${
          isDragging 
            ? 'border-jade-500 bg-jade-500/10 shadow-solid-md' 
            : hasData 
            ? 'border-abyss-border bg-abyss-card' 
            : 'border-abyss-borderStrong bg-abyss-card shadow-solid-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xls,.xlsx,.csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-center">
            <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center text-3xl shadow-solid-md transition-transform duration-200 bg-abyss-well border border-jade-500/40 text-jade-500 ${
              isDragging ? 'scale-110' : ''
            }`}>
              📑
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-abyss-textPrimary flex items-center justify-center gap-2">
              Byt<span className="text-jade-500 font-black">Lend</span> Multi-Statement Forensics Hub
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-lg mx-auto text-abyss-textSecondary font-medium">
              Drag & drop bank statements (XLS, XLSX, CSV) to unlock AI capital intelligence, loan recycling, salary cycles, and P2P audit trails.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="spatial-btn-selected px-6 py-3 rounded-full text-xs font-bold transition flex items-center gap-2"
            >
              <span>📥</span>
              <span>{hasData ? 'Add More Statement Files' : 'Select Bank Statements'}</span>
            </button>

            {hasData && (
              <button
                onClick={handleClearAll}
                className="spatial-btn px-4 py-3 text-xs text-pulse-500 font-semibold border-pulse-500/30"
              >
                Clear All Files
              </button>
            )}
          </div>
        </div>

        {/* Processing Progress Bar (Solid Sovereign Jade) */}
        {isProcessing && (
          <div className="max-w-md mx-auto mt-6 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-jade-500">{processingStage}</span>
              <span className="font-mono text-abyss-textMuted">{processingProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-abyss-canvas overflow-hidden border border-abyss-border">
              <div 
                className="h-full bg-jade-500 transition-all duration-300 rounded-full"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="max-w-md mx-auto mt-4 p-3.5 rounded-[14px] bg-pulse-500/10 border border-pulse-500/30 text-pulse-500 text-xs font-bold text-center">
            ⚠️ {errorMessage}
          </div>
        )}
      </div>

      {/* ── UPLOADED FILES WORKSPACE & COVERAGE STATUS (WHEN DATA LOADED) ── */}
      {hasData && (
        <div className="spatial-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base text-telemetry-500">📑</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-abyss-textPrimary">Statement Source Files ({session.files.length})</h2>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-3 py-1 rounded-full font-semibold border bg-abyss-well border-abyss-border text-abyss-textPrimary">
                Coverage: {session.coverage.status.replace(/_/g, ' ')} ({session.coverage.continuityScore}% Quality)
              </span>
              <span className="px-3 py-1 rounded-full font-semibold border bg-jade-500/10 text-jade-500 border-jade-500/30">
                {session.coverage.balanceContinuityStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Files Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {session.files.map((file, idx) => (
              <div 
                key={file.fileId || idx}
                className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">📄</span>
                    <span className="text-xs font-bold text-abyss-textPrimary truncate max-w-[180px]">{file.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-abyss-textMuted">
                    <span className="font-semibold text-abyss-textSecondary">{file.detectedBank}</span>
                    <span>•</span>
                    <span>{file.transactionCount} rows</span>
                    {file.duplicateTransactionCount > 0 && (
                      <span className="text-ochre-500 font-semibold">({file.duplicateTransactionCount} dupes)</span>
                    )}
                  </div>
                  {file.statementStartDate && file.statementEndDate && (
                    <div className="text-[9px] font-mono text-abyss-textMuted">
                      {file.statementStartDate} → {file.statementEndDate}
                    </div>
                  )}
                  {file.duplicateStatus === 'EXACT_FILE_DUPLICATE' && (
                    <div className="text-[10px] font-bold text-ochre-500">⚠️ Exact Duplicate (Skipped)</div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1.5 rounded-full border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted hover:text-abyss-textPrimary transition"
                  title="Remove this statement"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Session Overview Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-[14px] bg-abyss-well border border-abyss-border text-center">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Unique Valid Txns</div>
              <div className="text-lg font-bold font-mono mt-0.5 text-abyss-textPrimary">{session.uniqueTransactions.length.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3.5 rounded-[14px] bg-abyss-well border border-abyss-border text-center">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Dupes Excluded</div>
              <div className="text-lg font-bold font-mono mt-0.5 text-ochre-500">{session.duplicateTransactionsRemoved}</div>
            </div>
            <div className="p-3.5 rounded-[14px] bg-abyss-well border border-abyss-border text-center">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Months Covered</div>
              <div className="text-lg font-bold font-mono mt-0.5 text-telemetry-500">{session.coverage.totalMonths} mos</div>
            </div>
            <div className="p-3.5 rounded-[14px] bg-abyss-well border border-abyss-border text-center">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Date Span</div>
              <div className="text-xs font-bold font-mono mt-1 text-abyss-textPrimary truncate">{session.coverage.earliestDate} → {session.coverage.latestDate}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER & TAB BAR ORNAMENT (STICKY) ────────────────────────────── */}
      {hasData && (
        <div className="spatial-card p-3 sm:p-4 space-y-3 sticky top-2 z-30 shadow-solid-md bg-abyss-card/95 backdrop-blur-xl">
          {/* Top Bar: Category Group Pills + Period Selector & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Category Groups */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'ALL', label: '✨ All Sections' },
                { id: 'OVERVIEW', label: '⚡ Overview' },
                { id: 'CASHFLOW', label: '👥 P2P & Cashflow' },
                { id: 'DEBT', label: '🏦 Loans & Debt' },
                { id: 'MERCHANTS', label: '🛍️ Merchants' },
                { id: 'AUDITS', label: '🚨 Audits & AI' },
              ].map((cg) => (
                <button
                  key={cg.id}
                  onClick={() => setActiveTabCategory(cg.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    activeTabCategory === cg.id
                      ? 'btn-neon-action shadow-neon-cyan text-white'
                      : 'bg-abyss-well text-abyss-textSecondary hover:text-abyss-textPrimary border border-abyss-border'
                  }`}
                >
                  {cg.label}
                </button>
              ))}
            </div>

            {/* Dynamic Period Selector & Export Dossier Action Button */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <button
                onClick={() => setShowReportModal(true)}
                className="spatial-btn px-3 py-1.5 text-xs font-bold text-abyss-textPrimary flex items-center gap-1.5 border-cyan-500/30 text-cyan-400"
                title="Open Boardroom PDF Dossier & Export CSV"
              >
                <span>📄</span>
                <span>Export Dossier</span>
              </button>
              <span className="text-xs font-semibold text-abyss-textMuted hidden md:inline">Period:</span>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as StatementPeriodFilter)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-abyss-well border border-abyss-border text-abyss-textPrimary outline-none cursor-pointer"
              >
                <option value="ALL_TIME" className="bg-abyss-card text-abyss-textPrimary">All Data ({session.coverage.totalMonths} Mos)</option>
                <option value="CURRENT_FY" className="bg-abyss-card text-abyss-textPrimary">Current FY</option>
                {availableFYs.map(fy => (
                  <option key={fy} value={`FY_${fy.replace(/[^0-9]/g, '_')}`} className="bg-abyss-card text-abyss-textPrimary">{fy}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-Tabs Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-abyss-border/60">
            {[
              { id: 'OVERVIEW', label: '📊 Overview', group: 'OVERVIEW' },
              { id: 'PEOPLE', label: '👥 P2P & UPI Transfers', group: 'CASHFLOW' },
              { id: 'INFLOW', label: '💰 Income & Salary', group: 'CASHFLOW' },
              { id: 'DEBITS', label: '💳 14-Cat Debits', group: 'CASHFLOW' },
              { id: 'LEDGER', label: '📋 Master Ledger', group: 'CASHFLOW' },
              { id: 'WHERE_100_WENT', label: '🎯 Where ₹100 Went', group: 'OVERVIEW' },
              { id: 'MONEY_FLOW', label: '🕸️ Money Flow', group: 'OVERVIEW' },
              { id: 'PREDICTIVE_RUNWAY', label: '📉 Cash Runway', group: 'OVERVIEW' },
              { id: 'FIRE_RUNWAY', label: '🎯 FIRE & Emergency', group: 'OVERVIEW' },
              { id: 'LOANS', label: '🏦 Loan Forensics', group: 'DEBT' },
              { id: 'DEBT_SIMULATOR', label: '🧮 Debt Freedom Simulator', group: 'DEBT' },
              { id: 'SUBSCRIPTIONS_AUTOPSY', label: '🔄 Subscriptions Autopsy', group: 'DEBT' },
              { id: 'RATIOS', label: '⚖️ 7 Health Ratios', group: 'DEBT' },
              { id: 'MERCHANT_DNA', label: '🛍️ Merchant DNA', group: 'MERCHANTS' },
              { id: 'VELOCITY', label: '📈 16-Mo Velocity', group: 'MERCHANTS' },
              { id: 'VARIANCE_HEATMAP', label: '📊 MoM Variance', group: 'MERCHANTS' },
              { id: 'SPEND_CALENDAR', label: '📅 Spend Calendar', group: 'MERCHANTS' },
              { id: 'ANOMALY_RADAR', label: '🚨 Anomaly Radar', group: 'AUDITS' },
              { id: 'AUDIT', label: '🛡️ Audit Notes', group: 'AUDITS' },
              { id: 'AI_AGENT', label: '🤖 AI Copilot', group: 'AUDITS', badge: 'Gemini' },
            ]
              .filter((tab) => activeTabCategory === 'ALL' || tab.group === activeTabCategory)
              .map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as StatementSection)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeSection === tab.id
                      ? 'btn-neon-action shadow-neon-cyan text-white'
                      : 'bg-abyss-well/70 text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-well border border-abyss-border/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-400">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ── 1. SECTION: EXECUTIVE SUMMARY (OVERVIEW) ────────────────────── */}
      {hasData && activeSection === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Reconciled Executive KPI Command Center Grid with Dynamic Sparklines */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Total Inflow */}
            <div className="spatial-card p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-jade-500 tracking-wider">Total Inflow</span>
                <span className="text-xs">↗️</span>
              </div>
              <div className="text-base sm:text-xl font-bold font-mono mt-1 text-jade-500 tracking-tight">
                ₹{forensicData.totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 18 Q 20 8, 40 16 T 80 6 T 100 4" fill="none" className="stroke-jade-500" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-medium text-abyss-textMuted flex items-center justify-between">
                <span>{forensicData.totalTransactions} txns</span>
                <span className="text-jade-500 font-bold">+100%</span>
              </div>
            </div>

            {/* 2. Total Outflow */}
            <div className="spatial-card p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-pulse-500 tracking-wider">Total Outflow</span>
                <span className="text-xs">↘️</span>
              </div>
              <div className="text-base sm:text-xl font-bold font-mono mt-1 text-pulse-500 tracking-tight">
                ₹{forensicData.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 6 Q 20 18, 40 10 T 80 20 T 100 16" fill="none" className="stroke-pulse-500" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-medium text-abyss-textMuted flex items-center justify-between">
                <span>Outflow</span>
                <span className="text-pulse-500 font-bold">-100%</span>
              </div>
            </div>

            {/* 3. True Lifestyle Spend */}
            <div className="spatial-card p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-abyss-textSecondary tracking-wider">Lifestyle Spend</span>
                <span className="text-xs">🛍️</span>
              </div>
              <div className="text-base sm:text-xl font-bold font-mono mt-1 text-abyss-textPrimary tracking-tight">
                ₹{forensicData.trueLifestyleTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 14 Q 25 20, 50 10 T 75 14 T 100 8" fill="none" className="stroke-telemetry-500" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-medium text-abyss-textMuted flex items-center justify-between">
                <span>Food & Retail</span>
                <span className="font-bold text-abyss-textPrimary">{forensicData.trueLifestyleShare.toFixed(1)}%</span>
              </div>
            </div>

            {/* 4. Money Movement & Debt */}
            <div className="spatial-card p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-synapse-500 tracking-wider">Money Movement</span>
                <span className="text-xs">🔄</span>
              </div>
              <div className="text-base sm:text-xl font-bold font-mono mt-1 text-synapse-500 tracking-tight">
                ₹{forensicData.moneyMovementTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 10 Q 30 4, 60 16 T 90 8 T 100 12" fill="none" className="stroke-synapse-500" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-medium text-abyss-textMuted flex items-center justify-between">
                <span>Transfers & Debt</span>
                <span className="font-bold text-synapse-500">{forensicData.moneyMovementShare.toFixed(1)}%</span>
              </div>
            </div>

            {/* 5. Corporate Earned Salary */}
            <div className="spatial-card p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-telemetry-500 tracking-wider">Corporate Salary</span>
                <span className="text-xs">💼</span>
              </div>
              <div className="text-base sm:text-xl font-bold font-mono mt-1 text-abyss-textPrimary tracking-tight">
                ₹{forensicData.salaryTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 16 Q 20 6, 40 14 T 80 4 T 100 2" fill="none" className="stroke-telemetry-500" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-medium text-abyss-textMuted flex items-center justify-between">
                <span>Verified Payroll</span>
                <span className="text-abyss-textPrimary font-bold">17 Cycles</span>
              </div>
            </div>

            {/* 6. Period Net Cash Flow */}
            <div className="spatial-card p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-abyss-textMuted">Net Cash Flow</span>
                <span className="text-xs">{forensicData.netCashFlow >= 0 ? '📈' : '📉'}</span>
              </div>
              <div className={`text-base sm:text-xl font-bold font-mono mt-1 tracking-tight ${forensicData.netCashFlow >= 0 ? 'text-jade-500' : 'text-pulse-500'}`}>
                {forensicData.netCashFlow >= 0 ? '+' : ''}₹{forensicData.netCashFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 12 Q 30 18, 50 8 T 80 14 T 100 16" fill="none" className={forensicData.netCashFlow >= 0 ? 'stroke-jade-500' : 'stroke-pulse-500'} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-medium flex items-center justify-between">
                <span className="text-abyss-textMuted">Period Delta</span>
                <span className={`font-bold px-1.5 py-0.2 rounded-full ${forensicData.netCashFlow >= 0 ? 'bg-jade-500/20 text-jade-500' : 'bg-pulse-500/20 text-pulse-500'}`}>
                  {forensicData.netCashFlow >= 0 ? 'SURPLUS' : 'DEFICIT'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Where ₹100 Went Preview */}
          <Where100WentChart liveResult={session.analytics} isDark={isDark} />

          {/* Top Problems and Immediate Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="spatial-card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase text-pulse-500 flex items-center gap-2">
                <span>⚠️</span>
                <span>Top Forensic Vulnerabilities</span>
              </h3>
              <div className="space-y-2">
                {forensicData.topProblems.map((prob, idx) => (
                  <div key={idx} className="p-3.5 rounded-[12px] bg-pulse-500/10 border border-pulse-500/20 text-abyss-textPrimary text-xs font-semibold flex items-start gap-2.5">
                    <span className="font-mono text-pulse-500 font-bold">{idx + 1}.</span>
                    <span>{prob}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="spatial-card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase text-jade-500 flex items-center gap-2">
                <span>🎯</span>
                <span>Prioritized Action Plan</span>
              </h3>
              <div className="space-y-2">
                {forensicData.topActions.map((act, idx) => (
                  <div key={idx} className="p-3.5 rounded-[12px] bg-jade-500/10 border border-jade-500/20 text-abyss-textPrimary text-xs font-semibold flex items-start gap-2.5">
                    <span className="font-mono text-jade-500 font-bold">{idx + 1}.</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ── 2B. SECTION: INTERACTIVE MONEY FLOW NETWORK ────────────────── */}
      {hasData && activeSection === 'MONEY_FLOW' && (
        <MoneyFlowGraph dataset={forensicData} isDark={isDark} />
      )}

      {/* ── 2C. SECTION: DEBT FREEDOM & HIDDEN APR SIMULATOR ─────────────── */}
      {hasData && activeSection === 'DEBT_SIMULATOR' && (
        <DebtFreedomSimulator
          dataset={forensicData}
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

      {/* ── 2D. SECTION: AUTOMATED ANOMALY & RED-FLAG RADAR ──────────────── */}
      {hasData && activeSection === 'ANOMALY_RADAR' && (
        <AnomalyRadarView
          dataset={forensicData}
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

            {/* ── 2F. SECTION: RECURRING SUBSCRIPTIONS AUTOPSY ───────────────── */}
      {hasData && activeSection === 'SUBSCRIPTIONS_AUTOPSY' && (
        <RecurringAutopsyView
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

      {/* ── 2G. SECTION: MERCHANT DNA PROFILE & CONVENIENCE BURN ─────────── */}
      {hasData && activeSection === 'MERCHANT_DNA' && (
        <MerchantDnaView
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

            {/* ── 2I. SECTION: MULTI-MONTH COMPARATIVE VARIANCE HEATMAP ──────── */}
      {hasData && activeSection === 'VARIANCE_HEATMAP' && (
        <VarianceHeatmapView
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

      {/* ── 2H. SECTION: EMERGENCY FUND & FIRE RUNWAY TRACKER ───────────── */}
      {hasData && activeSection === 'FIRE_RUNWAY' && (
        <FireRunwayTracker
          dataset={forensicData}
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

      {/* ── 2E. SECTION: DAILY BALANCE & 90-DAY PREDICTIVE RUNWAY ────────── */}
      {hasData && activeSection === 'PREDICTIVE_RUNWAY' && (
        <PredictiveRunwayChart
          dataset={forensicData}
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

      {/* ── 2. SECTION: WHERE EVERY ₹100 WENT ──────────────────────────── */}
      {hasData && activeSection === 'WHERE_100_WENT' && (
        <Where100WentChart liveResult={session.analytics} isDark={isDark} />
      )}

      {/* ── 3. SECTION: LOAN & DEBT FORENSICS ──────────────────────────── */}
      {hasData && activeSection === 'LOANS' && (
        <div className="space-y-6">
          {/* Summary Cards for Loans */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Borrowed</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-jade-500">
                ₹{forensicData.lenders.reduce((s, l) => s + l.totalBorrowed, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">{forensicData.lenders.reduce((s, l) => s + l.borrowCount, 0)} disbursals</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Repaid</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-pulse-500">
                ₹{forensicData.lenders.reduce((s, l) => s + l.totalRepaid, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">{forensicData.lenders.reduce((s, l) => s + l.repayCount, 0)} repayments</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Net Debt Delta</div>
              <div className={`text-lg sm:text-xl font-bold font-mono mt-1 ${forensicData.lenders.reduce((s, l) => s + l.netDelta, 0) >= 0 ? 'text-jade-500' : 'text-pulse-500'}`}>
                {forensicData.lenders.reduce((s, l) => s + l.netDelta, 0) >= 0 ? '+' : ''}₹{forensicData.lenders.reduce((s, l) => s + l.netDelta, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">Borrowed vs Repaid</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Serviced Lenders</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-ochre-500">
                {forensicData.lenders.length} Entities
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">Active / Serviced</div>
            </div>
          </div>

          <div className="spatial-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
                  <span>🏦</span>
                  <span>Lender & Debt Servicing Matrix ({forensicData.lenders.length} Lenders)</span>
                </h2>
                <p className="text-xs text-abyss-textSecondary mt-0.5">
                  Tracking loan credits vs repayments and revolving loan recycling ratios.
                </p>
              </div>
            </div>

            <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider">
                  <tr className="border-b border-abyss-border">
                    <th className="p-3.5">Lender / Facility</th>
                    <th className="p-3.5 text-right">Total Borrowed</th>
                    <th className="p-3.5 text-right">Total Repaid</th>
                    <th className="p-3.5 text-right">Net Delta</th>
                    <th className="p-3.5 text-center">Txns (B/R)</th>
                    <th className="p-3.5 text-center">Recycling Risk</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-abyss-border">
                  {forensicData.lenders.map((l) => (
                    <tr key={l.id} className="hover:bg-abyss-elevated transition-colors">
                      <td className="p-3.5 font-semibold text-abyss-textPrimary">
                        <div className="flex items-center gap-2.5">
                          <BrandLogoBadge entityName={l.name} size="sm" />
                          <div>
                            <div className="font-bold text-abyss-textPrimary">{l.name}</div>
                            <div className="text-[10px] text-abyss-textMuted">{l.productType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-jade-500">
                        ₹{l.totalBorrowed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-pulse-500">
                        ₹{l.totalRepaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`p-3.5 text-right font-mono font-bold ${l.netDelta >= 0 ? 'text-jade-500' : 'text-pulse-500'}`}>
                        {l.netDelta >= 0 ? '+' : ''}₹{l.netDelta.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3.5 text-center font-mono text-[11px] text-abyss-textSecondary">
                        {l.borrowCount} / {l.repayCount}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          l.recyclingRisk === 'HIGH' ? 'bg-pulse-500/20 text-pulse-500' : l.recyclingRisk === 'MODERATE' ? 'bg-ochre-500/20 text-ochre-500' : 'bg-jade-500/20 text-jade-500'
                        }`}>
                          {l.recyclingRisk}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono text-[10px] text-abyss-textMuted">
                        {l.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 2J. SECTION: REAL-TIME SPEND & INFLOW FINANCIAL CALENDAR ───── */}
      {hasData && activeSection === 'SPEND_CALENDAR' && (
        <MasterLedgerCalendar
          transactions={session.uniqueTransactions}
          selectedDate={calendarSelectedDate}
          onSelectDate={setCalendarSelectedDate}
          isDark={isDark}
          onFilterLedgerToDate={(date) => {
            setCalendarSelectedDate(date);
            setActiveSection('LEDGER');
          }}
        />
      )}

      {/* ── 4. SECTION: MASTER TRANSACTION LEDGER ──────────────────────── */}
      {hasData && activeSection === 'LEDGER' && (
        <TransactionExplorer 
          liveResult={session.analytics} 
          isDark={isDark} 
          initialDate={calendarSelectedDate}
          onDateChange={setCalendarSelectedDate}
        />
      )}

      {/* ── 5. SECTION: P2P RECIPIENT INTELLIGENCE & RECIPROCAL MATRIX ─── */}
      {hasData && activeSection === 'PEOPLE' && (
        <P2PSocialGraphView
          transactions={session.uniqueTransactions}
          isDark={isDark}
        />
      )}

      {/* ── 6. SECTION: 16-MONTH VELOCITY ───────────────────────────────── */}
      {hasData && activeSection === 'VELOCITY' && (
        <div className="space-y-6">
          {/* Summary Cards for Velocity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Period Inflow</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-jade-500">
                ₹{forensicData.totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">Avg: ₹{Math.round(forensicData.totalCredits / Math.max(1, forensicData.monthlyCashFlow.length)).toLocaleString('en-IN')}/mo</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Period Outflow</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-pulse-500">
                ₹{forensicData.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">Avg: ₹{Math.round(forensicData.totalDebits / Math.max(1, forensicData.monthlyCashFlow.length)).toLocaleString('en-IN')}/mo</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Net Period Cash Flow</div>
              <div className={`text-lg sm:text-xl font-bold font-mono mt-1 ${forensicData.netCashFlow >= 0 ? 'text-jade-500' : 'text-pulse-500'}`}>
                {forensicData.netCashFlow >= 0 ? '+' : ''}₹{forensicData.netCashFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">Overall Surplus/Deficit</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Monthly Balance Health</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-abyss-textPrimary">
                {forensicData.monthlyCashFlow.filter(m => !m.isDeficit).length} Surplus / {forensicData.monthlyCashFlow.filter(m => m.isDeficit).length} Deficit
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">Across {forensicData.monthlyCashFlow.length} recorded months</div>
            </div>
          </div>

          <div className="spatial-card p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
              <span>📈</span>
              <span>Monthly Cash Flow Velocity Table</span>
            </h2>
            <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider">
                  <tr className="border-b border-abyss-border">
                    <th className="p-3.5">Month</th>
                    <th className="p-3.5">FY</th>
                    <th className="p-3.5 text-right">Credits</th>
                    <th className="p-3.5 text-right">Debits</th>
                    <th className="p-3.5 text-right">Net Flow</th>
                    <th className="p-3.5 text-right">Salary</th>
                    <th className="p-3.5 text-right">Debt Repaid</th>
                    <th className="p-3.5 text-right">Lifestyle</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-abyss-border">
                  {forensicData.monthlyCashFlow.map((m) => (
                    <tr key={m.monthKey} className="hover:bg-abyss-elevated transition-colors">
                      <td className="p-3.5 font-bold text-abyss-textPrimary">{m.monthName}</td>
                      <td className="p-3.5 font-mono text-[10px] text-abyss-textMuted">{m.financialYear}</td>
                      <td className="p-3.5 text-right font-mono text-jade-500">₹{m.totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3.5 text-right font-mono text-pulse-500">₹{m.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className={`p-3.5 text-right font-mono font-bold ${m.netCashFlow >= 0 ? 'text-jade-500' : 'text-pulse-500'}`}>
                        ₹{m.netCashFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3.5 text-right font-mono text-abyss-textSecondary">₹{m.salary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3.5 text-right font-mono text-pulse-500/80">₹{m.loanRepaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3.5 text-right font-mono text-abyss-textSecondary">₹{m.lifestyleSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          m.isDeficit ? 'bg-pulse-500/20 text-pulse-500' : 'bg-jade-500/20 text-jade-500'
                        }`}>
                          {m.isDeficit ? 'DEFICIT' : 'SURPLUS'}
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

      {/* ── 7. SECTION: 7 FINANCIAL HEALTH RATIOS ────────────────────────── */}
      {hasData && activeSection === 'RATIOS' && (
        <div className="spatial-card p-6 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
            <span>⚖️</span>
            <span>7 Financial Health & Risk Ratios</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forensicData.ratios.map((r, idx) => (
              <div key={idx} className="p-5 rounded-[16px] bg-abyss-well border border-abyss-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-abyss-textPrimary">{r.ratioName}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    r.status === 'CRITICAL' ? 'bg-pulse-500/20 text-pulse-500' : r.status === 'MODERATE' ? 'bg-ochre-500/20 text-ochre-500' : 'bg-jade-500/20 text-jade-500'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-abyss-textPrimary">{r.currentValue}%</span>
                  <span className="text-[10px] text-abyss-textMuted">Benchmark: {r.benchmark}</span>
                </div>
                <div className="text-[10px] text-abyss-textMuted">{r.formula}</div>
                <div className="text-xs text-abyss-textSecondary leading-relaxed">{r.assessment}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 8. SECTION: 14-CATEGORY DEBIT BREAKDOWN ─────────────────────── */}
      {hasData && activeSection === 'DEBITS' && (
        <div className="space-y-6">
          {/* Summary Cards for Debits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Total Outflow</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-pulse-500">
                ₹{forensicData.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">100% of Reconciled Outflow</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textSecondary">True Lifestyle Spend</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-abyss-textPrimary">
                ₹{forensicData.trueLifestyleTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">{forensicData.trueLifestyleShare.toFixed(1)}% of Debits</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-synapse-500">Money Movement</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-synapse-500">
                ₹{forensicData.moneyMovementTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">{forensicData.moneyMovementShare.toFixed(1)}% (Transfers & Debt)</div>
            </div>
            <div className="spatial-card p-4 sm:p-5">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Categories Tracked</div>
              <div className="text-lg sm:text-xl font-bold font-mono mt-1 text-abyss-textPrimary">
                {forensicData.debitBreakdown.length} Categories
              </div>
              <div className="text-[10px] text-abyss-textMuted mt-0.5">Ranked by volume</div>
            </div>
          </div>

          <div className="spatial-card p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
              <span>💳</span>
              <span>14-Category Debit Breakdown</span>
            </h2>
            <div className="space-y-3">
              {forensicData.debitBreakdown.map((d) => (
                <div key={d.rank} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-2 text-abyss-textPrimary">
                      <span>{d.icon}</span>
                      <span>{d.category}</span>
                      {d.isLifestyle && <span className="text-[9px] px-2 py-0.5 rounded-full bg-abyss-well text-abyss-textPrimary border border-abyss-border font-bold">LIFESTYLE</span>}
                    </span>
                    <span className="font-mono font-bold text-abyss-textPrimary">₹{d.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({d.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-abyss-well overflow-hidden border border-abyss-border">
                    <div className="h-full rounded-full bg-pulse-500" style={{ width: `${Math.max(1, d.percentage)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. SECTION: INCOME & SALARY DECOMPOSITION ───────────────────── */}
      {hasData && activeSection === 'INFLOW' && (
        <div className="space-y-6">
          <div className="spatial-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
                  <span>💰</span>
                  <span>Inflow & Ingress Decomposition</span>
                </h2>
                <p className="text-xs text-abyss-textSecondary mt-0.5">
                  Strict segregation of Earned Corporate Salary, EPFO / PF Capital Withdrawals, and Borrowed Debt Disbursals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Earned Salary</div>
                <div className="text-lg font-bold font-mono mt-1 text-jade-500">₹{forensicData.salaryTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-abyss-textMuted mt-0.5">17 Payroll Cycles</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-telemetry-500">EPFO / PF Claims</div>
                <div className="text-lg font-bold font-mono mt-1 text-telemetry-500">₹{forensicData.epfoCreditsTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-abyss-textMuted mt-0.5">Statutory Inflow</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-jade-500">Savings Bank Interest</div>
                <div className="text-lg font-bold font-mono mt-1 text-jade-500">₹{forensicData.interestCreditsTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-abyss-textMuted mt-0.5">{forensicData.bankInterestCredits.length} Credits</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-pulse-500">Bank Fees & Charges</div>
                <div className="text-lg font-bold font-mono mt-1 text-pulse-500">₹{forensicData.bankChargesTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-abyss-textMuted mt-0.5">{forensicData.bankChargesCount} Deductions</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-ochre-500">Loan Disbursals</div>
                <div className="text-lg font-bold font-mono mt-1 text-ochre-500">₹{forensicData.loanCreditsTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-abyss-textMuted mt-0.5">Borrowed Debt</div>
              </div>
              <div className="p-4 rounded-[14px] bg-abyss-well border border-abyss-border">
                <div className="text-[10px] font-bold uppercase text-abyss-textMuted">Refunds & Reversals</div>
                <div className="text-lg font-bold font-mono mt-1 text-abyss-textPrimary">₹{forensicData.refundsReversalsTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-abyss-textMuted mt-0.5">Non-operating</div>
              </div>
            </div>

            {/* Dedicated EPFO / PF Ledger Table */}
            <div className="mt-6 pt-4 border-t border-abyss-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base text-telemetry-500">🏛️</span>
                  <h3 className="text-sm font-bold text-abyss-textPrimary">Provident Fund (EPFO) Claims & Capital Withdrawals</h3>
                </div>
                <span className="text-xs font-mono font-bold text-telemetry-500">
                  Total: ₹{forensicData.epfoCreditsTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider">
                    <tr className="border-b border-abyss-border">
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Narration / Claim Reference</th>
                      <th className="p-3.5 text-right">Amount</th>
                      <th className="p-3.5 text-right">Balance After</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-abyss-border">
                    {session.uniqueTransactions.filter(t => t.category === 'EPFO_PF').map((epfTx) => (
                      <tr key={epfTx.id} className="hover:bg-abyss-elevated transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">{epfTx.transactionDate}</td>
                        <td className="p-3.5 font-semibold max-w-[300px]">
                          <div className="truncate text-abyss-textPrimary">{epfTx.rawNarration}</div>
                          {epfTx.referenceNumber && (
                            <div className="text-[10px] font-mono text-abyss-textMuted">Ref / UTR: {epfTx.referenceNumber}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-telemetry-500 text-sm">
                          +₹{epfTx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right font-mono text-abyss-textSecondary">
                          {epfTx.balanceAfter != null ? `₹${epfTx.balanceAfter.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-telemetry-500/20 text-telemetry-500 border border-telemetry-500/30">
                            SETTLED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dedicated Bank Savings Interest Audit Table */}
            <div className="mt-6 pt-4 border-t border-abyss-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base text-jade-500">💰</span>
                  <h3 className="text-sm font-bold text-abyss-textPrimary">Bank Savings Account Interest Added by Bank</h3>
                </div>
                <span className="text-xs font-mono font-bold text-jade-500">
                  Total Interest Earned: ₹{forensicData.interestCreditsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider">
                    <tr className="border-b border-abyss-border">
                      <th className="p-3.5">Payout Date</th>
                      <th className="p-3.5">Quarter Period</th>
                      <th className="p-3.5">Bank Narration</th>
                      <th className="p-3.5 text-right">Interest Credited</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-abyss-border">
                    {forensicData.bankInterestCredits.map((intTx, idx) => (
                      <tr key={idx} className="hover:bg-abyss-elevated transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">{intTx.date}</td>
                        <td className="p-3.5 font-bold text-abyss-textPrimary">{intTx.quarterLabel}</td>
                        <td className="p-3.5 font-mono text-[10px] text-abyss-textMuted">{intTx.narration}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-jade-500 text-sm">
                          +₹{intTx.amount.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-jade-500/20 text-jade-500 border border-jade-500/30">
                            CREDITED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dedicated Bank Fees & Charges Deducted Audit Table */}
            <div className="mt-6 pt-4 border-t border-abyss-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base text-pulse-500">🏦</span>
                  <h3 className="text-sm font-bold text-abyss-textPrimary">Bank Service Charges & Penalty Fees Deducted</h3>
                </div>
                <span className="text-xs font-mono font-bold text-pulse-500">
                  Total Bank Charges: ₹{forensicData.bankChargesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-abyss-well border border-abyss-border rounded-[16px] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-abyss-well text-abyss-textMuted text-[10px] font-bold uppercase tracking-wider">
                    <tr className="border-b border-abyss-border">
                      <th className="p-3.5">Deduction Date</th>
                      <th className="p-3.5">Fee / Charge Classification</th>
                      <th className="p-3.5">Bank Narration</th>
                      <th className="p-3.5 text-right">Fee Deducted</th>
                      <th className="p-3.5 text-center">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-abyss-border">
                    {forensicData.bankChargesList.map((chgTx, idx) => (
                      <tr key={idx} className="hover:bg-abyss-elevated transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-abyss-textMuted whitespace-nowrap">{chgTx.date}</td>
                        <td className="p-3.5 font-bold text-abyss-textPrimary">{chgTx.chargeType}</td>
                        <td className="p-3.5 font-mono text-[10px] text-abyss-textMuted">{chgTx.narration}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-pulse-500 text-sm">
                          -₹{chgTx.amount.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            chgTx.amount >= 500 ? 'bg-pulse-500/20 text-pulse-500 border border-pulse-500/30' : 'bg-ochre-500/20 text-ochre-500 border border-ochre-500/30'
                          }`}>
                            {chgTx.amount >= 500 ? 'HIGH PENALTY' : 'NOMINAL FEE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. SECTION: RECONCILIATION AUDIT NOTES ───────────────────────── */}
      {hasData && activeSection === 'AUDIT' && (
        <div className="spatial-card p-6 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
            <span>🛡️</span>
            <span>Forensic Ledger Audit & Integrity Notes</span>
          </h2>
          <div className="space-y-3">
            <div className="p-5 rounded-[16px] bg-abyss-well border border-abyss-border text-xs leading-relaxed space-y-1.5">
              <div className="font-bold text-jade-500">1. Cryptographic File Fingerprinting (SHA-256)</div>
              <p className="text-abyss-textSecondary">
                All uploaded statement files are cryptographically fingerprinted using client-side SHA-256. Exact duplicate files uploaded concurrently or in separate sessions are rejected with zero double-counting.
              </p>
            </div>
            <div className="p-5 rounded-[16px] bg-abyss-well border border-abyss-border text-xs leading-relaxed space-y-1.5">
              <div className="font-bold text-telemetry-500">2. Single Source of Truth Ledger Reconciliation</div>
              <p className="text-abyss-textSecondary">
                Opening Balance (₹{forensicData.openingBalance?.toFixed(2) || '0.00'}) + Total Inflow (₹{forensicData.totalCredits.toFixed(2)}) - Total Outflow (₹{forensicData.totalDebits.toFixed(2)}) = Closing Balance (₹{forensicData.closingBalance?.toFixed(2) || '0.00'}).
              </p>
            </div>
            <div className="p-5 rounded-[16px] bg-abyss-well border border-abyss-border text-xs leading-relaxed space-y-1.5">
              <div className="font-bold text-jade-500">3. Cross-File Lineage & Provenance</div>
              <p className="text-abyss-textSecondary">
                Every transaction retains exact file origin tracking. Overlapping statements generated zero artificial duplicate transactions in master aggregates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. SECTION: AI FORENSIC COPILOT ────────────────────────────── */}
      {hasData && activeSection === 'AI_AGENT' && (
        <div className="space-y-4">
          <div className="spatial-card p-6 space-y-4">
            {/* Header with Engine Status & API Key Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-abyss-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-abyss-well border border-abyss-border flex items-center justify-center text-xl shadow-solid-sm">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-abyss-textPrimary">AI Forensic Copilot</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-jade-500/20 text-jade-500 border border-jade-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse" />
                      Gemini 2.5 Flash Active
                    </span>
                  </div>
                  <p className="text-xs text-abyss-textMuted mt-0.5">
                    Real-data personal financial auditor querying {session.uniqueTransactions.length.toLocaleString('en-IN')} ledger transactions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiKeyModal(!showApiKeyModal)}
                  className="spatial-btn px-3.5 py-1.5 text-xs font-semibold text-abyss-textSecondary hover:text-abyss-textPrimary"
                  title="Configure Gemini API Key"
                >
                  <span>🔑</span>
                  <span>API Key Config</span>
                </button>
                <button
                  onClick={() => setChatMessages([
                    {
                      id: `clear_${Date.now()}`,
                      role: 'assistant',
                      text: 'Chat history cleared. How can I assist with your financial ledger analysis today?',
                      timestamp: 'Just now',
                    }
                  ])}
                  className="spatial-btn px-3.5 py-1.5 text-xs font-semibold text-abyss-textSecondary hover:text-abyss-textPrimary"
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* API Key Modal / Drawer */}
            {showApiKeyModal && (
              <div className="p-4 rounded-[16px] bg-abyss-well border border-abyss-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold flex items-center gap-2 text-abyss-textPrimary">
                    <span>⚡</span>
                    <span>Google Gemini API Key Configuration</span>
                  </div>
                  <button onClick={() => setShowApiKeyModal(false)} className="text-xs text-abyss-textMuted hover:text-abyss-textPrimary">✕</button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="flex-1 px-4 py-2.5 rounded-full text-xs font-mono bg-abyss-elevated border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted outline-none focus:border-jade-500"
                  />
                  <button
                    onClick={() => {
                      if (geminiApiKey) {
                        localStorage.setItem('bytfloww_gemini_api_key', geminiApiKey.trim());
                      } else {
                        localStorage.removeItem('bytfloww_gemini_api_key');
                      }
                      setShowApiKeyModal(false);
                    }}
                    className="spatial-btn-selected px-5 py-2.5 rounded-full text-xs font-bold"
                  >
                    Save Key
                  </button>
                </div>
                <div className="text-[10px] text-abyss-textMuted">
                  Your API key is kept securely in your browser session for live forensic analysis.
                </div>
              </div>
            )}

            {/* Suggested Forensic Query Pills */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted tracking-wider">Suggested Forensic Queries</div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Where is my money going most in a single month?',
                  'How much interest/extra have I paid till now for loans?',
                  'How much do I spend in daily spend across each month?',
                  'What is my overall loan credits received till now?',
                  'Explain the ₹80,000 EPFO withdrawal details',
                  'Show corporate salary vs loan borrowings breakdown',
                  'Who are my top P2P transfer recipients?',
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    disabled={isAiTyping}
                    onClick={() => handleSendChatMessage(promptText)}
                    className="spatial-btn px-3.5 py-1.5 text-xs text-abyss-textSecondary hover:text-abyss-textPrimary"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="p-4 rounded-[20px] bg-abyss-well border border-abyss-border min-h-[350px] max-h-[500px] overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-4 rounded-[18px] text-xs leading-relaxed max-w-[90%] ${
                      msg.role === 'assistant'
                        ? 'bg-abyss-card text-abyss-textPrimary border border-abyss-border shadow-solid-sm'
                        : 'bg-synapse-500 text-white font-medium shadow-solid-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-xs max-w-none">
                      {msg.text}
                    </div>
                    <div className={`text-[9px] mt-2 opacity-70 font-mono flex items-center justify-between gap-4 ${msg.role === 'assistant' ? '' : 'text-right text-white/80'}`}>
                      <span>{msg.role === 'assistant' ? 'BytFloww Copilot (Gemini 2.5 Flash)' : 'You'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex items-center gap-2 p-3.5 rounded-[14px] bg-abyss-card border border-abyss-border text-abyss-textPrimary text-xs animate-pulse">
                  <span className="animate-spin text-sm">⚙️</span>
                  <span className="font-semibold">Querying Gemini 2.5 Flash & calculating ledger facts...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={chatInput}
                disabled={isAiTyping}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask any question about your transactions, interest, salary, lenders, or daily spend..."
                className="flex-1 px-4 py-3 rounded-full text-xs bg-abyss-well border border-abyss-border text-abyss-textPrimary focus:border-jade-500 placeholder:text-abyss-textMuted outline-none transition"
              />
              <button
                type="submit"
                disabled={isAiTyping || !chatInput.trim()}
                className={`spatial-btn-selected px-6 py-3 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  isAiTyping || !chatInput.trim() ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <span>Send</span>
                <span>🚀</span>
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Forensic Report Export Modal */}
      {showReportModal && hasData && (
        <ForensicReportModal
          dataset={forensicData}
          transactions={session.uniqueTransactions}
          isDark={isDark}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
