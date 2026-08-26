/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BYTFLOWW BILLION-DOLLAR STARTUP THEME TEMPLATES
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspired by the design languages of Linear, Stripe, Apple Vision Pro,
 * Mercury, Ramp, and Bloomberg Terminal.
 */

export type ThemeTemplateId = 
  | 'apex_obsidian'      // Linear / Ramp — Cyber Emerald & Hyper Iris
  | 'titanium_monolith'  // Apple Vision Pro / Raycast — Azure Ice & Gold
  | 'solstice_champagne' // Mercury / Arc — Luxe Light Alabaster & Royal Emerald
  | 'terminal_matrix'    // Bloomberg / Palantir — Phosphor Amber & Matrix Green
  | 'midnight_nebula';   // Stripe / Vercel — Velvet Cosmic Violet & Cyan

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
  // ── 1. APEX OBSIDIAN (Linear / Ramp) ───────────────────────────────────────
  apex_obsidian: {
    id: 'apex_obsidian',
    name: 'Apex Obsidian',
    tagline: 'Cyber Emerald & Hyper Iris',
    inspiration: 'Linear • Ramp • Raycast Pro',
    badge: 'DEFAULT PRO',
    icon: '⚡',
    swatches: {
      primary: '#00F5A0',
      ai: '#8B5CF6',
      spend: '#FF4757',
      vault: '#FFB800',
      telemetry: '#00E5FF',
      bgDark: '#07090E',
      bgLight: '#F5F7FA',
    },
    dark: {
      canvas: '#07090E',
      card: '#0D111A',
      cardElevated: '#141A26',
      well: '#182030',
      border: '#1E2840',
      borderStrong: '#2E3D60',
      textPrimary: '#F1F5F9',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      primaryHero: '#00F5A0',
      aiHero: '#8B5CF6',
      spendHero: '#FF4757',
      vaultHero: '#FFB800',
      telemetryHero: '#00E5FF',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 245, 160, 0.12), transparent 70%)',
    },
    light: {
      canvas: '#F5F7FA',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#EDF1F7',
      border: '#DCE3EE',
      borderStrong: '#B8C6DC',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#64748B',
      primaryHero: '#009668',
      aiHero: '#6D28D9',
      spendHero: '#DC2626',
      vaultHero: '#D97706',
      telemetryHero: '#0284C7',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 150, 104, 0.08), transparent 70%)',
    },
  },

  // ── 2. TITANIUM MONOLITH (Apple Vision Pro / Spatial UI) ───────────────────
  titanium_monolith: {
    id: 'titanium_monolith',
    name: 'Titanium Monolith',
    tagline: 'Luminescent Azure & Gold Aurum',
    inspiration: 'Apple Vision Pro • Monolith OS',
    badge: 'SPATIAL LUXE',
    icon: '🥽',
    swatches: {
      primary: '#00D2FF',
      ai: '#A855F7',
      spend: '#F43F5E',
      vault: '#F59E0B',
      telemetry: '#38BDF8',
      bgDark: '#0A0D14',
      bgLight: '#F3F5F9',
    },
    dark: {
      canvas: '#0A0D14',
      card: '#101622',
      cardElevated: '#182030',
      well: '#1E283D',
      border: '#24324D',
      borderStrong: '#3B4E75',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      primaryHero: '#00D2FF',
      aiHero: '#A855F7',
      spendHero: '#F43F5E',
      vaultHero: '#F59E0B',
      telemetryHero: '#38BDF8',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 210, 255, 0.14), transparent 70%)',
    },
    light: {
      canvas: '#F3F5F9',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#E8ECF4',
      border: '#D3DAE8',
      borderStrong: '#AFBDD6',
      textPrimary: '#0B132B',
      textSecondary: '#475569',
      textMuted: '#64748B',
      primaryHero: '#0284C7',
      aiHero: '#7E22CE',
      spendHero: '#E11D48',
      vaultHero: '#D97706',
      telemetryHero: '#0369A1',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(2, 132, 199, 0.08), transparent 70%)',
    },
  },

  // ── 3. SOLSTICE CHAMPAGNE (Mercury / Arc Minimalist) ───────────────────────
  solstice_champagne: {
    id: 'solstice_champagne',
    name: 'Solstice Champagne',
    tagline: 'Luxe Ivory & Royal Alpine Emerald',
    inspiration: 'Mercury Bank • Arc Browser',
    badge: 'EXECUTIVE',
    icon: '🍸',
    swatches: {
      primary: '#10B981',
      ai: '#6366F1',
      spend: '#E11D48',
      vault: '#D97706',
      telemetry: '#06B6D4',
      bgDark: '#0B0F19',
      bgLight: '#FAF9F6',
    },
    dark: {
      canvas: '#0B0F19',
      card: '#121827',
      cardElevated: '#1A2236',
      well: '#222C44',
      border: '#2A3756',
      borderStrong: '#3F527E',
      textPrimary: '#FDFEFE',
      textSecondary: '#9CA3AF',
      textMuted: '#6B7280',
      primaryHero: '#10B981',
      aiHero: '#6366F1',
      spendHero: '#E11D48',
      vaultHero: '#D97706',
      telemetryHero: '#06B6D4',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.12), transparent 70%)',
    },
    light: {
      canvas: '#FAF9F6',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#F0EEE6',
      border: '#E2DDD2',
      borderStrong: '#C8C0AF',
      textPrimary: '#111827',
      textSecondary: '#4B5563',
      textMuted: '#6B7280',
      primaryHero: '#047857',
      aiHero: '#4F46E5',
      spendHero: '#BE123C',
      vaultHero: '#B45309',
      telemetryHero: '#0891B2',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(180, 83, 9, 0.06), transparent 70%)',
    },
  },

  // ── 4. HIGH-FREQUENCY TERMINAL (Bloomberg / Palantir) ──────────────────────
  terminal_matrix: {
    id: 'terminal_matrix',
    name: 'High-Frequency Terminal',
    tagline: 'Phosphor Amber & Matrix Green',
    inspiration: 'Bloomberg Professional • Palantir Foundry',
    badge: 'TERMINAL PRO',
    icon: '📟',
    swatches: {
      primary: '#FFB800',
      ai: '#00FF88',
      spend: '#FF3344',
      vault: '#FF9900',
      telemetry: '#00F0FF',
      bgDark: '#06080A',
      bgLight: '#F4F5F7',
    },
    dark: {
      canvas: '#06080A',
      card: '#0B1015',
      cardElevated: '#111822',
      well: '#17212E',
      border: '#202E40',
      borderStrong: '#324763',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      primaryHero: '#FFB800',
      aiHero: '#00FF88',
      spendHero: '#FF3344',
      vaultHero: '#FF9900',
      telemetryHero: '#00F0FF',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 184, 0, 0.12), transparent 70%)',
    },
    light: {
      canvas: '#F4F5F7',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#E9ECEF',
      border: '#D8DEE4',
      borderStrong: '#B8C2CC',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#64748B',
      primaryHero: '#D97706',
      aiHero: '#059669',
      spendHero: '#DC2626',
      vaultHero: '#B45309',
      telemetryHero: '#0284C7',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(217, 119, 6, 0.08), transparent 70%)',
    },
  },

  // ── 5. MIDNIGHT NEBULA (Stripe / Vercel Galactic) ──────────────────────────
  midnight_nebula: {
    id: 'midnight_nebula',
    name: 'Midnight Nebula',
    tagline: 'Velvet Cosmic Violet & Cyan',
    inspiration: 'Stripe Press • Vercel Ship',
    badge: 'COSMIC',
    icon: '🌌',
    swatches: {
      primary: '#A855F7',
      ai: '#38BDF8',
      spend: '#F43F5E',
      vault: '#FBBF24',
      telemetry: '#818CF8',
      bgDark: '#080914',
      bgLight: '#F7F6FB',
    },
    dark: {
      canvas: '#080914',
      card: '#0F1123',
      cardElevated: '#171B35',
      well: '#20254A',
      border: '#2A3160',
      borderStrong: '#414D94',
      textPrimary: '#FAF5FF',
      textSecondary: '#A8A29E',
      textMuted: '#78716C',
      primaryHero: '#A855F7',
      aiHero: '#38BDF8',
      spendHero: '#F43F5E',
      vaultHero: '#FBBF24',
      telemetryHero: '#818CF8',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168, 85, 247, 0.16), transparent 70%)',
    },
    light: {
      canvas: '#F7F6FB',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      well: '#EFEBF8',
      border: '#DFD8F0',
      borderStrong: '#BFB0E0',
      textPrimary: '#1E1B4B',
      textSecondary: '#475569',
      textMuted: '#64748B',
      primaryHero: '#7E22CE',
      aiHero: '#0284C7',
      spendHero: '#E11D48',
      vaultHero: '#D97706',
      telemetryHero: '#4F46E5',
      ambientGlow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(126, 34, 206, 0.08), transparent 70%)',
    },
  },
};

