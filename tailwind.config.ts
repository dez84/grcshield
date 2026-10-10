import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise palette tuned for high-density reading in both themes.
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec6ff',
          400: '#59a5ff',
          500: '#3282fb',
          600: '#1d63ef',
          700: '#174ddb',
          800: '#1940b1',
          900: '#1a3a8b',
          950: '#142454',
        },
        shield: {
          ink: '#0b1220',
          slate: '#101a2e',
          panel: '#16223c',
        },
      },
      minHeight: {
        tap: '48px',
      },
      minWidth: {
        tap: '48px',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
