import React from 'react';

interface BytLendLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
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
      {/* 3D Rose-Gold Squircle Emblem matching exact reference */}
      <div 
        className={`${sizeMap[size]} relative flex items-center justify-center p-2 shrink-0 bg-gradient-to-b from-[#14171D] via-[#0E1116] to-[#080A0D] border-[1.5px] border-[#D49B5A] shadow-[0_8px_28px_rgba(0,0,0,0.85),0_0_20px_rgba(212,155,90,0.3)] transition-transform duration-300 hover:scale-105`}
        style={{
          boxShadow: '0 8px 30px rgba(0,0,0,0.9), inset 0 1px 1.5px rgba(243, 210, 162, 0.7), 0 0 16px rgba(212, 155, 90, 0.25)',
        }}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Satin Brushed Rose-Gold Metallic Gradient */}
            <linearGradient id="roseGold3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9E7B9" />
              <stop offset="25%" stopColor="#E5A96A" />
              <stop offset="60%" stopColor="#B87B3D" />
              <stop offset="85%" stopColor="#D49B5A" />
              <stop offset="100%" stopColor="#8F5C26" />
            </linearGradient>

            {/* Top Light Glint Gradient */}
            <linearGradient id="roseGoldHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A86E32" />
              <stop offset="40%" stopColor="#ECC18D" />
              <stop offset="70%" stopColor="#FFF2D6" />
              <stop offset="100%" stopColor="#D49B5A" />
            </linearGradient>

            {/* Inner Depth Shadow */}
            <filter id="goldDepth" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 1. Left Vertical Spine Pill (Bar 1) */}
          <path
            d="M32 24C32 20.6863 34.6863 18 38 18C41.3137 18 44 20.6863 44 24V96C44 99.3137 41.3137 102 38 102C34.6863 102 32 99.3137 32 96V24Z"
            fill="url(#roseGold3D)"
            filter="url(#goldDepth)"
          />

          {/* 2. Top-Right Angled Diagonal Pill (Bar 2) */}
          <path
            d="M58 24C58 20.6863 60.6863 18 64 18H72C74.6522 18 77.1087 19.4673 78.4343 21.7671L90.4343 42.5671C92.0519 45.3742 90.0384 48.9 86.8 48.9H78.8C76.1478 48.9 73.6913 47.4327 72.3657 45.1329L60.3657 24.3329C58.8471 21.6967 58 22.8464 58 24Z"
            fill="url(#roseGoldHighlight)"
            filter="url(#goldDepth)"
          />

          {/* 3. Middle Arrowhead Chevron (Bar 3) */}
          <path
            d="M58 48C58 45.2386 60.2386 43 63 43H68C70.1217 43 72.087 44.1739 73.1475 46.0137L81.1475 59.8863C82.4187 62.0914 80.8288 64.9 78.2713 64.9H73.2713C71.1496 64.9 69.1843 63.7261 68.1238 61.8863L60.1238 48.0137C58.8525 45.8086 58 46.6193 58 48Z"
            fill="url(#roseGold3D)"
            filter="url(#goldDepth)"
          />

          {/* 4. Bottom-Right Angled Diagonal Leg (Bar 4) */}
          <path
            d="M92 96C92 99.3137 89.3137 102 86 102H78C75.3478 102 72.8913 100.533 71.5657 98.2329L53.5657 67.0329C51.9481 64.2258 53.9616 60.7 57.2 60.7H65.2C67.8522 60.7 70.3087 62.1673 71.6343 64.4671L89.6343 95.6671C91.1529 98.3033 92 97.1536 92 96Z"
            fill="url(#roseGold3D)"
            filter="url(#goldDepth)"
          />
        </svg>
      </div>

      {/* Exact Typography matching BytLend brand guidelines */}
      {showText && (
        <div>
          <div className="flex items-center text-xl sm:text-2xl font-bold tracking-tight">
            <span className="text-white font-semibold">Byt</span>
            <span className="bg-gradient-to-r from-[#F9E7B9] via-[#E5A96A] to-[#B87B3D] bg-clip-text text-transparent ml-0.5 font-bold">
              Lend
            </span>
          </div>
          <div className="text-[9px] font-bold tracking-[0.25em] text-[#D49B5A] uppercase mt-0.5">
            Borrow Smarter. Live Better.
          </div>
        </div>
      )}
    </div>
  );
};
