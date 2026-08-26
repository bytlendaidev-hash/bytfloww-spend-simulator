import React, { useState } from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  rawCount: number;
  onOpenUpload: () => void;
  onOpenDiagnostics: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  isDark,
  onToggleTheme,
  rawCount,
  onOpenUpload,
  onOpenDiagnostics,
}) => {
  const [deviceMode, setDeviceMode] = useState<'MOBILE' | 'EXPANDED'>('MOBILE');

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-abyss-canvas text-abyss-textPrimary' : 'bg-alabaster-canvas text-alabaster-textPrimary'}`}>
      {/* Top Simulator Control Bar */}
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 border-jade-500/20 bg-abyss-card/90 light:bg-white/90 py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-jade-500 flex items-center justify-center shadow-solid-sm font-black text-abyss-canvas text-sm">
              BF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-abyss-textPrimary light:text-alabaster-textPrimary">BytFloww Spend Intelligence</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-jade-500/20 text-jade-500 border border-jade-500/30">
                  REAL-TIME ENGINE
                </span>
              </div>
              <p className="text-[11px] text-abyss-textMuted">
                Live Indian SMS Parser • 0% Mock Data • <span className="text-jade-500 font-semibold">{rawCount.toLocaleString('en-IN')} Real Messages</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-abyss-well p-0.5 rounded-xl border border-abyss-border text-xs">
              <button
                onClick={() => setDeviceMode('MOBILE')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  deviceMode === 'MOBILE' ? 'bg-jade-500 text-abyss-canvas font-bold shadow-solid-sm' : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
                }`}
              >
                📱 Mobile Frame
              </button>
              <button
                onClick={() => setDeviceMode('EXPANDED')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  deviceMode === 'EXPANDED' ? 'bg-jade-500 text-abyss-canvas font-bold shadow-solid-sm' : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
                }`}
              >
                🖥️ Responsive Full
              </button>
            </div>

            {/* Upload XML */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-jade-500/10 hover:bg-jade-500/20 text-jade-500 border border-jade-500/30 text-xs font-semibold transition"
            >
              <span>📥</span>
              <span className="hidden xs:inline">Upload XML</span>
            </button>

            {/* Diagnostics */}
            <button
              onClick={onOpenDiagnostics}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-abyss-well hover:bg-abyss-elevated text-abyss-textSecondary border border-abyss-border text-xs font-medium transition"
            >
              <span>⚡</span>
              <span className="hidden xs:inline">Diagnostics</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-abyss-well hover:bg-abyss-elevated border border-abyss-border text-sm transition"
              title="Toggle Dark / Light Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4 flex justify-center items-start">
        {deviceMode === 'MOBILE' ? (
          <div className="w-full max-w-[430px] rounded-[44px] p-3 shadow-solid-card-dark transition-all border border-abyss-border bg-abyss-card">
            {/* Phone Screen Housing */}
            <div className={`w-full rounded-[36px] overflow-hidden min-h-[820px] max-h-[88vh] flex flex-col transition-colors duration-200 relative ${
              isDark ? 'bg-abyss-canvas text-abyss-textPrimary' : 'bg-alabaster-canvas text-alabaster-textPrimary'
            }`}>
              {/* Android Status Bar */}
              <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold select-none opacity-80">
                <span className="text-[11px] font-mono">10:42</span>
                {/* Dynamic Island / Notch Pill */}
                <div className="w-20 h-4 bg-abyss-canvas rounded-full flex items-center justify-center border border-abyss-border">
                  <div className="w-2 h-2 rounded-full bg-jade-500 animate-pulse mr-1.5" />
                  <span className="text-[8px] font-mono text-jade-400">BYTFLOWW</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <span>📶</span>
                  <span>🔋 94%</span>
                </div>
              </div>

              {/* Mobile Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-6">
                {children}
              </div>

              {/* Android Home Indicator Bar */}
              <div className="py-2 flex justify-center items-center bg-transparent pointer-events-none">
                <div className="w-32 h-1 bg-abyss-border rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className={`w-full rounded-3xl p-4 sm:p-6 shadow-solid-card-dark border transition-all ${
            isDark ? 'bg-abyss-card border-abyss-border text-abyss-textPrimary' : 'bg-white border-alabaster-border text-alabaster-textPrimary'
          }`}>
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