export const DEFAULT_THEME_ID: ThemeTemplateId = 'apex_obsidian';

export function getActiveThemeId(): ThemeTemplateId {
  const saved = localStorage.getItem('bytfloww_theme_template');
  if (saved && saved in THEME_TEMPLATES) {
    return saved as ThemeTemplateId;
  }
  return DEFAULT_THEME_ID;
}

export function setActiveThemeId(id: ThemeTemplateId): void {
  localStorage.setItem('bytfloww_theme_template', id);
  window.dispatchEvent(new CustomEvent('theme-template-change', { detail: id }));
  applyThemeVariables(id);
}

export function applyThemeVariables(themeId: ThemeTemplateId = getActiveThemeId()): void {
  const isDark = document.documentElement.classList.contains('dark') || 
    (!document.documentElement.classList.contains('light') && 
     (localStorage.getItem('bytfloww_theme_mode') !== 'light'));

  const template = THEME_TEMPLATES[themeId] || THEME_TEMPLATES[DEFAULT_THEME_ID];
  const t = isDark ? template.dark : template.light;
  const root = document.documentElement;

  root.style.setProperty('--spatial-bg', t.canvas);
  root.style.setProperty('--obsidian-canvas', t.canvas);
  root.style.setProperty('--obsidian-card', t.card);
  root.style.setProperty('--obsidian-elevated', t.cardElevated);
  root.style.setProperty('--obsidian-well', t.well);
  root.style.setProperty('--obsidian-border', t.border);
  root.style.setProperty('--obsidian-border-strong', t.borderStrong);
  root.style.setProperty('--text-primary', t.textPrimary);
  root.style.setProperty('--text-secondary', t.textSecondary);
  root.style.setProperty('--text-muted', t.textMuted);

  // Hero colors
  root.style.setProperty('--color-jade-500', t.primaryHero);
  root.style.setProperty('--color-synapse-500', t.aiHero);
  root.style.setProperty('--color-pulse-500', t.spendHero);
  root.style.setProperty('--color-ochre-500', t.vaultHero);
  root.style.setProperty('--color-telemetry-500', t.telemetryHero);
}
