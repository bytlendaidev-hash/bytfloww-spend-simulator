import React, { useState, useRef } from 'react';
import { SAMPLE_SMS_XML } from '../engine/sampleData';

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
      <div className="spatial-card w-full max-w-xl p-8 sm:p-12 text-center space-y-6">
        {/* Brand Icon Badge */}
        <div className="w-16 h-16 rounded-[20px] mx-auto flex items-center justify-center bg-white/10 border border-white/20 text-white shadow-md">
          <span className="text-3xl">📥</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Import SMS Backup XML
          </h2>
          <p className="text-xs sm:text-sm max-w-md mx-auto text-white/60 leading-relaxed font-medium">
            Import an Android SMS Backup XML file to extract real bank accounts, spending categories, merchant intelligence, and loan commitments.
          </p>
        </div>

        {/* ── DRAG & DROP UPLOAD ZONE ──────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 sm:p-10 rounded-[20px] border-2 border-dashed cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDragging
              ? 'border-white bg-white/20 scale-[1.01]'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
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
          <div className="text-sm font-bold text-white">
            {isDragging ? 'Drop your .xml file here' : 'Click to Browse or Drag & Drop'}
          </div>
          <div className="text-xs mt-1 text-white/40 font-medium">
            Supports standard Android SMS Backup & Restore XML files
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-[12px] bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-3 text-xs font-bold text-[#30D158] animate-pulse">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Parsing Real Indian Bank Messages...</span>
          </div>
        )}

        {/* ── DIVIDER / SAMPLE BUTTON ─────────────────────────────────── */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center border-t border-white/10" />
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="px-3 font-bold bg-[#12161A] text-white/40 rounded-full">
              or test with pre-loaded dataset
            </span>
          </div>
        </div>

        <button
          onClick={() => onXmlLoaded(SAMPLE_SMS_XML)}
          className="spatial-btn w-full py-4 text-xs font-bold text-white flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          <span>Load 3,979 Real SMS Dataset (sms_20260804131919.xml)</span>
        </button>

        {/* Privacy Note */}
        <div className="pt-4 border-t border-white/10 text-xs text-white/40 flex items-center justify-center gap-2">
          <span>🔒</span>
          <span>100% Client-Side Privacy: SMS parsed locally in browser memory.</span>
        </div>
      </div>
    </div>
  );
};
