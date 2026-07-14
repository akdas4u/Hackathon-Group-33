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
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Legacy numeric scale — still used by Report/ReleaseDetail/LoginForm/
        // StageCard, which are out of scope for the design-system redesign.
        // Do not remove without migrating those files first.
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b7cdff',
          300: '#8babff',
          400: '#5c82ff',
          500: '#3660f4',
          600: '#2749d6',
          700: '#1f3aab',
          800: '#1c3288',
          900: '#1b2e6d',
          // Version 1 brand tokens, driven by src/styles/tokens.css custom
          // properties — used by every new redesigned component.
          teal: 'var(--color-brand-teal)',
          'teal-hover': 'var(--color-brand-teal-hover)',
          'teal-subtle': 'var(--color-brand-teal-subtle)',
          black: 'var(--color-brand-black)',
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
        surface: {
          page: 'var(--surface-page)',
          card: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
          subtle: 'var(--surface-subtle)',
          overlay: 'var(--surface-overlay)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
          'on-brand': 'var(--text-on-brand)',
        },
        border: {
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
          brand: 'var(--border-brand)',
        },
        success: 'var(--color-success)',
        'success-bg': 'var(--color-success-bg)',
        'success-border': 'var(--color-success-border)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        'warning-border': 'var(--color-warning-border)',
        danger: 'var(--color-danger)',
        'danger-bg': 'var(--color-danger-bg)',
        'danger-border': 'var(--color-danger-border)',
        info: 'var(--color-info)',
        'info-bg': 'var(--color-info-bg)',
        'info-border': 'var(--color-info-border)',
        go: 'var(--color-go)',
        'go-bg': 'var(--color-go-bg)',
        conditions: 'var(--color-conditions)',
        'conditions-bg': 'var(--color-conditions-bg)',
        nogo: 'var(--color-nogo)',
        'nogo-bg': 'var(--color-nogo-bg)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
