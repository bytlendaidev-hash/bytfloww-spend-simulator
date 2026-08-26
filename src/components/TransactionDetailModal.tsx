import React, { useState } from 'react';
import { FinancialEvent } from '../types';
import { X, Copy, Check, ShieldCheck } from 'lucide-react';

interface TransactionDetailModalProps {
  event: FinancialEvent | null;
  isDark: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  event,
  isDark,
  onClose,
}) => {
  if (!event) return null;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(event.rawSmsBody || event.notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCredit = event.direction === 'INFLOW';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[32px] border p-6 sm:p-7 flex flex-col gap-4 shadow-2xl transition-all duration-200 ${
        isDark ? 'bg-[#10181E] border-white/[0.08] text-white shadow-black/80' : 'bg-white border-slate-200/90 text-slate-900 shadow-xl'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-black font-mono uppercase tracking-wider ${
            isDark ? 'text-brand-viridian' : 'text-brand-700'
          }`}>
            Transaction Forensics
          </span>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-all duration-150 ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Amount & Merchant */}
        <div className={`flex flex-col items-center justify-center py-3 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-2 shadow-sm ${
            isCredit 
              ? (isDark ? 'bg-brand-viridian/15 text-brand-viridian border border-brand-viridian/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300') 
              : (isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-800 border border-slate-200')
          }`}>
            {event.merchant.charAt(0).toUpperCase()}
          </div>
          <h3 className={`text-base font-black tracking-tight text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{event.merchant}</h3>
          <span className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${
            isCredit 
              ? (isDark ? 'text-brand-viridian' : 'text-brand-700') 
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isCredit ? '+' : '-'}₹{event.amount.toLocaleString('en-IN')}
          </span>
          <span className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        {/* Key Metadata Attributes */}
        <div className="flex flex-col gap-2 text-xs">
          <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Category</span>
            <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{event.category}</span>
          </div>
          <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Institution</span>
            <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{event.resolvedInstitution}</span>
          </div>
          {event.accountHint && (
            <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Account Mask</span>
              <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>••{event.accountHint}</span>
            </div>
          )}
          {event.referenceNumber && (
            <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Reference No</span>
              <span className={`font-mono font-bold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>{event.referenceNumber}</span>
            </div>
          )}
          <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Economic Type</span>
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{event.economicType}</span>
          </div>
          <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Confidence</span>
            <span className={`font-bold flex items-center gap-1 ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {Math.round(event.confidence * 100)}% Verified
            </span>
          </div>
        </div>

        {/* ── ORIGINAL RAW SMS TEXT VIEWER ─────────────────────────────────── */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
          isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-brand-viridian' : 'text-brand-700'
            }`}>
              <span>📩</span> Original Raw SMS Body
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                copied 
                  ? 'bg-emerald-500 text-black border-emerald-500' 
                  : isDark
                  ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className={`text-xs font-mono leading-relaxed select-all break-words ${
            isDark ? 'text-slate-300' : 'text-slate-800'
          }`}>
            {event.rawSmsBody || event.notes}
          </p>

          <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${
            isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200 text-slate-400'
          }`}>
            <span>Sender: <strong className={isDark ? 'text-slate-300' : 'text-slate-600'}>{event.sender}</strong></span>
            <span>Fingerprint: <strong className="font-mono">{event.transactionFingerprint?.slice(0, 8) || event.id}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};

