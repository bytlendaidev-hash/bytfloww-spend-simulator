/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BYTFLOWW GLOBAL THEME TOKENS & BILLION-DOLLAR STARTUP COLOR SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 * Single point of truth for all colors, typography, surfaces, and semantic tokens.
 */

import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId } from './themes';

// ── 1. SOLID RAW PALETTES ────────────────────────────────────────────────────

export const SOLID_PALETTE = {
  // Sovereign Jade (Inflow, Surplus, Brand Hero, Success)
  jade: {
    50: '#E6FAF2',
    100: '#C2F4DF',
    200: '#8DE7C2',
    300: '#4FD69F',
    400: '#1EC882',
    500: '#00F5A0', // Cyber Emerald
    600: '#00C882',
    700: '#00875A', // Light Hero
    800: '#006342',
    900: '#003D29',
  },

  // Synapse Iris (Financial AI Engine, Forensics, Auto-Categorization)
  synapse: {
    50: '#F3F0FF',
    100: '#E5DEFF',
    200: '#CEBEFF',
    300: '#AD93FD',
    400: '#9171FB',
    500: '#8B5CF6', // Electric Violet
    600: '#7C3AED',
    700: '#6D28D9', // Light AI Hero
    800: '#4520B8',
    900: '#2B1277',
  },

  // Crimson Pulse (Outflow, Expenses, Debits, Overdraft, Subscriptions)
  pulse: {
    50: '#FFF0F3',
    100: '#FFE0E6',
    200: '#FECDD6',
    300: '#FF8AA5',
    400: '#FF5C81',
    500: '#FF4757', // Cyber Vermillion
    600: '#E61C50',
    700: '#D91E4E', // Light Spend Hero
    800: '#A30F36',
    900: '#66001B',
  },

  // Aureolin Ochre (Net Worth, Vault, Investments, Asset Allocation)
  ochre: {
    50: '#FEF9EE',
    100: '#FDF0D2',
    200: '#FCE0A5',
    300: '#FACD6E',
    400: '#F7B73E',
    500: '#FFB800', // Solstice Gold
    600: '#D9890F',
    700: '#C67D0A', // Light Net Worth Hero
    800: '#8A5200',
    900: '#5C3800',
  },

  // Electric Cyan (Telemetry, Real-time Sync, Bank Feeds, Connectivity)
  telemetry: {
    50: '#E6F8FB',
    100: '#C0F0F7',
    200: '#8CE3F0',
    300: '#47D0E6',
    400: '#1EBED9',
    500: '#00E5FF', // Electric Cyan
    600: '#00ADC7',
    700: '#0284C7', // Light Telemetry Hero
    800: '#03628F',
    900: '#04202B',
  },

  // Obsidian Abyss (Dark Mode Canvas, Cards, Insets, Borders)
  abyss: {
    canvas: '#07090E',
    card: '#0D111A',
    elevated: '#141A26',
    well: '#182030',
    border: '#1E2840',
    borderStrong: '#2E3D60',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },

  // Titanium Alabaster (Light Mode Canvas, Cards, Insets, Borders)
  alabaster: {
    canvas: '#F5F7FA',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    well: '#EDF1F7',
    border: '#DCE3EE',
    borderStrong: '#B8C6DC',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
  },
} as const;

// ── 2. DYNAMIC SEMANTIC RESOLVER ─────────────────────────────────────────────

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
  const template = THEME_TEMPLATES[activeId] || THEME_TEMPLATES.apex_obsidian;
  const t = isDark ? template.dark : template.light;

  return {
    isDark,
    themeId: activeId,
    bg: {
      app: t.canvas,
      card: t.card,
      cardElevated: t.cardElevated,
      well: t.well,
      active: `${t.primaryHero}20`,
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
      inverse: isDark ? '#0F172A' : '#F8FAFC',
    },
    primary: {
      hero: t.primaryHero,
      hover: t.primaryHero,
      subtle: `${t.primaryHero}15`,
      border: `${t.primaryHero}40`,
    },
    ai: {
      hero: t.aiHero,
      hover: t.aiHero,
      subtle: `${t.aiHero}15`,
      border: `${t.aiHero}40`,
    },
    debit: {
      hero: t.spendHero,
      hover: t.spendHero,
      subtle: `${t.spendHero}15`,
      border: `${t.spendHero}40`,
    },
    vault: {
      hero: t.vaultHero,
      hover: t.vaultHero,
      subtle: `${t.vaultHero}15`,
      border: `${t.vaultHero}40`,
    },
    telemetry: {
      hero: t.telemetryHero,
      hover: t.telemetryHero,
      subtle: `${t.telemetryHero}15`,
      border: `${t.telemetryHero}40`,
    },
  };
}

