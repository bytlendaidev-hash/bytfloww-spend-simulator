import React, { useState } from 'react';
import { X, UploadCloud, FileCode, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_SMS_XML } from '../engine/sampleData';

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

  const handleLoadSample = () => {
    setXmlContent(SAMPLE_SMS_XML);
    setFileName('sample_indian_bank_sms.xml');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className={`w-full max-w-md rounded-[32px] border p-6 sm:p-7 flex flex-col gap-4 shadow-2xl transition-all duration-300 backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/95 border-emerald-500/30 text-white shadow-2xl shadow-black/80' : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
              isDark ? 'bg-brand-viridian/15 text-brand-viridian border border-brand-viridian/30' : 'bg-brand-50 text-brand-700 border border-brand-200'
            }`}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Import SMS XML Backup</h3>
              <span className={`text-[10px] font-medium font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Android SMS Backup & Restore XML</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-all duration-150 ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone / Upload Area */}
        <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
          fileName 
            ? isDark ? 'border-brand-viridian/50 bg-brand-viridian/10' : 'border-brand-600/50 bg-emerald-50/70'
            : isDark ? 'border-white/10 hover:border-brand-viridian/40 bg-white/[0.02]' : 'border-slate-300 hover:border-brand-500 bg-slate-50'
        }`}>
          <input
            type="file"
            accept=".xml,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FileCode className={`w-8 h-8 mb-2 ${fileName ? (isDark ? 'text-brand-viridian' : 'text-brand-700') : 'text-slate-400'}`} />
          <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileName || 'Choose SMS XML File'}</span>
          <span className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>or drag & drop file here</span>
        </label>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Text Area for Direct Paste */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Or paste raw XML snippet:</span>
            <button
              onClick={handleLoadSample}
              className={`font-black flex items-center gap-1 text-[11px] hover:underline ${
                isDark ? 'text-brand-viridian' : 'text-brand-700'
              }`}
            >
              <RefreshCw className="w-3 h-3" /> Load Sample XML
            </button>
          </div>
          <textarea
            value={xmlContent}
            onChange={(e) => {
              setXmlContent(e.target.value);
              setFileName('pasted_xml_snippet.xml');
            }}
            placeholder="<smses><sms address='AX-HDFCBK' date='...' body='...' /></smses>"
            className={`w-full h-24 p-2.5 rounded-xl border text-[11px] font-mono focus:outline-none focus:border-brand-500 resize-none ${
              isDark ? 'bg-[#142027] border-white/[0.08] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          ></textarea>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProcess}
          className={`w-full py-3 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95 shadow-md flex items-center justify-center gap-2 ${
            isDark 
              ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark shadow-brand-viridian/25' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Execute Simulation Pipeline</span>
        </button>

      </div>
    </div>
  );
};

