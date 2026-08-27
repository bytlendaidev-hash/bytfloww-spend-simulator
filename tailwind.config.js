/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── 1. AURORA CYBER-GLASS PALETTE (BytLend Flagship) ──────────────────
        aurora: {
          bg:        '#061118', // Deep Midnight Obsidian-Teal Canvas
          teal:      '#0D1E27', // Rich Dark Teal Slate
          surface:   '#10222D', // Frosted Surface
          card:      'rgba(16, 26, 35, 0.72)',
          cardSolid: '#101F2B',
          border:    'rgba(255, 255, 255, 0.08)',
          cyan:      '#06B6D4', // Vibrant Electric Cyan
          cyanLight: '#38BDF8', // Sky Cyan
          purple:    '#8B5CF6', // Electric Violet
          magenta:   '#D946EF', // Neon Magenta
        },

        // ── 2. BYTLEND LUXURY FINTECH GOLD PALETTE ───────────────────────────
        gold: {
          DEFAULT:   '#EDC184', // Warm Champagne Gold
          light:     '#F7D7A4', // Light Champagne Highlight
          champagne: '#EDC184',
          copper:    '#C88A45', // Luxury Copper
          bronze:    '#9C6234', // Metallic Bronze
          deep:      '#8A5A2D', // Deep Bronze Shadow
          faint:     'rgba(237, 193, 132, 0.04)',
          glow:      'rgba(237, 193, 132, 0.25)',
          border:    'rgba(237, 193, 132, 0.25)',
        },

        // ── 3. BYTLEND OBSIDIAN & GRAPHITE ───────────────────────────────────
        obsidian: {
          DEFAULT: '#090909',
          hover:   '#151312',
          card:    '#171717',
          light:   '#C7B9A9',
        },
        graphite: {
          DEFAULT: '#1D1A18',
          2:       '#25221F',
          3:       '#2E2A27',
          4:       '#3B2D22',
          5:       '#8B7A68',
          6:       '#C7B9A9',
        },

        // ── 4. PRIMARY HERO ACCENTS (Dynamic CSS Variable Powered) ───────────
        jade: {
          50:  '#E0FCFF',
          100: '#B8F5FF',
          200: '#7CE8FF',
          300: '#38BDF8',
          400: '#00D2FF',
          500: 'var(--color-jade-500, #06B6D4)', // Cyan / Emerald Hero
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          DEFAULT: 'var(--color-jade-500, #06B6D4)',
        },
        synapse: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: 'var(--color-synapse-500, #8B5CF6)', // Violet / Purple AI Hero
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          DEFAULT: 'var(--color-synapse-500, #8B5CF6)',
        },
        pulse: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: 'var(--color-pulse-500, #EF4444)', // Rose / Red Debits
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          DEFAULT: 'var(--color-pulse-500, #EF4444)',
        },
        ochre: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: 'var(--color-ochre-500, #EDC184)', // Champagne Gold
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          DEFAULT: 'var(--color-ochre-500, #EDC184)',
        },
        telemetry: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: 'var(--color-telemetry-500, #38BDF8)', // Sky Cyan Telemetry
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          DEFAULT: 'var(--color-telemetry-500, #38BDF8)',
        },

        // ── 5. ABYSS & ALABASTER SURFACES (Dynamic) ──────────────────────────
        abyss: {
          canvas:       'var(--obsidian-canvas,       #061118)',
          card:         'var(--obsidian-card,         rgba(16, 26, 35, 0.72))',
          elevated:     'var(--obsidian-elevated,     #10222D)',
          well:         'var(--obsidian-well,         #0D1E27)',
          border:       'var(--obsidian-border,       rgba(255, 255, 255, 0.08))',
          borderStrong: 'var(--obsidian-border-strong,rgba(6, 182, 212, 0.28))',
          textPrimary:  'var(--text-primary,          #FFFFFF)',
          textSecondary:'var(--text-secondary,        #94A3B8)',
          textMuted:    'var(--text-muted,            #64748B)',
          DEFAULT:      'var(--obsidian-canvas,       #061118)',
        },
        alabaster: {
          canvas:       '#FFFFFF',
          card:         '#FFFFFF',
          elevated:     '#FFFFFF',
          well:         '#F8FAFC',
          border:       'rgba(46, 52, 69, 0.08)',
          borderStrong: 'rgba(200, 138, 69, 0.35)',
          textPrimary:  '#2E3445',
          textSecondary:'#5E667A',
          textMuted:    '#8B95A5',
          DEFAULT:      '#FFFFFF',
        },
      },
      boxShadow: {
        'solid-xs': '0 1px 4px rgba(0, 0, 0, 0.3)',
        'solid-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'solid-md': '0 12px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.10)',
        'solid-lg': '0 20px 48px rgba(0, 0, 0, 0.70), 0 0 28px rgba(6, 182, 212, 0.25)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.25)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.25)',
        'neon-aura': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(124, 58, 237, 0.3)',
        'gold-glow': '0 6px 24px rgba(237, 193, 132, 0.25)',
      },
      borderRadius: {
        'spatial-sm': '14px',
        'spatial-md': '18px',
        'spatial-lg': '24px',
        'spatial-xl': '28px',
        'spatial-2xl': '34px',
      },
      fontFamily: {
        sans: ["'Outfit'", 'Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ["'Outfit'", 'Inter', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
