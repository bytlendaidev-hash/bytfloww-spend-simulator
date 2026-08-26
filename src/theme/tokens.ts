/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BYTFLOWW GLOBAL SOLID THEME TOKENS (ZERO GRADIENT ARCHITECTURE)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single point of truth for all colors, typography, surfaces, and semantic tokens.
 * Modifying any value here instantly affects the entire application.
 */

// ── 1. SOLID RAW PALETTES ────────────────────────────────────────────────────

export const SOLID_PALETTE = {
  // Sovereign Jade (Inflow, Surplus, Brand Hero, Success)
  jade: {
    50: '#E6FAF2',
    100: '#C2F4DF',
    200: '#8DE7C2',
    300: '#4FD69F',
    400: '#1EC882',
    500: '#00D084', // Dark Hero
    600: '#00AB6B',
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
    500: '#7C5CFC', // Dark AI Hero
    600: '#6842F5',
    700: '#5B34EA', // Light AI Hero
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
    500: '#FF3366', // Dark Spend Hero
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
    500: '#F5A623', // Dark Net Worth Hero
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
    500: '#00D8F6', // Dark Telemetry Hero
    600: '#00ADC7',
    700: '#0284C7', // Light Telemetry Hero
    800: '#03628F',
    900: '#04202B',
  },

  // Obsidian Abyss (Dark Mode Canvas, Cards, Insets, Borders)
  abyss: {
    canvas: '#0B0E14',
    card: '#131822',
    elevated: '#1A2230',
    well: '#1F293D',
    border: '#232D42',
    borderStrong: '#33415C',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },

  // Titanium Alabaster (Light Mode Canvas, Cards, Insets, Borders)
  alabaster: {
    canvas: '#F4F6F9',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    well: '#EAEEF4',
    border: '#D8DFEA',
    borderStrong: '#B0BECE',
    textPrimary: '#0D141F',
    textSecondary: '#4B586E',
    textMuted: '#7A889E',
  },
} as const;

// ── 2. DYNAMIC SEMANTIC RESOLVER ─────────────────────────────────────────────

