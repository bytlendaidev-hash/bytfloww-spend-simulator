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
        <div className="w-16 h-16 rounded-[20px] mx-auto flex items-center justify-center bg-abyss-well border border-abyss-border text-jade-500 shadow-solid-sm">
          <span className="text-3xl">📥</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-abyss-textPrimary mb-2 font-fraunces">
            Import SMS Backup XML
          </h2>
          <p className="text-xs sm:text-sm max-w-md mx-auto text-abyss-textMuted leading-relaxed font-medium">
            Import your Android SMS Backup XML file to extract real bank accounts, spending categories, merchant intelligence, and loan commitments.
          </p>
        </div>

        {/* ── DRAG & DROP UPLOAD ZONE ──────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 sm:p-10 rounded-[20px] border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
              : 'border-abyss-border bg-abyss-well hover:border-emerald-500/40 hover:bg-abyss-elevated'
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
          <div className="p-3.5 rounded-[12px] bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
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

        {/* Privacy Note */}
        <div className="pt-4 border-t border-abyss-border text-xs text-abyss-textMuted flex items-center justify-center gap-2">
          <span>🔒</span>
          <span>100% Client-Side Privacy: SMS parsed locally in browser memory. Zero external server uploads.</span>
        </div>
      </div>
    </div>
  );
};
