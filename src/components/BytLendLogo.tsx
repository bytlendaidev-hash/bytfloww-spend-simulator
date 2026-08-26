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
    sm: 'w-7 h-7 rounded-[10px]',
    md: 'w-10 h-10 rounded-[14px]',
    lg: 'w-14 h-14 rounded-[18px]',
    xl: 'w-20 h-20 rounded-[24px]',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3D Gold Squircle Emblem */}
      <div 
        className={`${sizeMap[size]} relative flex items-center justify-center p-1.5 shrink-0 bg-gradient-to-b from-[#1E232A] to-[#0A0D11] border border-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:scale-105`}
        style={{
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.35), inset 0 1px 1px rgba(243, 230, 177, 0.4)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bytlendGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9F1D8" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="70%" stopColor="#AA7C11" />
              <stop offset="100%" stopColor="#E5C158" />
            </linearGradient>
            <linearGradient id="bytlendGoldGradLight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#AA7C11" />
              <stop offset="50%" stopColor="#F3E6B1" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>

          {/* Left Vertical Spine Bar */}
          <path
            d="M26 18C26 16.8954 26.8954 16 28 16H34C35.1046 16 36 16.8954 36 18V82C36 83.1046 35.1046 84 34 84H28C26.8954 84 26 83.1046 26 82V18Z"
            fill="url(#bytlendGoldGrad)"
          />

          {/* Top Angled Chevron */}
          <path
            d="M48 20C48 18.8954 48.8954 18 50 18H58C58.7403 18 59.4316 18.4087 59.7913 19.0573L77.7913 51.0573C78.4735 52.2852 77.5855 53.8 76.1857 53.8H67.8143C67.074 53.8 66.3827 53.3913 66.023 52.7427L51.023 25.7427C50.3408 24.5148 51.2288 23 52.6286 23H48V20Z"
            fill="url(#bytlendGoldGradLight)"
          />

          {/* Middle Inner Chevron */}
          <path
            d="M48 42C48 40.8954 48.8954 40 50 40H56C56.7403 40 57.4316 40.4087 57.7913 41.0573L67.7913 58.8351C68.4735 60.063 67.5855 61.5778 66.1857 61.5778H59.8143C59.074 61.5778 58.3827 61.1691 58.023 60.5205L50.023 46.1205C49.3408 44.8926 50.2288 43.3778 51.6286 43.3778H48V42Z"
            fill="url(#bytlendGoldGrad)"
          />

          {/* Bottom Angled Chevron Leg */}
          <path
            d="M78 80C78 81.1046 77.1046 82 76 82H68C67.2597 82 66.5684 81.5913 66.2087 80.9427L44.2087 41.9427C43.5265 40.7148 44.4145 39.2 45.8143 39.2H54.1857C54.926 39.2 55.6173 39.6087 55.977 40.2573L76.977 77.2573C77.6592 78.4852 76.7712 80 75.3714 80H78Z"
            fill="url(#bytlendGoldGrad)"
          />
        </svg>
      </div>

      {/* Brand Typography Lockup */}
      {showText && (
        <div>
          <div className="flex items-center text-lg sm:text-xl font-bold tracking-tight">
            <span className="text-white">Byt</span>
            <span className="bg-gradient-to-r from-[#F3E6B1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent ml-0.5">
              Lend
            </span>
          </div>
          <div className="text-[8px] font-bold tracking-[0.2em] text-[#D4AF37]/80 uppercase mt-0.5">
            Borrow Smarter. Live Better.
          </div>
        </div>
      )}
    </div>
  );
};