export interface ThemeTokens {
  isDark: boolean;
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

export function getThemeTokens(isDark: boolean): ThemeTokens {
  if (isDark) {
    return {
      isDark: true,
      bg: {
        app: SOLID_PALETTE.abyss.canvas,
        card: SOLID_PALETTE.abyss.card,
        cardElevated: SOLID_PALETTE.abyss.elevated,
        well: SOLID_PALETTE.abyss.well,
        active: SOLID_PALETTE.jade[900],
      },
      border: {
        subtle: SOLID_PALETTE.abyss.border,
        strong: SOLID_PALETTE.abyss.borderStrong,
        primary: SOLID_PALETTE.jade[600],
        ai: SOLID_PALETTE.synapse[600],
        debit: SOLID_PALETTE.pulse[600],
      },
      text: {
        primary: SOLID_PALETTE.abyss.textPrimary,
        secondary: SOLID_PALETTE.abyss.textSecondary,
        muted: SOLID_PALETTE.abyss.textMuted,
        inverse: SOLID_PALETTE.alabaster.textPrimary,
      },
      primary: {
        hero: SOLID_PALETTE.jade[500],
        hover: SOLID_PALETTE.jade[400],
        subtle: SOLID_PALETTE.jade[900],
        border: 'rgba(0, 208, 132, 0.35)',
      },
      ai: {
        hero: SOLID_PALETTE.synapse[500],
        hover: SOLID_PALETTE.synapse[400],
        subtle: SOLID_PALETTE.synapse[900],
        border: 'rgba(124, 92, 252, 0.35)',
      },
      debit: {
        hero: SOLID_PALETTE.pulse[500],
        hover: SOLID_PALETTE.pulse[400],
        subtle: SOLID_PALETTE.pulse[900],
        border: 'rgba(255, 51, 102, 0.35)',
      },
      vault: {
        hero: SOLID_PALETTE.ochre[500],
        hover: SOLID_PALETTE.ochre[400],
        subtle: SOLID_PALETTE.ochre[900],
        border: 'rgba(245, 166, 35, 0.35)',
      },
      telemetry: {
        hero: SOLID_PALETTE.telemetry[500],
        hover: SOLID_PALETTE.telemetry[400],
        subtle: SOLID_PALETTE.telemetry[900],
        border: 'rgba(0, 216, 246, 0.35)',
      },
    };
  }

  // Light Mode Tokens
  return {
    isDark: false,
    bg: {
      app: SOLID_PALETTE.alabaster.canvas,
      card: SOLID_PALETTE.alabaster.card,
      cardElevated: SOLID_PALETTE.alabaster.elevated,
      well: SOLID_PALETTE.alabaster.well,
      active: SOLID_PALETTE.jade[50],
    },
    border: {
      subtle: SOLID_PALETTE.alabaster.border,
      strong: SOLID_PALETTE.alabaster.borderStrong,
      primary: SOLID_PALETTE.jade[700],
      ai: SOLID_PALETTE.synapse[700],
      debit: SOLID_PALETTE.pulse[700],
    },
    text: {
      primary: SOLID_PALETTE.alabaster.textPrimary,
      secondary: SOLID_PALETTE.alabaster.textSecondary,
      muted: SOLID_PALETTE.alabaster.textMuted,
      inverse: SOLID_PALETTE.abyss.textPrimary,
    },
    primary: {
      hero: SOLID_PALETTE.jade[700],
      hover: SOLID_PALETTE.jade[800],
      subtle: SOLID_PALETTE.jade[50],
      border: 'rgba(0, 135, 90, 0.30)',
    },
    ai: {
      hero: SOLID_PALETTE.synapse[700],
      hover: SOLID_PALETTE.synapse[800],
      subtle: SOLID_PALETTE.synapse[50],
      border: 'rgba(91, 52, 234, 0.30)',
    },
    debit: {
      hero: SOLID_PALETTE.pulse[700],
      hover: SOLID_PALETTE.pulse[800],
      subtle: SOLID_PALETTE.pulse[50],
      border: 'rgba(217, 30, 78, 0.30)',
    },
    vault: {
      hero: SOLID_PALETTE.ochre[700],
      hover: SOLID_PALETTE.ochre[800],
      subtle: SOLID_PALETTE.ochre[50],
      border: 'rgba(198, 125, 10, 0.30)',
    },
    telemetry: {
      hero: SOLID_PALETTE.telemetry[700],
      hover: SOLID_PALETTE.telemetry[800],
      subtle: SOLID_PALETTE.telemetry[50],
      border: 'rgba(2, 132, 199, 0.30)',
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
    solidDark: SOLID_PALETTE.pulse[500],
    solidLight: SOLID_PALETTE.pulse[700],
    bgDark: SOLID_PALETTE.pulse[900],
    bgLight: SOLID_PALETTE.pulse[50],
  },
  Travel: {
    solidDark: SOLID_PALETTE.telemetry[500],
    solidLight: SOLID_PALETTE.telemetry[700],
    bgDark: SOLID_PALETTE.telemetry[900],
    bgLight: SOLID_PALETTE.telemetry[50],
  },
  'Travel & Transit': {
    solidDark: SOLID_PALETTE.telemetry[500],
    solidLight: SOLID_PALETTE.telemetry[700],
    bgDark: SOLID_PALETTE.telemetry[900],
    bgLight: SOLID_PALETTE.telemetry[50],
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
    solidDark: SOLID_PALETTE.synapse[500],
    solidLight: SOLID_PALETTE.synapse[700],
    bgDark: SOLID_PALETTE.synapse[900],
    bgLight: SOLID_PALETTE.synapse[50],
  },
  Investment: {
    solidDark: SOLID_PALETTE.ochre[500],
    solidLight: SOLID_PALETTE.ochre[700],
    bgDark: SOLID_PALETTE.ochre[900],
    bgLight: SOLID_PALETTE.ochre[50],
  },
  'Investments & Wealth': {
    solidDark: SOLID_PALETTE.ochre[500],
    solidLight: SOLID_PALETTE.ochre[700],
    bgDark: SOLID_PALETTE.ochre[900],
    bgLight: SOLID_PALETTE.ochre[50],
  },
  Salary: {
    solidDark: SOLID_PALETTE.jade[500],
    solidLight: SOLID_PALETTE.jade[700],
    bgDark: SOLID_PALETTE.jade[900],
    bgLight: SOLID_PALETTE.jade[50],
  },
  Income: {
    solidDark: SOLID_PALETTE.jade[500],
    solidLight: SOLID_PALETTE.jade[700],
    bgDark: SOLID_PALETTE.jade[900],
    bgLight: SOLID_PALETTE.jade[50],
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
    solidDark: SOLID_PALETTE.synapse[400],
    solidLight: SOLID_PALETTE.synapse[700],
    bgDark: SOLID_PALETTE.abyss.well,
    bgLight: SOLID_PALETTE.alabaster.well,
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
  '#00D084', // Sovereign Jade
  '#7C5CFC', // Synapse Iris
  '#FF3366', // Crimson Pulse
  '#F5A623', // Aureolin Ochre
  '#00D8F6', // Electric Cyan
  '#FF8A3D', // Saffron Tangerine
  '#A78BFA', // Violet
  '#34D399', // Mint
];

export const CHART_SOLID_PALETTE_LIGHT = [
  '#00875A', // Sovereign Jade (Light)
  '#5B34EA', // Synapse Iris (Light)
  '#D91E4E', // Crimson Pulse (Light)
  '#C67D0A', // Aureolin Ochre (Light)
  '#0284C7', // Electric Cyan (Light)
  '#D45A00', // Saffron Tangerine (Light)
  '#6D28D9', // Violet (Light)
  '#059669', // Mint (Light)
];
