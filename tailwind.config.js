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
        // SYSTEM 2: TITANIUM PRISM (Ionized Platinum + Cyber Iris + Photon Cyan)
        prism: {
          titanium: '#F0F4F8',
          cyberIris: '#A855F7',
          cyberIrisDark: '#7C3AED',
          photonCyan: '#00E5FF',
          photonCyanDark: '#00B4D8',
          magmaPulse: '#FF3366',
          aerospaceSlate: '#0E141D',
          aerospaceCard: '#131A24',
          aerospaceHover: '#1A2433',
          deepVacuum: '#05080C',
          border: 'rgba(0, 229, 255, 0.30)',
          borderHover: 'rgba(168, 85, 247, 0.50)',
          glowCyan: 'rgba(0, 229, 255, 0.40)',
          glowIris: 'rgba(168, 85, 247, 0.35)',
        },
        // BytLend Palette Aliases
        bytlend: {
          gold: '#00E5FF', // Primary action accent mapped to Photon Cyan
          goldLight: '#F0F4F8', // Titanium Chrome
          goldDark: '#7C3AED', // Deep Cyber Iris
          goldMuted: '#A855F7', // Cyber Iris
          goldChampagne: '#00E5FF',
          goldGlow: 'rgba(0, 229, 255, 0.45)',
          obsidian: '#05080C',
          obsidianCanvas: '#05080C',
          obsidianSurface: '#0E141D',
          obsidianCard: '#131A24',
          obsidianHover: '#1A2433',
          obsidianBorder: 'rgba(0, 229, 255, 0.30)',
          obsidianBorderHover: 'rgba(168, 85, 247, 0.50)',
        },
        // Semantic Theme Aliases
        theme: {
          bg: '#05080C',
          bgDark: '#020406',
          card: '#0E141D',
          cardSubtle: '#131A24',
          cardBorder: 'rgba(0, 229, 255, 0.30)',
          cardBorderHover: 'rgba(168, 85, 247, 0.50)',
          cyan: '#00E5FF',
          cyanGlow: 'rgba(0, 229, 255, 0.40)',
          purple: '#A855F7',
          purpleGlow: 'rgba(168, 85, 247, 0.35)',
          magenta: '#FF3366',
          gold: '#00E5FF',
          goldGlow: 'rgba(0, 229, 255, 0.40)',
          textMuted: '#94A3B8',
          textSubtle: '#64748B',
        },
        noctis: {
          bg: '#080C0E',
          card: '#121417',
          cardBorder: 'rgba(255, 255, 255, 0.08)',
          item: '#142027',
          subtle: 'rgba(255, 255, 255, 0.05)',
        },
        // Spatial Computing Glass System
        spatial: {
          bgLight: '#F8FAFC',
          bgDark: '#080D11',
          glassLight: 'rgba(255, 255, 255, 0.72)',
          glassLightCard: 'rgba(255, 255, 255, 0.85)',
          glassDark: 'rgba(14, 23, 30, 0.72)',
          glassDarkCard: 'rgba(16, 24, 32, 0.85)',
          glassUltraThinDark: 'rgba(255, 255, 255, 0.03)',
          glassUltraThinLight: 'rgba(255, 255, 255, 0.45)',
          borderLight: 'rgba(226, 232, 240, 0.8)',
          borderDark: 'rgba(255, 255, 255, 0.08)',
          borderLightHighlight: 'rgba(255, 255, 255, 0.95)',
          borderDarkHighlight: 'rgba(255, 255, 255, 0.15)',
        }
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
      backgroundImage: {
        'mesh-light': 'radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.07) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.06) 0%, transparent 40%), radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.04) 0%, transparent 40%), #F8FAFC',
        'mesh-dark': 'radial-gradient(circle at 15% 0%, rgba(0, 200, 150, 0.14) 0%, transparent 40%), radial-gradient(circle at 85% 20%, rgba(99, 102, 241, 0.14) 0%, transparent 45%), radial-gradient(circle at 10% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(0, 242, 254, 0.10) 0%, transparent 45%), #080D11',
        'viridian-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #00C896 100%)',
        'selvex-gradient': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)',
        'ambric-gradient': 'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)',
        'hero-emerald': 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
        'hero-emerald-dark': 'linear-gradient(135deg, #04211B 0%, #06352C 50%, #074639 100%)',
      },
      boxShadow: {
        'spatial-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'spatial-md': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'spatial-lg': '0 20px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'spatial-floating': '0 24px 60px -15px rgba(0, 0, 0, 0.25), 0 8px 24px -6px rgba(0, 0, 0, 0.12)',
        'spatial-overlay': '0 32px 80px -20px rgba(0, 0, 0, 0.5), 0 12px 32px -8px rgba(0, 0, 0, 0.2)',
        'spatial-dark-sm': '0 4px 16px -2px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'spatial-dark-md': '0 12px 32px -6px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'spatial-dark-lg': '0 24px 56px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'spatial-dark-floating': '0 30px 70px -15px rgba(0, 0, 0, 0.95), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'card-light': '0 2px 12px -2px rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'card-light-hover': '0 12px 28px -4px rgba(15, 23, 42, 0.09), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'card-dark-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 200, 150, 0.15)',
        'glow-viridian': '0 0 25px rgba(0, 200, 150, 0.35)',
        'glow-selvex': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-ambric': '0 0 25px rgba(245, 158, 11, 0.3)',
      },
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '36px',
        '2xl': '50px',
      }
    },
  },
  plugins: [],
}

