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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-[32px] border p-6 flex flex-col gap-4 shadow-2xl transition-all ${
        isDark ? 'bg-[#10141F] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Import SMS XML Backup</h3>
              <span className="text-[10px] text-slate-400">Android SMS Backup & Restore XML</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone / Upload Area */}
        <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
          fileName ? 'border-emerald-500/50 bg-emerald-500/5' : isDark ? 'border-white/10 hover:border-emerald-500/40 bg-white/5' : 'border-slate-300 hover:border-emerald-500/40 bg-slate-50'
        }`}>
          <input
            type="file"
            accept=".xml,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FileCode className={`w-8 h-8 mb-2 ${fileName ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="text-xs font-bold">{fileName || 'Choose SMS XML File'}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">or drag & drop file here</span>
        </label>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-vermora-primary bg-vermora-primary/10 p-2.5 rounded-xl border border-vermora-primary/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Text Area for Direct Paste */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Or paste raw XML snippet:</span>
            <button
              onClick={handleLoadSample}
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
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
            className={`w-full h-24 p-2.5 rounded-xl border text-[11px] font-mono focus:outline-none focus:border-emerald-500/50 resize-none ${
              isDark ? 'bg-[#090D16] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          ></textarea>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProcess}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Execute Simulation Pipeline</span>
        </button>

      </div>
    </div>
  );
};
