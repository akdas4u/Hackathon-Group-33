import type { Config } from 'tailwindcss';

/**
 * PLACEHOLDER BRAND PALETTE
 * ------------------------------------------------------------------
 * These are NOT official Version 1 brand tokens. They are a small,
 * consistent placeholder palette used so the UI has a coherent look
 * for the hackathon demo. Swap `brand.*` for the real Version 1
 * design tokens before shipping.
 * ------------------------------------------------------------------
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b7cdff',
          300: '#8babff',
          400: '#5c82ff',
          500: '#3660f4', // PLACEHOLDER primary — swap for real Version 1 brand token
          600: '#2749d6',
          700: '#1f3aab',
          800: '#1c3288',
          900: '#1b2e6d',
        },
        risk: {
          low: '#16a34a',
          medium: '#d97706',
          high: '#ea580c',
          critical: '#dc2626',
        },
        status: {
          pass: '#16a34a',
          fail: '#dc2626',
          unavailable: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
