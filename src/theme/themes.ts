/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BYTFLOWW / BYTLEND MASTER THEME TEMPLATES
 * ─────────────────────────────────────────────────────────────────────────────
 * Matches the exact design language of HomeScreen.tsx & SpendIntelligenceScreen.tsx
 * from cloud-sign-in-hub-main (Absinthe Noir Emerald, Champagne Gold, VisionOS 3D cards).
 */

export type ThemeTemplateId = 
  | 'bytlend_vision'     // 👑 Flagship: BytLend VisionOS (Absinthe Noir Emerald & Champagne Gold)
  | 'bytlend_gold'       // BytLend Centurion: Pure Champagne Warm Gold & Obsidian
  | 'royal_indigo'       // Stripe / Revolut Ultra: Velvet Midnight & Royal Indigo
  | 'titanium_monolith'  // Apple Vision Pro / Raycast: Azure Ice & Titanium
  | 'terminal_matrix';   // Bloomberg / Palantir: Phosphor Amber & Matrix Green

export interface ThemeTemplate {
  id: ThemeTemplateId;
  name: string;
  tagline: string;
  inspiration: string;
  badge: string;
  icon: string;
  swatches: {
    primary: string;
    ai: string;
    spend: string;
    vault: string;
    telemetry: string;
    bgDark: string;
    bgLight: string;
  };
  dark: {
    canvas: string;
    card: string;
    cardElevated: string;
    well: string;
    border: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    primaryHero: string;
    aiHero: string;
    spendHero: string;
    vaultHero: string;
    telemetryHero: string;
    ambientGlow: string;
  };
  light: {
    canvas: string;
    card: string;
    cardElevated: string;
    well: string;
    border: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    primaryHero: string;
    aiHero: string;
    spendHero: string;
    vaultHero: string;
    telemetryHero: string;
    ambientGlow: string;
  };
}

