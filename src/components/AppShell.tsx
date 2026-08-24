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
    <div className={`min-h-screen transition-colors duration-200 relative overflow-x-hidden ${
      isDark ? 'bg-[#0A1014] text-[#FFFFFF]' : 'bg-[#F4F6F9] text-[#0F172A]'
    }`}>
      {/* Top Main Navigation Header */}
      <header className={`sticky top-0 z-40 w-full border-b transition-colors ${
        isDark 
          ? 'bg-[#10181E] border-[#22323D] shadow-md shadow-black/30' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00BFA5] flex items-center justify-center font-black text-sm text-slate-950 shadow-md">
              BF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-base tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  BytFloww
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                  isDark 
                    ? 'bg-[#00BFA5]/15 text-[#00F2FE] border-[#00BFA5]/30' 
                    : 'bg-teal-100 text-teal-900 border-teal-300 font-black'
                }`}>
                  SPEND INTELLIGENCE
                </span>
              </div>
              <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Direct SMS Ingestion • 0% Mock Data • <span className={`font-bold ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}>{rawCount.toLocaleString('en-IN')} Messages</span>
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Upload XML Button */}
            <button
              onClick={onOpenUpload}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition shadow-sm border ${
                isDark
                  ? 'bg-[#00BFA5] hover:bg-[#00A892] text-slate-950 border-[#00BFA5]'
                  : 'bg-[#0D9488] hover:bg-[#0F766E] text-white border-[#0D9488]'
              }`}
            >
              <span>📥</span>
              <span className="hidden sm:inline">Import XML</span>
            </button>

            {/* Diagnostics Button */}
            <button
              onClick={onOpenDiagnostics}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition ${
                isDark 
                  ? 'bg-[#1A2630] hover:bg-[#223240] border-[#273B49] text-slate-200' 
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm border transition ${
                isDark 
                  ? 'bg-[#1A2630] hover:bg-[#223240] border-[#273B49] text-slate-200' 
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
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
      <footer className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs border-t mt-10 ${
        isDark ? 'text-slate-500 border-[#22323D]' : 'text-slate-600 border-slate-200'
      }`}>
        BytFloww Spend Intelligence Engine • Local In-Memory Parser • 100% Client-Side Privacy
      </footer>
    </div>
  );
};
