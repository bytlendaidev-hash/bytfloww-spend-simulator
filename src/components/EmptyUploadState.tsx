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
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className={`w-full max-w-xl p-8 sm:p-10 rounded-[36px] border text-center transition-all ${
        isDark ? 'bg-[#0E1C23] border-cyan-500/20 text-[#E2ECEF] shadow-2xl shadow-cyan-950/30' : 'bg-white border-slate-200 text-[#0F172A] shadow-xl'
      }`}>
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00BFA5] to-[#00F2FE] p-1 mx-auto mb-5 shadow-lg shadow-[#00BFA5]/25">
          <div className={`w-full h-full rounded-[22px] flex items-center justify-center text-2xl font-black ${
            isDark ? 'bg-[#0A171D] text-[#00F2FE]' : 'bg-white text-[#00BFA5]'
          }`}>
            📥
          </div>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-2 ${
          isDark ? 'text-white' : 'text-[#0F172A]'
        }`}>
          Upload SMS XML File
        </h2>
        <p className={`text-xs sm:text-sm max-w-md mx-auto mb-6 ${
          isDark ? 'text-[#8A9EA8]' : 'text-slate-500'
        }`}>
          Import an Android SMS Backup XML file to extract spend analytics, categories, merchants, and loan commitments in real time.
        </p>

        {/* ── DRAG & DROP UPLOAD ZONE ──────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-[#00BFA5] bg-[#00BFA5]/10 scale-[1.02]'
              : isDark
              ? 'border-cyan-500/20 hover:border-cyan-500/50 bg-[#12232B]/50 hover:bg-[#12232B]'
              : 'border-slate-300 hover:border-[#00BFA5] bg-slate-50 hover:bg-slate-100/80'
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
          <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            {isDragging ? 'Drop your .xml file here' : 'Click to Browse or Drag & Drop'}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Supports standard Android SMS Backup & Restore XML files
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {isProcessing && (
          <div className="mt-5 flex items-center justify-center gap-3 text-xs font-bold text-[#00BFA5]">
            <div className="w-4 h-4 border-2 border-[#00BFA5] border-t-transparent rounded-full animate-spin" />
            <span>Parsing Real Indian Bank Messages...</span>
          </div>
        )}

        {/* ── DIVIDER / SAMPLE BUTTON ─────────────────────────────────── */}
        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'border-t border-white/10' : 'border-t border-slate-200'}`} />
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-3 font-semibold ${isDark ? 'bg-[#0E1C23] text-slate-400' : 'bg-white text-slate-500'}`}>
              or test with sample dataset
            </span>
          </div>
        </div>

        <button
          onClick={() => onXmlLoaded(SAMPLE_SMS_XML)}
          className={`w-full py-3.5 px-4 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            isDark
              ? 'bg-[#12232B] hover:bg-[#152a35] text-slate-200 border-cyan-500/25 hover:border-cyan-500/50 shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-sm'
          }`}
        >
          <span>⚡</span>
          <span>Load 3,979 Real SMS Dataset (sms_20260804131919.xml)</span>
        </button>

        {/* Privacy Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span>🔒</span>
          <span>100% Client-Side Privacy: SMS parsed locally in browser memory. No data is stored or uploaded to any server.</span>
        </div>
      </div>
    </div>
  );
};