export const THEME_TEMPLATES: Record<ThemeTemplateId, ThemeTemplate> = {
  // ── 1. BYTLEND VISION (👑 Flagship - HomeScreen.tsx & VisionOS 3D) ─────────
  bytlend_vision: {
    id: 'bytlend_vision',
    name: 'BytLend VisionOS',
    tagline: 'Absinthe Noir Emerald & Champagne Gold',
    inspiration: 'BytLend HomeScreen • VisionOS 3D Design',
    badge: 'FLAGSHIP',
    icon: '💎',
    swatches: {
      primary: '#1AE893', // Jewel Emerald
      ai: '#E0A83F',      // Copper Gold
      spend: '#EF4444',   // Crimson Red
      vault: '#EDC184',   // Champagne Gold
      telemetry: '#38BDF8',
      bgDark: '#050506',
      bgLight: '#FFFFFF',
    },
    dark: {
      canvas: '#061118',
      card: 'rgba(16, 26, 35, 0.72)',
      cardElevated: '#10222D',
      well: '#0D1E27',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(26, 232, 147, 0.30)',
      textPrimary: '#F1F1EF',
      textSecondary: '#9698A2',
      textMuted: '#6D7280',
      primaryHero: '#1AE893',
      aiHero: '#E0A83F',
      spendHero: '#EF4444',
      vaultHero: '#EDC184',
      telemetryHero: '#38BDF8',
      ambientGlow: 'radial-gradient(circle at 50% 25%, rgba(26, 232, 147, 0.15) 0%, rgba(224, 168, 63, 0.12) 45%, transparent 75%)',
    },
    light: {
      canvas: '#FFFFFF',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#F8FAFC',
      border: 'rgba(226, 232, 240, 0.8)',
      borderStrong: 'rgba(0, 136, 78, 0.30)',
      textPrimary: '#131418',
      textSecondary: '#5E667A',
      textMuted: '#8B95A5',
      primaryHero: '#00884E',
      aiHero: '#B4791F',
      spendHero: '#EF4444',
      vaultHero: '#C88A45',
      telemetryHero: '#00884E',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 136, 78, 0.08) 0%, rgba(180, 121, 31, 0.06) 50%, transparent 75%)',
    },
  },

  // ── 2. BYTLEND CENTURION GOLD (Luxury FinTech Warm Gold & Obsidian) ─────────
  bytlend_gold: {
    id: 'bytlend_gold',
    name: 'BytLend Centurion Gold',
    tagline: 'Champagne Warm Gold & Rich Obsidian',
    inspiration: 'BytLend Luxury FinTech • American Express Centurion',
    badge: 'LUXURY GOLD',
    icon: '✨',
    swatches: {
      primary: '#EDC184',
      ai: '#C88A45',
      spend: '#EF4444',
      vault: '#F7D7A4',
      telemetry: '#38BDF8',
      bgDark: '#090909',
      bgLight: '#FFFFFF',
    },
    dark: {
      canvas: '#090909',
      card: '#171717',
      cardElevated: '#202124',
      well: '#151312',
      border: 'rgba(237, 193, 132, 0.15)',
      borderStrong: 'rgba(237, 193, 132, 0.35)',
      textPrimary: '#F5F3F0',
      textSecondary: '#C7B9A9',
      textMuted: '#8B7A68',
      primaryHero: '#EDC184',
      aiHero: '#C88A45',
      spendHero: '#EF4444',
      vaultHero: '#F7D7A4',
      telemetryHero: '#06B6D4',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(237, 193, 132, 0.14), transparent 70%)',
    },
    light: {
      canvas: '#FFFFFF',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#F8FAFC',
      border: 'rgba(46, 52, 69, 0.08)',
      borderStrong: 'rgba(200, 138, 69, 0.40)',
      textPrimary: '#2E3445',
      textSecondary: '#5E667A',
      textMuted: '#8B95A5',
      primaryHero: '#C88A45',
      aiHero: '#8A5A2D',
      spendHero: '#EF4444',
      vaultHero: '#EDC184',
      telemetryHero: '#00884E',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(200, 138, 69, 0.12), transparent 70%)',
    },
  },

  // ── 3. ROYAL INDIGO SOVEREIGN (Stripe Atlas / Revolut Ultra) ───────────────
  royal_indigo: {
    id: 'royal_indigo',
    name: 'Royal Indigo Sovereign',
    tagline: 'Deep Velvet Midnight & Royal Indigo Blue',
    inspiration: 'Stripe Atlas • Revolut Ultra • Linear Dark',
    badge: 'ROYAL PRO',
    icon: '👑',
    swatches: {
      primary: '#6366F1',
      ai: '#818CF8',
      spend: '#FF4757',
      vault: '#FFB800',
      telemetry: '#00E5FF',
      bgDark: '#050814',
      bgLight: '#F4F6FF',
    },
    dark: {
      canvas: '#050814',
      card: '#0A0F26',
      cardElevated: '#101738',
      well: '#141C42',
      border: '#1E2B5C',
      borderStrong: '#2E3F80',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      primaryHero: '#6366F1',
      aiHero: '#818CF8',
      spendHero: '#FF4757',
      vaultHero: '#FFB800',
      telemetryHero: '#00E5FF',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.22), transparent 70%)',
    },
    light: {
      canvas: '#F4F6FF',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#EAEFFE',
      border: '#D4DCFA',
      borderStrong: '#A8BAF4',
      textPrimary: '#0A0F26',
      textSecondary: '#475569',
      textMuted: '#64748B',
      primaryHero: '#4338CA',
      aiHero: '#4F46E5',
      spendHero: '#E11D48',
      vaultHero: '#D97706',
      telemetryHero: '#0284C7',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79, 70, 229, 0.08), transparent 70%)',
    },
  },

  // ── 4. TITANIUM MONOLITH (Apple Vision Pro / Raycast Spatial) ──────────────
  titanium_monolith: {
    id: 'titanium_monolith',
    name: 'Titanium Monolith',
    tagline: 'Luminescent Azure & Gold Aurum',
    inspiration: 'Apple Vision Pro • Monolith OS',
    badge: 'SPATIAL OS',
    icon: '🔮',
    swatches: {
      primary: '#00C8FF',
      ai: '#7C4DFF',
      spend: '#FF5252',
      vault: '#FFD700',
      telemetry: '#64FFDA',
      bgDark: '#080C14',
      bgLight: '#F0F4F8',
    },
    dark: {
      canvas: '#080C14',
      card: '#0E1624',
      cardElevated: '#142032',
      well: '#1A2840',
      border: '#243654',
      borderStrong: '#36507A',
      textPrimary: '#F0F6FC',
      textSecondary: '#8B949E',
      textMuted: '#586069',
      primaryHero: '#00C8FF',
      aiHero: '#7C4DFF',
      spendHero: '#FF5252',
      vaultHero: '#FFD700',
      telemetryHero: '#64FFDA',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 200, 255, 0.15), transparent 70%)',
    },
    light: {
      canvas: '#F0F4F8',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#E2E8F0',
      border: '#CBD5E1',
      borderStrong: '#94A3B8',
      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',
      primaryHero: '#0284C7',
      aiHero: '#6D28D9',
      spendHero: '#DC2626',
      vaultHero: '#D97706',
      telemetryHero: '#0D9488',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(2, 132, 199, 0.08), transparent 70%)',
    },
  },

  // ── 5. TERMINAL MATRIX (Bloomberg Terminal / Palantir) ─────────────────────
  terminal_matrix: {
    id: 'terminal_matrix',
    name: 'Terminal Matrix',
    tagline: 'Phosphor Amber & Matrix Green',
    inspiration: 'Bloomberg Terminal • Palantir Foundry',
    badge: 'TERMINAL PRO',
    icon: '📟',
    swatches: {
      primary: '#00FF66',
      ai: '#FFB800',
      spend: '#FF3333',
      vault: '#00E5FF',
      telemetry: '#FFFF00',
      bgDark: '#040804',
      bgLight: '#F5FAF5',
    },
    dark: {
      canvas: '#040804',
      card: '#081208',
      cardElevated: '#0D1E0D',
      well: '#122812',
      border: '#1B3D1B',
      borderStrong: '#295C29',
      textPrimary: '#00FF66',
      textSecondary: '#52C452',
      textMuted: '#2E732E',
      primaryHero: '#00FF66',
      aiHero: '#FFB800',
      spendHero: '#FF3333',
      vaultHero: '#00E5FF',
      telemetryHero: '#FFFF00',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 255, 102, 0.15), transparent 70%)',
    },
    light: {
      canvas: '#F5FAF5',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#E8F5E8',
      border: '#C8E6C8',
      borderStrong: '#81C784',
      textPrimary: '#1B5E20',
      textSecondary: '#2E7D32',
      textMuted: '#4CAF50',
      primaryHero: '#2E7D32',
      aiHero: '#F57F17',
      spendHero: '#C62828',
      vaultHero: '#00838F',
      telemetryHero: '#F9A825',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(46, 125, 50, 0.08), transparent 70%)',
    },
  },
};

