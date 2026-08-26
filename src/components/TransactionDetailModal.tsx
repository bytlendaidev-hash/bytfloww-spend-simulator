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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className="spatial-modal w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black font-mono uppercase tracking-wider text-jade-500">
            Transaction Forensics
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted hover:text-abyss-textPrimary transition-all duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Amount & Merchant */}
        <div className="flex flex-col items-center justify-center py-3 border-b border-abyss-border">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-2 shadow-sm ${
            isCredit 
              ? 'bg-jade-500/20 text-jade-500 border border-jade-500/30' 
              : 'bg-abyss-well text-abyss-textPrimary border border-abyss-border'
          }`}>
            {event.merchant.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-base font-black tracking-tight text-center text-abyss-textPrimary">{event.merchant}</h3>
          <span className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${
            isCredit 
              ? 'text-jade-500' 
              : 'text-pulse-500'
          }`}>
            {isCredit ? '+' : '-'}₹{event.amount.toLocaleString('en-IN')}
          </span>
          <span className="text-xs mt-0.5 font-medium text-abyss-textMuted">
            {new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        {/* Key Metadata Attributes */}
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-abyss-border">
            <span className="text-abyss-textMuted">Category</span>
            <span className="font-black text-abyss-textPrimary">{event.category}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-abyss-border">
            <span className="text-abyss-textMuted">Institution</span>
            <span className="font-black text-abyss-textPrimary">{event.resolvedInstitution}</span>
          </div>
          {event.accountHint && (
            <div className="flex justify-between py-1.5 border-b border-abyss-border">
              <span className="text-abyss-textMuted">Account Mask</span>
              <span className="font-mono font-bold text-abyss-textPrimary">••{event.accountHint}</span>
            </div>
          )}
          {event.referenceNumber && (
            <div className="flex justify-between py-1.5 border-b border-abyss-border">
              <span className="text-abyss-textMuted">Reference No</span>
              <span className="font-mono font-bold text-jade-500">{event.referenceNumber}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 border-b border-abyss-border">
            <span className="text-abyss-textMuted">Economic Type</span>
            <span className="font-mono font-bold text-abyss-textPrimary">{event.economicType}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-abyss-border">
            <span className="text-abyss-textMuted">Confidence</span>
            <span className="font-bold flex items-center gap-1 text-jade-500">
              <ShieldCheck className="w-3.5 h-3.5" />
              {Math.round(event.confidence * 100)}% Verified
            </span>
          </div>
        </div>

        {/* ── ORIGINAL RAW SMS TEXT VIEWER ─────────────────────────────────── */}
        <div className="p-4 rounded-2xl border flex flex-col gap-2 bg-abyss-well border-abyss-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 text-jade-500">
              <span>📩</span> Original Raw SMS Body
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                copied 
                  ? 'bg-jade-500 text-abyss-canvas border-jade-500' 
                  : 'bg-abyss-card hover:bg-abyss-elevated text-abyss-textSecondary border-abyss-border shadow-solid-sm'
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-xs font-mono leading-relaxed select-all break-words text-abyss-textSecondary">
            {event.rawSmsBody || event.notes}
          </p>

          <div className="pt-2 border-t flex items-center justify-between text-[10px] border-abyss-border text-abyss-textMuted">
            <span>Sender: <strong className="text-abyss-textPrimary">{event.sender}</strong></span>
            <span>Fingerprint: <strong className="font-mono">{event.transactionFingerprint?.slice(0, 8) || event.id}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
