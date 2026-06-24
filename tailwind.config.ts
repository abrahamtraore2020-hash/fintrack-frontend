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
        gold: {
          50:  '#FFFDF0',
          100: '#FFF9D6',
          200: '#FFF0A0',
          300: '#FFE566',
          400: '#FFD700',
          500: '#E6C200',
          600: '#B89900',
          700: '#8A7200',
          DEFAULT: '#FFD700',
          dark: '#E6C200',
          light: '#FFF9D6',
        },
        blue: {
          glow: 'rgba(59,130,246,0.15)',
          bright: 'rgba(99,179,255,0.9)',
        },
        dark: {
          bg: '#0F1117',
          card: '#1A1D27',
          border: '#2A2D3A',
        }
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(255,215,0,0.2)',
        'blue-glow': '0 0 20px rgba(59,130,246,0.3)',
        'card': '0 2px 12px rgba(0,0,0,0.07)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700, #FF8C00)',
      },
    },
  },
  plugins: [],
}

export default config
