/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* BACKGROUNDS */
        'bg': '#06060a',
        'surface': '#0e0e17',
        'surface-elevated': '#13131f',

        /* BORDERS */
        'border-default': 'rgba(255,255,255,0.07)',
        'border-hover': 'rgba(255,255,255,0.12)',

        /* TEAL (PRIMARY) */
        'teal': {
          DEFAULT: '#00d4aa',
          soft: 'rgba(0,212,170,0.10)',
          border: 'rgba(0,212,170,0.22)',
          glow: 'rgba(0,212,170,0.15)',
          dim: 'rgba(0,212,170,0.08)',
        },

        /* AMBER (WARNING) */
        'amber': {
          DEFAULT: '#f59e0b',
          soft: 'rgba(245,158,11,0.10)',
          border: 'rgba(245,158,11,0.22)',
          glow: 'rgba(245,158,11,0.15)',
        },

        /* RED (DANGER) */
        'red': {
          DEFAULT: '#ef4444',
          soft: 'rgba(239,68,68,0.10)',
          border: 'rgba(239,68,68,0.22)',
          glow: 'rgba(239,68,68,0.15)',
        },

        /* TEXT */
        'text-primary': '#ffffff',
        'text-secondary': '#c8c8d4',
        'text-muted': '#8b8b9e',
        'text-subtle': '#3d3d50',
      },

      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },

      fontSize: {
        /* Display */
        'display': ['clamp(52px, 6vw, 78px)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        /* Section heading */
        'section': ['clamp(28px, 3vw, 40px)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        /* Card heading */
        'card-h': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        /* Label */
        'label': ['11px', { lineHeight: '1', letterSpacing: '0.12em', fontWeight: '600', textTransform: 'uppercase' }],
        /* Body (default) */
        'base': ['14px', { lineHeight: '1.75', fontWeight: '400' }],
        /* Small */
        'sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },

      borderRadius: {
        /* Cards use 16px */
        'card': '16px',
        /* Buttons use 12px */
        'btn': '12px',
        /* Default is 8px */
      },

      spacing: {
        /* Card padding */
        'card': '28px',
      },

      boxShadow: {
        /* Subtle shadow for elevated elements */
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.24)',
        /* Glow effects */
        'teal-glow': '0 0 20px rgba(0, 212, 170, 0.2)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.2)',
        'red-glow': '0 0 20px rgba(239, 68, 68, 0.2)',
      },

      animation: {
        spin: 'spin 1s linear infinite',
        'bar-pulse': 'bar-pulse 0.8s ease-in-out infinite',
        'gradient-pulse': 'gradient-pulse 2s ease-in-out infinite',
      },

      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
}
