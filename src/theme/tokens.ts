/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BYTFLOWW / BYTLEND GLOBAL DESIGN TOKENS (Single Source of Truth)
 * ─────────────────────────────────────────────────────────────────────────────
 * Mapped 100% to BytLend Design System V9 & Aurora Cyber-Glassmorphism
 * Reference Project: cloud-sign-in-hub-main
 */

import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId } from './themes';

// ─────────────────────────────────────────────────────────────────────────────
// BRAND COLOR CONSTANTS (Derived from BytLend Design System V9)
// ─────────────────────────────────────────────────────────────────────────────

export const BRAND = {
  /** Primary Background — Rich Obsidian Black */
  obsidian:       '#090909',
  /** Secondary Background — Premium Graphite */
  graphite:       '#171717',
  /** Elevated Surface / Card — Premium Surface */
  surface:        '#202124',
  /** Premium Charcoal */
  charcoal:       '#151312',

  /** Champagne Gold Scale — Accents */
  goldHighlight:  '#EDC184', // Champagne Gold
  goldLight:      '#EDC184', // Warm Champagne Gold
  gold:           '#EDC184', // Warm Gold (Primary Accent)
  copper:         '#C88A45', // Luxury Gold / Copper
  bronze:         '#9C6234', // Metallic Bronze
  darkBronze:     '#8A5A2D', // Deep Bronze Shadow

  /** Stroke & Border Colors */
  strokeBorder:   'rgba(255, 255, 255, 0.08)',
  strokeHighlight:'rgba(255, 255, 255, 0.14)',
  strokeShadow:   'rgba(0, 0, 0, 0.4)',
  divider:        'rgba(255, 255, 255, 0.06)',

  /** Typography Colors */
  textPrimary:    '#FFFFFF', // Crisp White
  textSecondary:  '#94A3B8', // Cool Slate
  textMuted:      '#64748B', // Muted Slate
  textGoldTop:    '#EDC184',
  textGoldBottom: '#9C6234',

  /** Opacity Variations & Glows */
  goldFaint:      'rgba(237, 193, 132, 0.04)',
  goldSoft:       'rgba(237, 193, 132, 0.08)',
  goldGlow:       'rgba(237, 193, 132, 0.20)',
  goldBorder:     'rgba(237, 193, 132, 0.25)',
  goldBorderSubtle:'rgba(237, 193, 132, 0.12)',

  /** Status Colors */
  success:        '#22C55E',
  successBg:      'rgba(34, 197, 94, 0.12)',
  successBorder:  'rgba(34, 197, 94, 0.28)',
  warning:        '#F59E0B',
  warningBg:      'rgba(245, 158, 11, 0.12)',
  warningBorder:  'rgba(245, 158, 11, 0.28)',
  error:          '#EF4444',
  errorBg:        'rgba(239, 68, 68, 0.12)',
  errorBorder:    'rgba(239, 68, 68, 0.28)',

  /** AI Intelligence & Aurora Palette */
  aiBackground:   '#061118',
  aiSurface:      '#0D1E27',
  aiCard:         '#10222D',
  aiIndigo:       '#8B5CF6',
  aiAccent:       '#A78BFA',
  aiCyan:         '#06B6D4',
  aiDeepCyan:     '#0891B2',
  aiGlowColor:    'rgba(6, 182, 212, 0.25)',
  aiGradient:     'linear-gradient(135deg, #00D2FF 0%, #06B6D4 30%, #8B5CF6 75%, #D946EF 100%)',
  aiButtonGradient:'linear-gradient(135deg, #00D2FF 0%, #06B6D4 30%, #8B5CF6 75%, #D946EF 100%)',

  cyan:           '#06B6D4',
  cyanLight:      '#38BDF8',
  cyanGlow:       'rgba(6, 182, 212, 0.45)',
  purple:         '#8B5CF6',
  purpleLight:    '#A855F7',
  magenta:        '#D946EF',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LIGHT THEME TOKENS (Champagne Silk & Pure Premium White)
// ─────────────────────────────────────────────────────────────────────────────

export const lightTokens = {
  background:       '#FFFFFF', // Pure Premium White
  bgSecondary:      '#F8FAFC',
  bgElevated:       '#FFFFFF', // Pure White Cards
  bgHover:          '#F1F5F9',
 
  cardBg:           '#FFFFFF',
  cardBgSolid:      '#FFFFFF',
  cardBorder:       'rgba(46, 52, 69, 0.08)',
  cardBorderSubtle: 'rgba(46, 52, 69, 0.04)',

  textPrimary:   '#2E3445', // Slate
  textSecondary: '#5E667A', // Slate Gray
  textMuted:     '#8B95A5',
  textFaint:     '#B0B8C5',
  textWhite:     '#FFFFFF',

  indigo:        '#3D5AFE', // Royal AI Indigo
  indigoLight:   '#74C5FF',
  indigoSoft:    'rgba(61, 90, 254, 0.08)',
  indigoBorder:  'rgba(61, 90, 254, 0.15)',

  rose:          '#EF4444',
  roseSoft:      'rgba(239, 68, 68, 0.08)',

  mint:          '#00884E',
  mintSoft:      'rgba(0, 136, 78, 0.10)',
  mintBorder:    'rgba(0, 136, 78, 0.20)',

  gold:          '#C88A45', // Warm Gold for Light
  goldLight:     '#EDC184',
  goldSoft:      'rgba(200, 138, 69, 0.08)',
  goldBorder:    'rgba(200, 138, 69, 0.20)',

  success:       '#22C55E',
  successBg:     'rgba(34, 197, 94, 0.10)',
  successBorder: 'rgba(34, 197, 94, 0.20)',
  warning:       '#F59E0B',
  warningBg:     'rgba(245, 158, 11, 0.10)',
  warningBorder: 'rgba(245, 158, 11, 0.20)',
  danger:        '#EF4444',
  dangerBg:      'rgba(239, 68, 68, 0.10)',
  dangerBorder:  'rgba(239, 68, 68, 0.20)',
  info:          '#06B6D4',
  infoBg:        'rgba(6, 182, 212, 0.08)',

  border:        'rgba(46, 52, 69, 0.08)',
  borderStrong:  '#C88A45',
  borderSubtle:  'rgba(46, 52, 69, 0.04)',

  glassBg:       'rgba(255, 255, 255, 0.90)',
  glassBorder:   'rgba(46, 52, 69, 0.08)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DARK THEME TOKENS (Aurora Cyber-Glassmorphism & Obsidian-Teal)
// ─────────────────────────────────────────────────────────────────────────────

export const darkTokens = {
  background:       '#061118', // Deep Midnight Obsidian-Teal Canvas
  bgSecondary:      '#0D1E27', // Rich Dark Teal Slate
  bgElevated:       '#10222D', // Elevated Dark Frosted Surface
  bgHover:          '#162A37', // Subtle Teal Hover

  cardBg:           'rgba(16, 26, 35, 0.72)',
  cardBgSolid:      '#101F2B',
  cardBorder:       'rgba(255, 255, 255, 0.08)', // Frosted glass light border
  cardBorderSubtle: 'rgba(255, 255, 255, 0.05)',

  textPrimary:   '#FFFFFF', // Crisp White
  textSecondary: '#94A3B8', // Cool Slate Gray
  textMuted:     '#64748B', // Muted Slate
  textFaint:     '#475569',
  textWhite:     '#FFFFFF',

  // Aurora Cyber Accents
  cyan:          '#06B6D4', // Vibrant Electric Cyan
  cyanLight:     '#38BDF8', // Sky Cyan Highlight
  cyanSoft:      'rgba(6, 182, 212, 0.15)',
  cyanGlow:      'rgba(6, 182, 212, 0.45)',

  purple:        '#8B5CF6', // Electric Violet / Purple
  purpleLight:   '#A855F7',
  purpleSoft:    'rgba(139, 92, 246, 0.15)',
  purpleGlow:    'rgba(139, 92, 246, 0.40)',

  magenta:       '#D946EF', // Vivid Magenta
  magentaSoft:   'rgba(217, 70, 239, 0.15)',

  indigo:        '#38BDF8',
  indigoLight:   '#74C5FF',
  indigoSoft:    'rgba(56, 189, 248, 0.15)',
  indigoBorder:  'rgba(56, 189, 248, 0.28)',

  rose:          '#EF4444',
  roseSoft:      'rgba(239, 68, 68, 0.15)',

  mint:          '#06B6D4',
  mintSoft:      'rgba(6, 182, 212, 0.15)',
  mintBorder:    'rgba(6, 182, 212, 0.35)',

  gold:          '#EDC184',
  goldLight:     '#FDE047',
  goldSoft:      'rgba(237, 193, 132, 0.15)',
  goldBorder:    'rgba(237, 193, 132, 0.25)',

  success:       '#22C55E',
  successBg:     'rgba(34, 197, 94, 0.14)',
  warning:       '#F59E0B',
  warningBg:     'rgba(245, 158, 11, 0.14)',
  danger:        '#EF4444',
  dangerBg:      'rgba(239, 68, 68, 0.14)',
  info:          '#06B6D4',
  infoBg:        'rgba(6, 182, 212, 0.14)',

  border:        'rgba(255, 255, 255, 0.08)',
  borderStrong:  'rgba(6, 182, 212, 0.28)',
  borderSubtle:  'rgba(255, 255, 255, 0.05)',

  glassBg:       'rgba(16, 26, 35, 0.65)',
  glassBorder:   'rgba(255, 255, 255, 0.08)',
} as const;

export const radius = {
  none: '0px', xs: '6px', sm: '10px', md: '14px', lg: '18px',
  xl: '22px', '2xl': '28px', '3xl': '34px', pill: '9999px', circle: '50%',
  button: '18px', input: '14px', card: '24px', modal: '28px', badge: '9999px',
} as const;

export const shadows = {
  light: {
    xs:       '0 1px 4px rgba(46, 52, 69, 0.04)',
    sm:       '0 2px 8px rgba(46, 52, 69, 0.06)',
    card:     '0 4px 16px rgba(46, 52, 69, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1)',
    hover:    '0 12px 36px rgba(46, 52, 69, 0.08)',
    floating: '0 20px 60px rgba(46, 52, 69, 0.10)',
    gold:     '0 6px 24px rgba(200, 138, 69, 0.12)',
  },
  dark: {
    xs:       '0 2px 8px rgba(0, 0, 0, 0.40)',
    sm:       '0 4px 16px rgba(0, 0, 0, 0.50)',
    card:     '0 12px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.10)',
    hover:    '0 20px 48px rgba(0, 0, 0, 0.70), 0 0 28px rgba(6, 182, 212, 0.25)',
    floating: '0 32px 80px rgba(0, 0, 0, 0.85)',
    neonCyan: '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.25)',
    neonPurple: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.25)',
    aurora:   '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(124, 58, 237, 0.3)',
  },
} as const;

export const motion = {
  duration: { instant: '80ms', fast: '150ms', normal: '250ms', slow: '400ms', page: '320ms' },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC CATEGORY COLOR MAPPING
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLOR_MAP: Record<string, { solid: string; text?: string; bg?: string }> = {
  'Food & Dining':      { solid: '#F59E0B', text: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
  'Groceries':          { solid: '#10B981', text: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' },
  'Travel & Transit':   { solid: '#06B6D4', text: '#38BDF8', bg: 'rgba(6, 182, 212, 0.15)' },
  'Shopping & Retail':  { solid: '#EC4899', text: '#F472B6', bg: 'rgba(236, 72, 153, 0.15)' },
  'Bills & Utilities':  { solid: '#8B5CF6', text: '#A78BFA', bg: 'rgba(139, 92, 246, 0.15)' },
  'Entertainment':      { solid: '#F43F5E', text: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)' },
  'Health & Wellness':  { solid: '#14B8A6', text: '#2DD4BF', bg: 'rgba(20, 184, 166, 0.15)' },
  'Investments':        { solid: '#3B82F6', text: '#60A5FA', bg: 'rgba(59, 130, 246, 0.15)' },
  'Education':          { solid: '#6366F1', text: '#818CF8', bg: 'rgba(99, 102, 241, 0.15)' },
  'Fuel':               { solid: '#EAB308', text: '#FACC15', bg: 'rgba(234, 179, 8, 0.15)' },
  'Transfers & P2P':    { solid: '#06B6D4', text: '#38BDF8', bg: 'rgba(6, 182, 212, 0.15)' },
  'Loans & Debt':       { solid: '#EF4444', text: '#F87171', bg: 'rgba(239, 68, 68, 0.15)' },
  'Salary & Income':    { solid: '#22C55E', text: '#4ADE80', bg: 'rgba(34, 197, 94, 0.15)' },
};

export function getCategoryColor(categoryName: string, isDark: boolean = true) {
  const norm = categoryName?.trim() || '';
  if (norm in CATEGORY_COLOR_MAP) {
    return CATEGORY_COLOR_MAP[norm];
  }
  // Case-insensitive lookup
  const matchedKey = Object.keys(CATEGORY_COLOR_MAP).find(k => k.toLowerCase() === norm.toLowerCase());
  if (matchedKey) {
    return CATEGORY_COLOR_MAP[matchedKey];
  }
  // Default fallback
  return {
    solid: isDark ? '#8B5CF6' : '#6D28D9',
    text: isDark ? '#A78BFA' : '#4F46E5',
    bg: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(109, 40, 217, 0.08)',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC SEMANTIC RESOLVER
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeTokens {
  isDark: boolean;
  themeId: ThemeTemplateId;
  bg: {
    app: string;
    card: string;
    cardElevated: string;
    well: string;
    active: string;
  };
  border: {
    subtle: string;
    strong: string;
    primary: string;
    ai: string;
    debit: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  primary: {
    hero: string;
    hover: string;
    subtle: string;
    border: string;
  };
  ai: {
    hero: string;
    hover: string;
    subtle: string;
    border: string;
  };
  debit: {
    hero: string;
    hover: string;
    subtle: string;
    border: string;
  };
  vault: {
    hero: string;
    hover: string;
    subtle: string;
    border: string;
  };
  telemetry: {
    hero: string;
    hover: string;
    subtle: string;
    border: string;
  };
}

export function getThemeTokens(isDark: boolean, themeId?: ThemeTemplateId): ThemeTokens {
  const activeId = themeId || getActiveThemeId();
  const template = THEME_TEMPLATES[activeId] || THEME_TEMPLATES.aurora_cyber;
  const t = isDark ? template.dark : template.light;

  return {
    isDark,
    themeId: activeId,
    bg: {
      app: t.canvas,
      card: t.card,
      cardElevated: t.cardElevated,
      well: t.well,
      active: `${t.primaryHero}25`,
    },
    border: {
      subtle: t.border,
      strong: t.borderStrong,
      primary: t.primaryHero,
      ai: t.aiHero,
      debit: t.spendHero,
    },
    text: {
      primary: t.textPrimary,
      secondary: t.textSecondary,
      muted: t.textMuted,
      inverse: isDark ? '#000000' : '#FFFFFF',
    },
    primary: {
      hero: t.primaryHero,
      hover: `${t.primaryHero}DD`,
      subtle: `${t.primaryHero}18`,
      border: `${t.primaryHero}40`,
    },
    ai: {
      hero: t.aiHero,
      hover: `${t.aiHero}DD`,
      subtle: `${t.aiHero}18`,
      border: `${t.aiHero}40`,
    },
    debit: {
      hero: t.spendHero,
      hover: `${t.spendHero}DD`,
      subtle: `${t.spendHero}18`,
      border: `${t.spendHero}40`,
    },
    vault: {
      hero: t.vaultHero,
      hover: `${t.vaultHero}DD`,
      subtle: `${t.vaultHero}18`,
      border: `${t.vaultHero}40`,
    },
    telemetry: {
      hero: t.telemetryHero,
      hover: `${t.telemetryHero}DD`,
      subtle: `${t.telemetryHero}18`,
      border: `${t.telemetryHero}40`,
    },
  };
}
