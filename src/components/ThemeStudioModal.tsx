import React from 'react';
import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId, setActiveThemeId } from '../theme/themes';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onToggleDark,
}) => {
  const [selectedTheme, setSelectedTheme] = React.useState<ThemeTemplateId>(getActiveThemeId());

  if (!isOpen) return null;

  const handleSelectTheme = (id: ThemeTemplateId) => {
    setSelectedTheme(id);
    setActiveThemeId(id);
  };

  const templatesList = Object.values(THEME_TEMPLATES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-emergence">
      <div 
        className="w-full max-w-4xl rounded-[24px] bg-abyss-card border border-abyss-borderStrong shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-abyss-border flex items-center justify-between bg-abyss-elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-jade-500/20 border border-jade-500/40 flex items-center justify-center text-xl">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-abyss-textPrimary tracking-tight">
                  BytFloww Theme Studio
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-jade-500/20 text-jade-500 border border-jade-500/30 uppercase tracking-wider">
                  Billion-Dollar Presets
                </span>
              </div>
              <p className="text-xs text-abyss-textMuted mt-0.5">
                Switch instantly between 5 world-class startup design languages & color palettes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Switch */}
            <button
              onClick={onToggleDark}
              className="spatial-btn px-3.5 py-1.5 text-xs flex items-center gap-1.5"
            >
              <span>{isDark ? '☀️' : '🌙'}</span>
              <span>{isDark ? 'Light Ceramic' : 'Dark Obsidian'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-abyss-well hover:bg-abyss-elevated border border-abyss-border flex items-center justify-center text-abyss-textMuted hover:text-abyss-textPrimary text-sm font-bold transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesList.map((tpl) => {
              const isCurrent = selectedTheme === tpl.id;
              const activePalette = isDark ? tpl.dark : tpl.light;

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTheme(tpl.id)}
                  className={`p-5 rounded-[20px] border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
                    isCurrent
                      ? 'bg-abyss-elevated border-jade-500 shadow-lg shadow-jade-500/10 ring-1 ring-jade-500'
                      : 'bg-abyss-well border-abyss-border hover:border-abyss-borderStrong hover:bg-abyss-elevated'
                  }`}
                >
                  {/* Active Indicator Chip */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-jade-500 text-black text-[9px] font-bold tracking-wider uppercase">
                      <span>✓</span> ACTIVE
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Header with Icon & Badge */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{tpl.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-abyss-textPrimary leading-none">
                          {tpl.name}
                        </div>
                        <span className="text-[10px] text-abyss-textMuted font-mono block mt-1">
                          {tpl.inspiration}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-abyss-textSecondary font-medium">
                      {tpl.tagline}
                    </p>

                    {/* Swatches Visual Strip */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[10px] text-abyss-textMuted uppercase font-bold tracking-wider">
                        Color Language
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-6 h-6 rounded-md shadow-sm border border-white/20 shrink-0" 
                          style={{ backgroundColor: tpl.swatches.primary }} 
                          title="Primary Hero / Inflow"
                        />
                        <div 
                          className="w-6 h-6 rounded-md shadow-sm border border-white/20 shrink-0" 
                          style={{ backgroundColor: tpl.swatches.ai }} 
                          title="AI Forensics / Synapse"
                        />
                        <div 
                          className="w-6 h-6 rounded-md shadow-sm border border-white/20 shrink-0" 
                          style={{ backgroundColor: tpl.swatches.spend }} 
                          title="Outflow / Pulse"
                        />
                        <div 
                          className="w-6 h-6 rounded-md shadow-sm border border-white/20 shrink-0" 
                          style={{ backgroundColor: tpl.swatches.vault }} 
                          title="Vault / Net Worth"
                        />
                        <div 
                          className="w-6 h-6 rounded-md shadow-sm border border-white/20 shrink-0" 
                          style={{ backgroundColor: tpl.swatches.telemetry }} 
                          title="Telemetry / Ice"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-4 mt-4 border-t border-abyss-border/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-abyss-textMuted">
                      {tpl.badge}
                    </span>
                    <button
                      className={`text-xs font-bold px-3 py-1 rounded-full transition ${
                        isCurrent
                          ? 'bg-jade-500 text-black'
                          : 'bg-abyss-well text-abyss-textPrimary group-hover:bg-jade-500/20 group-hover:text-jade-500'
                      }`}
                    >
                      {isCurrent ? 'Applied' : 'Apply Theme →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Preview Card Box */}
          <div className="p-5 rounded-[18px] bg-abyss-elevated border border-abyss-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-abyss-textPrimary uppercase tracking-wider">
                ⚡ Real-time Component Preview
              </span>
              <span className="font-mono text-abyss-textMuted text-[11px]">
                Active: {THEME_TEMPLATES[selectedTheme]?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-abyss-card border border-abyss-border">
                <span className="text-[10px] font-bold text-jade-500 uppercase block">Inflow Surplus</span>
                <span className="text-lg font-bold font-mono text-jade-500">₹1,24,500</span>
              </div>
              <div className="p-3.5 rounded-xl bg-abyss-card border border-abyss-border">
                <span className="text-[10px] font-bold text-pulse-500 uppercase block">Outflow Debits</span>
                <span className="text-lg font-bold font-mono text-pulse-500">₹54,510</span>
              </div>
              <div className="p-3.5 rounded-xl bg-abyss-card border border-abyss-border">
                <span className="text-[10px] font-bold text-synapse-500 uppercase block">AI Forensics</span>
                <span className="text-lg font-bold font-mono text-synapse-500">100% Deterministic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-abyss-border bg-abyss-card flex items-center justify-between text-xs text-abyss-textMuted">
          <span>Preferences are automatically saved to your browser session.</span>
          <button
            onClick={onClose}
            className="spatial-btn-selected px-6 py-2 rounded-full text-xs font-bold"
          >
            Done & Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
