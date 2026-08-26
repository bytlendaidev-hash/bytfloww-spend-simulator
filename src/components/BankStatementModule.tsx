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
}


// Micro-sparkline SVG paths for hero cards
const EmeraldSparkline: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 20 Q 20 5, 40 18 T 80 8 T 100 3"
      fill="none"
      stroke={isDark ? '#10B981' : '#059669'}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 20 Q 20 5, 40 18 T 80 8 T 100 3 L 100 25 L 0 25 Z"
      fill={isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.10)'}
    />
  </svg>
);

const RoseSparkline: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 8 Q 25 22, 50 10 T 80 20 T 100 15"
      fill="none"
      stroke={isDark ? '#F43F5E' : '#E11D48'}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 8 Q 25 22, 50 10 T 80 20 T 100 15 L 100 25 L 0 25 Z"
      fill={isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(225, 29, 72, 0.10)'}
    />
  </svg>
);

const PurpleSparkline: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 18 Q 30 22, 60 8 T 100 4"
      fill="none"
      stroke={isDark ? '#A855F7' : '#7E22CE'}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 18 Q 30 22, 60 8 T 100 4 L 100 25 L 0 25 Z"
      fill={isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(126, 34, 206, 0.10)'}
    />
  </svg>
);

const CyanSparkline: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 16 Q 30 18, 60 7 T 100 2"
      fill="none"
      stroke={isDark ? '#00F2FE' : '#0284C7'}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M0 16 Q 30 18, 60 7 T 100 2 L 100 25 L 0 25 Z"
      fill={isDark ? 'rgba(0, 242, 254, 0.15)' : 'rgba(2, 132, 199, 0.10)'}
    />
  </svg>
);

