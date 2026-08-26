import React from 'react';

interface BrandLogoBadgeProps {
  entityName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface BrandTheme {
  bg: string;
  text: string;
  icon: string;
  abbr: string;
  name: string;
}

// Comprehensive mapping of Indian Banks, NBFC Lenders, Lifestyle Merchants, and Employers
const BRAND_MAP: Record<string, BrandTheme> = {
  // ── BANKS ─────────────────────────────────────────────────────────────
  sbi: { bg: 'bg-[#280071]', text: 'text-white', icon: '🏛️', abbr: 'SBI', name: 'State Bank of India' },
  hdfc: { bg: 'bg-[#004B87]', text: 'text-white', icon: '🏦', abbr: 'HDFC', name: 'HDFC Bank' },
  icici: { bg: 'bg-[#B02A30]', text: 'text-white', icon: '🏛️', abbr: 'ICICI', name: 'ICICI Bank' },
  axis: { bg: 'bg-[#97144D]', text: 'text-white', icon: '🏦', abbr: 'AXIS', name: 'Axis Bank' },
  kotak: { bg: 'bg-[#ED1C24]', text: 'text-white', icon: '🏦', abbr: 'KMBL', name: 'Kotak Mahindra Bank' },
  pnb: { bg: 'bg-[#A20025]', text: 'text-white', icon: '🏛️', abbr: 'PNB', name: 'Punjab National Bank' },
  canara: { bg: 'bg-[#0091DA]', text: 'text-white', icon: '🏦', abbr: 'CAN', name: 'Canara Bank' },
  bob: { bg: 'bg-[#F26522]', text: 'text-white', icon: '🏦', abbr: 'BOB', name: 'Bank of Baroda' },

  // ── LENDERS / NBFCS ───────────────────────────────────────────────────
  mpokket: { bg: 'bg-[#FF6B35]', text: 'text-slate-950', icon: '📱', abbr: 'mP', name: 'mPokket Financial' },
  zed: { bg: 'bg-[#14B8A6]', text: 'text-slate-950', icon: '⚡', abbr: 'ZED', name: 'Zed Leafin (Prefr)' },
  leafin: { bg: 'bg-[#14B8A6]', text: 'text-slate-950', icon: '⚡', abbr: 'ZED', name: 'Zed Leafin (Prefr)' },
  prefr: { bg: 'bg-[#14B8A6]', text: 'text-slate-950', icon: '⚡', abbr: 'PRE', name: 'Prefr Loans' },
  meghdoot: { bg: 'bg-[#6366F1]', text: 'text-white', icon: '☁️', abbr: 'MEG', name: 'Meghdoot Mercantile' },
  vivifi: { bg: 'bg-[#8B5CF6]', text: 'text-white', icon: '💳', abbr: 'VVF', name: 'VIVIFI India (FlexSalary)' },
  flexsalary: { bg: 'bg-[#8B5CF6]', text: 'text-white', icon: '💳', abbr: 'FLX', name: 'FlexSalary' },
  salaryontime: { bg: 'bg-[#F59E0B]', text: 'text-slate-950', icon: '⏱️', abbr: 'SOT', name: 'SalaryOnTime' },
  snapmint: { bg: 'bg-[#06B6D4]', text: 'text-slate-950', icon: '🛍️', abbr: 'SNP', name: 'Snapmint' },
  lendingplate: { bg: 'bg-[#3B82F6]', text: 'text-white', icon: '🍽️', abbr: 'LND', name: 'Lendingplate' },
  branch: { bg: 'bg-[#10B981]', text: 'text-slate-950', icon: '🌿', abbr: 'BRA', name: 'Branch International' },
  tala: { bg: 'bg-[#F43F5E]', text: 'text-white', icon: '💰', abbr: 'TAL', name: 'Talazen (Tala)' },
  kreditbee: { bg: 'bg-[#FFD100]', text: 'text-slate-950', icon: '🐝', abbr: 'KB', name: 'KreditBee' },
  cashe: { bg: 'bg-[#34D399]', text: 'text-slate-950', icon: '💵', abbr: 'CSH', name: 'CASHe' },
  fibe: { bg: 'bg-[#4F46E5]', text: 'text-white', icon: '⚡', abbr: 'FIB', name: 'Fibe (EarlySalary)' },

  // ── MERCHANTS ────────────────────────────────────────────────────────
  swiggy: { bg: 'bg-[#FC8019]', text: 'text-white', icon: '🍔', abbr: 'SWG', name: 'Swiggy' },
  zomato: { bg: 'bg-[#CB202D]', text: 'text-white', icon: '🍕', abbr: 'ZOM', name: 'Zomato' },
  uber: { bg: 'bg-[#000000]', text: 'text-white', icon: '🚕', abbr: 'UBR', name: 'Uber' },
  ola: { bg: 'bg-[#86B817]', text: 'text-slate-950', icon: '🚖', abbr: 'OLA', name: 'Ola Cabs' },
  amazon: { bg: 'bg-[#FF9900]', text: 'text-slate-950', icon: '📦', abbr: 'AMZ', name: 'Amazon' },
  flipkart: { bg: 'bg-[#2874F0]', text: 'text-white', icon: '🛒', abbr: 'FLP', name: 'Flipkart' },
  zepto: { bg: 'bg-[#7C3AED]', text: 'text-white', icon: '⚡', abbr: 'ZPT', name: 'Zepto' },
  blinkit: { bg: 'bg-[#F8E71C]', text: 'text-slate-950', icon: '⚡', abbr: 'BLN', name: 'Blinkit' },
  apollo: { bg: 'bg-[#00A859]', text: 'text-white', icon: '💊', abbr: 'APO', name: 'Apollo Pharmacy' },
  netflix: { bg: 'bg-[#E50914]', text: 'text-white', icon: '🎬', abbr: 'NFLX', name: 'Netflix' },
  spotify: { bg: 'bg-[#1DB954]', text: 'text-slate-950', icon: '🎵', abbr: 'SPT', name: 'Spotify' },
  google: { bg: 'bg-[#4285F4]', text: 'text-white', icon: '🔍', abbr: 'GGL', name: 'Google' },
  apple: { bg: 'bg-[#A2AAAD]', text: 'text-slate-950', icon: '🍏', abbr: 'APL', name: 'Apple' },

  // ── STATUTORY & EMPLOYER ─────────────────────────────────────────────
  epfo: { bg: 'bg-[#0284C7]', text: 'text-white', icon: '🏛️', abbr: 'EPF', name: 'EPFO India' },
  newgen: { bg: 'bg-[#059669]', text: 'text-white', icon: '💼', abbr: 'NWG', name: 'Newgen Software' },
};

export function resolveBrandTheme(rawName: string): BrandTheme {
  const norm = (rawName || '').toLowerCase().trim();

  for (const [key, theme] of Object.entries(BRAND_MAP)) {
    if (norm.includes(key)) {
      return theme;
    }
  }

  // Fallback monogram
  const clean = (rawName || 'BY').replace(/[^a-zA-Z0-9]/g, '');
  const abbr = (clean.substring(0, 3) || 'TX').toUpperCase();

  return {
    bg: 'bg-abyss-well',
    text: 'text-abyss-textPrimary',
    icon: '💳',
    abbr,
    name: rawName || 'Transaction Entity',
  };
}

export const BrandLogoBadge: React.FC<BrandLogoBadgeProps> = ({
  entityName,
  size = 'md',
  className = '',
}) => {
  const theme = resolveBrandTheme(entityName);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[9px] rounded-lg',
    md: 'w-8 h-8 text-[11px] rounded-xl',
    lg: 'w-10 h-10 text-xs rounded-2xl',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-black shrink-0 shadow-sm border border-white/10 ${sizeClasses[size]} ${theme.bg} ${theme.text} ${className}`}
      title={theme.name}
    >
      <span>{theme.abbr}</span>
    </div>
  );
};
