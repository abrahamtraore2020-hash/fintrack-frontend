import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Couleur primaire : VERT
        gold: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#DCFCE7',
        },
        // Accent : JAUNE
        accent: {
          50:  '#FEFCE8',
          100: '#FEF9C3',
          DEFAULT: '#EAB308',
          dark: '#CA8A04',
        },
        blue: {
          glow: 'rgba(59,130,246,0.15)',
          bright: 'rgba(99,179,255,0.9)',
        },
        dark: {
          bg: '#0A0F0D',
          card: '#111A14',
          border: '#1E3328',
        }
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(16,185,129,0.25)',
        'blue-glow': '0 0 20px rgba(59,130,246,0.3)',
        'card': '0 2px 12px rgba(0,0,0,0.07)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0A1F14 0%, #0D2B1A 50%, #0A3320 100%)',
        'gradient-gold': 'linear-gradient(135deg, #10B981, #059669)',
        'gradient-hero': 'linear-gradient(135deg, #10B981 0%, #065F46 50%, #EAB308 100%)',
      },
    },
  },
  plugins: [],
}

export default config
