import React, { useState, useMemo } from 'react';

interface MerchantLogoViewProps {
  merchantName: string;
  size?: number; // size in px, default 40
  isDark?: boolean;
  className?: string;
  shape?: 'rounded' | 'circle' | 'square';
}

// 100+ Indian & Global Brand Domain Registry matching Android BrandIconResolver.kt
const DOMAIN_REGISTRY: Record<string, string> = {
  // Food & Quick Commerce
  'SWIGGY': 'swiggy.com',
  'INSTAMART': 'swiggy.com',
  'ZOMATO': 'zomato.com',
  'BLINKIT': 'blinkit.com',
  'GROFERS': 'blinkit.com',
  'ZEPTO': 'zeptonow.com',
  'BIGBASKET': 'bigbasket.com',
  'BB DAILY': 'bigbasket.com',
  'DUNZO': 'dunzo.com',
  'DOMINOS': 'dominos.co.in',
  'MCDONALDS': 'mcdonaldsindia.com',
  'KFC': 'kfc.co.in',
  'STARBUCKS': 'starbucks.in',
  'BURGER KING': 'burgerking.in',
  'PIZZA HUT': 'pizzahut.co.in',
  'SUBWAY': 'subway.com',
  'CHAAYOS': 'chaayos.com',
  'EATCLUB': 'eatclub.in',
  'BOX8': 'box8.in',
  'LICIOUS': 'licious.in',

  // E-Commerce, Retail & Fashion
  'AMAZON': 'amazon.in',
  'AMZN': 'amazon.in',
  'FLIPKART': 'flipkart.com',
  'MYNTRA': 'myntra.com',
  'MEESHO': 'meesho.com',
  'AJIO': 'ajio.com',
  'NYKAA': 'nykaa.com',
  'TRENDS': 'relianceretail.com',
  'RELIANCE': 'relianceretail.com',
  'TATA NEU': 'tatadigital.com',
  'TATA CLIQ': 'tatacliq.com',
  'CROMA': 'croma.com',
  'ZARA': 'zara.com',
  'H&M': 'hm.com',
  'HM': 'hm.com',
  'LENSKART': 'lenskart.com',
  'DECATHLON': 'decathlon.in',
  'URBAN COMPANY': 'urbancompany.com',

  // Streaming OTT & Entertainment
  'NETFLIX': 'netflix.com',
  'SPOTIFY': 'spotify.com',
  'YOUTUBE': 'youtube.com',
  'HOTSTAR': 'hotstar.com',
  'DISNEY': 'hotstar.com',
  'PRIME VIDEO': 'primevideo.com',
  'PRIME': 'amazon.in',
  'APPLE': 'apple.com',
  'GOOGLE': 'google.com',
  'GOOGLE PLAY': 'google.com',
  'GOOGLE ONE': 'google.com',
  'SONY LIV': 'sonyliv.com',
  'SONYLIV': 'sonyliv.com',
  'ZEE5': 'zee5.com',
  'JIOCINEMA': 'jiocinema.com',
  'CHATGPT': 'openai.com',
  'OPENAI': 'openai.com',
  'BOOKMYSHOW': 'bookmyshow.com',
  'PVR': 'pvrcinemas.com',
  'INOX': 'pvrcinemas.com',

  // Travel, Mobility & Fuel
  'UBER': 'uber.com',
  'OLA': 'olacabs.com',
  'RAPIDO': 'rapido.bike',
  'MAKEMYTRIP': 'makemytrip.com',
  'MMT': 'makemytrip.com',
  'GOIBIBO': 'goibibo.com',
  'IRCTC': 'irctc.co.in',
  'INDIGO': 'goindigo.in',
  'AIR INDIA': 'airindia.com',
  'REDBUS': 'redbus.in',
  'BLUSMART': 'blu-smart.com',
  'INDIAN OIL': 'iocl.com',
  'IOCL': 'iocl.com',
  'HPCL': 'hindustanpetroleum.com',
  'BPCL': 'bharatpetroleum.in',
  'SHELL': 'shell.in',

  // Lending, Fintech & Wallets
  'MPOKKET': 'mpokket.in',
  'FLEXSALARY': 'flexsalary.com',
  'VIVIFI': 'vivifi.in',
  'BRANCH': 'branch.co',
  'GROW MONEY': 'growmoneycapital.com',
  'TALAZEN': 'talazenfinance.com',
  'MONEYVIEW': 'moneyview.in',
  'MONEYTAP': 'moneytap.com',
  'KREDITBEE': 'kreditbee.in',
  'LENDINGPLATE': 'lendingplate.com',
  'CRED': 'cred.club',
  'PHONEPE': 'phonepe.com',
  'GPAY': 'pay.google.com',
  'PAYTM': 'paytm.com',
  'BHIM': 'bhimupi.org.in',
  'GROWW': 'groww.in',
  'ZERODHA': 'zerodha.com',
  'RAZORPAY': 'razorpay.com',
  'CASHFREE': 'cashfree.com',
  'SLICE': 'sliceit.com',
  'JUPITER': 'jupiter.money',
  'FI': 'fi.money',
  'NAVI': 'navi.com',
  'MOBIKWIK': 'mobikwik.com',
  'AGIONE': 'agionetech.com',

  // Major Indian Banks & Telecom
  'HDFC': 'hdfcbank.com',
  'SBI': 'sbi.co.in',
  'ICICI': 'icicibank.com',
  'AXIS': 'axisbank.com',
  'KOTAK': 'kotak.com',
  'IDFC': 'idfcfirstbank.com',
  'PNB': 'pnbindia.in',
  'BOB': 'bankofbaroda.in',
  'AIRTEL': 'airtel.in',
  'JIO': 'jio.com',
  'VI': 'myvi.in',
  'UPPCL': 'upenergy.in',
  'HATHWAY': 'hathway.com',
};