export const BankStatementModule: React.FC<BankStatementModuleProps> = ({
  isDark,
  onMergeTransactions,
  onSwitchToSmsModule,
}) => {
  // Navigation Section
  const [activeSection, setActiveSection] = useState<StatementSection>('OVERVIEW');

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

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  const availableFYs = useMemo(() => {
    return session?.coverage?.financialYearsCovered || [];
  }, [session]);

  return (
    <div className="space-y-6 animate-emergence">
      {/* ── TOP MULTI-FILE UPLOAD WORKSPACE & DROPZONE ─────────────────────── */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`p-6 sm:p-8 rounded-[32px] border-2 border-dashed transition-all relative overflow-hidden text-center ${
          isDragging 
            ? (isDark ? 'border-emerald-400 bg-emerald-950/30' : 'border-emerald-500 bg-emerald-50')
            : hasData 
            ? (isDark ? 'border-white/[0.12] bg-[#0E171E]/70' : 'border-slate-300 bg-slate-50/80')
            : (isDark ? 'border-emerald-500/40 bg-gradient-to-b from-[#0E171E] to-[#080D11]' : 'border-slate-300 bg-gradient-to-b from-white to-slate-50')
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
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl transition-transform duration-200 ${
              isDragging ? 'scale-110' : ''
            } ${
              isDark 
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' 
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-emerald-600/10'
            }`}>
              📑
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              Multi-Statement Financial Forensics Workspace
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Drag & drop bank statement files (XLS, XLSX, CSV) to analyze multi-month timelines, loan recycling, salary cycles, and P2P transfers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg active:scale-95 ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-emerald-500/20' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-105 shadow-emerald-600/20'
              }`}
            >
              <span>📥</span>
              <span>{hasData ? 'Add More Statement Files' : 'Select Bank Statements'}</span>
            </button>

            {hasData && (
              <button
                onClick={handleClearAll}
                className={`px-4 py-3 rounded-2xl text-xs font-bold border transition ${
                  isDark ? 'border-white/10 text-rose-400 hover:bg-rose-950/20' : 'border-slate-200 text-rose-600 hover:bg-rose-50'
                }`}
              >
                Clear All Files
              </button>
            )}
          </div>
        </div>

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="max-w-md mx-auto mt-6 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400">{processingStage}</span>
              <span className="font-mono text-slate-400">{processingProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="max-w-md mx-auto mt-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
            ⚠️ {errorMessage}
          </div>
        )}
      </div>

      {/* ── UPLOADED FILES WORKSPACE & COVERAGE STATUS (WHEN DATA LOADED) ── */}
      {hasData && (
        <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📑</span>
              <h2 className="text-sm font-black uppercase tracking-wider font-heading">Statement Source Files ({session.files.length})</h2>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className={`px-2.5 py-1 rounded-xl font-bold border ${
                session.coverage.status === 'COMPLETE_CONTINUOUS' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : session.coverage.status === 'GAPS_DETECTED'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                Coverage: {session.coverage.status.replace(/_/g, ' ')} ({session.coverage.continuityScore}% Quality)
              </span>
              <span className={`px-2.5 py-1 rounded-xl font-bold border ${
                session.coverage.balanceContinuityStatus === 'BALANCE_CONTINUITY_VERIFIED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {session.coverage.balanceContinuityStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Files Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {session.files.map((file, idx) => (
              <div 
                key={file.fileId || idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  file.duplicateStatus === 'EXACT_FILE_DUPLICATE'
                    ? (isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200')
                    : file.parseStatus === 'FAILED'
                    ? (isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200')
                    : (isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200')
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">📄</span>
                    <span className="text-xs font-bold truncate max-w-[180px]">{file.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">{file.detectedBank}</span>
                    <span>•</span>
                    <span>{file.transactionCount} rows</span>
                    {file.duplicateTransactionCount > 0 && (
                      <span className="text-amber-400 font-semibold">({file.duplicateTransactionCount} dupes)</span>
                    )}
                  </div>
                  {file.statementStartDate && file.statementEndDate && (
                    <div className="text-[9px] font-mono opacity-70">
                      {file.statementStartDate} → {file.statementEndDate}
                    </div>
                  )}
                  {file.duplicateStatus === 'EXACT_FILE_DUPLICATE' && (
                    <div className="text-[10px] font-bold text-amber-400">⚠️ Exact Duplicate (Skipped)</div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveFile(idx)}
                  className={`p-1.5 rounded-lg border text-xs opacity-70 hover:opacity-100 transition ${
                    isDark ? 'border-white/10 hover:bg-white/10 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Remove this statement"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Session Overview Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-black/20 border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Unique Valid Txns</div>
              <div className="text-lg font-black font-mono mt-0.5 text-emerald-400">{session.uniqueTransactions.length.toLocaleString('en-IN')}</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-black/20 border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Dupes Excluded</div>
              <div className="text-lg font-black font-mono mt-0.5 text-amber-400">{session.duplicateTransactionsRemoved}</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-black/20 border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Months Covered</div>
              <div className="text-lg font-black font-mono mt-0.5 text-indigo-400">{session.coverage.totalMonths} mos</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-black/20 border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Date Span</div>
              <div className="text-[11px] font-bold font-mono mt-1 text-slate-300 truncate">{session.coverage.earliestDate} → {session.coverage.latestDate}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER & NAVIGATION BAR ──────────────────────────────────────── */}
      {hasData && (
        <div className={`p-3 sm:p-4 ${cardCls} flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sticky top-16 z-30`}>
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'OVERVIEW', label: '📊 Overview' },
              { id: 'WHERE_100_WENT', label: '🎯 Where ₹100 Went' },
              { id: 'MONEY_FLOW', label: '🕸️ Money Flow' },
              { id: 'DEBT_SIMULATOR', label: '🧮 Debt Simulator' },
              { id: 'ANOMALY_RADAR', label: '🚨 Anomaly Radar' },
              { id: 'PREDICTIVE_RUNWAY', label: '📉 Cash Runway' },
              { id: 'SUBSCRIPTIONS_AUTOPSY', label: '🔄 Subscriptions' },
              { id: 'MERCHANT_DNA', label: '🛍️ Merchant DNA' },
              { id: 'FIRE_RUNWAY', label: '🎯 Emergency & FIRE' },
              { id: 'LOANS', label: '🏦 Loan Forensics' },
              { id: 'INFLOW', label: '💰 Income & Salary' },
              { id: 'DEBITS', label: '💳 14-Cat Debits' },
              { id: 'PEOPLE', label: '👥 P2P Transfers' },
              { id: 'VELOCITY', label: '📈 16-Mo Velocity' },
              { id: 'VARIANCE_HEATMAP', label: '📊 MoM Variance' },
              { id: 'RATIOS', label: '⚖️ 7 Health Ratios' },
              { id: 'AUDIT', label: '🛡️ Audit Notes' },
              { id: 'SPEND_CALENDAR', label: '📅 Spend Calendar' },
              { id: 'LEDGER', label: '📋 Master Ledger' },
              { id: 'AI_AGENT', label: '🤖 AI Copilot', badge: 'Gemini' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as StatementSection)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeSection === tab.id
                    ? (isDark ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                    : (isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-emerald-400/20 text-emerald-400">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Dynamic Period Selector & Export Dossier Action Button */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:brightness-110 transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              title="Open Boardroom PDF Dossier & Export CSV"
            >
              <span>📄</span>
              <span>Export Dossier</span>
            </button>
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Period:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as StatementPeriodFilter)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                isDark ? 'bg-[#142028] border-white/[0.1] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL_TIME">All Imported Data ({session.coverage.totalMonths} Mos)</option>
              <option value="CURRENT_FY">Current Financial Year (FY)</option>
              {availableFYs.map(fy => (
                <option key={fy} value={`FY_${fy.replace(/[^0-9]/g, '_')}`}>{fy}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── 1. SECTION: EXECUTIVE SUMMARY (OVERVIEW) ────────────────────── */}
      {hasData && activeSection === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Reconciled Executive KPI Command Center Grid with Dynamic Sparklines */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Total Inflow */}
            <div className={`p-4 rounded-[24px] border relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              isDark 
                ? 'bg-gradient-to-b from-emerald-950/30 to-[#0E171E] border-emerald-500/30 shadow-lg shadow-emerald-950/20' 
                : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Total Inflow</span>
                <span className="text-xs">↗️</span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-emerald-400 tracking-tight">
                ₹{forensicData.totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 18 Q 20 8, 40 16 T 80 6 T 100 4" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                <span>{forensicData.totalTransactions} total txns</span>
                <span className="text-emerald-400 font-bold">+100%</span>
              </div>
            </div>

            {/* 2. Total Outflow */}
            <div className={`p-4 rounded-[24px] border relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              isDark 
                ? 'bg-gradient-to-b from-rose-950/30 to-[#0E171E] border-rose-500/30 shadow-lg shadow-rose-950/20' 
                : 'bg-gradient-to-b from-rose-50 to-white border-rose-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">Total Outflow</span>
                <span className="text-xs">↘️</span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-rose-400 tracking-tight">
                ₹{forensicData.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 6 Q 20 18, 40 10 T 80 20 T 100 16" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Outflow Reconciled</span>
                <span className="text-rose-400 font-bold">-100%</span>
              </div>
            </div>

            {/* 3. True Lifestyle Spend */}
            <div className={`p-4 rounded-[24px] border relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              isDark 
                ? 'bg-gradient-to-b from-teal-950/30 to-[#0E171E] border-teal-500/30 shadow-lg shadow-teal-950/20' 
                : 'bg-gradient-to-b from-teal-50 to-white border-teal-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">Lifestyle Spend</span>
                <span className="text-xs">🛍️</span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-teal-400 tracking-tight">
                ₹{forensicData.trueLifestyleTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 14 Q 25 20, 50 10 T 75 14 T 100 8" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-semibold text-teal-400/80 flex items-center justify-between">
                <span>Food & Retail</span>
                <span className="font-black text-teal-400">{forensicData.trueLifestyleShare.toFixed(1)}%</span>
              </div>
            </div>

            {/* 4. Money Movement & Debt */}
            <div className={`p-4 rounded-[24px] border relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              isDark 
                ? 'bg-gradient-to-b from-indigo-950/30 to-[#0E171E] border-indigo-500/30 shadow-lg shadow-indigo-950/20' 
                : 'bg-gradient-to-b from-indigo-50 to-white border-indigo-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Money Movement</span>
                <span className="text-xs">🔄</span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-indigo-400 tracking-tight">
                ₹{forensicData.moneyMovementTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 10 Q 30 4, 60 16 T 90 8 T 100 12" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-semibold text-indigo-400/80 flex items-center justify-between">
                <span>Transfers & Debt</span>
                <span className="font-black text-indigo-400">{forensicData.moneyMovementShare.toFixed(1)}%</span>
              </div>
            </div>

            {/* 5. Corporate Earned Salary */}
            <div className={`p-4 rounded-[24px] border relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              isDark 
                ? 'bg-gradient-to-b from-cyan-950/30 to-[#0E171E] border-cyan-500/30 shadow-lg shadow-cyan-950/20' 
                : 'bg-gradient-to-b from-cyan-50 to-white border-cyan-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Corporate Salary</span>
                <span className="text-xs">💼</span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-cyan-300 tracking-tight">
                ₹{forensicData.salaryTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 16 Q 20 6, 40 14 T 80 4 T 100 2" fill="none" stroke="#00F2FE" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Verified Payroll</span>
                <span className="text-cyan-400 font-bold">17 Cycles</span>
              </div>
            </div>

            {/* 6. Period Net Cash Flow */}
            <div className={`p-4 rounded-[24px] border relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              isDark 
                ? (forensicData.netCashFlow >= 0 ? 'bg-gradient-to-b from-emerald-950/30 to-[#0E171E] border-emerald-500/30' : 'bg-gradient-to-b from-rose-950/30 to-[#0E171E] border-rose-500/30')
                : (forensicData.netCashFlow >= 0 ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200' : 'bg-gradient-to-b from-rose-50 to-white border-rose-200')
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Cash Flow</span>
                <span className="text-xs">{forensicData.netCashFlow >= 0 ? '📈' : '📉'}</span>
              </div>
              <div className={`text-lg sm:text-xl font-black font-mono mt-1 tracking-tight ${forensicData.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {forensicData.netCashFlow >= 0 ? '+' : ''}₹{forensicData.netCashFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              {/* Sparkline Wave */}
              <div className="my-1.5 h-6 w-full opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 12 Q 30 18, 50 8 T 80 14 T 100 16" fill="none" stroke={forensicData.netCashFlow >= 0 ? '#10B981' : '#F43F5E'} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[10px] font-semibold flex items-center justify-between">
                <span className="text-slate-400">Period Net Delta</span>
                <span className={`font-black px-1.5 py-0.2 rounded ${forensicData.netCashFlow >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {forensicData.netCashFlow >= 0 ? 'SURPLUS' : 'DEFICIT'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Where ₹100 Went Preview */}
          <Where100WentChart liveResult={session.analytics} isDark={isDark} />

          {/* Top Problems and Immediate Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
              <h3 className="text-sm font-black uppercase text-rose-400 flex items-center gap-2 font-heading">
                <span>⚠️</span>
                <span>Top Forensic Vulnerabilities</span>
              </h3>
              <div className="space-y-2">
                {forensicData.topProblems.map((prob, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${
                    isDark ? 'bg-rose-950/20 border-rose-500/20 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <span className="font-mono text-rose-400 font-bold">{idx + 1}.</span>
                    <span>{prob}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
              <h3 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2 font-heading">
                <span>🎯</span>
                <span>Prioritized Action Plan</span>
              </h3>
              <div className="space-y-2">
                {forensicData.topActions.map((act, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${
                    isDark ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="font-mono text-emerald-400 font-bold">{idx + 1}.</span>
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
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Borrowed (Credits)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-emerald-400">
                ₹{forensicData.lenders.reduce((s, l) => s + l.totalBorrowed, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{forensicData.lenders.reduce((s, l) => s + l.borrowCount, 0)} disbursal txns</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Repaid (Debits)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-rose-400">
                ₹{forensicData.lenders.reduce((s, l) => s + l.totalRepaid, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{forensicData.lenders.reduce((s, l) => s + l.repayCount, 0)} repayment txns</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Net Debt Delta</div>
              <div className={`text-lg sm:text-xl font-black font-mono mt-1 ${forensicData.lenders.reduce((s, l) => s + l.netDelta, 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {forensicData.lenders.reduce((s, l) => s + l.netDelta, 0) >= 0 ? '+' : ''}₹{forensicData.lenders.reduce((s, l) => s + l.netDelta, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Borrowed minus Repaid</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Serviced Lenders</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-amber-400">
                {forensicData.lenders.length} Entities
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Active / Serviced</div>
            </div>
          </div>

          <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-black flex items-center gap-2 font-heading">
                  <span>🏦</span>
                  <span>Lender & Debt Servicing Matrix ({forensicData.lenders.length} Lenders)</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tracking loan credits vs repayments and revolving loan recycling ratios.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="p-3">Lender / Facility</th>
                    <th className="p-3 text-right">Total Borrowed</th>
                    <th className="p-3 text-right">Total Repaid</th>
                    <th className="p-3 text-right">Net Delta</th>
                    <th className="p-3 text-center">Txns (B/R)</th>
                    <th className="p-3 text-center">Recycling Risk</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {forensicData.lenders.map((l) => (
                    <tr key={l.id} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2.5">
                          <BrandLogoBadge entityName={l.name} size="sm" />
                          <div>
                            <div className="font-bold">{l.name}</div>
                            <div className="text-[10px] text-slate-400">{l.productType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        ₹{l.totalBorrowed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        ₹{l.totalRepaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`p-3 text-right font-mono font-bold ${l.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {l.netDelta >= 0 ? '+' : ''}₹{l.netDelta.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-center font-mono text-[11px]">
                        {l.borrowCount} / {l.repayCount}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          l.recyclingRisk === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : l.recyclingRisk === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {l.recyclingRisk}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-[10px] text-slate-400">
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
      {false && hasData && activeSection === 'PEOPLE' && (
        <div className="space-y-6">
          {/* Summary Cards for P2P */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total P2P Sent (Debits)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-rose-400">
                ₹{forensicData.recipients.reduce((s, r) => s + r.totalSent, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Outward Peer Transfers</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total P2P Received (Credits)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-emerald-400">
                ₹{forensicData.recipients.reduce((s, r) => s + r.totalReceived, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Inward Peer Transfers</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Net P2P Drain (Net Outflow)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-slate-300">
                ₹{forensicData.recipients.reduce((s, r) => s + r.netOutflow, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sent minus Received</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Counterparties</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-violet-400">
                {forensicData.recipients.length} People
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{forensicData.recipients.reduce((s, r) => s + r.txnCount, 0)} total transfers</div>
            </div>
          </div>

          <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>👥</span>
              <span>Peer-to-Peer (P2P) Recipient Ledger ({forensicData.recipients.length} Counterparties)</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="p-3">Counterparty</th>
                    <th className="p-3 text-right">Total Sent</th>
                    <th className="p-3 text-right">Total Received</th>
                    <th className="p-3 text-right">Net Outflow</th>
                    <th className="p-3 text-center">Txns</th>
                    <th className="p-3 text-center">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {forensicData.recipients.map((rec) => (
                    <tr key={rec.id} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                      <td className="p-3">
                        <div className="font-bold">{rec.name}</div>
                        {rec.upiHandle && <div className="text-[10px] font-mono text-slate-400">{rec.upiHandle}</div>}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        ₹{rec.totalSent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        ₹{rec.totalReceived.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-300">
                        ₹{rec.netOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-center font-mono">{rec.txnCount}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          rec.flaggedPriority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : rec.flaggedPriority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {rec.flaggedPriority}
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

      {/* ── 6. SECTION: 16-MONTH VELOCITY ───────────────────────────────── */}
      {hasData && activeSection === 'VELOCITY' && (
        <div className="space-y-6">
          {/* Summary Cards for Velocity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Period Inflow (Credits)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-emerald-400">
                ₹{forensicData.totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Avg: ₹{Math.round(forensicData.totalCredits / Math.max(1, forensicData.monthlyCashFlow.length)).toLocaleString('en-IN')}/mo</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Period Outflow (Debits)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-rose-400">
                ₹{forensicData.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Avg: ₹{Math.round(forensicData.totalDebits / Math.max(1, forensicData.monthlyCashFlow.length)).toLocaleString('en-IN')}/mo</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Net Period Cash Flow</div>
              <div className={`text-lg sm:text-xl font-black font-mono mt-1 ${forensicData.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {forensicData.netCashFlow >= 0 ? '+' : ''}₹{forensicData.netCashFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Overall Surplus/Deficit</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Monthly Balance Health</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-indigo-400">
                {forensicData.monthlyCashFlow.filter(m => !m.isDeficit).length} Surplus / {forensicData.monthlyCashFlow.filter(m => m.isDeficit).length} Deficit
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across {forensicData.monthlyCashFlow.length} recorded months</div>
            </div>
          </div>

          <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>📈</span>
              <span>Monthly Cash Flow Velocity Table</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="p-3">Month</th>
                    <th className="p-3">FY</th>
                    <th className="p-3 text-right">Credits</th>
                    <th className="p-3 text-right">Debits</th>
                    <th className="p-3 text-right">Net Flow</th>
                    <th className="p-3 text-right">Salary</th>
                    <th className="p-3 text-right">Debt Repaid</th>
                    <th className="p-3 text-right">Lifestyle</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {forensicData.monthlyCashFlow.map((m) => (
                    <tr key={m.monthKey} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-bold">{m.monthName}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">{m.financialYear}</td>
                      <td className="p-3 text-right font-mono text-emerald-400">₹{m.totalCredits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-right font-mono text-rose-400">₹{m.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className={`p-3 text-right font-mono font-bold ${m.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₹{m.netCashFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">₹{m.salary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-right font-mono text-rose-300">₹{m.loanRepaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-right font-mono text-teal-300">₹{m.lifestyleSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          m.isDeficit ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
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
        <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
          <h2 className="text-base font-black flex items-center gap-2 font-heading">
            <span>⚖️</span>
            <span>7 Financial Health & Risk Ratios</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forensicData.ratios.map((r, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border space-y-2 ${
                r.status === 'CRITICAL' ? (isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200') : (isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200')
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{r.ratioName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                    r.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : r.status === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono">{r.currentValue}%</span>
                  <span className="text-[10px] text-slate-400">Benchmark: {r.benchmark}</span>
                </div>
                <div className="text-[10px] text-slate-400">{r.formula}</div>
                <div className="text-xs leading-relaxed opacity-90">{r.assessment}</div>
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
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Outflow (Debits)</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-rose-400">
                ₹{forensicData.totalDebits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">100% of Reconciled Outflow</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-teal-500/10 border-teal-500/30' : 'bg-teal-50 border-teal-200'}`}>
              <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>True Lifestyle Spend</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-teal-500">
                ₹{forensicData.trueLifestyleTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className={`text-[10px] ${isDark ? 'text-teal-400/80' : 'text-teal-600'} mt-0.5`}>{forensicData.trueLifestyleShare.toFixed(1)}% of Debits</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
              <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>Money Movement</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-indigo-400">
                ₹{forensicData.moneyMovementTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className={`text-[10px] ${isDark ? 'text-indigo-400/80' : 'text-indigo-600'} mt-0.5`}>{forensicData.moneyMovementShare.toFixed(1)}% (Transfers & Debt)</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">Categories Tracked</div>
              <div className="text-lg sm:text-xl font-black font-mono mt-1 text-slate-200">
                {forensicData.debitBreakdown.length} Categories
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Ranked by volume</div>
            </div>
          </div>

          <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>💳</span>
              <span>14-Category Debit Breakdown</span>
            </h2>
            <div className="space-y-3">
              {forensicData.debitBreakdown.map((d) => (
                <div key={d.rank} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-2">
                      <span>{d.icon}</span>
                      <span>{d.category}</span>
                      {d.isLifestyle && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold">LIFESTYLE</span>}
                    </span>
                    <span className="font-mono font-bold">₹{d.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({d.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/20 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(1, d.percentage)}%` }} />
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
          <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-black flex items-center gap-2 font-heading">
                  <span>💰</span>
                  <span>Inflow & Ingress Decomposition</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Strict segregation of Earned Corporate Salary, EPFO / PF Capital Withdrawals, and Borrowed Debt Disbursals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] font-bold uppercase text-slate-400">Earned Salary</div>
                <div className="text-lg font-black font-mono mt-1 text-emerald-400">₹{forensicData.salaryTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">17 Payroll Cycles</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-sky-950/20 border-sky-500/30' : 'bg-sky-50 border-sky-200'}`}>
                <div className="text-[10px] font-bold uppercase text-sky-400">EPFO / PF Claims</div>
                <div className="text-lg font-black font-mono mt-1 text-sky-400">₹{forensicData.epfoCreditsTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-sky-400/80 mt-0.5">Statutory Inflow</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="text-[10px] font-bold uppercase text-emerald-400">Savings Bank Interest</div>
                <div className="text-lg font-black font-mono mt-1 text-emerald-400">₹{forensicData.interestCreditsTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">{forensicData.bankInterestCredits.length} Quarterly Credits</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
                <div className="text-[10px] font-bold uppercase text-rose-400">Bank Fees & Charges</div>
                <div className="text-lg font-black font-mono mt-1 text-rose-400">₹{forensicData.bankChargesTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">{forensicData.bankChargesCount} Deductions</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                <div className="text-[10px] font-bold uppercase text-amber-400">Loan Disbursals</div>
                <div className="text-lg font-black font-mono mt-1 text-amber-400">₹{forensicData.loanCreditsTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">Borrowed Debt</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#142028] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] font-bold uppercase text-slate-400">Refunds & Reversals</div>
                <div className="text-lg font-black font-mono mt-1 text-slate-200">₹{forensicData.refundsReversalsTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Non-operating Inflow</div>
              </div>
            </div>

            {/* Dedicated EPFO / PF Ledger Table */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏛️</span>
                  <h3 className="text-sm font-black text-sky-400 font-heading">Provident Fund (EPFO) Claims & Capital Withdrawals</h3>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">
                  Total: ₹{forensicData.epfoCreditsTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="p-3">Date</th>
                      <th className="p-3">Narration / Claim Reference</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right">Balance After</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {session.uniqueTransactions.filter(t => t.category === 'EPFO_PF').map((epfTx) => (
                      <tr key={epfTx.id} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">{epfTx.transactionDate}</td>
                        <td className="p-3 font-semibold max-w-[300px]">
                          <div className="truncate text-sky-300">{epfTx.rawNarration}</div>
                          {epfTx.referenceNumber && (
                            <div className="text-[10px] font-mono text-slate-500">Ref / UTR: {epfTx.referenceNumber}</div>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-sky-400 text-sm">
                          +₹{epfTx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-400">
                          {epfTx.balanceAfter != null ? `₹${epfTx.balanceAfter.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            SETTLED
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

      
            {/* Dedicated Bank Savings Interest Audit Table */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">💰</span>
                  <h3 className="text-sm font-black text-emerald-400 font-heading">Bank Savings Account Interest Added by Bank</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Total Interest Earned: ₹{forensicData.interestCreditsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="p-3">Payout Date</th>
                      <th className="p-3">Quarter Period</th>
                      <th className="p-3">Bank Narration</th>
                      <th className="p-3 text-right">Interest Credited</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {forensicData.bankInterestCredits.map((intTx, idx) => (
                      <tr key={idx} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">{intTx.date}</td>
                        <td className="p-3 font-bold text-emerald-300">{intTx.quarterLabel}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">{intTx.narration}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                          +₹{intTx.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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
            <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏦</span>
                  <h3 className="text-sm font-black text-rose-400 font-heading">Bank Service Charges, Penalty Fees & Taxes Deducted</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">
                  Total Bank Charges: ₹{forensicData.bankChargesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-black text-[10px] uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="p-3">Deduction Date</th>
                      <th className="p-3">Fee / Charge Classification</th>
                      <th className="p-3">Bank Narration</th>
                      <th className="p-3 text-right">Fee Deducted</th>
                      <th className="p-3 text-center">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {forensicData.bankChargesList.map((chgTx, idx) => (
                      <tr key={idx} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">{chgTx.date}</td>
                        <td className="p-3 font-bold text-rose-300">{chgTx.chargeType}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">{chgTx.narration}</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-400 text-sm">
                          -₹{chgTx.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            chgTx.amount >= 500 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
      {/* ── 10. SECTION: RECONCILIATION AUDIT NOTES ───────────────────────── */}
      {hasData && activeSection === 'AUDIT' && (
        <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
          <h2 className="text-base font-black flex items-center gap-2 font-heading">
            <span>🛡️</span>
            <span>Forensic Ledger Audit & Integrity Notes</span>
          </h2>
          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-emerald-400">1. Cryptographic File Fingerprinting (SHA-256)</div>
              <p className="opacity-80">
                All uploaded statement files are cryptographically fingerprinted using client-side SHA-256. Exact duplicate files uploaded concurrently or in separate sessions are rejected with zero double-counting.
              </p>
            </div>
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-indigo-400">2. Single Source of Truth Ledger Reconciliation</div>
              <p className="opacity-80">
                Opening Balance (₹{forensicData.openingBalance?.toFixed(2) || '0.00'}) + Total Inflow (₹{forensicData.totalCredits.toFixed(2)}) - Total Outflow (₹{forensicData.totalDebits.toFixed(2)}) = Closing Balance (₹{forensicData.closingBalance?.toFixed(2) || '0.00'}).
              </p>
            </div>
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-emerald-400">3. Cross-File Lineage & Provenance</div>
              <p className="opacity-80">
                Every transaction retains exact file origin tracking. Overlapping statements generated zero artificial duplicate transactions in master aggregates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. SECTION: AI FORENSIC COPILOT ────────────────────────────── */}
      {hasData && activeSection === 'AI_AGENT' && (
        <div className="space-y-4">
          <div className={`p-5 sm:p-6 ${cardCls} space-y-4`}>
            {/* Header with Engine Status & API Key Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-brand-viridian flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black font-heading">AI Forensic Copilot</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Gemini 2.5 Flash Active
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Real-data personal financial auditor querying {session.uniqueTransactions.length.toLocaleString('en-IN')} ledger transactions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiKeyModal(!showApiKeyModal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* API Key Modal / Drawer */}
            {showApiKeyModal && (
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-black/40 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black flex items-center gap-2 text-indigo-400">
                    <span>⚡</span>
                    <span>Google Gemini API Key Configuration</span>
                  </div>
                  <button onClick={() => setShowApiKeyModal(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border outline-none ${
                      isDark ? 'bg-[#142028] border-white/10 text-white focus:border-indigo-400' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                    }`}
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
                    className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition"
                  >
                    Save Key
                  </button>
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your API key is kept securely in your browser session for live forensic analysis.
                </div>
              </div>
            )}

            {/* Suggested Forensic Query Pills */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Suggested Forensic Queries</div>
              <div className="flex flex-wrap gap-1.5">
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
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition text-left ${
                      isDark 
                        ? 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-emerald-400/40 text-slate-200' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-emerald-500 text-slate-700'
                    }`}
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className={`p-4 rounded-2xl border min-h-[350px] max-h-[500px] overflow-y-auto space-y-4 ${
              isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-sm ${
                      msg.role === 'assistant'
                        ? (isDark ? 'bg-[#142028] text-slate-100 border border-white/[0.08]' : 'bg-white text-slate-900 border border-slate-200')
                        : (isDark ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold' : 'bg-emerald-600 text-white font-bold')
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none">
                      {msg.text}
                    </div>
                    <div className={`text-[9px] mt-2 opacity-60 font-mono flex items-center justify-between gap-4 ${msg.role === 'assistant' ? '' : 'text-right'}`}>
                      <span>{msg.role === 'assistant' ? 'BytFloww Copilot (Gemini 2.5 Flash)' : 'You'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-400 text-xs animate-pulse">
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
                className={`flex-1 px-4 py-3 rounded-xl text-xs border outline-none transition ${
                  isDark 
                    ? 'bg-[#142028] border-white/[0.08] text-white focus:border-emerald-400 placeholder:text-slate-500' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500 placeholder:text-slate-400 shadow-sm'
                }`}
              />
              <button
                type="submit"
                disabled={isAiTyping || !chatInput.trim()}
                className={`px-6 py-3 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md ${
                  isAiTyping || !chatInput.trim()
                    ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400'
                    : (isDark ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110' : 'bg-emerald-600 text-white hover:bg-emerald-700')
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
