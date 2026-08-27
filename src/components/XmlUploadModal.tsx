import React, { useState } from 'react';
import { X, UploadCloud, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface XmlUploadModalProps {
  isDark: boolean;
  onClose: () => void;
  onXmlParsed: (xml: string) => void;
}

export const XmlUploadModal: React.FC<XmlUploadModalProps> = ({
  isDark,
  onClose,
  onXmlParsed,
}) => {
  const [xmlContent, setXmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setXmlContent(text);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleProcess = () => {
    if (!xmlContent.trim()) {
      setError('Please select or paste an SMS XML file.');
      return;
    }
    onXmlParsed(xmlContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className="spatial-modal w-full max-w-md p-6 sm:p-7 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm bg-emerald-500/15 text-[#00884E] dark:text-[#1AE893] border border-emerald-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-abyss-textPrimary font-fraunces">Import SMS XML Backup</h3>
              <span className="text-[10px] font-medium font-mono text-abyss-textMuted">Android SMS Backup & Restore XML</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition-all duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone / Upload Area */}
        <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
          fileName 
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : 'border-abyss-border hover:border-emerald-500/40 bg-abyss-well'
        }`}>
          <input
            type="file"
            accept=".xml,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FileCode className={`w-8 h-8 mb-2 ${fileName ? 'text-emerald-500' : 'text-abyss-textMuted'}`} />
          <span className="text-xs font-black text-abyss-textPrimary">{fileName || 'Choose SMS XML File'}</span>
          <span className="text-[10px] font-medium mt-0.5 text-abyss-textMuted">or drag & drop file here</span>
        </label>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Text Area for Direct Paste */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-abyss-textMuted">Or paste raw XML snippet:</span>
          </div>
          <textarea
            value={xmlContent}
            onChange={(e) => {
              setXmlContent(e.target.value);
              setFileName('pasted_xml_snippet.xml');
            }}
            placeholder="<smses><sms address='AX-HDFCBK' date='...' body='...' /></smses>"
            className="w-full h-24 p-2.5 rounded-xl border text-[11px] font-mono focus:outline-none focus:border-emerald-500 resize-none bg-abyss-well border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted"
          ></textarea>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProcess}
          className="btn-emerald-capsule w-full py-3 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Execute Simulation Pipeline</span>
        </button>

      </div>
    </div>
  );
};
