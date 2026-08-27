import React, { useState, useRef } from 'react';

interface EmptyUploadStateProps {
  isDark?: boolean;
  onXmlLoaded: (xml: string) => void;
  isProcessing: boolean;
}

export const EmptyUploadState: React.FC<EmptyUploadStateProps> = ({
  onXmlLoaded,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml') && file.type !== 'text/xml' && file.type !== 'application/xml') {
      setError('Please select a valid SMS backup .xml file (e.g. from Android SMS Backup & Restore).');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim()) {
        onXmlLoaded(text);
      } else {
        setError('The selected file is empty.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-[72vh] flex flex-col items-center justify-center px-4 py-6 sm:py-10 animate-emergence">
      <div className="vision-card w-full max-w-xl p-6 sm:p-10 text-center space-y-6 shadow-2xl">
        {/* Brand Icon Badge */}
        <div className="w-16 h-16 rounded-[22px] mx-auto flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-[#1AE893] shadow-sm">
          <span className="text-3xl">📱</span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00884E] dark:text-[#1AE893]">
              SMS SPEND INTELLIGENCE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-abyss-textPrimary font-fraunces mb-2">
            Upload SMS Backup XML
          </h2>
          <p className="text-xs sm:text-sm max-w-md mx-auto text-abyss-textMuted leading-relaxed font-medium">
            Upload your Android SMS backup (<code className="font-mono text-emerald-600 dark:text-[#1AE893] font-bold">.xml</code>) to extract verified bank accounts, categorized expenses, UPI transfers, salary credits, and loan commitments.
          </p>
        </div>

        {/* ── DRAG & DROP UPLOAD ZONE ──────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 sm:p-10 rounded-[22px] border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#00884E] dark:border-[#1AE893] bg-emerald-500/10 scale-[1.01]'
              : 'border-abyss-border bg-abyss-well hover:border-emerald-500/40 hover:bg-abyss-card'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,text/xml,application/xml"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="text-4xl mb-3">📁</div>
          <div className="text-sm font-bold text-abyss-textPrimary">
            {isDragging ? 'Drop your .xml file here' : 'Click to Browse or Drag & Drop'}
          </div>
          <div className="text-xs mt-1 text-abyss-textMuted font-medium">
            Supports standard Android SMS Backup & Restore XML files
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold animate-emergence flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-3 text-xs font-bold text-[#00884E] dark:text-[#1AE893] animate-pulse">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Parsing Real Indian Bank Messages...</span>
          </div>
        )}

        {/* Feature Pill Matrix */}
        <div className="grid grid-cols-3 gap-2 text-left pt-2 border-t border-abyss-border">
          <div className="p-2.5 rounded-xl bg-abyss-well border border-abyss-border text-center">
            <div className="text-base mb-1">🏦</div>
            <div className="text-[11px] font-bold text-abyss-textPrimary">All Banks</div>
            <div className="text-[9px] text-abyss-textMuted">HDFC, SBI, ICICI, etc.</div>
          </div>
          <div className="p-2.5 rounded-xl bg-abyss-well border border-abyss-border text-center">
            <div className="text-base mb-1">👥</div>
            <div className="text-[11px] font-bold text-abyss-textPrimary">P2P & UPI</div>
            <div className="text-[9px] text-abyss-textMuted">GPay, PhonePe, Paytm</div>
          </div>
          <div className="p-2.5 rounded-xl bg-abyss-well border border-abyss-border text-center">
            <div className="text-base mb-1">💳</div>
            <div className="text-[11px] font-bold text-abyss-textPrimary">Credit Cards</div>
            <div className="text-[9px] text-abyss-textMuted">EMIs & Bill Alerts</div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 text-xs text-abyss-textMuted flex items-center justify-center gap-2">
          <span>🔒</span>
          <span>100% Client-Side Privacy: SMS parsed strictly in local browser memory.</span>
        </div>
      </div>
    </div>
  );
};
