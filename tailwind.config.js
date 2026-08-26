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
        // ── 1. SOVEREIGN JADE (Primary Hero, Inflow, Surplus) ──────────
        jade: {
          50: 'var(--color-jade-50, #E6FAF2)',
          100: 'var(--color-jade-100, #C2F4DF)',
          200: 'var(--color-jade-200, #8DE7C2)',
          300: 'var(--color-jade-300, #4FD69F)',
          400: 'var(--color-jade-400, #1EC882)',
          500: 'var(--color-jade-500, #00D084)', // Dark/Light Dynamic Hero
          600: 'var(--color-jade-600, #00AB6B)',
          700: 'var(--color-jade-700, #00875A)', // Light Hero
          800: 'var(--color-jade-800, #006342)',
          900: 'var(--color-jade-900, #003D29)',
          DEFAULT: 'var(--color-jade-500, #00D084)',
        },

        // ── 2. SYNAPSE IRIS (AI Engine, Forensics, Auto-Categories) ───
        synapse: {
          50: 'var(--color-synapse-50, #F3F0FF)',
          100: 'var(--color-synapse-100, #E5DEFF)',
          200: 'var(--color-synapse-200, #CEBEFF)',
          300: 'var(--color-synapse-300, #AD93FD)',
          400: 'var(--color-synapse-400, #9171FB)',
          500: 'var(--color-synapse-500, #7C5CFC)', // Dark/Light Dynamic AI Hero
          600: 'var(--color-synapse-600, #6842F5)',
          700: 'var(--color-synapse-700, #5B34EA)', // Light AI Hero
          800: 'var(--color-synapse-800, #4520B8)',
          900: 'var(--color-synapse-900, #2B1277)',
          DEFAULT: 'var(--color-synapse-500, #7C5CFC)',
        },

        // ── 3. CRIMSON PULSE (Outflow, Expenses, Debits, Subscriptions) ─
        pulse: {
          50: 'var(--color-pulse-50, #FFF0F3)',
          100: 'var(--color-pulse-100, #FFE0E6)',
          200: 'var(--color-pulse-200, #FECDD6)',
          300: 'var(--color-pulse-300, #FF8AA5)',
          400: 'var(--color-pulse-400, #FF5C81)',
          500: 'var(--color-pulse-500, #FF3366)', // Dark/Light Dynamic Spend Hero
          600: 'var(--color-pulse-600, #E61C50)',
          700: 'var(--color-pulse-700, #D91E4E)', // Light Spend Hero
          800: 'var(--color-pulse-800, #A30F36)',
          900: 'var(--color-pulse-900, #66001B)',
          DEFAULT: 'var(--color-pulse-500, #FF3366)',
        },

        // ── 4. AUREOLIN OCHRE (Net Worth, Vault, Investments) ─────────
        ochre: {
          50: 'var(--color-ochre-50, #FEF9EE)',
          100: 'var(--color-ochre-100, #FDF0D2)',
          200: 'var(--color-ochre-200, #FCE0A5)',
          300: 'var(--color-ochre-300, #FACD6E)',
          400: 'var(--color-ochre-400, #F7B73E)',
          500: 'var(--color-ochre-500, #F5A623)', // Dark/Light Dynamic Net Worth Hero
          600: 'var(--color-ochre-600, #D9890F)',
          700: 'var(--color-ochre-700, #C67D0A)', // Light Net Worth Hero
          800: 'var(--color-ochre-800, #8A5200)',
          900: 'var(--color-ochre-900, #5C3800)',
          DEFAULT: 'var(--color-ochre-500, #F5A623)',
        },

        // ── 5. ELECTRIC CYAN (Telemetry, Real-time Sync, Bank Feeds) ──
        telemetry: {
          50: 'var(--color-telemetry-50, #E6F8FB)',
          100: 'var(--color-telemetry-100, #C0F0F7)',
          200: 'var(--color-telemetry-200, #8CE3F0)',
          300: 'var(--color-telemetry-300, #47D0E6)',
          400: 'var(--color-telemetry-400, #1EBED9)',
          500: 'var(--color-telemetry-500, #00D8F6)', // Dark/Light Dynamic Telemetry Hero
          600: 'var(--color-telemetry-600, #00ADC7)',
          700: 'var(--color-telemetry-700, #0284C7)', // Light Telemetry Hero
          800: 'var(--color-telemetry-800, #03628F)',
          900: 'var(--color-telemetry-900, #04202B)',
          DEFAULT: 'var(--color-telemetry-500, #00D8F6)',
        },

        // ── 6. OBSIDIAN ABYSS (Dark Mode Surfaces & Structure) ────────
        abyss: {
          canvas: 'var(--obsidian-canvas, #0B0E14)',
          card: 'var(--obsidian-card, #131822)',
          elevated: 'var(--obsidian-elevated, #1A2230)',
          well: 'var(--obsidian-well, #1F293D)',
          border: 'var(--obsidian-border, #232D42)',
          borderStrong: 'var(--obsidian-border-strong, #33415C)',
          textPrimary: 'var(--text-primary, #F8FAFC)',
          textSecondary: 'var(--text-secondary, #94A3B8)',
          textMuted: 'var(--text-muted, #64748B)',
          DEFAULT: 'var(--obsidian-canvas, #0B0E14)',
        },

        // ── 7. TITANIUM ALABASTER (Light Mode Surfaces & Structure) ───
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
          DEFAULT: '#F4F6F9',
        },

        // Backward compatibility mappings
        quantum: {
          50: '#E6FAF2',
          100: '#C2F4DF',
          200: '#8DE7C2',
          300: '#4FD69F',
          400: '#1EC882',
          500: '#00D084',
          600: '#00AB6B',
          700: '#00875A',
          800: '#006342',
          900: '#003D29',
          DEFAULT: '#00D084',
        },
        amethyst: {
          50: '#F3F0FF',
          100: '#E5DEFF',
          200: '#CEBEFF',
          300: '#AD93FD',
          400: '#9171FB',
          500: '#7C5CFC',
          600: '#6842F5',
          700: '#5B34EA',
          800: '#4520B8',
          900: '#2B1277',
          DEFAULT: '#7C5CFC',
        },
        coral: {
          50: '#FFF0F3',
          100: '#FFE0E6',
          200: '#FECDD6',
          300: '#FF8AA5',
          400: '#FF5C81',
          500: '#FF3366',
          600: '#E61C50',
          700: '#D91E4E',
          800: '#A30F36',
          900: '#66001B',
          DEFAULT: '#FF3366',
        },
        amber: {
          50: '#FEF9EE',
          100: '#FDF0D2',
          200: '#FCE0A5',
          300: '#FACD6E',
          400: '#F7B73E',
          500: '#F5A623',
          600: '#D9890F',
          700: '#C67D0A',
          800: '#8A5200',
          900: '#5C3800',
          DEFAULT: '#F5A623',
        },
        obsidian: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#1E293B',
          800: '#131822',
          850: '#1A2230',
          900: '#0B0E14',
          950: '#05070B',
          DEFAULT: '#0B0E14',
        },
        bytlend: {
          gold: '#00D084',
          goldLight: '#F8FAFC',
          goldDark: '#00875A',
          goldMuted: '#7C5CFC',
          goldChampagne: '#00D8F6',
          obsidian: '#0B0E14',
          obsidianCanvas: '#0B0E14',
          obsidianSurface: '#131822',
          obsidianCard: '#131822',
          obsidianHover: '#1A2230',
        },
        theme: {
          bg: '#0B0E14',
          bgDark: '#05070B',
          card: '#131822',
          cardSubtle: '#1A2230',
          cyan: '#00D8F6',
          purple: '#7C5CFC',
          magenta: '#FF3366',
          gold: '#F5A623',
          textMuted: '#94A3B8',
          textSubtle: '#64748B',
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
