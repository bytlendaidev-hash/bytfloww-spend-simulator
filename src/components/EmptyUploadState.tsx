import React, { useState, useRef } from 'react';
import { SAMPLE_SMS_XML } from '../engine/sampleData';

interface EmptyUploadStateProps {
  isDark: boolean;
  onXmlLoaded: (xml: string) => void;
  isProcessing: boolean;
}

export const EmptyUploadState: React.FC<EmptyUploadStateProps> = ({
  isDark,
  onXmlLoaded,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xml') && file.type !== 'text/xml' && file.type !== 'application/xml') {
      setError('Please select a valid SMS backup .xml file.');
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
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 animate-emergence">
      <div className={`w-full max-w-xl p-8 sm:p-10 rounded-[36px] border text-center transition-all duration-300 backdrop-blur-2xl ${
        isDark 
          ? 'bg-[#0E1720]/80 border-white/[0.1] text-[#FFFFFF] shadow-2xl shadow-black/80' 
          : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-2xl shadow-slate-900/10'
      }`}>
        {/* Brand Icon Badge */}
        <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-all ${
          isDark 
            ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/30' 
            : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/25'
        }`}>
          <span className="text-2xl">📥</span>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black font-heading tracking-tight mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Import SMS Backup XML
        </h2>
        <p className={`text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Import an Android SMS Backup XML file to extract real bank accounts, spending categories, merchant intelligence, and loan commitments.
        </p>

        {/* ── DRAG & DROP UPLOAD ZONE ──────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 active:scale-[0.99] backdrop-blur-xl ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/15 scale-[1.01] shadow-lg shadow-emerald-500/20'
              : isDark
              ? 'border-white/[0.14] hover:border-emerald-400/60 bg-[#142028]/60 hover:bg-[#142028]/90'
              : 'border-slate-300 hover:border-emerald-500/80 bg-slate-50/80 hover:bg-slate-100/90 shadow-inner'
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
          <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isDragging ? 'Drop your .xml file here' : 'Click to Browse or Drag & Drop'}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Supports standard Android SMS Backup & Restore XML files
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isProcessing && (
          <div className="mt-5 flex items-center justify-center gap-3 text-xs font-black text-emerald-600 dark:text-emerald-400 animate-pulse">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Parsing Real Indian Bank Messages...</span>
          </div>
        )}

        {/* ── DIVIDER / SAMPLE BUTTON ─────────────────────────────────── */}
        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'border-t border-white/[0.08]' : 'border-t border-slate-200'}`} />
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className={`px-3 font-bold backdrop-blur-md ${isDark ? 'bg-[#0E1720] text-slate-400' : 'bg-white text-slate-500'}`}>
              or test with pre-loaded dataset
            </span>
          </div>
        </div>

        <button
          onClick={() => onXmlLoaded(SAMPLE_SMS_XML)}
          className={`w-full py-3.5 px-4 rounded-2xl border text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 shadow-sm backdrop-blur-xl ${
            isDark
              ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/[0.1]'
              : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-200/90'
          }`}
        >
          <span className="text-amber-400">⚡</span>
          <span>Load 3,979 Real SMS Dataset (sms_20260804131919.xml)</span>
        </button>

        {/* Privacy Note */}
        <div className={`mt-6 pt-4 border-t text-[11px] flex items-center justify-center gap-1.5 ${
          isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200/80 text-slate-500'
        }`}>
          <span>🔒</span>
          <span>100% Client-Side Privacy: SMS parsed locally in browser memory. No data is stored or uploaded to any server.</span>
        </div>
      </div>
    </div>
  );
};


