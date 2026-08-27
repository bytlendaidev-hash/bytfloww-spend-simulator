import React from 'react';

interface BytLendLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export const BytLendLogo: React.FC<BytLendLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-[12px]',
    md: 'w-10 h-10 rounded-[14px]',
    lg: 'w-14 h-14 rounded-[20px]',
    xl: 'w-20 h-20 rounded-[28px]',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Squircle Emblem with Champagne / Cyan Specular Border */}
      <div 
        className={`${sizeMap[size]} relative flex items-center justify-center p-2 shrink-0 bg-gradient-to-b from-[#10222D] to-[#061118] border border-cyan-500/30 dark:border-cyan-400/40 shadow-lg shadow-cyan-500/15 transition-transform duration-200 hover:scale-105 group overflow-hidden`}
      >
        {/* Ambient Radial Glow inside logo */}
        <div className="absolute inset-0 bg-cyan-500/15 rounded-[inherit] pointer-events-none" />

        <svg
          viewBox="0 0 120 120"
          className="w-full h-full relative z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D2FF" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="logoVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
            <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EDC184" />
              <stop offset="100%" stopColor="#C88A45" />
            </linearGradient>
          </defs>

          {/* 1. Left Vertical Spine Pill (Bar 1 - Cyan Gradient) */}
          <path
            d="M32 24C32 20.6863 34.6863 18 38 18C41.3137 18 44 20.6863 44 24V96C44 99.3137 41.3137 102 38 102C34.6863 102 32 99.3137 32 96V24Z"
            fill="url(#logoCyanGrad)"
          />

          {/* 2. Top-Right Angled Diagonal Pill (Bar 2 - Violet/Magenta) */}
          <path
            d="M58 24C58 20.6863 60.6863 18 64 18H72C74.6522 18 77.1087 19.4673 78.4343 21.7671L90.4343 42.5671C92.0519 45.3742 90.0384 48.9 86.8 48.9H78.8C76.1478 48.9 73.6913 47.4327 72.3657 45.1329L60.3657 24.3329C58.8471 21.6967 58 22.8464 58 24Z"
            fill="url(#logoVioletGrad)"
          />

          {/* 3. Middle Arrowhead Chevron (Bar 3 - Gold/Champagne) */}
          <path
            d="M58 48C58 45.2386 60.2386 43 63 43H68C70.1217 43 72.087 44.1739 73.1475 46.0137L81.1475 59.8863C82.4187 62.0914 80.8288 64.9 78.2713 64.9H73.2713C71.1496 64.9 69.1843 63.7261 68.1238 61.8863L60.1238 48.0137C58.8525 45.8086 58 46.6193 58 48Z"
            fill="url(#logoGoldGrad)"
          />

          {/* 4. Bottom-Right Angled Diagonal Leg (Bar 4 - Cyan Gradient) */}
          <path
            d="M92 96C92 99.3137 89.3137 102 86 102H78C75.3478 102 72.8913 100.533 71.5657 98.2329L53.5657 67.0329C51.9481 64.2258 53.9616 60.7 57.2 60.7H65.2C67.8522 60.7 70.3087 62.1673 71.6343 64.4671L89.6343 95.6671C91.1529 98.3033 92 97.1536 92 96Z"
            fill="url(#logoCyanGrad)"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-lg sm:text-xl font-extrabold tracking-tight">
            <span className="text-abyss-textPrimary font-black">Byt</span>
            <span className="text-cyan-400 dark:text-cyan-300 ml-0.5 font-black">
              Floww
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400/80 uppercase mt-0.5">
            FINTECH OS
          </span>
        </div>
      )}
    </div>
  );
};