// Deterministic Brand Colors
const BRAND_COLORS = [
  '#00BFA5', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316',
  '#10B981', '#06B6D4', '#6366F1', '#EF4444', '#EAB308',
];

export const MerchantLogoView: React.FC<MerchantLogoViewProps> = ({
  merchantName,
  size = 40,
  isDark = true,
  className = '',
  shape = 'rounded',
}) => {
  const [imgError, setImgError] = useState(false);

  const cleanName = (merchantName || 'Merchant').trim();

  // 1. Resolve canonical domain
  const domain = useMemo(() => {
    const upper = cleanName.toUpperCase();
    for (const [key, dom] of Object.entries(DOMAIN_REGISTRY)) {
      if (upper.includes(key)) return dom;
    }
    // Fallback: clean word.com
    const cleanWord = cleanName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanWord.length >= 3 && cleanWord.length <= 20) {
      return `${cleanWord}.com`;
    }
    return null;
  }, [cleanName]);

  // 2. Resolve monogram
  const monogram = useMemo(() => {
    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    const clean = cleanName.replace(/[^a-zA-Z0-9]/g, '');
    return (clean.slice(0, 2) || 'TX').toUpperCase();
  }, [cleanName]);

  // 3. Resolve deterministic brand color
  const brandColor = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % BRAND_COLORS.length;
    return BRAND_COLORS[index];
  }, [cleanName]);

  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-lg' : 'rounded-2xl';

  // Primary Google S2 CDN + multi-CDN fallback
  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;

  return (
    <div
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      className={`relative flex items-center justify-center overflow-hidden border transition-all ${shapeClass} ${
        isDark ? 'bg-[#12232B] border-white/10' : 'bg-slate-100 border-slate-200'
      } ${className}`}
    >
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt={cleanName}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-1.5 transition-transform hover:scale-105"
        />
      ) : (
        <div
          style={{ backgroundColor: `${brandColor}25`, color: brandColor }}
          className="w-full h-full flex items-center justify-center font-black font-mono select-none"
        >
          <span style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}>
            {monogram}
          </span>
        </div>
      )}
    </div>
  );
};
