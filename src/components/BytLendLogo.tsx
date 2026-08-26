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
    md: 'w-11 h-11 rounded-[16px]',
    lg: 'w-16 h-16 rounded-[22px]',
    xl: 'w-24 h-24 rounded-[32px]',
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Solid Sovereign Jade Squircle Emblem */}
      <div 
        className={`${sizeMap[size]} relative flex items-center justify-center p-2 shrink-0 bg-abyss-card dark:bg-abyss-card light:bg-white border-[1.5px] border-jade-500/50 shadow-solid-md transition-transform duration-200 hover:scale-105`}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. Left Vertical Spine Pill (Bar 1 - Solid Sovereign Jade) */}
          <path
            d="M32 24C32 20.6863 34.6863 18 38 18C41.3137 18 44 20.6863 44 24V96C44 99.3137 41.3137 102 38 102C34.6863 102 32 99.3137 32 96V24Z"
            className="fill-jade-500"
          />

          {/* 2. Top-Right Angled Diagonal Pill (Bar 2 - Solid Synapse Iris) */}
          <path
            d="M58 24C58 20.6863 60.6863 18 64 18H72C74.6522 18 77.1087 19.4673 78.4343 21.7671L90.4343 42.5671C92.0519 45.3742 90.0384 48.9 86.8 48.9H78.8C76.1478 48.9 73.6913 47.4327 72.3657 45.1329L60.3657 24.3329C58.8471 21.6967 58 22.8464 58 24Z"
            className="fill-synapse-500"
          />

          {/* 3. Middle Arrowhead Chevron (Bar 3 - Solid Sovereign Jade) */}
          <path
            d="M58 48C58 45.2386 60.2386 43 63 43H68C70.1217 43 72.087 44.1739 73.1475 46.0137L81.1475 59.8863C82.4187 62.0914 80.8288 64.9 78.2713 64.9H73.2713C71.1496 64.9 69.1843 63.7261 68.1238 61.8863L60.1238 48.0137C58.8525 45.8086 58 46.6193 58 48Z"
            className="fill-jade-500"
          />

          {/* 4. Bottom-Right Angled Diagonal Leg (Bar 4 - Solid Synapse Iris) */}
          <path
            d="M92 96C92 99.3137 89.3137 102 86 102H78C75.3478 102 72.8913 100.533 71.5657 98.2329L53.5657 67.0329C51.9481 64.2258 53.9616 60.7 57.2 60.7H65.2C67.8522 60.7 70.3087 62.1673 71.6343 64.4671L89.6343 95.6671C91.1529 98.3033 92 97.1536 92 96Z"
            className="fill-synapse-500"
          />
        </svg>
      </div>

      {/* Solid Typography */}
      {showText && (
        <div>
          <div className="flex items-center text-xl sm:text-2xl font-bold tracking-tight">
            <span className="text-abyss-textPrimary dark:text-abyss-textPrimary font-bold">Byt</span>
            <span className="text-jade-500 dark:text-jade-500 ml-0.5 font-black">
              Lend
            </span>
          </div>
          <div className="text-[9px] font-bold tracking-[0.25em] text-synapse-500 dark:text-synapse-400 uppercase mt-0.5">
            Autonomous AI Capital Forensics
          </div>
        </div>
      )}
    </div>
  );
};