// ── 3. CATEGORY SOLID COLOR MAPS ─────────────────────────────────────────────

export interface CategoryColorDef {
  solidDark: string;
  solidLight: string;
  bgDark: string;
  bgLight: string;
}

export const CATEGORY_SOLID_COLORS: Record<string, CategoryColorDef> = {
  Food: {
    solidDark: '#FF8A3D',
    solidLight: '#D45A00',
    bgDark: '#2A1608',
    bgLight: '#FFF3EB',
  },
  'Food & Dining': {
    solidDark: '#FF8A3D',
    solidLight: '#D45A00',
    bgDark: '#2A1608',
    bgLight: '#FFF3EB',
  },
  Shopping: {
    solidDark: '#FF4757',
    solidLight: '#E11D48',
    bgDark: '#2D0B14',
    bgLight: '#FFF1F2',
  },
  Travel: {
    solidDark: '#00E5FF',
    solidLight: '#0284C7',
    bgDark: '#052331',
    bgLight: '#F0F9FF',
  },
  'Travel & Transit': {
    solidDark: '#00E5FF',
    solidLight: '#0284C7',
    bgDark: '#052331',
    bgLight: '#F0F9FF',
  },
  Bills: {
    solidDark: '#38BDF8',
    solidLight: '#0284C7',
    bgDark: '#0C2D48',
    bgLight: '#F0F9FF',
  },
  'Bills & Utilities': {
    solidDark: '#38BDF8',
    solidLight: '#0284C7',
    bgDark: '#0C2D48',
    bgLight: '#F0F9FF',
  },
  Entertainment: {
    solidDark: '#8B5CF6',
    solidLight: '#6D28D9',
    bgDark: '#220D6B',
    bgLight: '#F5F3FF',
  },
  Investment: {
    solidDark: '#FFB800',
    solidLight: '#D97706',
    bgDark: '#2E1B00',
    bgLight: '#FFFBEB',
  },
  'Investments & Wealth': {
    solidDark: '#FFB800',
    solidLight: '#D97706',
    bgDark: '#2E1B00',
    bgLight: '#FFFBEB',
  },
  Salary: {
    solidDark: '#00F5A0',
    solidLight: '#059669',
    bgDark: '#002D22',
    bgLight: '#ECFDF5',
  },
  Income: {
    solidDark: '#00F5A0',
    solidLight: '#059669',
    bgDark: '#002D22',
    bgLight: '#ECFDF5',
  },
  Transfers: {
    solidDark: '#A78BFA',
    solidLight: '#6D28D9',
    bgDark: '#2E1065',
    bgLight: '#F5F3FF',
  },
  Health: {
    solidDark: '#34D399',
    solidLight: '#059669',
    bgDark: '#064E3B',
    bgLight: '#ECFDF5',
  },
  Default: {
    solidDark: '#8B5CF6',
    solidLight: '#6D28D9',
    bgDark: '#182030',
    bgLight: '#EDF1F7',
  },
};

export function getCategoryColor(category: string, isDark: boolean): { solid: string; bg: string } {
  const match = CATEGORY_SOLID_COLORS[category] || CATEGORY_SOLID_COLORS.Default;
  return {
    solid: isDark ? match.solidDark : match.solidLight,
    bg: isDark ? match.bgDark : match.bgLight,
  };
}

// ── 4. CHART SOLID COLOR PALETTES ────────────────────────────────────────────

export const CHART_SOLID_PALETTE_DARK = [
  '#00F5A0', // Cyber Emerald
  '#8B5CF6', // Hyper Iris
  '#FF4757', // Plasma Flame
  '#FFB800', // Solstice Gold
  '#00E5FF', // Arctic Cyan
  '#FF8A3D', // Saffron Tangerine
  '#A78BFA', // Violet
  '#34D399', // Mint
];

export const CHART_SOLID_PALETTE_LIGHT = [
  '#059669', // Sovereign Jade
  '#6D28D9', // Deep Iris
  '#E11D48', // Crimson Pulse
  '#D97706', // Dark Gold
  '#0284C7', // Deep Arctic
  '#D45A00', // Saffron
  '#7C3AED', // Violet
  '#047857', // Mint
];