export const DEFAULT_THEME_ID: ThemeTemplateId = 'bytlend_vision';

export function getActiveThemeId(): ThemeTemplateId {
  try {
    const saved = localStorage.getItem('bytfloww_theme_template');
    if (saved && saved in THEME_TEMPLATES) {
      return saved as ThemeTemplateId;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_THEME_ID;
}

export function setActiveThemeId(themeId: ThemeTemplateId): void {
  try {
    localStorage.setItem('bytfloww_theme_template', themeId);
    window.dispatchEvent(new CustomEvent('theme-template-change', { detail: themeId }));
  } catch (e) {
    // ignore
  }
}

export function applyThemeVariables(isDark: boolean, themeId?: ThemeTemplateId) {
  const selectedId = themeId || getActiveThemeId();
  const template = THEME_TEMPLATES[selectedId] || THEME_TEMPLATES.bytlend_vision;
  const t = isDark ? template.dark : template.light;
  const root = document.documentElement;

  // Obsidian / Abyss Surface Tokens
  root.style.setProperty('--obsidian-canvas', t.canvas);
  root.style.setProperty('--obsidian-card', t.card);
  root.style.setProperty('--obsidian-elevated', t.cardElevated);
  root.style.setProperty('--obsidian-well', t.well);
  root.style.setProperty('--obsidian-border', t.border);
  root.style.setProperty('--obsidian-border-strong', t.borderStrong);

  // Typography Tokens
  root.style.setProperty('--text-primary', t.textPrimary);
  root.style.setProperty('--text-secondary', t.textSecondary);
  root.style.setProperty('--text-muted', t.textMuted);

  // Hero Semantic Accents
  root.style.setProperty('--color-jade-500', t.primaryHero);
  root.style.setProperty('--color-synapse-500', t.aiHero);
  root.style.setProperty('--color-pulse-500', t.spendHero);
  root.style.setProperty('--color-ochre-500', t.vaultHero);
  root.style.setProperty('--color-telemetry-500', t.telemetryHero);

  // Ambient Glow
  root.style.setProperty('--ambient-glow-gradient', t.ambientGlow);
}
