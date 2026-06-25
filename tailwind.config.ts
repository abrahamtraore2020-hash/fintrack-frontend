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
          50:  '#F0FEFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#06D6A0',
          600: '#00B48A',
          700: '#008F6E',
          DEFAULT: '#06D6A0',
          dark: '#00B48A',
          light: '#CCFBF1',
        },
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
          bg: '#080E0C',
          card: '#0F1A16',
          border: '#1A2E27',
        }
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(6,214,160,0.30)',
        'blue-glow': '0 0 20px rgba(59,130,246,0.3)',
        'card': '0 2px 12px rgba(0,0,0,0.07)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #080E0C 0%, #0D1F18 50%, #0A2A1E 100%)',
        'gradient-gold': 'linear-gradient(135deg, #06D6A0, #00B48A)',
        'gradient-hero': 'linear-gradient(135deg, #06D6A0 0%, #00B48A 50%, #EAB308 100%)',
      },
    },
  },
  plugins: [],
}

export default config
