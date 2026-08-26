import React, { useEffect } from 'react';

interface AppShellProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  rawCount: number;
  onOpenUpload: () => void;
  onOpenDiagnostics: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  isDark,
  onToggleTheme,
  rawCount,
  onOpenUpload,
  onOpenDiagnostics,
}) => {
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-250 relative overflow-x-hidden ${
      isDark ? 'bg-[#080D11] text-[#FFFFFF]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      {/* Top Main Navigation Header with Glassmorphism */}
      <header className={`sticky top-0 z-40 w-full border-b transition-all duration-200 backdrop-blur-xl ${
        isDark 
          ? 'bg-[#10181E]/90 border-white/[0.08] shadow-lg shadow-black/40' 
          : 'bg-white/90 border-slate-200/90 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition shadow-md ${
              isDark 
                ? 'bg-brand-viridian text-slate-950 shadow-brand-viridian/25' 
                : 'bg-brand-600 text-white shadow-brand-600/20'
            }`}>
              BF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  BytFloww
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border tracking-wider uppercase transition ${
                  isDark 
                    ? 'bg-brand-viridian/15 text-brand-viridian border-brand-viridian/30' 
                    : 'bg-emerald-50 text-brand-700 border-brand-200 font-black'
                }`}>
                  SPEND INTELLIGENCE
                </span>
              </div>
              <p className={`text-xs hidden sm:flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Direct SMS Ingestion • 0% Mock Data •</span>
                <span className={`font-bold ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>
                  {rawCount.toLocaleString('en-IN')} Messages
                </span>
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Upload XML Button */}
            <button
              onClick={onOpenUpload}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all duration-150 shadow-sm active:scale-95 border ${
                isDark
                  ? 'bg-brand-viridian hover:bg-brand-viridianDark text-slate-950 border-brand-viridian shadow-brand-viridian/20'
                  : 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600 shadow-brand-600/20'
              }`}
            >
              <span>📥</span>
              <span className="hidden sm:inline">Import XML</span>
            </button>

            {/* Diagnostics Button */}
            <button
              onClick={onOpenDiagnostics}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all duration-150 active:scale-95 ${
                isDark 
                  ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-slate-200' 
                  : 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm border transition-all duration-150 active:scale-95 ${
                isDark 
                  ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-slate-200' 
                  : 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200 text-slate-800 shadow-sm'
              }`}
              title="Toggle Dark / Light Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs border-t mt-10 transition-colors ${
        isDark ? 'text-slate-500 border-white/[0.08]' : 'text-slate-500 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BytFloww Spend Intelligence Engine • Local In-Memory Parser • 100% Client-Side Privacy</span>
          <span className="font-semibold text-[11px] opacity-75">Noctis Dual-Theme v5.0</span>
        </div>
      </footer>
    </div>
  );
};

