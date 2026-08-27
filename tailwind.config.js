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
        // ── 1. APEX TEAL (Income, Salary, Surplus) — Electric Bioluminescent Teal ──
        jade: {
          50:  'var(--color-jade-50,  #E0FFF7)',
          100: 'var(--color-jade-100, #B3FFE9)',
          200: 'var(--color-jade-200, #6DFFD5)',
          300: 'var(--color-jade-300, #00F5C0)',
          400: 'var(--color-jade-400, #00E0A8)',
          500: 'var(--color-jade-500, #00C896)',  // Dark Hero — Electric Apex Teal
          600: 'var(--color-jade-600, #00A07A)',
          700: 'var(--color-jade-700, #007A5E)',  // Light Hero — Deep Forest Teal
          800: 'var(--color-jade-800, #004D3B)',
          900: 'var(--color-jade-900, #002D22)',
          DEFAULT: 'var(--color-jade-500, #00C896)',
        },

        // ── 2. APEX VIOLET (AI Engine, Forensics, Intelligence) — Hyper Violet ──
        synapse: {
          50:  'var(--color-synapse-50,  #F4F0FF)',
          100: 'var(--color-synapse-100, #E8DDFF)',
          200: 'var(--color-synapse-200, #D4BBFF)',
          300: 'var(--color-synapse-300, #B990FF)',
          400: 'var(--color-synapse-400, #A070FF)',
          500: 'var(--color-synapse-500, #8B5CF6)',  // Dark Hero — Hyper Violet
          600: 'var(--color-synapse-600, #7340E8)',
          700: 'var(--color-synapse-700, #5B2EE0)',  // Light Hero — Deep Ultraviolet
          800: 'var(--color-synapse-800, #3D1AAA)',
          900: 'var(--color-synapse-900, #220D6B)',
          DEFAULT: 'var(--color-synapse-500, #8B5CF6)',
        },

        // ── 3. APEX FLAME (Outflow, Expenses, Debits) — Plasma Vermillion ──
        //    RADICAL BREAK: Orange-vermillion, NOT red. Bloomberg energy.
        pulse: {
          50:  'var(--color-pulse-50,  #FFF4EE)',
          100: 'var(--color-pulse-100, #FFE5D4)',
          200: 'var(--color-pulse-200, #FFC8A4)',
          300: 'var(--color-pulse-300, #FFA070)',
          400: 'var(--color-pulse-400, #FF7A48)',
          500: 'var(--color-pulse-500, #FF5722)',  // Dark Hero — Plasma Vermillion
          600: 'var(--color-pulse-600, #E03E0A)',
          700: 'var(--color-pulse-700, #B83000)',  // Light Hero — Burnt Sienna
          800: 'var(--color-pulse-800, #851E00)',
          900: 'var(--color-pulse-900, #4A0D00)',
          DEFAULT: 'var(--color-pulse-500, #FF5722)',
        },

        // ── 4. APEX GOLD (Vault, Loans, Net Worth) — Pure Electric Gold ──
        ochre: {
          50:  'var(--color-ochre-50,  #FFFCE0)',
          100: 'var(--color-ochre-100, #FFF6B0)',
          200: 'var(--color-ochre-200, #FFEC70)',
          300: 'var(--color-ochre-300, #FFE040)',
          400: 'var(--color-ochre-400, #FFD020)',
          500: 'var(--color-ochre-500, #FFBB00)',  // Dark Hero — Electric Gold
          600: 'var(--color-ochre-600, #D9960A)',
          700: 'var(--color-ochre-700, #8A5C00)',  // Light Hero — Dark Gold
          800: 'var(--color-ochre-800, #5C3800)',
          900: 'var(--color-ochre-900, #2E1B00)',
          DEFAULT: 'var(--color-ochre-500, #FFBB00)',
        },

        // ── 5. APEX ICE (Telemetry, EPFO, Real-time Sync) — Arctic Ice ──
        telemetry: {
          50:  'var(--color-telemetry-50,  #E0FAFF)',
          100: 'var(--color-telemetry-100, #B3F2FF)',
          200: 'var(--color-telemetry-200, #70E6FF)',
          300: 'var(--color-telemetry-300, #28D8FF)',
          400: 'var(--color-telemetry-400, #00CAFF)',
          500: 'var(--color-telemetry-500, #00B4E0)',  // Dark Hero — Arctic Ice
          600: 'var(--color-telemetry-600, #0090B8)',
          700: 'var(--color-telemetry-700, #006A88)',  // Light Hero — Deep Arctic
          800: 'var(--color-telemetry-800, #004460)',
          900: 'var(--color-telemetry-900, #001E2E)',
          DEFAULT: 'var(--color-telemetry-500, #00B4E0)',
        },

        // ── 6. ROYAL INDIGO MIDNIGHT SURFACES ────────────────────────
        abyss: {
          canvas:       'var(--obsidian-canvas,       #050814)',
          card:         'var(--obsidian-card,         #0A0F26)',
          elevated:     'var(--obsidian-elevated,     #101738)',
          well:         'var(--obsidian-well,         #141C42)',
          border:       'var(--obsidian-border,       #1E2B5C)',
          borderStrong: 'var(--obsidian-border-strong,#2E3F80)',
          textPrimary:  'var(--text-primary,          #F8FAFC)',
          textSecondary:'var(--text-secondary,        #94A3B8)',
          textMuted:    'var(--text-muted,            #64748B)',
          DEFAULT:      'var(--obsidian-canvas,       #050814)',
        },

        // ── 7. APEX ICE LIGHT SURFACES ─────────────────────────────────
        alabaster: {
          canvas:      '#F0F4FA',
          card:        '#FFFFFF',
          elevated:    '#FFFFFF',
          well:        '#E6ECFA',
          border:      '#CCD6EC',
          borderStrong:'#A8B8D8',
          textPrimary: '#080C18',
          textSecondary:'#3A4A6A',
          textMuted:   '#6070A0',
          DEFAULT:     '#F0F4FA',
        },

        // Backward compatibility
        quantum:  { 500: '#00C896', 700: '#007A5E', DEFAULT: '#00C896' },
        amethyst: { 500: '#8B5CF6', 700: '#5B2EE0', DEFAULT: '#8B5CF6' },
        coral:    { 500: '#FF5722', 700: '#B83000', DEFAULT: '#FF5722' },
        amber:    { 500: '#FFBB00', 700: '#8A5C00', DEFAULT: '#FFBB00' },
        obsidian: {
          50: '#EEF2FF', 100: '#E6ECFA', 200: '#CCD6EC', 300: '#A8B8D8',
          400: '#8892B0', 500: '#50607A', 600: '#3A4A6A',
          700: '#1E2840', 800: '#0D1018', 850: '#131926',
          900: '#07080E', 950: '#04050A', DEFAULT: '#07080E',
        },
        bytlend: {
          gold: '#00C896', goldLight: '#EEF2FF', goldDark: '#007A5E',
          goldMuted: '#8B5CF6', goldChampagne: '#00B4E0',
          obsidian: '#07080E', obsidianCanvas: '#07080E',
          obsidianSurface: '#0D1018', obsidianCard: '#0D1018',
          obsidianHover: '#131926',
        },
        theme: {
          bg: '#07080E', bgDark: '#04050A', card: '#0D1018',
          cardSubtle: '#131926', cyan: '#00B4E0', purple: '#8B5CF6',
          magenta: '#FF5722', gold: '#FFBB00',
          textMuted: '#8892B0', textSubtle: '#50607A',
        },
      },
      borderRadius: {
        'spatial-sm': '12px',
        'spatial-md': '18px',
        'spatial-lg': '26px',
        'spatial-xl': '34px',
        'spatial-2xl': '44px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        'solid-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'solid-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'solid-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'solid-card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'solid-card-light': '0 2px 12px -2px rgba(15, 23, 42, 0.06)',
        'spatial-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.06)',
        'spatial-md': '0 8px 24px -4px rgba(0, 0, 0, 0.08)',
        'spatial-lg': '0 20px 40px -12px rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
}
