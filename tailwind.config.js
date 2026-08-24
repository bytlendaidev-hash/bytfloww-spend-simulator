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
        theme: {
          bg: '#080D11',
          bgDark: '#04070A',
          card: '#10181E',
          cardSubtle: '#142027',
          cardBorder: 'rgba(255, 255, 255, 0.08)',
          cardBorderHover: 'rgba(0, 242, 254, 0.35)',
          cyan: '#00F2FE',
          cyanGlow: 'rgba(0, 242, 254, 0.35)',
          purple: '#9B51E0',
          purpleGlow: 'rgba(155, 81, 224, 0.35)',
          magenta: '#FF007A',
          gold: '#FFD13B',
          goldGlow: 'rgba(255, 209, 59, 0.3)',
          textMuted: '#8A9EA8',
          textSubtle: '#5F7480',
        },
        noctis: {
          bg: '#080D11',
          card: '#10181E',
          cardBorder: 'rgba(255, 255, 255, 0.08)',
          item: '#142027',
          subtle: 'rgba(255, 255, 255, 0.05)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'cyan-purple-grad': 'linear-gradient(135deg, #00D2FF 0%, #00B4D8 45%, #9B51E0 100%)',
        'purple-magenta-grad': 'linear-gradient(135deg, #9B51E0 0%, #E056FD 50%, #FF007A 100%)',
        'cyan-blue-grad': 'linear-gradient(135deg, #00F2FE 0%, #00C6FF 100%)',
        'gold-amber-grad': 'linear-gradient(135deg, #FFD13B 0%, #FF9900 100%)',
        'aurora-glow': 'radial-gradient(circle at 15% 0%, rgba(6, 182, 212, 0.22) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(168, 85, 247, 0.18) 0%, transparent 45%), radial-gradient(circle at 10% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 85% 90%, rgba(0, 191, 165, 0.18) 0%, transparent 45%), #080D11',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 210, 255, 0.45)',
        'glow-purple': '0 0 25px rgba(155, 81, 224, 0.45)',
        'glow-gold': '0 0 25px rgba(255, 209, 59, 0.3)',
        'glass': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'glass-glow': '0 20px 40px -15px rgba(0, 242, 254, 0.15)',
      }
    },
  },
  plugins: [],
}
